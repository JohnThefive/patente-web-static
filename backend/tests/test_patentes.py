# backend/tests/test_patentes.py
"""
Suíte de testes automatizados dos schemas Pydantic v2 e da geração efêmera (.zip/.docx em RAM)
para as modalidades PI, MU e CII_SOFTWARE.
"""

import io
import zipfile
import pytest
from pydantic import ValidationError
from fastapi.testclient import TestClient

from app.main import app
from app.models.patent_schemas import ReivindicacaoItem

client = TestClient(app)

RESUMO_60_PALAVRAS = " ".join(["tecnologia"] * 60)
# PNG transparente mínimo 1x1 válido em Base64 para testar renderização real de figura em RAM
PNG_1X1_BASE64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
)


def _montar_payload_pi_valido() -> dict:
    return {
        "modalidade": "PI",
        "relatorio": {
            "titulo": "SISTEMA DE MONITORAMENTO EM BORDA",
            "campo_da_invencao": "A presente invenção refere-se ao setor de sensores embarcados.",
            "estado_da_tecnica": "Os sistemas atuais consomem energia excessiva na transmissão contínua.",
            "problema_e_vantagens": "Soluciona o consumo elevado filtrando pacotes localmente com economia de 80%.",
            "paragrafos_descricao": [
                "Conforme a Figura 1, o sensor (10) envia sinais ao microcontrolador (20)."
            ],
            "exemplos_concretizacao": "Protótipo construído com microcontrolador de 3.3V em bancada.",
        },
        "quadro_reivindicatorio": [
            {
                "numero": 1,
                "tipo": "independente",
                "preambulo": "SISTEMA DE MONITORAMENTO compreendendo sensor",
                "dependencia": None,
                "caracterizacao": "possuir filtro digital adaptativo embarcado",
            }
        ],
        "desenhos": [],
        "resumo": {
            "titulo": "SISTEMA DE MONITORAMENTO EM BORDA",
            "texto": RESUMO_60_PALAVRAS,
        },
    }


def test_health_check():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "online"


def test_reivindicacao_limites_e_ponto_final_unico():
    # Preâmbulo < 5 caracteres deve falhar
    with pytest.raises(ValidationError):
        ReivindicacaoItem(
            numero=1,
            tipo="independente",
            preambulo="ABCD",
            caracterizacao="possuir elemento novo",
        )

    # Caracterização < 10 caracteres deve falhar
    with pytest.raises(ValidationError):
        ReivindicacaoItem(
            numero=1,
            tipo="independente",
            preambulo="DISPOSITIVO",
            caracterizacao="123456789",
        )

    # Pontos finais intermediários devem ser higienizados restando apenas 1 ponto final
    item = ReivindicacaoItem(
        numero=1,
        tipo="independente",
        preambulo="DISPOSITIVO. DE TESTE.",
        caracterizacao="compreender pino. guia.",
    )
    assert item.texto_formatado.endswith(".")
    assert item.texto_formatado.count(".") == 2  # "1." e o ponto final único


def test_exportar_pi_gera_zip_em_ram():
    payload = _montar_payload_pi_valido()
    resp = client.post("/api/v1/patents/export-package", json=payload)

    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/zip"

    with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
        nomes = zf.namelist()
        assert "01_Relatorio_Descritivo_PI.docx" in nomes
        assert "02_Quadro_Reivindicatorio_PI.docx" in nomes
        assert "04_Resumo_PI.docx" in nomes


def test_exportar_mu_aceita_zero_desenhos_em_ram():
    payload = {
        "modalidade": "MU",
        "relatorio": {
            "titulo": "DISPOSIÇÃO CONSTRUTIVA EM SUPORTE",
            "campo_modelo_de_utilidade": "Setor de suportes articulados para sensores.",
            "paragrafos_descricao": ["Corpo principal (10) dotado de trava rápida (20)."],
            "exemplos_concretizacao_MU": "Injetado em polímero ABS de alta resistência.",
        },
        "quadro_reivindicatorio": _montar_payload_pi_valido()["quadro_reivindicatorio"],
        "desenhos": [],
        "resumo": {
            "titulo": "DISPOSIÇÃO CONSTRUTIVA EM SUPORTE",
            "texto": RESUMO_60_PALAVRAS,
        },
    }
    resp = client.post("/api/v1/patents/export-package", json=payload)
    assert resp.status_code == 200

    with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
        assert "01_Relatorio_Descritivo_MU.docx" in zf.namelist()


