import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { DesenhoItem } from "../../../features/patentes/types/TiposPatentes";
import { obterTemplateDesenhos } from "../templateLoader";

const LARGURA_PADRAO_EMU = 5400000; // 150 mm (1 mm = 36000 EMUs)
const ALTURA_MAXIMA_EMU = 7200000; // 200 mm

interface ImagemExtraida {
    bytes: Uint8Array;
    extensao: "png" | "jpg";
    cx: number;
    cy: number;
}

/**
 * Lê as dimensões reais (largura x altura em pixels) de um buffer PNG ou JPEG
 * para preservar a proporção original da figura na prancha técnica.
 */
function obterDimensoesImagem(bytes: Uint8Array): { width: number; height: number } {
    // Verifica assinatura PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
        bytes.length >= 24 &&
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47
    ) {
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const width = view.getUint32(16, false);
        const height = view.getUint32(20, false);
        if (width > 0 && height > 0) {
            return { width, height };
        }
    }

    // Verifica assinatura JPEG: FF D8
    if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
        let offset = 2;
        while (offset + 9 < bytes.length) {
            if (bytes[offset] !== 0xff) {
                offset++;
                continue;
            }
            const marker = bytes[offset + 1];
            if (marker === 0xff) {
                offset++;
                continue;
            }
            // Marcadores SOF (Start of Frame) que contêm altura e largura
            if (
                (marker >= 0xc0 && marker <= 0xc3) ||
                (marker >= 0xc5 && marker <= 0xc7) ||
                (marker >= 0xc9 && marker <= 0xcb) ||
                (marker >= 0xcd && marker <= 0xcf)
            ) {
                const height = (bytes[offset + 5] << 8) | bytes[offset + 6];
                const width = (bytes[offset + 7] << 8) | bytes[offset + 8];
                if (width > 0 && height > 0) {
                    return { width, height };
                }
                break;
            }
            const segmentLength = (bytes[offset + 2] << 8) | bytes[offset + 3];
            if (segmentLength < 2) break;
            offset += 2 + segmentLength;
        }
    }

    // Proporção padrão 4:3 caso não seja possível extrair do cabeçalho binário
    return { width: 400, height: 300 };
}

/**
 * Decodifica uma string Base64 (com ou sem prefixo Data URL) em bytes binários
 * e calcula as dimensões em EMUs (English Metric Units) do OpenXML.
 */
function decodificarImagemBase64(base64Input: string): ImagemExtraida | null {
    const limpo = base64Input.trim();
    if (!limpo) return null;

    let extensao: "png" | "jpg" = "png";
    let payloadBase64 = limpo;

    const matchDataUrl = limpo.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,([\s\S]+)$/);
    if (matchDataUrl) {
        const subtipo = matchDataUrl[1].toLowerCase();
        if (subtipo === "jpeg" || subtipo === "jpg") {
            extensao = "jpg";
        }
        payloadBase64 = matchDataUrl[2];
    }

    const base64Puro = payloadBase64.replace(/\s+/g, "");
    if (!base64Puro) return null;

    const binarioStr = atob(base64Puro);
    const bytes = new Uint8Array(binarioStr.length);
    for (let i = 0; i < binarioStr.length; i++) {
        bytes[i] = binarioStr.charCodeAt(i);
    }

    // Se começou com FF D8, garante extensão jpg mesmo sem prefixo data URL
    if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8) {
        extensao = "jpg";
    }

    const { width, height } = obterDimensoesImagem(bytes);
    let cx = LARGURA_PADRAO_EMU;
    let cy = Math.round(LARGURA_PADRAO_EMU * (height / width));

    if (cy > ALTURA_MAXIMA_EMU) {
        cy = ALTURA_MAXIMA_EMU;
        cx = Math.round(ALTURA_MAXIMA_EMU * (width / height));
    }

    return { bytes, extensao, cx, cy };
}

/**
 * Constrói o parágrafo OpenXML contendo o bloco <w:drawing> inline para o relacionamento rId.
 */
function construirParagrafoDrawingXml(
    idNum: number,
    rId: string,
    nomeArquivo: string,
    cx: number,
    cy: number
): string {
    return (
        `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing>` +
        `<wp:inline distT="0" distB="0" distL="0" distR="0">` +
        `<wp:extent cx="${cx}" cy="${cy}"/>` +
        `<wp:effectExtent l="0" t="0" r="0" b="0"/>` +
        `<wp:docPr id="${idNum}" name="Figura ${idNum}"/>` +
        `<wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr>` +
        `<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">` +
        `<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
        `<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
        `<pic:nvPicPr><pic:cNvPr id="${idNum}" name="${nomeArquivo}"/><pic:cNvPicPr/></pic:nvPicPr>` +
        `<pic:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>` +
        `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>` +
        `<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>` +
        `</pic:pic></a:graphicData></a:graphic>` +
        `</wp:inline></w:drawing></w:r></w:p>`
    );
}

/**
 * Gera a minuta de Desenhos e Pranchas Técnicas oficial do INPI em formato DOCX binário (Uint8Array).
 * Injeta as imagens Base64 em word/media/, registra os relacionamentos OpenXML e gera as legendas oficiais.
 *
 * @param desenhos Lista de pranchas/figuras da patente
 */
export async function gerarDesenhosDocx(desenhos: DesenhoItem[]): Promise<Uint8Array> {
    const templateBuffer = await obterTemplateDesenhos();
    const zip = new PizZip(templateBuffer);

    const relsPath = "word/_rels/document.xml.rels";
    let relsXml = zip.file(relsPath)?.asText() || "";
    const novasRels: string[] = [];

    const listaDesenhos = desenhos.map((d, index) => {
        const idx = index + 1;
        let imagemXml = "";

        if (d.imagem_base64 && d.imagem_base64.trim().length > 0) {
            const extraida = decodificarImagemBase64(d.imagem_base64);
            if (extraida) {
                const nomeArquivo = `figura_${idx}.${extraida.extensao}`;
                const rId = `rIdImg${idx}`;

                zip.file(`word/media/${nomeArquivo}`, extraida.bytes);
                novasRels.push(
                    `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${nomeArquivo}"/>`
                );

                imagemXml = construirParagrafoDrawingXml(
                    idx,
                    rId,
                    nomeArquivo,
                    extraida.cx,
                    extraida.cy
                );
            }
        }

        return {
            numero_figura: d.numero_figura,
            descricao_breve: d.descricao_breve ? d.descricao_breve.trim() : `Figura ${d.numero_figura}`,
            imagem_xml: imagemXml
        };
    });

    if (novasRels.length > 0 && relsXml.includes("</Relationships>")) {
        relsXml = relsXml.replace("</Relationships>", `${novasRels.join("")}</Relationships>`);
        zip.file(relsPath, relsXml);
    }

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true
    });

    doc.render({
        desenhos: listaDesenhos
    });

    const outputBuffer = doc.getZip().generate({
        type: "uint8array",
        compression: "DEFLATE"
    });

    return outputBuffer;
}

