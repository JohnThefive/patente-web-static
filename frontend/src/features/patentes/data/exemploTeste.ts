import { PacotePatentePayload } from "../types/TiposPatentes";

export const EXEMPLO_TESTE_PATENTE: PacotePatentePayload = {
    modalidade: "PI",
    relatorio: {
        titulo: "SISTEMA E MÉTODO PARA MONITORAMENTO DE SENSORES EM BORDA",
        campo_da_invencao: "A presente invenção refere-se a sistemas embarcados de baixa potência e computação em borda voltados para redes de sensores industriais e agrícolas.",
        estado_da_tecnica: "Atualmente, os sistemas de leitura de sensores exigem transmissão contínua de pacotes brutos via redes sem fio, o que ocasiona alto consumo energético e sobrecarga nos concentradores centrais.",
        problema_e_vantagens: "A presente invenção soluciona o alto consumo energético através da aplicação de algoritmo de pré-filtragem em borda, transmitindo apenas deltas de variação e aumentando a autonomia operacional em até 80%.",
        paragrafos_descricao: [
            "Conforme ilustrado na Figura 1, o sistema compreende uma unidade sensora analógica (10) conectada a um microcontrolador (20).",
            "O processamento local descarta amostras redundantes antes do acionamento do transceptor de rádio frequência (30), assegurando eficiência energética e integridade da malha de telemetria."
        ],
        exemplos_concretizacao: "Em uma concretização preferencial desenvolvida em bancada, utilizou-se um microcontrolador operando a 3.3V acoplado a um módulo de comunicação de longa distância com ciclo de trabalho de 1%."
    },
    quadro_reivindicatorio: [
        {
            numero: 1,
            tipo: "independente",
            preambulo: "SISTEMA PARA MONITORAMENTO DE SENSORES EM BORDA compreendendo uma unidade de aquisição e um microcontrolador",
            dependencia: null,
            caracterizacao: "possuir um módulo de filtragem local que descarta ruídos e transmite apenas variações relativas antes do envio por radiofrequência"
        },
        {
            numero: 2,
            tipo: "dependente",
            preambulo: "SISTEMA PARA MONITORAMENTO DE SENSORES EM BORDA",
            dependencia: 1,
            caracterizacao: "o módulo de filtragem operar sob regime de suspensão de energia entre amostragens sucessivas de sinal"
        }
    ],
    desenhos: [
        {
            numero_figura: "1",
            descricao_breve: "Diagrama esquemático em blocos da arquitetura do sistema proposto.",
            imagem_base64: null
        }
    ],
    resumo: {
        titulo: "SISTEMA E MÉTODO PARA MONITORAMENTO DE SENSORES EM BORDA",
        texto: "A presente invenção descreve um sistema e método para monitoramento de sensores em borda voltado para dispositivos de baixo consumo energético. O sistema resolve o problema da sobrecarga de transmissão de dados brutos em redes sem fio através da aplicação de um estágio de pré-processamento e filtragem diretamente na unidade microcontroladora local, permitindo que apenas eventos relevantes sejam transmitidos ao servidor central e aumentando significativamente a autonomia da bateria do dispositivo em campo."
    }
};
