-- Views de apoio ao BI/Dashboard (faturamento, ranking, curva de produção).
create view v_revenue_by_day as
  select
    o.delivery_date as day,
    sum(o.total_amount) as revenue,
    count(*) as orders_count
  from orders o
  where o.status in ('faturado', 'entregue')
  group by o.delivery_date;

create view v_top_products as
  select
    p.id as product_id,
    p.name as product_name,
    sum(oi.quantity) as total_quantity,
    sum(oi.subtotal) as total_revenue
  from order_items oi
  join orders o on o.id = oi.order_id
  join products p on p.id = oi.product_id
  where o.status in ('faturado', 'entregue')
  group by p.id, p.name;

create view v_customer_ranking as
  select
    c.id as customer_id,
    c.name as customer_name,
    sum(o.total_amount) as total_revenue,
    count(*) as orders_count
  from orders o
  join customers c on c.id = o.customer_id
  where o.status in ('faturado', 'entregue')
  group by c.id, c.name;

create view v_daily_production_curve as
  select
    pb.delivery_date as day,
    sum(bi.total_quantity) as total_quantity
  from production_batches pb
  join batch_items bi on bi.batch_id = pb.id
  where pb.status = 'fechada'
  group by pb.delivery_date;
