# e-bakery

ERP web para uma fábrica de pães — produção, estoque, financeiro e BI.

Veja [CONTEXT.md](./CONTEXT.md) para a visão completa da arquitetura, estrutura
de pastas e roadmap de migração para Supabase.

## Rodando localmente (estado atual: sem Supabase)

O projeto hoje roda **inteiramente local**, sem backend: os dados ficam
salvos no `localStorage` do navegador e já são semeados automaticamente com
um conjunto de exemplo (produtos, clientes, insumos, pedidos, uma remessa
fechada, uma compra recebida e alguns títulos financeiros).

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Abra http://localhost:3000 — você será redirecionado para `/login`.

**Login (mock local, não é autenticação real):**
- E-mail: `admin@padaria.com`
- Senha: `padaria123`

(credenciais configuráveis em `.env.local` via `NEXT_PUBLIC_APP_USER` / `NEXT_PUBLIC_APP_PASSWORD`)

Para reiniciar os dados de exemplo, limpe o `localStorage` do site no navegador
(DevTools → Application → Local Storage → limpar chaves `padaria_erp:*`) e recarregue.

## Setup do Supabase (quando for migrar para produção)

O schema completo já está pronto em `supabase/migrations/` — só não foi
executado ainda porque o projeto está em fase de validação local.

1. **Criar o projeto**: acesse [supabase.com](https://supabase.com), crie uma conta/organização e clique em "New Project". Anote a *Project URL* e a *anon key* (Settings → API).
2. **Rodar as migrations**: com a [Supabase CLI](https://supabase.com/docs/guides/cli) instalada:
   ```bash
   supabase login
   supabase link --project-ref <seu-project-ref>
   supabase db push   # aplica todos os arquivos de supabase/migrations em ordem
   ```
   Alternativamente, copie o conteúdo de cada arquivo `.sql` (em ordem de data no nome) e execute no SQL Editor do painel do Supabase.
3. **Rodar o seed inicial**: execute `supabase/seed.sql` no SQL Editor (cadastros base — produtos, clientes, insumos, fichas técnicas). Pedidos/remessa/compras/financeiro de exemplo podem ser portados de `src/lib/db/seed.ts` seguindo o mesmo padrão.
4. **Criar usuários de acesso**: no painel, Authentication → Users → "Invite user" para cada funcionário (não há cadastro público).
5. **Configurar variáveis de ambiente** (local e na Hostinger):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<seu-project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<sua-service-role-key>
   ```
6. **Trocar a implementação dos repositórios**: os arquivos em `src/lib/repositories/*.repo.ts` hoje usam `src/lib/db/local-store.ts`; substituir pelas chamadas ao `@supabase/ssr`/`supabase.rpc(...)` equivalentes (mesma assinatura de função, então os componentes React não precisam mudar). Ver `CONTEXT.md` para o mapeamento função a função.

## Deploy na Hostinger (Node.js)

Depois da migração para Supabase:
```bash
npm run build
npm run start   # ou configurar o processo Node via painel da Hostinger (ex: PM2/hPanel Node.js app)
```
Configure as variáveis de ambiente do passo 5 acima no painel da Hostinger antes de iniciar a aplicação.
