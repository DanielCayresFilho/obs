# 🔐 Checklist de Segurança - Sistema ISOBS

## ⚠️ AÇÕES OBRIGATÓRIAS ANTES DO DEPLOY

### 1. Variáveis de Ambiente Sensíveis

#### ❌ NUNCA commitar no Git:
```bash
# Verificar se .env está no .gitignore
git check-ignore .env  # Deve retornar: .env

# Remover .env do histórico se já foi commitado
git rm --cached .env
git commit -m "Remove .env from repository"
```

#### ✅ Gerar novos secrets em produção:

**JWT_SECRET** (obrigatório trocar):
```bash
# Gerar novo secret
openssl rand -base64 64

# Ou
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

**DATABASE_URL** (senha forte):
```bash
# Usar senha complexa
# Mínimo: 16 caracteres, letras maiúsculas, minúsculas, números e símbolos
DATABASE_URL=postgresql://postgres:SuaS3nh4C0mpl3x4!@db:5432/obs_db
```

---

### 2. Credenciais Padrão

#### ⚠️ Usuário Inicial:
```
Username: joycecayres
Password: <@22.SeNh4Massaçç
```

**AÇÕES OBRIGATÓRIAS:**
1. ✅ Fazer login com credenciais padrão
2. ✅ Ir em configurações/perfil
3. ✅ **ALTERAR SENHA IMEDIATAMENTE**
4. ✅ Usar senha forte (12+ caracteres)
5. ✅ Ativar autenticação de 2 fatores (se disponível)

---

### 3. Backblaze B2 (Armazenamento)

#### ⚠️ Credenciais expostas no código:
```env
# TROCAR ANTES DO DEPLOY!
B2_APPLICATION_KEY_ID=0058bb947550d8d0000000001
B2_APPLICATION_KEY=K005E/Z0Mg5vIAqhAXrZIkrqg3FEmXE
```

**AÇÕES:**
1. ✅ Criar nova Application Key no Backblaze
2. ✅ Configurar permissões restritas (apenas o bucket necessário)
3. ✅ Revogar keys antigas
4. ✅ Atualizar .env com novas credenciais

**Permissões recomendadas:**
- Read and Write (não usar All)
- Específico para bucket `obscurablock`
- Tempo de expiração configurado

---

### 4. Banco de Dados PostgreSQL

#### ⚠️ Senha padrão insegura:
```env
POSTGRES_PASSWORD=postgres  # NUNCA usar em produção!
```

**AÇÕES:**
1. ✅ Gerar senha forte para PostgreSQL
2. ✅ Atualizar DATABASE_URL
3. ✅ Configurar backup automático
4. ✅ Restringir acesso (firewall)

**Comandos:**
```bash
# Gerar senha forte
openssl rand -base64 32

# Atualizar no .env
DATABASE_URL=postgresql://postgres:NOVA_SENHA_AQUI@db:5432/obs_db
```

---

### 5. CORS (Cross-Origin Resource Sharing)

#### ⚠️ Configuração atual:
```env
ALLOWED_ORIGINS=https://obscuratattoo.com,https://www.obscuratattoo.com
```

**AÇÕES:**
1. ✅ Verificar se domínios estão corretos
2. ✅ NUNCA usar `*` (wildcard) em produção
3. ✅ Testar CORS após deploy

---

### 6. Firewall e Rede

```bash
# UFW (Ubuntu)
sudo ufw status

# Portas permitidas:
# - 22/tcp  (SSH - APENAS para IPs confiáveis)
# - 80/tcp  (HTTP - redirecionar para HTTPS)
# - 443/tcp (HTTPS)

# Bloquear acesso direto às portas do Docker
sudo ufw deny 3000/tcp  # Backend
sudo ufw deny 5432/tcp  # PostgreSQL
sudo ufw deny 5173/tcp  # Frontend
```

**Usar Nginx como proxy reverso!**

---

### 7. SSL/TLS Certificates

```bash
# Verificar certificado
sudo certbot certificates

# Renovação automática configurada?
sudo systemctl status certbot.timer

# Testar renovação
sudo certbot renew --dry-run
```

**Ratings de segurança:**
- [ ] SSL Labs: A+ rating
- [ ] HSTS configurado
- [ ] TLS 1.2+ apenas

---

### 8. Docker Security

```bash
# Não rodar containers como root
# Verificar Dockerfile:
USER node  # ou outro usuário não-root

