import { ModalidadePatente } from "../../features/patentes/types/TiposPatentes";

/**
 * Serviço responsável por carregar e cachear em memória RAM os modelos .docx
 * a partir do diretório estático público (/templates/...).
 */

// Cache em memória RAM para evitar downloads redundantes na mesma sessão
const templateCache = new Map<string, ArrayBuffer>();

/**
 * Retorna a URL completa e normalizada para um arquivo de template,
 * respeitando o base URL configurado pelo Vite (compatível com GitHub Pages).
 */
export function getTemplateUrl(caminhoRelativo: string): string {
    const baseUrl = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
    const caminhoLimpo = caminhoRelativo.replace(/^\//, "");
    const path = `${baseUrl}/templates/${caminhoLimpo}`;

    // Em ambiente de teste Node.js/Vitest, fetch exige URL absoluta
    if (typeof window === "undefined" && !path.startsWith("http")) {
        return `http://localhost${path}`;
    }

    return path;
}

/**
 * Realiza o download de um template DOCX como ArrayBuffer e o armazena no cache local.
 *
 * @param caminhoRelativo Caminho relativo dentro da pasta /templates (ex: "templates_pi/04_Exemplo_de_PI_Resumo.docx")
 */
export async function carregarTemplate(caminhoRelativo: string): Promise<ArrayBuffer> {
    const chave = caminhoRelativo.replace(/^\//, "");

    if (templateCache.has(chave)) {
        // Retorna uma cópia do buffer para não corromper o cache durante mutações do zip
        return templateCache.get(chave)!.slice(0);
    }

    const url = getTemplateUrl(chave);

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(
            `Não foi possível carregar o modelo de documento em "${url}". Código HTTP: ${response.status} (${response.statusText})`
        );
    }

    const arrayBuffer = await response.arrayBuffer();
    templateCache.set(chave, arrayBuffer);
    return arrayBuffer.slice(0);
}

/**
 * Obtém o ArrayBuffer do modelo de Relatório Descritivo correspondente à modalidade informada.
 */
export async function obterTemplateRelatorio(modalidade: ModalidadePatente): Promise<ArrayBuffer> {
    switch (modalidade) {
        case "MU":
            return carregarTemplate("templates_mu/01_Exemplo_de_MU_Relatorio_Descritivo.docx");
        case "CII_SOFTWARE":
            return carregarTemplate("templates_cii/01_template_CII_relatorio_descritivo.docx");
        case "PI":
        default:
            return carregarTemplate("templates_pi/01_template_PI_relatorio_descritivo.docx");
    }
}

/**
 * Obtém o ArrayBuffer do modelo oficial de Quadro Reivindicatório.
 */
export async function obterTemplateQuadro(): Promise<ArrayBuffer> {
    return carregarTemplate("templates_pi/02_Exemplo_de_PI_quadro_reinvendictorio.docx");
}

/**
 * Obtém o ArrayBuffer do modelo oficial de Desenhos e Figuras Técnicas.
 */
export async function obterTemplateDesenhos(): Promise<ArrayBuffer> {
    return carregarTemplate("templates_pi/03_Exemplo_de_PI _desenhos.docx");
}

/**
 * Obtém o ArrayBuffer do modelo oficial de Resumo.
 */
export async function obterTemplateResumo(): Promise<ArrayBuffer> {
    return carregarTemplate("templates_pi/04_Exemplo_de_PI_Resumo.docx");
}

/**
 * Limpa o cache em memória RAM. Útil para testes unitários ou recarregamentos.
 */
export function limparCacheTemplates(): void {
    templateCache.clear();
}
