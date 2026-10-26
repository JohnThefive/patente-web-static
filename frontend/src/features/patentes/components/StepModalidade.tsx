import React from "react";
import { ModalidadePatente } from "../types/TiposPatentes";
import { FAQ_JURIDICO_SOFTWARE, TAXA_ATUAL_RPC_REAIS, CODIGO_GRU_RPC } from "../data/tabelasInpiRpc";
import {
    Cpu,
    Wrench,
    Sparkles,
    Info,
    GitBranch,
    ShieldCheck,
    Code2,
    Palette,
    Scale,
    HelpCircle,
    Receipt
} from "lucide-react";

interface StepModalidadeProps {
    modalidade: ModalidadePatente;
    onAlterarModalidade: (novaModalidade: ModalidadePatente) => void;
}

export const StepModalidade: React.FC<StepModalidadeProps> = ({
    modalidade,
    onAlterarModalidade
}) => {
    const isModoSoftware = modalidade === "RPC" || modalidade === "CII_SOFTWARE";

    return (
        <div className="step-card">
            <div className="step-card-header">
                <h2 className="step-card-title">
                    <Sparkles size={22} color="var(--color-primary)" />
                    1. Escolha a Modalidade de Proteção no INPI
                </h2>
                <p className="step-card-desc">
                    Selecione a categoria adequada conforme a Lei de Propriedade Industrial (Lei nº 9.279/1996) ou a Lei de Software (Lei nº 9.609/1998).
                </p>
            </div>

            <div className="modalidade-grid">
                {/* PI */}
                <div
                    className={`modalidade-card ${modalidade === "PI" ? "selected" : ""}`}
                    onClick={() => onAlterarModalidade("PI")}
                    onKeyDown={(e) => e.key === "Enter" && onAlterarModalidade("PI")}
                    role="button"
                    tabIndex={0}
                >
                    <span className="modalidade-badge">Art. 8º LPI</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Sparkles size={20} color="#1e3a8a" />
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Patente de Invenção (PI)</h3>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                        Para novas soluções tecnológicas de produto ou processo com <strong>novidade absoluta</strong>, <strong>atividade inventiva</strong> e aplicação industrial. Vigência de 20 anos.
                    </p>
                </div>

                {/* MU */}
                <div
                    className={`modalidade-card ${modalidade === "MU" ? "selected" : ""}`}
                    onClick={() => onAlterarModalidade("MU")}
                    onKeyDown={(e) => e.key === "Enter" && onAlterarModalidade("MU")}
                    role="button"
                    tabIndex={0}
                >
                    <span className="modalidade-badge">Art. 9º LPI</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Wrench size={20} color="#0d9488" />
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Modelo de Utilidade (MU)</h3>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                        Para nova forma ou disposição em objeto físico de uso prático que resulte em <strong>melhoria funcional</strong>. <em>Exige figuras técnicas</em>. Vigência de 15 anos.
                    </p>
                </div>

                {/* SOFTWARE: e-RPC + Patente CII */}
                <div
                    className={`modalidade-card ${isModoSoftware ? "selected" : ""}`}
                    onClick={() => {
                        if (!isModoSoftware) {
                            onAlterarModalidade("RPC");
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !isModoSoftware) {
                            onAlterarModalidade("RPC");
                        }
                    }}
                    role="button"
                    tabIndex={0}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                        <span className="modalidade-badge">Lei 9.609/98 & Res. 158/16</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Cpu size={20} color="#7c3aed" />
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Software, Apps e Jogos</h3>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                        Triagem entre <strong>Software Puro (e-RPC)</strong> — com Dicas, Gerador de Hash SHA-512 e Checklist INPI — e <strong>Patente de Inovação CII</strong> vinculada a hardware.
                    </p>
                </div>
            </div>

            {/* [RF01] TRIAGEM DE NATUREZA DA OBRA DE SOFTWARE */}
            {isModoSoftware && (
                <div
                    style={{
                        background: "#f8fafc",
                        border: "2px solid #c7d2fe",
                        borderRadius: "12px",
                        padding: "1.5rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.25rem"
                    }}
                >
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#312e81", fontWeight: 700, fontSize: "1.05rem" }}>
                            <GitBranch size={20} />
                            <span>Triagem de Natureza da Obra de Software (Diretriz INPI)</span>
                        </div>
                        <p style={{ fontSize: "0.88rem", color: "var(--color-text-muted)", marginTop: "0.3rem" }}>
                            O seu software está vinculado a um dispositivo físico novo ou método de controle de hardware com efeito técnico concreto?
                        </p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                        {/* Opção 1: Software Puro / Jogo -> e-RPC */}
                        <div
                            onClick={() => onAlterarModalidade("RPC")}
                            onKeyDown={(e) => e.key === "Enter" && onAlterarModalidade("RPC")}
                            role="button"
                            tabIndex={0}
                            style={{
                                padding: "1.2rem",
                                borderRadius: "10px",
                                cursor: "pointer",
                                border: modalidade === "RPC" ? "2px solid #4f46e5" : "1px solid var(--color-border)",
                                background: modalidade === "RPC" ? "#eef2ff" : "#ffffff",
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem"
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontWeight: 700, color: "#312e81", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.95rem" }}>
                                    <Code2 size={18} />
                                    Software Puro, App ou Jogo Digital
                                </span>
                                {modalidade === "RPC" && (
                                    <span style={{ fontSize: "0.72rem", fontWeight: 700, background: "#4f46e5", color: "white", padding: "0.15rem 0.5rem", borderRadius: "999px" }}>
                                        Selecionado
                                    </span>
                                )}
                            </div>
                            <p style={{ fontSize: "0.83rem", color: "#334155" }}>
                                <strong>Assistente Enxuto e-RPC (Lei nº 9.609/98):</strong> Focado apenas nas <strong>Dicas Jurídicas</strong>, no <strong>Gerador de Hash SHA-512</strong> local e no <strong>Checklist de Registro</strong>. A Declaração de Veracidade já é gerada automaticamente pelo governo ao emitir a GRU ({TAXA_ATUAL_RPC_REAIS}) e assinada via Gov.br!
                            </p>
                        </div>

                        {/* Opção 2: Vinculado a Hardware / Processo Técnico -> Patente CII */}
                        <div
                            onClick={() => onAlterarModalidade("CII_SOFTWARE")}
                            onKeyDown={(e) => e.key === "Enter" && onAlterarModalidade("CII_SOFTWARE")}
                            role="button"
                            tabIndex={0}
                            style={{
                                padding: "1.2rem",
                                borderRadius: "10px",
                                cursor: "pointer",
                                border: modalidade === "CII_SOFTWARE" ? "2px solid #1e3a8a" : "1px solid var(--color-border)",
                                background: modalidade === "CII_SOFTWARE" ? "#eff6ff" : "#ffffff",
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem"
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontWeight: 700, color: "#1e3a8a", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.95rem" }}>
                                    <Cpu size={18} />
                                    Patente de Inovação CII (Hardware + Software)
                                </span>
                                {modalidade === "CII_SOFTWARE" && (
                                    <span style={{ fontSize: "0.72rem", fontWeight: 700, background: "#1e3a8a", color: "white", padding: "0.15rem 0.5rem", borderRadius: "999px" }}>
                                        Selecionado
                                    </span>
                                )}
                            </div>
                            <p style={{ fontSize: "0.83rem", color: "#334155" }}>
                                <strong>Patente de Invenção CII (Resolução INPI nº 158/2016):</strong> Indicado quando o algoritmo resolve um problema técnico em sensores, máquinas, telecomunicações ou hardware embarcado. Gera as 4 minutas formais de patente (.docx/.pdf).
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* GUIA EDUCATIVO E ESTRATÉGICO DE REGISTRO DE SOFTWARE (e-RPC) */}
            {modalidade === "RPC" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {/* Pilares de Vantagens + Taxa Atual */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.9rem" }}>
                        <div style={{ background: "#fefce8", border: "1px solid #fde047", borderRadius: "10px", padding: "1rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, color: "#854d0e", fontSize: "0.9rem", marginBottom: "0.3rem" }}>
                                <Receipt size={17} /> Taxa Atual: {TAXA_ATUAL_RPC_REAIS} (GRU {CODIGO_GRU_RPC})
                            </div>
                            <p style={{ fontSize: "0.8rem", color: "#713f12" }}>
                                Ao gerar a GRU na plataforma do governo, a <strong>Declaração de Veracidade</strong> já é criada automaticamente pelo sistema — basta assiná-la digitalmente via <strong>Gov.br</strong>.
                            </p>
                        </div>

                        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "1rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, color: "#166534", fontSize: "0.9rem", marginBottom: "0.3rem" }}>
                                <Scale size={17} /> Direito Patrimonial (50 anos)
                            </div>
                            <p style={{ fontSize: "0.8rem", color: "#14532d" }}>
                                Titularidade comprovada para comercializar, licenciar, transferir tecnologia e participar de licitações ou editais de fomento.
                            </p>
                        </div>

                        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "1rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, color: "#1e40af", fontSize: "0.9rem", marginBottom: "0.3rem" }}>
                                <ShieldCheck size={17} /> Direito Moral & Segurança Jurídica
                            </div>
                            <p style={{ fontSize: "0.8rem", color: "#1e3a8a" }}>
                                Reconhecimento oficial dos desenvolvedores (autores) e prova imediata de anterioridade com fé pública contra cópia ou desvio de código.
                            </p>
                        </div>

                        <div style={{ background: "#fdf4ff", border: "1px solid #f5d0fe", borderRadius: "10px", padding: "1rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, color: "#86198f", fontSize: "0.9rem", marginBottom: "0.3rem" }}>
                                <Palette size={17} /> Dica: Proteger o Layout (UI)
                            </div>
                            <p style={{ fontSize: "0.8rem", color: "#701a75" }}>
                                O e-RPC protege o código-fonte. Para proteger também o <strong>layout visual das telas e ícones</strong> do aplicativo, avalie depositar um <strong>Desenho Industrial (DI)</strong>!
                            </p>
                        </div>
                    </div>

                    {/* Perguntas e Respostas Jurídicas Rápidas */}
                    <div style={{ background: "#ffffff", border: "1px solid var(--color-border)", borderRadius: "10px", padding: "1.25rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, color: "var(--color-text-main)", marginBottom: "0.85rem", fontSize: "0.95rem" }}>
                            <HelpCircle size={18} color="var(--color-primary)" />
                            <span>Guia Rápido: O que você precisa saber sobre o Registro de Software no Brasil</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "0.85rem" }}>
                            {FAQ_JURIDICO_SOFTWARE.map((item, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        background: "var(--color-surface-muted)",
                                        borderRadius: "8px",
                                        padding: "0.85rem",
                                        border: "1px solid var(--color-border)"
                                    }}
                                >
                                    <div style={{ fontWeight: 700, fontSize: "0.84rem", color: "var(--color-primary)", marginBottom: "0.3rem" }}>
                                        {item.pergunta}
                                    </div>
                                    <div style={{ fontSize: "0.8rem", color: "var(--color-text-main)", lineHeight: 1.45 }}>
                                        {item.resposta}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="info-alert">
                <Info size={20} style={{ flexShrink: 0 }} />
                <div>
                    {modalidade === "RPC" ? (
                        <>
                            <strong>Fluxo Enxuto de Software (3 Passos):</strong> Você não precisa preencher formulários redundantes aqui! No <strong>Passo 2</strong> você gera e valida o <strong>Hash SHA-512</strong> do seu código-fonte localmente, e no <strong>Passo 3</strong> acompanha o checklist prático do INPI (GRU de {TAXA_ATUAL_RPC_REAIS}, assinatura digital no Gov.br e acompanhamento na Revista RPI).
                        </>
                    ) : (
                        <>
                            <strong>Dica Técnica do INPI:</strong> Os templates oficiais Word (.docx) e os marcadores visuais de validação são ajustados dinamicamente para os campos exigidos pela modalidade selecionada (incluindo efeito técnico e hardware na Resolução 158/2016 para CII).
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
