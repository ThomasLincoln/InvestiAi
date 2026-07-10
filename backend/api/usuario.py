from fastapi import APIRouter, Depends
from sqlmodel import Session, select, col
from core.database import engine
from models.transacoes import transacoes
from models.ativo import ativos_base
from core.security import obter_usuario_atual
from datetime import datetime, timezone
from dto.UsuarioDTO import NovoAporte

router = APIRouter(prefix="/usuario", tags=["Usuarios"])


@router.get("/ativos")
def lerAtivos_usuario(usuario_id: str = Depends(obter_usuario_atual)):
    print(f"👉 Rota /ativos acessada pelo usuário: {usuario_id}")
    print(usuario_id)
    with Session(engine) as session:
        query = (
            select(transacoes, ativos_base)
            .join(ativos_base, col(transacoes.Ativo) == ativos_base.id)
            .where(transacoes.Usuario == usuario_id)
        )
        resultados = session.exec(query).all()

        dados_formatados = []
        for transacao, ativo in resultados:
            dados_formatados.append(
                {
                    "id": transacao.id,
                    "Quantidade": transacao.Quantidade,
                    "preco_unitario": transacao.preco_unitario,
                    "Ativo": {"ticker": ativo.ticker, "nome": ativo.nome},
                }
            )

        return dados_formatados


@router.post("/aportar_ativo")
def aportar(
    dados_do_aporte: NovoAporte, usuario_id: str = Depends(obter_usuario_atual)
):
    print(f"👉 Rota /aportart_ativo acessada pelo usuário: {usuario_id}")
    print(usuario_id)
    with Session(engine) as session:
        novo_aporte = transacoes(
            Usuario=usuario_id,
            Quantidade=dados_do_aporte.Quantidade,
            preco_unitario=dados_do_aporte.preco_unitario,
            tipo="Compra",
            Ativo=dados_do_aporte.Ativo,
            data_transacao=dados_do_aporte.data_transacao,
        )
        session.add(novo_aporte)
        session.commit()
        session.refresh(novo_aporte)
    return {"mensagem": "Aporte registrado com sucesso!", "id_transcao": novo_aporte.id}
