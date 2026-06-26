# Autenticacao

## Visao Geral

O InvestiAi utiliza **Google Sign-In** como unico provedor de autenticacao, gerenciado pelo **Supabase Auth**.

## Fluxo de Login

```
Usuario abre /
    │
    ▼
home.tsx (loader server-side)
    │  injeta VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY
    │
    ▼
Login (welcome/login.tsx)
    │  renderiza botao do Google Sign-In
    │
    ▼
Usuario clica em "Continue with Google"
    │
    ▼
Google retorna credential (ID Token)
    │
    ▼
supabase.auth.signInWithIdToken({ provider: 'google', token })
    │
    ├── Sucesso → navigate('/dashboard')
    └── Erro → console.error
```

## Fluxo de Sessao no Dashboard

```
Usuario acessa /dashboard
    │
    ▼
dashboard.tsx (clientLoader)
    │  supabase.auth.getSession()
    │  supabase.from('perfil_pessoal').select(...)
    │
    ▼
Passa { user } via Outlet Context
    │
    ▼
Rotas filhas acessam via useOutletContext()
```

## Logout

1. O `ButtonLogOut` recebe a instancia do Supabase via props.
2. Chama `supabase.auth.signOut()`.
3. Redireciona para `/` via `navigate("/")`.

## Configuracao do Google Sign-In

O Google Client ID esta definido diretamente em `welcome/login.tsx`:

```
GOOGLE_CLIENT_ID = "311352397706-..."
```

O script do Google Identity Services e carregado no `root.tsx`:

```html
<script src="https://accounts.google.com/gsi/client" async></script>
```

## Supabase Server-Side

Os arquivos `app/loader/loader.tsx` e `app/actions/action.tsx` contem a configuracao base para acessar o Supabase no server-side com gerenciamento de cookies. Atualmente servem como template e nao estao conectados a nenhuma rota.

## Tabela de Referencia

| Componente/Arquivo | Responsabilidade |
|--------------------|-----------------|
| `welcome/login.tsx` | Renderiza botao Google, processa credential |
| `routes/dashboard.tsx` | Verifica sessao, carrega perfil |
| `components/ButtonLogOut.tsx` | Encerra sessao |
| `loader/loader.tsx` | Template de loader SSR com Supabase |
| `actions/action.tsx` | Template de action SSR com Supabase |
