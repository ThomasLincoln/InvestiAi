import os
from dotenv import load_dotenv
from sqlmodel import create_engine

load_dotenv()

db_url = os.getenv("DATABASE_URL", "")

if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

if not db_url:
    raise ValueError("A variável de ambiente DATABASE_URL não foi encontrada.")

engine = create_engine(db_url, pool_pre_ping=True)
