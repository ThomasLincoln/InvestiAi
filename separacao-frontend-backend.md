# Plano: Separação Frontend / Backend

Objetivo: o `frontend` deixa de falar diretamente com o Supabase para dados de negócio
(perfil, ativos, transações). Ele só mantém a **autenticação** (login Google via
Supabase Auth, obtenção de sessão/JWT e logout). Toda leitura/escrita de dados passa
a ser feita através do `backend` (FastAPI), que valida o JWT do Supabase e acessa o
Postgres.

Isso corresponde à seção **"Fase 2 — Backend e Integrações"** do `backlog.md`
(itens 2.1 e 2.3), então ao final desse trabalho essas checkboxes podem ser marcadas.

## Estado atual (o que existe hoje)

Chamadas diretas ao Supabase espalhadas pelo frontend:

| Arquivo | Chamada | Fica no frontend? |
|---|---|---|
| `welcome/login.tsx:40` | `supabase.auth.signInWithIdToken(...)` | ✅ sim (auth) |
| `components/ButtonLogOut.tsx:13` | `supabase.auth.signOut()` | ✅ sim (auth) |
| `routes/dashboard.tsx:13` | `supabase.auth.getSession()` | ✅ sim (auth) |
| `routes/dashboard.tsx:18` | `.from('perfil_pessoal').select(...)` | ❌ move para backend |
| `routes/wallet.tsx:40` | `.from('ativos_base').select('*')` | ❌ move para backend |
| `routes/wallet.tsx:45` | `supabase.auth.getUser()` | ✅ sim (auth, só para pegar o JWT) |
| `routes/wallet.tsx:47` | `.from('transacoes').select(...)` | ❌ move para backend |
| `components/AddInvestimentoComponent.tsx:43` | `supabase.auth.getSession()` | ✅ sim (auth, para pegar o JWT) |
| `components/AddInvestimentoComponent.tsx:58` | `.from('transacoes')` (insert) | ❌ move para backend |

Regra prática: se a chamada é `supabase.auth.*` → fica no frontend.
Se é `supabase.from(...)` (tabela de negócio) → vira um endpoint do backend.

`app/loader/loader.tsx` e `app/actions/action.tsx` já existem como *templates*
SSR de Supabase mas não estão conectados a nenhuma rota — podem ser removidos,
já que o SSR direto ao banco não fará mais sentido (isso passa a ser
responsabilidade do backend).

## Passo a passo

### 1. Estruturar o backend FastAPI

- [ ] Criar `backend/app/main.py` com uma instância FastAPI e CORS liberado para
      a origem do frontend (dev: `http://localhost:5173` ou porta do Vite).
- [ ] Criar `backend/requirements.txt` (fastapi, uvicorn, supabase-py ou
      psycopg2/asyncpg + PyJWT, python-dotenv).
