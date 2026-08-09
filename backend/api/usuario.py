from fastapi import APIRouter, Depends
from sqlmodel import Session, select, col
from core.database import engine
from models.transacoes import transacoes
from models.ativo_base import ativos_base
from models.cotacoes_diarias import cotacoes_diarias
from core.security import obter_usuario_atual
from datetime import datetime, timezone
from dto.UsuarioDTO import NovoAporte

router = APIRouter(prefix="/usuario", tags=["Usuarios"])


@router.get("/ativos")
def lerAtivos_usuario(usuario_id: str = Depends(obter_usuario_atual)):
    print(f"👉 Rota /ativos acessada pelo usuário: {usuario_id}")
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


@router.get("/ativosAgrupados")
def lerAtivosAgrupados_usuario(usuario_id: str = Depends(obter_usuario_atual)):
    print(f"👉 Rota /ativosAgrupados acessada pelo usuário: {usuario_id}")
    with Session(engine) as session:
        query_transacoes = (
            select(transacoes, ativos_base)
            .join(ativos_base, col(transacoes.Ativo) == ativos_base.id)
            .where(transacoes.Usuario == usuario_id)
        )
        resultados = session.exec(query_transacoes).all()

        query_cotacoes = (
            select(cotacoes_diarias)
            .order_by(cotacoes_diarias.ativo_id, cotacoes_diarias.data.desc())
            .distinct(cotacoes_diarias.ativo_id)
        )
        
        ultimas_cotacoes = session.exec(query_cotacoes).all()
        
        mapa_precos = {cotacao.ativo_id: cotacao.preco_fechamento for cotacao in ultimas_cotacoes}
        
        ativos_consolidados = {}
        for transacao, ativo in resultados:
            ticker = ativo.ticker
            custo_da_transacao = transacao.Quantidade * transacao.preco_unitario
            if ticker not in ativos_consolidados:
                ativos_consolidados[ticker] = {
                    "Ativo": {"ticker": ticker, "nome": ativo.nome},
                    "ID": ativo.id,
                    "Quantidade": 0,
                    "custo_total": 0.0,
                    "preco": mapa_precos.get(ativo.id, 0.0)
                }
            ativos_consolidados[ticker]["Quantidade"] += transacao.Quantidade
            ativos_consolidados[ticker]["custo_total"] += custo_da_transacao
            dados_formatados = []
        for ticker, dados in ativos_consolidados.items():
            quantidade = dados["Quantidade"]
            preco_medio = (dados["custo_total"] / quantidade) if quantidade > 0 else 0
            dados_formatados.append(
                {
                    "ID": dados["ID"],
                    "Ativo": dados["Ativo"],
                    "Quantidade": dados["Quantidade"],
                    "preco_medio": round(preco_medio, 2),
                    "preco": dados["preco"]
                }
            )
        print(dados_formatados)
        return dados_formatados

@router.get("/obterHistorico")
def obter_historico(usuario_id: str = Depends(obter_usuario_atual)):
    print(f"👉 Rota /obterHistorico ativada pelo usuário: {usuario_id}")
    with Session(engine) as session:
            query = (
                select(transacoes, ativos_base)
                .join(ativos_base, col(transacoes.Ativo) == ativos_base.id)
                .where(transacoes.Usuario == usuario_id)
            )
            resultados = session.exec(query).all()
            ativos_consolidados = {}
            for transacao, ativo in resultados:
                data_string = str(transacao.data_transacao).split(" ")[0]
                
                if data_string not in ativos_consolidados:
                    ativos_consolidados[data_string] = []
                
                ativos_consolidados[data_string].append({
                    "quantidade":transacao.Quantidade,
                    "preco_unitario": transacao.preco_unitario,
                    "tipo": transacao.tipo
                })
            historico_lista = [
            {"data": data, "transacoes": itens} 
            for data, itens in ativos_consolidados.items()
            ]
        
            return historico_lista

@router.post("/aportar_ativo")
def aportar(
    dados_do_aporte: NovoAporte, usuario_id: str = Depends(obter_usuario_atual)
):
    print(f"👉 Rota /aportart_ativo acessada pelo usuário: {usuario_id}")
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

@router.get("/historico_patrimonio")
def get_historico_patrimonio(usuario_id: str):
    print(f"👉 Rota /historico_patrimonio acessada pelo usuário: {usuario_id}")
    with Session(engine) as session:
        query = select(transacoes, )
