# 🔄 Solução Alternativa: HTTP Local + HTTPS Apenas para Câmera

Se instalar o certificado no Android estiver muito complicado, temos uma alternativa:

## 💡 Ideia

- **HTTP** para uso normal na rede local (sem certificado)
- **HTTPS** apenas quando necessário para a câmera (via ngrok ou outro serviço)

## ⚠️ Limitação

A câmera do celular **só funciona com HTTPS** (secure context). Então precisamos de HTTPS de alguma forma.

## ✅ Opções

### **Opção 1: ngrok (Mais Simples)**

1. Criar conta grátis em: https://dashboard.ngrok.com/signup
2. Pegar authtoken
3. Configurar ngrok apontando para porta 8080
4. Usar a URL HTTPS do ngrok apenas quando precisar da câmera

**Vantagem**: HTTPS válido, funciona imediatamente  
**Desvantagem**: URL muda a cada reinício (mas podemos usar domínio fixo na versão paga)

### **Opção 2: Zerotier (Rede VPN Privada)**

1. Instalar Zerotier no servidor e no celular
2. Criar rede privada
3. Acessar via IP da rede Zerotier (pode usar HTTP ou HTTPS)

**Vantagem**: Rede privada, mais seguro  
**Desvantagem**: Precisa instalar app no celular

### **Opção 3: Continuar com Caddy + Certificado**

Se conseguir instalar o certificado seguindo o guia `INSTALAR_CERTIFICADO_ANDROID.md`, é a solução mais permanente.

---

## 🎯 Recomendação

**Tente primeiro instalar o certificado** seguindo o guia passo a passo. Se não funcionar, podemos configurar o ngrok rapidamente.

Qual você prefere tentar?
