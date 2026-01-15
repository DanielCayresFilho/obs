# ============================================
# Dockerfile para Backend - Produção (Coolify)
# Multi-stage build para imagem otimizada
# ============================================

# Stage 1: Build
FROM node:20-alpine AS builder

# Instalar dependências necessárias para o bcrypt
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copiar arquivos de dependências primeiro (cache layer)
COPY package*.json ./

# Instalar TODAS as dependências (incluindo devDependencies para build)
RUN npm install --legacy-peer-deps

# Copiar código fonte
COPY . .

# Gerar cliente Prisma
RUN npx prisma generate

# Build da aplicação NestJS
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

# Instalar dependências necessárias para o bcrypt
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm install --omit=dev --legacy-peer-deps

# Copiar o build do stage anterior
COPY --from=builder /app/dist ./dist

# Copiar prisma schema e gerar cliente
COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate

# Copiar node_modules do prisma client se necessário
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expor porta
EXPOSE 3000

# Variáveis de ambiente padrão (Coolify vai sobrescrever)
ENV NODE_ENV=production
ENV PORT=3000

# Comando para iniciar em produção
CMD ["node", "dist/main.js"]
