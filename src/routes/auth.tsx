import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Painel Churrasco VIP" },
      { name: "description", content: "Acesso do organizador ao painel do Churrasco VIP." },
      { property: "og:title", content: "Entrar — Painel Churrasco VIP" },
      { property: "og:description", content: "Acesso do organizador ao painel do Churrasco VIP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return setMsg("E-mail ou senha incorretos.");
      navigate({ to: "/admin" });
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      setLoading(false);
      if (error) return setMsg(error.message);
      if (data.session) navigate({ to: "/admin" });
      else setMsg("Conta criada! Confirme pelo link enviado ao seu e-mail.");
    }
  };

  const input =
    "w-full rounded-xl border border-input bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-3xl border border-border bg-card p-8 shadow-ember">
        <h1 className="font-display text-3xl font-bold">
          Painel <span className="text-primary">VIP</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          {mode === "in" ? "Entre para ver as confirmações." : "Crie a conta do organizador."}
        </p>
        <input className={input} type="email" required placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={input} type="password" required minLength={6} placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
        {msg && <p className="text-sm text-primary">{msg}</p>}
        <button disabled={loading} className="w-full rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-60">
          {loading ? "Aguarde…" : mode === "in" ? "Entrar" : "Criar conta"}
        </button>
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="w-full text-sm text-muted-foreground hover:text-foreground">
          {mode === "in" ? "Primeiro acesso? Criar conta" : "Já tenho conta"}
        </button>
      </form>
    </div>
  );
}
