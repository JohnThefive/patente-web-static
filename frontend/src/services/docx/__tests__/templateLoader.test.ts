import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    getTemplateUrl,
    carregarTemplate,
    limparCacheTemplates,
    obterTemplateRelatorio,
    obterTemplateQuadro,
    obterTemplateDesenhos,
    obterTemplateResumo
} from "../templateLoader";

describe("templateLoader", () => {
    beforeEach(() => {
        limparCacheTemplates();
        vi.restoreAllMocks();
    });

    describe("getTemplateUrl", () => {
        it("deve montar a URL correta com base no caminho relativo", () => {
            const url = getTemplateUrl("templates_pi/04_Exemplo_de_PI_Resumo.docx");
            expect(url).toContain("/templates/templates_pi/04_Exemplo_de_PI_Resumo.docx");
        });
    });

    describe("carregarTemplate e Cache", () => {
        it("deve buscar o arquivo via fetch e armazenar no cache na segunda chamada", async () => {
            const mockBuffer = new ArrayBuffer(64);
            const fetchMock = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                statusText: "OK",
                arrayBuffer: vi.fn().mockResolvedValue(mockBuffer)
            });
            globalThis.fetch = fetchMock;

            const res1 = await carregarTemplate("teste.docx");
            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(res1.byteLength).toBe(64);

            // Segunda chamada: deve vir do cache sem novo fetch
            const res2 = await carregarTemplate("teste.docx");
            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(res2.byteLength).toBe(64);
        });

        it("deve lançar erro descritivo quando a resposta HTTP for de erro", async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 404,
                statusText: "Not Found"
            });

            await expect(carregarTemplate("arquivo_inexistente.docx")).rejects.toThrow(
                /Não foi possível carregar o modelo de documento.*Código HTTP: 404/
            );
        });
    });

    describe("helpers de modalidade", () => {
        it("deve mapear corretamente os templates por modalidade", async () => {
            const fetchMock = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(16))
            });
            globalThis.fetch = fetchMock;

            await obterTemplateRelatorio("PI");
            expect(fetchMock.mock.calls[0][0]).toContain("templates_pi/01_template_PI_relatorio_descritivo.docx");

            await obterTemplateRelatorio("MU");
            expect(fetchMock.mock.calls[1][0]).toContain("templates_mu/01_Exemplo_de_MU_Relatorio_Descritivo.docx");

            await obterTemplateRelatorio("CII_SOFTWARE");
            expect(fetchMock.mock.calls[2][0]).toContain("templates_cii/01_template_CII_relatorio_descritivo.docx");

            await obterTemplateQuadro();
            expect(fetchMock.mock.calls[3][0]).toContain("templates_pi/02_Exemplo_de_PI_quadro_reinvendictorio.docx");

            await obterTemplateDesenhos();
            expect(fetchMock.mock.calls[4][0]).toContain("templates_pi/03_Exemplo_de_PI _desenhos.docx");

            await obterTemplateResumo();
            expect(fetchMock.mock.calls[5][0]).toContain("templates_pi/04_Exemplo_de_PI_Resumo.docx");
        });
    });
});
