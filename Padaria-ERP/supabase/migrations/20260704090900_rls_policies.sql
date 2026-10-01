-- RLS single-tenant: este é o sistema interno de UMA fábrica (não é multi-tenant
-- SaaS), então qualquer usuário autenticado (funcionário convidado via Supabase
-- Dashboard) tem acesso total. Sem chave anônima com acesso de leitura/escrita.
-- Caso o negócio precise de perfis (produção vs. financeiro, por exemplo), trocar
-- estas políticas por checagens de role — fora do escopo do MVP.

do $$
declare
  t text;
begin
  foreach t in array array[
    'products', 'customers', 'orders', 'order_items',
    'production_batches', 'batch_items',
    'ingredients', 'recipes', 'stock_movements',
    'purchases', 'purchase_items',
    'receivables', 'payables', 'payments'
  ]
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "%I_authenticated_all" on %I', t, t);
    execute format(
      'create policy "%I_authenticated_all" on %I for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'')',
      t, t
    );
  end loop;
end $$;
