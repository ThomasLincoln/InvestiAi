import pytest
from uuid import UUID
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from sqlmodel.pool import StaticPool

from main import app
from core.database import engine
from core.security import obter_usuario_atual
from models.perfil_pessoal import perfil_pessoal

USUARIO_TESTE_ID = UUID("00000000-0000-0000-0000-000000000001")

@pytest.fixture(name="session")
def session_fixture():
    """Cria um banco SQLite em memória isolado para cada teste."""
    engine_teste = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine_teste)
    
    with Session(engine_teste) as session:
        usuario = perfil_pessoal(id=USUARIO_TESTE_ID, email="teste@investiai.com")
        session.add(usuario)
        session.commit()
        yield session

@pytest.fixture(name="client")
def client_fixture(session: Session, monkeypatch):
    """Configura o client do FastAPI com override de banco e autenticação."""
    
    # 1. Substitui a engine real pela engine de teste
    import core.database
    monkeypatch.setattr(core.database, "engine", session.bind)
    import services.cotacoes_service
    monkeypatch.setattr(services.cotacoes_service, "engine", session.bind)
    import api.usuario
    monkeypatch.setattr(api.usuario, "engine", session.bind)
    import api.ativos
    monkeypatch.setattr(api.ativos, "engine", session.bind)

    # 2. Faz bypass da autenticação retornando o ID do usuário de teste
    app.dependency_overrides[obter_usuario_atual] = lambda: str(USUARIO_TESTE_ID)

    with TestClient(app) as client:
        yield client

    app.dependency_overrides.clear()

