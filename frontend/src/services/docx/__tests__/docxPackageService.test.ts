import { describe, it, expect, vi, beforeAll } from "vitest";
// @ts-ignore
import fs from "node:fs";
// @ts-ignore
import path from "node:path";
import JSZip from "jszip";
import * as fileSaver from "file-saver";
import { exportarPacotePatenteLocal } from "../docxPackageService";
import { PacotePatentePayload } from "../../../features/patentes/types/TiposPatentes";

// @ts-ignore
declare const __dirname: string;

vi.mock("file-saver", () => {
    return {
        default: vi.fn(),
        saveAs: vi.fn()
    };
});

describe("docxPackageService (Etapa 5 & 7)", () => {
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

    it("deve gerar o pacote ZIP com os 4 documentos oficiais e disparar o download via saveAs", async () => {
        let salvoBlob: any = null;
        let salvoNome: string = "";

        // @ts-ignore
        fileSaver.default.mockImplementation(((blob: any, name: string) => {
            salvoBlob = blob;
            salvoNome = name;
        }) as any);

        const payloadFicticio: PacotePatentePayload = {
            modalidade: "PI",
            relatorio: {
                titulo: "SISTEMA IOT DE SENSORIAMENTO",
                campo_da_invencao: "Dispositivos inteligentes em malha.",
                estado_da_tecnica: "Soluções anteriores consomem muita energia.",
                problema_e_vantagens: "Reduz o ciclo de trabalho em 80%.",
                paragrafos_descricao: ["O circuito utiliza transceptores de ultra-baixo consumo."],
                exemplos_concretizacao: "Concretização usando bateria recarregável solar."
            },
            quadro_reivindicatorio: [
                {
                    numero: 1,
                    tipo: "independente",
                    preambulo: "SISTEMA",
                    dependencia: null,
                    caracterizacao: "compreender sensores acoplados a um microcontrolador."
                }
            ],
            desenhos: [
                {
                    numero_figura: "1",
                    descricao_breve: "Diagrama esquemático."
                }
            ],
            resumo: {
                titulo: "SISTEMA IOT DE SENSORIAMENTO",
                texto: "Resumo explicativo da patente atendendo aos requisitos formais de concisão e clareza do INPI."
            },
            rpc: {
                hash_resumo: "",
                nome_arquivo_hash: "",
                numero_gru: "",
                numero_protocolo: "",
                gru_emitida: false,
                gru_paga: false,
                hash_gerado: false,
                dv_assinada_govbr: false,
                procuracao_aplicavel: false,
                pedido_protocolado: false,
                rpi_acompanhada: false
            }
        };

        await exportarPacotePatenteLocal(payloadFicticio);

        expect(salvoNome).toBe("Pacote_Minutas_PI.zip");
        expect(salvoBlob).toBeDefined();

        // Descompacta e valida o conteúdo gerado dentro do ZIP
        const arrayBuffer = await salvoBlob.arrayBuffer();
        const zipLido = await JSZip.loadAsync(arrayBuffer);
        const nomesArquivos = Object.keys(zipLido.files);

        expect(nomesArquivos).toContain("01_Relatorio_Descritivo_PI.docx");
        expect(nomesArquivos).toContain("02_Quadro_Reivindicatorio_PI.docx");
        expect(nomesArquivos).toContain("03_Desenhos_PI.docx");
        expect(nomesArquivos).toContain("04_Resumo_PI.docx");
    });
});
