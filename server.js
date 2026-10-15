import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';

const app = express();
const port = Number(process.env.PORT || 3000);
const { SESSION_SECRET: secret, ADMIN_PASSWORD_HASH: hash, DATABASE_URL: connectionString } = process.env;
const production = process.env.NODE_ENV === 'production';
const PAGE_SIZE = 100;

if (!secret || secret.length < 32 || !hash || !connectionString) {
  console.error('Configure SESSION_SECRET (32+ caracteres), ADMIN_PASSWORD_HASH e DATABASE_URL.');
  process.exit(1);
}

/* ---------- Banco (TLS sempre validado em produção) ---------- */
const caPath = process.env.DB_CA_PATH || '/etc/secrets/supabase-ca.crt';
const hasCa = fs.existsSync(caPath);
if (!hasCa) console.warn(`CA não encontrada em ${caPath}; usando as autoridades do sistema. Defina DB_CA_PATH se a conexão falhar.`);
const ssl = process.env.DB_SSL === 'disable' && !production
  ? false
  : { rejectUnauthorized: true, ...(hasCa && { ca: fs.readFileSync(caPath, 'utf8') }) };

const pool = new pg.Pool({ connectionString, ssl, max: 5, connectionTimeoutMillis: 15000, idleTimeoutMillis: 30000 });
// Sem este listener, um erro em conexão ociosa derruba o processo.
pool.on('error', (err) => console.error('Erro no pool PostgreSQL:', err.message));

/* ---------- Middlewares ---------- */
app.disable('x-powered-by');
// Atrás do proxy do Render, sem isso todos os visitantes compartilham o mesmo IP no rate limit.
if (production || process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);

app.get('/api/health', async (_req, res, next) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true }); } catch (err) { next(err); }
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", 'https://fonts.googleapis.com'], // sem 'unsafe-inline'
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      mediaSrc: ["'self'", 'blob:'],
      connectSrc: ["'self'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"]
    }
  }
}));
app.use(express.json({ limit: '16kb' }));
app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

const WINDOW = 15 * 60 * 1000;
const limiterBase = { windowMs: WINDOW, standardHeaders: 'draft-7', legacyHeaders: false };
app.use(rateLimit({ ...limiterBase, limit: 300 }));
const rsvpLimiter = rateLimit({ ...limiterBase, limit: 20, message: { error: 'Muitas tentativas. Aguarde alguns minutos.' } });
const loginLimiter = rateLimit({ ...limiterBase, limit: 8, skipSuccessfulRequests: true, message: { error: 'Muitas tentativas de login. Aguarde.' } });

const PgStore = connectPgSimple(session);
app.use(session({
  name: 'vip.sid',
  secret,
  resave: false,
  saveUninitialized: false,
  store: new PgStore({ pool, tableName: 'user_sessions', createTableIfMissing: false }),
  cookie: { httpOnly: true, sameSite: 'strict', secure: production, maxAge: 7200000 }
}));

/* ---------- Helpers ---------- */
const COUNTS = { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '5 ou mais': 5 };
const valid = (body) => {
  const name = typeof body?.name === 'string' ? body.name.trim().replace(/\s+/g, ' ') : '';
  const guestCount = COUNTS[String(body?.guestCount ?? '')];
  return name && name.length <= 80 && guestCount ? { name, guestCount } : null;
};
const auth = (req, res, next) => (req.session.admin ? next() : res.status(401).json({ error: 'Acesso restrito' }));
const csrf = (req, res, next) => {
  const token = req.get('X-CSRF-Token');
  return token && token === req.session.csrf ? next() : res.status(403).json({ error: 'Token inválido' });
};
const asyncRoute = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Registro idempotente: o mesmo nome atualiza a quantidade em vez de duplicar.
const UPSERT = `
  INSERT INTO guests (name, guest_count) VALUES ($1, $2)
  ON CONFLICT (name_key) DO UPDATE SET guest_count = EXCLUDED.guest_count
  RETURNING (xmax = 0) AS created`;

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS guests (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
      name_key TEXT GENERATED ALWAYS AS (lower(btrim(name))) STORED,
      guest_count SMALLINT NOT NULL CHECK (guest_count BETWEEN 1 AND 5),
      status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Confirmado')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
  const { rowCount } = await pool.query(
    `SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'guest_count'`);
  if (!rowCount) throw new Error('Esquema antigo detectado. Execute db/001_migrate.sql no Supabase antes de iniciar.');

  // Bancos migrados pela primeira versão do 001 mantinham a coluna antiga como NOT NULL.
  await pool.query(`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public' AND table_name = 'guests'
                   AND column_name = 'guest_count_legacy' AND is_nullable = 'NO') THEN
        ALTER TABLE guests ALTER COLUMN guest_count_legacy DROP NOT NULL;
      END IF;
    END $$`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS guests_name_key_idx ON guests (name_key)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS guests_created_at_idx ON guests (created_at DESC)`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      sid VARCHAR NOT NULL PRIMARY KEY,
      sess JSON NOT NULL,
      expire TIMESTAMP(6) NOT NULL
    )`);
  await pool.query(`CREATE INDEX IF NOT EXISTS user_sessions_expire_idx ON user_sessions (expire)`);
  // O servidor usa o papel postgres (ignora RLS); a Data API pública do Supabase fica sem acesso.
  await pool.query(`ALTER TABLE guests ENABLE ROW LEVEL SECURITY`);
  await pool.query(`ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY`);
}

