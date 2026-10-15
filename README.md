# Patente_web — Sistema de Estruturação de Minutas de Patentes (Padrão INPI)

O **Patente_web** é uma aplicação web desenvolvida para automatizar a elaboração e formatação de pedidos de patentes acadêmicas e laboratoriais seguindo rigorosamente as normas formais do **INPI** (Instrução Normativa PR nº 30/2013, Portaria nº 14/2024 e Resolução nº 158/2016).

A ferramenta recebe os dados técnicos estruturados da invenção, valida regras normativas automaticamente (como a formatação de reivindicações com *"caracterizado por"* e limites de palavras do resumo) e gera um pacote `.zip` contendo os **4 documentos oficiais do pedido**:
1. `01_Relatorio_Descritivo.docx`
2. `02_Quadro_Reivindicatorio.docx`
3. `03_Desenhos.docx`
4. `04_Resumo.docx`

---

## Arquitetura:

Decisões arquiteturais estão explicadas e justificadas em \docs\adr

---

## Estrutura do Repositório

```text
Patente_web/
├── backend/
│   ├── app/
│   │   ├── db/
│   │   │   └── metadata_logger.py   # Auditoria de metadados (Zero-Knowledge)
│   │   ├── models/
│   │   │   └── patent_schemas.py    # Validação Pydantic v2 (PI, MU e CII_SOFTWARE)
│   │   ├── routers/
│   │   │   └── patent_router.py     # Endpoints REST de exportação
│   │   ├── services/
│   │   │   ├── docx_generator.py    # Motor docxtpl em RAM + LibreOffice Headless
│   │   │   └── formatadores.py      # Utilitários de cabeçalho e formatação
│   │   └── main.py                  # Ponto de entrada FastAPI e CORS
│   ├── templates/
│   │   ├── templates_mu/            # Modelos Word (.docx) para Modelo de Utilidade
│   │   └── templates_pi/            # Modelos Word (.docx) para Patente de Invenção
│   └── requirements.txt             # Dependências Python do backend
├── docs/
│   └── adr/                         # Registros de Decisão de Arquitetura (ADRs)
├── frontend/                        # Interface Web (React + TypeScript)
└── .gitignore


Como Configurar e Rodar o Backend
1. Clonar o repositório e acessar a pasta do backend

git clone [https://github.com/Johnthefive/Patente_web.git]
cd Patente_web/backend

2. Criar e ativar o Ambiente Virtual (venv)
No Linux / macOS:

# Cria o ambiente virtual
python3 -m venv .venv

# Ativa o ambiente virtual
source .venv/bin/activate

No Windows (PowerShell):
# Cria o ambiente virtual
python -m venv .venv

# Ativa o ambiente virtual
.\.venv\Scripts\Activate.ps1



3. Instalar as dependências e iniciar o servidor

# Instala as bibliotecas necessárias
pip install -r requirements.txt

# Inicia o servidor FastAPI em modo de desenvolvimento (hot-reload)
uvicorn app.main:app --reload