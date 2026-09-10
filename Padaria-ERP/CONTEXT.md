# e-bakery — Contexto do Projeto

ERP web para uma fábrica de pães, com foco em gestão de produção e BI.
Projeto novo e independente (não compartilha código com outros projetos do
workspace).

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| UI | Tailwind CSS v4 + shadcn/ui (preset Nova, ícones lucide) |
| Gráficos | Recharts |
| Formulários | react-hook-form + zod |
| Tabelas | @tanstack/react-table |
| Persistência (MVP atual) | **localStorage** no navegador |
| Persistência (futura, no deploy) | Supabase (Postgres + Auth + RLS) |
| Hospedagem futura | Hostinger (Node.js) |

## Decisão importante: por que localStorage agora?

O usuário optou por **não integrar o Supabase ainda** — primeiro quer validar
o sistema completo rodando localmente. Toda a persistência hoje é feita no
navegador via `localStorage`, mas o **modelo de dados já é o modelo final**
(mesmos nomes de campos, mesmos relacionamentos) desenhado para o Postgres —
ver `supabase/migrations/*.sql` (schema completo, não executado ainda).

A camada `src/lib/repositories/*.repo.ts` expõe funções assíncronas com a
mesma assinatura que uma chamada Supabase teria. Migrar para produção significa
trocar a *implementação interna* desses arquivos (de localStorage para
`@supabase/ssr` / `supabase.rpc(...)`) — os componentes React não mudam.

## Estrutura de pastas

```
src/
├── app/
│   ├── login/page.tsx              # login mock local
│   └── (app)/                      # rotas autenticadas (guarda via localStorage)
│       ├── dashboard/
│       ├── produtos/  clientes/  pedidos/  producao/
│       ├── estoque/{insumos,movimentacoes,compras}/
│       └── financeiro/{receber,pagar,fluxo-caixa,margem}/
├── components/
│   ├── ui/           # primitivas shadcn
│   ├── layout/        # sidebar, topbar, nav
│   └── data-table/     # tabela genérica reusada em todos os CRUDs
├── lib/
│   ├── db/local-store.ts   # helpers genéricos de localStorage
│   ├── db/seed.ts           # dados de exemplo (padaria brasileira)
│   ├── types/entities.ts    # interfaces espelhando o schema Postgres
│   ├── repositories/*.repo.ts  # CRUD + regras de negócio por domínio
│   └── format.ts              # BRL, datas dd/mm/aaaa
supabase/
├── migrations/*.sql   # schema completo (produtos → financeiro) — referência p/ deploy futuro
└── seed.sql            # seed de referência (cadastros base)
```

## Variáveis de ambiente

| Variável | Uso |
|---|---|
| `NEXT_PUBLIC_APP_USER` | e-mail do login mock local (padrão `admin@padaria.com`) |
| `NEXT_PUBLIC_APP_PASSWORD` | senha do login mock local (padrão `padaria123`) |
| `NEXT_PUBLIC_SUPABASE_URL` | preenchida somente na migração para Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | idem |
| `SUPABASE_SERVICE_ROLE_KEY` | idem |

Copie `.env.local.example` para `.env.local` antes de rodar.

## Scripts

| Comando | Ação |
|---|---|
| `npm run dev` | roda em http://localhost:3000 |
| `npm run build` / `npm run start` | build de produção |
| `npm run lint` | ESLint |

## Modelo de dados (14 entidades)

products, customers, orders, order_items, production_batches, batch_items,
ingredients, recipes, stock_movements, purchases, purchase_items, receivables,
payables, payments — ver `src/lib/types/entities.ts` para os campos completos
e `supabase/migrations/*.sql` para o desenho relacional/RLS de referência.

## Roteiro de migração para Supabase (quando for fazer o deploy)

1. Criar projeto em supabase.com, rodar os SQLs de `supabase/migrations/` na ordem (timestamps).
2. Preencher `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` no `.env.local` (e nas variáveis de ambiente da Hostinger).
3. Trocar a implementação de cada `src/lib/repositories/*.repo.ts` para usar `@supabase/ssr` (client/server) no lugar de `local-store.ts`, mantendo as mesmas assinaturas de função.
4. Substituir `src/lib/repositories/auth.repo.ts` (mock) por Supabase Auth — login único, sem cadastro público, contas de funcionários criadas via Supabase Dashboard (Authentication → Invite user).
5. Portar os dados de exemplo de `src/lib/db/seed.ts` para `supabase/seed.sql` (o arquivo já traz produtos/clientes/insumos/receitas; falta pedidos/remessa/compras/financeiro de exemplo).

## Fases de implementação (roadmap)

1. ✅ Scaffold + camada de dados local + seeds
2. Produtos + Clientes (CRUD)
3. Pedidos + recorrência
4. Remessa de Produção (núcleo do sistema)
5. BI/Dashboard
6. Estoque de Insumos
7. Financeiro
