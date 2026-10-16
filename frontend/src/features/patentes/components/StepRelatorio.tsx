import React from "react";
import { ModalidadePatente, RelatorioDescritivoPI, RelatorioDescritivoMU } from "../types/TiposPatentes";
import { FileText, Plus, Trash2, AlertTriangle, Info } from "lucide-react";

interface StepRelatorioProps {
    modalidade: ModalidadePatente;
    relatorio: RelatorioDescritivoPI | RelatorioDescritivoMU;
    onChangeRelatorio: (relatorioAtualizado: any) => void;
}

export const StepRelatorio: React.FC<StepRelatorioProps> = ({
    modalidade,
    relatorio,
    onChangeRelatorio
}) => {
    const isMU = modalidade === "MU";
    const isSoftware = modalidade === "CII_SOFTWARE";

    const handleCampoChange = (campo: string, valor: any) => {
        onChangeRelatorio({
            ...relatorio,
            [campo]: valor
        });
    };

    const handleParagrafoChange = (index: number, valor: string) => {
        const novosParagrafos = [...(relatorio.paragrafos_descricao || [])];
        novosParagrafos[index] = valor;
        handleCampoChange("paragrafos_descricao", novosParagrafos);
    };

    const handleAdicionarParagrafo = () => {
        const novosParagrafos = [...(relatorio.paragrafos_descricao || []), ""];
        handleCampoChange("paragrafos_descricao", novosParagrafos);
    };

    const handleRemoverParagrafo = (index: number) => {
        const novosParagrafos = (relatorio.paragrafos_descricao || []).filter((_, i) => i !== index);
        handleCampoChange("paragrafos_descricao", novosParagrafos);
    };

    return (
        <div className="step-card">
            <div className="step-card-header">
                <h2 className="step-card-title">
                    <FileText size={22} color="var(--color-primary)" />
                    2. Relatório Descritivo {isMU ? "(Modelo de Utilidade)" : "(Patente de Invenção)"}
                </h2>
                <p className="step-card-desc">
                    {isMU
                        ? "O relatório descritivo de MU deve ressaltar a nova disposição construtiva ou forma plástica introduzida no objeto e sua melhoria funcional (Art. 9º da LPI)."
                        : "O relatório descritivo deve descrever clara e suficientemente a invenção (Art. 24 da LPI), permitindo que um técnico no assunto possa reproduzi-la."}
                </p>
            </div>

            {/* SEÇÃO ESPECÍFICA PARA MODELO DE UTILIDADE (MU) */}
            {isMU ? (
                <>
                    {/* Título do Modelo de Utilidade */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="titulo_mu">
                            <span>Título do Modelo de Utilidade</span>
                            <span className="form-label-hint">Ex: DISPOSIÇÃO CONSTRUTIVA EM... (mín. 5 caracteres)</span>
                        </label>
                        <input
                            id="titulo_mu"
                            type="text"
                            className="form-input"
                            placeholder="Ex: DISPOSIÇÃO CONSTRUTIVA INTRODUZIDA EM SUPORTE ARTICULADO"
                            value={relatorio.titulo || ""}
                            onChange={(e) => handleCampoChange("titulo", e.target.value)}
                        />
                    </div>

                    {/* Campo do Modelo de Utilidade */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="campo_mu">
                            <span>Campo do Modelo de Utilidade</span>
                            <span className="form-label-hint">Setor técnico ou ramo de aplicação prática do objeto</span>
                        </label>
                        <textarea
                            id="campo_mu"
                            className="form-textarea"
                            placeholder="O presente modelo de utilidade refere-se ao campo de suportes e mecanismos articulados, mais especificamente a uma nova disposição introduzida em..."
                            value={
                                (relatorio as RelatorioDescritivoMU).campo_modelo_de_utilidade ||
                                (relatorio as RelatorioDescritivoMU).campo_do_modelo ||
                                ""
                            }
                            onChange={(e) => {
                                onChangeRelatorio({
                                    ...relatorio,
                                    campo_modelo_de_utilidade: e.target.value,
                                    campo_do_modelo: e.target.value
                                });
                            }}
                        />
                    </div>

                    {/* Breve Descrição dos Desenhos */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="breve_descricao_desenhos">
                            <span>Breve Descrição dos Desenhos</span>
                            <span className="form-label-hint">Relação resumida das figuras que ilustram a disposição construtiva</span>
                        </label>
                        <textarea
                            id="breve_descricao_desenhos"
                            className="form-textarea"
                            style={{ minHeight: "100px" }}
                            placeholder="A Figura 1 ilustra uma vista em perspectiva isométrica do suporte; a Figura 2 representa uma vista explodida destacando o pino guia; a Figura 3 ilustra o suporte em posição de uso..."
                            value={(relatorio as RelatorioDescritivoMU).breve_descricao_desenhos || ""}
                            onChange={(e) => handleCampoChange("breve_descricao_desenhos", e.target.value)}
                        />
                    </div>

                    {/* Descrição do Modelo de Utilidade */}
                    <div className="form-group">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label className="form-label">
                                <span>Descrição do Modelo de Utilidade (Parágrafos)</span>
                                <span className="form-label-hint">Detalhamento dos componentes, encaixes, acoplamentos e formato</span>
                            </label>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={handleAdicionarParagrafo}
                            >
                                <Plus size={14} /> Adicionar Parágrafo
                            </button>
                        </div>

                        {(!relatorio.paragrafos_descricao || relatorio.paragrafos_descricao.length === 0) ? (
                            <div className="info-alert">
                                Nenhum parágrafo adicionado. Clique no botão acima para adicionar a descrição do modelo.
                            </div>
                        ) : (
                            relatorio.paragrafos_descricao.map((paragrafo, idx) => (
                                <div key={idx} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                                    <span style={{ fontWeight: 600, color: "var(--color-text-muted)", marginTop: "0.75rem", fontSize: "0.85rem", width: "25px" }}>
                                        §{idx + 1}
                                    </span>
                                    <textarea
                                        className="form-textarea"
                                        style={{ minHeight: "80px", flex: 1 }}
                                        placeholder={`Descreva a estrutura, peças e operação do modelo (Parágrafo ${idx + 1})...`}
                                        value={paragrafo}
                                        onChange={(e) => handleParagrafoChange(idx, e.target.value)}
                                    />
                                    {relatorio.paragrafos_descricao!.length > 1 && (
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleRemoverParagrafo(idx)}
                                            title="Remover parágrafo"
                                            style={{ marginTop: "0.5rem" }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Exemplos de Concretizações do Modelo de Utilidade */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="exemplos_mu">
                            <span>Exemplos de Concretizações do Modelo de Utilidade</span>
                            <span className="form-label-hint">Exemplo de montagem ou realização física preferencial do objeto</span>
                        </label>
                        <textarea
                            id="exemplos_mu"
                            className="form-textarea"
                            placeholder="Em uma concretização preferencial do modelo, o corpo é injetado em polímero termoplástico de alta resistência..."
                            value={
                                (relatorio as RelatorioDescritivoMU).exemplos_concretizacao_MU ||
                                (relatorio as RelatorioDescritivoMU).exemplos_concretizacao ||
                                ""
                            }
                            onChange={(e) => {
                                onChangeRelatorio({
                                    ...relatorio,
                                    exemplos_concretizacao_MU: e.target.value,
                                    exemplos_concretizacao: e.target.value
                                });
                            }}
                        />
                    </div>
                </>
            ) : (
                /* SEÇÃO PARA PATENTE DE INVENÇÃO (PI) E SOFTWARE (CII) */
                <>
                    {/* Título da Invenção */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="titulo_pi">
                            <span>Título da Invenção</span>
                            <span className="form-label-hint">Letras maiúsculas, claro e conciso (mín. 5 caracteres)</span>
                        </label>
                        <input
                            id="titulo_pi"
                            type="text"
                            className="form-input"
                            placeholder="Ex: SISTEMA E MÉTODO DE MONITORAMENTO REMOTO DE DISPOSITIVOS"
                            value={relatorio.titulo || ""}
                            onChange={(e) => handleCampoChange("titulo", e.target.value)}
                        />
                    </div>

                    {/* Campo da Invenção */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="campo_pi">
                            <span>Campo da Invenção</span>
                            <span className="form-label-hint">Setor técnico da invenção (ex: telecomunicações, eletrônica, biotecnologia)</span>
                        </label>
                        <textarea
                            id="campo_pi"
                            className="form-textarea"
                            placeholder="A presente invenção refere-se a sistemas embarcados de baixa potência voltados para..."
                            value={(relatorio as RelatorioDescritivoPI).campo_da_invencao || ""}
                            onChange={(e) => handleCampoChange("campo_da_invencao", e.target.value)}
                        />
                    </div>

                    {/* Estado da Técnica */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="estado_tecnica">
                            <span>Estado da Técnica (Problema Existente)</span>
                            <span className="form-label-hint">Descreva o que já existe no mercado e suas deficiências ou limitações</span>
                        </label>
                        <textarea
                            id="estado_tecnica"
                            className="form-textarea"
                            placeholder="Atualmente, os dispositivos conhecidos no estado da técnica apresentam a desvantagem de elevado consumo de bateria..."
                            value={relatorio.estado_da_tecnica || ""}
                            onChange={(e) => handleCampoChange("estado_da_tecnica", e.target.value)}
                        />
                    </div>

                    {/* Problema Solucionado e Vantagens da Invenção */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="problema_vantagens">
                            <span>Problema Solucionado e Vantagens da Invenção</span>
                            <span className="form-label-hint">Como a sua invenção soluciona o problema anterior e seus diferenciais</span>
                        </label>
                        <textarea
                            id="problema_vantagens"
                            className="form-textarea"
                            placeholder="A presente invenção soluciona o problema através da aplicação de algoritmo em borda, reduzindo a transmissão em 80%..."
                            value={(relatorio as RelatorioDescritivoPI).problema_e_vantagens || ""}
                            onChange={(e) => handleCampoChange("problema_e_vantagens", e.target.value)}
                        />
                    </div>

                    {/* Campos Específicos de Software / CII */}
                    {isSoftware && (
                        <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "10px", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b21a8", fontWeight: 700 }}>
                                <AlertTriangle size={18} />
                                <span>Requisitos Obrigatórios para Software (Resolução INPI nº 158/2016)</span>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="efeito_tecnico">
                                    <span>Efeito Técnico Alcançado</span>
                                    <span className="form-label-hint">Obrigatório: Demonstre o efeito físico/técnico mensurável (fora do código puro)</span>
                                </label>
                                <textarea
                                    id="efeito_tecnico"
                                    className="form-textarea"
                                    placeholder="O método produz uma redução efetiva do tempo de latência de renderização através do escalonamento preditivo de threads no hardware gráfico..."
                                    value={(relatorio as any).efeito_tecnico_alcancado || ""}
                                    onChange={(e) => handleCampoChange("efeito_tecnico_alcancado", e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="arquitetura_execucao">
                                    <span>Arquitetura de Execução / Hardware</span>
                                    <span className="form-label-hint">Sensores, microprocessadores, servidores ou ecossistema onde o algoritmo atua</span>
                                </label>
                                <input
                                    id="arquitetura_execucao"
                                    type="text"
                                    className="form-input"
                                    placeholder="Ex: Cluster de servidores em nuvem integrado a módulos sensores IoT via protocolo MQTT"
                                    value={(relatorio as any).arquitetura_execucao || ""}
                                    onChange={(e) => handleCampoChange("arquitetura_execucao", e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Parágrafos da Descrição Detalhada */}
                    <div className="form-group">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label className="form-label">
                                <span>Descrição Detalhada da Invenção (Parágrafos)</span>
                                <span className="form-label-hint">Explicação passo a passo de como a tecnologia é construída e opera</span>
                            </label>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={handleAdicionarParagrafo}
                            >
                                <Plus size={14} /> Adicionar Parágrafo
                            </button>
                        </div>

                        {(!relatorio.paragrafos_descricao || relatorio.paragrafos_descricao.length === 0) ? (
                            <div className="info-alert">
                                Nenhum parágrafo adicionado. Clique no botão acima para incluir parágrafos de detalhamento.
                            </div>
                        ) : (
                            relatorio.paragrafos_descricao.map((paragrafo, idx) => (
                                <div key={idx} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                                    <span style={{ fontWeight: 600, color: "var(--color-text-muted)", marginTop: "0.75rem", fontSize: "0.85rem", width: "25px" }}>
                                        §{idx + 1}
                                    </span>
                                    <textarea
                                        className="form-textarea"
                                        style={{ minHeight: "80px", flex: 1 }}
                                        placeholder={`Descreva o funcionamento ou detalhe de concretização (Parágrafo ${idx + 1})...`}
                                        value={paragrafo}
                                        onChange={(e) => handleParagrafoChange(idx, e.target.value)}
                                    />
                                    {relatorio.paragrafos_descricao!.length > 1 && (
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleRemoverParagrafo(idx)}
                                            title="Remover parágrafo"
                                            style={{ marginTop: "0.5rem" }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Exemplos de Concretização */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="exemplos">
                            <span>Exemplos de Concretizações da Invenção</span>
                            <span className="form-label-hint">Protótipo testado, casos de uso práticos ou testes laboratoriais</span>
                        </label>
                        <textarea
                            id="exemplos"
                            className="form-textarea"
                            placeholder="Em uma concretização preferencial desenvolvida em bancada, utilizou-se um transceptor operando a 2.4 GHz conectado..."
                            value={(relatorio as RelatorioDescritivoPI).exemplos_concretizacao || ""}
                            onChange={(e) => handleCampoChange("exemplos_concretizacao", e.target.value)}
                        />
                    </div>
                </>
            )}

            <div className="info-alert" style={{ marginTop: "0.5rem" }}>
                <Info size={18} style={{ flexShrink: 0 }} />
                <div>
                    <strong>Instrução Normativa INPI:</strong> {isMU
                        ? "Para Modelo de Utilidade, foque nos detalhes construtivos do objeto (dimensões relativas, encaixes, disposições de peças) que tornam o uso mais prático ou eficiente."
                        : "Para Patente de Invenção, descreva com clareza o problema técnico, a solução inventiva e os passos reprodutíveis da tecnologia."}
                </div>
            </div>
        </div>
    );
};
