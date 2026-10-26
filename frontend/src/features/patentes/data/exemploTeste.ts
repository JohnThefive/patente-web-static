import { PacotePatentePayload, RegistroSoftwareRPCDraft } from "../types/TiposPatentes";

export const EXEMPLO_RPC_TESTE: RegistroSoftwareRPCDraft = {
    hash_resumo:
        "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08" +
        "4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce",
    nome_arquivo_hash: "codigo_fonte_patente_web_v1_0.zip",
    numero_gru: "29400087654321",
    numero_protocolo: "",
    gru_emitida: true,
    gru_paga: true,
    hash_gerado: true,
    dv_assinada_govbr: true,
    procuracao_aplicavel: false,
    pedido_protocolado: false,
    rpi_acompanhada: false
};

export const EXEMPLO_TESTE_PATENTE: PacotePatentePayload = {
    modalidade: "PI",
    relatorio: {
        titulo: "SISTEMA E MÉTODO PARA MONITORAMENTO DE SENSORES EM BORDA",
        campo_da_invencao:
            "A presente invenção refere-se a sistemas embarcados de baixa potência e computação em borda voltados para redes de sensores industriais e agrícolas.",
        estado_da_tecnica:
            "Atualmente, os sistemas de leitura de sensores exigem transmissão contínua de pacotes brutos via redes sem fio, o que ocasiona alto consumo energético e sobrecarga nos concentradores centrais.",
        problema_e_vantagens:
            "A presente invenção soluciona o alto consumo energético através da aplicação de algoritmo de pré-filtragem em borda, transmitindo apenas deltas de variação e aumentando a autonomia operacional em até 80%.",
        paragrafos_descricao: [
            "Conforme ilustrado na Figura 1, o sistema compreende uma unidade sensora analógica (10) conectada a um microcontrolador (20).",
            "O processamento local descarta amostras redundantes antes do acionamento do transceptor de rádio frequência (30), assegurando eficiência energética e integridade da malha de telemetria."
        ],
        exemplos_concretizacao:
            "Em uma concretização preferencial desenvolvida em bancada, utilizou-se um microcontrolador operando a 3.3V acoplado a um módulo de comunicação de longa distância com ciclo de trabalho de 1%.",
        efeito_tecnico_alcancado:
            "Redução física mensurável de 78% na corrente média drenada pelo barramento de rádio frequência e mitigação de colisão de pacotes no espectro sub-GHz.",
        arquitetura_execucao:
            "Unidade microcontroladora ARM Cortex-M4 embarcada integrada a sensores analógicos via ADC de 12 bits e transceptor LoRa SX1276 via SPI."
    },
    quadro_reivindicatorio: [
        {
            numero: 1,
            tipo: "independente",
            preambulo:
                "SISTEMA PARA MONITORAMENTO DE SENSORES EM BORDA compreendendo uma unidade de aquisição e um microcontrolador",
            dependencia: null,
            caracterizacao:
                "possuir um módulo de filtragem local que descarta ruídos e transmite apenas variações relativas antes do envio por radiofrequência"
        },
        {
            numero: 2,
            tipo: "dependente",
            preambulo: "SISTEMA PARA MONITORAMENTO DE SENSORES EM BORDA",
            dependencia: 1,
            caracterizacao:
                "o módulo de filtragem operar sob regime de suspensão de energia entre amostragens sucessivas de sinal"
        }
    ],
    desenhos: [
        {
            numero_figura: "1",
            descricao_breve: "ilustra o diagrama esquemático em blocos da arquitetura do sistema proposto.",
            imagem_base64: null
        }
    ],
    resumo: {
        titulo: "SISTEMA E MÉTODO PARA MONITORAMENTO DE SENSORES EM BORDA",
        texto:
            "A presente invenção descreve um sistema e método para monitoramento de sensores em borda voltado para dispositivos de baixo consumo energético. O sistema resolve o problema da sobrecarga de transmissão de dados brutos em redes sem fio através da aplicação de um estágio de pré-processamento e filtragem diretamente na unidade microcontroladora local, permitindo que apenas eventos relevantes sejam transmitidos ao servidor central e aumentando significativamente a autonomia da bateria do dispositivo em campo."
    },
    rpc: EXEMPLO_RPC_TESTE
};
