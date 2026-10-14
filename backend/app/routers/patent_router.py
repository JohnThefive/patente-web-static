# backend/app/routers/patent_router.py
"""
Roteador de Endpoints de Exportação de Patentes (Padrão INPI).
"""

from fastapi import APIRouter, BackgroundTasks, HTTPException, Query
from fastapi.responses import StreamingResponse

from app.models.patent_schemas import PacotePatenteUnion
from app.services.docx_generator import gerar_pacote_completo_em_ram
from app.db.metadata_logger import record_export_metadata

router = APIRouter(prefix="/api/v1/patents", tags=["Exportação de Minutas INPI"])


@router.post(
    "/export-package",
    summary="Gera o pacote .ZIP com os 4 documentos do INPI (100% em RAM)",
)
async def export_patent_package(
    payload: PacotePatenteUnion,
    background_tasks: BackgroundTasks,
    exportar_pdf: bool = Query(
        default=False,
        description="Se verdadeiro, converte os documentos para PDF via LibreOffice Headless",
    ),
):
    """
    Recebe o JSON validado (PI, MU ou CII_SOFTWARE), renderiza os 4 documentos
    formais em memória RAM e retorna um arquivo `.zip` para download imediato.
    """
    try:
        zip_buffer = gerar_pacote_completo_em_ram(patente=payload, exportar_pdf=exportar_pdf)

        background_tasks.add_task(
            record_export_metadata,
            categoria_patente=payload.modalidade,
            versao_template="v1.0-inpi",
            quantidade_reivindicacoes=len(payload.quadro_reivindicatorio),
            quantidade_figuras=len(payload.desenhos),
        )

        nome_arquivo = f"Pacote_Minutas_{payload.modalidade}.zip"
        headers = {
            "Content-Disposition": f'attachment; filename="{nome_arquivo}"',
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
            "Pragma": "no-cache",
        }

        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers=headers,
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=f"Template não encontrado: {exc}") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar pacote: {exc}") from exc