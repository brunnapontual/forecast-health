from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routes import auth

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Forecast Health PI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "Forecast Health PI API"}


@app.get("/health")
def health():
    return {"status": "healthy"}