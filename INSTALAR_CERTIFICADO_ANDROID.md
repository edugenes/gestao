# 📱 Como Instalar Certificado no Android (Passo a Passo)

## ⚠️ Importante: Android Bloqueia Certificados Autoassinados

O Android moderno (7+) bloqueia certificados CA autoassinados por segurança. Você precisa **habilitar manualmente** nas configurações.

---

## ✅ Passo a Passo Completo

### **Passo 1: Habilitar Instalação de Certificados**

**ANTES** de tentar instalar o certificado, você precisa habilitar esta opção:

1. Abra **Configurações** do Android
2. Vá em **Segurança** (ou **Biometria e segurança**)
3. Procure por **"Criptografia e credenciais"** ou **"Credenciais"**
4. Toque em **"Instalar certificados"** ou **"Certificados de segurança"**
5. Se aparecer **"Instalar de armazenamento"** ou **"Instalar certificado CA"**, toque nele
6. Se pedir senha/PIN, digite

**Se não encontrar essa opção**, tente:
- **Configurações** → **Segurança** → **Credenciais** → **Instalar de armazenamento**
- Ou: **Configurações** → **Sistema** → **Criptografia e credenciais** → **Instalar certificado CA**

---

### **Passo 2: Enviar Certificado para o Celular**

1. Na **Área de Trabalho** do servidor, há o arquivo **`root.crt`**
2. Envie para o celular:
   - **Email**: envie para você mesmo e abra no celular
   - **WhatsApp**: envie para você mesmo
   - **Google Drive/OneDrive**: faça upload e baixe no celular
   - **Pendrive**: copie e transfira

---

### **Passo 3: Instalar o Certificado**

1. **Abra o arquivo `root.crt` no celular**
   - Se estiver no email, toque no anexo
   - Se estiver no Drive, baixe e abra

2. O Android vai perguntar: **"Instalar certificado?"**

3. **Dê um nome** (ex: "Servidor Patrimônio" ou "Caddy Local")

4. **Escolha o tipo**: **"Certificado CA"** (não "Certificado de usuário")

5. **Confirme** (pode pedir senha/PIN/biometria)

6. Deve aparecer: **"Certificado instalado"** ✅

---

### **Passo 4: Testar**

1. **Feche completamente o navegador** (force stop)
   - Vá em **Configurações** → **Apps** → **Chrome** → **Forçar parada**

2. **Abra o navegador novamente**

3. Acesse: `https://192.168.0.250:8443`

4. **Agora NÃO deve mais dar erro SSL** ✅

5. Faça login → Inventário → QR → **Câmera deve funcionar!** 📷

---

## 🔄 Se Ainda Não Funcionar

### **Opção A: Tentar Outro Navegador**

Alguns navegadores são mais permissivos:

- **Firefox Android**: geralmente aceita certificados mais facilmente
- **Edge Android**: pode funcionar melhor que Chrome

### **Opção B: Verificar Versão do Android**

- **Android 6 e abaixo**: instalação mais simples
- **Android 7+**: precisa habilitar nas configurações primeiro (Passo 1)

### **Opção C: Usar HTTP Temporariamente**

Se nada funcionar, podemos configurar para usar **HTTP** na rede local e **HTTPS** apenas quando necessário. Mas isso pode não funcionar para a câmera.

---

## 📋 Checklist Rápido

- [ ] Habilitou "Instalar certificados" nas Configurações → Segurança?
- [ ] Enviou `root.crt` para o celular?
- [ ] Abriu o arquivo no celular?
- [ ] Escolheu "Certificado CA" (não "Certificado de usuário")?
- [ ] Confirmou a instalação?
- [ ] Fechou completamente o navegador?
- [ ] Testou `https://192.168.0.250:8443`?

---

## 🆘 Ainda com Problemas?

Se mesmo após seguir todos os passos ainda não funcionar:

1. **Qual versão do Android?** (Configurações → Sobre o telefone)
2. **Qual navegador está usando?** (Chrome, Firefox, Edge?)
3. **Qual mensagem de erro aparece exatamente?**

Me envie essas informações que vou ajudar a resolver!