- [ ] Criar `backend/app/config.py` com leitura de variáveis de ambiente
      (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` ou string de conexão Postgres,
      `SUPABASE_JWT_SECRET`).
- [ ] Criar `backend/.env.example` (nunca commitar o `.env` real).

### 2. Validar o JWT do Supabase no backend

O frontend continua fazendo login e guardando o `access_token` da sessão
Supabase (isso não muda). A cada requisição ao backend, o frontend manda esse
token no header `Authorization: Bearer <token>`.

- [ ] Criar `backend/app/auth.py` com uma dependency (`get_current_user`) que:
  - lê o header `Authorization`
  - decodifica/valida o JWT usando o `SUPABASE_JWT_SECRET` (HS256) — o Supabase
    assina os tokens de sessão com esse secret, então não é preciso chamar a
    API do Supabase a cada request, só validar localmente
  - extrai `sub` (user id) e devolve para os endpoints
- [ ] Toda rota de dados usa `Depends(get_current_user)` — se o token for
      inválido/expirado, retorna 401.

Isso implementa o item do backlog: *"Criar endpoints de autenticação (validar
JWT do Supabase)"* — não é um endpoint de login novo, é a validação do token
que o Supabase Auth já emite.

### 3. Migrar os endpoints de dados

Para cada tabela hoje acessada direto pelo frontend, criar um router equivalente:

- [ ] `GET /perfil` → substitui `dashboard.tsx` linha 18
      (`perfil_pessoal` filtrado por `user.id` do token)
- [ ] `GET /ativos` → substitui `wallet.tsx` linha 40 (`ativos_base`, catálogo)
- [ ] `GET /transacoes` → substitui `wallet.tsx` linha 47 (join com `Ativo`)
- [ ] `POST /transacoes` → substitui `AddInvestimentoComponent.tsx` linha 58 (insert)
- [ ] (backlog 2.3) `PUT/DELETE /transacoes/{id}` → para o item ainda pendente
      "Implementar edição e exclusão de transações"

Para acessar o Postgres do Supabase a partir do backend, duas opções:

- **Opção A (mais simples de migrar):** usar `supabase-py` com a
  `SUPABASE_SERVICE_ROLE_KEY` no backend — mesma sintaxe `.from(...)` que já
  existe no frontend, só troca de lugar.
- **Opção B (mais "backend puro"):** usar a connection string do Postgres
  direto (via `asyncpg`/SQLAlchemy) e aplicar RLS por `user.id` manualmente
  nas queries.

Recomendo a Opção A para essa primeira migração (menor risco, reaproveita
lógica existente), com a Opção B como evolução futura se quiser tirar a
dependência do SDK do Supabase no backend.

### 4. Trocar as chamadas no frontend por fetch ao backend

- [ ] Criar `frontend/app/lib/api.ts` com um client simples (`fetch` wrapper)
      que:
  - lê a `baseURL` do backend de uma env var (`VITE_API_URL`)
  - pega o token atual via `supabase.auth.getSession()`
  - injeta `Authorization: Bearer <token>` em toda chamada
- [ ] Trocar em `dashboard.tsx`, `wallet.tsx` e `AddInvestimentoComponent.tsx`
      as chamadas `supabase.from(...)` pelas chamadas equivalentes em `api.ts`
      (`api.get('/perfil')`, `api.get('/transacoes')`, `api.post('/transacoes', ...)`, etc).
- [ ] Manter apenas `supabase.auth.*` no frontend (login, logout, getSession,
      getUser).
- [ ] Remover `app/loader/loader.tsx` e `app/actions/action.tsx` (templates
      não usados de acesso direto ao banco via SSR).

### 5. Variáveis de ambiente

- [ ] Frontend: manter `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`
      (só para auth), adicionar `VITE_API_URL` apontando para o backend.
- [ ] Backend: `SUPABASE_JWT_SECRET` (validar token), credenciais de acesso ao
      Postgres (Opção A ou B do passo 3).
- [ ] Garantir que a `SUPABASE_SERVICE_ROLE_KEY` (se usada) **nunca** vá para o
      frontend — só existe no backend.

### 6. Atualizar a documentação

- [ ] Atualizar `frontend/docs/arquitetura.md` — remover `perfil_pessoal`,
      `ativos_base`, `ativos_na_carteira` da seção "Banco de Dados (Supabase)"
      do frontend e apontar para o backend.
- [ ] Atualizar `frontend/docs/autenticacao.md` — seção "Supabase Server-Side"
      deixa de existir (loader/action removidos); documentar o novo fluxo:
      frontend guarda o token de sessão → manda no header para o backend →
      backend valida.
- [ ] Marcar os itens correspondentes em `backlog.md` (seção 2.1 e 2.3).

## Ordem sugerida de execução

1. Passos 1 e 2 (backend sobe, valida token) — pode testar com `curl` mandando
   um token real de uma sessão logada.
2. Passo 3, endpoint por endpoint (`/perfil` primeiro, é o mais simples).
3. Passo 4, trocando uma tela por vez no frontend (dashboard → wallet → add
   investimento), testando cada uma antes de ir para a próxima.
4. Passos 5 e 6 por último, como limpeza.

Fazer endpoint-a-endpoint e tela-a-tela evita quebrar o app inteiro de uma vez
— cada etapa deixa o sistema funcional antes de seguir para a próxima.
