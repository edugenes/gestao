# 🔧 Corrigir Erro de Certificado no Chrome Mobile

## Problema

O Chrome no celular está mostrando:
> `NET::ERR_CERT_AUTHORITY_INVALID`
> "A sua ligação não é privada"

Isso acontece porque o Chrome bloqueou o certificado do ngrok por causa do HSTS.

---

## ✅ Solução 1: Limpar HSTS no Chrome (Mais Simples)

### **No Celular:**

1. **Abra o Chrome**

2. **Digite na barra de endereço:**
   ```
   chrome://net-internals/#hsts
   ```

3. **Role até a seção "Delete domain security policies"**

4. **Digite o domínio:**
   ```
   8bc65123b2b3.ngrok-free.app
   ```

5. **Clique em "Delete"**

6. **Feche completamente o Chrome** (force stop)

7. **Abra o Chrome novamente**

8. **Tente acessar a URL do ngrok novamente**

---

## ✅ Solução 2: Usar Firefox (Mais Fácil)

O Firefox geralmente aceita certificados do ngrok sem problemas:

1. **Instale Firefox** no celular (Play Store)

2. **Abra o Firefox**

3. **Acesse:** `https://8bc65123b2b3.ngrok-free.app`

4. **Se aparecer aviso de segurança:**
   - Clique em "Avançado"
   - Clique em "Aceitar o risco e continuar"

5. **Pronto!** ✅ A câmera deve funcionar!

---

## ✅ Solução 3: Usar Modo Anônimo

1. **Abra o Chrome**

2. **Toque nos três pontinhos** (menu)

3. **Selecione "Nova aba anônima"**

4. **Acesse:** `https://8bc65123b2b3.ngrok-free.app`

5. **Se aparecer aviso, clique em "Avançado" → "Prosseguir mesmo assim"**

---

## ✅ Solução 4: Limpar Cache do Chrome

1. **Configurações** → **Apps** → **Chrome**

2. **Armazenamento** → **Limpar dados**

3. Marque:
   - ✅ Cookies e dados de sites
   - ✅ Imagens e arquivos em cache
   - ✅ Dados de sites em cache

4. **Limpar dados**

5. **Feche completamente o Chrome**

6. **Abra novamente e tente acessar**

---

## 🎯 Recomendação

**Use o Firefox** - é a solução mais rápida e funciona melhor com ngrok!

1. Instale Firefox
2. Acesse a URL
3. Aceite o aviso se aparecer
4. Pronto! ✅

---

## 📋 Resumo

- ✅ **Mais fácil:** Use Firefox no celular
- ✅ **Mais rápido:** Limpe HSTS (`chrome://net-internals/#hsts`)
- ✅ **Alternativa:** Modo anônimo do Chrome

---

## 🆘 Ainda Não Funciona?

Se nenhuma solução funcionar, podemos tentar:

1. **Cloudflare Tunnel** (grátis, sem página de aviso)
2. **Voltar para Caddy** com certificado diferente
3. **Usar domínio fixo no ngrok** (versão paga)

Me avise qual solução funcionou!
