/**
 * Tipos TypeScript sincronizados com os schemas Pydantic do backend.
 */

export type ModalidadePatente = "PI" | "MU" | "CII_SOFTWARE";

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
    // Campos específicos de Software / Jogos Digitais (CII)
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

export interface PacotePatentePayload {
    modalidade: ModalidadePatente;
    relatorio: RelatorioDescritivoPI | RelatorioDescritivoMU;
    quadro_reivindicatorio: ReivindicacaoItem[];
    desenhos: DesenhoItem[];
    resumo: ResumoPI;
}