import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { CalendarDays, Clock, MapPin, Flame, ArrowUpRight, MessageCircle } from "lucide-react";
import brasaHero from "@/assets/brasa-hero.jpg";
import { supabase } from "@/integrations/supabase/client";
import { Reveal, SkewerDivider } from "@/components/motion";

const MAPS_URL = "https://maps.app.goo.gl/sg9z37GmZv5PtmJ48";
const WHATSAPP_NUMBER = "5561993316047";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Churrasco VIP — A resenha começa na brasa" },
      {
        name: "description",
        content:
          "Churrasco VIP — comida boa, resenha melhor ainda. 24 de outubro, a partir das 11h, no Total Ville Quadra 203, Brasília. Confirme sua presença.",
      },
      { property: "og:title", content: "Churrasco VIP · 24/10 · Confirme sua presença" },
      {
        property: "og:description",
        content:
          "A partir das 11h, no Total Ville Quadra 203. Chega com fome e confirma aqui.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Countdown />
        <SkewerDivider />
        <Details />
        <SkewerDivider reverse />
        <Location />
        <Rsvp />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="#inicio" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground shadow-ember">
            CV
          </span>
          <span className="font-display text-sm font-semibold tracking-[0.2em]">
            CHURRASCO <span className="text-primary">VIP</span>
          </span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#detalhes" className="transition-colors hover:text-foreground">
            O evento
          </a>
          <a href="#local" className="transition-colors hover:text-foreground">
            Como chegar
          </a>
        </nav>
        <a
          href="#confirmar"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
        >
          Confirmar presença <ArrowUpRight className="size-4" />
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden pt-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]"
      />
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-24">
        <div className="animate-rise">
          <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.3em] text-primary">
            <span className="h-px w-10 bg-primary" />
            BRASA ACESA. COPO CHEIO. RESENHA GARANTIDA.
          </p>
          <h1 className="mt-6 font-display text-6xl font-bold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
            O CHURRASCO
            <br />
            <em className="text-glow-ember not-italic text-primary">É OUTRO</em>
            <br />
            ROLÊ.
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Junta a galera, chega com fome e deixa o resto com a brasa. Um encontro pra
            comer bem, rir alto e curtir sem pressa.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <a
              href="#confirmar"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-semibold text-primary-foreground shadow-ember transition-transform hover:scale-105"
            >
              Tô dentro <ArrowUpRight className="size-4" />
            </a>
            <a
              href="#detalhes"
              className="text-sm font-semibold text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Ver detalhes ↓
            </a>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <Clock className="size-5 shrink-0 text-primary" />
              <div>
                <p className="text-[0.65rem] font-semibold tracking-[0.25em] text-muted-foreground">
                  QUANDO
                </p>
                <p className="font-display text-sm font-semibold tracking-wide">
                  24 OUT · A PARTIR DAS 11H
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <MapPin className="size-5 shrink-0 text-primary" />
              <div>
                <p className="text-[0.65rem] font-semibold tracking-[0.25em] text-muted-foreground">
                  ONDE
                </p>
                <p className="font-display text-sm font-semibold tracking-wide">
                  TOTAL VILLE · QUADRA 203
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative animate-rise [animation-delay:150ms]">
          <div className="grain-overlay relative overflow-hidden rounded-3xl border border-border shadow-ember">
            <img
              src={brasaHero}
              alt="Picanha na brasa sobre carvão em brasa"
              width={1280}
              height={1600}
              className="aspect-[4/5] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 font-display text-sm font-semibold tracking-[0.2em]">
              CALOR NO PONTO. <span className="text-primary">RESENHA SEM PRESSA.</span>
            </p>
          </div>
          <div className="animate-flicker absolute -right-4 -top-4 flex size-24 rotate-12 items-center justify-center rounded-full border-2 border-primary bg-charcoal text-center font-display text-xs font-bold leading-tight tracking-widest text-primary shadow-ember">
            FEITO
            <br />
            NA BRASA
          </div>
        </div>
      </div>
      <div className="border-y border-border/60 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 font-display text-xs font-semibold tracking-[0.3em] text-muted-foreground">
          <span>BRASÍLIA, DF</span>
          <span className="hidden sm:inline">24.10.2026</span>
          <span className="flex items-center gap-2">
            EDIÇÃO ESPECIAL <Flame className="size-3.5 text-primary" />
          </span>
        </div>
      </div>
    </section>
  );
}

const DETAILS = [
  {
    number: "01 / DATA",
    icon: CalendarDays,
    title: "24 de outubro",
    text: "Separa o dia e avisa a galera. O encontro é pra curtir com calma.",
  },
  {
    number: "02 / HORÁRIO",
    icon: Clock,
    title: "A partir das 11h",
    text: "Chega no horário, com fome e disposição pra uma boa resenha.",
  },
  {
    number: "03 / LOCAL",
    icon: MapPin,
    title: "Total Ville · Qd. 203",
    text: "Use o link do mapa pra abrir a localização certinha no celular.",
    link: true,
  },
];

