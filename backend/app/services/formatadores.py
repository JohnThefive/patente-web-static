
"""
Funções utilitárias de formatação textual para cabeçalhos e títulos dos templates Word.
"""

from typing import Optional


def formatar_header(
    secao: str,
    titulo_invencao: Optional[str] = None,
    default: str = "Relatório Descritivo",
) -> str:
    """
    Formata o cabeçalho (`header_title`) injetado nos templates `.docx`.

    Args:
        secao (str): Nome da seção ou modalidade (ex: 'Patente de Invenção', 'Resumo').
        titulo_invencao (Optional[str]): Título da patente, se aplicável ao cabeçalho.
        default (str): Texto padrão de fallback.

    Returns:
        str: Cabeçalho formatado e higienizado.
    """
    secao_limpa = (secao or default).strip()
    if titulo_invencao and titulo_invencao.strip():
        return f"{secao_limpa} - {titulo_invencao.strip().upper()}"
    return secao_limpa