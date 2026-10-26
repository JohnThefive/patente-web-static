import React, { useState } from "react";
import { RegistroSoftwareRPCDraft } from "../types/TiposPatentes";
import { TAXA_ATUAL_RPC_REAIS, CODIGO_GRU_RPC } from "../data/tabelasInpiRpc";
import { validarHashSha512 } from "../../../services/hashGenerator";
import {
    ClipboardCheck,
    Receipt,
    FileSignature,
    Newspaper,
    AlertTriangle,
    CheckCircle2,
    Copy,
    Check,
    Fingerprint,
    Ban
} from "lucide-react";

interface StepRpcChecklistProps {
    rpc: RegistroSoftwareRPCDraft;
    onChangeRpc: (rpc: RegistroSoftwareRPCDraft) => void;
}

export const StepRpcChecklist: React.FC<StepRpcChecklistProps> = ({
    rpc,
    onChangeRpc
}) => {
    const [copiadoCampo, setCopiadoCampo] = useState<string | null>(null);
    const [avisoGruLetraBloqueada, setAvisoGruLetraBloqueada] = useState(false);

    const atualizar = (parcial: Partial<RegistroSoftwareRPCDraft>) => {
        onChangeRpc({
            ...rpc,
            ...parcial
        });
    };

    const handleCopiar = async (chave: string, valor: string) => {
        if (!valor) return;
        await navigator.clipboard.writeText(valor.trim());
        setCopiadoCampo(chave);
        setTimeout(() => setCopiadoCampo(null), 1800);
    };

    const handleNumeroGruChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const bruto = e.target.value;
        const tentouDigitarNaoNumero = /\D/.test(bruto);
        setAvisoGruLetraBloqueada(tentouDigitarNaoNumero);

        const somenteDigitos = bruto.replace(/\D/g, "").slice(0, 20);
        atualizar({ numero_gru: somenteDigitos });
    };

    const gruInvalidaOuVazia =
        (rpc.gru_emitida || rpc.gru_paga) && rpc.numero_gru.trim().length < 5;

    const validacaoHash = validarHashSha512(rpc.hash_resumo);

    const etapasObrigatorias = [
        rpc.gru_emitida,
        rpc.gru_paga,
        rpc.hash_gerado,
        rpc.dv_assinada_govbr,
        rpc.pedido_protocolado,
        rpc.rpi_acompanhada
    ];
    const concluidas = etapasObrigatorias.filter(Boolean).length;

    return (
        <div className="step-card">
            <div className="step-card-header">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                    <div>
                        <h2 className="step-card-title">
                            <ClipboardCheck size={22} color="var(--color-primary)" />
                            3. Checklist de Registro no INPI (GRU {TAXA_ATUAL_RPC_REAIS}, Gov.br e RPI)
                        </h2>
                        <p className="step-card-desc">
                            Acompanhe os passos oficiais para registrar seu software no Brasil e copie o seu Hash SHA-512 validado diretamente para o formulário do e-RPC.
                        </p>
                    </div>
                    <span
                        style={{
                            background: concluidas === etapasObrigatorias.length ? "#dcfce7" : "#eff6ff",
                            color: concluidas === etapasObrigatorias.length ? "#15803d" : "#1e40af",
                            padding: "0.35rem 0.85rem",
                            borderRadius: "999px",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            border: "1px solid #bfdbfe"
                        }}
                    >
                        Progresso: {concluidas} / {etapasObrigatorias.length} etapas concluídas
                    </span>
                </div>
            </div>

            {/* PAINEL RÁPIDO DE CÓPIA DO HASH SHA-512 PARA O FORMULÁRIO DO INPI */}
            <div
                style={{
                    background: validacaoHash.valido ? "#f0fdf4" : "#fef2f2",
                    border: validacaoHash.valido ? "1px solid #86efac" : "1px solid #fca5a5",
                    borderRadius: "10px",
                    padding: "1rem 1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem"
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontWeight: 700, fontSize: "0.9rem", color: validacaoHash.valido ? "#166534" : "#991b1b" }}>
                        <Fingerprint size={18} />
                        <span>
                            Resumo Digital Hash SHA-512 ({validacaoHash.tamanho}/128 hex)
                            {rpc.nome_arquivo_hash ? ` — Arquivo: ${rpc.nome_arquivo_hash}` : ""}
                        </span>
                    </div>
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        disabled={!validacaoHash.valido}
                        onClick={() => handleCopiar("hash", rpc.hash_resumo)}
                    >
                        {copiadoCampo === "hash" ? (
                            <>
                                <Check size={14} color="var(--color-success)" /> Copiado!
                            </>
                        ) : (
                            <>
                                <Copy size={14} /> Copiar Hash para o e-RPC
                            </>
                        )}
                    </button>
                </div>
                <div
                    style={{
                        fontFamily: "'Courier New', Courier, monospace",
                        fontSize: "0.82rem",
                        background: "#ffffff",
                        padding: "0.55rem 0.75rem",
                        borderRadius: "6px",
                        border: "1px solid var(--color-border)",
                        wordBreak: "break-all",
                        color: validacaoHash.valido ? "#0f172a" : "#b91c1c"
                    }}
                >
                    {rpc.hash_resumo || "Nenhum Hash SHA-512 gerado ainda. Volte ao Passo 2 para calcular o Hash do seu código-fonte."}
                </div>
            </div>

            {/* CAMPOS PARA GUARDAR O NÚMERO DA GRU (SOMENTE NÚMEROS) E DO PROTOCOLO */}
            <div
                style={{
                    background: "var(--color-surface-muted)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "10px",
                    padding: "1.25rem",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "1.25rem"
                }}
            >
                <div className="form-group">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                        <label className="form-label" htmlFor="rpc_num_gru">
                            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                <Receipt size={16} color="var(--color-primary)" />
                                Número da GRU (Código {CODIGO_GRU_RPC} — {TAXA_ATUAL_RPC_REAIS})
                            </span>
                        </label>
                        {rpc.numero_gru && (
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleCopiar("gru", rpc.numero_gru)}
                                style={{ padding: "0.15rem 0.5rem", fontSize: "0.75rem" }}
                            >
                                {copiadoCampo === "gru" ? <Check size={12} color="var(--color-success)" /> : <Copy size={12} />}
                                {copiadoCampo === "gru" ? "Copiado" : "Copiar"}
                            </button>
                        )}
                    </div>
                    <input
                        id="rpc_num_gru"
                        type="text"
                        inputMode="numeric"
                        className="form-input"
                        style={{
                            borderColor: gruInvalidaOuVazia ? "#ef4444" : rpc.numero_gru.length >= 5 ? "#22c55e" : undefined,
                            backgroundColor: gruInvalidaOuVazia ? "#fffafa" : undefined
                        }}
                        placeholder="Somente números (Ex: 29400012345678)"
                        value={rpc.numero_gru}
                        onChange={handleNumeroGruChange}
                    />
                    {avisoGruLetraBloqueada && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.35rem",
                                fontSize: "0.78rem",
                                color: "#b91c1c",
                                fontWeight: 600
                            }}
                        >
                            <Ban size={13} />
                            <span>Letras e símbolos são bloqueados neste campo — digite apenas os números da GRU.</span>
                        </div>
                    )}
                    {gruInvalidaOuVazia && (
                        <div style={{ fontSize: "0.78rem", color: "#b91c1c", fontWeight: 600 }}>
                            • Preencha o número da GRU emitida/paga (mínimo de 5 dígitos numéricos) para não perdê-lo antes do protocolo.
                        </div>
                    )}
                    <span className="form-label-hint">
                        Aceita apenas dígitos numéricos. Sem o Nosso Número da GRU paga, o sistema e-RPC não abre o formulário.
                    </span>
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="rpc_num_proc">
                        <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                            <Newspaper size={16} color="#0d9488" />
                            Número do Pedido Protocolado (Para consulta na RPI)
                        </span>
                    </label>
                    <input
                        id="rpc_num_proc"
                        type="text"
                        className="form-input"
                        placeholder="Ex: BR 51 2026 001234-5 (anote após enviar no site)"
                        value={rpc.numero_protocolo}
                        onChange={(e) => atualizar({ numero_protocolo: e.target.value })}
                    />
                    <span className="form-label-hint">
                        Anote aqui após submeter para acompanhar a publicação do certificado na Revista RPI.
                    </span>
                </div>
            </div>

            {/* ALERTA CRÍTICO SOBRE PAGAMENTO PRÉVIO DA GRU */}
            <div className="warning-alert">
                <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                <div>
                    <strong>Atenção Crítica (Taxa Atual de {TAXA_ATUAL_RPC_REAIS} — Pague antes de Protocolar):</strong> No INPI, o boleto da GRU (Código {CODIGO_GRU_RPC}) deve ser <strong>efetivamente pago antes</strong> de enviar o formulário eletrônico no e-RPC. Protocolar o pedido antes da quitação bancária gera nulidade do processo!
                </div>
            </div>

            {/* ROTEIRO INTERATIVO PASSO A PASSO */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {/* Passo 1 */}
                <label
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.85rem",
                        padding: "1rem 1.15rem",
                        borderRadius: "10px",
                        border: rpc.gru_emitida ? "1px solid #86efac" : "1px solid var(--color-border)",
                        background: rpc.gru_emitida ? "#f0fdf4" : "#ffffff",
                        cursor: "pointer"
                    }}
                >
                    <input
                        type="checkbox"
                        style={{ width: "18px", height: "18px", marginTop: "0.2rem" }}
                        checked={rpc.gru_emitida}
                        onChange={(e) => atualizar({ gru_emitida: e.target.checked })}
                    />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>
                            1. Ir no sistema de GRU do INPI e gerar o boleto do programa (Código {CODIGO_GRU_RPC} — {TAXA_ATUAL_RPC_REAIS})
                        </div>
                        <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginTop: "0.2rem" }}>
                            Acesse o portal do INPI, selecione a unidade <strong>Programa de Computador</strong> e emita a GRU <strong>Código {CODIGO_GRU_RPC}</strong> (atualmente no valor de <strong>{TAXA_ATUAL_RPC_REAIS}</strong>). Ao gerar a GRU, a própria plataforma do governo já disponibiliza a <strong>Declaração de Veracidade (DV)</strong> oficial.
                        </p>
                    </div>
                </label>

                {/* Passo 2 */}
                <label
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.85rem",
                        padding: "1rem 1.15rem",
                        borderRadius: "10px",
                        border: rpc.gru_paga ? "1px solid #86efac" : "1px solid var(--color-border)",
                        background: rpc.gru_paga ? "#f0fdf4" : "#ffffff",
                        cursor: "pointer"
                    }}
                >
                    <input
                        type="checkbox"
                        style={{ width: "18px", height: "18px", marginTop: "0.2rem" }}
                        checked={rpc.gru_paga}
                        onChange={(e) => atualizar({ gru_paga: e.target.checked })}
                    />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>
                            2. Pagar o boleto da GRU ({TAXA_ATUAL_RPC_REAIS}) e guardar o Número da GRU
                        </div>
                        <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginTop: "0.2rem" }}>
                            Efetue o pagamento bancário antes de iniciar o protocolo e salve o <strong>Nosso Número da GRU</strong> no campo numérico acima.
                        </p>
                    </div>
                </label>

                {/* Passo 3 */}
                <label
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.85rem",
                        padding: "1rem 1.15rem",
                        borderRadius: "10px",
                        border: rpc.dv_assinada_govbr ? "1px solid #86efac" : "1px solid var(--color-border)",
                        background: rpc.dv_assinada_govbr ? "#f0fdf4" : "#ffffff",
                        cursor: "pointer"
                    }}
                >
                    <input
                        type="checkbox"
                        style={{ width: "18px", height: "18px", marginTop: "0.2rem" }}
                        checked={rpc.dv_assinada_govbr}
                        onChange={(e) => atualizar({ dv_assinada_govbr: e.target.checked })}
                    />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.92rem", display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                            <FileSignature size={16} color="var(--color-primary)" />
                            <span>3. Assinar digitalmente a Declaração de Veracidade (DV) pelo Gov.br</span>
                        </div>
                        <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginTop: "0.2rem" }}>
                            Não é necessário criar nenhuma minuta manual: a plataforma do governo já gera a Declaração de Veracidade quando você emite a GRU. Basta assiná-la digitalmente usando sua conta <strong>Gov.br</strong>.
                        </p>
                    </div>
                </label>

                {/* Passo 4 */}
                <label
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.85rem",
                        padding: "1rem 1.15rem",
                        borderRadius: "10px",
                        border: rpc.hash_gerado ? "1px solid #86efac" : "1px solid var(--color-border)",
                        background: rpc.hash_gerado ? "#f0fdf4" : "#ffffff",
                        cursor: "pointer"
                    }}
                >
                    <input
                        type="checkbox"
                        style={{ width: "18px", height: "18px", marginTop: "0.2rem" }}
                        checked={rpc.hash_gerado}
                        onChange={(e) => atualizar({ hash_gerado: e.target.checked })}
                    />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>
                            4. Obter o código Hash SHA-512 do seu aplicativo e guardar o arquivo original
                        </div>
                        <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginTop: "0.2rem" }}>
                            Gere o resumo criptográfico de 128 caracteres hexadecimais no <strong>Passo 2</strong> e guarde uma cópia intacta do arquivo <code>.zip</code> / <code>.pdf</code> em local seguro.
                        </p>
                    </div>
                </label>

                {/* Passo Opcional: Procuração */}
                <label
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.85rem",
                        padding: "0.85rem 1.15rem",
                        borderRadius: "10px",
                        border: "1px dashed var(--color-border)",
                        background: "var(--color-surface-muted)",
                        cursor: "pointer"
                    }}
                >
                    <input
                        type="checkbox"
                        style={{ width: "18px", height: "18px", marginTop: "0.2rem" }}
                        checked={rpc.procuracao_aplicavel}
                        onChange={(e) => atualizar({ procuracao_aplicavel: e.target.checked })}
                    />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                            (Se aplicável) Anexar Procuração Eletrônica assinada digitalmente
                        </div>
                        <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.15rem" }}>
                            Necessário apenas quando o depósito for protocolado por procurador ou representante em nome do titular.
                        </p>
                    </div>
                </label>

                {/* Passo 5 */}
                <label
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.85rem",
                        padding: "1rem 1.15rem",
                        borderRadius: "10px",
                        border: rpc.pedido_protocolado ? "1px solid #86efac" : "1px solid var(--color-border)",
                        background: rpc.pedido_protocolado ? "#f0fdf4" : "#ffffff",
                        cursor: "pointer"
                    }}
                >
                    <input
                        type="checkbox"
                        style={{ width: "18px", height: "18px", marginTop: "0.2rem" }}
                        checked={rpc.pedido_protocolado}
                        onChange={(e) => atualizar({ pedido_protocolado: e.target.checked })}
                    />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>
                            5. Preencher o formulário eletrônico diretamente no site do INPI (e-RPC)
                        </div>
                        <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginTop: "0.2rem" }}>
                            Informe o número da GRU paga, preencha os dados no portal oficial do INPI, cole o <strong>Hash SHA-512</strong> copiado acima e anexe a Declaração de Veracidade assinada no Gov.br.
                        </p>
                    </div>
                </label>

                {/* Passo 6 */}
                <label
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.85rem",
                        padding: "1rem 1.15rem",
                        borderRadius: "10px",
                        border: rpc.rpi_acompanhada ? "1px solid #86efac" : "1px solid var(--color-border)",
                        background: rpc.rpi_acompanhada ? "#f0fdf4" : "#ffffff",
                        cursor: "pointer"
                    }}
                >
                    <input
                        type="checkbox"
                        style={{ width: "18px", height: "18px", marginTop: "0.2rem" }}
                        checked={rpc.rpi_acompanhada}
                        onChange={(e) => atualizar({ rpi_acompanhada: e.target.checked })}
                    />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.92rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <CheckCircle2 size={16} color="#16a34a" />
                            <span>6. Com o pedido feito, certificar a publicação na Revista da Propriedade Industrial (RPI)</span>
                        </div>
                        <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", marginTop: "0.2rem" }}>
                            Acompanhe as edições semanais de terça-feira da <strong>Revista RPI (Seção de Programas de Computador)</strong>. Assim que sair o despacho de concessão (em média 7 a 10 dias), baixe seu <strong>Certificado Oficial de Registro</strong> no portal do INPI!
                        </p>
                    </div>
                </label>
            </div>
        </div>
    );
};
