import React from "react";
import { ModalidadePatente } from "../types/TiposPatentes";
import { Cpu, Wrench, Sparkles, Info } from "lucide-react";

interface StepModalidadeProps {
    modalidade: ModalidadePatente;
    onAlterarModalidade: (novaModalidade: ModalidadePatente) => void;
}

export const StepModalidade: React.FC<StepModalidadeProps> = ({
    modalidade,
    onAlterarModalidade
}) => {
    return (
        <div className="step-card">
            <div className="step-card-header">
                <h2 className="step-card-title">
                    <Sparkles size={22} className="text-primary" />
                    1. Escolha a Modalidade de Proteção
                </h2>
                <p className="step-card-desc">
                    Selecione a categoria adequada conforme a Lei de Propriedade Industrial (Lei nº 9.279/1996) e as diretrizes normativas do INPI.
                </p>
            </div>

            <div className="modalidade-grid">
                {/* PI */}
                <div
                    className={`modalidade-card ${modalidade === "PI" ? "selected" : ""}`}
                    onClick={() => onAlterarModalidade("PI")}
                    role="button"
                    tabIndex={0}
                >
                    <span className="modalidade-badge">Art. 8º LPI</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Sparkles size={20} color="#1e3a8a" />
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Patente de Invenção (PI)</h3>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                        Para novas soluções tecnológicas que atendam aos requisitos de <strong>novidade absoluta</strong>, <strong>atividade inventiva</strong> e aplicação industrial. Vigência de 20 anos.
                    </p>
                </div>

                {/* MU */}
                <div
                    className={`modalidade-card ${modalidade === "MU" ? "selected" : ""}`}
                    onClick={() => onAlterarModalidade("MU")}
                    role="button"
                    tabIndex={0}
                >
                    <span className="modalidade-badge">Art. 9º LPI</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Wrench size={20} color="#0d9488" />
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Modelo de Utilidade (MU)</h3>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                        Para nova forma ou disposição em objeto de uso prático que resulte em <strong>melhoria funcional</strong> em seu uso ou fabricação. <em>Exige obrigatoriamente figuras técnicas</em>. Vigência de 15 anos.
                    </p>
                </div>

                {/* CII / SOFTWARE - EM BREVE */}
                <div
                    className="modalidade-card"
                    style={{
                        opacity: 0.7,
                        cursor: "not-allowed",
                        backgroundColor: "#f8fafc",
                        borderColor: "#e2e8f0",
                        position: "relative"
                    }}
                    title="Modalidade em fase final de homologação dos templates INPI"
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className="modalidade-badge" style={{ background: "#cbd5e1", color: "#475569" }}>
                            Resolução 158/2016
                        </span>
                        <span style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            padding: "0.2rem 0.6rem",
                            borderRadius: "9999px",
                            backgroundColor: "#fef3c7",
                            color: "#b45309",
                            border: "1px solid #fde68a"
                        }}>
                            Em breve
                        </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Cpu size={20} color="#64748b" />
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#64748b" }}>Software / Jogos (CII)</h3>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                        Invenção Implementada por Computador. Módulo em homologação de templates específicos para diretrizes de patentes de algoritmos e programas de computador.
                    </p>
                </div>
            </div>

            <div className="info-alert">
                <Info size={20} style={{ flexShrink: 0 }} />
                <div>
                    <strong>Dica Técnica do INPI:</strong> Os templates oficiais do INPI e as validações do sistema serão ajustados dinamicamente para os campos exigidos pela modalidade selecionada (ex: inclusão de efeito técnico para software ou melhoria funcional para modelo de utilidade).
                </div>
            </div>
        </div>
    );
};
