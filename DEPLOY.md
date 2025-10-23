# 🚀 Guia de Deploy - Sistema ISOBS (Obscura Tattoo Studio)

## 📋 Pré-requisitos

- Docker & Docker Compose instalados
- Servidor com Ubuntu 20.04+ (recomendado)
- Domínio configurado (ex: obscuratattoo.com)
- Certificado SSL (Let's Encrypt recomendado)

---

## 🔧 Configuração Inicial

### 1. Clone o repositório no servidor

```bash
git clone <seu-repositorio> /var/www/isobs
cd /var/www/isobs
```

### 2. Configure as variáveis de ambiente

#### Backend (.env)
```bash
cd obs-backend
cp .env.example .env
nano .env
```

**Variáveis CRÍTICAS para alterar:**
```env
# PRODUÇÃO - Altere isso!
DATABASE_URL=postgresql://postgres:SENHA_FORTE_AQUI@db:5432/obs_db?schema=public
JWT_SECRET=GERE_UM_TOKEN_SECRETO_FORTE_AQUI
NODE_ENV=production

# Backblaze B2 (suas credenciais)
B2_APPLICATION_KEY_ID=sua-key-id
B2_APPLICATION_KEY=sua-key
B2_BUCKET_NAME=seu-bucket

# CORS (seu domínio)
ALLOWED_ORIGINS=https://obscuratattoo.com,https://www.obscuratattoo.com
```

**Gerar JWT_SECRET seguro:**
```bash
openssl rand -base64 32
```

#### Frontend (.env)
```bash
cd ../obs-frontend
nano .env
```

```env
VITE_API_URL=https://api.obscuratattoo.com
```

### 3. Configure o Docker Compose para Produção

```bash
cd /var/www/isobs
nano docker-compose.yml
```

```yaml
version: '3.8'

services:
  db:
    image: postgres:16
    container_name: obs-postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}  # Use senha forte!
      POSTGRES_DB: obs_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - obs-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./obs-backend
    container_name: obs-backend
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - ./obs-backend/.env
    depends_on:
      db:
        condition: service_healthy
    networks:
      - obs-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./obs-frontend
    container_name: obs-frontend
    restart: always
    ports:
      - "5173:5173"
    networks:
      - obs-network

volumes:
  postgres_data:
    driver: local

networks:
  obs-network:
    driver: bridge
```

---

## 🚢 Deploy Passo a Passo

### 1. Build e Start dos Containers

```bash
# Build das imagens
docker-compose build

# Iniciar serviços
docker-compose up -d

# Verificar logs
docker-compose logs -f
```

### 2. Executar Migrations e Seed

```bash
# Rodar migrations
docker exec obs-backend npx prisma migrate deploy

# Criar usuário inicial (joycecayres)
docker exec obs-backend npx prisma db seed

# Verificar status
docker-compose ps
```

### 3. Configurar Nginx como Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/obscuratattoo.com
```

```nginx
# Frontend
server {
    listen 80;
    listen [::]:80;
    server_name obscuratattoo.com www.obscuratattoo.com;

    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name obscuratattoo.com www.obscuratattoo.com;

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/obscuratattoo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/obscuratattoo.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.obscuratattoo.com;

    ssl_certificate /etc/letsencrypt/live/obscuratattoo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/obscuratattoo.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # CORS (já configurado no backend, mas pode reforçar aqui)
        add_header Access-Control-Allow-Origin "https://obscuratattoo.com" always;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/obscuratattoo.com /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

### 4. Configurar SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d obscuratattoo.com -d www.obscuratattoo.com -d api.obscuratattoo.com

# Renovação automática (já configurado por padrão)
sudo certbot renew --dry-run
```

---

## 🔐 Segurança em Produção

### 1. Firewall (UFW)

```bash
# Permitir apenas portas necessárias
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### 2. Backup do Banco de Dados

```bash
# Script de backup (salvar como /root/backup-db.sh)
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker exec obs-postgres pg_dump -U postgres obs_db > /backup/obs_db_$TIMESTAMP.sql
# Manter apenas últimos 7 dias
find /backup -name "obs_db_*.sql" -mtime +7 -delete
```

```bash
# Tornar executável
chmod +x /root/backup-db.sh

# Agendar backup diário (cron)
crontab -e
# Adicionar:
0 3 * * * /root/backup-db.sh
```

### 3. Monitoramento (Opcional mas Recomendado)

```bash
# Instalar PM2 para monitorar containers
npm install -g pm2

# Health check script
pm2 start ecosystem.config.js
```

---

## 📊 Credenciais Padrão

**Após o seed:**
- **Usuário**: joycecayres
- **Senha**: <@22.SeNh4Massaçç
- **Email**: joyce@obscuratattoo.com

⚠️ **IMPORTANTE**: Alterar a senha após primeiro login!

---

## 🔄 Atualizações

```bash
# 1. Fazer backup
/root/backup-db.sh

# 2. Pull das atualizações
git pull origin main

# 3. Rebuild e restart
docker-compose down
docker-compose build
docker-compose up -d

# 4. Rodar migrations (se houver)
docker exec obs-backend npx prisma migrate deploy

# 5. Verificar logs
docker-compose logs -f
```

---

## 🐛 Troubleshooting

### Container não inicia
```bash
docker-compose logs backend
docker-compose logs db
```

### Erro de conexão com banco
```bash
# Verificar se o Postgres está rodando
docker exec obs-postgres pg_isready

# Verificar variáveis de ambiente
docker exec obs-backend env | grep DATABASE_URL
```

### Frontend não carrega
```bash
# Verificar configuração VITE_API_URL
# Verificar CORS no backend
# Verificar Nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## 📞 Suporte

Para dúvidas sobre o sistema:
1. Verificar logs: `docker-compose logs -f`
2. Verificar health: `docker-compose ps`
3. Revisar este guia

---

## ✅ Checklist Pré-Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] JWT_SECRET gerado (seguro)
- [ ] Senha do banco de dados forte
- [ ] Backblaze B2 configurado
- [ ] Domínio DNS apontando para servidor
- [ ] SSL configurado
- [ ] Firewall ativado
- [ ] Backup automático configurado
- [ ] Nginx configurado como proxy
- [ ] CORS configurado corretamente
- [ ] Testado em ambiente de staging

---

## 🎯 Performance Tips

1. **Redis** para cache (futuro)
2. **CDN** para assets estáticos
3. **PM2** para process management
4. **Nginx** gzip compression
5. **PostgreSQL** connection pooling

---

**Sistema pronto para produção! 🚀**

*Última atualização: 19/10/2025*
