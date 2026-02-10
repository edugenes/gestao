# 🚀 Configurar ngrok para HTTPS (Solução Rápida)

O ngrok cria um túnel HTTPS público que funciona imediatamente, sem precisar instalar certificados no celular.

## ✅ Vantagens

- ✅ HTTPS válido (funciona imediatamente)
- ✅ Câmera vai funcionar no celular
- ✅ Sem configuração de certificado
- ✅ Gratuito para testes

## ⚠️ Desvantagens

- ⚠️ URL pública (qualquer um com o link pode acessar)
- ⚠️ URL muda toda vez que reiniciar (versão grátis)
- ⚠️ Limite de conexões na versão grátis

---

## 📋 Passo a Passo

### **Passo 1: Criar Conta no ngrok (Grátis)**

1. Acesse: **https://dashboard.ngrok.com/signup**
2. Crie uma conta grátis (pode usar email qualquer)
3. Faça login na dashboard
4. Vá em **"Getting Started"** ou **"Your Authtoken"**
5. **Copie seu authtoken** (algo como: `2abc123def456ghi789jkl012mno345pqr678stu`)

---

### **Passo 2: Configurar ngrok no Servidor**

No PowerShell do servidor, execute:

```powershell
cd C:\ngrok
powershell -ExecutionPolicy Bypass -File .\configurar-ngrok.ps1
```

Quando pedir, **cole o authtoken** que você copiou.

---

### **Passo 3: Iniciar o Túnel**

```powershell
cd C:\ngrok
.\ngrok.exe http 8080
```

Você vai ver algo assim:

```
Forwarding   https://abc123-def456.ngrok-free.app -> http://localhost:8080
```

**Copie a URL HTTPS** (ex: `https://abc123-def456.ngrok-free.app`)

---

### **Passo 4: Configurar Frontend**

Edite o arquivo `gestao/asset-guardian/.env`:

```env
VITE_API_URL=https://abc123-def456.ngrok-free.app
```

(Substitua pela sua URL do ngrok)

---

### **Passo 5: Reiniciar Frontend**

```powershell
cd C:\Users\eduardo.vieira\Documents\Ventrys\gestao\asset-guardian
npm run dev
```

---

### **Passo 6: Acessar no Celular**

No celular, acesse a **URL do ngrok**:

```
https://abc123-def456.ngrok-free.app
```

**Pronto!** ✅ A câmera deve funcionar agora!

---

## 🔄 Manter ngrok Rodando

O ngrok precisa ficar rodando enquanto você usa o sistema. Se fechar o terminal, o túnel para.

**Para rodar em background:**

```powershell
cd C:\ngrok
Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\ngrok.exe http 8080"
```

Isso abre uma nova janela do PowerShell que fica rodando o ngrok.

---

## 📝 Notas

- A URL do ngrok muda toda vez que você reinicia (versão grátis)
- Se a URL mudar, atualize o `.env` do frontend
- A versão paga do ngrok permite URL fixa (domínio personalizado)

---

## 🆘 Problemas?

**"authentication failed"**
- Verifique se o authtoken está correto
- Execute: `.\ngrok.exe config add-authtoken SEU_TOKEN`

**"port 8080 already in use"**
- Verifique se o frontend está rodando na porta 8080
- Ou use outra porta: `.\ngrok.exe http 3000` (se frontend estiver em 3000)

**"tunnel not found"**
- Certifique-se de que o ngrok está rodando
- Verifique se a URL está correta no `.env`
