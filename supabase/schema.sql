-- =====================================================================
-- Wissenschaftsbarometer audience segmentation — Supabase schema
-- Run this in the Supabase SQL editor (one-time setup per project).
-- The whole system (many customers) can live in ONE project: each
-- customer's data is separated by the survey_id column.
-- =====================================================================

-- 1) Responses table -------------------------------------------------
create table if not exists public.responses (
  id                          bigint generated always as identity primary key,
  created_at                  timestamptz not null default now(),
  survey_id                   text not null,
  language                    text,
  segment                     smallint,          -- 1..4 (ordinal typology)
  segment_label               text,
  prob_sciencephiles          real,
  prob_critically_interested  real,
  prob_passive_supporters     real,
  prob_disengaged             real,
  idx_sl                      real,
  n_missing                   smallint,
  age_year                    smallint,          -- year of birth
  gender                      smallint,          -- 1=m, 2=f, 3=other
  education                   smallint,          -- 1..10 (Swiss scale)
  canton                      text,              -- canton code (ZH, BE, ...) or EXT
  contact_type                smallint,          -- 1=email, 2=post, 3=no
  contact                     jsonb,             -- voluntary follow-up contact details
  answers                     jsonb,             -- raw item answers
  duration_sec                integer
);

create index if not exists responses_survey_idx on public.responses (survey_id, created_at);

-- Migration for existing installations (no-op on fresh installs):
alter table public.responses add column if not exists canton text;
alter table public.responses add column if not exists contact_type smallint;
alter table public.responses add column if not exists contact jsonb;

-- 2) Row Level Security ---------------------------------------------
-- The public (anon) key may INSERT responses but may NOT read them.
-- Dashboards read through the aggregate RPC below, which is SECURITY
-- DEFINER and only ever returns counts — never individual rows.
alter table public.responses enable row level security;

drop policy if exists "anon can insert responses" on public.responses;
create policy "anon can insert responses"
  on public.responses for insert
  to anon
  with check (true);

-- (No select policy for anon => raw rows are not readable with the anon key.)

-- 3) Customers / access codes ---------------------------------------
-- One row per customer (survey). The access code protects that
-- customer's dashboard. Codes are stored hashed (pgcrypto), so a leak
-- of this table does not reveal the codes.
-- Note: on Supabase, extensions live in the "extensions" schema, so we
-- install it there and reference its functions fully qualified.
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.surveys (
  survey_id    text primary key,
  display_name text,
  code_hash    text not null,          -- crypt(code, gen_salt('bf'))
  created_at   timestamptz not null default now()
);

alter table public.surveys enable row level security;
-- No anon policies => the surveys table is not readable/writable with the
-- anon key at all. You manage it from the SQL editor (service role).

