import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { ResumoPI } from "../../../features/patentes/types/TiposPatentes";
import { obterTemplateResumo } from "../templateLoader";

/**
 * Gera a minuta do Resumo formal da patente em formato DOCX binário (Uint8Array),
 * com o título em caixa alta e o texto devidamente ajustado.
 *
 * @param resumo Dados do resumo contendo título e corpo de texto
 */
export async function gerarResumoDocx(resumo: ResumoPI): Promise<Uint8Array> {
    const templateBuffer = await obterTemplateResumo();
    const zip = new PizZip(templateBuffer);

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true
    });

    const tituloUpper = (resumo.titulo || "").trim().toUpperCase();
    const textoLimpo = (resumo.texto || "").trim();

    doc.render({
        titulo: tituloUpper,
        texto: textoLimpo
    });

    const outputBuffer = doc.getZip().generate({
        type: "uint8array",
        compression: "DEFLATE"
    });

    return outputBuffer;
}
