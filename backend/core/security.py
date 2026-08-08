import os
import jwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Importe e execute o carregador de .env
from dotenv import load_dotenv
load_dotenv()

security = HTTPBearer()

supabase_url = os.getenv("SUPABASE_URL")

# Dica: Adicionar uma verificação rápida ajuda a barrar o sistema com um erro mais claro 
# caso as variáveis não sejam carregadas.
if not supabase_url:
    raise ValueError("A variável SUPABASE_URL não foi encontrada no .env.")

jwks_url = f"{supabase_url}/auth/v1/.well-known/jwks.json"
jwks_client = PyJWKClient(
    jwks_url, headers={"apikey": os.getenv("SUPABASE_PUBLISHABLE_KEY")}
)

def obter_usuario_atual(credentials: HTTPAuthorizationCredentials = Depends(security)):
    print("tentando buscar o usuário atual")
    token = credentials.credentials
    try:
        # Isso aqui vai buscar o key id dentro do token e vai retornar um
        # objeto pronto para ser usado para fazer o decode
        signin_key = jwks_client.get_signing_key_from_jwt(token)

        payload = jwt.decode(
            token,
            signin_key.key,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
        )

        usuario_id = payload.get("sub")
        if usuario_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        return usuario_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401, detail="Token expirado. Faça login novamente."
        )
    except jwt.InvalidTokenError as e:
        print(f"Erro detalhado na validação do JWT: {e}")
        raise HTTPException(
            status_code=401, detail="Credenciais de segurança inválidas"
        )