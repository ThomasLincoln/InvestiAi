# Backlog: InvestiAi — Plataforma de Gestão Financeira Inteligente

Este documento contém o plano de execução da plataforma. As checkboxes refletem o estado atual de cada item.

---

## Stack Tecnológica

- [x] Frontend (Web): React Router 7 (SSR) + Tailwind CSS 4 + Lucide Icons
- [x] BD/Auth: Supabase (PostgreSQL + Auth + Row Level Security)
- [ ] Backend: Python (FastAPI) — pasta criada, ainda sem código
- [ ] Mobile: React Native (Expo)
- [ ] IA: Gemini API (gemini-1.5-flash)
- [ ] OCR/PDF: LangChain + Google Vision API + PyMuPDF
- [ ] Scraping: Playwright

---

## Fase 1 — MVP Web (em andamento)

### 1.1 Autenticação e Segurança

- [x] Configurar Supabase Auth com JWT
- [x] Implementar Social Login (Google) com ID Token
- [ ] Implementar login por E-mail/Senha
- [ ] Criar validação de força de senha
- [ ] Proteger rotas autenticadas (redirect se não logado)

### 1.2 Layout e Navegação

- [x] Criar layout do dashboard com sidebar responsiva
- [x] Implementar navegação entre páginas (Início, Carteira, Configurações)
- [x] Criar componente de logout
- [x] Implementar destaque de link ativo na sidebar

### 1.3 Dashboard — Início

- [x] Exibir saudação personalizada com nome do usuário
- [x] Card de Patrimônio Total com indicador de variação
- [x] Cards placeholder para "Ativos na Carteira" e "Rentabilidade Mensal"
- [ ] Preencher cards com dados reais (quantidade de ativos, rentabilidade)
- [ ] Implementar gráficos de evolução da carteira

### 1.4 Carteira (Wallet)

- [x] Listar ativos do usuário em tabela (ticker, nome, quantidade, preço unitário)
- [x] Modal de "Novo Lançamento" com busca de ativo, quantidade, data e preço
- [x] Componente ComboBox para busca de ativos
- [x] Componente InputCurrency com seleção de moeda (BRL/USD)
- [x] Estado vazio com ilustração quando não há ativos
- [ ] Implementar edição e exclusão de transações
- [ ] Calcular e exibir preço médio real por ativo
- [ ] Exibir preço atual do ativo (integração com API de cotações)
- [ ] Calcular e exibir variação (%) e saldo por ativo
- [ ] Agrupar transações por ativo (consolidar posição)

### 1.5 Configurações

- [x] Exibir perfil do usuário (nome, email, foto via Google)
- [x] Seleção de tema (Claro / Escuro / Sistema) com persistência
- [x] Seções placeholder para Segurança e Notificações
- [ ] Implementar edição de perfil com persistência no Supabase
- [ ] Implementar toggle funcional de 2FA
- [ ] Implementar definição de perfil de risco (Conservador / Moderado / Arrojado)

### 1.6 Tema e UI

- [x] Implementar ThemeProvider com suporte a dark mode
- [x] Hook `useTheme` para controle de tema
- [x] Design system consistente (cores violet, bordas, sombras, transições)

---

## Fase 2 — Backend e Integrações

### 2.1 Backend (FastAPI)

- [ ] Estruturar projeto FastAPI na pasta `backend/`
- [ ] Configurar conexão com Supabase (PostgreSQL)
- [ ] Criar endpoints de autenticação (validar JWT do Supabase)
- [ ] Migrar chamadas diretas do frontend ao Supabase para passar pelo backend

### 2.2 Integração com APIs de Cotações

- [ ] Integrar API de cotações (Yahoo Finance / Brapi) no backend
- [ ] Endpoint para busca de tickers com autocomplete
- [ ] Endpoint para cotação atual de um ativo
- [ ] Atualização periódica de preços (cron job ou webhook)

### 2.3 Gestão de Carteira (Backend)

- [ ] Endpoint de CRUD de transações
- [ ] Lógica de cálculo de preço médio ponderado
- [ ] Cálculo de rentabilidade por ativo e total da carteira
- [ ] Histórico de evolução patrimonial

---

## Fase 3 — Inteligência e Estratégia

### 3.1 Estratégia de Alocação

- [ ] UI de sliders para definir alocação alvo por classe (total = 100%)
- [ ] Barras de progresso: alocação atual vs. meta
- [ ] Sugestão de aporte "Buy the Gap" (reequilíbrio automático)
- [ ] Simulador de aporte com base no valor disponível

### 3.2 Alertas e Insights

- [ ] Sistema de notificações para quedas de X%
- [ ] Relatório semanal de rentabilidade comparativo (vs. CDI / IBOV)
- [ ] Alertas de preço-alvo por ativo

---

## Fase 4 — IA e Análise de Documentos

### 4.1 Analisador de PDF de RI com LLM

- [ ] Pipeline de RAG com Gemini API
- [ ] Extração automática de indicadores (Receita, EBITDA, Lucro)
- [ ] Chat interativo para perguntas sobre documentos

### 4.2 Monitor de Documentos (Scraping)

- [ ] Scraper para sites de RI e CVM (Playwright)
- [ ] Monitoramento baseado nos tickers favoritos do usuário

---

## Fase 5 — Mobile

### 5.1 App Mobile (React Native / Expo)

- [ ] Setup do projeto Expo
- [ ] Telas de login e dashboard mobile
- [ ] Widget "Quick Add" para lançamento rápido de gastos
- [ ] Categorização automática de gastos via NLP

### 5.2 OCR de Boletos e Notas Fiscais

- [ ] Leitura de QR Code / Código de Barras via câmera
- [ ] Extração de dados do boleto (Valor, Vencimento, Nome)
