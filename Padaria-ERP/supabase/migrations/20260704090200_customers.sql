create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  document text,
  document_type text check (document_type in ('CPF', 'CNPJ')),
  phone text,
  address_street text,
  address_number text,
  address_neighborhood text,
  address_city text,
  address_state text,
  address_zip text,
  delivery_days text[] not null default '{}', -- subconjunto de {dom,seg,ter,qua,qui,sex,sab}
  payment_terms text not null default 'a_vista' check (payment_terms in ('a_vista', 'prazo', 'consolidado_mensal')),
  payment_terms_days integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index idx_customers_document on customers(document) where document is not null;
create index idx_customers_active on customers(is_active);
create index idx_customers_name_trgm on customers using gin (name gin_trgm_ops);

create trigger trg_customers_updated_at
  before update on customers
  for each row execute function set_updated_at();
