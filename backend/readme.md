Para rodar a maquina virtual usamos: py -3 -m venv venv
Para ativar: .\venv\Scripts\activate
Instalar dependencias: pip install fastapi uvicorn supabase python-dotenv sqlmodel
Inciar o servidor: uvicorn main:app --port 3000 --reload