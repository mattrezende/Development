# Bosque de Francisco — Contexto do Projeto

Site institucional do "Bosque de Francisco" (conteúdo de fitoterapia/saúde: postagens/artigos
e eventos/aulas), com painel administrativo protegido por login para gerenciar o conteúdo.

Gerado originalmente pelo builder **Hostinger Horizons** (ver `apps/web/index.html`,
`apps/web/plugins/visual-editor/*`, `apps/web/vite.config.js`) — por isso o projeto tem um monorepo
com scripts/plugins de dev exclusivos do builder (editor visual inline, hot-reload de erros para o
iframe do editor, "session journal" etc.) que não têm função em produção fora do ambiente Horizons.

> **Migração concluída (2026-08-22)**: o backend original era 100% PocketBase (dados + auth +
> arquivos, consumido direto do browser via SDK). Foi substituído por uma API própria em
> Node/Express + MongoDB (Mongoose), descrita abaixo. A seção "Histórico" no fim deste arquivo
> documenta os bugs encontrados na auditoria original e o que foi corrigido na migração.

## Estrutura

```
Bosque/
├── apps/
│   ├── web/    # Frontend React 18 + Vite
│   │   └── src/
│   │       ├── pages/       HomePage, PostagensPage, LoginPage, AdminDashboard
│   │       ├── components/  Header, Footer, EventCard/Form, PostCard/Form/Modal, ...
│   │       ├── components/ui/  shadcn/ui (Radix + Tailwind), gerado, não editar à mão
│   │       ├── contexts/AuthContext.jsx   estado de auth (token JWT + usuário)
│   │       └── lib/apiClient.js           cliente HTTP fino (fetch) para a API própria
│   └── api/    # Backend próprio: Node + Express + Mongoose (MongoDB)
│       └── src/
│           ├── server.js / app.js     bootstrap e app Express
│           ├── config/db.js           conexão com o MongoDB
│           ├── models/                User, Evento, Postagem (schemas Mongoose)
│           ├── routes/ + controllers/ auth, eventos, postagens
│           ├── middleware/auth.js     valida JWT (Bearer) nas rotas protegidas
│           ├── storage/local.js       upload/URL/remoção de imagens (disco local, abstraído)
│           └── scripts/createAdmin.js CLI para criar/resetar a conta do painel (sem self-signup)
├── package.json  workspace root (npm workspaces), orquestra `dev`/`build`/`start` dos dois apps
└── knip.json     config do knip (detector de código morto) — template genérico do Horizons,
                   ainda lista caminhos de variantes que este projeto nunca teve (ex.: pocketbase);
                   não é usado no build, pode ser revisado depois se o lint de código morto for
                   incorporado ao CI.
```

O frontend não fala mais diretamente com um banco de dados: toda leitura/escrita passa pela API
própria (`apps/api`) via `fetch`, autenticada com um JWT enviado no header `Authorization: Bearer`.

## Stack

