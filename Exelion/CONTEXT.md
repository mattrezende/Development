# Exelion — Documentação de Contexto

**Versão:** 1.0 — Gerado em 12/06/2026  
**Status:** Em desenvolvimento ativo

---

## Visão Geral do Produto

Exelion é uma plataforma SaaS para **professores particulares escalarem suas operações**. O professor cria uma conta, configura horários, preços e áreas de atendimento, e compartilha um link público (`/professor/:teacherId`) para que alunos se matrículem e paguem diretamente.

**Público-alvo:** Professores particulares que atendem individualmente ou em turmas.

**Principais funcionalidades:**
- Gestão de horários disponíveis (schedules)
- Matrículas de alunos com pagamento integrado (Mercado Pago)
- Gestão financeira (receitas, despesas, projeções)
- Análises e relatórios
- Áreas de atendimento por faixa de CEP
- Tabela de preços por tipo/quantidade de aula
- Painel de administração

---

## Arquitetura

```
Exelion/
├── apps/
│   ├── web/          # Frontend React (porta 5173 dev)
│   ├── api/          # Backend Express (porta 3001)
│   └── pocketbase/   # BaaS: banco + auth (porta 8090)
└── package.json      # Workspace root (concurrently)
```

**Fluxo de dados:**

```
Aluno → Frontend → API Express → PocketBase (SQLite)
                              ↘ Mercado Pago API
Mercado Pago → Webhook → API Express → PocketBase
Frontend → PocketBase (direto via proxy /hcgi/platform)
```

**Proxy reverso (produção):**
- `/hcgi/api/*` → API Express (porta 3001)
- `/hcgi/platform/*` → PocketBase (porta 8090)

---

## Stack Tecnológica

### Frontend (`apps/web`)

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | React | 18.3.1 |
| Build | Vite | 7.3.1 |
| Roteamento | React Router DOM | 7.13.0 |
| Styling | Tailwind CSS | 3.4.17 |
| UI Components | Radix UI | 55 componentes |
| Formulários | React Hook Form + Zod | 7.71.2 + 4.3.6 |
| Gráficos | Recharts | 2.15.4 |
| Exportação | PapaParse (CSV), jsPDF (PDF) | — |
| Animações | Framer Motion | 11.15.0 |
| Notificações | Sonner | 2.0.7 |
| Datas | date-fns | 4.1.0 |
| Ícones | Lucide React | 0.469.0 |

### Backend (`apps/api`)

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Runtime | Node.js | 18+ (ES Modules) |
| Framework | Express | 5.0.1 |
| Segurança | Helmet, CORS | — |
| Logging | Logger customizado | — |
| Rate Limiting | express-rate-limit | 8.3.1 |
| Pagamentos | MercadoPago SDK | 2.0.0 |
| DB Client | PocketBase SDK | 0.26.8 |
| Process | PM2 | — |

### Database/Auth (`apps/pocketbase`)

| Aspecto | Detalhe |
|---------|---------|
| BaaS | PocketBase 0.26.x |
| Database | SQLite |
| Auth | Teachers collection (built-in) |
| Hooks | 10 hooks JS customizados |
| Migrations | 59 migrations aplicadas |

---

## Rotas do Frontend

| Rota | Componente | Auth |
|------|-----------|------|
| `/` | HomePage | ❌ |
| `/login` | LoginPage | ❌ |
| `/signup` | SignupPage | ❌ |
| `/password-reset` | PasswordResetPage | ❌ |
| `/professor/:teacherId` | PublicProfilePage | ❌ |
| `/enrollment-success/:enrollmentId` | EnrollmentSuccessPage | ❌ |
| `/enrollment-failed` | EnrollmentFailedPage | ❌ |
| `/dashboard` | DashboardPage | ✅ |
| `/schedules` | SchedulesPage | ✅ |
| `/enrollments` | EnrollmentsPage | ✅ |
| `/students` | StudentsPage | ✅ |
| `/financial-management` | FinancialManagementPage | ✅ |
| `/analytics` | AnalyticsPage | ✅ |
| `/reports` | ReportsPage | ✅ |
| `/service-areas` | ServiceAreasPage | ✅ |
| `/pricing` | PricingPage | ✅ |
| `/terms` | TermsPage | ✅ |
| `/settings` | SettingsPage | ✅ |
| `/admin` | AdminPage | ✅ |

