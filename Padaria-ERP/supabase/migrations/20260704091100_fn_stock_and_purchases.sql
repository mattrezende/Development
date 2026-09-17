-- Recebimento de compra: dá entrada no estoque, recalcula custo médio ponderado,
-- marca a compra como recebida e gera automaticamente a conta a pagar.
create or replace function fn_receive_purchase(p_purchase_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_purchase purchases%rowtype;
  v_item record;
  v_new_stock numeric;
  v_new_avg_cost numeric;
begin
  select * into v_purchase from purchases where id = p_purchase_id for update;
  if not found then
    raise exception 'Compra não encontrada';
  end if;
  if v_purchase.status <> 'pendente' then
    raise exception 'Compra já foi recebida ou cancelada';
  end if;

  for v_item in
    select pi.*, i.current_stock, i.average_cost
    from purchase_items pi
    join ingredients i on i.id = pi.ingredient_id
    where pi.purchase_id = p_purchase_id
    for update of i
  loop
    v_new_stock := v_item.current_stock + v_item.quantity;
    v_new_avg_cost := case
      when v_new_stock > 0 then
        (v_item.current_stock * v_item.average_cost + v_item.quantity * v_item.unit_cost) / v_new_stock
      else v_item.unit_cost
    end;

    insert into stock_movements (ingredient_id, type, quantity, reference_type, purchase_id)
    values (v_item.ingredient_id, 'entrada', v_item.quantity, 'compra', p_purchase_id);

    update ingredients
      set current_stock = v_new_stock, average_cost = v_new_avg_cost
    where id = v_item.ingredient_id;
  end loop;

  update purchases set status = 'recebido' where id = p_purchase_id;

  insert into payables (description, purchase_id, category, amount, due_date, issued_at)
  values (
    'Compra de insumos' || coalesce(' — ' || v_purchase.supplier, ''),
    p_purchase_id,
    'insumos',
    v_purchase.total_amount,
    v_purchase.purchase_date + v_purchase.payment_due_days,
    v_purchase.purchase_date
  );
end;
$$;

-- Ajuste manual de estoque (perda/inventário) — soma um delta com sinal.
create or replace function fn_register_stock_adjustment(p_ingredient_id uuid, p_quantity numeric, p_notes text default null)
returns void
language plpgsql
security definer
as $$
begin
  if p_quantity = 0 then
    raise exception 'Quantidade do ajuste não pode ser zero';
  end if;

  insert into stock_movements (ingredient_id, type, quantity, reference_type, notes)
  values (p_ingredient_id, 'ajuste', p_quantity, 'manual', p_notes);

  update ingredients set current_stock = current_stock + p_quantity where id = p_ingredient_id;
end;
$$;

-- Insumos abaixo do estoque mínimo — alimenta o alerta do dashboard.
create view v_low_stock_ingredients as
  select * from ingredients where is_active and current_stock <= minimum_stock;
