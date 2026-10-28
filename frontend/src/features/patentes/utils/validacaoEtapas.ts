import {
    PacotePatentePayload,
    RelatorioDescritivoPI,
    RelatorioDescritivoMU
} from "../types/TiposPatentes";
import { validarHashSha512 } from "../../../services/hashGenerator";

/**
 * Valida os campos obrigatórios de cada etapa do Wizard sincronizado
 * com os schemas Pydantic v2 do backend (`patent_schemas.py`).
 */
export function obterPendenciasDaEtapa(etapa: number, rascunho: PacotePatentePayload): string[] {
    const pendencias: string[] = [];
    const { modalidade } = rascunho;

    if (etapa === 1) {
        return pendencias;
    }

    // Validação do fluxo enxuto de Software Puro (e-RPC — 3 Etapas)
    if (modalidade === "RPC") {
        if (etapa === 2) {
            const validacaoHash = validarHashSha512(rascunho.rpc.hash_resumo);
            if (!validacaoHash.valido) {
                pendencias.push(
                    "Resumo Digital Hash SHA-512: selecione o arquivo do código-fonte (.zip/.pdf) ou informe um Hash válido com exatamente 128 caracteres hexadecimais (0-9, a-f)."
                );
            }
        }
        return pendencias;
    }

    // Validação do fluxo de Patentes (PI, MU e CII_SOFTWARE — 6 Etapas)
    if (etapa === 2) {
        const rel = rascunho.relatorio;
        if ((rel.titulo || "").trim().length < 5) {
            pendencias.push("Título no Relatório Descritivo (mínimo de 5 caracteres).");
        }
        const possuiParagrafoValido = (rel.paragrafos_descricao || []).some(
            (p) => p.trim().length >= 15
        );
        if (!possuiParagrafoValido) {
            pendencias.push("Ao menos 1 parágrafo de Descrição Detalhada preenchido (mínimo de 15 caracteres).");
        }

        if (modalidade === "MU") {
            const relMu = rel as RelatorioDescritivoMU;
            const campoMu = (relMu.campo_modelo_de_utilidade || relMu.campo_do_modelo || "").trim();
            const exemplosMu = (relMu.exemplos_concretizacao_MU || relMu.exemplos_concretizacao || "").trim();
            if (campoMu.length < 10) {
                pendencias.push("Campo do Modelo de Utilidade (mínimo de 10 caracteres).");
            }
            if (exemplosMu.length < 10) {
                pendencias.push("Exemplos de Concretizações do Modelo de Utilidade (mínimo de 10 caracteres).");
            }
        } else {
            const relPi = rel as RelatorioDescritivoPI;
            if ((relPi.campo_da_invencao || "").trim().length < 10) {
                pendencias.push("Campo da Invenção (mínimo de 10 caracteres).");
            }
            if ((relPi.estado_da_tecnica || "").trim().length < 10) {
                pendencias.push("Estado da Técnica (mínimo de 10 caracteres).");
            }
            if ((relPi.problema_e_vantagens || "").trim().length < 10) {
                pendencias.push("Problema Solucionado e Vantagens (mínimo de 10 caracteres).");
            }
            if ((relPi.exemplos_concretizacao || "").trim().length < 10) {
                pendencias.push("Exemplos de Concretizações da Invenção (mínimo de 10 caracteres).");
            }
            if (modalidade === "CII_SOFTWARE") {
                if ((relPi.efeito_tecnico_alcancado || "").trim().length < 15) {
                    pendencias.push(
                        "Efeito Técnico Alcançado (obrigatório pela Resolução INPI nº 158/2016, mín. 15 caracteres)."
                    );
                }
            }
        }
    }

    if (etapa === 3) {
        if (!rascunho.quadro_reivindicatorio || rascunho.quadro_reivindicatorio.length === 0) {
            pendencias.push("Inclua ao menos 1 reivindicação no Quadro Reivindicatório.");
        } else {
            rascunho.quadro_reivindicatorio.forEach((r) => {
                if (r.preambulo.trim().length < 5) {
                    pendencias.push(`Reivindicação #${r.numero}: preencha o Preâmbulo (mín. 5 caracteres).`);
                }
                if (r.caracterizacao.trim().length < 10) {
                    pendencias.push(`Reivindicação #${r.numero}: preencha a Caracterização (mín. 10 caracteres).`);
                }
            });
        }
    }

    if (etapa === 4) {
        // Sincronizado com o backend: CII_SOFTWARE exige min_length=1 nos desenhos; MU permite 0 desenhos nos testes
        if (modalidade === "CII_SOFTWARE" && rascunho.desenhos.length === 0) {
            pendencias.push(
                "Patente de Software (CII) exige obrigatoriamente ao menos 1 figura ou fluxograma técnico (Resolução INPI nº 158/2016)."
            );
        }
        rascunho.desenhos.forEach((fig, idx) => {
            if (!fig.numero_figura.trim()) {
                pendencias.push(`Figura #${idx + 1}: informe o número/identificação da figura.`);
            }
            if (fig.descricao_breve.trim().length < 3) {
                pendencias.push(
                    `Figura ${fig.numero_figura || idx + 1}: preencha a descrição breve (mín. 3 caracteres).`
                );
            }
        });
    }

    if (etapa === 5) {
        const tituloResumo = (rascunho.resumo.titulo || rascunho.relatorio.titulo || "").trim();
        if (tituloResumo.length < 5) {
            pendencias.push("Título do Resumo (mínimo de 5 caracteres).");
        }
        const textoResumo = (rascunho.resumo.texto || "").trim();
        const qtdPalavras = textoResumo ? textoResumo.split(/\s+/).filter(Boolean).length : 0;
        if (qtdPalavras < 50 || qtdPalavras > 200) {
            pendencias.push(
                `Texto do Resumo deve conter entre 50 e 200 palavras (atual: ${qtdPalavras} palavras).`
            );
        }
    }

    return pendencias;
}