- **Frontend**: React 18, React Router 7, Vite 7, Tailwind + shadcn/ui (Radix), framer-motion,
  react-hook-form + zod (instalados mas ainda não usados nos formulários — ver Histórico #6),
  sonner (toasts), date-fns, react-helmet (meta tags).
- **Backend**: Node.js 22 + Express 4 + Mongoose 8 (MongoDB), JWT (`jsonwebtoken`) para sessão do
  admin, `bcryptjs` para hash de senha, `multer` (v2) para upload multipart das imagens.
- **Banco de dados**: MongoDB (recomendado: cluster Atlas, inclusive em dev — ver "Rodando local").
- **Storage de imagens**: disco local do servidor da API (`apps/api/uploads/`), servido em
  `/uploads/...`, com a camada isolada em `apps/api/src/storage/local.js`. Se o host de produção
  não tiver disco persistente (ex. serverless), essa é a peça a trocar por um provedor externo
  (S3-compatible, Cloudinary etc.) — só esse arquivo precisa mudar, o resto da API já consome
  `filesToImagens`/`deleteImagens`/`urlFor` como interface.

## Modelo de dados (MongoDB / Mongoose)

### `User` (`apps/api/src/models/User.js`)
`email` (único), `passwordHash`. Sem rota de self-signup — a única forma de criar/redefinir a
conta admin é via `npm run create-admin` (ver abaixo), equivalente ao que antes era feito
manualmente no admin do PocketBase.

### `Evento` (`apps/api/src/models/Evento.js`)
`titulo` (obrigatório), `subtitulo`, `data` (Date, obrigatório), `horario` (obrigatório),
`local` (obrigatório), `createdAt`/`updatedAt` automáticos.

### `Postagem` (`apps/api/src/models/Postagem.js`)
`titulo` (obrigatório), `subtitulo`, `conteudo` (HTML, até 50000 chars, obrigatório),
`imagens: [{ filename, url }]` (até 10, validado no upload — jpeg/png/gif/webp, 20MB cada),
`createdAt`/`updatedAt` automáticos.

> **Nomes de campo**: o campo antigo `criado_em` do PocketBase virou o `createdAt` padrão do
> Mongoose em todo lugar (models, rotas de sort, componentes do frontend). Não há mais distinção
> entre um campo de negócio "criado_em" e o `created` de sistema do PB — é só `createdAt`.

## API (`apps/api`)

Todas as rotas sob `/api`. Leitura de `eventos`/`postagens` é pública; criar/editar/excluir exige
`Authorization: Bearer <token>`.

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/api/auth/login` | não | `{ email, password }` → `{ token, user }` |
| GET | `/api/auth/me` | sim | usuário da sessão atual (usado para restaurar login no boot do app) |
| GET | `/api/eventos?sort=data\|-data` | não | lista eventos |
| POST/PUT/DELETE | `/api/eventos[/:id]` | sim | CRUD de eventos (JSON) |
| GET | `/api/postagens?sort=-createdAt` | não | lista postagens |
| POST/PUT/DELETE | `/api/postagens[/:id]` | sim | CRUD de postagens (multipart; campo de arquivo `imagens`) |

`PUT /api/postagens/:id` **adiciona** novas imagens enviadas às já existentes (mesmo comportamento
que o PocketBase tinha por padrão) — não há endpoint para remover uma imagem específica, porque
essa funcionalidade também não existia na UI antes da migração.

## Fluxo de autenticação

`AuthContext` (`apps/web/src/contexts/AuthContext.jsx`) guarda o token JWT em `localStorage`
(`apiClient.js`) e, no boot do app, chama `GET /api/auth/me` para validar a sessão no servidor
(diferente do PocketBase original, que só checava a expiração local do token — ver Histórico #3,
corrigido nesta migração). `ProtectedRoute` continua redirecionando para `/login` quando não
autenticado; ainda não há diferenciação de papéis (qualquer conta em `User` tem acesso total ao
`/admin` — ver Histórico #4, mantido como estava).

## Rodando local / variáveis de ambiente

1. **MongoDB**: crie um cluster gratuito no [MongoDB Atlas](https://www.mongodb.com/atlas) e pegue
   a connection string (era a opção escolhida para dev, já que a máquina não tem Docker para rodar
   Mongo localmente).
2. Copie `apps/api/.env.example` → `apps/api/.env` e preencha `MONGODB_URI` e `JWT_SECRET`
   (qualquer string longa aleatória).
3. Copie `apps/web/.env.example` → `apps/web/.env` (aponta para `http://localhost:8090` por padrão).
4. `npm install` na raiz (workspaces cobrem `apps/web` e `apps/api`).
5. Crie a conta do painel admin (não existe self-signup):
   `ADMIN_EMAIL=voce@exemplo.com ADMIN_PASSWORD=senha-forte npm run create-admin`
6. `npm run dev` na raiz sobe os dois apps (`apps/web` na porta 3000, `apps/api` na porta 8090).

## Pontos de atenção para o deploy

- Em produção, `apps/api` precisa de disco persistente para `uploads/` enquanto o storage local
  estiver em uso (não é serverless-friendly como está hoje).
- Configure `CORS_ORIGIN` (na API) com o domínio real do frontend em produção, e `VITE_API_URL`
  (no frontend) com a URL pública da API.
- O antigo proxy `/hcgi/platform` (específico da infraestrutura Hostinger Horizons/PocketBase) não
  existe mais — a API é um serviço HTTP normal, acessível pela URL configurada em `VITE_API_URL`.
- `.gitignore` na raiz e em `apps/api` cobrem `node_modules`, `.env` e `apps/api/uploads/`.

---

# Histórico — auditoria da versão PocketBase (2026-08-22)

Levantamento feito antes da migração, para referência. Itens já corrigidos estão marcados.

## 1. 🔴 CRÍTICO — `HomePage.jsx` estava corrompida e quebrava a Home inteira — **CORRIGIDO**
O componente tinha um `useEffect` aninhado dentro de outro `useEffect` (chamada de hook fora de
posição, violando as Regras dos Hooks) e usava `filteredPostagens`, `postagens`, `searchQuery` e
`handlePostClick` sem declará-los — sobras de um copy/paste malformado do `PostagensPage.jsx`. A
página inicial lançava `Invalid hook call` / `ReferenceError` assim que os eventos terminavam de
carregar. Corrigido reescrevendo `HomePage.jsx` para conter só a lógica de eventos, como era a
intenção original (a seção de postagens nunca deveria estar ali).

## 2. 🟡 XSS armazenado potencial via `conteudo` das postagens — **mantido, não é regressão da migração**
`PostModal.jsx` renderiza `post.conteudo` com `dangerouslySetInnerHTML`, e o `conteudo` é HTML
digitado livremente pelo admin (o próprio `PostForm` sugere isso na dica de ajuda). O risco
continua o mesmo de antes: só admins autenticados escrevem postagens, mas nada sanitiza esse HTML
nem no frontend nem na API nova. Vale considerar `DOMPurify` (ou editor WYSIWYG com HTML
controlado) numa próxima iteração — a API nova é o lugar natural pra adicionar essa sanitização
centralizada, já que hoje ela aceita `conteudo` como texto livre sem tratamento.

## 3. 🟡 Sessão não era revalidada contra o servidor — **CORRIGIDO na migração**
O `AuthContext` original só conferia a expiração local do token (`pb.authStore.isValid`). Agora,
no boot, o app chama `GET /api/auth/me`; se o token foi revogado ou o usuário não existe mais, a
sessão é limpa automaticamente.

## 4. 🟢 Sem controle de papéis/role no admin — **mantido, fora do escopo desta migração**
Qualquer conta em `User` tem acesso irrestrito a `/admin`. Aceitável pelo tamanho do projeto (só
uma conta admin), mas registrado caso o projeto cresça.

## 5. 🟢 Ausência de `.gitignore` — **CORRIGIDO na migração**
Adicionado `.gitignore` na raiz e em `apps/api` (cobrindo `node_modules`, `.env`, `apps/api/uploads/`).
Não havia dados reais em risco — o `pb_data/data.db` do PocketBase estava vazio (0 registros em
`users`/`eventos`/`postagens`), confirmado antes de remover `apps/pocketbase`.

## 6. 🟢 Formulários sem `react-hook-form`/`zod` apesar de instalados — **mantido, fora do escopo desta migração**
`EventForm`/`PostForm` continuam validando só via atributos HTML (`required`, `minLength`). Como a
API agora também não valida além do `required` do Mongoose, padronizar esses formulários com
`react-hook-form` + `zod` (já presentes no `package.json`) é uma boa próxima melhoria — inclusive
para dar mensagens de erro melhores que os retornos crus da API.
