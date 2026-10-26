import saveAs from "file-saver";
import { PacotePatentePayload } from "../features/patentes/types/TiposPatentes";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/**
 * Envia os dados estruturados da patente (PI, MU ou CII_SOFTWARE)
 * para o backend e realiza o download do pacote .zip gerado 100% em memória RAM.
 */
export async function exportarPacotePatenteApi(
    payload: PacotePatentePayload,
    exportarPdf: boolean = false
): Promise<void> {
    const url = `${API_BASE_URL}/api/v1/patents/export-package?exportar_pdf=${exportarPdf}`;

    const corpoRequisicao = {
        modalidade: payload.modalidade,
        relatorio: payload.relatorio,
        quadro_reivindicatorio: payload.quadro_reivindicatorio,
        desenhos: payload.desenhos,
        resumo: payload.resumo
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(corpoRequisicao)
    });

    if (!response.ok) {
        const errorJson = await response.json().catch(() => null);
        let mensagemErro = `Erro ao gerar documentos (HTTP ${response.status})`;

        if (errorJson?.detail) {
            if (Array.isArray(errorJson.detail)) {
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

    const blob = await response.blob();
    const nomeArquivo = `Pacote_Minutas_${payload.modalidade}.zip`;
    saveAs(blob, nomeArquivo);
}