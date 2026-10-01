create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  unit text not null check (unit in ('un', 'kg')),
  sale_price numeric(10, 2) not null check (sale_price >= 0),
  estimated_cost numeric(10, 2) not null default 0 check (estimated_cost >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_products_category on products(category);
create index idx_products_active on products(is_active);
create index idx_products_name_trgm on products using gin (name gin_trgm_ops);

create trigger trg_products_updated_at
  before update on products
  for each row execute function set_updated_at();
