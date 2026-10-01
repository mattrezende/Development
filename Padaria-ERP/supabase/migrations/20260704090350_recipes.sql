-- Ficha técnica: quais insumos e quantidades para produzir 1 unidade de um produto.
create table recipes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id) on delete restrict,
  quantity_per_unit numeric(12, 4) not null check (quantity_per_unit > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, ingredient_id)
);

create index idx_recipes_product on recipes(product_id);
create index idx_recipes_ingredient on recipes(ingredient_id);

create trigger trg_recipes_updated_at
  before update on recipes
  for each row execute function set_updated_at();
