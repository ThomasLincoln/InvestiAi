# InvestiAi - Frontend

Plataforma de gestao de investimentos pessoais com autenticacao via Google e integracao com Supabase.

## Indice da Documentacao

| Documento | Descricao |
|-----------|-----------|
| [Arquitetura](./arquitetura.md) | Visao geral da estrutura do projeto, stack e decisoes tecnicas |
| [Rotas](./rotas.md) | Mapeamento de rotas, loaders e fluxo de navegacao |
| [Componentes](./componentes.md) | Catalogo dos componentes React com props, estado e uso |
| [Autenticacao](./autenticacao.md) | Fluxo de login com Google e gerenciamento de sessao |
| [Guia de Contribuicao](./contribuicao.md) | Como rodar o projeto, padroes de codigo e convencoes |

## Inicio Rapido

```bash
# Instalar dependencias
npm install

# Configurar variaveis de ambiente
cp .env.example .env

# Rodar em desenvolvimento
npm run dev
```

## Stack

| Tecnologia | Versao | Uso |
|------------|--------|-----|
| React | 19 | UI |
| React Router | 7.15 | Roteamento SSR/CSR |
| Supabase | 2.x | Auth, banco de dados |
| Tailwind CSS | 4.x | Estilizacao |
| Lucide React | 1.x | Icones |
| TypeScript | 5.x | Tipagem |

## Variaveis de Ambiente

| Variavel | Descricao | Obrigatoria |
|----------|-----------|:-----------:|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | Sim |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave publica (anon key) do Supabase | Sim |
