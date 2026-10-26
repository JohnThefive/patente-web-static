import React from "react";
import {
    Check,
    FileText,
    ListOrdered,
    Image,
    Award,
    Settings,
    Download,
    Fingerprint,
    ClipboardCheck
} from "lucide-react";
import { ModalidadePatente } from "../types/TiposPatentes";

export interface StepItem {
    id: number;
    titulo: string;
    subtitulo: string;
    icone: React.ComponentType<{ size?: number; className?: string }>;
}

export const ETAPAS_WIZARD_PATENTE: StepItem[] = [
    {
        id: 1,
        titulo: "Modalidade",
        subtitulo: "Tipo de Proteção",
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

export const ETAPAS_WIZARD_RPC: StepItem[] = [
    {
        id: 1,
        titulo: "Modalidade & Dicas",
        subtitulo: "Triagem e Guia Legal",
        icone: Settings
    },
    {
        id: 2,
        titulo: "Gerador de Hash",
        subtitulo: "SHA-512 (128 hex)",
        icone: Fingerprint
    },
    {
        id: 3,
        titulo: "Checklist INPI",
        subtitulo: "GRU R$ 210, Gov.br e RPI",
        icone: ClipboardCheck
    }
];

interface WizardStepperProps {
    etapaAtual: number;
    modalidade?: ModalidadePatente;
    onSelecionarEtapa: (etapa: number) => void;
}

export const WizardStepper: React.FC<WizardStepperProps> = ({
    etapaAtual,
    modalidade = "PI",
    onSelecionarEtapa
}) => {
    const etapas = modalidade === "RPC" ? ETAPAS_WIZARD_RPC : ETAPAS_WIZARD_PATENTE;

    return (
        <nav className="stepper-nav" aria-label="Etapas do Pedido no INPI">
            {etapas.map((etapa) => {
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
