/**
 * Serviço Local-First de Geração e Validação de Resumo Digital Hash (SHA-512).
 *
 * Opera 100% na memória do navegador utilizando a Web Crypto API nativa (`crypto.subtle`).
 * Nenhum byte do código-fonte do pesquisador trafega pela rede (Zero-Storage).
 */

export interface ValidacaoHashResultado {
    valido: boolean;
    tamanho: number;
    apenasHex: boolean;
    mensagem: string;
}

/**
 * Converte um ArrayBuffer binário em string hexadecimal minúscula (ex: 128 chars para SHA-512).
 */
function bufferParaHex(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    const hexPartes: string[] = [];
    for (let i = 0; i < bytes.length; i++) {
        hexPartes.push(bytes[i].toString(16).padStart(2, "0"));
    }
    return hexPartes.join("");
}

/**
 * [RF05] Gera o resumo digital Hash SHA-512 de um arquivo local (.zip, .pdf, código-fonte, etc.)
 * diretamente no navegador do usuário.
 */
export async function gerarHashSha512Arquivo(arquivo: File): Promise<string> {
    if (!window.crypto || !window.crypto.subtle) {
        throw new Error(
            "A Web Crypto API não está disponível neste contexto do navegador (acesse via localhost ou HTTPS)."
        );
    }

    const arrayBuffer = await arquivo.arrayBuffer();
    const digestBuffer = await window.crypto.subtle.digest("SHA-512", arrayBuffer);
    return bufferParaHex(digestBuffer);
}

/**
 * [RF05] Valida se a string informada ou gerada corresponde a um Hash SHA-512 válido
 * exigido pelo INPI (exatamente 128 caracteres hexadecimais: 0-9 e a-f).
 */
export function validarHashSha512(hash: string): ValidacaoHashResultado {
    const limpo = (hash || "").trim();
    const tamanho = limpo.length;

    if (tamanho === 0) {
        return {
            valido: false,
            tamanho: 0,
            apenasHex: true,
            mensagem: "Nenhum Hash informado. Selecione o pacote do código-fonte ou cole o Hash SHA-512."
        };
    }

    const apenasHex = /^[0-9a-fA-F]+$/.test(limpo);

    if (!apenasHex) {
        return {
            valido: false,
            tamanho,
            apenasHex: false,
            mensagem: "O Hash contém caracteres inválidos. São aceitos apenas dígitos hexadecimais (0-9 e A-F)."
        };
    }

    if (tamanho !== 128) {
        return {
            valido: false,
            tamanho,
            apenasHex: true,
            mensagem: `O algoritmo SHA-512 exige exatamente 128 caracteres hexadecimais (atual: ${tamanho} caracteres).`
        };
    }

    return {
        valido: true,
        tamanho: 128,
        apenasHex: true,
        mensagem: "Hash SHA-512 válido (128 caracteres hexadecimais verificados conforme padrão e-RPC/INPI)."
    };
}
