# ✅ Cloudflare Tunnel - Configuração Automática

## 🎯 O que foi feito automaticamente

- ✅ **Cloudflare Tunnel baixado** em `C:\cloudflared`
- ✅ **Scripts de automação criados:**
  - `setup-completo.ps1` - Configuração completa automática
  - `configurar-e-iniciar.ps1` - Apenas iniciar túnel (se já configurado)
- ✅ **Guia completo criado** em `CLOUDFLARE_SETUP_AUTOMATICO.md`

---

## 📋 O que você precisa fazer AGORA

### **1. Executar o script de configuração**

Abra o PowerShell e execute:

```powershell
cd C:\cloudflared
powershell -ExecutionPolicy Bypass -File .\setup-completo.ps1
```

**O que vai acontecer:**

1. O script vai verificar se você já fez login
2. **Se não**, vai abrir o navegador automaticamente
3. **Faça login no Cloudflare** (ou crie conta grátis se não tiver)
4. **Autorize o Cloudflare Tunnel** quando pedir
5. O script vai criar o túnel automaticamente
6. Vai verificar se o frontend está rodando
7. Vai iniciar o túnel e mostrar a URL pública

---

### **2. Quando aparecer a URL do Cloudflare**

Você vai ver algo assim:

```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at:                                         |
|  https://abc123-def456-ghi789.trycloudflare.com                                          |
+--------------------------------------------------------------------------------------------+
```

**COPIE ESSA URL!** (ex: `https://abc123-def456-ghi789.trycloudflare.com`)

---

### **3. Atualizar o Frontend**

Edite o arquivo: `gestao\asset-guardian\.env`

Substitua a linha:

```env
VITE_API_URL=https://c73b1b357698.ngrok-free.app
```

Por:

```env
VITE_API_URL=https://SUA_URL_CLOUDFLARE_AQUI
```

(Substitua `SUA_URL_CLOUDFLARE_AQUI` pela URL que você copiou)

---

### **4. Reiniciar o Frontend**

Se o frontend estiver rodando:

1. Pressione `Ctrl+C` para parar
2. Execute novamente: `npm run dev`

Se não estiver rodando:

```powershell
cd C:\Users\eduardo.vieira\Documents\Ventrys\gestao\asset-guardian
npm run dev
```

---

### **5. Testar no Celular**

No celular, acesse a URL do Cloudflare Tunnel:

```
https://abc123-def456-ghi789.trycloudflare.com
```

**Deve funcionar imediatamente!** ✅
- Sem avisos de certificado
- Sem página de bloqueio
- Câmera funciona!

---

## 🔄 Manter Túnel Rodando

O túnel precisa ficar rodando enquanto você usa o sistema.

**Para rodar em background (janela separada):**

```powershell
cd C:\cloudflared
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\cloudflared; .\cloudflared.exe tunnel --url http://localhost:8080 run patrimonio-tunnel"
```

Isso abre uma janela separada que fica rodando o túnel.

---

## ✅ Vantagens do Cloudflare Tunnel

- ✅ **100% Grátis** (sem limites)
- ✅ **HTTPS válido** (câmera funciona)
- ✅ **Sem configuração nos celulares** (funciona para todos os 30 usuários)
- ✅ **URL fixa** (não muda como ngrok)
- ✅ **Sem página de aviso** (diferente do ngrok free)

---

## 📖 Documentação Completa

Veja o guia detalhado: `CLOUDFLARE_SETUP_AUTOMATICO.md`

---

## 🆘 Precisa de Ajuda?

Se tiver problemas:

1. Verifique se o frontend está rodando: `netstat -ano | findstr ":8080"`
2. Verifique se o túnel está rodando: `Get-Process cloudflared`
3. Veja os logs do túnel na janela onde está rodando

---

**Pronto para configurar! Execute o script e siga as instruções.** 🚀
