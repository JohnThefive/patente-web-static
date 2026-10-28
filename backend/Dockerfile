# ==============================================================================
# Dockerfile Backend — Patente_web (FastAPI + LibreOffice Headless em RAM)
# ==============================================================================
FROM python:3.12-slim-bookworm

# Evita geração de bytecode .pyc e força flush imediato de stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Instala LibreOffice Headless (sem GUI) e fontes padrão para renderização de PDF fiel ao INPI
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice-writer-nogui \
    fonts-dejavu-core \
    fonts-liberation \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Cria usuário não-root por segurança
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Copia e instala as dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copia o código-fonte da aplicação e os templates oficiais (.docx)
COPY app/ ./app/
COPY templates/ ./templates/

# Ajusta permissões para o usuário da aplicação
RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

# Verificação de saúde embutida via módulo padrão urllib do Python
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Inicializa o servidor FastAPI com Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
