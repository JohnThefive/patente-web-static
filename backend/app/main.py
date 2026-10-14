# backend/app/main.py
"""
Ponto de entrada da aplicação FastAPI (`Patente_web`).
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.patent_router import router as patent_router

app = FastAPI(
    title="Patente_web API - Gerador Automatizado INPI",
    description="API Local-First e Zero-Storage para geração de relatórios descritivos do INPI.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

app.include_router(patent_router)


@app.get("/health", tags=["Monitoramento"])
async def health_check():
    """Health check do servidor."""
    return {"status": "online", "project": "Patente_web"}