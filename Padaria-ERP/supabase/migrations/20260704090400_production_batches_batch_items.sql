-- Remessa de produção: consolida os pedidos confirmados de uma data de entrega.
create table production_batches (
  id uuid primary key default gen_random_uuid(),
  delivery_date date not null,
  status text not null default 'aberta' check (status in ('aberta', 'fechada', 'cancelada')),
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  closed_by uuid references auth.users(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- No máximo uma remessa ABERTA por data de entrega.
create unique index idx_batches_open_per_date on production_batches(delivery_date) where status = 'aberta';
create index idx_batches_delivery_date on production_batches(delivery_date);

create trigger trg_production_batches_updated_at
  before update on production_batches
  for each row execute function set_updated_at();

create table batch_items (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references production_batches(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  total_quantity numeric(12, 3) not null default 0,
  unit text not null, -- snapshot de products.unit
  created_at timestamptz not null default now(),
  unique (batch_id, product_id)
);

create index idx_batch_items_batch on batch_items(batch_id);
