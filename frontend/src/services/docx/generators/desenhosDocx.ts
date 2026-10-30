import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { DesenhoItem } from "../../../features/patentes/types/TiposPatentes";
import { obterTemplateDesenhos } from "../templateLoader";

/**
 * Gera a minuta de Desenhos e Pranchas Técnicas oficial do INPI em formato DOCX binário (Uint8Array).
 * Itera sobre todas as figuras cadastradas, gerando suas respectivas legendas oficiais ("Figura X: Descrição").
 *
 * @param desenhos Lista de pranchas/figuras da patente
 */
export async function gerarDesenhosDocx(desenhos: DesenhoItem[]): Promise<Uint8Array> {
    const templateBuffer = await obterTemplateDesenhos();
    const zip = new PizZip(templateBuffer);

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true
    });

    const listaDesenhos = desenhos.map((d) => ({
        numero_figura: d.numero_figura,
        descricao_breve: d.descricao_breve ? d.descricao_breve.trim() : `Figura ${d.numero_figura}`
    }));

    doc.render({
        desenhos: listaDesenhos
    });

    const outputBuffer = doc.getZip().generate({
        type: "uint8array",
        compression: "DEFLATE"
    });

    return outputBuffer;
}