function Details() {
  return (
    <section id="detalhes" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
      <p className="text-xs font-semibold tracking-[0.3em] text-primary">ANOTA AÍ</p>
      <h2 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl">
        O combinado
        <br />
        não sai caro.
      </h2>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {DETAILS.map((d, i) => (
          <Reveal key={d.number} delay={i * 150}>
          <article
            className="group h-full rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-ember"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-xs font-semibold tracking-[0.25em] text-muted-foreground">
                {d.number}
              </span>
              <d.icon className="size-6 text-primary" />
            </div>
            <h3 className="mt-8 font-display text-2xl font-bold">{d.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d.text}</p>
            {d.link && (
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                Abrir no Google Maps <ArrowUpRight className="size-4" />
              </a>
            )}
          </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Location() {
  return (
    <section id="local" className="mx-auto max-w-6xl px-5 pb-20 md:pb-28">
      <Reveal>
      <div className="grid overflow-hidden rounded-3xl border border-border bg-card md:grid-cols-2">
        <div className="p-8 md:p-12">
          <p className="text-xs font-semibold tracking-[0.3em] text-primary">PÕE NO GPS</p>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl">
            O destino é<br />
            <em className="not-italic text-primary">a resenha.</em>
          </h2>
          <p className="mt-6 flex items-center gap-2 font-display text-lg font-semibold">
            <MapPin className="size-5 text-primary" /> Total Ville · Quadra 203
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Abra a localização no Google Maps para conferir o trajeto antes de sair.
          </p>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-transform hover:scale-105"
          >
            Traçar rota <ArrowUpRight className="size-4" />
          </a>
        </div>
        <a
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir localização no Google Maps"
          className="group relative flex min-h-72 items-center justify-center overflow-hidden border-t border-border bg-charcoal md:border-l md:border-t-0"
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
          <div
            aria-hidden
            className="absolute size-40 rounded-full bg-primary/20 blur-3xl transition-all group-hover:bg-primary/35"
          />
          <div className="relative flex flex-col items-center gap-3">
            <span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-ember transition-transform group-hover:scale-110">
              <MapPin className="size-7" />
            </span>
            <p className="font-display text-sm font-bold tracking-[0.25em]">
              TOTAL VILLE · <span className="text-primary">QUADRA 203</span>
            </p>
            <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">
              ABRIR MAPA ↗
            </p>
          </div>
        </a>
      </div>
      </Reveal>
    </section>
  );
}

const SUGGESTIONS = [
  "Arroz branco",
  "Feijão-tropeiro",
  "Farofa de bacon ou calabresa",
  "Mandioca cozida ou frita",
  "Vinagrete tradicional",
  "Maionese de batata",
  "Salada (alface, tomate, cebola, etc)",
  "Pão de alho",
  "Queijo coalho",
  "Molho",
];

type Confirmed = { name: string; count: string; items: string[]; custom: string };

function Rsvp() {
  const [name, setName] = useState("");
  const [count, setCount] = useState("1");
  const [items, setItems] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);

  const toggle = (item: string) =>
    setItems((prev) => (prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim().slice(0, 80);
    if (!trimmed) return;
    const customTrimmed = custom.trim().slice(0, 200);
    setSending(true);
    setError(null);
    const { error: dbError } = await supabase.from("rsvps").insert({
      name: trimmed,
      guest_count: count,
      items,
      custom_item: customTrimmed || null,
    });
    setSending(false);
    if (dbError) {
      setError("Não deu pra salvar agora. Tenta de novo em instantes.");
      return;
    }
    setConfirmed({ name: trimmed, count, items, custom: customTrimmed });
  };

  const levar = confirmed ? [...confirmed.items, confirmed.custom].filter(Boolean) : [];
  const whatsappUrl = confirmed
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        `Fala, Rafael! Confirmando presença no Churrasco VIP (24/10): ${confirmed.name} — ${confirmed.count === "1" ? "vou sozinho(a)" : `${confirmed.count} pessoas`}.${levar.length ? ` Vou levar: ${levar.join(", ")}.` : ""} 🔥`,
      )}`
    : "#";

  return (
    <section id="confirmar" className="border-t border-border/60 bg-charcoal">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-2 md:items-start md:py-28">
        <Reveal from="left">
          <p className="text-xs font-semibold tracking-[0.3em] text-primary">
            VAI FICAR DE FORA?
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl">
            Confirma aí.
            <br />
            <em className="not-italic text-primary">A resenha te espera.</em>
          </h2>
          <p className="mt-6 max-w-md text-muted-foreground">
            Registre sua presença e escolha o que pode levar pra mesa ficar completa. A
            carne é com a gente — o acompanhamento é com a galera.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary font-display text-sm font-bold text-primary">
              RM
            </span>
            <div>
              <p className="text-[0.65rem] font-semibold tracking-[0.25em] text-muted-foreground">
                FALA COM
              </p>
              <p className="font-semibold">Rafael Moraes</p>
              <p className="text-sm text-muted-foreground">(61) 99331-6047</p>
            </div>
          </div>
        </Reveal>

        <Reveal from="right" delay={120}>
        <div className="rounded-3xl border border-border bg-card p-7 shadow-ember md:p-9">
          <div className="flex items-center justify-between font-display text-xs font-semibold tracking-[0.25em] text-muted-foreground">
            <span>LISTA DA RESENHA</span>
            <span className="flex items-center gap-2 text-primary">
              <span className="animate-pulse-dot inline-block size-2 rounded-full bg-primary" />
              CONFIRMAÇÃO ABERTA
            </span>
          </div>

          {confirmed ? (
            <div className="mt-8 text-center">
              <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Flame className="size-8" />
              </span>
              <h3 className="mt-5 font-display text-2xl font-bold">
                {confirmed.name}, você está na lista!
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {confirmed.count === "1"
                  ? "Confirmado: só você."
                  : `Confirmado: ${confirmed.count} pessoas.`}
              </p>
              {levar.length > 0 && (
                <p className="mt-2 text-sm">
                  Vai levar: <span className="text-primary">{levar.join(", ")}</span>
                </p>
              )}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
              >
                <MessageCircle className="size-5" /> Avisar o Rafael no WhatsApp
              </a>
            </div>
          ) : (
            <>
              <h3 className="mt-6 font-display text-2xl font-bold">Seu nome na lista?</h3>
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label htmlFor="guestName" className="mb-1.5 block text-sm font-medium">
                    Como podemos te chamar?
                  </label>
                  <input
                    id="guestName"
                    type="text"
                    required
                    maxLength={80}
                    autoComplete="name"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-input bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label htmlFor="guestCount" className="mb-1.5 block text-sm font-medium">
                    Quantas pessoas vão?
                  </label>
                  <select
                    id="guestCount"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    className="w-full rounded-xl border border-input bg-secondary px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="1">Só eu</option>
                    <option value="2">2 pessoas</option>
                    <option value="3">3 pessoas</option>
                    <option value="4">4 pessoas</option>
                    <option value="5 ou mais">5 ou mais pessoas</option>
                  </select>
                </div>
                <fieldset>
                  <legend className="mb-2 text-sm font-medium">
                    O que você pode levar? <span className="text-muted-foreground">(escolha à vontade)</span>
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => {
                      const on = items.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggle(s)}
                          className={`rounded-full border px-3.5 py-1.5 text-sm transition-all ${
                            on
                              ? "border-primary bg-primary text-primary-foreground shadow-ember"
                              : "border-border bg-secondary text-foreground hover:border-primary/60"
                          }`}
                        >
                          {on ? "✓ " : "+ "}
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
                <div>
                  <label htmlFor="customItem" className="mb-1.5 block text-sm font-medium">
                    Outra coisa? Escreve aqui
                  </label>
                  <input
                    id="customItem"
                    type="text"
                    maxLength={200}
                    placeholder="Ex.: gelo, refrigerante, sobremesa…"
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    className="w-full rounded-xl border border-input bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
                >
                  {sending ? "Enviando…" : "Confirmar presença"} <ArrowUpRight className="size-4" />
                </button>
              </form>
            </>
          )}
          <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
            Guardamos seu nome, quantidade de pessoas e o que vai levar, só para a
            organização do evento.
          </p>
        </div>
        </Reveal>
      </div>
    </section>
  );
}

const EVENT_DATE = new Date("2026-10-24T11:00:00-03:00").getTime();

function Countdown() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = now === null ? 0 : Math.max(0, EVENT_DATE - now);
  const parts = [
    { label: "DIAS", v: Math.floor(diff / 86400000) },
    { label: "HORAS", v: Math.floor(diff / 3600000) % 24 },
    { label: "MIN", v: Math.floor(diff / 60000) % 60 },
    { label: "SEG", v: Math.floor(diff / 1000) % 60 },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 pt-16">
      <Reveal>
        <p className="text-center text-xs font-semibold tracking-[0.3em] text-primary">
          {now !== null && diff === 0 ? "A BRASA JÁ TÁ ACESA!" : "CONTAGEM PRA BRASA"}
        </p>
        <div className="mt-6 grid grid-cols-4 gap-3 sm:gap-5">
          {parts.map((p, i) => (
            <Reveal key={p.label} delay={i * 100}>
              <div className="rounded-2xl border border-border bg-card py-5 text-center shadow-ember sm:py-7">
                <p className="font-display text-4xl font-bold tabular-nums text-glow-ember text-primary sm:text-6xl">
                  {now === null ? "--" : String(p.v).padStart(2, "0")}
                </p>
                <p className="mt-1 text-[0.65rem] font-semibold tracking-[0.25em] text-muted-foreground sm:text-xs">
                  {p.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-5 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <a href="#inicio" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary font-display text-xs font-bold text-primary-foreground">
            CV
          </span>
          <span className="font-display text-xs font-semibold tracking-[0.2em]">
            CHURRASCO <span className="text-primary">VIP</span>
          </span>
        </a>
        <p className="text-sm text-muted-foreground">
          Feito pra reunir. Temperado com resenha.
        </p>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          Contato do organizador <ArrowUpRight className="size-4" />
        </a>
      </div>
    </footer>
  );
}
