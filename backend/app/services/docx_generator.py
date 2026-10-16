# backend/app/services/docx_generator.py
"""
Serviço de Geração Efêmera de Documentos (.DOCX, .PDF e .ZIP) em Memória RAM.

Mapeado exatamente para a árvore do projeto `Patente_web`:
- Templates PI: `backend/templates/templates_pi/`
- Templates MU: `backend/templates/templates_mu/`
"""

import base64
import io
import shutil
import subprocess
import tempfile
import zipfile
from pathlib import Path
from typing import Dict, List, Optional

from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Mm
from docxtpl import DocxTemplate, InlineImage

from app.services.formatadores import formatar_header
from app.models.patent_schemas import (
    DesenhoItem,
    PacotePatenteUnion,
    PatenteMUCompleta,
    PatenteSoftwareCIICompleta,
    ReivindicacaoItem,
    RelatorioDescritivoMU,
    RelatorioDescritivoPI,
    ResumoPI,
)

# ==============================================================================
# MAPEAMENTO EXATO PARA A SUA PASTA `backend/templates/`
# ==============================================================================
# __file__ está em: backend/app/services/docx_generator.py
# .parent (services) -> .parent (app) -> .parent (backend)
DIRETORIO_BACKEND = Path(__file__).resolve().parent.parent.parent

PASTA_TEMPLATES_PI = DIRETORIO_BACKEND / "templates" / "templates_pi"
PASTA_TEMPLATES_MU = DIRETORIO_BACKEND / "templates" / "templates_mu"

TEMPLATE_RELATORIO_PI = PASTA_TEMPLATES_PI / "01_template_PI_relatorio_descritivo.docx"
TEMPLATE_REIVINDICACOES_PI = PASTA_TEMPLATES_PI / "02_Exemplo_de_PI_quadro_reinvendictorio.docx"
TEMPLATE_DESENHOS_PI = PASTA_TEMPLATES_PI / "03_Exemplo_de_PI _desenhos.docx"
TEMPLATE_RESUMO_PI = PASTA_TEMPLATES_PI / "04_Exemplo_de_PI_Resumo.docx"

TEMPLATE_RELATORIO_MU = PASTA_TEMPLATES_MU / "01_Exemplo_de_MU_Relatorio_Descritivo.docx"


# ==============================================================================
# FUNÇÕES AUXILIARES (ATUALIZAÇÃO DE PÁGINAS WORD + LIBREOFFICE HEADLESS)
# ==============================================================================
def habilitar_atualizacao_automatica_paginas(doc: DocxTemplate) -> None:
    """Força o Word a atualizar campos dinâmicos ({ PAGE } e { NUMPAGES }) ao abrir."""
    settings = getattr(doc, "settings", None) or getattr(doc.docx, "settings", None)
    if settings is not None:
        element = settings._element
        if not element.xpath("w:updateFields"):
            update_fields = OxmlElement("w:updateFields")
            update_fields.set(qn("w:val"), "true")
            element.append(update_fields)


def _salvar_doc_em_ram(doc: DocxTemplate) -> bytes:
    """Habilita a numeração de páginas e retorna os bytes do .docx em memória RAM."""
    habilitar_atualizacao_automatica_paginas(doc)
    buffer = io.BytesIO()
    doc.save(buffer)
    return buffer.getvalue()


def encontrar_executavel_libreoffice() -> Optional[str]:
    """Busca o executável `soffice` do LibreOffice no Windows ou Linux/Docker."""
    caminho = shutil.which("soffice") or shutil.which("libreoffice")
    if caminho:
        return caminho

    caminhos_padrao = [
        Path(r"C:\Program Files\LibreOffice\program\soffice.exe"),
        Path(r"C:\Program Files (x86)\LibreOffice\program\soffice.exe"),
        Path("/usr/bin/soffice"),
        Path("/usr/bin/libreoffice"),
        Path("/usr/local/bin/soffice"),
    ]
    for p in caminhos_padrao:
        if p.exists():
            return str(p)
    return None


