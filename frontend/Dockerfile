# ==============================================================================
# Dockerfile Frontend — Patente_web (React + Vite + Nginx Alpine Multi-stage)
# ==============================================================================

# Estágio 1: Build da aplicação React/Vite com Node.js
FROM node:22-alpine AS builder

WORKDIR /app

# Instala dependências aproveitando o cache de camadas do Docker
COPY package.json package-lock.json ./
RUN npm ci

# Copia o código-fonte e gera o build de produção
COPY . .

# Permite injetar a URL da API em tempo de build se necessário
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Estágio 2: Imagem leve de produção com Nginx Alpine (~25MB)
FROM nginx:alpine

# Remove configuração padrão do Nginx e adiciona a nossa otimizada
RUN rm -rf /etc/nginx/conf.d/*
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos compilados do estágio 1
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
