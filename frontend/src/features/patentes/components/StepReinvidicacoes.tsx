import React from "react";
import { ReivindicacaoItem } from "../types/TiposPatentes";
import { ListOrdered, Plus, Trash2, Info, CheckCircle2 } from "lucide-react";

interface StepReinvidicacoesProps {
    reivindicacoes: ReivindicacaoItem[];
    onChangeReivindicacoes: (reivindicacoes: ReivindicacaoItem[]) => void;
}

export const StepReinvidicacoes: React.FC<StepReinvidicacoesProps> = ({
    reivindicacoes,
    onChangeReivindicacoes
}) => {
    const handleAdicionar = () => {
        const novoNumero = reivindicacoes.length + 1;
        const novaReivindicacao: ReivindicacaoItem = {
            numero: novoNumero,
            tipo: novoNumero === 1 ? "independente" : "dependente",
            preambulo: "",
            dependencia: novoNumero === 1 ? null : 1,
            caracterizacao: ""
        };
        onChangeReivindicacoes([...reivindicacoes, novaReivindicacao]);
    };

    const handleRemover = (index: number) => {
        if (reivindicacoes.length <= 1) return;
        const filtradas = reivindicacoes.filter((_, i) => i !== index);
        const renumeradas: ReivindicacaoItem[] = filtradas.map((r, i) => {
            const numeroAtual = i + 1;
            let dependencia = r.dependencia;
            if (dependencia && dependencia >= numeroAtual) {
                dependencia = Math.max(1, numeroAtual - 1);
            }
            return {
                ...r,
                numero: numeroAtual,
                tipo: numeroAtual === 1 ? "independente" : r.tipo,
                dependencia: numeroAtual === 1 ? null : dependencia
            };
        });
        onChangeReivindicacoes(renumeradas);
    };

    const handleAtualizarItem = (index: number, campos: Partial<ReivindicacaoItem>) => {
        const copia = [...reivindicacoes];
        copia[index] = {
            ...copia[index],
            ...campos
        };
        onChangeReivindicacoes(copia);
    };

    const formatarPreview = (r: ReivindicacaoItem): string => {
        const preambuloLimpo = (r.preambulo || "O DISPOSITIVO").trim().replace(/\.$/, "");
        const caracLimpa = (r.caracterizacao || "compreender...").trim().replace(/\.$/, "");
        if (r.tipo === "dependente" && r.dependencia) {
            return `${r.numero}. ${preambuloLimpo}, de acordo com a reivindicação ${r.dependencia}, caracterizado por ${caracLimpa}.`;
        }
        return `${r.numero}. ${preambuloLimpo}, caracterizado por ${caracLimpa}.`;
    };

    return (
        <div className="step-card">
            <div className="step-card-header">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                        <h2 className="step-card-title">
                            <ListOrdered size={22} color="var(--color-primary)" />
                            3. Quadro Reivindicatório
                        </h2>
                        <p className="step-card-desc">
                            As reivindicações definem e delimitam a extensão exata da proteção legal da patente (Art. 25 da LPI e IN 30/2013).
                        </p>
                    </div>
                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleAdicionar}
                    >
                        <Plus size={16} /> Nova Reivindicação
                    </button>
                </div>
            </div>

            <div className="info-alert">
                <Info size={18} style={{ flexShrink: 0 }} />
                <div>
                    <strong>Regra INPI (IN 30/2013):</strong> A reivindicação nº 1 deve ser sempre <strong>independente</strong>. As reivindicações seguintes podem ser dependentes e vincular-se a qualquer reivindicação anterior. Cada reivindicação deve possuir apenas um ponto final ao término.
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {reivindicacoes.map((item, index) => {
                    const isPrimeira = item.numero === 1;
                    const preambuloValido = item.preambulo.trim().length >= 5;
                    const caracValida = item.caracterizacao.trim().length >= 10;

                    return (
                        <div key={index} className="reivindicacao-card">
                            <div className="reivindicacao-header">
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <span style={{
                                        background: "var(--color-primary)",
                                        color: "white",
                                        fontWeight: 700,
                                        padding: "0.2rem 0.6rem",
                                        borderRadius: "6px",
                                        fontSize: "0.85rem"
                                    }}>
                                        Reivindicação #{item.numero}
                                    </span>

                                    {!isPrimeira ? (
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <select
                                                className="form-select"
                                                style={{ width: "auto", padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}
                                                value={item.tipo}
                                                onChange={(e) => {
                                                    const novoTipo = e.target.value as "independente" | "dependente";
                                                    handleAtualizarItem(index, {
                                                        tipo: novoTipo,
                                                        dependencia: novoTipo === "dependente" ? 1 : null
                                                    });
                                                }}
                                            >
                                                <option value="dependente">Dependente</option>
                                                <option value="independente">Independente</option>
                                            </select>

                                            {item.tipo === "dependente" && (
                                                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                                    de acordo com a nº
                                                    <select
                                                        className="form-select"
                                                        style={{ width: "auto", padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}
                                                        value={item.dependencia || 1}
                                                        onChange={(e) =>
                                                            handleAtualizarItem(index, { dependencia: Number(e.target.value) })
                                                        }
                                                    >
                                                        {reivindicacoes
                                                            .filter((outra) => outra.numero < item.numero)
                                                            .map((outra) => (
                                                                <option key={outra.numero} value={outra.numero}>
                                                                    {outra.numero}
                                                                </option>
                                                            ))}
                                                    </select>
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                                            (Independente Principal)
                                        </span>
                                    )}
                                </div>

                                {reivindicacoes.length > 1 && (
                                    <button
                                        type="button"
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleRemover(index)}
                                        title="Remover reivindicação"
                                    >
                                        <Trash2 size={16} /> Excluir
                                    </button>
                                )}
                            </div>

                            {/* Preâmbulo */}
                            <div className="form-group">
                                <label className="form-label">
                                    <span>Preâmbulo (Designação da Categoria + Elementos Conhecidos) *</span>
                                    <span
                                        style={{
                                            fontSize: "0.73rem",
                                            fontWeight: 700,
                                            padding: "0.12rem 0.5rem",
                                            borderRadius: "999px",
                                            background: preambuloValido ? "#dcfce7" : "#fef2f2",
                                            color: preambuloValido ? "#15803d" : "#b91c1c",
                                            border: preambuloValido ? "1px solid #86efac" : "1px solid #fca5a5"
                                        }}
                                    >
                                        {preambuloValido ? "✓ Preenchido" : "Obrigatório (mín. 5 caracteres)"}
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    style={{
                                        borderColor: preambuloValido ? "#22c55e" : "#ef4444",
                                        backgroundColor: preambuloValido ? "#ffffff" : "#fffafa"
                                    }}
                                    placeholder="Ex: SISTEMA DE MONITORAMENTO DE SENSORES compreendendo um microcontrolador"
                                    value={item.preambulo}
                                    onChange={(e) => handleAtualizarItem(index, { preambulo: e.target.value })}
                                />
                            </div>

                            {/* Caracterização */}
                            <div className="form-group">
                                <label className="form-label">
                                    <span>Caracterização (Após a expressão obrigatória "caracterizado por") *</span>
                                    <span
                                        style={{
                                            fontSize: "0.73rem",
                                            fontWeight: 700,
                                            padding: "0.12rem 0.5rem",
                                            borderRadius: "999px",
                                            background: caracValida ? "#dcfce7" : "#fef2f2",
                                            color: caracValida ? "#15803d" : "#b91c1c",
                                            border: caracValida ? "1px solid #86efac" : "1px solid #fca5a5"
                                        }}
                                    >
                                        {caracValida ? "✓ Preenchido" : "Obrigatório (mín. 10 caracteres)"}
                                    </span>
                                </label>
                                <textarea
                                    className="form-textarea"
                                    style={{
                                        minHeight: "70px",
                                        borderColor: caracValida ? "#22c55e" : "#ef4444",
                                        backgroundColor: caracValida ? "#ffffff" : "#fffafa"
                                    }}
                                    placeholder="Ex: possuir um módulo de filtragem adaptativa que calcula a derivada dos sinais em tempo real..."
                                    value={item.caracterizacao}
                                    onChange={(e) => handleAtualizarItem(index, { caracterizacao: e.target.value })}
                                />
                            </div>

                            {/* Visualização Prévia do Ponto Final Oficial */}
                            <div style={{ background: "#ffffff", border: "1px dashed #cbd5e1", borderRadius: "6px", padding: "0.75rem", fontSize: "0.85rem", color: "#334155" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 600, color: "var(--color-primary)", marginBottom: "0.3rem" }}>
                                    <CheckCircle2 size={15} />
                                    <span>Formatação Final no Documento Word:</span>
                                </div>
                                <p style={{ fontStyle: "italic" }}>
                                    {formatarPreview(item)}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
