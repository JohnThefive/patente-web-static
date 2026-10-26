/**
 * Conteúdo de apoio jurídico, taxas e dicas práticas para o Registro de Programa de Computador (e-RPC)
 * conforme a Lei nº 9.609/1998 e diretrizes oficiais do INPI / Gov.br.
 */

export const TAXA_ATUAL_RPC_REAIS = "R$ 210,00";
export const CODIGO_GRU_RPC = "730";

export interface FaqJuridicoSoftware {
    pergunta: string;
    resposta: string;
}

export const FAQ_JURIDICO_SOFTWARE: FaqJuridicoSoftware[] = [
    {
        pergunta: "Quanto custa atualmente e como funciona a Declaração de Veracidade (DV)?",
        resposta:
            "Atualmente, a taxa federal do INPI (GRU Código 730) custa R$ 210,00 para o registro eletrônico de programa de computador. Ao emitir a GRU na plataforma oficial do governo, o próprio sistema do INPI já disponibiliza a Declaração de Veracidade (DV) — você não precisa redigir nenhuma minuta, bastando assiná-la digitalmente via Gov.br (nível Prata ou Ouro) ou certificado ICP-Brasil."
    },
    {
        pergunta: "Quais as vantagens reais de registrar o software no INPI?",
        resposta:
            "Garante Direito Patrimonial (exclusividade para explorar economicamente, licenciar ou vender por 50 anos a partir de 1º de janeiro do ano seguinte à publicação/criação), Direito Moral (reconhecimento oficial de autoria) e Segurança Jurídica imediata com fé pública (essencial em editais de fomento, licitações públicas e provas contra pirataria)."
    },
    {
        pergunta: "A proteção vale apenas para aquele arquivo de código-fonte isolado?",
        resposta:
            "Não apenas para o texto literal isolado: o registro protege o código-fonte e toda a estrutura interna, arquitetura e organização que gerou o código (incluindo o arranjo específico de bibliotecas utilizadas, módulos e frameworks integrados na criação)."
    },
    {
        pergunta: "E se alguém reescrever meu software em outra linguagem de programação?",
        resposta:
            "Continua protegido! A tradução ou conversão não autorizada da estrutura do seu código-fonte para outra linguagem constitui violação de direito autoral (derivação ilícita/plágio), deixando o infrator sujeito a notificação judicial e indenização."
    },
    {
        pergunta: "O registro dá exclusividade sobre a funcionalidade ou ideia de negócio?",
        resposta:
            "Não. O registro de software não dá exclusividade à funcionalidade abstrata criada, mas sim à criação intelectual na forma de código-fonte. Outra pessoa pode criar um aplicativo com objetivo parecido, desde que desenvolva um código-fonte próprio do zero, sem copiar ou traduzir a sua estrutura."
    },
    {
        pergunta: "Quando preciso atualizar ou fazer um novo registro do sistema?",
        resposta:
            "Toda alteração muito significativa na arquitetura ou evolução substancial do código-fonte exige um novo registro para cobrir a nova versão. Pequenas correções de bugs ou ajustes rotineiros não exigem novo depósito."
    },
    {
        pergunta: "Como posso proteger também o layout visual e as telas do meu aplicativo?",
        resposta:
            "Proteger o layout do aplicativo (telas, ícones e padrões visuais de interface gráfica) através de Desenho Industrial (DI) no INPI é uma excelente possibilidade complementar ao registro do código-fonte!"
    }
];