# Limitar recursos
docker-compose.yml:
  services:
    backend:
      deploy:
        resources:
          limits:
            cpus: '1'
            memory: 512M
```

---

### 9. Logs e Monitoramento

```bash
# Configurar rotação de logs
sudo nano /etc/logrotate.d/docker-containers

# Configurar alertas
# - Uso de CPU > 80%
# - Uso de memória > 80%
# - Disco > 90%
# - Tentativas de login falhas
```

---

### 10. Backup

```bash
# Backup automático diário
crontab -e
0 3 * * * /root/backup-db.sh

# Testar restauração
docker exec obs-postgres psql -U postgres obs_db < backup.sql

# Backup off-site (Backblaze B2, AWS S3, etc.)
```

---

## 🚨 VULNERABILIDADES CONHECIDAS

### 1. **LocalStorage para JWT** (Frontend)
**Risco**: Vulnerável a XSS
**Severidade**: MÉDIA

**Mitigação temporária:**
- Sanitizar todos os inputs
- CSP (Content Security Policy) configurado

**Solução ideal:**
```javascript
// Migrar para httpOnly cookies
res.cookie('token', jwt, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});
```

### 2. **Sem Rate Limiting**
**Risco**: Força bruta em login
**Severidade**: ALTA

**Solução:**
```nginx
# Nginx
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

location /auth/login {
    limit_req zone=login burst=2 nodelay;
}
```

### 3. **Sem Validação de Tamanho de Upload**
**Risco**: DoS via upload de arquivos grandes
**Severidade**: MÉDIA

**Solução:**
```typescript
// NestJS
@Post('upload')
@UseInterceptors(FileInterceptor('file', {
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}))
```

---

## ✅ CHECKLIST FINAL PRÉ-DEPLOY

### Variáveis de Ambiente
- [ ] JWT_SECRET alterado
- [ ] DATABASE_URL com senha forte
- [ ] B2_APPLICATION_KEY rotacionado
- [ ] ALLOWED_ORIGINS configurado
- [ ] .env adicionado ao .gitignore
- [ ] .env.example sem dados sensíveis

### Banco de Dados
- [ ] Senha do PostgreSQL alterada
- [ ] Backup automático configurado
- [ ] Testado restauração de backup
- [ ] Acesso restrito (não exposto)

### Usuários
- [ ] Senha padrão alterada
- [ ] Email de recuperação configurado
- [ ] 2FA habilitado (se disponível)

### Rede
- [ ] Firewall configurado
- [ ] Portas desnecessárias bloqueadas
- [ ] SSL/TLS configurado
- [ ] CORS restrito

### Aplicação
- [ ] NODE_ENV=production
- [ ] Logs configurados
- [ ] Monitoramento ativo
- [ ] Rate limiting implementado
- [ ] HTTPS forçado

### Docker
- [ ] Containers não rodam como root
- [ ] Recursos limitados
- [ ] Health checks configurados
- [ ] Restart policy: always

---

## 🔍 AUDITORIA DE SEGURANÇA

### Ferramentas Recomendadas:

```bash
# 1. Scan de vulnerabilidades NPM
npm audit
npm audit fix

# 2. Scan de containers Docker
docker scan obs-backend

# 3. Teste de segurança SSL
curl https://www.ssllabs.com/ssltest/analyze.html?d=obscuratattoo.com

# 4. Teste de headers de segurança
curl -I https://obscuratattoo.com
```

### Headers de Segurança (Nginx):
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self'" always;
```

---

## 📞 EM CASO DE INCIDENTE

### Vazamento de Credenciais:
1. **Revogar imediatamente** todas as credenciais
2. Gerar novas credenciais
3. Atualizar .env
4. Restart dos serviços
5. Revisar logs de acesso
6. Notificar usuários (se necessário)

### Acesso não autorizado:
1. Bloquear IP suspeito (firewall)
2. Revisar logs de acesso
3. Forçar logout de todos usuários
4. Resetar senhas
5. Investigar escopo do acesso

---

**🛡️ Segurança é um processo contínuo, não um evento único!**

*Revisar este checklist mensalmente*
*Última atualização: 19/10/2025*
