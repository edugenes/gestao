# ⚡ Solução Rápida: ngrok (5 minutos)

Como o certificado não funcionou, vamos usar **ngrok** que cria HTTPS válido imediatamente.

## 🎯 Passo a Passo Rápido

### **1. Criar Conta no ngrok (2 minutos)**

1. Acesse: **https://dashboard.ngrok.com/signup**
2. Crie conta grátis (pode usar qualquer email)
3. Faça login
4. Vá em **"Your Authtoken"** ou **"Getting Started"**
5. **Copie o authtoken** (ex: `2abc123def456ghi789...`)

---

### **2. Configurar ngrok no Servidor (1 minuto)**

No PowerShell:

```powershell
cd C:\ngrok
.\ngrok.exe config add-authtoken SEU_TOKEN_AQUI
```

(Substitua `SEU_TOKEN_AQUI` pelo token que você copiou)

---

### **3. Iniciar ngrok (1 minuto)**

```powershell
cd C:\ngrok
.\iniciar-ngrok.ps1
```

Ou diretamente:

```powershell
.\ngrok.exe http 8080
```

Você vai ver:

```
Forwarding   https://abc123-def456.ngrok-free.app -> http://localhost:8080
```

**Copie essa URL HTTPS!** (ex: `https://abc123-def456.ngrok-free.app`)

---

### **4. Atualizar Frontend (1 minuto)**

Edite `gestao/asset-guardian/.env`:

```env
VITE_API_URL=https://abc123-def456.ngrok-free.app
```

(Substitua pela sua URL do ngrok)

---

### **5. Reiniciar Frontend**

```powershell
cd C:\Users\eduardo.vieira\Documents\Ventrys\gestao\asset-guardian
npm run dev
```

---

### **6. Acessar no Celular**

No celular, acesse:

```
https://abc123-def456.ngrok-free.app
```

**Pronto!** ✅ A câmera deve funcionar agora!

---

## ⚠️ Importante

- **Mantenha o ngrok rodando** enquanto usar o sistema
- Se fechar o terminal, o túnel para
- A URL muda toda vez que reiniciar (versão grátis)
- Se a URL mudar, atualize o `.env` do frontend

---

## 🔄 Para Rodar ngrok em Background

Abra uma nova janela do PowerShell e execute:

```powershell
cd C:\ngrok
Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\ngrok.exe http 8080"
```

Isso abre uma janela separada que fica rodando o ngrok.

---

## ✅ Pronto!

Agora você tem HTTPS válido e a câmera deve funcionar no celular!
