# Documentação: Histórico de Preços (Cotações Diárias)

## Visão Geral
A feature de histórico de preços tem como objetivo manter a base de dados atualizada com o valor de mercado (cotação) dos ativos financeiros (ações, FIIs, BDRs, etc) de todos os usuários da plataforma InvestiAi. 
Este acompanhamento é feito em duas frentes:
1. **Cotação Atual (Dia atual):** Atualização diária e pontual do preço de fechamento atual do ativo.
2. **Cotação Histórica (Passado):** Resgate de todos os preços de um ativo desde a data da primeira compra pelo usuário até o dia atual, garantindo a visualização precisa do crescimento do patrimônio ao longo do tempo.

## Modelagem de Dados
A tabela responsável por armazenar essas informações é a `cotacoes_diarias` (definida em `backend/models/cotacoes_diarias.py`).

**Colunas:**
- `id`: Chave primária.
- `ativo_id`: Referência à tabela `ativos_base`.
- `data`: Data de referência da cotação.
- `preco_fechamento`: Valor de fechamento ajustado daquele dia.

*Nota:* Há um **índice composto único** (`idx_cotacao_ativo_data`) para `ativo_id` e `data`, garantindo que não existam registros duplicados para um mesmo ativo no mesmo dia.

## Fluxo Ponta a Ponta

A principal fonte de dados para as cotações é a API do **Yahoo Finance** (através da biblioteca `yfinance` em Python). Toda a lógica de integração se encontra em `backend/services/yahoo_integration.py`.

### 1. Atualização do Dia Atual (`get_actual_value_stock`)
Esta função busca o preço em "tempo real" ou o último fechamento do dia atual.
- Ela verifica primeiramente as propriedades `currentPrice` ou `regularMarketPrice` do método `.info` do Yahoo.
- Caso falhe (retorne nulo), como mecanismo de fallback, é requisitado o histórico de 1 dia (`period="1d"`) para pegar o preço da coluna `Close`.
- **Fluxo no Serviço (`atualizar_cotacoes_e_patrimonio`):** 
  - O sistema busca todos os ativos únicos que pertencem a pelo menos um usuário.
  - Para cada ativo, consulta a cotação de hoje usando o método acima.
  - Se já existir registro para a `date.today()`, ele **atualiza** (fazendo update do `preco_fechamento`). Se não existir, ele **insere** um novo.

### 2. Preenchimento de Histórico Passado (`buscar_e_salvar_cotacoes_faltantes`)
Esta função busca todo o histórico necessário de forma performática (em lote) para evitar gargalos de rede.
- Recebe a data de início (data da primeira transação do ativo pelo usuário) e usa `.history(start=data_inicio, end=hoje)` do `yfinance`.
- Retorna uma lista de novos objetos `cotacoes_diarias` que não existiam previamente na base.

- **Fluxo no Serviço (`consolidar_patrimonio_retroativo`):**
  - O sistema itera por cada usuário.
  - Encontra qual foi o primeiro aporte financeiro desse usuário (Data da primeira transação).
  - Consulta o banco para ver quais cotações já temos. As que faltam são requisitadas ao Yahoo (via `buscar_e_salvar_cotacoes_faltantes`).
  - *Forward-Fill:* Ao calcular o histórico de patrimônio diário, caso a bolsa estivesse fechada em algum dia (fim de semana ou feriado, logo sem cotação registrada), o algoritmo inteligentemente propaga (reaproveita) o **último preço conhecido** do ativo (ou o preço de compra), para evitar quedas e flutuações falsas no gráfico.
  - Recalcula dia após dia todo o valor Aplicado, o Valor de Mercado (Qtd * Preço Ativo) e o Ganho de Capital, regravando na tabela `historico_patrimonio`.

## Agendamento (Job)
Estas funções ficam englobadas dentro de rotinas de consolidação (ex: `atualizar_cotacoes_e_patrimonio` e `consolidar_patrimonio_dia_atual` no `cotacoes_service.py`), permitindo que a plataforma seja atualizada por CRON jobs ou chamadas periódicas programadas.

