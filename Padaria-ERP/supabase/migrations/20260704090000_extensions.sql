-- Extensões e utilitários compartilhados por todas as tabelas.
create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists pg_trgm;    -- busca rápida (ILIKE) em colunas de nome

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
