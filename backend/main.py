from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import ativos
from api import usuario

app = FastAPI()

origins = ["http://localhost:5173"]

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
