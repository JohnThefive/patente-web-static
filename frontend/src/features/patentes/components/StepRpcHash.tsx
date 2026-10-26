import React, { useRef, useState } from "react";
import { RegistroSoftwareRPCDraft } from "../types/TiposPatentes";
import { gerarHashSha512Arquivo, validarHashSha512 } from "../../../services/hashGenerator";
import {
    Fingerprint,
    Upload,
    ShieldCheck,
    CheckCircle2,
    AlertTriangle,
    Copy,
    Check,
    Loader2,
    Lock,
    Ban
} from "lucide-react";

interface StepRpcHashProps {
    rpc: RegistroSoftwareRPCDraft;
    onChangeRpc: (rpc: RegistroSoftwareRPCDraft) => void;
}

export const StepRpcHash: React.FC<StepRpcHashProps> = ({
    rpc,
    onChangeRpc
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [calculando, setCalculando] = useState(false);
    const [erroArquivo, setErroArquivo] = useState<string | null>(null);
    const [copiado, setCopiado] = useState(false);
    const [tamanhoUltimoArquivo, setTamanhoUltimoArquivo] = useState<number | null>(null);
    const [avisoCaractereBloqueado, setAvisoCaractereBloqueado] = useState<string | null>(null);

    const validacao = validarHashSha512(rpc.hash_resumo);

    const processarArquivo = async (file: File) => {
        setCalculando(true);
        setErroArquivo(null);
        setAvisoCaractereBloqueado(null);

        try {
            const hashCalculado = await gerarHashSha512Arquivo(file);
            setTamanhoUltimoArquivo(file.size);
            onChangeRpc({
                ...rpc,
                hash_resumo: hashCalculado,
                nome_arquivo_hash: file.name,
                hash_gerado: true
            });
        } catch (err: any) {
            setErroArquivo(err.message || "Falha ao calcular o Hash SHA-512 do arquivo.");
        } finally {
            setCalculando(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processarArquivo(file);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processarArquivo(file);
        }
    };

    const handleCopiarHash = async () => {
        if (!rpc.hash_resumo) return;
        await navigator.clipboard.writeText(rpc.hash_resumo.trim());
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    };

    const handleHashInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const valorBruto = e.target.value.replace(/\s+/g, "");
        const possuiInvalidos = /[^0-9a-fA-F]/.test(valorBruto);

        if (possuiInvalidos) {
            setAvisoCaractereBloqueado(
                "Caracteres inválidos (letras fora de A-F ou símbolos) foram bloqueados automaticamente. O Hash SHA-512 aceita apenas caracteres hexadecimais (0-9 e a-f)."
            );
        } else {
            setAvisoCaractereBloqueado(null);
        }

        const novoHash = valorBruto
            .replace(/[^0-9a-fA-F]/g, "")
            .toLowerCase()
            .slice(0, 128);

        const isValido = validarHashSha512(novoHash).valido;
        onChangeRpc({
            ...rpc,
            hash_resumo: novoHash,
            hash_gerado: isValido ? true : rpc.hash_gerado
        });
    };

    const formatarBytes = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const temErroCampo = !validacao.valido;

    return (
        <div className="step-card">
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileSelect}
            />

            <div className="step-card-header">
                <h2 className="step-card-title">
                    <Fingerprint size={22} color="var(--color-primary)" />
                    2. Gerador e Validador de Resumo Digital Hash (SHA-512)
                </h2>
                <p className="step-card-desc">
                    Gere a impressão digital criptográfica do seu código-fonte empacotado (.zip ou .pdf) diretamente no seu navegador, sem enviar seu código para nenhum servidor.
                </p>
            </div>

            {/* SELO ZERO-STORAGE DE SEGURANÇA DO CÓDIGO-FONTE */}
            <div
                style={{
                    background: "#f0fdf4",
                    border: "1px solid #86efac",
                    borderRadius: "10px",
                    padding: "0.9rem 1.15rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    color: "#14532d",
                    fontSize: "0.85rem"
                }}
            >
                <Lock size={20} style={{ flexShrink: 0, color: "#16a34a" }} />
                <div>
                    <strong>Privacidade Total (100% Local no Navegador):</strong> O cálculo do <strong>SHA-512</strong> usa a <em>Web Crypto API</em> nativa da sua própria máquina. O arquivo do seu código-fonte <strong>jamais</strong> sai do seu computador.
                </div>
            </div>

            {/* ÁREA DE UPLOAD / DROPZONE PARA GERAR O HASH */}
            <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                style={{
                    border: "2px dashed #93c5fd",
                    borderRadius: "12px",
                    background: "#eff6ff",
                    padding: "2.25rem 1.5rem",
                    textAlign: "center",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.65rem"
                }}
            >
                {calculando ? (
                    <>
                        <Loader2 size={36} color="var(--color-primary)" className="animate-spin" />
                        <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>
                            Calculando resumo criptográfico SHA-512 em memória...
                        </span>
                    </>
                ) : (
                    <>
                        <Upload size={34} color="var(--color-primary)" />
                        <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-primary)" }}>
                            Clique aqui ou arraste o arquivo do código-fonte (.zip ou .pdf)
                        </div>
                        <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", maxWidth: "540px" }}>
                            Recomendação do INPI: reúna os principais arquivos do código-fonte e documentação técnica em um único arquivo <strong>.zip</strong> ou <strong>.pdf</strong> antes de gerar o Hash.
                        </p>
                        {rpc.nome_arquivo_hash && (
                            <span
                                style={{
                                    marginTop: "0.35rem",
                                    background: "#ffffff",
                                    border: "1px solid #bfdbfe",
                                    borderRadius: "999px",
                                    padding: "0.25rem 0.85rem",
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                    color: "#1e3a8a"
                                }}
                            >
                                Arquivo processado: {rpc.nome_arquivo_hash}
                                {tamanhoUltimoArquivo !== null ? ` (${formatarBytes(tamanhoUltimoArquivo)})` : ""}
                            </span>
                        )}
                    </>
                )}
            </div>

            {erroArquivo && (
                <div className="warning-alert" style={{ backgroundColor: "#fef2f2", borderColor: "#fca5a5", color: "#b91c1c" }}>
                    <AlertTriangle size={18} />
                    <div>{erroArquivo}</div>
                </div>
            )}

            {/* CAMPO DO HASH SHA-512 + VALIDADOR DE 128 CARACTERES HEXADECIMAIS */}
            <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                    <label className="form-label" htmlFor="hash_sha512_input">
                        <span>Resumo Digital Hash (Algoritmo Oficial: SHA-512) *</span>
                    </label>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span
                            style={{
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                padding: "0.18rem 0.65rem",
                                borderRadius: "999px",
                                background: validacao.valido ? "#dcfce7" : "#fef2f2",
                                color: validacao.valido ? "#15803d" : "#b91c1c",
                                border: validacao.valido ? "1px solid #86efac" : "1px solid #fca5a5"
                            }}
                        >
                            {validacao.tamanho} / 128 caracteres hex {validacao.valido ? "✓ Válido" : "• Obrigatório"}
                        </span>

                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            disabled={!validacao.valido}
                            onClick={handleCopiarHash}
                        >
                            {copiado ? (
                                <>
                                    <Check size={14} color="var(--color-success)" /> Copiado!
                                </>
                            ) : (
                                <>
                                    <Copy size={14} /> Copiar Hash
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <textarea
                    id="hash_sha512_input"
                    className="form-textarea"
                    style={{
                        minHeight: "88px",
                        fontFamily: "'Courier New', Courier, monospace",
                        fontSize: "0.88rem",
                        letterSpacing: "0.03em",
                        wordBreak: "break-all",
                        borderColor: temErroCampo ? "#ef4444" : "#22c55e",
                        backgroundColor: temErroCampo ? "#fffafa" : "#f0fdf4"
                    }}
                    placeholder="Selecione seu arquivo .zip/.pdf acima para calcular automaticamente, ou cole aqui um Hash SHA-512 de 128 caracteres hexadecimais (0-9, a-f)..."
                    value={rpc.hash_resumo}
                    onChange={handleHashInputChange}
                />

                {avisoCaractereBloqueado && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.45rem",
                            fontSize: "0.8rem",
                            color: "#b91c1c",
                            background: "#fef2f2",
                            border: "1px solid #fca5a5",
                            borderRadius: "6px",
                            padding: "0.45rem 0.7rem",
                            marginTop: "0.25rem",
                            fontWeight: 600
                        }}
                    >
                        <Ban size={15} style={{ flexShrink: 0 }} />
                        <span>{avisoCaractereBloqueado}</span>
                    </div>
                )}
            </div>

            {/* FEEDBACK DE VALIDAÇÃO DO HASH */}
            <div
                className={validacao.valido ? "info-alert" : "warning-alert"}
                style={
                    validacao.valido
                        ? { background: "#f0fdf4", borderColor: "#86efac", color: "#15803d" }
                        : { background: "#fef2f2", borderColor: "#fca5a5", color: "#b91c1c" }
                }
            >
                {validacao.valido ? (
                    <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
                ) : (
                    <ShieldCheck size={20} style={{ flexShrink: 0 }} />
                )}
                <div>
                    {validacao.mensagem}{" "}
                    {!validacao.valido && (
                        <strong>(Gere ou informe um Hash SHA-512 válido de 128 caracteres para avançar para o Checklist INPI).</strong>
                    )}
                </div>
            </div>

            {/* ALERTA CRÍTICO DE CUSTÓDIA DO ARQUIVO EXATO */}
            <div className="warning-alert">
                <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                <div>
                    <strong>Regra de Ouro de Custódia Pericial:</strong> Guarde em local seguro (backup imutável/nuvem institucional) <strong>exatamente o mesmo arquivo .zip/.pdf</strong> usado para gerar este Hash! Jamais edite, renomeie arquivos internos ou compacte novamente após o protocolo — alterar 1 único bit mudará completamente o Hash caso você precise comprovar autoria em juízo.
                </div>
            </div>
        </div>
    );
};
