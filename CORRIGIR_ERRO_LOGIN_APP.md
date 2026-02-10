# Corrigir erros de login no app Android

## Erro: "Failed to fetch"

O app mostra **"Failed to fetch"** ao tentar fazer login. Isso significa que o app não consegue conectar ao backend.

**O que foi ajustado no código:**

- O tratamento de erro agora captura exceções de rede **antes mesmo de receber resposta** (CORS, timeout, DNS, firewall).
- A mensagem de erro agora inclui a URL que o app está tentando usar e orientações sobre firewall.

**Teste rápido no PC:**

Execute o script de teste para verificar se o backend está acessível:

```powershell
cd C:\Users\eduardo.vieira\Documents\Ventrys\gestao
.\testar-backend.ps1 -IP 192.168.0.250 -PORTA 3001
```

Se todos os testes passarem (ping, porta TCP, HTTP GET, POST), o backend está OK e o problema está na configuração do app.

---

## Erro: "Cannot read properties of undefined (reading 'accessToken')"

O app conecta ao servidor, mas a **resposta do login não traz o token** como esperado. Causas comuns:

- **URL errada:** o app está apontando para um proxy, página HTML ou outro serviço que não é o backend (ex.: porta 8080 do frontend em vez de 3001 do backend).
- **Backend retornando HTML ou corpo vazio:** algum intermediário (proxy, firewall) responde com página de erro em vez do JSON da API.

**O que foi ajustado no código:**

- Se a resposta do servidor não for JSON, o app agora exibe uma mensagem clara em vez de quebrar.
- Na tela de login, se o servidor não retornar `accessToken`, o app mostra: *"Resposta inválida do servidor: token não retornado. Verifique se a URL do servidor está correta e se o backend está rodando."*

**O que fazer:**

1. Na tela de login, toque em **"Configurar servidor"** e confirme que a URL é **exatamente** `http://IP_DO_PC:3001` (porta **3001**, não 8080 nem 8443).
2. Teste o endpoint com **POST** (veja a seção abaixo "Testar login pelo PC").
3. Rebuild do app com as alterações acima e teste de novo.

---

## "Cannot GET /auth/login" (404) ao abrir no navegador

Se você abrir **no navegador** a URL `http://192.168.0.250:3001/auth/login`, verá **404** e a mensagem **"Cannot GET /auth/login"**. Isso é **normal**.

- O navegador, ao abrir uma URL, faz uma requisição **GET**.
- O endpoint de login aceita **apenas POST** (com e-mail e senha no corpo).
- Por isso GET retorna 404. O backend está correto; o login no app usa POST.

Para testar se o backend responde ao login, use POST (PowerShell ou cliente REST), não apenas abrir a URL no navegador. Veja **"Testar login pelo PC"** abaixo.

---

## Testar login pelo PC

Para confirmar que o backend na porta 3001 está respondendo ao login corretamente, no **PowerShell** (substitua `IP_DO_PC` e use um e-mail/senha válidos):

```powershell
$body = '{"email":"seu@email.com","password":"suasenha"}'
Invoke-RestMethod -Uri "http://192.168.0.250:3001/auth/login" -Method POST -Body $body -ContentType "application/json"
```

Se estiver ok, a resposta virá em JSON com `accessToken`, `refreshToken` e `expiresIn`. Se der erro de rede, verifique firewall e URL.

---

## O que foi ajustado no código

- **Backend:** CORS passou a aceitar requisições **sem origin** (app Android).
- **App:** Antes do login, o app **limpa o cache** e usa de novo a URL salva em "Configurar servidor".
- **Recomendação:** Reinicie o backend após atualizar o código e gere um novo APK.

---

## Solução

### 1. Verificar se o backend está rodando

No PC servidor, verifique:

```powershell
netstat -ano | findstr ":3001" | findstr "LISTENING"
```

Se não aparecer nada, inicie o backend:

```powershell
cd C:\Users\eduardo.vieira\Documents\Ventrys\gestao\backend
npm run start:dev
```

---

### 2. Descobrir o IP correto do servidor

No PC servidor:

```powershell
cd C:\Users\eduardo.vieira\Documents\Ventrys\gestao
.\descobrir-ip.ps1
```

Anote o IP que aparecer (ex.: `192.168.0.250`).

---

### 3. Configurar a URL no app

**No celular:**

1. Abra o app **Patrimonio**.
2. Na tela de login, toque em **"Configurar servidor"** (botão abaixo de "Entrar").
3. Digite **exatamente** a URL do servidor: `http://IP_DO_PC:3001`  
   Exemplo: `http://192.168.0.250:3001`  
   (sem barra no final, com **http://**)
4. Toque em **"Salvar"**.
5. Feche o diálogo (X).
6. **Toque em "Entrar"** e informe login/senha de novo.

---

### 4. Verificar se celular e PC estão na mesma rede

- O celular deve estar no **mesmo Wi‑Fi** do PC.
- Se o PC estiver no cabo (Ethernet) e o celular no Wi‑Fi, ambos devem estar conectados ao **mesmo roteador**.

---

### 5. Se ainda não funcionar

**No PC servidor:**

1. **Desative temporariamente o firewall** do Windows e teste de novo.
2. Ou libere a porta 3001:
   ```powershell
   cd C:\Users\eduardo.vieira\Documents\Ventrys\gestao
   .\liberar-firewall-3001.ps1
   ```
   (Execute como Administrador: botão direito no PowerShell → "Executar como administrador")

**No celular:**

- Verifique se o Wi‑Fi está realmente conectado.
- Tente reiniciar o Wi‑Fi do celular.
- Reinicie o app (force stop e abra de novo).

---

## Resumo

1. ✅ Backend rodando na porta 3001
2. ✅ IP do servidor descoberto (`.\descobrir-ip.ps1`)
3. ✅ URL configurada no app: `http://IP:3001`
4. ✅ Celular e PC na mesma rede Wi‑Fi
5. ✅ Firewall liberado (ou desativado temporariamente)

Se seguir esses passos, o login deve funcionar! 🎯
