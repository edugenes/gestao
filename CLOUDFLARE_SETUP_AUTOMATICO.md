# 🚀 Cloudflare Tunnel - Setup Automático

## ✅ O que foi feito

- ✅ Cloudflare Tunnel instalado em `C:\cloudflared`
- ✅ Scripts de automação criados
- ✅ Pronto para configurar

---

## 📋 Como Usar (Passo a Passo)

### **Opção 1: Setup Completo Automático** (Recomendado)

Execute no PowerShell:

```powershell
cd C:\cloudflared
powershell -ExecutionPolicy Bypass -File .\setup-completo.ps1
```

**O que vai acontecer:**

1. ✅ Verifica se você já fez login
2. ✅ Se não, abre o navegador para você fazer login no Cloudflare
3. ✅ Cria o túnel automaticamente
4. ✅ Verifica se o frontend está rodando
5. ✅ Inicia o túnel e mostra a URL pública

**Quando aparecer a URL (ex: `https://abc123.trycloudflare.com`):**

1. **Copie a URL**
2. **Edite:** `gestao\asset-guardian\.env`
3. **Coloque:** `VITE_API_URL=https://SUA_URL_AQUI`
4. **Reinicie o frontend** (Ctrl+C e `npm run dev`)

---

### **Opção 2: Apenas Iniciar Túnel** (Se já configurou antes)

Execute no PowerShell:

```powershell
cd C:\cloudflared
powershell -ExecutionPolicy Bypass -File .\configurar-e-iniciar.ps1
```

Isso apenas inicia o túnel (assumindo que login e túnel já estão criados).

---

## 🔄 Manter Túnel Rodando em Background

Para rodar o túnel em uma janela separada:

```powershell
cd C:\cloudflared
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\cloudflared; .\cloudflared.exe tunnel --url http://localhost:8080 run patrimonio-tunnel"
```

---

## 📝 Checklist

- [ ] Executei `setup-completo.ps1`
- [ ] Fiz login no Cloudflare (no navegador)
- [ ] Túnel foi criado
- [ ] Frontend está rodando (`npm run dev`)
- [ ] Túnel está rodando e mostrando URL
- [ ] Copiei a URL do Cloudflare Tunnel
- [ ] Atualizei `gestao\asset-guardian\.env` com a URL
- [ ] Reiniciei o frontend
- [ ] Testei no celular - funcionou! ✅

---

## 🆘 Problemas?

**"login failed"**
- Execute: `.\cloudflared.exe tunnel login` novamente

**"tunnel not found"**
- Execute: `.\cloudflared.exe tunnel create patrimonio-tunnel`

**"connection refused"**
- Certifique-se de que o frontend está rodando: `netstat -ano | findstr ":8080"`

---

## ✅ Pronto!

Depois de configurar, todos os 30 usuários podem acessar pelo celular sem problemas! 🎉
