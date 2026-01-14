# ============================================
# Dockerfile para Frontend - Produção (Coolify)
# ============================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Argumento de build para API URL (configurar no Coolify)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar código fonte
COPY . .

# Fazer build (VITE_API_URL será injetado aqui)
RUN echo "Building with VITE_API_URL=${VITE_API_URL}" && npm run build

# Stage 2: Servir com nginx
FROM nginx:alpine

# Copiar arquivos buildados
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
