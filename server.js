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
const secret = process.env.SESSION_SECRET;
const hash = process.env.ADMIN_PASSWORD_HASH;
const connectionString = process.env.DATABASE_URL;
const production = process.env.NODE_ENV === 'production';

if (!secret || secret.length < 32 || !hash || !connectionString) {
  console.error('Configure SESSION_SECRET (32+ caracteres), ADMIN_PASSWORD_HASH e DATABASE_URL.');
  process.exit(1);
}

const { Pool } = pg;
const pool = new Pool({
  connectionString,
  max: 5,
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000,
  // O pooler do Supabase utiliza TLS. Não desative a validação de certificado.
  ssl: {
  ca: fs.readFileSync('/etc/secrets/supabase-ca.crt', 'utf8'),
  rejectUnauthorized: true
}
});

app.disable('x-powered-by');
if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      mediaSrc: ["'self'", 'blob:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"]
    }
  }
}));
app.use(express.json({ limit: '16kb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 150, standardHeaders: 'draft-7', legacyHeaders: false }));

const PgStore = connectPgSimple(session);
app.use(session({
  name: 'vip.sid',
  secret,
  resave: false,
  saveUninitialized: false,
  store: new PgStore({ pool, tableName: 'user_sessions', createTableIfMissing: true }),
  cookie: { httpOnly: true, sameSite: 'strict', secure: production, maxAge: 7200000 }
}));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: 'draft-7', legacyHeaders: false });
const valid = body => {
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const guestCount = String(body?.guestCount ?? '');
  return name.length > 0 && name.length <= 80 && ['1', '2', '3', '4', '5 ou mais'].includes(guestCount)
    ? { name, guestCount } : null;
};
const auth = (req, res, next) => req.session.admin ? next() : res.status(401).json({ error: 'Acesso restrito' });
const csrf = (req, res, next) => req.get('X-CSRF-Token') && req.get('X-CSRF-Token') === req.session.csrf
  ? next() : res.status(403).json({ error: 'Token inválido' });
const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS guests (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      "guestCount" TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pendente',
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS guests_created_at_idx ON guests ("createdAt" DESC)`);
}

app.get('/api/health', asyncRoute(async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ ok: true });
}));

app.get('/api/admin/session', (req, res) => {
  if (!req.session.csrf) req.session.csrf = crypto.randomBytes(32).toString('hex');
  res.json({ authenticated: !!req.session.admin, csrf: req.session.csrf });
});

app.post('/api/admin/login', limiter, csrf, asyncRoute(async (req, res, next) => {
  if (typeof req.body?.password !== 'string' || !(await bcrypt.compare(req.body.password, hash))) {
    return res.status(401).json({ error: 'Senha incorreta' });
  }
  req.session.regenerate(err => {
    if (err) return next(err);
    req.session.admin = true;
    req.session.csrf = crypto.randomBytes(32).toString('hex');
    req.session.save(err => err ? next(err) : res.json({ ok: true, csrf: req.session.csrf }));
  });
}));

app.post('/api/admin/logout', auth, csrf, (req, res, next) =>
  req.session.destroy(err => err ? next(err) : (res.clearCookie('vip.sid'), res.json({ ok: true }))));

app.post('/api/rsvp', limiter, asyncRoute(async (req, res) => {
  const v = valid(req.body);
  if (!v) return res.status(400).json({ error: 'Dados inválidos' });
  const result = await pool.query(
    `INSERT INTO guests (name, "guestCount", status) VALUES ($1, $2, 'Pendente') RETURNING id`,
    [v.name, v.guestCount]
  );
  res.status(201).json({ ok: true, id: Number(result.rows[0].id) });
}));

app.get('/api/admin/guests', auth, asyncRoute(async (_req, res) => {
  const result = await pool.query(`SELECT id, name, "guestCount", status, "createdAt" FROM guests ORDER BY id DESC`);
  res.json({ guests: result.rows });
}));

app.post('/api/admin/guests', auth, csrf, asyncRoute(async (req, res) => {
  const v = valid(req.body);
  if (!v) return res.status(400).json({ error: 'Dados inválidos' });
  await pool.query(
    `INSERT INTO guests (name, "guestCount", status) VALUES ($1, $2, 'Pendente')`,
    [v.name, v.guestCount]
  );
  res.status(201).json({ ok: true });
}));

app.patch('/api/admin/guests/:id', auth, csrf, asyncRoute(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1 || !['Pendente', 'Confirmado'].includes(req.body?.status))
    return res.status(400).json({ error: 'Dados inválidos' });
  const result = await pool.query('UPDATE guests SET status = $1 WHERE id = $2 RETURNING id', [req.body.status, id]);
  res.status(result.rowCount ? 200 : 404).json(result.rowCount ? { ok: true } : { error: 'Não encontrado' });
}));

app.delete('/api/admin/guests/:id', auth, csrf, asyncRoute(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'ID inválido' });
  const result = await pool.query('DELETE FROM guests WHERE id = $1 RETURNING id', [id]);
  res.status(result.rowCount ? 200 : 404).json(result.rowCount ? { ok: true } : { error: 'Não encontrado' });
}));

app.use(express.static('public'));
app.get('/admin', (_req, res) => res.sendFile(path.resolve('public/admin.html')));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno' });
});

initializeDatabase()
  .then(() => app.listen(port, () => console.log(`Churrasco VIP: http://localhost:${port}`)))
  .catch(err => {
    console.error('Falha na conexão ou criação das tabelas PostgreSQL:', err);
    process.exit(1);
  });
