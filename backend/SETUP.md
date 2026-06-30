# Backend — InvestiAi (FastAPI)

## O que já existe

```
backend/
├── app/
│   ├── core/
│   │   └── config.py        # Configurações via variáveis de ambiente (pydantic-settings)
│   ├── routers/             # Pasta para os endpoints (vazia)
│   ├── models/              # Pasta para modelos do banco (vazia)
│   ├── services/            # Pasta para regras de negócio (vazias)
│   └── schemas/             # Pasta para schemas Pydantic (vazia)
├── requirements.txt         # Dependências do projeto
├── .env.example             # Modelo de variáveis de ambiente
└── .gitignore
```

## O que falta para executar

- [ ] `main.py` — ponto de entrada da aplicação FastAPI
- [ ] `.env` — preenchido com as chaves do Supabase
- [ ] Ambiente virtual criado e dependências instaladas

---

## Passo a passo

### 1. Criar e ativar o ambiente virtual

```bash
python -m venv .venv
.venv\Scripts\activate
```

### 2. Instalar dependências

```bash
pip install -r requirements.txt
```

### 3. Configurar variáveis de ambiente

Copie `.env.example` para `.env` e preencha com as suas chaves do Supabase:

```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_JWT_SECRET=...
```

> As chaves estão em: Supabase → Project Settings → API

### 4. Criar o `main.py` (próximo passo)

### 5. Iniciar o servidor

```bash
uvicorn main:app --reload
```

Acesse: http://localhost:8000/docs
