-- Migração do esquema antigo (guestCount TEXT, createdAt) para o novo.
-- Execute no SQL Editor do Supabase. Faça um backup antes (Database > Backups).
-- Não apaga dados: a coluna antiga fica como guest_count_legacy.

begin;

-- 1) Aborta se houver nomes duplicados (o novo índice único não os aceitaria).
do $$
begin
  if exists (select 1 from public.guests group by lower(btrim(name)) having count(*) > 1) then
    raise exception 'Há nomes duplicados em guests. Renomeie ou una os registros e rode de novo.';
  end if;
end $$;

-- 2) Converte o esquema, só se ainda for o antigo (pode rodar de novo sem efeito).
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'guests' and column_name = 'guestCount') then

    alter table public.guests add column guest_count smallint;
    update public.guests set guest_count = case
      when "guestCount" ~ '^[1-4]$' then "guestCount"::smallint
      when "guestCount" = '5 ou mais' then 5
      else 1 end;
    alter table public.guests alter column guest_count set not null;
    alter table public.guests add constraint guests_guest_count_chk check (guest_count between 1 and 5);

    alter table public.guests rename column "guestCount" to guest_count_legacy;
    alter table public.guests alter column guest_count_legacy drop not null;
    alter table public.guests rename column "createdAt" to created_at;

    alter table public.guests add constraint guests_name_len_chk check (char_length(name) between 1 and 80);
    alter table public.guests add constraint guests_status_chk check (status in ('Pendente', 'Confirmado'));
    alter table public.guests add column name_key text generated always as (lower(btrim(name))) stored;
  end if;
end $$;

-- 2b) Corrige bancos que já rodaram a primeira versão desta migração: a coluna antiga
--     continuava NOT NULL e fazia toda nova confirmação falhar com "Erro interno".
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'guests'
               and column_name = 'guest_count_legacy' and is_nullable = 'NO') then
    alter table public.guests alter column guest_count_legacy drop not null;
  end if;
end $$;

create unique index if not exists guests_name_key_idx on public.guests (name_key);
create index if not exists guests_created_at_idx on public.guests (created_at desc);

-- 3) RLS: sem políticas, a Data API pública (anon/authenticated) não enxerga nada.
--    O servidor Express usa o papel postgres, que ignora RLS.
alter table public.guests enable row level security;
revoke all on public.guests from anon, authenticated;

do $$
begin
  if to_regclass('public.user_sessions') is not null then
    alter table public.user_sessions enable row level security;
    revoke all on public.user_sessions from anon, authenticated;
  end if;
end $$;

commit;

-- Depois de validar tudo, se quiser: alter table public.guests drop column guest_count_legacy;
