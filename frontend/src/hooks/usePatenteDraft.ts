import { useState, useEffect, useCallback, useRef } from "react";
import { get, set, del } from "idb-keyval";
import saveAs from "file-saver";
import {
    PacotePatentePayload,
    ModalidadePatente,
    RelatorioDescritivoPI,
    RelatorioDescritivoMU
} from "../features/patentes/types/TiposPatentes";
import { useDebounce } from "./useDebounce";

const IDB_KEY_RASCUNHO = "patente_draft_v1";

export const RASCUNHO_PADRAO: PacotePatentePayload = {
    modalidade: "PI",
    relatorio: {
        titulo: "",
        campo_da_invencao: "",
        estado_da_tecnica: "",
        problema_e_vantagens: "",
        paragrafos_descricao: [""],
        exemplos_concretizacao: "",
        desenhos: [],
        efeito_tecnico_alcancado: "",
        arquitetura_execucao: ""
    },
    quadro_reivindicatorio: [
        {
            numero: 1,
            tipo: "independente",
            preambulo: "",
            dependencia: null,
            caracterizacao: ""
        }
    ],
    desenhos: [],
    resumo: {
        titulo: "",
        texto: ""
    }
};

export type StatusPersistencia = "carregando" | "salvo" | "salvando" | "erro";

