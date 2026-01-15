# ============================================
# Dockerfile para Backend - Produção (Coolify)
# ============================================

FROM node:20-alpine

# Instalar dependências necessárias para o bcrypt
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copiar arquivos de dependências primeiro (cache layer)
COPY package*.json ./

# Instalar TODAS as dependências (incluindo devDependencies para build)
RUN npm install

# Copiar código fonte
COPY . .

# Gerar cliente Prisma
RUN npx prisma generate

# Build da aplicação NestJS
RUN npm run build

# Remover devDependencies após build para imagem menor
RUN npm prune --production

# Expor porta
EXPOSE 3000

# Variáveis de ambiente padrão (Coolify vai sobrescrever)
ENV NODE_ENV=production
ENV PORT=3000

# Comando para iniciar em produção
CMD ["npm", "run", "start:prod"]
