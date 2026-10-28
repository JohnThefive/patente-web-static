# ADR 004: Blindagem de Segurança em Memória RAM e Conteinerização (Docker & Compose)

* **Status:** Aceito
* **Data:** Outubro de 2026

## Contexto e Problema
A geração das minutas oficiais do INPI opera sob o paradigma *Zero-Storage* com buffers efêmeros `io.BytesIO` na memória RAM. No entanto, por lidar com segredos industriais inéditos e informações confidenciais de inventores, uma auditoria de segurança e modelagem de ameaças identificou vulnerabilidades que precisavam de mitigação na camada de aplicação:

1. **Injeção de XML e Corrupção de .DOCX:** A biblioteca `docxtpl` por padrão não escapava caracteres XML (`<`, `>`, `&`), permitindo que caracteres matemáticos ou tags maliciosas quebrassem a estrutura do Word.
2. **Exaustão de Memória (DoS / OOM):** Ausência de limites de tamanho em imagens Base64 e listas de figuras/reivindicações, possibilitando ataques de negação de serviço ao sobrecarregar a RAM.
3. **Executáveis Disfarçados:** Risco de envio de binários maliciosos ou scripts disfarçados em Base64 no lugar de imagens reais.
4. **Fuga de Dados para Disco na Conversão PDF:** O LibreOffice Headless utilizava `/tmp` temporário padrão do sistema operacional, que em muitos servidores é mapeado em disco físico SSD (não em RAM).
5. **Vazamento de Estrutura em Erros 500:** Exceções não tratadas podiam expor caminhos internos de diretórios do servidor.
6. **Dependência de Ambiente Host:** A instalação manual de Python 3.12, Node.js e LibreOffice no sistema operacional hospedeiro dificultava a replicação do ambiente em produção e na nuvem.

---

## Decisões Arquiteturais

### 1. Blindagem de Segurança da Aplicação (Hardening em RAM)
* **Escape Obrigatório de XML:** Todas as renderizações do `docxtpl` foram configuradas com `doc.render(contexto, autoescape=True)`.
* **Validação de Magic Bytes e Limites Anti-DoS:** No schema Pydantic `DesenhoItem`, as imagens Base64 são inspecionadas em nível binário, aceitando exclusivamente assinaturas autênticas de PNG (`\x89PNG\r\n\x1a\n`) ou JPEG (`\xff\xd8\xff`). Foram impostos tetos de ~5 MB por figura, no máximo 20 figuras e 50 reivindicações por pacote.
* **Isolamento de Conversão em RAM (`/dev/shm`):** A conversão de PDF via LibreOffice foi redirecionada para a partição `tmpfs` em memória RAM (`/dev/shm`), com perfil isolado (`-env:UserInstallation`) e destruição imediata (`unlink`) de cada arquivo temporário no bloco `finally`.
* **Descarte Explícito de Buffers:** Dicionários de bytes em memória RAM são explicitamente limpos com `.clear()` logo após a escrita no ZIP, e os buffers são fechados.
* **Sanitização de Erros e Headers de Segurança:** As respostas HTTP 500 devolvem mensagens genéricas (sem expor `str(exc)` ou caminhos internos) e o header `X-Content-Type-Options: nosniff` foi incluído.

### 2. Conteinerização Portátil com Docker e Docker Compose
* **Backend (`backend/Dockerfile`):** Base `python:3.12-slim-bookworm` contendo o `libreoffice-writer-nogui`, fontes padrão de renderização (`fonts-dejavu-core`, `fonts-liberation`), execução sob usuário não-root (`appuser`) e healthcheck embutido.
* **Frontend (`frontend/Dockerfile`):** Arquitetura multi-stage:
  - *Estágio 1 (Builder):* `node:22-alpine` para instalar dependências e compilar o bundle estático otimizado com Vite.
  - *Estágio 2 (Runner):* `nginx:alpine` (~25 MB) para servir os arquivos estáticos e gerenciar conexões.
* **Nginx Otimizado (`frontend/nginx.conf`):** Configurado com roteamento SPA (`try_files $uri $uri/ /index.html;`), compressão Gzip, cache imutável de assets e proxy reverso transparente de `/api/` para o container do backend.
* **Orquestração (`docker-compose.yml`):** Integra frontend e backend com mapeamento de portas (`5173:80` e `8000:8000`), sincronização por healthcheck e alocação de partição em RAM dedicada (`tmpfs: /dev/shm:size=512M`) dentro do container.

---

## Consequências

* **Positivas:**
  - Imunidade contra injeção de XML, corrupção de minutas Word e upload de arquivos falsificados.
  - Proteção contra ataques de negação de serviço por estouro de memória (OOM).
  - Garantia de que nenhum fragmento de documento de patente permanece gravado em disco rígido durante as conversões.
  - Portabilidade total: o sistema sobe em qualquer servidor Linux, nuvem ou computador com um único comando (`docker compose up --build`), sem exigir instalação de LibreOffice, Python ou Node.js no host.
* **Negativas / Mitigações:**
  - Para desenvolvimento diário de telas, a execução direta nativa (`npm run dev` e `uvicorn`) continua recomendada para usufruir do Hot Module Reload (HMR) instantâneo; o Docker Compose fica reservado para testes de integração e deploy em produção.
