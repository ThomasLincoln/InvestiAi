# Arquitetura

## Visao Geral

O projeto utiliza **React Router v7** no modo framework (SSR + CSR hibrido), com **Supabase** como backend-as-a-service para autenticacao e persistencia.

```
frontend/
├── app/
│   ├── root.tsx              # Layout raiz (HTML, fontes, scripts)
│   ├── routes.ts             # Definicao das rotas
│   ├── app.css               # Estilos globais (Tailwind)
│   ├── types.tsx             # Tipos compartilhados
│   ├── routes/
│   │   ├── home.tsx          # Pagina inicial (login)
│   │   ├── dashboard.tsx     # Layout do dashboard (sidebar + outlet)
│   │   ├── dashboardInicio.tsx  # Pagina principal do dashboard
│   │   ├── wallet.tsx        # Gestao de ativos/carteira
│   │   └── settings.tsx      # Configuracoes do usuario
│   ├── components/
│   │   ├── AddInvestimentoComponent.tsx  # Modal de novo lancamento
│   │   ├── InputCurrency.tsx            # Input de valor monetario
│   │   ├── ComboBoxAtivo.tsx            # Seletor de ativos
│   │   ├── Ativos.tsx                   # Tabela de ativos na carteira
│   │   ├── PatrimonioTotal.tsx          # Card de patrimonio
│   │   ├── SideBarComponent.tsx         # Sidebar de navegacao
│   │   ├── SearchComponent.tsx          # Busca de ativos
│   │   └── ButtonLogOut.tsx             # Botao de logout
│   ├── welcome/
│   │   └── login.tsx         # Tela de login com Google
│   ├── loader/
│   │   └── loader.tsx        # Loader server-side base (Supabase SSR)
│   └── actions/
│       └── action.tsx        # Action server-side base (Supabase SSR)
├── docs/                     # Esta documentacao
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Decisoes Tecnicas

### Renderizacao

- **`home.tsx`**: usa `loader` server-side (SSR) para injetar env vars de forma segura.
- **`dashboard.tsx`**: usa `clientLoader` (CSR) para carregar sessao e perfil no browser via Supabase client.
- **Rotas filhas do dashboard**: recebem dados do pai via `useOutletContext`.

### Estilizacao

- Componentes mais recentes (modal, inputs) usam **Tailwind CSS** com classes utilitarias.
- Componentes mais antigos (sidebar, settings, patrimonio) usam **inline styles** — candidatos a migracao.
- Icones: **Lucide React** nos componentes novos, **Material Icons** (Google Fonts) nos antigos.

### Gerenciamento de Estado

- Estado local com `useState` por componente.
- Nao ha gerenciamento de estado global (Context, Redux, Zustand).
- Componentes de formulario sao **controlados**: o estado vive no componente pai (`AddInvestimento`) e e passado via props.

### Banco de Dados (Supabase)

| Tabela | Uso |
|--------|-----|
| `perfil_pessoal` | Dados do usuario (nome, email, foto, saldo) |
| `ativos_base` | Catalogo de ativos disponiveis |
| `ativos_na_carteira` | Ativos do usuario com quantidade e referencia ao ativo |
