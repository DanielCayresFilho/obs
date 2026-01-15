# ============================================
# Dockerfile para Backend - Produção (Coolify)
# Single Stage Simplificado para Garantir Deploy
# ============================================

FROM node:20-alpine

# Instalar dependências necessárias para o bcrypt
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar TODAS as dependências
RUN npm install --legacy-peer-deps

# Copiar código fonte
COPY . .

# Gerar cliente Prisma
RUN npx prisma generate

# Build da aplicação NestJS
RUN npm run build

# Expor porta
EXPOSE 3000

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3000

# Comando para iniciar em produção
# Usamos node dist/main.js diretamente pois é mais leve que npm run start:prod
CMD ["node", "dist/main.js"]
