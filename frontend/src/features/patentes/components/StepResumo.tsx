import React from "react";
import { ResumoPI } from "../types/TiposPatentes";
import { Award, AlertTriangle, CheckCircle2, Info } from "lucide-react";

interface StepResumoProps {
    resumo: ResumoPI;
    tituloPadrao: string;
    onChangeResumo: (resumoAtualizado: ResumoPI) => void;
}

export const StepResumo: React.FC<StepResumoProps> = ({
    resumo,
    tituloPadrao,
    onChangeResumo
}) => {
    const textoLimpo = (resumo.texto || "").trim();
    const contagemPalavras = textoLimpo ? textoLimpo.split(/\s+/).filter(Boolean).length : 0;
    const isPalavrasValidas = contagemPalavras >= 50 && contagemPalavras <= 200;

    const handleCampoChange = (campo: keyof ResumoPI, valor: string) => {
        onChangeResumo({
            ...resumo,
            [campo]: valor
        });
    };

    return (
        <div className="step-card">
            <div className="step-card-header">
                <h2 className="step-card-title">
                    <Award size={22} color="var(--color-primary)" />
                    5. Resumo da Patente
                </h2>
                <p className="step-card-desc">
                    O resumo deve constituir uma síntese concisa da matéria técnica descrita no relatório, permitindo uma clara compreensão do problema e da solução inventiva (Art. 24 da LPI e IN 30/2013).
                </p>
            </div>

            {/* Título do Resumo */}
            <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label className="form-label" htmlFor="resumo_titulo">
                        <span>Título do Resumo</span>
                        <span className="form-label-hint">Deve corresponder ao título do relatório descritivo</span>
                    </label>
                    {(!resumo.titulo && tituloPadrao) && (
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleCampoChange("titulo", tituloPadrao)}
                            style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}
                        >
                            Usar título do relatório
                        </button>
                    )}
                </div>
                <input
                    id="resumo_titulo"
                    type="text"
                    className="form-input"
                    placeholder="Ex: SISTEMA E MÉTODO PARA MONITORAMENTO DE SENSORES EM BORDA"
                    value={resumo.titulo || tituloPadrao || ""}
                    onChange={(e) => handleCampoChange("titulo", e.target.value)}
                />
            </div>

            {/* Texto do Resumo com contagem em tempo real */}
            <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label className="form-label" htmlFor="resumo_texto">
                        <span>Texto do Resumo (Parágrafo Único)</span>
                    </label>
                    <span style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        color: isPalavrasValidas ? "var(--color-success)" : contagemPalavras > 0 ? "var(--color-warning)" : "var(--color-text-muted)"
                    }}>
                        {isPalavrasValidas && <CheckCircle2 size={16} />}
                        {contagemPalavras} palavras (Meta legal: 50 a 200 palavras)
                    </span>
                </div>
                <textarea
                    id="resumo_texto"
                    className="form-textarea"
                    style={{ minHeight: "160px" }}
                    placeholder="A presente invenção refere-se a... O sistema soluciona o problema através de... proporcionando maior eficiência e..."
                    value={resumo.texto || ""}
                    onChange={(e) => handleCampoChange("texto", e.target.value)}
                />
            </div>

            {/* Alerta de Contagem de Palavras */}
            {!isPalavrasValidas && contagemPalavras > 0 && (
                <div className="warning-alert">
                    <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                    <div>
                        O INPI exige que o resumo contenha entre <strong>50 e 200 palavras</strong> em parágrafo único. Atualmente você possui {contagemPalavras} palavras {contagemPalavras < 50 ? `(faltam ${50 - contagemPalavras} palavras)` : `(excedeu em ${contagemPalavras - 200} palavras)`}.
                    </div>
                </div>
            )}

            <div className="info-alert">
                <Info size={18} style={{ flexShrink: 0 }} />
                <div>
                    <strong>Dica de Redação (INPI):</strong> O resumo não deve conter referências comerciais, elogios à invenção ou citações de patenteabilidade. Deve apenas resumir os aspectos técnicos mais relevantes da solução.
                </div>
            </div>
        </div>
    );
};
