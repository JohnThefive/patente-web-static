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
    const tituloEfetivo = (resumo.titulo || tituloPadrao || "").trim();
    const tituloValido = tituloEfetivo.length >= 5;

    const textoLimpo = (resumo.texto || "").trim();
    const contagemPalavras = textoLimpo ? textoLimpo.split(/\s+/).filter(Boolean).length : 0;
    const isPalavrasValidas = contagemPalavras >= 50 && contagemPalavras <= 200;
    const textoMinimoValido = textoLimpo.length >= 20;

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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                    <label className="form-label" htmlFor="resumo_titulo">
                        <span>Título do Resumo *</span>
                        <span
                            style={{
                                fontSize: "0.73rem",
                                fontWeight: 700,
                                padding: "0.12rem 0.5rem",
                                borderRadius: "999px",
                                background: tituloValido ? "#dcfce7" : "#fef2f2",
                                color: tituloValido ? "#15803d" : "#b91c1c",
                                border: tituloValido ? "1px solid #86efac" : "1px solid #fca5a5"
                            }}
                        >
                            {tituloValido ? "✓ Preenchido" : "Obrigatório (mín. 5 caracteres)"}
                        </span>
                    </label>
                    {(!resumo.titulo && tituloPadrao) && (
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleCampoChange("titulo", tituloPadrao)}
                            style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}
                        >
                            Confirmar título do relatório
                        </button>
                    )}
                </div>
                <input
                    id="resumo_titulo"
                    type="text"
                    className="form-input"
                    style={{
                        borderColor: tituloValido ? "#22c55e" : "#ef4444",
                        backgroundColor: tituloValido ? "#ffffff" : "#fffafa"
                    }}
                    placeholder="Ex: SISTEMA E MÉTODO PARA MONITORAMENTO DE SENSORES EM BORDA"
                    value={resumo.titulo || tituloPadrao || ""}
                    onChange={(e) => handleCampoChange("titulo", e.target.value)}
                />
            </div>

            {/* Texto do Resumo com contagem em tempo real */}
            <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                    <label className="form-label" htmlFor="resumo_texto">
                        <span>Texto do Resumo (Parágrafo Único) *</span>
                    </label>
                    <span style={{
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        padding: "0.15rem 0.6rem",
                        borderRadius: "999px",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        background: isPalavrasValidas ? "#dcfce7" : textoMinimoValido ? "#fef9c3" : "#fef2f2",
                        color: isPalavrasValidas ? "#15803d" : textoMinimoValido ? "#854d0e" : "#b91c1c",
                        border: isPalavrasValidas ? "1px solid #86efac" : textoMinimoValido ? "1px solid #fde047" : "1px solid #fca5a5"
                    }}>
                        {isPalavrasValidas && <CheckCircle2 size={14} />}
                        {contagemPalavras} palavras (Meta legal: 50 a 200 palavras)
                    </span>
                </div>
                <textarea
                    id="resumo_texto"
                    className="form-textarea"
                    style={{
                        minHeight: "160px",
                        borderColor: isPalavrasValidas ? "#22c55e" : "#ef4444",
                        backgroundColor: isPalavrasValidas ? "#ffffff" : "#fffafa"
                    }}
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
                        Recomendação INPI (IN 30/2013): O resumo deve conter idealmente entre <strong>50 e 200 palavras</strong> em parágrafo único. Atualmente você possui {contagemPalavras} palavras {contagemPalavras < 50 ? `(faltam ${50 - contagemPalavras} palavras para a faixa ideal)` : `(excedeu em ${contagemPalavras - 200} palavras)`}.
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
