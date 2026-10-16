import saveAs from "file-saver";
import { PacotePatentePayload } from "../features/patentes/types/TiposPatentes";

const API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Envia os dados estruturados da patente para o backend e realiza o download do .zip em memória.
 */
export async function exportarPacotePatenteApi(
    payload: PacotePatentePayload,
    exportarPdf: boolean = false
): Promise<void> {
    const url = `${API_BASE_URL}/api/v1/patents/export-package?exportar_pdf=${exportarPdf}`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorJson = await response.json().catch(() => null);
        let mensagemErro = `Erro ao gerar minutas (HTTP ${response.status})`;

        if (errorJson?.detail) {
            if (Array.isArray(errorJson.detail)) {
                // Formato padrão de erro de validação do Pydantic / FastAPI
                mensagemErro = errorJson.detail
                    .map((err: any) => {
                        const campo = Array.isArray(err.loc) ? err.loc.join(" -> ") : "campo";
                        return `• ${campo}: ${err.msg}`;
                    })
                    .join("\n");
            } else if (typeof errorJson.detail === "string") {
                mensagemErro = errorJson.detail;
            } else {
                mensagemErro = JSON.stringify(errorJson.detail);
            }
        }

        throw new Error(mensagemErro);
    }

    // Recebe o stream binário em memória e aciona o download nativo do navegador
    const blob = await response.blob();
    const nomeArquivo = `Pacote_Minutas_${payload.modalidade}.zip`;
    saveAs(blob, nomeArquivo);
}