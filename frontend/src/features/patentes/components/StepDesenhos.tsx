import React, { useRef } from "react";
import { DesenhoItem, ModalidadePatente } from "../types/TiposPatentes";
import { Image as ImageIcon, Plus, Trash2, Upload, AlertCircle, Info } from "lucide-react";

interface StepDesenhosProps {
    modalidade: ModalidadePatente;
    desenhos: DesenhoItem[];
    onChangeDesenhos: (desenhos: DesenhoItem[]) => void;
}

export const StepDesenhos: React.FC<StepDesenhosProps> = ({
    modalidade,
    desenhos,
    onChangeDesenhos
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const indexAlvoRef = useRef<number | null>(null);

    const isMU = modalidade === "MU";
    const isSoftware = modalidade === "CII_SOFTWARE";

    const handleAdicionarFigura = () => {
        const novaFigura: DesenhoItem = {
            numero_figura: `${desenhos.length + 1}`,
            imagem_base64: null,
            descricao_breve: ""
        };
        onChangeDesenhos([...desenhos, novaFigura]);
    };

    const handleRemoverFigura = (index: number) => {
        const filtradas = desenhos.filter((_, i) => i !== index);
        onChangeDesenhos(filtradas);
    };

    const handleAtualizarFigura = (index: number, campos: Partial<DesenhoItem>) => {
        const copia = [...desenhos];
        copia[index] = {
            ...copia[index],
            ...campos
        };
        onChangeDesenhos(copia);
    };

    const dispararUpload = (index: number) => {
        indexAlvoRef.current = index;
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
            fileInputRef.current.click();
        }
    };

    const handleArquivoSelecionado = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const index = indexAlvoRef.current;
        if (!file || index === null) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            handleAtualizarFigura(index, { imagem_base64: base64 });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="step-card">
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleArquivoSelecionado}
            />

            <div className="step-card-header">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                        <h2 className="step-card-title">
                            <ImageIcon size={22} color="var(--color-primary)" />
                            4. Desenhos e Figuras Técnicas
                        </h2>
                        <p className="step-card-desc">
                            Ilustrações técnicas que auxiliam a compreensão das reivindicações e da descrição (Portaria INPI nº 14/2024).
                        </p>
                    </div>
                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleAdicionarFigura}
                    >
                        <Plus size={16} /> Adicionar Figura
                    </button>
                </div>
            </div>

            {/* Aviso condicional para MU ou Software */}
            {isMU && desenhos.length === 0 && (
                <div className="warning-alert">
                    <AlertCircle size={20} style={{ flexShrink: 0 }} />
                    <div>
                        <strong>Recomendação para Modelo de Utilidade (MU):</strong> O Art. 9º da Lei nº 9.279/1996 recomenda a inclusão de figuras técnicas que ilustrem a disposição construtiva (opcional para testes de rascunho).
                    </div>
                </div>
            )}

            {isSoftware && (
                <div
                    className={desenhos.length === 0 ? "warning-alert" : "info-alert"}
                    style={
                        desenhos.length === 0
                            ? { backgroundColor: "#fef2f2", borderColor: "#fca5a5", color: "#b91c1c" }
                            : undefined
                    }
                >
                    <Info size={20} style={{ flexShrink: 0 }} />
                    <div>
                        <strong>Obrigatório para Software (CII — Resolução 158/2016):</strong> Inclua ao menos 1 figura técnica (diagrama em blocos da arquitetura física ou fluxograma operacional do método) para avançar.
                    </div>
                </div>
            )}

            {desenhos.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem", background: "var(--color-surface-muted)", borderRadius: "12px", border: "1px dashed var(--color-border)" }}>
                    <ImageIcon size={48} color="var(--color-text-muted)" style={{ margin: "0 auto 1rem auto", opacity: 0.6 }} />
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--color-text-main)" }}>Nenhuma figura adicionada</h3>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", maxWidth: "450px", margin: "0.5rem auto 1.5rem auto" }}>
                        Caso sua patente utilize desenhos, esquemas, circuitos ou fluxogramas, adicione-os aqui para constar no documento oficial de desenhos.
                    </p>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleAdicionarFigura}
                    >
                        <Plus size={16} /> Adicionar Primeira Figura
                    </button>
                </div>
            ) : (
                <div className="desenhos-grid">
                    {desenhos.map((fig, index) => {
                        const numValido = fig.numero_figura.trim().length >= 1;
                        const descValida = fig.descricao_breve.trim().length >= 3;

                        return (
                            <div key={index} className="desenho-card">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--color-primary)" }}>
                                        Figura {fig.numero_figura || `${index + 1}`}
                                    </span>
                                    <button
                                        type="button"
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleRemoverFigura(index)}
                                        title="Remover figura"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                {/* Preview da Imagem */}
                                {fig.imagem_base64 ? (
                                    <div style={{ position: "relative" }}>
                                        <img
                                            src={fig.imagem_base64}
                                            alt={`Figura ${fig.numero_figura}`}
                                            className="desenho-img-preview"
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            style={{ position: "absolute", bottom: "8px", right: "8px", opacity: 0.9 }}
                                            onClick={() => dispararUpload(index)}
                                        >
                                            <Upload size={14} /> Trocar
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        className="desenho-img-preview"
                                        style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: "0.5rem" }}
                                        onClick={() => dispararUpload(index)}
                                    >
                                        <Upload size={24} color="var(--color-text-muted)" />
                                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 500 }}>
                                            Clique para carregar imagem (PNG/JPG)
                                        </span>
                                    </div>
                                )}

                                {/* Número da Figura */}
                                <div className="form-group">
                                    <label className="form-label" style={{ fontSize: "0.8rem" }}>
                                        <span>Número/Identificação *</span>
                                        <span style={{ fontSize: "0.72rem", color: numValido ? "#15803d" : "#b91c1c" }}>
                                            {numValido ? "✓" : "Obrigatório"}
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        style={{
                                            padding: "0.4rem 0.6rem",
                                            fontSize: "0.85rem",
                                            borderColor: numValido ? "#22c55e" : "#ef4444"
                                        }}
                                        placeholder="Ex: 1, 2A, 3"
                                        value={fig.numero_figura}
                                        onChange={(e) => {
                                            // Permite números e sufixos alfanuméricos curtos (ex: 1, 2A, 3B) bloqueando símbolos inválidos
                                            const limpo = e.target.value.replace(/[^0-9a-zA-Z]/g, "").toUpperCase().slice(0, 6);
                                            handleAtualizarFigura(index, { numero_figura: limpo });
                                        }}
                                    />
                                </div>

                                {/* Descrição Breve */}
                                <div className="form-group">
                                    <label className="form-label" style={{ fontSize: "0.8rem" }}>
                                        <span>Descrição Breve *</span>
                                        <span style={{ fontSize: "0.72rem", color: descValida ? "#15803d" : "#b91c1c" }}>
                                            {descValida ? "✓ Preenchida" : "Mín. 3 caracteres"}
                                        </span>
                                    </label>
                                    <textarea
                                        className="form-textarea"
                                        style={{
                                            minHeight: "60px",
                                            padding: "0.4rem 0.6rem",
                                            fontSize: "0.85rem",
                                            borderColor: descValida ? "#22c55e" : "#ef4444",
                                            backgroundColor: descValida ? "#ffffff" : "#fffafa"
                                        }}
                                        placeholder="Ex: Diagrama de blocos em vista esquemática do circuito..."
                                        value={fig.descricao_breve}
                                        onChange={(e) => handleAtualizarFigura(index, { descricao_breve: e.target.value })}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