---

## Endpoints da API (`/hcgi/api`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Health check básico |
| GET | `/status` | Status detalhado do servidor |
| POST | `/enrollments/create` | Cria matrícula + preferência Mercado Pago |
| GET | `/enrollments/debug` | Debug de conexões (dev only) |
| POST | `/mercado-pago/create-preference` | Cria preferência de pagamento |
| POST | `/mercado-pago/webhook` | Recebe notificações do Mercado Pago |
| GET | `/mercado-pago/payment-status/:id` | Consulta status de pagamento |
| POST | `/admin/restart-backend` | Reinicia o processo via PM2 |
| GET | `/admin/validate-backend` | Valida endpoints local e remoto |
| GET | `/admin/backend-status` | Status do processo na porta 3001 |

---

## Coleções do PocketBase

| Coleção | Descrição |
|---------|-----------|
| `teachers` | Professores (collection de auth) |
| `students` | Alunos cadastrados |
| `schedules` | Horários disponíveis (`Disponível` / `Reservado` / `Ocupado`) |
| `enrollments` | Matrículas com status de pagamento |
| `pricing` | Tabelas de preço por tipo e quantidade |
| `service_areas` | Faixas de CEP atendidas por professor |
| `expenses` | Despesas do professor |
| `expense_categories` | Categorias de despesa |
| `notifications` | Notificações internas |
| `terms_and_conditions` | Termos e condições por professor |

---

## Hooks do PocketBase (`apps/pocketbase/pb_hooks/`)

Os hooks são scripts JS executados diretamente no PocketBase:

1. **onEnrollmentCreate** — notifica professor ao criar matrícula
2. **onEnrollmentUpdate** — atualiza schedule quando pagamento aprovado
3. **onScheduleUpdate** — sincroniza estado de disponibilidade
4. **onTeacherCreate** — setup inicial do perfil do professor
5. **onStudentCreate** — normaliza dados do aluno
6. **onExpenseCreate** — categoriza despesa automaticamente
7. **onNotificationCreate** — envia notificação por email
8. **onPricingUpdate** — invalida cache de preços
9. **onServiceAreaUpdate** — atualiza cobertura geográfica
10. **onTermsCreate** — vincula T&C ao professor

---

## Fluxo de Pagamento

```
1. Aluno acessa /professor/:teacherId
2. Seleciona horário disponível (schedule)
3. Preenche dados e clica "Matricular"
4. Frontend → POST /hcgi/api/enrollments/create
5. API verifica disponibilidade do schedule
6. API atualiza schedule para "Reservado" (timeout 10min)
7. API cria enrollment com status "pending"
8. API cria preferência no Mercado Pago
9. API retorna preferenceId + initPoint
10. Frontend redireciona para checkout do Mercado Pago
11. Aluno paga
12. Mercado Pago → POST /hcgi/api/mercado-pago/webhook
13. API valida assinatura (HMAC-SHA256)
14. API atualiza enrollment com status final
15. Se aprovado: schedule → "Ocupado", timeout cancelado
16. Se rejeitado: schedule → "Disponível", timeout cancelado
17. Aluno redirecionado para /enrollment-success/:id ou /enrollment-failed
```

---

## Variáveis de Ambiente

### `apps/api/.env`

```env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://exelion.com.br

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...
MERCADO_PAGO_PUBLIC_KEY=APP_USR-...
MERCADO_PAGO_WEBHOOK_SECRET=       # Chave secreta do webhook (configurar no painel MP)

# PocketBase
POCKETBASE_URL=http://localhost:8090
PB_SUPERUSER_EMAIL=                # Email do superusuário PocketBase
PB_SUPERUSER_PASSWORD=             # Senha do superusuário PocketBase

# URLs
WEBHOOK_URL=https://exelion.com.br
FRONTEND_URL=https://exelion.com.br
```

---

## Estrutura de Arquivos

