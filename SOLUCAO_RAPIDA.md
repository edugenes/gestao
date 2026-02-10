# Solução Rápida - "Failed to fetch" no App Android

## ✅ Checklist Rápido (5 minutos)

Execute nesta ordem:

### 1. Backend está rodando?
```powershell
netstat -ano | findstr ":3001" | findstr "LISTENING"
```
**Se não aparecer nada:** Inicie o backend:
```powershell
cd C:\Users\eduardo.vieira\Documents\Ventrys\gestao\backend
npm run start:dev
```

### 2. Backend está acessível na rede?
```powershell
cd C:\Users\eduardo.vieira\Documents\Ventrys\gestao
.\testar-backend.ps1 -IP 192.168.0.250 -PORTA 3001
```
**Todos os testes devem passar.** Se algum falhar, resolva primeiro.

### 3. App foi reconstruído com as últimas alterações?

**IMPORTANTE:** Se você fez alterações no código, precisa rebuild:

```powershell
cd C:\Users\eduardo.vieira\Documents\Ventrys\gestao\asset-guardian

# 1. Build do frontend
npm run build

# 2. Sincronizar com Android
npx cap sync android

# 3. Abrir Android Studio e gerar APK de novo
# (ou usar: npx cap open android)
```

### 4. No celular - Configurar URL

1. Abra o app **Patrimonio**
2. Na tela de login, toque em **"Configurar servidor"**
3. Digite **exatamente**: `http://192.168.0.250:3001`
   - ✅ Com `http://`
   - ✅ Sem barra no final
   - ✅ Porta **3001** (não 8080, não 8443)
4. Toque em **"Salvar"**
5. Feche o diálogo (X)
6. Tente fazer login de novo

### 5. Verificar logs no app

Se ainda não funcionar, abra o **Chrome DevTools** no PC e conecte ao celular:

1. No celular: **Configurações → Opções do desenvolvedor → Depuração USB** (ativar)
2. Conecte o celular ao PC por USB
3. No PC: Abra Chrome e vá em `chrome://inspect`
4. Clique em "inspect" no dispositivo
5. Vá na aba **Console**
6. Tente fazer login no app
7. Veja os logs que começam com `🌐`, `✅`, `❌`

Os logs vão mostrar:
- Qual URL o app está tentando usar
- Se a requisição está sendo feita
- Qual erro específico está acontecendo

---

## 🔍 Diagnóstico Rápido

**Se o teste do backend passou mas o app ainda dá erro:**

1. **App não foi reconstruído?** → Faça rebuild (passo 3 acima)
2. **URL errada no app?** → Verifique no passo 4
3. **Celular em outra rede?** → Ambos (PC e celular) devem estar no **mesmo Wi‑Fi**
4. **Firewall bloqueando?** → Execute como Admin:
   ```powershell
   .\liberar-firewall-3001.ps1
   ```

---

## 💡 Dica Final

Se **TUDO** acima foi feito e ainda não funciona:

1. **Desative temporariamente o firewall do Windows** e teste
2. Se funcionar → problema é firewall (configure regra permanente)
3. Se não funcionar → problema é rede ou app (verifique logs no Chrome DevTools)

---

## 📞 Informações para Debug

Quando pedir ajuda, informe:

1. ✅ Backend está rodando? (resultado do `netstat`)
2. ✅ Teste do backend passou? (resultado do `testar-backend.ps1`)
3. ✅ App foi reconstruído após últimas alterações?
4. ✅ URL configurada no app é exatamente `http://192.168.0.250:3001`?
5. ✅ Celular e PC estão no mesmo Wi‑Fi?
6. ✅ Logs do Chrome DevTools mostram o quê?

Com essas informações, dá para identificar exatamente onde está o problema! 🎯
