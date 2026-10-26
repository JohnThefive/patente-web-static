# Patente_web — Gerador de Minutas e Peças Formais do INPI

O **Patente_web** é uma aplicação web desenvolvida para automatizar a redação, validação e formatação de pedidos de patentes seguindo rigorosamente as diretrizes e instruções normativas do **INPI** (Instrução Normativa PR nº 30/2013, Portaria nº 14/2024 e Resolução nº 158/2016).

A ferramenta opera sob a arquitetura **Local-First com Geração Efêmera (Zero-Storage)**: os dados confidenciais da invenção permanecem salvos exclusivamente no navegador do pesquisador (IndexedDB). No momento da exportação, o backend valida as regras legais com Pydantic v2 e renderiza os documentos Word (.docx) e PDF diretamente na memória RAM, sem salvar nada em disco.

---

## 📸 Demonstração da Interface

<!-- Para adicionar screenshots, salve as imagens em docs/assets/ e aponte o caminho abaixo: -->
<!-- ![Demonstração do Wizard](docs/assets/screenshot-wizard.png) -->

---

## 📦 Documentos Oficiais Gerados no Pacote (.zip)

O sistema compila e entrega um pacote compactado contendo as 4 peças formais prontas para o e-Patentes:

1. `01_Relatorio_Descritivo.docx`: Relatório descritivo estruturado conforme a modalidade selecionada (PI ou MU).
2. `02_Quadro_Reivindicatorio.docx`: Reivindicações numeradas com expressão obrigatória *"caracterizado por"* e ponto final único.
3. `03_Desenhos.docx`: Figuras técnicas e ilustrações anexadas em alta resolução.
4. `04_Resumo.docx`: Resumo técnico formatado em parágrafo único (50 a 200 palavras).
*(Opcional: inclui também versões em `.pdf` convertidas via LibreOffice Headless)*.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
* **React 19** com **TypeScript**
* **Vite** (Build ultrarrápido)
* **IndexedDB (`idb-keyval`)** (Persistência Local-First com autosave e debouncing)
* **Lucide React** (Ícones da interface)
* **File-Saver** (Download nativo de arquivos binários e backups `.json`)

### Backend
* **Python 3.12** com **FastAPI**
* **Pydantic v2** (Validação estrita de tipos e regras legais do INPI)
* **python-docx-template (`docxtpl`)** (Injeção de templates em memória RAM via `io.BytesIO`)
* **LibreOffice Headless** (Conversão automatizada de `.docx` para `.pdf`)

---

## 🧭 O Wizard Dinâmico de 6 Etapas

### Fluxo A — Patentes (`PI`, `MU` e `CII_SOFTWARE`)
1. **Modalidade & Triagem:** Seleção guiada entre Patente de Invenção (PI), Modelo de Utilidade (MU) e Software (com triagem automática entre Registro e-RPC e Patente CII).
2. **Relatório Descritivo:** Formulários dinâmicos com seções exclusivas para cada modalidade (incluindo *Efeito Técnico Alcançado* e *Arquitetura de Execução* para CII conforme Resolução INPI nº 158/2016).
3. **Quadro Reivindicatório:** Gerenciador com suporte a reivindicações dependentes e independentes, reordenação automática e visualização do texto formatado.
4. **Desenhos Técnicos:** Upload e pré-visualização de imagens (PNG/JPEG) com breve descrição técnica.
5. **Resumo Formal:** Editor com contador de palavras em tempo real alertando o cumprimento da meta legal (50 a 200 palavras).
6. **Exportação:** Painel de revisão geral, checklist de pendências e botão de download do pacote `.zip`.

