-- Seed de referência (não executado agora). Cadastros base (produtos, clientes,
-- insumos, fichas técnicas) com dados realistas de uma padaria brasileira.
-- Pedidos, remessas, compras e títulos financeiros de exemplo seguem o mesmo
-- padrão usado em src/lib/db/seed.ts (camada local) — replicar aquele conjunto
-- de dados aqui ao migrar para Supabase, ajustando os ids para gen_random_uuid().

insert into products (id, name, category, unit, sale_price, estimated_cost) values
  ('00000000-0000-0000-0001-000000000001', 'Pão Francês', 'Pão Francês', 'un', 0.75, 0.35),
  ('00000000-0000-0000-0001-000000000002', 'Pão de Forma', 'Pão de Forma', 'un', 9.90, 4.50),
  ('00000000-0000-0000-0001-000000000003', 'Baguete', 'Pão Francês', 'un', 8.50, 3.20),
  ('00000000-0000-0000-0001-000000000004', 'Croissant', 'Doce', 'un', 6.50, 2.10),
  ('00000000-0000-0000-0001-000000000005', 'Pão de Queijo', 'Salgado', 'kg', 32.00, 14.00),
  ('00000000-0000-0000-0001-000000000006', 'Bolo de Chocolate', 'Doce', 'un', 45.00, 18.00),
  ('00000000-0000-0000-0001-000000000007', 'Pão Doce', 'Doce', 'un', 4.50, 1.60),
  ('00000000-0000-0000-0001-000000000008', 'Rosca', 'Doce', 'un', 12.00, 5.00),
  ('00000000-0000-0000-0001-000000000009', 'Sonho', 'Doce', 'un', 5.50, 2.00),
  ('00000000-0000-0000-0001-000000000010', 'Cuca de Uva', 'Doce', 'un', 15.00, 6.50),
  ('00000000-0000-0000-0001-000000000011', 'Pão Integral', 'Integral', 'un', 10.50, 5.20),
  ('00000000-0000-0000-0001-000000000012', 'Torta Salgada', 'Salgado', 'kg', 38.00, 16.00),
  ('00000000-0000-0000-0001-000000000013', 'Coxinha', 'Salgado', 'un', 6.00, 2.40),
  ('00000000-0000-0000-0001-000000000014', 'Brigadeiro', 'Doce', 'un', 3.00, 1.10),
  ('00000000-0000-0000-0001-000000000015', 'Café', 'Bebida', 'un', 4.00, 0.90);

insert into customers (id, name, document, document_type, phone, delivery_days, payment_terms, payment_terms_days) values
  ('00000000-0000-0000-0002-000000000001', 'Mercadinho Bom Preço Ltda', '12.345.678/0001-90', 'CNPJ', '(11) 98888-1010', '{seg,ter,qua,qui,sex}', 'prazo', 15),
  ('00000000-0000-0000-0002-000000000002', 'Restaurante Sabor Caseiro', '23.456.789/0001-01', 'CNPJ', '(11) 98888-2020', '{seg,ter,qua,qui,sex,sab}', 'prazo', 15),
  ('00000000-0000-0000-0002-000000000003', 'Distribuidora Padaria Central', '34.567.890/0001-12', 'CNPJ', '(11) 98888-3030', '{seg,qua,sex}', 'consolidado_mensal', 0),
  ('00000000-0000-0000-0002-000000000004', 'Maria da Silva', '123.456.789-00', 'CPF', '(11) 97777-1111', '{sab}', 'a_vista', 0),
  ('00000000-0000-0000-0002-000000000005', 'João Pereira', '234.567.890-11', 'CPF', '(11) 97777-2222', '{dom}', 'a_vista', 0),
  ('00000000-0000-0000-0002-000000000006', 'Cantina Escolar Nova Esperança', '45.678.901/0001-23', 'CNPJ', '(11) 98888-4040', '{seg,ter,qua,qui,sex}', 'prazo', 30),
  ('00000000-0000-0000-0002-000000000007', 'Hotel Pousada Estrela', '56.789.012/0001-34', 'CNPJ', '(11) 98888-5050', '{seg,ter,qua,qui,sex,sab,dom}', 'prazo', 15),
  ('00000000-0000-0000-0002-000000000008', 'Ana Souza', '345.678.901-22', 'CPF', '(11) 97777-3333', '{qui}', 'a_vista', 0),
  ('00000000-0000-0000-0002-000000000009', 'Mercado Vila Verde', '67.890.123/0001-45', 'CNPJ', '(11) 98888-6060', '{seg,ter,qua,qui,sex}', 'consolidado_mensal', 0),
  ('00000000-0000-0000-0002-000000000010', 'Carlos Oliveira', '456.789.012-33', 'CPF', '(11) 97777-4444', '{ter,qui}', 'a_vista', 0);

insert into ingredients (id, name, unit, current_stock, minimum_stock, average_cost, supplier) values
  ('00000000-0000-0000-0003-000000000001', 'Farinha de Trigo', 'kg', 80, 50, 4.20, 'Moinho Trigo Bom'),
  ('00000000-0000-0000-0003-000000000002', 'Açúcar', 'kg', 40, 20, 4.80, 'Distribuidora Doce Sabor'),
  ('00000000-0000-0000-0003-000000000003', 'Fermento Biológico', 'kg', 3, 5, 32.00, 'Fermentos & Cia'),
  ('00000000-0000-0000-0003-000000000004', 'Sal Refinado', 'kg', 15, 5, 2.50, 'Salinas do Nordeste'),
  ('00000000-0000-0000-0003-000000000005', 'Manteiga', 'kg', 20, 10, 22.00, 'Laticínios Serra Verde'),
  ('00000000-0000-0000-0003-000000000006', 'Ovos', 'un', 300, 100, 0.60, 'Granja Boa Postura'),
  ('00000000-0000-0000-0003-000000000007', 'Leite Integral', 'L', 60, 30, 4.10, 'Laticínios Serra Verde'),
  ('00000000-0000-0000-0003-000000000008', 'Chocolate em Pó', 'kg', 12, 8, 18.50, 'Distribuidora Doce Sabor');

insert into recipes (product_id, ingredient_id, quantity_per_unit) values
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0003-000000000001', 0.06),
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0003-000000000003', 0.001),
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0003-000000000004', 0.001),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0003-000000000001', 0.25),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0003-000000000003', 0.005),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0003-000000000007', 0.05),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0003-000000000005', 0.02),
  ('00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0003-000000000001', 0.40),
  ('00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0003-000000000002', 0.30),
  ('00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0003-000000000006', 4),
  ('00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0003-000000000008', 0.15),
  ('00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0003-000000000005', 0.10);

-- Pendente: pedidos, remessa histórica, compra, contas a receber/pagar e
-- pagamentos de exemplo — ver src/lib/db/seed.ts para o conjunto completo a
-- portar ao migrar para Supabase.
