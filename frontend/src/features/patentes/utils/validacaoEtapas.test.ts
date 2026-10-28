import { describe, it, expect } from "vitest";
import { obterPendenciasDaEtapa } from "./validacaoEtapas";
import { EXEMPLO_TESTE_PATENTE } from "../data/exemploTeste";
import { PacotePatentePayload } from "../types/TiposPatentes";

function clonarExemplo(): PacotePatentePayload {
    return JSON.parse(JSON.stringify(EXEMPLO_TESTE_PATENTE));
}

describe("obterPendenciasDaEtapa — Sincronização Frontend x Backend INPI", () => {
    it("deve aprovar todas as etapas do EXEMPLO_TESTE_PATENTE na modalidade PI", () => {
        const rascunho = clonarExemplo();
        for (let etapa = 1; etapa <= 5; etapa++) {
            expect(obterPendenciasDaEtapa(etapa, rascunho)).toEqual([]);
        }
    });

    it("Etapa 3 (Reivindicações): exige preâmbulo >= 5 caracteres e caracterização >= 10 caracteres", () => {
        const rascunho = clonarExemplo();
        rascunho.quadro_reivindicatorio = [
            {
                numero: 1,
                tipo: "independente",
                preambulo: "ABCD", // 4 chars -> deve bloquear
                dependencia: null,
                caracterizacao: "123456789" // 9 chars -> deve bloquear
            }
        ];

        const erros = obterPendenciasDaEtapa(3, rascunho);
        expect(erros).toHaveLength(2);

        rascunho.quadro_reivindicatorio[0].preambulo = "ABCDE"; // 5 chars
        rascunho.quadro_reivindicatorio[0].caracterizacao = "1234567890"; // 10 chars
        expect(obterPendenciasDaEtapa(3, rascunho)).toEqual([]);
    });

    it("Etapa 5 (Resumo): exige estritamente entre 50 e 200 palavras", () => {
        const rascunho = clonarExemplo();

        rascunho.resumo.texto = Array(49).fill("palavra").join(" ");
        expect(obterPendenciasDaEtapa(5, rascunho).length).toBeGreaterThan(0);

        rascunho.resumo.texto = Array(50).fill("palavra").join(" ");
        expect(obterPendenciasDaEtapa(5, rascunho)).toEqual([]);

        rascunho.resumo.texto = Array(200).fill("palavra").join(" ");
        expect(obterPendenciasDaEtapa(5, rascunho)).toEqual([]);

        rascunho.resumo.texto = Array(201).fill("palavra").join(" ");
        expect(obterPendenciasDaEtapa(5, rascunho).length).toBeGreaterThan(0);
    });

    it("Modalidade MU: aceita 0 desenhos na Etapa 4 (conforme schema de testes do backend)", () => {
        const rascunho = clonarExemplo();
        rascunho.modalidade = "MU";
        rascunho.desenhos = [];

        expect(obterPendenciasDaEtapa(4, rascunho)).toEqual([]);
    });

    it("Modalidade CII_SOFTWARE: exige efeito_tecnico_alcancado >= 15 chars (Etapa 2) e >= 1 desenho (Etapa 4)", () => {
        const rascunho = clonarExemplo();
        rascunho.modalidade = "CII_SOFTWARE";
        (rascunho.relatorio as any).efeito_tecnico_alcancado = "curto demais"; // 12 chars
        (rascunho.relatorio as any).arquitetura_execucao = ""; // opcional no backend
        rascunho.desenhos = [];

        expect(obterPendenciasDaEtapa(2, rascunho)).toHaveLength(1);
        expect(obterPendenciasDaEtapa(4, rascunho)).toHaveLength(1);

        (rascunho.relatorio as any).efeito_tecnico_alcancado = "Redução física de 70% na latência";
        rascunho.desenhos = [
            {
                numero_figura: "1",
                descricao_breve: "Fluxograma técnico",
                imagem_base64: null
            }
        ];

        expect(obterPendenciasDaEtapa(2, rascunho)).toEqual([]);
        expect(obterPendenciasDaEtapa(4, rascunho)).toEqual([]);
    });

    it("Modalidade RPC: bloqueia avanço na Etapa 2 sem Hash SHA-512 válido de 128 hex", () => {
        const rascunho = clonarExemplo();
        rascunho.modalidade = "RPC";
        rascunho.rpc.hash_resumo = "1234abcd";

        expect(obterPendenciasDaEtapa(2, rascunho)).toHaveLength(1);

        rascunho.rpc.hash_resumo = "f".repeat(128);
        expect(obterPendenciasDaEtapa(2, rascunho)).toEqual([]);
    });
});
