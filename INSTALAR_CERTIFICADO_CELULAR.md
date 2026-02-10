# 📱 Como Instalar Certificado no Celular para Câmera Funcionar

## Problema

O celular está dando `ERR_SSL_PROTOCOL_ERROR` porque não confia no certificado autoassinado do Caddy.

## ✅ Solução: Instalar Certificado no Celular

### Passo 1: Copiar o Certificado do Servidor

No **servidor** (computador onde o Caddy está rodando):

1. O Caddy já gerou o certificado em:
   ```
   C:\Users\eduardo.vieira\AppData\Roaming\Caddy\pki\authorities\local\root.crt
   ```

2. **Copie esse arquivo** para um lugar fácil de acessar, por exemplo:
   - Envie por email para você mesmo
   - Ou copie para um pendrive
   - Ou use um serviço de compartilhamento (Google Drive, etc)

### Passo 2: Instalar no Celular Android

1. **Abra o arquivo `root.crt` no celular** (pode abrir pelo email, Drive, etc)

2. O Android vai perguntar: **"Instalar certificado?"**
   - Dê um **nome** (ex: "Caddy Local" ou "Servidor Patrimônio")
   - Escolha **"Certificado CA"** (não "Certificado de usuário")

3. **Confirme a instalação** (pode pedir senha/PIN do celular)

4. **Pronto!** Agora o celular confia no certificado.

### Passo 3: Testar no Celular

1. **Feche completamente o navegador** (não só a aba, feche o app)

2. **Abra o navegador novamente**

3. Acesse: `https://192.168.0.250:8443`

4. Agora **NÃO deve mais dar erro SSL** ✅

5. Faça login → Inventário → QR → **Câmera deve funcionar!** 📷

---

## 🔄 Se Ainda Não Funcionar

Se mesmo após instalar o certificado ainda der erro:

1. **Limpe o cache do navegador** no celular:
   - Chrome: Configurações → Privacidade → Limpar dados de navegação
   - Marque "Imagens e arquivos em cache"
   - Limpar

2. **Tente outro navegador** temporariamente:
   - Firefox Android
   - Edge Android

3. **Verifique se o Caddy está rodando**:
   - No servidor, veja se há um terminal PowerShell com o Caddy rodando
   - Se não estiver, rode: `cd C:\caddy; .\caddy_windows_amd64.exe run`

---

## 📋 Resumo Rápido

1. Copie `root.crt` do servidor para o celular
2. Abra o arquivo no celular
3. Instale como "Certificado CA"
4. Feche e reabra o navegador
5. Acesse `https://192.168.0.250:8443`
6. ✅ Funciona!
