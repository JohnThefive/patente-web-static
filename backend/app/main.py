# backend/app/main.py
"""
Ponto de entrada da aplicação FastAPI (`Patente_web`).
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.patent_router import router as patent_router

app = FastAPI(
    title="Patente_web API - Gerador Automatizado INPI",
    description="API Local-First e Zero-Storage para geração de relatórios descritivos do INPI.",
    version="1.0.0",
)

origens_permitidas = [
    origem.strip()
    for origem in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if origem.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origens_permitidas,
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

app.include_router(patent_router)


@app.get("/health", tags=["Monitoramento"])
async def health_check():
    """Health check do servidor."""
    return {"status": "online", "project": "Patente_web"}