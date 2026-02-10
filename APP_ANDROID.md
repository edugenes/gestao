# App Android (Patrimônio) – build e uso

O frontend pode ser usado como **app Android** (Capacitor). No app, a **câmera funciona em rede local** sem HTTPS nem certificado.

---

## Pré-requisitos

- **Node.js** (já usado no projeto)
- **Android Studio** (para gerar o APK ou rodar no emulador)
  - Download: https://developer.android.com/studio
- **JDK 17** (geralmente instalado com o Android Studio)

---

## Gerar o APK

### 1. Build do frontend e sync com o Android

No PowerShell, na pasta do frontend:

```powershell
cd C:\Users\eduardo.vieira\Documents\Ventrys\gestao\asset-guardian
npm run build
npx cap sync
```

### 2. Abrir o projeto no Android Studio

```powershell
npx cap open android
```

O Android Studio vai abrir com o projeto em `asset-guardian/android`.

### 3. Gerar o APK no Android Studio

1. Menu **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**.
2. Quando terminar, clique em **locate** no aviso que aparecer (ou o APK estará em `android/app/build/outputs/apk/debug/app-debug.apk`).
3. Copie o `app-debug.apk` para o celular (pendrive, e-mail, etc.) e instale.

---

## Uso no celular

1. **Instale o APK** no celular (pode ser preciso permitir “Instalar de fontes desconhecidas”).
2. **Backend e frontend** devem estar rodando no PC (backend na porta 3001).
3. Abra o app. Na tela de **login**, toque em **“Configurar servidor”** e informe a URL do backend, por exemplo:
   - `http://192.168.0.250:3001`  
   (troque pelo IP do seu PC na rede; use `.\descobrir-ip.ps1` no PC para ver o IP.)
4. Salve e faça **login** normalmente.
5. A **câmera** (inventário / QR) funciona no app sem precisar de HTTPS.

---

## Resumo dos comandos

| Comando              | O que faz                          |
|----------------------|------------------------------------|
| `npm run build`      | Gera a pasta `dist` do frontend    |
| `npx cap sync`       | Copia `dist` para o projeto Android |
| `npx cap open android` | Abre o projeto no Android Studio |
| `npm run android`    | Faz build + sync + abre no Android Studio |

---

## Observações

- O app usa **HTTP** para a API (rede local). Não é necessário Caddy nem certificado no celular.
- A URL do servidor fica salva no app; dá para alterar em **Configurações** ou na tela de login em **“Configurar servidor”**.
- Para publicar na Play Store é preciso gerar um **APK de release** assinado (Build → Generate Signed Bundle / APK no Android Studio).
