import { ReivindicacaoItem } from "../../features/patentes/types/TiposPatentes";

/**
 * Utilitários de formatação textual e higienização para injeção nos templates DOCX
 * em estrita conformidade com as Instruções Normativas do INPI (IN 30/2013 e Portaria 14/2024).
 */

/**
 * Formata o cabeçalho (`header_title`) injetado nos templates Word.
 * Exemplo: "Patente de Invenção - SISTEMA INTELIGENTE DE RASTREAMENTO"
 *
 * @param secao Nome da seção ou modalidade (ex: "Patente de Invenção", "Resumo", "Quadro Reivindicatório")
 * @param tituloInvencao Título da patente, se aplicável
 * @param fallback Valor padrão de fallback
 */
export function formatarHeader(
    secao: string,
    tituloInvencao?: string | null,
    fallback: string = "Relatório Descritivo"
): string {
    const secaoLimpa = (secao || fallback).trim();
    if (tituloInvencao && tituloInvencao.trim()) {
        return `${secaoLimpa} - ${tituloInvencao.trim().toUpperCase()}`;
    }
    return secaoLimpa;
}

/**
 * Formata o texto completo de uma reivindicação para injeção direta no documento Word.
 * Atende às diretrizes do Art. 4º, VII da INPI nº 30/2013:
 * - Inicia com o número de ordem seguido de ponto e espaço.
 * - Inclui o preâmbulo com a categoria do objeto.
 * - Para dependentes: faz a vinculação correta ("de acordo com a reivindicação X").
 * - Conecta com a expressão de transição ("caracterizado por").
 * - Assegura a ausência de pontuações duplicadas e finaliza com um ÚNICO ponto final.
 *
 * @param item Objeto contendo os dados da reivindicação
 */
export function formatarTextoReivindicacao(item: ReivindicacaoItem): string {
    const preambulo = (item.preambulo || "").trim().replace(/\.+$/, "");
    let caracterizacao = (item.caracterizacao || "").trim().replace(/\.+$/, "");

    // Normaliza caso o usuário já tenha iniciado a caracterização com "caracterizado por" ou "caracterizada por"
    caracterizacao = caracterizacao.replace(/^(caracterizado|caracterizada)\s+por\s+/i, "");

    let corpo: string;
    if (item.tipo === "dependente" && item.dependencia) {
        corpo = `${preambulo}, de acordo com a reivindicação ${item.dependencia}, caracterizado por ${caracterizacao}`;
    } else {
        corpo = `${preambulo}, caracterizado por ${caracterizacao}`;
    }

    const corpoHigienizado = corpo.trim().replace(/\.+$/, "");
    return `${item.numero}. ${corpoHigienizado}.`;
}

/**
 * Higieniza parágrafos de texto livre garantindo que cada parágrafo termine com ponto
 * e não contenha quebras de linha ou espaçamentos múltiplos indesejados.
 */
export function higienizarParagrafo(texto: string): string {
    const limpo = texto.trim().replace(/\s+/g, " ");
    if (!limpo) return "";
    return limpo.endsWith(".") ? limpo : `${limpo}.`;
}
