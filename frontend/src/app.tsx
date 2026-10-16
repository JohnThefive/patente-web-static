import React, { useState, useRef } from "react";
import { usePatenteDraft } from "./hooks/usePatenteDraft";
import { WizardStepper } from "./features/patentes/components/WizardStepper";
import { StepModalidade } from "./features/patentes/components/StepModalidade";
import { StepRelatorio } from "./features/patentes/components/StepRelatorio";
import { StepReinvidicacoes } from "./features/patentes/components/StepReinvidicacoes";
import { StepDesenhos } from "./features/patentes/components/StepDesenhos";
import { StepResumo } from "./features/patentes/components/StepResumo";
import { StepExport } from "./features/patentes/components/StepExport";
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
    FlaskConical
} from "lucide-react";

export const App: React.FC = () => {
    const [etapaAtual, setEtapaAtual] = useState<number>(1);
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

    const handlePreencherExemplo = async () => {
        await carregarExemploTeste();
    };

    const handleImportarArquivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            await importarRascunhoJson(file);
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
        }
    };

    const avancarEtapa = () => {
        if (etapaAtual < 6) {
            setEtapaAtual((prev) => prev + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const voltarEtapa = () => {
        if (etapaAtual > 1) {
            setEtapaAtual((prev) => prev - 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
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
                            Gerador de Minutas e Peças Formais do INPI 
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
                        title="Preencher todos os campos com o exemplo de teste do INPI"
                        style={{ color: "var(--color-primary)", borderColor: "#bfdbfe", backgroundColor: "#eff6ff" }}
                    >
                        <FlaskConical size={14} /> Preencher Exemplo
                    </button>

                    {/* Botões de Ação Local-First */}
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={exportarRascunhoJson}
                        title="Baixar cópia de segurança em formato .json (apenas textos)"
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
                {/* Stepper de Navegação em 6 Etapas */}
                <WizardStepper
                    etapaAtual={etapaAtual}
                    onSelecionarEtapa={(etapa) => {
                        setEtapaAtual(etapa);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                />

                {/* Renderização da Etapa Selecionada */}
                {etapaAtual === 1 && (
                    <StepModalidade
                        modalidade={rascunho.modalidade}
                        onAlterarModalidade={alterarModalidade}
                    />
                )}

                {etapaAtual === 2 && (
                    <StepRelatorio
                        modalidade={rascunho.modalidade}
                        relatorio={rascunho.relatorio}
                        onChangeRelatorio={(novoRelatorio) =>
                            setRascunho((ant) => ({ ...ant, relatorio: novoRelatorio }))
                        }
                    />
                )}

                {etapaAtual === 3 && (
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

                {etapaAtual === 4 && (
                    <StepDesenhos
                        modalidade={rascunho.modalidade}
                        desenhos={rascunho.desenhos}
                        onChangeDesenhos={(novosDesenhos) =>
                            setRascunho((ant) => ({ ...ant, desenhos: novosDesenhos }))
                        }
                    />
                )}

                {etapaAtual === 5 && (
                    <StepResumo
                        resumo={rascunho.resumo}
                        tituloPadrao={rascunho.relatorio.titulo}
                        onChangeResumo={(novoResumo) =>
                            setRascunho((ant) => ({ ...ant, resumo: novoResumo }))
                        }
                    />
                )}

                {etapaAtual === 6 && (
                    <StepExport
                        payload={rascunho}
                    />
                )}

                {/* Rodapé de Navegação do Wizard */}
                <footer className="wizard-footer">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={voltarEtapa}
                        disabled={etapaAtual === 1}
                    >
                        <ChevronLeft size={18} /> Voltar
                    </button>

                    <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", fontWeight: 500 }}>
                        Etapa <strong>{etapaAtual}</strong> de <strong>6</strong>
                    </div>

                    {etapaAtual < 6 ? (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={avancarEtapa}
                        >
                            Próximo <ChevronRight size={18} />
                        </button>
                    ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--color-success)", fontWeight: 600 }}>
                            <Check size={18} /> Etapa final de exportação
                        </div>
                    )}
                </footer>
            </main>
        </div>
    );
};

export default App;
