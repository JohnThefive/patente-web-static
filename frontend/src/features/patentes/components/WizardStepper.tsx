import React from "react";
import { Check, FileText, ListOrdered, Image, Award, Settings, Download } from "lucide-react";

export interface StepItem {
    id: number;
    titulo: string;
    subtitulo: string;
    icone: React.ComponentType<{ size?: number; className?: string }>;
}

export const ETAPAS_WIZARD: StepItem[] = [
    {
        id: 1,
        titulo: "Modalidade",
        subtitulo: "Tipo de Patente",
        icone: Settings
    },
    {
        id: 2,
        titulo: "Relatório",
        subtitulo: "Descrição Técnica",
        icone: FileText
    },
    {
        id: 3,
        titulo: "Reivindicações",
        subtitulo: "Quadro Formal",
        icone: ListOrdered
    },
    {
        id: 4,
        titulo: "Desenhos",
        subtitulo: "Figuras Técnicas",
        icone: Image
    },
    {
        id: 5,
        titulo: "Resumo",
        subtitulo: "Síntese do Pedido",
        icone: Award
    },
    {
        id: 6,
        titulo: "Exportação",
        subtitulo: "Geração de Minutas",
        icone: Download
    }
];

interface WizardStepperProps {
    etapaAtual: number;
    onSelecionarEtapa: (etapa: number) => void;
}

export const WizardStepper: React.FC<WizardStepperProps> = ({
    etapaAtual,
    onSelecionarEtapa
}) => {
    return (
        <nav className="stepper-nav" aria-label="Etapas do Pedido de Patente">
            {ETAPAS_WIZARD.map((etapa) => {
                const isActive = etapa.id === etapaAtual;
                const isCompleted = etapa.id < etapaAtual;
                const IconeComponent = etapa.icone;

                return (
                    <button
                        key={etapa.id}
                        type="button"
                        onClick={() => onSelecionarEtapa(etapa.id)}
                        className={`stepper-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                        aria-current={isActive ? "step" : undefined}
                    >
                        <div className="stepper-circle">
                            {isCompleted ? <Check size={16} /> : <IconeComponent size={16} />}
                        </div>
                        <div className="stepper-text">
                            <span className="stepper-step-label">Passo {etapa.id}</span>
                            <span className="stepper-title">{etapa.titulo}</span>
                        </div>
                    </button>
                );
            })}
        </nav>
    );
};