-- Helper to add or update a customer. Run from the SQL editor:
--   select set_survey_code('museum-basel-2026', 'Museum Basel', 'a-strong-code');
create or replace function public.set_survey_code(p_survey_id text, p_name text, p_code text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into surveys (survey_id, display_name, code_hash)
  values (p_survey_id, p_name, extensions.crypt(p_code, extensions.gen_salt('bf')))
  on conflict (survey_id)
  do update set display_name = excluded.display_name, code_hash = excluded.code_hash;
$$;
revoke all on function public.set_survey_code(text, text, text) from anon;

-- 4) Aggregate function for the dashboard (access-code protected) ----
-- Returns aggregate counts ONLY IF the access code matches. Returns
-- NULL when the survey is unknown or the code is wrong. Safe to call
-- with the anon key: it never returns individual responses, and it
-- gates on the code before returning anything.
create or replace function public.survey_summary_secured(p_survey_id text, p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  ok boolean;
begin
  select (code_hash = extensions.crypt(p_code, code_hash)) into ok
  from surveys where survey_id = p_survey_id;

  if ok is distinct from true then
    return null;                       -- unknown survey or wrong code
  end if;

  return jsonb_build_object(
    'survey_id', p_survey_id,
    'total', (select count(*) from responses where survey_id = p_survey_id),
    'last_response_at', (select max(created_at) from responses where survey_id = p_survey_id),
    'segments', coalesce((
      select jsonb_object_agg(segment::text, c)
      from (select segment, count(*) c from responses
            where survey_id = p_survey_id and segment is not null
            group by segment) s
    ), '{}'::jsonb),
    'by_language', coalesce((
      select jsonb_object_agg(coalesce(language,'?'), c)
      from (select language, count(*) c from responses
            where survey_id = p_survey_id group by language) l
    ), '{}'::jsonb),
    'segment_by_gender', coalesce((
      select jsonb_agg(jsonb_build_object('gender',gender,'segment',segment,'c',c))
      from (select gender, segment, count(*) c from responses
            where survey_id = p_survey_id and segment is not null
            group by gender, segment) g
    ), '[]'::jsonb),
    'segment_by_age', coalesce((
      select jsonb_agg(jsonb_build_object('grp',grp,'segment',segment,'c',c))
      from (select case
              when age_year is null then 'na'
              when extract(year from now())::int - age_year <= 34 then '15-34'
              when extract(year from now())::int - age_year <= 54 then '35-54'
              else '55+' end grp,
            segment, count(*) c
            from responses where survey_id = p_survey_id and segment is not null
            group by 1, segment) a
    ), '[]'::jsonb),
    'segment_by_edu', coalesce((
      select jsonb_agg(jsonb_build_object('grp',grp,'segment',segment,'c',c))
      from (select case
              when education is null then 'na'
              when education <= 2 then 'low'
              when education <= 6 then 'mid'
              else 'high' end grp,
            segment, count(*) c
            from responses where survey_id = p_survey_id and segment is not null
            group by 1, segment) e
    ), '[]'::jsonb),
    'segment_by_canton', coalesce((
      select jsonb_agg(jsonb_build_object('grp', coalesce(canton,'na'),'segment',segment,'c',c))
      from (select canton, segment, count(*) c
            from responses where survey_id = p_survey_id and segment is not null
            group by canton, segment) k
    ), '[]'::jsonb),
    'timeseries', coalesce((
      select jsonb_agg(jsonb_build_object('d', d, 'segment', segment, 'c', c) order by d)
      from (select date_trunc('day', created_at)::date d, segment, count(*) c
            from responses where survey_id = p_survey_id and segment is not null
            group by 1, segment) ts
    ), '[]'::jsonb),
    'avg_idx_sl', (select round(avg(idx_sl)::numeric, 3) from responses where survey_id = p_survey_id),
    'avg_duration_sec', (select round(avg(duration_sec)::numeric, 0) from responses where survey_id = p_survey_id),
    'avg_certainty', (
      select round(avg(greatest(prob_sciencephiles, prob_critically_interested,
                                prob_passive_supporters, prob_disengaged))::numeric, 3)
      from responses where survey_id = p_survey_id),
    'certainty_by_segment', coalesce((
      select jsonb_object_agg(segment::text, c)
      from (select segment,
                   round(avg(greatest(prob_sciencephiles, prob_critically_interested,
                                      prob_passive_supporters, prob_disengaged))::numeric, 3) c
            from responses where survey_id = p_survey_id and segment is not null
            group by segment) s
    ), '{}'::jsonb),
    'item_dist', coalesce((
      select jsonb_agg(jsonb_build_object('k', k, 'v', v, 'c', c))
      from (select e.key k, e.value v, count(*) c
            from responses r, jsonb_each_text(r.answers) e
            where r.survey_id = p_survey_id
            group by e.key, e.value) d
    ), '[]'::jsonb)
  );
end;
$$;

grant execute on function public.survey_summary_secured(text, text) to anon;


-- 6) Data export (access-code protected) ----------------------------
-- Returns ALL rows of one survey as a JSON array — including voluntary
-- contact details — but only when the access code matches. Used by the
-- dashboard's CSV download.
create or replace function public.survey_export_secured(p_survey_id text, p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  ok boolean;
begin
  select (code_hash = extensions.crypt(p_code, code_hash)) into ok
  from surveys where survey_id = p_survey_id;
  if ok is distinct from true then return null; end if;

  return coalesce((
    select jsonb_agg(to_jsonb(r) order by r.created_at)
    from responses r where r.survey_id = p_survey_id
  ), '[]'::jsonb);
end;
$$;
grant execute on function public.survey_export_secured(text, text) to anon;

-- 7) Delete all data of one survey (access-code protected) ----------
-- Irreversible. Returns the number of deleted responses, or null when
-- the survey is unknown or the code is wrong.
create or replace function public.survey_delete_secured(p_survey_id text, p_code text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  ok boolean;
  n integer;
begin
  select (code_hash = extensions.crypt(p_code, code_hash)) into ok
  from surveys where survey_id = p_survey_id;
  if ok is distinct from true then return null; end if;

  delete from responses where survey_id = p_survey_id;
  get diagnostics n = row_count;
  return n;
end;
$$;
grant execute on function public.survey_delete_secured(text, text) to anon;

-- 5) Realtime (optional) --------------------------------------------
-- Lets the dashboard update the moment a response lands. Note: because
-- the anon key has no SELECT policy on `responses` (by design), realtime
-- row payloads may not be delivered to the dashboard — that's fine. The
-- dashboard also polls the aggregate function every 15s, which is the
-- reliable path and never exposes raw rows. Enabling this is harmless.
-- (safe to run even if already added)
do $$
begin
  begin
    alter publication supabase_realtime add table public.responses;
  exception when duplicate_object then null;
  end;
end $$;
