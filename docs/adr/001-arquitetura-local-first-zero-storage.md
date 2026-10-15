# ADR 001: Adoção de Arquitetura Local-First (IndexedDB) e Geração Efêmera (Zero-Storage)

* **Status:** Aceito
* **Data:** Outubro de 2026

## Contexto e Problema
Relatórios descritivos de patentes contêm segredos industriais e acadêmicos "inéditos". Antes do protocolo oficial no INPI, qualquer exposição ou vazamento de dados quebra o requisito legal de **Novidade Absoluta** (Lei nº 9.279/96). Armazenar rascunhos de patentes em um banco de dados centralizado cria um alvo pripritário para usuarios maliciosos e exige infraestrutura complexa de criptografia em repouso.

## Decisão Arquitetural
1. **Frontend Local-First (React + IndexedDB):** O rascunho da patente permanece armazenado exclusivamente no navegador do pesquisador durante a elaboração. Para evitar perda acidental (limpeza de cache), a interface oferece exportação e importação de rascunho em arquivo `.json`.
2. **Processamento Efêmero em Memória (FastAPI + `io.BytesIO`):** Os dados só trafegam para o servidor via túnel criptografado HTTPS (TLS 1.3) no momento exato da exportação. O backend valida as regras do INPI com Pydantic v2, renderiza o template `.docx` com `docxtpl` diretamente na memória RAM (`io.BytesIO`) e devolve o arquivo sem jamais gravar arquivos temporários em disco.
3. **Auditoria de Metadados (PostgreSQL/SQLite):** O banco de dados do servidor armazena apenas metadados administrativos (data/hora, versão do template e categoria da patente), sem registrar qualquer texto da invenção.

## Consequências
* **Positivas:** Risco zero de vazamento de propriedade intelectual por comprometimento do banco de dados; baixa latência de geração (< 100 ms)[ainda testar operações]; facilidade de expansão para patentes de software e jogos digitais via modelos polimórficos no Pydantic.
* **Negativas / Mitigação:** Se o usuário trocar de computador, o rascunho não sincroniza na nuvem automaticamente — mitigado pelo botão "Baixar Rascunho (.json)".