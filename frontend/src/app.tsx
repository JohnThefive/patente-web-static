import React, { useState, useRef } from "react";
import { usePatenteDraft } from "./hooks/usePatenteDraft";
import { WizardStepper } from "./features/patentes/components/WizardStepper";
import { StepModalidade } from "./features/patentes/components/StepModalidade";
import { StepRelatorio } from "./features/patentes/components/StepRelatorio";
import { StepReinvidicacoes } from "./features/patentes/components/StepReinvidicacoes";
import { StepDesenhos } from "./features/patentes/components/StepDesenhos";
import { StepResumo } from "./features/patentes/components/StepResumo";
import { StepExport } from "./features/patentes/components/StepExport";
import { StepRpcHash } from "./features/patentes/components/StepRpcHash";
import { StepRpcChecklist } from "./features/patentes/components/StepRpcChecklist";
import { obterPendenciasDaEtapa } from "./features/patentes/utils/validacaoEtapas";
import {
    FileText,
    Download,
    Upload,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Check,
    Loader2,
    ShieldCheck,
    FlaskConical,
    AlertTriangle
} from "lucide-react";

export const App: React.FC = () => {
    const [etapaAtual, setEtapaAtual] = useState<number>(1);
    const [tentouAvancarComErro, setTentouAvancarComErro] = useState<boolean>(false);
    const fileImportRef = useRef<HTMLInputElement>(null);

    const {
        rascunho,
        setRascunho,
        alterarModalidade,
        statusPersistencia,
        ultimoSalvamento,
        exportarRascunhoJson,
        importarRascunhoJson,
        carregarExemploTeste,
        resetarRascunho
    } = usePatenteDraft();

    const isRpc = rascunho.modalidade === "RPC";
    const totalEtapas = isRpc ? 3 : 6;
    const etapaEfetiva = Math.min(etapaAtual, totalEtapas);

    const pendenciasEtapaAtual = obterPendenciasDaEtapa(etapaEfetiva, rascunho);
    const etapaAtualValida = pendenciasEtapaAtual.length === 0;

    const handlePreencherExemplo = async () => {
        await carregarExemploTeste();
        setTentouAvancarComErro(false);
    };

    const handleImportarArquivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            await importarRascunhoJson(file);
            setTentouAvancarComErro(false);
            alert("Rascunho carregado com sucesso!");
        } catch (err: any) {
            alert(`Falha ao importar rascunho: ${err.message}`);
        } finally {
            if (fileImportRef.current) {
                fileImportRef.current.value = "";
            }
        }
    };

    const handleNovoRascunho = async () => {
        const confirmou = window.confirm(
            "Tem certeza que deseja iniciar um novo rascunho? Todos os dados não exportados serão substituídos."
        );
        if (confirmou) {
            await resetarRascunho();
            setEtapaAtual(1);
            setTentouAvancarComErro(false);
        }
    };

    const sincronizarTituloResumoSeNecessario = () => {
        if (!isRpc && etapaEfetiva === 5 && !rascunho.resumo.titulo.trim() && rascunho.relatorio.titulo.trim()) {
            setRascunho((ant) => ({
                ...ant,
                resumo: {
                    ...ant.resumo,
                    titulo: ant.relatorio.titulo
                }
            }));
        }
    };

    const avancarEtapa = () => {
        if (!etapaAtualValida) {
            setTentouAvancarComErro(true);
            return;
        }
        sincronizarTituloResumoSeNecessario();
        setTentouAvancarComErro(false);
        if (etapaEfetiva < totalEtapas) {
            setEtapaAtual(etapaEfetiva + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const voltarEtapa = () => {
        setTentouAvancarComErro(false);
        if (etapaEfetiva > 1) {
            setEtapaAtual(etapaEfetiva - 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleSelecionarEtapaStepper = (etapaDestino: number) => {
        if (etapaDestino <= etapaEfetiva) {
            setTentouAvancarComErro(false);
            setEtapaAtual(etapaDestino);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        // Verifica se todas as etapas até a etapa de destino estão válidas antes de permitir saltar à frente
        for (let passo = etapaEfetiva; passo < etapaDestino; passo++) {
            const pendenciasPasso = obterPendenciasDaEtapa(passo, rascunho);
            if (pendenciasPasso.length > 0) {
                setEtapaAtual(passo);
                setTentouAvancarComErro(true);
                return;
            }
        }

        sincronizarTituloResumoSeNecessario();
        setTentouAvancarComErro(false);
        setEtapaAtual(etapaDestino);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="app-container">
            {/* Input oculto para importação de rascunho JSON */}
            <input
                type="file"
                ref={fileImportRef}
                style={{ display: "none" }}
                accept=".json,application/json"
                onChange={handleImportarArquivo}
            />

            {/* Cabeçalho da Aplicação */}
            <header className="app-header">
                <div className="brand-wrapper">
                    <div className="brand-icon">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h1 className="brand-title">Patente_web</h1>
                        <p className="brand-subtitle">
                            Gerador de Minutas de Patentes e Assistente de Registro de Software (INPI)
                        </p>
                    </div>
                </div>

                <div className="header-actions">
                    {/* Status de Persistência no IndexedDB */}
                    <div
                        className={`save-status-pill ${statusPersistencia}`}
                        title={
                            ultimoSalvamento
                                ? `Salvo localmente às ${ultimoSalvamento.toLocaleTimeString()}`
                                : "Armazenado com segurança no seu navegador"
                        }
                    >
                        {statusPersistencia === "salvando" && <Loader2 size={13} className="animate-spin" />}
                        {statusPersistencia === "salvo" && <ShieldCheck size={14} />}
                        {statusPersistencia === "carregando" && <Loader2 size={13} className="animate-spin" />}
                        <span>
                            {statusPersistencia === "salvando" && "Salvando rascunho..."}
                            {statusPersistencia === "salvo" && "Salvo no navegador"}
                            {statusPersistencia === "carregando" && "Carregando..."}
                            {statusPersistencia === "erro" && "Erro ao salvar rascunho"}
                        </span>
                    </div>

                    {/* Botão de Exemplo para Teste */}
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handlePreencherExemplo}
                        title="Preencher todos os campos com dados de exemplo do INPI para a modalidade selecionada"
                        style={{ color: "var(--color-primary)", borderColor: "#bfdbfe", backgroundColor: "#eff6ff" }}
                    >
                        <FlaskConical size={14} /> Preencher Exemplo
                    </button>

                    {/* Botões de Ação Local-First */}
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={exportarRascunhoJson}
                        title="Baixar cópia de segurança em formato .json"
                    >
                        <Download size={14} /> Baixar Rascunho (.json)
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => fileImportRef.current?.click()}
                        title="Carregar rascunho salvo anteriormente"
                    >
                        <Upload size={14} /> Carregar Rascunho
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleNovoRascunho}
                        title="Limpar formulário e começar novo pedido"
                    >
                        <RotateCcw size={14} /> Limpar
                    </button>
                </div>
            </header>

            {/* Conteúdo Principal do Wizard */}
            <main className="main-content">
                {/* Stepper Dinâmico de Navegação (3 Etapas para e-RPC / 6 Etapas para Patentes) */}
                <WizardStepper
                    etapaAtual={etapaEfetiva}
                    modalidade={rascunho.modalidade}
                    onSelecionarEtapa={handleSelecionarEtapaStepper}
                />

                {/* Etapa 1: Comum a todas as modalidades (inclui Triagem RF01 e Dicas de Software) */}
                {etapaEfetiva === 1 && (
                    <StepModalidade
                        modalidade={rascunho.modalidade}
                        onAlterarModalidade={(novaModalidade) => {
                            alterarModalidade(novaModalidade);
                            setTentouAvancarComErro(false);
                        }}
                    />
                )}

                {/* FLUXO A: REGISTRO DE PROGRAMA DE COMPUTADOR (e-RPC — 3 Etapas Enxutas) */}
                {isRpc ? (
                    <>
                        {etapaEfetiva === 2 && (
                            <StepRpcHash
                                rpc={rascunho.rpc}
                                onChangeRpc={(novoRpc) =>
                                    setRascunho((ant) => ({
                                        ...ant,
                                        rpc: novoRpc
                                    }))
                                }
                            />
                        )}

                        {etapaEfetiva === 3 && (
                            <StepRpcChecklist
                                rpc={rascunho.rpc}
                                onChangeRpc={(novoRpc) =>
                                    setRascunho((ant) => ({
                                        ...ant,
                                        rpc: novoRpc
                                    }))
                                }
                            />
                        )}
                    </>
                ) : (
                    /* FLUXO B: PATENTES (PI, MU e CII_SOFTWARE — 6 Etapas) */
                    <>
                        {etapaEfetiva === 2 && (
                            <StepRelatorio
                                modalidade={rascunho.modalidade}
                                relatorio={rascunho.relatorio}
                                onChangeRelatorio={(novoRelatorio) =>
                                    setRascunho((ant) => ({ ...ant, relatorio: novoRelatorio }))
                                }
                            />
                        )}

                        {etapaEfetiva === 3 && (
                            <StepReinvidicacoes
                                reivindicacoes={rascunho.quadro_reivindicatorio}
                                onChangeReivindicacoes={(novasReivindicacoes) =>
                                    setRascunho((ant) => ({
                                        ...ant,
                                        quadro_reivindicatorio: novasReivindicacoes
                                    }))
                                }
                            />
                        )}

                        {etapaEfetiva === 4 && (
                            <StepDesenhos
                                modalidade={rascunho.modalidade}
                                desenhos={rascunho.desenhos}
                                onChangeDesenhos={(novosDesenhos) =>
                                    setRascunho((ant) => ({ ...ant, desenhos: novosDesenhos }))
                                }
                            />
                        )}

                        {etapaEfetiva === 5 && (
                            <StepResumo
                                resumo={rascunho.resumo}
                                tituloPadrao={rascunho.relatorio.titulo}
                                onChangeResumo={(novoResumo) =>
                                    setRascunho((ant) => ({ ...ant, resumo: novoResumo }))
                                }
                            />
                        )}

                        {etapaEfetiva === 6 && <StepExport payload={rascunho} />}
                    </>
                )}

                {/* Bloqueador Visual de Dados em Branco ou Inválidos na Etapa Atual */}
                {!etapaAtualValida && (
                    <div
                        className="warning-alert"
                        style={{
                            backgroundColor: tentouAvancarComErro ? "#fef2f2" : "#fffbeb",
                            borderColor: tentouAvancarComErro ? "#ef4444" : "#fde68a",
                            color: tentouAvancarComErro ? "#991b1b" : "#92400e",
                            borderWidth: tentouAvancarComErro ? "2px" : "1px"
                        }}
                    >
                        <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: "0.1rem" }} />
                        <div>
                            <strong>
                                {tentouAvancarComErro
                                    ? "Avanço bloqueado — preencha os campos obrigatórios abaixo para continuar:"
                                    : "Campos obrigatórios pendentes nesta etapa:"}
                            </strong>
                            <ul style={{ marginTop: "0.35rem", paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                                {pendenciasEtapaAtual.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Rodapé de Navegação do Wizard */}
                <footer className="wizard-footer">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={voltarEtapa}
                        disabled={etapaEfetiva === 1}
                    >
                        <ChevronLeft size={18} /> Voltar
                    </button>

                    <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", fontWeight: 500 }}>
                        Etapa <strong>{etapaEfetiva}</strong> de <strong>{totalEtapas}</strong>
                    </div>

                    {etapaEfetiva < totalEtapas ? (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={avancarEtapa}
                            style={!etapaAtualValida ? { opacity: 0.75 } : undefined}
                            title={
                                !etapaAtualValida
                                    ? "Preencha todos os campos obrigatórios desta etapa antes de avançar"
                                    : "Avançar para a próxima etapa"
                            }
                        >
                            Próximo <ChevronRight size={18} />
                        </button>
                    ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--color-success)", fontWeight: 600 }}>
                            <Check size={18} />{" "}
                            {isRpc ? "Checklist e Hash prontos para o INPI" : "Etapa final de exportação"}
                        </div>
                    )}
                </footer>
            </main>
        </div>
    );
};

export default App;
