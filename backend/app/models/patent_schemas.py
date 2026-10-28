# backend/app/models/patent_schemas.py
"""
Módulo de Modelagem e Validação de Dados de Patentes e Software (Padrão INPI).

Baseado nas regras da IN 30/2013, Portaria 14/2024, Resolução 158/2016 e Lei 9.609/98, suportando:
- Patente de Invenção (PI)
- Modelo de Utilidade (MU)
- Invenção Implementada por Computador / Software com Hardware (CII_SOFTWARE)
- Registro de Programa de Computador / e-RPC (RPC)
"""

import base64
from datetime import date
import re
from typing import Annotated, List, Literal, Optional, Union
from pydantic import BaseModel, Field, computed_field, field_validator, model_validator


# ==============================================================================
# 1. QUADRO REIVINDICATÓRIO (IN 30/2013)
# ==============================================================================
class ReivindicacaoItem(BaseModel):
    """
    Representa uma reivindicação individual.
    O campo computado `texto_formatado` une preâmbulo, dependência e caracterização
    garantindo um único ponto final no parágrafo conforme o Art. 4º, VII da IN 30/2013.
    """

    numero: int = Field(..., ge=1, description="Número da reivindicação (1, 2, 3...)")
    tipo: Literal["independente", "dependente"] = Field(
        default="independente",
        description="Define se a reivindicação é 'independente' ou 'dependente'",
    )
    preambulo: str = Field(
        ...,
        min_length=5,
        description="Categoria e características genéricas (ex: SISTEMA DE MONITORAMENTO...)",
    )
    dependencia: Optional[int] = Field(
        default=None,
        description="Número da reivindicação vinculada caso seja dependente",
    )
    caracterizacao: str = Field(
        ...,
        min_length=10,
        description="Texto após a expressão 'caracterizado por' com a matéria pleiteada",
    )

    @field_validator("preambulo", "caracterizacao")
    @classmethod
    def sem_ponto_intermediario(cls, v: str) -> str:
        """Art. 4º, VII da IN 30/2013: cada reivindicação deve ter apenas um ponto final."""
        texto = v.strip()
        if "." in texto:
            texto = texto.replace(".", "")
        return texto

    @model_validator(mode="after")
    def validar_dependencia(self) -> "ReivindicacaoItem":
        """Valida se reivindicações dependentes referenciam um número anterior válido."""
        if self.tipo == "dependente":
            if not self.dependencia:
                raise ValueError(
                    f"A reivindicação {self.numero} é dependente e exige o campo 'dependencia'."
                )
            if self.dependencia >= self.numero:
                raise ValueError(
                    f"A reivindicação {self.numero} só pode depender de uma anterior (recebido: {self.dependencia})."
                )
        return self

    @computed_field
    @property
    def texto_formatado(self) -> str:
        """Monta o texto completo da reivindicação para injeção direta no template Word."""
        if self.tipo == "dependente" and self.dependencia:
            corpo = (
                f"{self.preambulo}, de acordo com a reivindicação {self.dependencia}, "
                f"caracterizado por {self.caracterizacao}"
            )
        else:
            corpo = f"{self.preambulo}, caracterizado por {self.caracterizacao}"

        corpo_limpo = corpo.strip().rstrip(".")
        return f"{self.numero}. {corpo_limpo}."


# ==============================================================================
# 2. DESENHOS (Portaria 14/2024 - Processamento em Memória via Base64 Blindado)
# ==============================================================================
# ~5 MB binários equivalem a ~6.8 MB em Base64
MAX_BASE64_IMAGE_CHARS = 7_000_000
MAX_DESENHOS_POR_PACOTE = 20
MAX_REIVINDICACOES_POR_PACOTE = 50

MAGIC_BYTES_PNG = b"\x89PNG\r\n\x1a\n"
MAGIC_BYTES_JPEG = b"\xff\xd8\xff"


class DesenhoItem(BaseModel):
    """
    Representa uma figura técnica enviada pelo frontend React em formato Base64.
    Valida limite de memória (anti-DoS/OOM) e assinatura binária real (magic bytes PNG/JPEG).
    """

    numero_figura: str = Field(
        ...,
        min_length=1,
        max_length=20,
        description="Identificador da figura (ex: '1', '2A')",
    )
    imagem_base64: Optional[str] = Field(
        default=None,
        max_length=MAX_BASE64_IMAGE_CHARS,
        description="Dados da imagem codificados em Base64 (PNG/JPEG, máx. ~5 MB) enviados via API",
    )
    descricao_breve: str = Field(
        default="",
        max_length=1000,
        description="Descrição sucinta para a seção 'Breve Descrição dos Desenhos'",
    )

    @field_validator("imagem_base64")
    @classmethod
    def limpar_e_validar_base64(cls, v: Optional[str]) -> Optional[str]:
        """Remove eventual prefixo Data URL, valida Base64 e verifica magic bytes PNG/JPEG."""
        if not v:
            return None
        if "," in v and v.startswith("data:image"):
            v = v.split(",", 1)[1]
        v = v.strip()
        if len(v) > MAX_BASE64_IMAGE_CHARS:
            raise ValueError("A imagem excede o limite máximo permitido de 5 MB.")
        try:
            dados_binarios = base64.b64decode(v, validate=True)
        except Exception as exc:
            raise ValueError("String Base64 da imagem inválida.") from exc

        if not (
            dados_binarios.startswith(MAGIC_BYTES_PNG)
            or dados_binarios.startswith(MAGIC_BYTES_JPEG)
        ):
            raise ValueError(
                "Formato de imagem não permitido: envie apenas arquivos PNG ou JPEG autênticos."
            )
        return v