def converter_bytes_docx_para_pdf_efemero(arquivos_docx_em_ram: Dict[str, bytes]) -> Dict[str, bytes]:
    """
    Converte os buffers .docx para .pdf usando um diretório temporário isolado que
    é automaticamente destruído pelo Python ao sair do bloco `with`.
    """
    soffice_bin = encontrar_executavel_libreoffice()
    if not soffice_bin:
        return {}

    pdfs_em_ram: Dict[str, bytes] = {}
    with tempfile.TemporaryDirectory(prefix="patente_ephemeral_") as temp_dir_str:
        temp_dir = Path(temp_dir_str)
        for nome_docx, bytes_docx in arquivos_docx_em_ram.items():
            arq_docx_temp = temp_dir / nome_docx
            arq_docx_temp.write_bytes(bytes_docx)

            comando = [
                soffice_bin,
                "--headless",
                "--convert-to",
                "pdf",
                "--outdir",
                str(temp_dir),
                str(arq_docx_temp),
            ]
            subprocess.run(comando, capture_output=True, text=True, timeout=60, check=False)

            arq_pdf_temp = arq_docx_temp.with_suffix(".pdf")
            if arq_pdf_temp.exists():
                pdfs_em_ram[arq_pdf_temp.name] = arq_pdf_temp.read_bytes()

    return pdfs_em_ram


# ==============================================================================
# GERADORES INDIVIDUAIS EM MEMÓRIA RAM
# ==============================================================================
def gerar_relatorio_pi_ram(dados: RelatorioDescritivoPI, tipo_header: str = "Patente de Invenção") -> bytes:
    doc = DocxTemplate(str(TEMPLATE_RELATORIO_PI))
    contexto = {
        "relatorio": dados.model_dump(),
        "header_title": formatar_header(tipo_header, dados.titulo, default="Relatório Descritivo"),
    }
    doc.render(contexto)
    return _salvar_doc_em_ram(doc)


def gerar_relatorio_mu_ram(dados: RelatorioDescritivoMU) -> bytes:
    doc = DocxTemplate(str(TEMPLATE_RELATORIO_MU))
    relatorio_dict = dados.model_dump()

    # Mapeamento e normalização das variáveis esperadas pelo template Word
    campo_val = dados.campo_modelo_de_utilidade or dados.campo_do_modelo or ""
    relatorio_dict["campo_modelo_de_utilidade"] = campo_val
    relatorio_dict["campo_do_modelo"] = campo_val

    exemplos_val = dados.exemplos_concretizacao_MU or dados.exemplos_concretizacao or ""
    relatorio_dict["exemplos_concretizacao_MU"] = exemplos_val
    relatorio_dict["exemplos_concretizacao"] = exemplos_val

    # Fundamentos (se não fornecidos, deixa espaço limpo sem erro)
    relatorio_dict["estado_da_tecnica_utilidade"] = dados.estado_da_tecnica_utilidade or dados.estado_da_tecnica or ""
    relatorio_dict["problema_e_vantagens_utilidade"] = dados.problema_e_vantagens_utilidade or dados.melhoria_funcional or ""

    # Se breve_descricao_desenhos foi preenchida em texto livre e a lista de desenhos não tem itens com descricao_breve
    if dados.breve_descricao_desenhos and not any(d.descricao_breve for d in dados.desenhos):
        relatorio_dict["desenhos"] = [{
            "numero_figura": "1",
            "descricao_breve": dados.breve_descricao_desenhos
        }]

    contexto = {
        "relatorio": relatorio_dict,
        "header_title": formatar_header("Modelo de Utilidade", dados.titulo, default="Relatório Descritivo - MU"),
    }
    doc.render(contexto)
    return _salvar_doc_em_ram(doc)


def gerar_quadro_reivindicatorio_ram(reivindicacoes: List[ReivindicacaoItem]) -> bytes:
    doc = DocxTemplate(str(TEMPLATE_REIVINDICACOES_PI))
    contexto = {
        "quadro_reivindicatorio": [r.model_dump() for r in reivindicacoes],
        "header_title": formatar_header("Quadro Reivindicatório", default="Quadro Reivindicatório"),
    }
    doc.render(contexto)
    return _salvar_doc_em_ram(doc)


