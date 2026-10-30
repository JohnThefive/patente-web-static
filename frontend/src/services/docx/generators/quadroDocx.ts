import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { ReivindicacaoItem } from "../../../features/patentes/types/TiposPatentes";
import { obterTemplateQuadro } from "../templateLoader";
import { formatarTextoReivindicacao } from "../docxFormatters";

/**
 * Gera a minuta do Quadro Reivindicatório oficial do INPI em formato DOCX binário (Uint8Array),
 * formatando reivindicações independentes e dependentes conforme o Art. 4º, VII da IN 30/2013.
 *
 * @param reivindicacoes Lista ordenada de reivindicações da patente
 */
export async function gerarQuadroDocx(reivindicacoes: ReivindicacaoItem[]): Promise<Uint8Array> {
    const templateBuffer = await obterTemplateQuadro();
    const zip = new PizZip(templateBuffer);

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true
    });

    const quadroFormatado = reivindicacoes.map((item) => ({
        numero: item.numero,
        texto_formatado: formatarTextoReivindicacao(item)
    }));

    doc.render({
        quadro_reivindicatorio: quadroFormatado
    });

    const outputBuffer = doc.getZip().generate({
        type: "uint8array",
        compression: "DEFLATE"
    });

    return outputBuffer;
}
