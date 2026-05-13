# Forecast Health

Sistema de previsão de ocupação de leitos hospitalares com IA (Prophet).

## Como rodar localmente
### Backend

```bash
cd backend
source .venv/bin/activate        
pip install -r requirements.txt
uvicorn main:app --reload
```
API disponível em: http://localhost:8000  
Swagger em: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Dashboard em: http://localhost:3000
