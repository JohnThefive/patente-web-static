import { describe, it, expect } from "vitest";
import {
    formatarHeader,
    formatarTextoReivindicacao,
    higienizarParagrafo
} from "../docxFormatters";
import { ReivindicacaoItem } from "../../../features/patentes/types/TiposPatentes";

describe("docxFormatters", () => {
    describe("formatarHeader", () => {
        it("deve formatar a seção com o título da invenção em caixa alta", () => {
            const resultado = formatarHeader("Patente de Invenção", "dispositivo sensor iot com ia");
            expect(resultado).toBe("Patente de Invenção - DISPOSITIVO SENSOR IOT COM IA");
        });

        it("deve retornar apenas a seção se o título for nulo ou vazio", () => {
            expect(formatarHeader("Quadro Reivindicatório", "")).toBe("Quadro Reivindicatório");
            expect(formatarHeader("Resumo", null)).toBe("Resumo");
            expect(formatarHeader("Resumo", "   ")).toBe("Resumo");
        });

        it("deve usar o fallback se a seção estiver vazia", () => {
            const resultado = formatarHeader("", "meu título", "Relatório Descritivo");
            expect(resultado).toBe("Relatório Descritivo - MEU TÍTULO");
        });
    });

    describe("formatarTextoReivindicacao", () => {
        it("deve formatar reivindicação independente com único ponto final (Art. 4º, VII da IN 30/2013)", () => {
            const item: ReivindicacaoItem = {
                numero: 1,
                tipo: "independente",
                preambulo: "DISPOSITIVO DE MONITORAMENTO TÉRMICO",
                dependencia: null,
                caracterizacao: "compreender uma matriz de sensores acoplada a um microcontrolador."
            };

            const resultado = formatarTextoReivindicacao(item);
            expect(resultado).toBe(
                "1. DISPOSITIVO DE MONITORAMENTO TÉRMICO, caracterizado por compreender uma matriz de sensores acoplada a um microcontrolador."
            );
            // Garante que termina exatamente com um ponto final e não dois
            expect(resultado.endsWith("..")).toBe(false);
            expect(resultado.endsWith(".")).toBe(true);
        });

        it("deve evitar duplicar a expressão 'caracterizado por' se o usuário já digitou", () => {
            const item: ReivindicacaoItem = {
                numero: 1,
                tipo: "independente",
                preambulo: "SISTEMA",
                dependencia: null,
                caracterizacao: "caracterizado por possuir um módulo sem fio."
            };

            const resultado = formatarTextoReivindicacao(item);
            expect(resultado).toBe("1. SISTEMA, caracterizado por possuir um módulo sem fio.");
        });

        it("deve formatar reivindicação dependente vinculando à reivindicação correta", () => {
            const item: ReivindicacaoItem = {
                numero: 2,
                tipo: "dependente",
                preambulo: "DISPOSITIVO",
                dependencia: 1,
                caracterizacao: "a matriz de sensores operar na faixa de -40°C a 125°C"
            };

            const resultado = formatarTextoReivindicacao(item);
            expect(resultado).toBe(
                "2. DISPOSITIVO, de acordo com a reivindicação 1, caracterizado por a matriz de sensores operar na faixa de -40°C a 125°C."
            );
        });

        it("deve remover pontos finais excedentes no preâmbulo e caracterização", () => {
            const item: ReivindicacaoItem = {
                numero: 3,
                tipo: "dependente",
                preambulo: "SISTEMA DE PROCESSAMENTO...",
                dependencia: 2,
                caracterizacao: "incluir memória NVRAM...."
            };

            const resultado = formatarTextoReivindicacao(item);
            expect(resultado).toBe(
                "3. SISTEMA DE PROCESSAMENTO, de acordo com a reivindicação 2, caracterizado por incluir memória NVRAM."
            );
        });
    });

    describe("higienizarParagrafo", () => {
        it("deve limpar espaços múltiplos e garantir um único ponto final", () => {
            expect(higienizarParagrafo("  este   é um   parágrafo  ")).toBe("este é um parágrafo.");
            expect(higienizarParagrafo("texto já pontuado.")).toBe("texto já pontuado.");
            expect(higienizarParagrafo("")).toBe("");
        });
    });
});