### Fluxo B — Registro de Programa de Computador (`RPC` / e-RPC — Lei nº 9.609/98 — 3 Passos Enxutos)
1. **Modalidade, Triagem & Dicas Jurídicas:** Triagem da natureza da obra (Software Puro vs. Inovação CII), guia prático sobre taxa atual (**R$ 210,00** na GRU Código 730), emissão automática da Declaração de Veracidade pela plataforma do governo (assinada via Gov.br), direitos morais/patrimoniais e proteção complementar de layout via Desenho Industrial (DI).
2. **Gerador e Validador de Resumo Hash SHA-512:** Cálculo criptográfico 100% local no navegador via *Web Crypto API* (sem envio do código-fonte ao servidor) e validação estrita de 128 caracteres hexadecimais com bloqueio de caracteres inválidos.
3. **Checklist de Registro no INPI:** Controle interativo de etapas (emissão e pagamento prévio da GRU de R$ 210,00, assinatura digital da Declaração de Veracidade pelo Gov.br, preenchimento no e-RPC e acompanhamento na Revista RPI), com bloqueio numérico para o número da GRU e painel rápido para copiar o Hash SHA-512.

---

## 🚀 Como Executar o Projeto Localmente

### 1. Clonar o Repositório

```bash
git clone https://github.com/Johnthefive/Patente_web.git
cd Patente_web
```

---

### 2. Configurar e Iniciar o Backend (FastAPI)

#### No Linux / macOS:
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

#### No Windows (PowerShell):
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

* API online em: `http://127.0.0.1:8000`
* Documentação interativa (Swagger): `http://127.0.0.1:8000/docs`

---

### 3. Configurar e Iniciar o Frontend (React + Vite)

Em um novo terminal:

```bash
cd frontend
npm install
npm run dev
```

![Texto alternativo da imagem](docs/assets/tela_inicial_patenweb.png)
---

## 🏛️ Decisões de Arquitetura (ADRs)

As decisões de engenharia e segurança estão documentadas na pasta [`docs/adr/`](docs/adr/):

* **[ADR 001](docs/adr/001-arquitetura-local-first-zero-storage.md):** Adoção de Arquitetura Local-First (IndexedDB) e Geração Efêmera (Zero-Storage).
* **[ADR 002](docs/adr/002-rotas-da-api.md):** Documentação das Rotas da API e especificações dos Payloads JSON.
* **[Guia e-RPC & Criptografia Hash](docs/guia-registro-software-e-hash.md):** Guia completo sobre o Registro de Software no INPI, processo legal, Web Crypto API e requisitos de segurança (RNF01 a RNF04).

---

## 📂 Estrutura de Diretórios

```text
Patente_web/
├── backend/
│   ├── app/
│   │   ├── db/
│   │   │   └── metadata_logger.py    # Auditoria anônima de metadados
│   │   ├── models/
│   │   │   └── patent_schemas.py     # Schemas Pydantic v2 (PI, MU e CII)
│   │   ├── routers/
│   │   │   └── patent_router.py      # Rotas REST de exportação do .zip
│   │   ├── services/
│   │   │   ├── docx_generator.py     # Motor docxtpl efêmero em RAM
│   │   │   └── formatadores.py       # Cabeçalhos e paginação Word
│   │   └── main.py                   # Ponto de entrada FastAPI e CORS
│   ├── templates/
│   │   ├── templates_mu/             # Templates Word (.docx) otimizados para MU
│   │   └── templates_pi/             # Templates Word (.docx) otimizados para PI
│   └── requirements.txt              # Dependências Python
├── frontend/
│   ├── src/
│   │   ├── features/patentes/
│   │   │   ├── components/           # Componentes dos 6 Steps e WizardStepper
│   │   │   └── types/                # Contratos TypeScript sincronizados com backend
│   │   ├── hooks/                    # usePatenteDraft (IndexedDB) e useDebounce
│   │   ├── services/                 # PatenteFastApi (fetch e download via file-saver)
│   │   ├── app.tsx                   # Orquestrador principal do Wizard
│   │   └── main.tsx                  # Ponto de entrada React
│   ├── package.json
│   └── vite.config.ts
└── docs/
    └── adr/                          # Registros de Decisão de Arquitetura
```