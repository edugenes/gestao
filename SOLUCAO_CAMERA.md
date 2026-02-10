# 📱 Solução para Câmera no Celular

## Problema Atual

O celular está dando `ERR_SSL_PROTOCOL_ERROR` ao acessar `https://192.168.0.250:8443`.

## ✅ Solução Rápida: Usar ngrok (Teste Temporário)

O **ngrok** cria um túnel HTTPS público que funciona imediatamente, sem precisar configurar certificados.

### Passo 1: Baixar ngrok

1. Acesse: https://ngrok.com/download
2. Baixe a versão Windows
3. Extraia o `ngrok.exe` em uma pasta (ex: `C:\ngrok`)

### Passo 2: Criar conta grátis (opcional mas recomendado)

1. Acesse: https://dashboard.ngrok.com/signup
2. Crie uma conta grátis
3. Copie seu **authtoken** da dashboard

### Passo 3: Configurar ngrok

No PowerShell (no servidor):

```powershell
cd C:\ngrok
.\ngrok.exe config add-authtoken SEU_TOKEN_AQUI
```

### Passo 4: Criar túnel para o frontend

```powershell
.\ngrok.exe http 8080
```

Isso vai mostrar algo como:

```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:8080
```

### Passo 5: Configurar frontend para usar ngrok

No arquivo `gestao/asset-guardian/.env`:

```env
VITE_API_URL=https://abc123.ngrok-free.app
```

(Substitua `abc123` pelo seu domínio do ngrok)

### Passo 6: Reiniciar frontend

```powershell
cd C:\Users\eduardo.vieira\Documents\Ventrys\gestao\asset-guardian
npm run dev
```

### Passo 7: Acessar no celular

No celular, acesse: `https://abc123.ngrok-free.app`

**Vantagens:**
- ✅ HTTPS funcionando imediatamente
- ✅ Câmera vai funcionar
- ✅ Sem configuração de certificado

**Desvantagens:**
- ⚠️ URL pública (qualquer um com o link pode acessar)
- ⚠️ URL muda toda vez que reiniciar (a menos que tenha conta paga)
- ⚠️ Limite de conexões na versão grátis

---

## 🔧 Solução Definitiva: Corrigir Caddy

Se quiser usar o Caddy (mais seguro para produção), precisamos:

1. **Gerar certificado autoassinado e instalar no celular**
2. **Ou usar um domínio local com certificado válido**

### Opção A: Instalar certificado no celular

1. No servidor, o Caddy já gerou o certificado em:
   `C:\Users\eduardo.vieira\AppData\Roaming\Caddy\pki\authorities\local\root.crt`

2. Copie esse arquivo para o celular

3. No celular Android:
   - Configurações → Segurança → Instalar certificado
   - Escolha "Certificado CA"
   - Selecione o arquivo `root.crt`
   - Dê um nome (ex: "Caddy Local")

4. Agora `https://192.168.0.250:8443` deve funcionar sem erro

### Opção B: Usar domínio local

1. Configure um domínio local (ex: `patrimonio.local`)
2. Use certificado válido ou autoassinado instalado no celular

---

## 🚀 Recomendação

**Para testar AGORA:** Use ngrok (5 minutos)

**Para produção:** Configure Caddy corretamente com certificado instalado no celular
