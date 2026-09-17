create table receivables (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete restrict,
  billing_type text not null check (billing_type in ('a_vista', 'prazo', 'consolidado_mensal')),
  amount numeric(10, 2) not null check (amount >= 0),
  due_date date not null,
  status text not null default 'aberto' check (status in ('aberto', 'pago', 'cancelado')),
  issued_at date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_receivables_customer on receivables(customer_id);
create index idx_receivables_status on receivables(status);
create index idx_receivables_due_date on receivables(due_date);

create trigger trg_receivables_updated_at
  before update on receivables
  for each row execute function set_updated_at();

-- Agora que receivables existe, conecta o FK pendente em orders.
alter table orders
  add constraint fk_orders_receivable foreign key (receivable_id) references receivables(id) on delete restrict;

create table payables (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  purchase_id uuid references purchases(id) on delete restrict, -- preenchido automaticamente quando gerado por uma compra
  category text, -- 'insumos' para linhas automáticas; texto livre para lançamentos manuais (aluguel, energia, etc.)
  amount numeric(10, 2) not null check (amount >= 0),
  due_date date not null,
  status text not null default 'aberto' check (status in ('aberto', 'pago', 'cancelado')),
  issued_at date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_payables_status on payables(status);
create index idx_payables_due_date on payables(due_date);
create index idx_payables_purchase on payables(purchase_id);

create trigger trg_payables_updated_at
  before update on payables
  for each row execute function set_updated_at();

create table payments (
  id uuid primary key default gen_random_uuid(),
  receivable_id uuid references receivables(id) on delete restrict,
  payable_id uuid references payables(id) on delete restrict,
  amount numeric(10, 2) not null check (amount > 0),
  payment_date date not null default current_date,
  method text, -- pix, dinheiro, cartao, transferencia, boleto
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  check (num_nonnulls(receivable_id, payable_id) = 1)
);

create index idx_payments_receivable on payments(receivable_id);
create index idx_payments_payable on payments(payable_id);
create index idx_payments_date on payments(payment_date);