# ==============================================================================
# 3. RESUMO (50 a 200 palavras)
# ==============================================================================
class ResumoPI(BaseModel):
    """Modelo para validação do Resumo (entre 50 e 200 palavras)."""

    titulo: str = Field(..., min_length=5, description="Título da invenção")
    texto: str = Field(..., description="Resumo em parágrafo único (50 a 200 palavras)")

    @field_validator("texto")
    @classmethod
    def validar_contagem_palavras(cls, v: str) -> str:
        qtd_palavras = len(v.strip().split())
        if qtd_palavras < 50 or qtd_palavras > 200:
            raise ValueError(
                f"O resumo deve conter entre 50 e 200 palavras. Atualmente possui {qtd_palavras} palavras."
            )
        return v


# ==============================================================================
# 4. RELATÓRIOS DESCRITIVOS (PI, MU e SOFTWARE/JOGOS)
# ==============================================================================
class RelatorioDescritivoPI(BaseModel):
    """Campos esperados pelo template `01_template_PI_relatorio_descritivo.docx`."""

    titulo: str = Field(..., min_length=5)
    campo_da_invencao: str = Field(..., min_length=10)
    estado_da_tecnica: str = Field(..., min_length=10)
    problema_e_vantagens: str = Field(..., min_length=10)
    desenhos: List[DesenhoItem] = Field(default_factory=list)
    paragrafos_descricao: List[str] = Field(default_factory=list)
    exemplos_concretizacao: str = Field(..., min_length=10)


class RelatorioDescritivoMU(BaseModel):
    """Campos esperados pelo template `01_Exemplo_de_MU_Relatorio_Descritivo.docx`."""

    titulo: str = Field(
        ...,
        min_length=5,
        description="Título do modelo (ex: DISPOSIÇÃO CONSTRUTIVA EM SUPORTE ARTICULADO)",
    )
    campo_modelo_de_utilidade: Optional[str] = Field(
        default="",
        description="Campo do modelo de utilidade",
    )
    campo_do_modelo: Optional[str] = Field(
        default="",
        description="Alias retrocompatível para campo_modelo_de_utilidade",
    )
    breve_descricao_desenhos: Optional[str] = Field(
        default="",
        description="Breve descrição dos desenhos",
    )
    estado_da_tecnica: Optional[str] = Field(default="")
    melhoria_funcional: Optional[str] = Field(default="")
    estado_da_tecnica_utilidade: Optional[str] = Field(default="")
    problema_e_vantagens_utilidade: Optional[str] = Field(default="")
    desenhos: List[DesenhoItem] = Field(
        default_factory=list,
        description="Figuras técnicas do modelo de utilidade",
    )
    paragrafos_descricao: List[str] = Field(
        default_factory=list,
        description="Descrição do modelo de utilidade",
    )
    exemplos_concretizacao_MU: Optional[str] = Field(
        default="",
        description="Exemplos de concretizações do modelo de utilidade",
    )
    exemplos_concretizacao: Optional[str] = Field(default="")


class RelatorioDescritivoSoftwareCII(RelatorioDescritivoPI):
    """
    Expansão para Patentes de Software e Jogos Digitais (Resolução INPI nº 158/2016).
    Herda os campos de PI para usar o mesmo template Word, exigindo a comprovação de efeito técnico.
    """

    efeito_tecnico_alcancado: str = Field(
        ...,
        min_length=15,
        description="Efeito técnico concreto alcançado pelo algoritmo/mecânica (Art. 10 da LPI).",
    )
    arquitetura_execucao: Optional[str] = Field(
        default=None,
        description="Hardware, sensores embarcados ou arquitetura cliente-servidor onde opera.",
    )


# ==============================================================================
# 5. PACOTES COMPLETOS (UNIÃO DISCRIMINADA POR 'modalidade')
# ==============================================================================
class PatentePICompleta(BaseModel):
    """Pacote completo de Patente de Invenção (PI)."""

    modalidade: Literal["PI"] = "PI"
    relatorio: RelatorioDescritivoPI
    quadro_reivindicatorio: List[ReivindicacaoItem] = Field(
        ..., min_length=1, max_length=MAX_REIVINDICACOES_POR_PACOTE
    )
    desenhos: List[DesenhoItem] = Field(
        default_factory=list, max_length=MAX_DESENHOS_POR_PACOTE
    )
    resumo: ResumoPI


class PatenteMUCompleta(BaseModel):
    """Pacote completo de Modelo de Utilidade (MU)."""

    modalidade: Literal["MU"] = "MU"
    relatorio: RelatorioDescritivoMU
    quadro_reivindicatorio: List[ReivindicacaoItem] = Field(
        ..., min_length=1, max_length=MAX_REIVINDICACOES_POR_PACOTE
    )
    desenhos: List[DesenhoItem] = Field(
        default_factory=list, max_length=MAX_DESENHOS_POR_PACOTE
    )
    resumo: ResumoPI


class PatenteSoftwareCIICompleta(BaseModel):
    """Pacote completo para Invenção Implementada por Computador (CII - Resolução 158/2016)."""

    modalidade: Literal["CII_SOFTWARE"] = "CII_SOFTWARE"
    relatorio: RelatorioDescritivoSoftwareCII
    quadro_reivindicatorio: List[ReivindicacaoItem] = Field(
        ..., min_length=1, max_length=MAX_REIVINDICACOES_POR_PACOTE
    )
    desenhos: List[DesenhoItem] = Field(
        ..., min_length=1, max_length=MAX_DESENHOS_POR_PACOTE
    )
    resumo: ResumoPI


PacotePatenteUnion = Annotated[
    Union[PatentePICompleta, PatenteMUCompleta, PatenteSoftwareCIICompleta],
    Field(discriminator="modalidade"),
]