# Componentes

## Indice

- [AddInvestimento](#addinvestimento)
- [InputCurrency](#inputcurrency)
- [ComboboxAtivo](#comboboxativo)
- [Ativos](#ativos)
- [PatrimonioTotal](#patrimoniototal)
- [SideBarComponent](#sidebarcomponent)
- [SearchComponent](#searchcomponent)
- [ButtonLogOut](#buttonlogout)

---

## AddInvestimento

Modal para registrar uma nova operacao de investimento. Centraliza o estado de todo o formulario.

**Arquivo:** `app/components/AddInvestimentoComponent.tsx`

### Props

| Prop | Tipo | Descricao |
|------|------|-----------|
| `items` | `Ativo[]` | Lista de ativos disponiveis para selecao |

### Estado Interno

| Estado | Tipo | Descricao |
|--------|------|-----------|
| `isOpen` | `boolean` | Controla visibilidade do modal |
| `ativo` | `Ativo \| null` | Ativo selecionado |
| `quantidade` | `number` | Quantidade de cotas/acoes |
| `dataAquisicao` | `string` | Data da compra (formato `YYYY-MM-DD`) |
| `precoUnitario` | `number` | Preco por unidade |
| `valorTotal` | `number` | Valor total da operacao |
| `moeda` | `Moeda` | Moeda selecionada (BRL, USD) |

### Comportamento

- Ao abrir o modal, todos os campos iniciam zerados.
- Ao fechar (botao X ou "Cancelar"), o formulario e resetado via `resetForm()`.
- O `handleSubmit` coleta todos os valores e loga no console (pronto para integracao com backend).
- A moeda e compartilhada entre os dois `InputCurrency` (preco unitario e valor total).

### Uso

```tsx
<AddInvestimento items={ativos} />
```

---

## InputCurrency

Input monetario com prefixo de simbolo (R$, $), formatacao com virgula e seletor de moeda.

**Arquivo:** `app/components/InputCurrency.tsx`

### Props

| Prop | Tipo | Descricao |
|------|------|-----------|
| `valor` | `number` | Valor numerico atual |
| `moeda` | `Moeda` | Moeda selecionada |
| `onValorChange` | `(valor: number) => void` | Callback ao alterar o valor |
| `onMoedaChange` | `(moeda: Moeda) => void` | Callback ao trocar a moeda |

### Exports Auxiliares

| Export | Tipo | Descricao |
|--------|------|-----------|
| `moedas` | `const array` | Lista de moedas disponiveis (`BRL`, `USD`) |
| `Moeda` | `type` | Tipo de uma moeda (`{ codigo, nome, simbolo, Bandeira }`) |
| `formatarMoeda(valor)` | `function` | Converte `number` para string com virgula (`1234.5` → `"1234,50"`) |
| `parsearValor(texto)` | `function` | Extrai numero de uma string formatada (`"1.234,50"` → `12.345`) |

### Comportamento

- O input aceita apenas digitos; a formatacao e automatica.
- O simbolo da moeda (R$, $) aparece como prefixo fixo dentro do campo.
- O dropdown de moedas fecha ao clicar fora (click-outside).
- O chevron rotaciona ao abrir/fechar o dropdown.

### Uso

```tsx
<InputCurrency
    valor={preco}
    moeda={moeda}
    onValorChange={setPreco}
    onMoedaChange={setMoeda}
/>
```

---

## ComboboxAtivo

Seletor de ativos com busca por ticker ou nome, navegacao por teclado e destaque do item selecionado.

**Arquivo:** `app/components/ComboBoxAtivo.tsx`

### Props

| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `items` | `Ativo[]` | — | Lista de ativos disponiveis |
| `placeholder` | `string` | — | Texto exibido quando nenhum ativo esta selecionado |
| `value` | `Ativo \| null` | `null` | Ativo selecionado (componente controlado) |
| `onChange` | `(option: Ativo) => void` | `undefined` | Callback ao selecionar um ativo |

### Navegacao por Teclado

| Tecla | Acao |
|-------|------|
| `ArrowDown` | Move selecao para baixo |
| `ArrowUp` | Move selecao para cima |
| `Enter` | Confirma o item selecionado |
| `Escape` | Fecha o dropdown |

### Uso

```tsx
<ComboboxAtivo
    items={ativos}
    placeholder="Buscar ativo..."
    value={ativoSelecionado}
    onChange={setAtivoSelecionado}
/>
```

---

## Ativos

Tabela que exibe os ativos na carteira do usuario usando componentes do MUI.

**Arquivo:** `app/components/Ativos.tsx`

### Props

| Prop | Tipo | Descricao |
|------|------|-----------|
| `items` | `Ativo[]` | Lista de ativos na carteira |

### Colunas

| Coluna | Origem |
|--------|--------|
| Ativo | `nome` + `ticker` |
| Quantidade | `quantidade` |
| Preco Medio | — (ainda nao implementado) |
| Preco Atual | — (ainda nao implementado) |
| Variacao | — (ainda nao implementado) |
| Saldo | — (ainda nao implementado) |

---

## PatrimonioTotal

Card que exibe o patrimonio total do usuario com indicador de variacao.

**Arquivo:** `app/components/PatrimonioTotal.tsx`

### Props

| Prop | Tipo | Descricao |
|------|------|-----------|
| `valorTotal` | `number` | Valor total do patrimonio |
| `mudanca` | `{ crescimento?: boolean, porcentagem: number }` | Dados de variacao percentual |

### Uso

```tsx
<PatrimonioTotal valorTotal={user.saldo} mudanca={{ crescimento: true, porcentagem: 3.4 }} />
```

---

## SideBarComponent

Sidebar de navegacao colapsavel com links para as paginas do dashboard.

**Arquivo:** `app/components/SideBarComponent.tsx`

### Props

| Prop | Tipo | Descricao |
|------|------|-----------|
| `isOpen` | `boolean` | Se a sidebar esta expandida |
| `toggle` | `() => void` | Alterna entre expandida/colapsada |
| `supabase` | `SupabaseClient` | Instancia do Supabase (para logout) |

### Itens de Navegacao

| Nome | Rota | Icone |
|------|------|-------|
| Inicio | `/dashboard` | `home` |
| Meus Ativos | `/dashboard/wallet` | `trending_up` |
| Configuracoes | `/dashboard/settings` | `settings` |

---

## SearchComponent

Campo de busca com filtragem em tempo real por ticker.

**Arquivo:** `app/components/SearchComponent.tsx`

### Props

| Prop | Tipo | Descricao |
|------|------|-----------|
| `items` | `Ativo[]` | Lista de ativos para buscar |

> **Nota:** Este componente esta comentado no `wallet.tsx` e nao esta em uso ativo.

---

## ButtonLogOut

Botao que encerra a sessao do usuario via Supabase e redireciona para `/`.

**Arquivo:** `app/components/ButtonLogOut.tsx`

### Props

| Prop | Tipo | Descricao |
|------|------|-----------|
| `supabase` | `SupabaseClient` | Instancia do Supabase para chamar `signOut()` |
