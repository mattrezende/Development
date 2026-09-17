create table purchases (
  id uuid primary key default gen_random_uuid(),
  supplier text,
  purchase_date date not null default current_date,
  status text not null default 'pendente' check (status in ('pendente', 'recebido', 'cancelado')),
  total_amount numeric(10, 2) not null default 0,
  payment_due_days integer not null default 0, -- usado por fn_receive_purchase para definir due_date do payable
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_purchases_status on purchases(status);
create index idx_purchases_date on purchases(purchase_date);

create trigger trg_purchases_updated_at
  before update on purchases
  for each row execute function set_updated_at();

create table purchase_items (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references purchases(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id) on delete restrict,
  quantity numeric(12, 3) not null check (quantity > 0),
  unit_cost numeric(10, 4) not null check (unit_cost >= 0),
  subtotal numeric(12, 2) generated always as (quantity * unit_cost) stored,
  created_at timestamptz not null default now()
);

create index idx_purchase_items_purchase on purchase_items(purchase_id);
create index idx_purchase_items_ingredient on purchase_items(ingredient_id);

create or replace function fn_recalc_purchase_total() returns trigger as $$
begin
  update purchases
    set total_amount = coalesce(
      (select sum(subtotal) from purchase_items where purchase_id = coalesce(new.purchase_id, old.purchase_id)),
      0
    )
  where id = coalesce(new.purchase_id, old.purchase_id);
  return null;
end;
$$ language plpgsql;

create trigger trg_purchase_items_recalc
  after insert or update or delete on purchase_items
  for each row execute function fn_recalc_purchase_total();
