-- Núcleo do sistema: agregação e fechamento da remessa de produção.
-- Implementado como function (não trigger) porque fechar uma remessa é uma
-- ação explícita do usuário que precisa de um resultado claro de sucesso/erro,
-- e porque a mesma agregação (fn_preview_production) precisa ser usada tanto
-- pela tela de preview quanto pelo fechamento, para os números nunca divergirem.

create or replace function fn_preview_production(p_delivery_date date)
returns table(product_id uuid, product_name text, unit text, total_quantity numeric)
language sql
stable
as $$
  select
    p.id as product_id,
    p.name as product_name,
    p.unit,
    sum(oi.quantity) as total_quantity
  from order_items oi
  join orders o on o.id = oi.order_id
  join products p on p.id = oi.product_id
  where o.delivery_date = p_delivery_date
    and o.status = 'confirmado'
    and o.production_batch_id is null
  group by p.id, p.name, p.unit
  order by p.name;
$$;

create or replace function fn_open_or_get_batch(p_delivery_date date)
returns uuid
language plpgsql
as $$
declare
  v_batch_id uuid;
begin
  select id into v_batch_id
  from production_batches
  where delivery_date = p_delivery_date and status = 'aberta';

  if v_batch_id is null then
    insert into production_batches (delivery_date) values (p_delivery_date)
    returning id into v_batch_id;
  end if;

  return v_batch_id;
end;
$$;

create or replace function fn_close_production_batch(p_batch_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_batch production_batches%rowtype;
  v_ingredient record;
begin
  select * into v_batch from production_batches where id = p_batch_id for update;
  if not found then
    raise exception 'Remessa não encontrada';
  end if;
  if v_batch.status <> 'aberta' then
    raise exception 'Remessa já foi fechada';
  end if;

  -- 1. grava batch_items a partir da agregação (fonte única com o preview)
  insert into batch_items (batch_id, product_id, total_quantity, unit)
  select p_batch_id, product_id, total_quantity, unit
  from fn_preview_production(v_batch.delivery_date)
  on conflict (batch_id, product_id) do update set total_quantity = excluded.total_quantity;

  -- 2. marca os pedidos confirmados dessa data como em_producao
  update orders
    set status = 'em_producao', production_batch_id = p_batch_id, production_at = now()
  where delivery_date = v_batch.delivery_date
    and status = 'confirmado'
    and production_batch_id is null;

  -- 3. calcula consumo de insumos via ficha técnica e dá baixa no estoque
  for v_ingredient in
    select r.ingredient_id, sum(r.quantity_per_unit * bi.total_quantity) as consumo
    from batch_items bi
    join recipes r on r.product_id = bi.product_id
    where bi.batch_id = p_batch_id
    group by r.ingredient_id
  loop
    insert into stock_movements (ingredient_id, type, quantity, reference_type, production_batch_id)
    values (v_ingredient.ingredient_id, 'saida', -v_ingredient.consumo, 'remessa', p_batch_id);

    update ingredients
      set current_stock = current_stock - v_ingredient.consumo
    where id = v_ingredient.ingredient_id;
  end loop;

  -- 4. fecha a remessa
  update production_batches
    set status = 'fechada', closed_at = now(), closed_by = auth.uid()
  where id = p_batch_id;
end;
$$;
