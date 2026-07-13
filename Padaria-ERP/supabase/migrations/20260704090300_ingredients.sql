create table ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  unit text not null, -- kg, l, un, g, ml — insumos precisam de unidades mais finas que produtos
  current_stock numeric(12, 3) not null default 0,
  minimum_stock numeric(12, 3) not null default 0,
  average_cost numeric(10, 4) not null default 0, -- custo médio ponderado, recalculado a cada compra recebida
  supplier text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_ingredients_active on ingredients(is_active);
create index idx_ingredients_low_stock on ingredients(current_stock, minimum_stock);

create trigger trg_ingredients_updated_at
  before update on ingredients
  for each row execute function set_updated_at();
