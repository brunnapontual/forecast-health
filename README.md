# Forecast Health

Sistema de previsão de demandas hospitalar com análises por IA.

---

## Como rodar localmente

### Backend

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Swagger: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm run dev
```

Dashboard: `http://localhost:3000`

---

## Stack

| Tecnologia | Aplicação |
|---|---|
| **Next.js 15** | Framework frontend com App Router |
| **TypeScript** | Frontend |
| **TailwindCSS** | Estilização e design system |
| **FastAPI** | API REST do backend |
| **Python 3.9** | Backend |
| **SQLite** | Banco de dados local |
| **SQLAlchemy** | ORM para acesso ao banco |
| **pandas** | Leitura e processamento de CSV/XLSX |
| **bcrypt** | Hash de senhas |
| **Prophet / SARIMA** | Previsão de demanda hospitalar *(próximas etapas)* |

---

## Estrutura

```
forecast-health/
├── backend/
│   ├── app/
│   │   ├── main.py          
│   │   ├── database.py      
│   │   ├── models/          
│   │   ├── schemas/         
│   │   └── routes/                            
│   └── requirements.txt
│
└── frontend/
    ├── app/                               
    ├── components/          
    └── services/                    
```