def test_cii_software_regras_estritas_e_exportacao_com_desenho():
    payload = _montar_payload_pi_valido()
    payload["modalidade"] = "CII_SOFTWARE"
    payload["relatorio"]["efeito_tecnico_alcancado"] = "curto demais"  # 12 chars (< 15)
    payload["desenhos"] = []  # CII exige min_length=1

    # Deve falhar com 422 quando efeito técnico < 15 ou sem desenhos
    resp_erro = client.post("/api/v1/patents/export-package", json=payload)
    assert resp_erro.status_code == 422

    # Corrigindo efeito técnico (>= 15 chars) e incluindo 1 figura com imagem Base64
    payload["relatorio"]["efeito_tecnico_alcancado"] = (
        "Redução mensurável de 75% no uso de banda e corrente elétrica."
    )
    payload["desenhos"] = [
        {
            "numero_figura": "1",
            "descricao_breve": "Diagrama em blocos da arquitetura embarcada.",
            "imagem_base64": PNG_1X1_BASE64,
        }
    ]

    resp_ok = client.post("/api/v1/patents/export-package", json=payload)
    assert resp_ok.status_code == 200

    with zipfile.ZipFile(io.BytesIO(resp_ok.content)) as zf:
        nomes = zf.namelist()
        assert "01_Relatorio_Descritivo_CII_SOFTWARE.docx" in nomes
        assert "03_Desenhos_CII_SOFTWARE.docx" in nomes


def test_resumo_rejeita_fora_da_faixa_50_a_200_palavras():
    payload_curto = _montar_payload_pi_valido()
    payload_curto["resumo"]["texto"] = " ".join(["palavra"] * 49)
    assert client.post("/api/v1/patents/export-package", json=payload_curto).status_code == 422

    payload_longo = _montar_payload_pi_valido()
    payload_longo["resumo"]["texto"] = " ".join(["palavra"] * 201)
    assert client.post("/api/v1/patents/export-package", json=payload_longo).status_code == 422


def test_seguranca_autoescape_xml_previne_corrupcao_docx():
    """Garante que caracteres especiais XML (<, >, &) não quebrem nem injetem tags no .docx."""
    payload = _montar_payload_pi_valido()
    payload["relatorio"]["problema_e_vantagens"] = (
        "Opera em T < 50°C & P > 10 bar sem permitir <w:p><script>malicioso</script></w:p>."
    )
    resp = client.post("/api/v1/patents/export-package", json=payload)
    assert resp.status_code == 200
    assert resp.headers.get("x-content-type-options") == "nosniff"

    with zipfile.ZipFile(io.BytesIO(resp.content)) as outer_zip:
        docx_bytes = outer_zip.read("01_Relatorio_Descritivo_PI.docx")
        with zipfile.ZipFile(io.BytesIO(docx_bytes)) as docx_zip:
            xml_interno = docx_zip.read("word/document.xml").decode("utf-8")
            assert "&lt;script&gt;malicioso&lt;/script&gt;" in xml_interno
            assert "<script>malicioso</script>" not in xml_interno


def test_seguranca_rejeita_base64_sem_magic_bytes_png_ou_jpeg():
    """Bloqueia arquivos arbitrários/executáveis disfarçados em Base64 (sem assinatura PNG/JPEG)."""
    import base64

    falso_binario_b64 = base64.b64encode(b"MZ\x90\x00executavel_falso_disfarcado").decode("ascii")
    payload = _montar_payload_pi_valido()
    payload["desenhos"] = [
        {
            "numero_figura": "1",
            "descricao_breve": "Tentativa de envio de binário inválido",
            "imagem_base64": falso_binario_b64,
        }
    ]
    resp = client.post("/api/v1/patents/export-package", json=payload)
    assert resp.status_code == 422


def test_seguranca_limite_maximo_desenhos_anti_dos():
    """Bloqueia pacotes que excedam o limite de 20 figuras (proteção contra exaustão de RAM)."""
    payload = _montar_payload_pi_valido()
    payload["desenhos"] = [
        {
            "numero_figura": str(i),
            "descricao_breve": f"Figura técnica {i}",
            "imagem_base64": None,
        }
        for i in range(1, 22)  # 21 figuras (máximo permitido = 20)
    ]
    resp = client.post("/api/v1/patents/export-package", json=payload)
    assert resp.status_code == 422

