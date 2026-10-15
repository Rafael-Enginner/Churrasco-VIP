import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Painel do organizador — Churrasco VIP" },
      { name: "description", content: "Confirmações e lista do que cada convidado vai levar." },
      { property: "og:title", content: "Painel do organizador — Churrasco VIP" },
      { property: "og:description", content: "Confirmações e lista do que cada convidado vai levar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Row = {
  id: string;
  name: string;
  guest_count: string;
  items: string[];
  custom_item: string | null;
  created_at: string;
};

function AdminPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    const { data: admin } = await supabase.rpc("has_role", { _user_id: u.user!.id, _role: "admin" });
    setIsAdmin(!!admin);
    if (!admin) return;
    const { data } = await supabase.from("rsvps").select("*").order("created_at", { ascending: false });
    setRows((data as Row[]) ?? []);
  };
  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    if (!confirm("Remover esta confirmação?")) return;
    await supabase.from("rsvps").delete().eq("id", id);
    load();
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const tally = new Map<string, number>();
  rows?.forEach((r) => {
    [...r.items, ...(r.custom_item ? [r.custom_item] : [])].forEach((i) => tally.set(i, (tally.get(i) ?? 0) + 1));
  });
  const people = rows?.reduce((s, r) => s + (parseInt(r.guest_count) || 1), 0) ?? 0;

  return (
    <div className="min-h-screen bg-background px-5 py-10 text-foreground">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold">
            Painel <span className="text-primary">VIP</span>
          </h1>
          <button onClick={signOut} className="text-sm text-muted-foreground hover:text-foreground">Sair</button>
        </div>

        {isAdmin === false && (
          <p className="mt-8 rounded-2xl border border-border bg-card p-6 text-muted-foreground">
            Esta conta não tem acesso de organizador.
          </p>
        )}

        {isAdmin && rows && (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ["CONFIRMAÇÕES", rows.length],
                ["PESSOAS (APROX.)", people],
                ["ITENS DIFERENTES", tally.size],
              ].map(([l, v]) => (
                <div key={l} className="rounded-2xl border border-border bg-card p-5">
                  <p className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">{l}</p>
                  <p className="mt-2 font-display text-4xl font-bold text-primary">{v}</p>
                </div>
              ))}
            </div>

            <h2 className="mt-10 font-display text-xl font-bold">O que vai ter na mesa</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {tally.size === 0 && <p className="text-sm text-muted-foreground">Ninguém escolheu nada ainda.</p>}
              {[...tally.entries()].sort((a, b) => b[1] - a[1]).map(([item, n]) => (
                <span key={item} className="rounded-full border border-primary/50 bg-secondary px-3.5 py-1.5 text-sm">
                  {item} <span className="font-bold text-primary">×{n}</span>
                </span>
              ))}
            </div>

            <h2 className="mt-10 font-display text-xl font-bold">Convidados</h2>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead className="text-xs tracking-widest text-muted-foreground">
                  <tr>
                    <th className="p-4">NOME</th>
                    <th className="p-4">PESSOAS</th>
                    <th className="p-4">VAI LEVAR</th>
                    <th className="p-4">QUANDO</th>
                    <th className="p-4" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t border-border">
                      <td className="p-4 font-semibold">{r.name}</td>
                      <td className="p-4">{r.guest_count}</td>
                      <td className="p-4 text-muted-foreground">
                        {[...r.items, r.custom_item].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="p-4 text-muted-foreground">{new Date(r.created_at).toLocaleString("pt-BR")}</td>
                      <td className="p-4">
                        <button onClick={() => remove(r.id)} className="text-xs text-destructive hover:underline">Remover</button>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Nenhuma confirmação ainda.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
