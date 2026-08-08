# 🚀 InvestiAí — Backend API

API RESTful desenvolvida em **FastAPI** para gerenciamento de carteira de investimentos, controle de aportes, acompanhamento de histórico e consolidação de patrimônio.

---

## 🛠️ Tecnologias Utilizadas

* **Python 3.11+**
* **FastAPI** (Framework web)
* **SQLModel** (ORM sobre SQLAlchemy)
* **PostgreSQL / Supabase** (Banco de dados)
* **Alembic** (Migrações de banco de dados)
* **APScheduler** (Tarefas agendadas em segundo plano)
* **Uvicorn** (Servidor ASGI)

---

## ⚙️ Configuração do Ambiente Local

### 1. Criar o Ambiente Virtual (`venv`)

```powershell
py -3 -m venv venv
```

### 2. Ativar o Ambiente Virtual

* **Windows (PowerShell):**
  ```powershell
  .\venv\Scripts\activate
  ```
* **Linux / macOS:**
  ```bash
  source venv/bin/activate
  ```

### 3. Instalar as Dependências

```powershell
pip install fastapi uvicorn supabase python-dotenv sqlmodel apscheduler alembic psycopg2-binary apscheduler
```

Lembrando que é importante criar o alembic.ini, caso necessário rodar o comando:

```powershell
python -m alembic init alembic
```

Para gerar a migration use: 

```powershell
python -m alembic revision --autogenerate -m "primeira_migracao"
```
---

## 🗄️ Migrações de Banco de Dados (`Alembic`)

Sempre que alterar as entidades em `models/`, execute os comandos para atualizar o Supabase:

```powershell
# Gerar arquivo de migração automático
python -m alembic revision --autogenerate -m "sua_descricao_aqui"

# Aplicar as alterações no banco de dados
python -m alembic upgrade head
```

---

## 🚀 Executando a Aplicação

Para subir o servidor em modo de desenvolvimento com *hot-reload*:

```powershell
uvicorn main:app --port 3000 --reload
```

Acesse a documentação interativa das rotas no seu navegador:

* **Swagger UI:** `http://localhost:3000/docs`
* **ReDoc:** `http://localhost:3000/redoc`

---

## 📁 Estrutura do Projeto

```text
backend/
├── alembic/              # Scripts e arquivos de migração do banco
├── core/                 # Configurações globais (Database, Security, Envs)
├── dto/                  # Data Transfer Objects (Pydantic schemas)
├── jobs/                 # Tarefas agendadas (APScheduler)
├── models/               # Modelos das tabelas do banco (SQLModel)
├── routers/              # Rotas HTTP da API (Endpoints)
├── services/             # Regras de negócio e integrações externas
├── alembic.ini           # Configurações do Alembic
├── main.py               # Ponto de entrada da aplicação FastAPI
└── .env                  # Variáveis de ambiente (ignorado no Git)
```