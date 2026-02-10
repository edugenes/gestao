# 🔧 Troubleshooting CORS e Conexão

## ❌ Problema: Não vê logs no backend ao tentar fazer login

Se você não está vendo logs no backend quando tenta fazer login do segundo computador, siga estes passos:

## ✅ Checklist de Verificação

### 1. Backend está rodando?

**No terminal do backend, você deve ver:**
```
🚀 Backend rodando:
   Local:   http://localhost:3001
   Rede:    http://192.168.0.250:3001
```

**Se não está rodando:**
```powershell
cd gestao\backend
npm run start:dev
```

### 2. Backend está escutando na porta correta?

**Teste no próprio servidor:**
```powershell
# Abra outro terminal e teste:
curl http://localhost:3001/api/docs
# ou
Invoke-WebRequest http://localhost:3001/api/docs
```

**Se não funcionar**, o backend não está rodando corretamente.

### 3. Firewall está bloqueando?

**No servidor (onde o backend está rodando), execute:**

```powershell
# Verificar regras do firewall
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*3001*"}

# Permitir porta 3001
New-NetFirewallRule -DisplayName "Backend Patrimonio 3001" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow

# Permitir porta 8080 (frontend)
New-NetFirewallRule -DisplayName "Frontend Patrimonio 8080" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
```

### 4. Testar conexão do segundo computador

**No segundo computador, abra PowerShell e teste:**

```powershell
# Substitua 192.168.0.250 pelo IP do servidor
Invoke-WebRequest http://192.168.0.250:3001/api/docs

# Ou use curl se tiver instalado:
curl http://192.168.0.250:3001/api/docs
```

**Se der erro de conexão:**
- Firewall está bloqueando
- Backend não está rodando
- IP está errado

**Se funcionar:**
- O problema é apenas CORS no navegador

### 5. Verificar logs do backend

**Quando você tentar fazer login, o backend DEVE mostrar:**

```
📥 [timestamp] POST /auth/login
   Origin: http://192.168.0.250:8080
   Host: 192.168.0.250:3001

📡 Requisição CORS recebida:
   Origin: http://192.168.0.250:8080
   ✅ Permitido: IP local (192.168.x.x)
```

**Se não aparecer NADA:**
- As requisições não estão chegando ao backend
- Verifique firewall e rede

### 6. Verificar no navegador (F12)

**No segundo computador, abra F12 → Network:**

1. Tente fazer login
2. Procure pela requisição `POST /auth/login`
3. Clique nela e veja:
   - **Status:** Qual é o código? (200, 401, CORS error, etc)
   - **Request URL:** Está correto? (`http://192.168.0.250:3001/auth/login`)
   - **Request Headers:** Tem `Origin: http://192.168.0.250:8080`?
   - **Response Headers:** Tem `Access-Control-Allow-Origin`?

## 🚀 Solução Rápida: Permitir Tudo Temporariamente

**Se nada funcionar, permita tudo temporariamente para testar:**

No arquivo `backend/.env`:
```env
CORS_ORIGIN=*
```

**Reinicie o backend:**
```powershell
# Pare (Ctrl+C) e inicie novamente
cd gestao\backend
npm run start:dev
```

**Teste novamente.** Se funcionar com `*`, o problema é a detecção de IP local. Se não funcionar, é problema de rede/firewall.

## 📋 Informações para Debug

**Me envie estas informações:**

1. **IP do servidor:** `192.168.0.250` (ou qual?)
2. **Backend está rodando?** Sim/Não
3. **O que aparece quando você acessa `http://IP:3001/api/docs` no segundo computador?**
4. **O que aparece no console do backend quando você tenta fazer login?** (nada? algum log?)
5. **O que aparece no console do navegador (F12) quando tenta fazer login?**
