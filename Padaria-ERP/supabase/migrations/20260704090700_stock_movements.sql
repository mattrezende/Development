create table stock_movements (
  id uuid primary key default gen_random_uuid(),
  ingredient_id uuid not null references ingredients(id) on delete restrict,
  type text not null check (type in ('entrada', 'saida', 'ajuste')),
  quantity numeric(12, 3) not null check (quantity <> 0), -- delta COM SINAL: entrada>0, saida<0, ajuste qualquer sinal
  reference_type text check (reference_type in ('remessa', 'compra', 'manual')),
  production_batch_id uuid references production_batches(id) on delete restrict,
  purchase_id uuid references purchases(id) on delete restrict,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  check (num_nonnulls(production_batch_id, purchase_id) <= 1)
);

create index idx_stock_movements_ingredient on stock_movements(ingredient_id);
create index idx_stock_movements_created_at on stock_movements(created_at);
create index idx_stock_movements_batch on stock_movements(production_batch_id);
create index idx_stock_movements_purchase on stock_movements(purchase_id);