def gerar_desenhos_ram(desenhos: List[DesenhoItem]) -> bytes:
    """Injeta as imagens Base64 diretamente da memória RAM (`io.BytesIO`) no Word."""
    doc = DocxTemplate(str(TEMPLATE_DESENHOS_PI))
    lista_desenhos_template = []

    for item in desenhos:
        if item.imagem_base64:
            stream_img = io.BytesIO(base64.b64decode(item.imagem_base64))
            img_obj = InlineImage(doc, stream_img, width=Mm(150))
            lista_desenhos_template.append({
                "imagem": img_obj,
                "numero_figura": item.numero_figura,
            })

    contexto = {
        "desenhos": lista_desenhos_template,
        "header_title": formatar_header("Desenhos", default="Desenhos"),
    }
    doc.render(contexto)
    return _salvar_doc_em_ram(doc)


def gerar_resumo_ram(resumo: ResumoPI) -> bytes:
    doc = DocxTemplate(str(TEMPLATE_RESUMO_PI))
    contexto = {
        "resumo": resumo.model_dump(),
        "header_title": formatar_header("Resumo", resumo.titulo, default="Resumo"),
    }
    doc.render(contexto)
    return _salvar_doc_em_ram(doc)


# ==============================================================================
# GERADOR DO PACOTE COMPLETO (.ZIP EM BYTESIO)
# ==============================================================================
def gerar_pacote_completo_em_ram(
    patente: PacotePatenteUnion,
    exportar_pdf: bool = False,
) -> io.BytesIO:
    """
    Monta os 4 documentos oficiais do INPI em memória RAM e retorna um buffer `.zip`.
    """
    patente.relatorio.desenhos = patente.desenhos
    sufixo = patente.modalidade  # "PI", "MU" ou "CII_SOFTWARE"
    arquivos_docx_ram: Dict[str, bytes] = {}

    # 1. Relatório Descritivo
    if isinstance(patente, PatenteMUCompleta):
        arquivos_docx_ram[f"01_Relatorio_Descritivo_{sufixo}.docx"] = gerar_relatorio_mu_ram(patente.relatorio)
    elif isinstance(patente, PatenteSoftwareCIICompleta):
        arquivos_docx_ram[f"01_Relatorio_Descritivo_{sufixo}.docx"] = gerar_relatorio_pi_ram(
            patente.relatorio, tipo_header="Patente de Invenção (CII)"
        )
    else:
        arquivos_docx_ram[f"01_Relatorio_Descritivo_{sufixo}.docx"] = gerar_relatorio_pi_ram(patente.relatorio)

    # 2. Quadro Reivindicatório
    arquivos_docx_ram[f"02_Quadro_Reivindicatorio_{sufixo}.docx"] = gerar_quadro_reivindicatorio_ram(
        patente.quadro_reivindicatorio
    )

    # 3. Desenhos (apenas se houver figuras com imagem_base64)
    if any(d.imagem_base64 for d in patente.desenhos):
        arquivos_docx_ram[f"03_Desenhos_{sufixo}.docx"] = gerar_desenhos_ram(patente.desenhos)

    # 4. Resumo
    arquivos_docx_ram[f"04_Resumo_{sufixo}.docx"] = gerar_resumo_ram(patente.resumo)

    # 5. Conversão opcional para PDF
    arquivos_pdf_ram: Dict[str, bytes] = {}
    if exportar_pdf:
        arquivos_pdf_ram = converter_bytes_docx_para_pdf_efemero(arquivos_docx_ram)

    # 6. Compactação em memória RAM
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, mode="w", compression=zipfile.ZIP_DEFLATED) as zipf:
        for nome_docx, conteudo_docx in arquivos_docx_ram.items():
            zipf.writestr(nome_docx, conteudo_docx)
        for nome_pdf, conteudo_pdf in arquivos_pdf_ram.items():
            zipf.writestr(nome_pdf, conteudo_pdf)

    zip_buffer.seek(0)
    return zip_buffer