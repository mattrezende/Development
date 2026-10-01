create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete restrict,
  delivery_date date not null,
  status text not null default 'rascunho'
    check (status in ('rascunho', 'confirmado', 'em_producao', 'entregue', 'faturado', 'cancelado')),
  is_recurring boolean not null default false,
  recurrence_rule jsonb, -- apenas no pedido-modelo, ex: {"weekdays":[1,2,3,4,5],"until":"2026-12-31"}
  parent_order_id uuid references orders(id) on delete set null, -- liga ocorrências geradas ao modelo
  production_batch_id uuid references production_batches(id) on delete set null,
  receivable_id uuid, -- FK adicionada em 20260704090800 (receivables ainda não existe aqui)
  total_amount numeric(10, 2) not null default 0, -- mantido em sincronia por trigger a partir de order_items
  notes text,
  confirmed_at timestamptz,
  production_at timestamptz,
  delivered_at timestamptz,
  invoiced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index idx_orders_parent_delivery on orders(parent_order_id, delivery_date) where parent_order_id is not null;
create index idx_orders_customer on orders(customer_id);
create index idx_orders_delivery_date on orders(delivery_date);
create index idx_orders_status on orders(status);
create index idx_orders_production_batch on orders(production_batch_id);

create trigger trg_orders_updated_at
  before update on orders
  for each row execute function set_updated_at();

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  quantity numeric(10, 3) not null check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0), -- snapshot do preço, não o preço atual do produto
  subtotal numeric(12, 2) generated always as (quantity * unit_price) stored,
  created_at timestamptz not null default now()
);

create index idx_order_items_order on order_items(order_id);
create index idx_order_items_product on order_items(product_id);

-- Mantém orders.total_amount em sincronia sempre que order_items mudar.
create or replace function fn_recalc_order_total() returns trigger as $$
begin
  update orders
    set total_amount = coalesce(
      (select sum(subtotal) from order_items where order_id = coalesce(new.order_id, old.order_id)),
      0
    )
  where id = coalesce(new.order_id, old.order_id);
  return null;
end;
$$ language plpgsql;

create trigger trg_order_items_recalc
  after insert or update or delete on order_items
  for each row execute function fn_recalc_order_total();
