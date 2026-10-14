# backend/app/db/metadata_logger.py
"""
Módulo de Auditoria de Metadados (Zero-Knowledge sobre o conteúdo da patente).

Regista exclusivamente métricas administrativas de uso da ferramenta (quando foi gerada,
qual categoria de patente e qual versão do template), garantindo que nenhuma informação
técnica da invenção seja persistida no servidor.
"""

from datetime import datetime, timezone
import logging

# Configura um logger dedicado apenas para eventos administrativos
logger = logging.getLogger("patent_audit")
logging.basicConfig(level=logging.INFO)


def record_export_metadata(
    categoria_patente: str,
    versao_template: str,
    quantidade_reivindicacoes: int,
    quantidade_figuras: int,
    incluiu_pdf: bool = False,
) -> None:
    """
    Função executada de forma assíncrona via BackgroundTasks após o envio do documento.
    """
    registro_auditoria = {
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "categoria_patente": categoria_patente,
        "versao_template": versao_template,
        "qtd_reivindicacoes": quantidade_reivindicacoes,
        "qtd_figuras": quantidade_figuras,
        "incluiu_pdf": incluiu_pdf,
    }
    logger.info(f"[AUDITORIA METADADOS] Minuta exportada com sucesso: {registro_auditoria}")