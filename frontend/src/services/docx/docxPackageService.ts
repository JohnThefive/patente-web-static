import JSZip from "jszip";
import saveAs from "file-saver";
import { PacotePatentePayload } from "../../features/patentes/types/TiposPatentes";
import {
    gerarRelatorioDocx,
    gerarQuadroDocx,
    gerarResumoDocx,
    gerarDesenhosDocx
} from "./generators";

/**
 * Orquestra a geração dos 4 documentos oficiais do INPI 100% em memória RAM
 * no navegador do usuário e realiza o download do arquivo .zip final.
 *
 * @param payload Dados consolidados do formulário da patente
 */
export async function exportarPacotePatenteLocal(payload: PacotePatentePayload): Promise<void> {
    const { modalidade, relatorio, quadro_reivindicatorio, desenhos, resumo } = payload;
    const sufixo = modalidade; // "PI", "MU" ou "CII_SOFTWARE"
    const zip = new JSZip();

    // 1. Gera os documentos necessários em paralelo na memória RAM
    const [relatorioBytes, quadroBytes, resumoBytes, desenhosBytes] = await Promise.all([
        gerarRelatorioDocx(modalidade, relatorio, desenhos),
        gerarQuadroDocx(quadro_reivindicatorio),
        gerarResumoDocx(resumo),
        desenhos && desenhos.length > 0 ? gerarDesenhosDocx(desenhos) : Promise.resolve(null)
    ]);

    // 2. Adiciona os arquivos .docx gerados no arquivo .zip com a nomenclatura oficial
    zip.file(`01_Relatorio_Descritivo_${sufixo}.docx`, relatorioBytes);
    zip.file(`02_Quadro_Reivindicatorio_${sufixo}.docx`, quadroBytes);

    if (desenhosBytes) {
        zip.file(`03_Desenhos_${sufixo}.docx`, desenhosBytes);
    }

    zip.file(`04_Resumo_${sufixo}.docx`, resumoBytes);

    // 3. Compacta o pacote em memória RAM
    const blob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
            level: 9
        }
    });

    // 4. Dispara o download automático no navegador
    const nomeArquivo = `Pacote_Minutas_${sufixo}.zip`;
    saveAs(blob, nomeArquivo);
}