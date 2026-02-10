# 🚀 Configurar Cloudflare Tunnel (Solução Definitiva)

## ✅ Por que Cloudflare Tunnel?

- ✅ **100% Grátis** (sem limites)
- ✅ **HTTPS válido** (câmera funciona)
- ✅ **Sem configuração nos celulares** (funciona para todos)
- ✅ **URL fixa** (não muda)
- ✅ **Sem página de aviso** (como ngrok)

---

## 📋 Passo a Passo

### **Passo 1: Fazer Login no Cloudflare**

1. Abra o PowerShell como Administrador

2. Execute:
   ```powershell
   cd C:\cloudflared
   powershell -ExecutionPolicy Bypass -File .\configurar-tunnel.ps1
   ```

3. Isso vai abrir o navegador automaticamente

4. **Faça login no Cloudflare:**
   - Se não tem conta: crie uma grátis em https://dash.cloudflare.com/sign-up
   - Use qualquer email (não precisa de cartão de crédito)
   - Faça login

5. **Autorize o Cloudflare Tunnel** quando pedir

6. Volte ao PowerShell - deve mostrar "Login realizado com sucesso!"

---

### **Passo 2: Criar o Túnel**

1. Quando pedir o nome do túnel, digite:
   ```
   patrimonio-tunnel
   ```
   (ou pressione Enter para usar o padrão)

2. Aguarde a criação do túnel

3. Deve aparecer: "✅ Túnel criado com sucesso!"

---

### **Passo 3: Iniciar o Túnel**

**IMPORTANTE:** O frontend precisa estar rodando primeiro!

1. **Inicie o frontend** (se ainda não estiver):
   ```powershell
   cd C:\Users\eduardo.vieira\Documents\Ventrys\gestao\asset-guardian
   npm run dev
   ```

2. **Em outro terminal, inicie o túnel:**
   ```powershell
   cd C:\cloudflared
   powershell -ExecutionPolicy Bypass -File .\iniciar-tunnel.ps1
   ```

3. Você vai ver algo assim:
   ```
   +--------------------------------------------------------------------------------------------+
   |  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable): |
   |  https://abc123-def456-ghi789.trycloudflare.com                                            |
   +--------------------------------------------------------------------------------------------+
   ```

4. **Copie essa URL HTTPS!** (ex: `https://abc123-def456-ghi789.trycloudflare.com`)

---

### **Passo 4: Configurar Frontend**

1. Edite o arquivo `gestao/asset-guardian/.env`:

   ```env
   VITE_API_URL=https://SUA_URL_CLOUDFLARE_AQUI
   ```

   (Substitua pela URL que você copiou)

2. **Reinicie o frontend** (Ctrl+C e `npm run dev` novamente)

---

### **Passo 5: Testar no Celular**

1. No celular, acesse a URL do Cloudflare Tunnel:
   ```
   https://abc123-def456-ghi789.trycloudflare.com
   ```

2. **Deve funcionar imediatamente!** ✅
   - Sem avisos de certificado
   - Sem página de bloqueio
   - Câmera funciona!

---

## 🔄 Manter Túnel Rodando

O túnel precisa ficar rodando enquanto você usa o sistema.

**Para rodar em background:**

```powershell
cd C:\cloudflared
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\cloudflared; .\cloudflared.exe tunnel --url http://localhost:8080 run patrimonio-tunnel"
```

Isso abre uma janela separada que fica rodando o túnel.

---

## 📝 Notas Importantes

- ✅ A URL do Cloudflare Tunnel **não muda** (diferente do ngrok)
- ✅ Funciona para **todos os 30 usuários** automaticamente
- ✅ **Sem configuração nos celulares** - apenas acessar a URL
- ✅ O túnel precisa ficar rodando enquanto usar o sistema

---

## 🆘 Problemas?

**"tunnel not found"**
- Verifique se criou o túnel corretamente
- Execute: `.\cloudflared.exe tunnel list` para ver túneis disponíveis

**"connection refused"**
- Certifique-se de que o frontend está rodando na porta 8080
- Verifique: `netstat -ano | findstr ":8080"`

**"login failed"**
- Tente fazer login novamente: `.\cloudflared.exe tunnel login`

---

## ✅ Pronto!

Agora todos os 30 usuários podem acessar pelo celular sem problemas! 🎉
