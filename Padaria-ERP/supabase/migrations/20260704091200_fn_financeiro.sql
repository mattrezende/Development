-- Saldo/vencimento de títulos — evita guardar um status "vencido" que fica
-- desatualizado; o "aberto e due_date < hoje" já responde isso ao vivo.
create view v_receivables_balance as
  select r.*, r.amount - coalesce((select sum(p.amount) from payments p where p.receivable_id = r.id), 0) as balance
  from receivables r;

create view v_receivables_overdue as
  select *, (current_date - due_date) as dias_atraso
  from v_receivables_balance
  where status = 'aberto' and due_date < current_date;

create view v_payables_balance as
  select p.*, p.amount - coalesce((select sum(x.amount) from payments x where x.payable_id = p.id), 0) as balance
  from payables p;

create view v_payables_overdue as
  select *, (current_date - due_date) as dias_atraso
  from v_payables_balance
  where status = 'aberto' and due_date < current_date;

-- Ao faturar um pedido, gera o título a receber conforme a condição de
-- pagamento do cliente (à vista / prazo / consolidado mensal).
create or replace function fn_generate_receivable(p_order_id uuid)
returns uuid
language plpgsql
security definer
as $$
declare
  v_order orders%rowtype;
  v_customer customers%rowtype;
  v_receivable_id uuid;
  v_due_date date;
begin
  select * into v_order from orders where id = p_order_id for update;
  select * into v_customer from customers where id = v_order.customer_id;

  if v_customer.payment_terms = 'consolidado_mensal' then
    select id into v_receivable_id
    from receivables
    where customer_id = v_customer.id
      and billing_type = 'consolidado_mensal'
      and status = 'aberto'
      and date_trunc('month', issued_at) = date_trunc('month', current_date)
    limit 1;

    if v_receivable_id is not null then
      update receivables set amount = amount + v_order.total_amount where id = v_receivable_id;
      update orders set receivable_id = v_receivable_id where id = p_order_id;
      return v_receivable_id;
    end if;
    v_due_date := current_date + 30;
  elsif v_customer.payment_terms = 'prazo' then
    v_due_date := current_date + v_customer.payment_terms_days;
  else
    v_due_date := current_date;
  end if;

  insert into receivables (customer_id, billing_type, amount, due_date, issued_at)
  values (v_customer.id, v_customer.payment_terms, v_order.total_amount, v_due_date, current_date)
  returning id into v_receivable_id;

  update orders set receivable_id = v_receivable_id where id = p_order_id;
  return v_receivable_id;
end;
$$;

-- Baixa automática de status ao cobrir o saldo integral de um título.
create or replace function fn_payments_after_insert() returns trigger as $$
begin
  if new.receivable_id is not null then
    update receivables set status = 'pago'
    where id = new.receivable_id
      and (select balance from v_receivables_balance where id = new.receivable_id) <= 0;
  end if;
  if new.payable_id is not null then
    update payables set status = 'pago'
    where id = new.payable_id
      and (select balance from v_payables_balance where id = new.payable_id) <= 0;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_payments_after_insert
  after insert on payments
  for each row execute function fn_payments_after_insert();
