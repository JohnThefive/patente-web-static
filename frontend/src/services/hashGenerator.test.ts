import { describe, it, expect } from "vitest";
import { gerarHashSha512Arquivo, validarHashSha512 } from "./hashGenerator";

describe("hashGenerator — SHA-512 Client-Side (e-RPC INPI)", () => {
    it("deve rejeitar hash vazio ou apenas espaços", () => {
        const res = validarHashSha512("   ");
        expect(res.valido).toBe(false);
        expect(res.tamanho).toBe(0);
    });

    it("deve rejeitar caracteres fora do padrão hexadecimal (0-9, a-f)", () => {
        const invalido = "g".repeat(128);
        const res = validarHashSha512(invalido);
        expect(res.valido).toBe(false);
        expect(res.apenasHex).toBe(false);
    });

    it("deve rejeitar hashes com tamanho diferente de 128 caracteres", () => {
        expect(validarHashSha512("a".repeat(64)).valido).toBe(false);
        expect(validarHashSha512("a".repeat(127)).valido).toBe(false);
        expect(validarHashSha512("a".repeat(129)).valido).toBe(false);
    });

    it("deve aprovar string hexadecimal exata de 128 caracteres", () => {
        const hashValido = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08".repeat(2);
        const res = validarHashSha512(hashValido);
        expect(res.valido).toBe(true);
        expect(res.tamanho).toBe(128);
        expect(res.apenasHex).toBe(true);
    });

    it("deve calcular o Hash SHA-512 determinístico de um arquivo em memória", async () => {
        const arquivo = new File(["test"], "codigo_fonte.zip", { type: "application/zip" });
        const hash = await gerarHashSha512Arquivo(arquivo);

        // SHA-512 oficial da string ASCII "test"
        expect(hash).toBe(
            "ee26b0dd4af7e749aa1a8ee3c10ae9923f618980772e473f8819a5d4940e0db2" +
            "7ac185f8a0e1d5f84f88bc887fd67b143732c304cc5fa9ad8e6f57f50028a8ff"
        );
        expect(validarHashSha512(hash).valido).toBe(true);
    });
});
