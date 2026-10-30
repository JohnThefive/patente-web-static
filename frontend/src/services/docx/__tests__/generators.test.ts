import { describe, it, expect, vi, beforeAll } from "vitest";
// @ts-ignore
import fs from "node:fs";
// @ts-ignore
import path from "node:path";
import PizZip from "pizzip";
import {
    gerarRelatorioDocx,
    gerarQuadroDocx,
    gerarResumoDocx,
    gerarDesenhosDocx
} from "../generators";
import {
    RelatorioDescritivoPI,
    RelatorioDescritivoMU,
    ReivindicacaoItem,
    DesenhoItem,
    ResumoPI
} from "../../../features/patentes/types/TiposPatentes";

// @ts-ignore
declare const __dirname: string;

describe("DOCX Generators (Etapa 4)", () => {
    beforeAll(() => {
        const publicDir = path.resolve(__dirname, "../../../../public/templates");

        globalThis.fetch = vi.fn().mockImplementation(async (input: any) => {
            const url = typeof input === "string" ? input : input.url;
            const match = url.match(/\/templates\/(.+)$/);
            const relPath = match ? decodeURIComponent(match[1]) : url;
            const fullPath = path.join(publicDir, relPath);
            const fileBuffer = fs.readFileSync(fullPath);

            return {
                ok: true,
                status: 200,
                statusText: "OK",
                arrayBuffer: async () =>
                    fileBuffer.buffer.slice(
                        fileBuffer.byteOffset,
                        fileBuffer.byteOffset + fileBuffer.byteLength
                    )
            };
        });
    });

    describe("gerarRelatorioDocx", () => {
        it("deve gerar o Relatório Descritivo de PI com sucesso", async () => {
            const relatorioPI: RelatorioDescritivoPI = {
                titulo: "SISTEMA DE MONITORAMENTO IOT",
                campo_da_invencao: "A presente invenção refere-se a dispositivos inteligentes.",
                estado_da_tecnica: "No estado da técnica anterior inexistem soluções similares.",
                problema_e_vantagens: "Resolve a alta latência através de processamento em borda.",
                paragrafos_descricao: [
                    "O dispositivo é composto por uma CPU e módulos de sensores.",
                    "A comunicação é realizada via protocolo sem fio de baixo consumo."
                ],
                exemplos_concretizacao: "Em uma concretização preferencial, o sensor opera a 2.4 GHz."
            };

            const buffer = await gerarRelatorioDocx("PI", relatorioPI, [
                { numero_figura: "1", descricao_breve: "Vista esquemática do circuito." }
            ]);

            expect(buffer).toBeInstanceOf(Uint8Array);
            expect(buffer.length).toBeGreaterThan(1000);

            // Verifica se o arquivo gerado é um ZIP/DOCX válido
            const zip = new PizZip(buffer);
            expect(zip.file("word/document.xml")).toBeDefined();
        });

        it("deve gerar o Relatório Descritivo de MU com sucesso", async () => {
            const relatorioMU: RelatorioDescritivoMU = {
                titulo: "DISPOSITIVO DE FIXAÇÃO MODULAR",
                campo_modelo_de_utilidade: "Refere-se a um modelo de utilidade para ferramentas manuais.",
                estado_da_tecnica_utilidade: "As fixações convencionais exigem ferramentas auxiliares.",
                problema_e_vantagens_utilidade: "Permite engate rápido por pressão sem folgas mecânicas.",
                paragrafos_descricao: ["O engate compreende uma trava articulada."],
                exemplos_concretizacao_MU: "Em uso prático, a haste acopla-se diretamente na base."
            };

            const buffer = await gerarRelatorioDocx("MU", relatorioMU);
            expect(buffer.length).toBeGreaterThan(1000);
            const zip = new PizZip(buffer);
            expect(zip.file("word/document.xml")).toBeDefined();
        });

        it("deve gerar o Relatório Descritivo de Software (CII) com sucesso", async () => {
            const relatorioCII: RelatorioDescritivoPI = {
                titulo: "MÉTODO E SISTEMA DISTRIBUÍDO DE CRIPTOGRAFIA",
                campo_da_invencao: "Sistemas computacionais embarcados.",
                estado_da_tecnica: "Processamento sequencial sobrecarrega a CPU.",
                problema_e_vantagens: "Reduz o consumo de clock em 40%.",
                efeito_tecnico_alcancado: "Aceleração criptográfica por hardware via pipelines paralelos.",
                arquitetura_execucao: "Microcontrolador ARM Cortex-M4 com aceleração AES-256 por hardware.",
                paragrafos_descricao: ["O firmware divide as instruções em blocos atômicos."],
                exemplos_concretizacao: "Executado em nós coletores com 64KB de RAM."
            };

            const buffer = await gerarRelatorioDocx("CII_SOFTWARE", relatorioCII);
            expect(buffer.length).toBeGreaterThan(1000);
            const zip = new PizZip(buffer);
            expect(zip.file("word/document.xml")).toBeDefined();
        });
    });

    describe("gerarQuadroDocx", () => {
        it("deve gerar o Quadro Reivindicatório com reivindicações independentes e dependentes", async () => {
            const reivindicacoes: ReivindicacaoItem[] = [
                {
                    numero: 1,
                    tipo: "independente",
                    preambulo: "SISTEMA DE SENSORIAMENTO",
                    dependencia: null,
                    caracterizacao: "compreender uma matriz de sensores acoplada a um microcontrolador."
                },
                {
                    numero: 2,
                    tipo: "dependente",
                    preambulo: "SISTEMA",
                    dependencia: 1,
                    caracterizacao: "a matriz de sensores operar na faixa de frequência de 915 MHz."
                }
            ];

            const buffer = await gerarQuadroDocx(reivindicacoes);
            expect(buffer.length).toBeGreaterThan(1000);
            const zip = new PizZip(buffer);
            const documentXml = zip.file("word/document.xml")?.asText();
            expect(documentXml).toContain("1. SISTEMA DE SENSORIAMENTO, caracterizado por compreender uma matriz");
            expect(documentXml).toContain("2. SISTEMA, de acordo com a reivindicação 1, caracterizado por");
        });
    });

    describe("gerarResumoDocx", () => {
        it("deve gerar o Resumo com título em maiúsculas e corpo formatado", async () => {
            const resumo: ResumoPI = {
                titulo: "Dispositivo de Teste",
                texto: "Resumo com mais de 50 palavras explicando a matéria técnica da invenção conforme exigência do INPI."
            };

            const buffer = await gerarResumoDocx(resumo);
            expect(buffer.length).toBeGreaterThan(1000);
            const zip = new PizZip(buffer);
            const documentXml = zip.file("word/document.xml")?.asText();
            expect(documentXml).toContain("DISPOSITIVO DE TESTE");
            expect(documentXml).toContain("Resumo com mais de 50 palavras");
        });
    });

    describe("gerarDesenhosDocx", () => {
        it("deve gerar a minuta de figuras técnicas", async () => {
            const desenhos: DesenhoItem[] = [
                { numero_figura: "1", descricao_breve: "Vista frontal" },
                { numero_figura: "2", descricao_breve: "Diagrama esquemático em blocos" }
            ];

            const buffer = await gerarDesenhosDocx(desenhos);
            expect(buffer.length).toBeGreaterThan(1000);
            const zip = new PizZip(buffer);
            const documentXml = zip.file("word/document.xml")?.asText();
            expect(documentXml).toContain("Figura 1: Vista frontal");
            expect(documentXml).toContain("Figura 2: Diagrama esquemático em blocos");
        });
    });
});
