/**
 * Tipos TypeScript sincronizados com os schemas Pydantic v2 do backend
 * e com o assistente local de Registro de Programa de Computador (e-RPC).
 */

export type ModalidadePatente = "PI" | "MU" | "CII_SOFTWARE" | "RPC";

export interface ReivindicacaoItem {
    numero: number;
    tipo: "independente" | "dependente";
    preambulo: string;
    dependencia: number | null;
    caracterizacao: string;
}

export interface DesenhoItem {
    numero_figura: string;
    imagem_base64?: string | null;
    descricao_breve: string;
}

export interface ResumoPI {
    titulo: string;
    texto: string;
}

export interface RelatorioDescritivoPI {
    titulo: string;
    campo_da_invencao: string;
    estado_da_tecnica: string;
    problema_e_vantagens: string;
    desenhos?: DesenhoItem[];
    paragrafos_descricao: string[];
    exemplos_concretizacao: string;
    // Campos específicos de Software vinculado a Hardware (CII - Resolução 158/2016)
    efeito_tecnico_alcancado?: string;
    arquitetura_execucao?: string;
}

export interface RelatorioDescritivoMU {
    titulo: string;
    campo_modelo_de_utilidade: string;
    campo_do_modelo?: string;
    breve_descricao_desenhos?: string;
    desenhos?: DesenhoItem[];
    paragrafos_descricao: string[];
    exemplos_concretizacao_MU: string;
    exemplos_concretizacao?: string;
    estado_da_tecnica?: string;
    melhoria_funcional?: string;
    estado_da_tecnica_utilidade?: string;
    problema_e_vantagens_utilidade?: string;
}

// ============================================================================
// REGISTRO DE PROGRAMA DE COMPUTADOR (e-RPC / Lei nº 9.609/1998)
// Fluxo enxuto: Dicas Estratégicas + Gerador de Hash SHA-512 + Checklist INPI
// ============================================================================

export interface RegistroSoftwareRPCDraft {
    hash_resumo: string;
    nome_arquivo_hash: string;
    numero_gru: string;
    numero_protocolo: string;
    gru_emitida: boolean;
    gru_paga: boolean;
    hash_gerado: boolean;
    dv_assinada_govbr: boolean;
    procuracao_aplicavel: boolean;
    pedido_protocolado: boolean;
    rpi_acompanhada: boolean;
}

export interface PacotePatentePayload {
    modalidade: ModalidadePatente;
    relatorio: RelatorioDescritivoPI | RelatorioDescritivoMU;
    quadro_reivindicatorio: ReivindicacaoItem[];
    desenhos: DesenhoItem[];
    resumo: ResumoPI;
    rpc: RegistroSoftwareRPCDraft;
}