/* ---------- Rotas públicas ---------- */
app.post('/api/rsvp', rsvpLimiter, asyncRoute(async (req, res) => {
  const v = valid(req.body);
  if (!v) return res.status(400).json({ error: 'Dados inválidos' });
  const { rows } = await pool.query(UPSERT, [v.name, v.guestCount]);
  res.status(rows[0].created ? 201 : 200).json({ ok: true, updated: !rows[0].created });
}));

/* ---------- Admin ---------- */
app.get('/api/admin/session', (req, res) => {
  if (!req.session.csrf) req.session.csrf = crypto.randomBytes(32).toString('hex');
  res.json({ authenticated: !!req.session.admin, csrf: req.session.csrf });
});

app.post('/api/admin/login', loginLimiter, csrf, asyncRoute(async (req, res, next) => {
  if (typeof req.body?.password !== 'string' || !(await bcrypt.compare(req.body.password, hash))) {
    return res.status(401).json({ error: 'Senha incorreta' });
  }
  req.session.regenerate((err) => {
    if (err) return next(err);
    req.session.admin = true;
    req.session.csrf = crypto.randomBytes(32).toString('hex');
    req.session.save((err2) => (err2 ? next(err2) : res.json({ ok: true, csrf: req.session.csrf })));
  });
}));

app.post('/api/admin/logout', auth, csrf, (req, res, next) =>
  req.session.destroy((err) => (err ? next(err) : (res.clearCookie('vip.sid'), res.json({ ok: true })))));

app.get('/api/admin/guests', auth, asyncRoute(async (req, res) => {
  const all = req.query.all === '1'; // usado pela exportação CSV
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = all ? 10000 : PAGE_SIZE;
  const [list, stats] = await Promise.all([
    pool.query(
      `SELECT id, name, guest_count AS "guestCount", status, created_at AS "createdAt"
         FROM guests ORDER BY id DESC LIMIT $1 OFFSET $2`,
      [limit, all ? 0 : (page - 1) * PAGE_SIZE]),
    pool.query(
      `SELECT COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE status = 'Confirmado')::int AS confirmed,
              COALESCE(SUM(guest_count) FILTER (WHERE status = 'Confirmado'), 0)::int AS people
         FROM guests`)
  ]);
  res.json({ guests: list.rows, page, pageSize: PAGE_SIZE, ...stats.rows[0] });
}));

app.post('/api/admin/guests', auth, csrf, asyncRoute(async (req, res) => {
  const v = valid(req.body);
  if (!v) return res.status(400).json({ error: 'Dados inválidos' });
  await pool.query(UPSERT, [v.name, v.guestCount]);
  res.status(201).json({ ok: true });
}));

const parseId = (value) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

app.patch('/api/admin/guests/:id', auth, csrf, asyncRoute(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id || !['Pendente', 'Confirmado'].includes(req.body?.status)) return res.status(400).json({ error: 'Dados inválidos' });
  const result = await pool.query('UPDATE guests SET status = $1 WHERE id = $2', [req.body.status, id]);
  res.status(result.rowCount ? 200 : 404).json(result.rowCount ? { ok: true } : { error: 'Não encontrado' });
}));

app.delete('/api/admin/guests/:id', auth, csrf, asyncRoute(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'ID inválido' });
  const result = await pool.query('DELETE FROM guests WHERE id = $1', [id]);
  res.status(result.rowCount ? 200 : 404).json(result.rowCount ? { ok: true } : { error: 'Não encontrado' });
}));

/* ---------- Estáticos e erros ---------- */
app.use('/api', (_req, res) => res.status(404).json({ error: 'Não encontrado' }));
// Vídeo e áudio: cache de 7 dias. Para forçar atualização, troque o nome do arquivo.
app.use('/media', express.static('public/media', { maxAge: production ? '7d' : 0 }));
app.use(express.static('public', { maxAge: production ? '1h' : 0 }));
app.get('/admin', (_req, res) => res.sendFile(path.resolve('public/admin.html')));

app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Requisição muito grande' });
  console.error(err);
  res.status(500).json({ error: 'Erro interno' });
});

/* ---------- Inicialização e desligamento limpo ---------- */
initializeDatabase()
  .then(() => {
    const server = app.listen(port, () => console.log(`Churrasco VIP: http://localhost:${port}`));
    const shutdown = () => server.close(() => pool.end().finally(() => process.exit(0)));
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  })
  .catch((err) => {
    console.error('Falha ao iniciar:', err.message);
    process.exit(1);
  });
