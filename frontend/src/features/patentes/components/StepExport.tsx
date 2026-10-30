import React, { useState } from "react";
import { PacotePatentePayload } from "../types/TiposPatentes";
import { exportarPacotePatenteLocal } from "../../../services/docx";
import {
    Download,
    FileCheck,
    AlertTriangle,
    CheckCircle,
    Loader2,
    FileText,
    ListOrdered,
    Image as ImageIcon,
    Award,
    ShieldAlert
} from "lucide-react";

interface StepExportProps {
    payload: PacotePatentePayload;
}

export const StepExport: React.FC<StepExportProps> = ({ payload }) => {
    const [isExportando, setIsExportando] = useState<boolean>(false);
    const [statusMensagem, setStatusMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);

    const isMU = payload.modalidade === "MU";
    const isCII = payload.modalidade === "CII_SOFTWARE";
    const resumoTexto = (payload.resumo.texto || "").trim();
    const contagemPalavrasResumo = resumoTexto ? resumoTexto.split(/\s+/).filter(Boolean).length : 0;
    const isResumoValido = contagemPalavrasResumo >= 50 && contagemPalavrasResumo <= 200;

    // Checagens de conformidade preliminar
    const avisosPendencias: string[] = [];
    if (!payload.relatorio.titulo || payload.relatorio.titulo.trim().length < 5) {
        avisosPendencias.push("O título do relatório descritivo deve conter no mínimo 5 caracteres.");
    }
    if (isCII) {
        const efeito = ((payload.relatorio as any).efeito_tecnico_alcancado || "").trim();
        if (efeito.length < 15) {
            avisosPendencias.push(
                "Para Patente de Software/CII (Resolução 158/2016), o campo 'Efeito Técnico Alcançado' exige no mínimo 15 caracteres."
            );
        }
        if (!payload.desenhos || payload.desenhos.length === 0) {
            avisosPendencias.push(
                "Para Patente de Software/CII, adicione ao menos 1 figura (ex: fluxograma ou diagrama em blocos da arquitetura)."
            );
        }
    }
    if (isMU && (!payload.desenhos || payload.desenhos.length === 0)) {
        avisosPendencias.push(
            "Para Modelo de Utilidade (Art. 9º da LPI), é recomendada a inclusão de ao menos 1 figura técnica."
        );
    }
    if (!payload.quadro_reivindicatorio || payload.quadro_reivindicatorio.length === 0) {
        avisosPendencias.push("O quadro reivindicatório deve possuir ao menos 1 reivindicação.");
    }
    if (!isResumoValido) {
        avisosPendencias.push(`O resumo possui ${contagemPalavrasResumo} palavras (o INPI exige entre 50 e 200 palavras).`);
    }

    const handleExportar = async () => {
        setIsExportando(true);
        setStatusMensagem(null);

        try {
            await exportarPacotePatenteLocal(payload);
            setStatusMensagem({
                tipo: "sucesso",
                texto: "Pacote de minutas oficiais (.zip) gerado e baixado com sucesso 100% no seu navegador!"
            });
        } catch (err: any) {
            console.error("Erro ao exportar pacote:", err);
            setStatusMensagem({
                tipo: "erro",
                texto: err.message || "Erro inesperado ao gerar os documentos localmente."
            });
        } finally {
            setIsExportando(false);
        }
    };

    const nomeModalidade = isMU
        ? "Modelo de Utilidade (MU)"
        : isCII
            ? "Patente CII (Software + Hardware)"
            : "Patente de Invenção (PI)";

    return (
        <div className="step-card">
            <div className="step-card-header">
                <h2 className="step-card-title">
                    <Download size={22} color="var(--color-primary)" />
                    6. Revisão Geral e Exportação das Minutas
                </h2>
                <p className="step-card-desc">
                    Revise os dados compilados do pedido e gere o pacote contendo os 4 documentos oficiais (.docx e .pdf) formatados para o protocolo eletrônico do INPI.
                </p>
            </div>

            {/* Painel de Conferência dos Componentes */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
                <div style={{ background: "var(--color-surface-muted)", border: "1px solid var(--color-border)", borderRadius: "10px", padding: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-primary)", fontWeight: 700, marginBottom: "0.4rem" }}>
                        <FileText size={18} />
                        <span>Relatório Descritivo</span>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text-main)" }}>
                        <strong>Modalidade:</strong> {nomeModalidade}
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                        {payload.relatorio.paragrafos_descricao?.length || 0} parágrafo(s) de descrição
                    </p>
                </div>

                <div style={{ background: "var(--color-surface-muted)", border: "1px solid var(--color-border)", borderRadius: "10px", padding: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-primary)", fontWeight: 700, marginBottom: "0.4rem" }}>
                        <ListOrdered size={18} />
                        <span>Reivindicações</span>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text-main)" }}>
                        <strong>{payload.quadro_reivindicatorio.length}</strong> reivindicação(ões)
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                        #1 Independente Principal
                    </p>
                </div>

                <div style={{ background: "var(--color-surface-muted)", border: "1px solid var(--color-border)", borderRadius: "10px", padding: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-primary)", fontWeight: 700, marginBottom: "0.4rem" }}>
                        <ImageIcon size={18} />
                        <span>Desenhos Técnicos</span>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text-main)" }}>
                        <strong>{payload.desenhos.length}</strong> figura(s) anexada(s)
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                        {payload.desenhos.filter(d => d.imagem_base64).length} com imagem PNG/JPG
                    </p>
                </div>

                <div style={{ background: "var(--color-surface-muted)", border: "1px solid var(--color-border)", borderRadius: "10px", padding: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-primary)", fontWeight: 700, marginBottom: "0.4rem" }}>
                        <Award size={18} />
                        <span>Resumo Formal</span>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text-main)" }}>
                        <strong>{contagemPalavrasResumo}</strong> palavras
                    </p>
                    <p style={{ fontSize: "0.85rem", color: isResumoValido ? "var(--color-success)" : "var(--color-warning)", fontWeight: 600 }}>
                        {isResumoValido ? "✓ Dentro da meta legal" : "⚠ Ajuste recomendado"}
                    </p>
                </div>
            </div>

            {/* Aviso de Alertas Preliminares */}
            {avisosPendencias.length > 0 && (
                <div className="warning-alert">
                    <ShieldAlert size={20} style={{ flexShrink: 0 }} />
                    <div>
                        <strong>Atenção aos requisitos do INPI antes de gerar:</strong>
                        <ul style={{ margin: "0.4rem 0 0 1.2rem", padding: 0, fontSize: "0.85rem" }}>
                            {avisosPendencias.map((aviso, i) => (
                                <li key={i}>{aviso}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Configuração de Exportação */}
            <div style={{ background: "#ffffff", border: "1px solid var(--color-border)", borderRadius: "10px", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <FileCheck size={18} color="var(--color-primary)" />
                    Opções de Geração
                </h3>

                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
                    <CheckCircle size={18} color="var(--color-success)" />
                    <span>Geração local imediata: arquivos <strong>.docx</strong> prontos para edição e protocolo eletrônico no INPI.</span>
                </div>


                {statusMensagem && (
                    <div
                        className={statusMensagem.tipo === "sucesso" ? "info-alert" : "warning-alert"}
                        style={{
                            borderColor: statusMensagem.tipo === "sucesso" ? "#86efac" : "#fca5a5",
                            backgroundColor: statusMensagem.tipo === "sucesso" ? "#f0fdf4" : "#fef2f2",
                            color: statusMensagem.tipo === "sucesso" ? "#15803d" : "#b91c1c",
                            whiteSpace: "pre-line"
                        }}
                    >
                        {statusMensagem.tipo === "sucesso" ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                        <div>{statusMensagem.texto}</div>
                    </div>
                )}

                <div style={{ marginTop: "0.5rem" }}>
                    <button
                        type="button"
                        className="btn btn-primary"
                        style={{ padding: "0.9rem 2rem", fontSize: "1.05rem" }}
                        onClick={handleExportar}
                        disabled={isExportando}
                    >
                        {isExportando ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Processando Minutas em Memória...
                            </>
                        ) : (
                            <>
                                <Download size={20} />
                                Baixar Pacote Completo INPI (.zip)
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