```
apps/
├── api/
│   ├── src/
│   │   ├── main.js                     # Entry point Express
│   │   ├── constants/common.js         # Constantes compartilhadas
│   │   ├── middleware/
│   │   │   ├── error.js               # Error handler global
│   │   │   └── global-rate-limit.js   # Rate limiting global
│   │   ├── routes/
│   │   │   ├── index.js               # Router principal
│   │   │   ├── enrollments.js         # Matrículas
│   │   │   ├── mercado-pago.js        # Pagamentos
│   │   │   ├── health-check.js        # Health check handler
│   │   │   └── admin.js              # Administração
│   │   └── utils/
│   │       ├── logger.js             # Logger customizado
│   │       └── pocketbaseClient.js   # Client PocketBase (superuser)
│   ├── .env                          # Variáveis de ambiente
│   ├── ecosystem.config.js           # Config PM2
│   └── package.json
│
├── web/
│   ├── src/
│   │   ├── App.jsx                   # Router principal + layout
│   │   ├── main.jsx                  # Entry point React
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx       # Autenticação (PocketBase)
│   │   │   └── MobileMenuContext.jsx # Menu mobile
│   │   ├── pages/                    # Uma page por rota
│   │   ├── components/
│   │   │   ├── ui/                   # 55 componentes Radix UI
│   │   │   ├── public/               # Componentes do perfil público
│   │   │   ├── financial/            # Módulo financeiro
│   │   │   └── home/                 # Seções da landing page
│   │   ├── hooks/
│   │   │   ├── usePriceCalculator.js # Cálculo de preços
│   │   │   └── usePaymentStatus.js   # Polling de status de pagamento
│   │   └── lib/
│   │       ├── pocketbaseClient.js   # Client PocketBase (frontend)
│   │       ├── apiServerClient.js    # Client da API backend
│   │       └── i18n.js              # Internacionalização
│   ├── vite.config.js               # Config Vite + proxy
│   └── tailwind.config.js
│
└── pocketbase/
    ├── pb_hooks/                     # 10 hooks JS
    ├── pb_migrations/               # 59 migrations
    └── pb_data/                     # Banco SQLite (gitignored)
```

---

## Bugs Conhecidos

| Severidade | Bug | Arquivo | Status |
|-----------|-----|---------|--------|
| 🔴 Crítico | `routes/index.js` não monta enrollments, mercado-pago, admin | `routes/index.js` + `main.js` | Corrigido |
| 🔴 Crítico | Webhook Mercado Pago não valida assinatura HMAC-SHA256 | `routes/mercado-pago.js:179` | Corrigido |
| 🔴 Crítico | Race condition na reserva de horário (check e update separados) | `routes/mercado-pago.js:72-83` | Corrigido |
| 🔴 Crítico | `.env` sem `PB_SUPERUSER_EMAIL` e `PB_SUPERUSER_PASSWORD` | `apps/api/.env` | Corrigido |
| 🟠 Alto | `logger.error()` envia para stdout ao invés de stderr | `utils/logger.js:4` | Corrigido |
| 🟠 Alto | `global.reservationTimeouts` sem limite de memória | `routes/mercado-pago.js:101` | Corrigido |
| 🟡 Médio | Ausência de testes automatizados | — | Pendente |
| 🟡 Médio | Excesso de `console.log` em produção (logging) | Toda a API | Pendente |
| 🟡 Médio | Sem TypeScript (sem type safety) | Toda a codebase | Pendente |
| 🟢 Baixo | `console.warn` desabilitado no Vite config | `vite.config.js:274` | Pendente |

---

## Dívidas Técnicas

| Prioridade | Item | Estimativa |
|-----------|------|-----------|
| Alta | Implementar testes com Vitest/Jest | ~15h |
| Alta | Migrar para TypeScript | ~20h |
| Alta | Substituir console.log por logger estruturado (Winston/Pino) | ~4h |
| Média | Implementar cache (Redis) para sessions e queries frequentes | ~6h |
| Média | Documentação OpenAPI/Swagger para a API | ~4h |
| Média | Rate limiting no endpoint `/webhook` | ~1h |
| Baixa | Validar env vars críticas no startup da API | ~1h |
| Baixa | Criar `.env.example` com todas as variáveis necessárias | ~30min |

---

## Execução em Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar todos os serviços simultaneamente
npm run dev

# Serviços individuais
npm run dev:web        # Frontend em http://localhost:5173
npm run dev:api        # API em http://localhost:3001
npm run dev:pocketbase # PocketBase em http://localhost:8090
```

## Deploy (Produção)

- API gerenciada por PM2 (`ecosystem.config.js`)
- PocketBase como processo separado
- Proxy reverso (nginx ou equivalente) roteia `/hcgi/api` e `/hcgi/platform`
- Domain: `https://exelion.com.br`
