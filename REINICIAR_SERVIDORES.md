# 🔄 Como Reiniciar os Servidores

## ⚠️ Problema: ERR_CONNECTION_REFUSED

Se você está vendo `ERR_CONNECTION_REFUSED` ao tentar fazer login de outro computador, siga estes passos:

## 📋 Passo a Passo

### 1. Parar os Servidores Atuais

**No terminal onde os servidores estão rodando:**
- Pressione `Ctrl + C` para parar cada servidor
- Se não funcionar, feche os terminais

**Ou use PowerShell:**
```powershell
# Parar processos Node (cuidado: para TODOS os processos Node)
Get-Process node | Stop-Process -Force
```

### 2. Verificar o IP do Servidor

```powershell
.\descobrir-ip.ps1
```

Anote o IP principal (ex: `192.168.1.100`)

### 3. Iniciar o Backend

```powershell
cd backend
npm run start:dev
```

**Aguarde ver a mensagem:**
```
🚀 Backend rodando:
   Local:   http://localhost:3001
   Rede:    http://192.168.1.100:3001
```

### 4. Iniciar o Frontend (em outro terminal)

```powershell
cd asset-guardian
npm run dev
```

**Aguarde ver:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: http://192.168.1.100:8080/
```

### 5. Testar no Segundo Computador

1. Abra o navegador no segundo computador
2. Acesse: `http://IP_DO_SERVIDOR:8080`
   - Exemplo: `http://192.168.1.100:8080`
3. Abra o Console do Navegador (F12 → Console)
4. Você deve ver:
   ```
   🔗 API Base URL: http://192.168.1.100:3001
   📍 Hostname atual: 192.168.1.100
   🌐 URL completa: http://192.168.1.100:8080/
   ```
5. Tente fazer login

## 🐛 Se Ainda Não Funcionar

### Verificar no Console do Navegador

Abra o Console (F12) e verifique:
- A URL da API está correta? (deve ser `http://IP:3001`, não `localhost`)
- Há erros de CORS?
- O backend está realmente rodando?

### Verificar Firewall

O Windows Firewall pode estar bloqueando as portas:

```powershell
# Permitir porta 3001 (Backend)
New-NetFirewallRule -DisplayName "Backend Patrimonio" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow

# Permitir porta 8080 (Frontend)
New-NetFirewallRule -DisplayName "Frontend Patrimonio" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
```

### Verificar CORS no Backend

No arquivo `backend/.env`, certifique-se de que não está restringindo demais:

```env
CORS_ORIGIN=http://localhost:5173,http://localhost:8080
```

O backend já permite automaticamente IPs locais, mas se quiser ser explícito:

```env
CORS_ORIGIN=*
```

## ✅ Checklist

- [ ] Backend rodando e mostrando IPs da rede
- [ ] Frontend rodando e mostrando Network URL
- [ ] Console do navegador mostra URL correta da API
- [ ] Firewall permite conexões nas portas 3001 e 8080
- [ ] Ambos os computadores estão na mesma rede Wi-Fi/Ethernet
- [ ] Tentou limpar cache do navegador (Ctrl+Shift+Delete)

## 🚀 Script Automático

Você também pode usar o script automático:

```powershell
.\iniciar-servidores.ps1
```

Este script inicia ambos os servidores e mostra os logs em tempo real.
