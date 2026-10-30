import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import {
    ModalidadePatente,
    RelatorioDescritivoPI,
    RelatorioDescritivoMU,
    DesenhoItem
} from "../../../features/patentes/types/TiposPatentes";
import { obterTemplateRelatorio } from "../templateLoader";
import { higienizarParagrafo } from "../docxFormatters";

/**
 * Gera a minuta do Relatório Descritivo oficial em formato DOCX binário (Uint8Array)
 * suportando as modalidades PI, MU e CII_SOFTWARE.
 *
 * @param modalidade Modalidade da patente ("PI", "MU" ou "CII_SOFTWARE")
 * @param relatorio Dados do relatório preenchidos pelo usuário
 * @param desenhos Lista de figuras/desenhos anexados para a breve descrição
 */
export async function gerarRelatorioDocx(
    modalidade: ModalidadePatente,
    relatorio: RelatorioDescritivoPI | RelatorioDescritivoMU,
    desenhos: DesenhoItem[] = []
): Promise<Uint8Array> {
    const templateBuffer = await obterTemplateRelatorio(modalidade);
    const zip = new PizZip(templateBuffer);

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true
    });

    const tituloUpper = (relatorio.titulo || "").trim().toUpperCase();

    // Mapeamento dos parágrafos da descrição detalhada
    const paragrafosDescricao = (relatorio.paragrafos_descricao || [])
        .map((p) => ({ texto: higienizarParagrafo(p) }))
        .filter((item) => item.texto.length > 0);

    // Mapeamento das figuras para a seção de Breve Descrição dos Desenhos
    const listaDesenhos = desenhos.map((d) => ({
        numero_figura: d.numero_figura,
        descricao_breve: d.descricao_breve.trim()
    }));

    let dadosContexto: Record<string, any> = {
        titulo: tituloUpper,
        desenhos: listaDesenhos,
        paragrafos_descricao: paragrafosDescricao
    };

    if (modalidade === "MU") {
        const mu = relatorio as RelatorioDescritivoMU;
        dadosContexto = {
            ...dadosContexto,
            campo_modelo_de_utilidade: (mu.campo_modelo_de_utilidade || mu.campo_do_modelo || "").trim(),
            estado_da_tecnica_utilidade: (mu.estado_da_tecnica_utilidade || mu.estado_da_tecnica || "").trim(),
            problema_e_vantagens_utilidade: (mu.problema_e_vantagens_utilidade || mu.melhoria_funcional || "").trim(),
            exemplos_concretizacao_MU: (mu.exemplos_concretizacao_MU || mu.exemplos_concretizacao || "").trim()
        };
    } else if (modalidade === "CII_SOFTWARE") {
        const cii = relatorio as RelatorioDescritivoPI;
        const temArquitetura = Boolean(cii.arquitetura_execucao && cii.arquitetura_execucao.trim().length > 0);

        dadosContexto = {
            ...dadosContexto,
            campo_da_invencao: (cii.campo_da_invencao || "").trim(),
            estado_da_tecnica: (cii.estado_da_tecnica || "").trim(),
            problema_e_vantagens: (cii.problema_e_vantagens || "").trim(),
            efeito_tecnico_alcancado: (cii.efeito_tecnico_alcancado || "").trim(),
            has_arquitetura: temArquitetura,
            arquitetura_execucao: (cii.arquitetura_execucao || "").trim(),
            exemplos_concretizacao: (cii.exemplos_concretizacao || "").trim()
        };
    } else {
        // Modalidade PI padrão
        const pi = relatorio as RelatorioDescritivoPI;
        dadosContexto = {
            ...dadosContexto,
            campo_da_invencao: (pi.campo_da_invencao || "").trim(),
            estado_da_tecnica: (pi.estado_da_tecnica || "").trim(),
            problema_e_vantagens: (pi.problema_e_vantagens || "").trim(),
            exemplos_concretizacao: (pi.exemplos_concretizacao || "").trim()
        };
    }

    doc.render(dadosContexto);

    const outputBuffer = doc.getZip().generate({
        type: "uint8array",
        compression: "DEFLATE"
    });

    return outputBuffer;
}
