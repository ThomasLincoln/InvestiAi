# Guia de Contribuicao

## Pre-requisitos

- Node.js 18+
- npm 9+
- Conta no [Supabase](https://supabase.com) com projeto configurado

## Setup do Projeto

```bash
# 1. Clonar o repositorio
git clone <url-do-repo>
cd frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variaveis de ambiente
# Criar arquivo .env na raiz com:
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-anon-key

# 4. Rodar em desenvolvimento
npm run dev

# 5. Verificar tipos
npm run typecheck

# 6. Build de producao
npm run build
```

## Scripts Disponiveis

| Script | Comando | Descricao |
|--------|---------|-----------|
| `dev` | `react-router dev` | Servidor de desenvolvimento com HMR |
| `build` | `react-router build` | Build de producao |
| `start` | `react-router-serve ./build/server/index.js` | Serve o build de producao |
| `typecheck` | `react-router typegen && tsc` | Gera tipos das rotas e verifica tipagem |

## Convencoes de Codigo

### Estrutura de Arquivos

| Tipo | Diretorio | Convencao de nome |
|------|-----------|-------------------|
| Rotas | `app/routes/` | `camelCase.tsx` (ex: `dashboardInicio.tsx`) |
| Componentes | `app/components/` | `PascalCase.tsx` (ex: `InputCurrency.tsx`) |
| Tipos | `app/types.tsx` | Arquivo unico compartilhado |
| Loaders SSR | `app/loader/` | `loader.tsx` |
| Actions SSR | `app/actions/` | `action.tsx` |

### Estilizacao

- Usar **Tailwind CSS** para novos componentes.
- Evitar inline styles em codigo novo.
- Tema escuro: usar classes como `bg-gray-800/60`, `border-gray-700/50`, `text-white`.
- Cor de destaque: familia `violet` (ex: `bg-violet-600`, `text-violet-400`).
- Border radius padrao: `rounded-xl` para inputs/cards, `rounded-2xl` para modais.

### Componentes

- Componentes de formulario devem ser **controlados** (receber `value` e `onChange` via props).
- Usar **Lucide React** para icones em componentes novos.
- Nomear estados e funcoes em **portugues** quando fizer sentido no dominio (ex: `moedaSelecionada`, `selecionarMoeda`).

### TypeScript

- Definir interfaces/types para todas as props de componentes.
- Exportar tipos reutilizaveis de `app/types.tsx`.
- Preferir `type` sobre `interface` para props simples.

## Tipos Compartilhados (`app/types.tsx`)

```ts
interface User {
    fullname: string;
    email: string;
    picture: string;
    saldo: number;
}

interface Ativo {
    id?: string;
    ticker: string;
    nome: string;
    quantidade?: number;
}
```

## Adicionar uma Nova Rota

1. Criar o arquivo em `app/routes/nova-rota.tsx`.
2. Registrar em `app/routes.ts`:
   ```ts
   route("nova-rota", "routes/nova-rota.tsx"),
   ```
3. Se for filha do dashboard, aninhar dentro do `route("dashboard", ...)`.
4. Adicionar link na `SideBarComponent.tsx` se necessario.

## Adicionar um Novo Componente

1. Criar em `app/components/NomeDoComponente.tsx`.
2. Definir interface de props tipada.
3. Usar Tailwind para estilizacao.
4. Documentar neste guia em `docs/componentes.md`.
