# 🔧 Solução para Erro do ngrok no Chrome

## Problema

O Chrome no celular está mostrando:
> "O site usa HSTS" e "credenciais incomuns e incorretas"

Isso acontece porque o ngrok free mostra uma página de aviso antes de permitir acesso, e o Chrome está bloqueando.

---

## ✅ Solução 1: Passar pela Página de Aviso Primeiro

### **No Servidor (PC):**

1. Acesse a URL do ngrok no navegador do servidor:
   ```
   https://8bc65123b2b3.ngrok-free.app
   ```

2. Vai aparecer uma página do ngrok dizendo:
   > "You are about to visit..."
   > "Visit Site" ou "Continue"

3. **Clique em "Visit Site"** ou **"Continue"**

4. Agora o site deve abrir normalmente

### **No Celular:**

1. **Feche completamente o Chrome** (force stop)
   - Configurações → Apps → Chrome → Forçar parada

2. **Abra o Chrome novamente**

3. Acesse: `https://8bc65123b2b3.ngrok-free.app`

4. Se aparecer a página de aviso do ngrok, **clique em "Visit Site"**

5. Agora deve funcionar! ✅

---

## ✅ Solução 2: Usar Outro Navegador no Celular

Alguns navegadores são mais permissivos que o Chrome:

### **Firefox Android:**

1. Instale Firefox no celular (Play Store)
2. Acesse a URL do ngrok
3. Quando aparecer a página de aviso, clique em "Visit Site"
4. Deve funcionar melhor que Chrome

### **Edge Android:**

1. Instale Edge no celular (Play Store)
2. Acesse a URL do ngrok
3. Quando aparecer a página de aviso, clique em "Visit Site"

---

## ✅ Solução 3: Limpar Cache do Chrome

Se ainda não funcionar:

1. No celular, abra Chrome
2. Configurações → Privacidade → Limpar dados de navegação
3. Marque:
   - ✅ Cookies e dados de sites
   - ✅ Imagens e arquivos em cache
   - ✅ Dados de sites em cache
4. Limpar dados
5. Feche completamente o Chrome
6. Abra novamente e tente acessar

---

## 🔄 Reiniciar ngrok

Se a URL mudou, atualize o `.env`:

```env
VITE_API_URL=https://NOVA_URL_NGROK
```

E reinicie o frontend.

---

## 📋 Resumo Rápido

1. ✅ Acesse a URL no navegador do servidor primeiro
2. ✅ Clique em "Visit Site" na página de aviso
3. ✅ Tente no celular novamente
4. ✅ Ou use Firefox/Edge no celular

---

## 🆘 Ainda Não Funciona?

Se nenhuma solução funcionar, podemos tentar:

1. **Configurar domínio fixo no ngrok** (requer conta paga)
2. **Voltar para Caddy** e tentar outra abordagem de certificado
3. **Usar outra solução** (ex: Cloudflare Tunnel, que é grátis e não tem página de aviso)

Me avise qual solução funcionou ou se precisa de ajuda!
