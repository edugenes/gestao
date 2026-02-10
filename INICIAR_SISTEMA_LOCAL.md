# Subir o sistema na rede local (com HTTPS e câmera)

Tudo roda na sua rede. Nada depende de internet.

---

## 1. Descobrir o IP do servidor

No PowerShell:

```powershell
.\descobrir-ip.ps1
```

Anote o IP (ex.: `192.168.0.250`).

---

## 2. Subir backend e frontend

**Terminal 1 – Backend:**

```powershell
cd backend
npm run start:dev
```

**Terminal 2 – Frontend:**

```powershell
cd asset-guardian
npm run dev
```

Deixe os dois abertos.

---

## 3. Subir o Caddy (HTTPS)

**Terminal 3:**

```powershell
cd C:\caddy
.\caddy_windows_amd64.exe run
```

Deixe aberto. O sistema fica em **HTTPS** na porta **8443**.

---

## 4. Acessar

- **No PC:** `https://SEU_IP:8443` (ex.: `https://192.168.0.250:8443`)
- **No celular:** mesma URL, **depois** de instalar o certificado (veja `CERTIFICADO_CELULAR.md`)

---

## 5. Celular (câmera)

Cada celular precisa instalar o certificado **uma vez**. Passo a passo em:

**`CERTIFICADO_CELULAR.md`**

---

## Se o IP do servidor mudar

1. Gerar de novo o certificado com o novo IP:
   ```powershell
   cd C:\caddy
   powershell -ExecutionPolicy Bypass -File .\gerar-ca-e-cert.ps1 192.168.X.X
   ```
2. Reiniciar o Caddy.
3. Distribuir de novo o `root.crt` (Área de Trabalho) para quem ainda não instalou ou reinstalar nos celulares.
