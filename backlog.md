🚀 Backlog: Plataforma de Gestão Financeira Inteligente

Este documento contém o plano de execução para a plataforma. Sinta-se à vontade para utilizar estas checkboxes para gerir o progresso no GitHub Projects.

🛠️ Stack Tecnológica

- [x] Frontend (Web): React.js + Tailwind CSS
- [ ] Mobile: React Native (Expo)
- [ ] Backend: Python (FastAPI)
- [ ] BD: PostgreSQL (Supabase)
- [ ] IA: Gemini API (gemini-1.5-flash)
- [ ] OCR/PDF: LangChain + Google Vision API + PyMuPDF
- [ ] Scraping: Playwright

# 🏗️ Épico 1: Core & Fundação (Infraestrutura)

## 1.1 Autenticação e Segurança

- [x] Configurar Supabase Auth/JWT.
- [ ] Implementar login por E-mail/Senha.
- [x] Implementar Social Login (Google).
- [ ] Criar validação de força de password.

## 1.2 Perfil e Configuração

- [ ] Criar ecrã de setup inicial.
- [ ] Implementar seleção de moeda (BRL/USD).
- [ ] Implementar definição de perfil de risco (Conservador/Moderado/Arrojado).

# 📈 Épico 2: Gestão de Ativos e Carteira

## 2.1 Cadastro de Ativos Multiclasse

- [ ] Criar CRUD de ativos (Ações, FIIs, Cripto, Renda Fixa).
- [ ] Integrar API para procura automática de tickers (Yahoo Finance/Brapi).
- [ ] Implementar lógica de histórico de compras para Preço Médio.

## 2.2 Estratégia de Alocação (Porcentagens Alvo)
- [ ] Desenvolver UI de sliders para alocação alvo (total 100%).
- [ ] Criar barras de progresso para visualização Meta vs. Atual.

# 🤖 Épico 3: Automação e Inteligência de Investimento

## 3.1 Sugestão de Aporte "Buy the Gap"

- [ ] Desenvolver algoritmo de reequilíbrio de carteira.
- [ ] Criar simulador de aporte com base no valor disponível.

## 3.2 Alertas e Insights de Volatilidade

- [ ] Implementar sistema de notificações (Push/E-mail) para quedas de X%.
- [ ] Gerar relatório semanal de rentabilidade comparativo (vs. CDI/IBOV).

# 📄 Épico 4: Inteligência de RI (Relações com Investidores) & LLM

## 4.1 Analisador de PDF de RI com LLM
- [ ] Configurar pipeline de RAG com Gemini API.
- [ ] Implementar extração automática (Receita, EBITDA, Lucro).
- [ ] Criar chat interativo para perguntas sobre o PDF.

## 4.2 Monitor de Documentos (Scraping)
- [ ] Desenvolver scraper para sites de RI e CVM.
- [ ] Implementar lógica de monitorização baseada em tickers favoritos.

# 📱 Épico 5: Gestão de Gastos (Foco Mobile)

## 5.1 Entrada Rápida de Gastos
- [ ] Criar widget/atalho "Quick Add" na Home do App.
- [ ] Implementar categorização automática via NLP (Ex: "Starbucks" -> "Alimentação").

## 5.2 OCR de Boletos e Notas Fiscais

- [ ] Integrar câmara para leitura de QR Code/Código de Barras.
- [ ] Implementar extração de dados do boleto (Valor, Vencimento, Nome).

# 📅 Roadmap de Entrega
- [ ] Fase 1: MVP Web (Auth + Carteira + Rebalanceamento)
- [ ] Fase 2: Mobile Base (Lançamento de Gastos)
- [ ] Fase 3: Intelligence (Integração LLM + Insights)
- [ ] Fase 4: Automation (Scrapers + OCR avançado)