# Rotas

## Mapa de Rotas

```
/                         → home.tsx (Login)
/dashboard                → dashboard.tsx (Layout)
/dashboard/               → dashboardInicio.tsx (Painel)
/dashboard/wallet         → wallet.tsx (Carteira)
/dashboard/settings       → settings.tsx (Configuracoes)
```

## Definicao (`app/routes.ts`)

```ts
export default [
    index("routes/home.tsx"),
    route("dashboard", "routes/dashboard.tsx", [
        index("routes/dashboardInicio.tsx"),
        route("settings", "routes/settings.tsx"),
        route("wallet", "routes/wallet.tsx"),
    ]),
] satisfies RouteConfig;
```

## Detalhamento

### `/` - Home (Login)

| Propriedade | Valor |
|-------------|-------|
| Arquivo | `app/routes/home.tsx` |
| Loader | Server-side (`loader`) — injeta `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` |
| Componente renderizado | `Login` (`app/welcome/login.tsx`) |
| Autenticacao | Publica |

### `/dashboard` - Layout do Dashboard

| Propriedade | Valor |
|-------------|-------|
| Arquivo | `app/routes/dashboard.tsx` |
| Loader | Client-side (`clientLoader`) — busca sessao e perfil do usuario |
| Outlet Context | `{ user: User }` |
| Componentes | `SideBarComponent`, `Outlet` |
| Autenticacao | Requer sessao ativa |

### `/dashboard/` - Painel Inicial

| Propriedade | Valor |
|-------------|-------|
| Arquivo | `app/routes/dashboardInicio.tsx` |
| Dados | Recebe `user` via `useOutletContext` |
| Componentes | `PatrimonioTotal` |

### `/dashboard/wallet` - Carteira

| Propriedade | Valor |
|-------------|-------|
| Arquivo | `app/routes/wallet.tsx` |
| Loader | Server-side — injeta env vars |
| Dados carregados | `ativos_base` (todos os ativos), `ativos_na_carteira` (do usuario) |
| Componentes | `AddInvestimento`, `Ativos` |

### `/dashboard/settings` - Configuracoes

| Propriedade | Valor |
|-------------|-------|
| Arquivo | `app/routes/settings.tsx` |
| Loader | Server-side — injeta env vars |
| Dados | Recebe `user` via `useOutletContext` |
| Funcionalidades | Edicao de nome, visualizacao de email |