export function usePatenteDraft() {
    const [rascunho, setRascunho] = useState<PacotePatentePayload>(RASCUNHO_PADRAO);
    const [statusPersistencia, setStatusPersistencia] = useState<StatusPersistencia>("carregando");
    const [ultimoSalvamento, setUltimoSalvamento] = useState<Date | null>(null);
    const isCarregadoRef = useRef(false);

    // Carrega o rascunho do IndexedDB na inicialização
    useEffect(() => {
        let isMounted = true;
        get<PacotePatentePayload>(IDB_KEY_RASCUNHO)
            .then((dadosSalvos) => {
                if (!isMounted) return;
                if (dadosSalvos) {
                    setRascunho(dadosSalvos);
                }
                isCarregadoRef.current = true;
                setStatusPersistencia("salvo");
            })
            .catch((err) => {
                console.error("Erro ao carregar rascunho do IndexedDB:", err);
                if (isMounted) {
                    isCarregadoRef.current = true;
                    setStatusPersistencia("erro");
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // Debounce do rascunho para persistir sem travar a digitação
    const rascunhoDebounced = useDebounce(rascunho, 600);

    // Salva automaticamente no IndexedDB sempre que o debounced alterar
    useEffect(() => {
        if (!isCarregadoRef.current) return;

        setStatusPersistencia("salvando");
        set(IDB_KEY_RASCUNHO, rascunhoDebounced)
            .then(() => {
                setStatusPersistencia("salvo");
                setUltimoSalvamento(new Date());
            })
            .catch((err) => {
                console.error("Erro ao salvar rascunho no IndexedDB:", err);
                setStatusPersistencia("erro");
            });
    }, [rascunhoDebounced]);

    // Atualiza a modalidade ajustando o payload conforme necessário
    const alterarModalidade = useCallback((novaModalidade: ModalidadePatente) => {
        setRascunho((anterior) => {
            if (anterior.modalidade === novaModalidade) return anterior;

            if (novaModalidade === "MU") {
                const relatorioAtual = anterior.relatorio as any;
                const campoVal = relatorioAtual.campo_modelo_de_utilidade || relatorioAtual.campo_do_modelo || relatorioAtual.campo_da_invencao || "";
                const exemplosVal = relatorioAtual.exemplos_concretizacao_MU || relatorioAtual.exemplos_concretizacao || "";

                const novoRelatorioMU: RelatorioDescritivoMU = {
                    titulo: relatorioAtual.titulo || "",
                    campo_modelo_de_utilidade: campoVal,
                    campo_do_modelo: campoVal,
                    breve_descricao_desenhos: relatorioAtual.breve_descricao_desenhos || "",
                    desenhos: anterior.desenhos || [],
                    paragrafos_descricao: relatorioAtual.paragrafos_descricao || [""],
                    exemplos_concretizacao_MU: exemplosVal,
                    exemplos_concretizacao: exemplosVal
                };
                return {
                    ...anterior,
                    modalidade: "MU",
                    relatorio: novoRelatorioMU
                };
            } else {
                // PI ou CII_SOFTWARE
                const relatorioAtual = anterior.relatorio as any;
                const campoVal = relatorioAtual.campo_da_invencao || relatorioAtual.campo_modelo_de_utilidade || relatorioAtual.campo_do_modelo || "";
                const exemplosVal = relatorioAtual.exemplos_concretizacao || relatorioAtual.exemplos_concretizacao_MU || "";

                const novoRelatorioPI: RelatorioDescritivoPI = {
                    titulo: relatorioAtual.titulo || "",
                    campo_da_invencao: campoVal,
                    estado_da_tecnica: relatorioAtual.estado_da_tecnica || "",
                    problema_e_vantagens: relatorioAtual.problema_e_vantagens || "",
                    desenhos: anterior.desenhos || [],
                    paragrafos_descricao: relatorioAtual.paragrafos_descricao || [""],
                    exemplos_concretizacao: exemplosVal,
                    efeito_tecnico_alcancado: relatorioAtual.efeito_tecnico_alcancado || "",
                    arquitetura_execucao: relatorioAtual.arquitetura_execucao || ""
                };
                return {
                    ...anterior,
                    modalidade: novaModalidade,
                    relatorio: novoRelatorioPI
                };
            }
        });
    }, []);

    // Exporta o rascunho como arquivo JSON para backup local (ignora imagem_base64 mantendo apenas textos e metadados)
    const exportarRascunhoJson = useCallback(() => {
        const rascunhoSemImagens: PacotePatentePayload = {
            ...rascunho,
            desenhos: (rascunho.desenhos || []).map((d) => ({
                numero_figura: d.numero_figura,
                descricao_breve: d.descricao_breve,
                imagem_base64: null
            }))
        };

        const jsonString = JSON.stringify(rascunhoSemImagens, null, 2);
        const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
        const dataStr = new Date().toISOString().slice(0, 10);
        saveAs(blob, `Rascunho_Patente_${rascunho.modalidade}_${dataStr}.json`);
    }, [rascunho]);

    // Importa um rascunho de arquivo JSON
    const importarRascunhoJson = useCallback((file: File): Promise<void> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const conteudo = event.target?.result as string;
                    const dados = JSON.parse(conteudo) as PacotePatentePayload;
                    if (!dados.modalidade || !dados.relatorio || !dados.quadro_reivindicatorio) {
                        throw new Error("Arquivo JSON inválido ou incompatível com o formato de rascunho.");
                    }
                    setRascunho(dados);
                    await set(IDB_KEY_RASCUNHO, dados);
                    setStatusPersistencia("salvo");
                    setUltimoSalvamento(new Date());
                    resolve();
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error("Falha ao ler o arquivo selecionado."));
            reader.readAsText(file);
        });
    }, []);

    // Reseta todo o rascunho para o padrão
    const resetarRascunho = useCallback(async () => {
        await del(IDB_KEY_RASCUNHO);
        setRascunho(RASCUNHO_PADRAO);
        setStatusPersistencia("salvo");
        setUltimoSalvamento(new Date());
    }, []);

    // Preenche com o exemplo de teste completo
    const carregarExemploTeste = useCallback(async () => {
        const { EXEMPLO_TESTE_PATENTE } = await import("../features/patentes/data/exemploTeste");
        setRascunho(EXEMPLO_TESTE_PATENTE);
        await set(IDB_KEY_RASCUNHO, EXEMPLO_TESTE_PATENTE);
        setStatusPersistencia("salvo");
        setUltimoSalvamento(new Date());
    }, []);

    return {
        rascunho,
        setRascunho,
        alterarModalidade,
        statusPersistencia,
        ultimoSalvamento,
        exportarRascunhoJson,
        importarRascunhoJson,
        carregarExemploTeste,
        resetarRascunho
    };
}
