-- Correção rápida para quem já rodou a 001 original e vê "Erro interno" ao confirmar presença.
-- Cole no SQL Editor do Supabase e clique em Run. Pode rodar mais de uma vez.
alter table public.guests alter column guest_count_legacy drop not null;
