from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
from services.cotacoes_service import atualizar_cotacoes_e_patrimonio, consolidar_patrimonio_dia_atual
from services.yahoo_integration import get_actual_value_stock
from api import ativos
from api import usuario

scheduler = BackgroundScheduler()

def rotina_teste_cotacoes():
    """Função que simula ou busca as cotações e grava o snapshot."""
    agora = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"⏰ [{agora}] Rodando atualização de cotações/patrimônio...")
    atualizar_cotacoes_e_patrimonio()
    consolidar_patrimonio_dia_atual()
    


@asynccontextmanager
async def lifespan(app: FastAPI):
    # scheduler.add_job(rotina_teste_cotacoes, 'cron', hour=19, minute=00)
    scheduler.add_job(rotina_teste_cotacoes, 'interval', minutes=1)
    scheduler.start()
    yield
    scheduler.shutdown()    

app = FastAPI(lifespan=lifespan)

origins = ["http://localhost:5173", "https://investiai-a5d1.onrender.com"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ativos.router)
app.include_router(usuario.router)


@app.get("/")
def read_root():
    return {"message": "Backend Python funcionando perfeitamente com rotas separadas!"}
