# Erro de rede ao acessar do celular

Se o celular mostra **erro de rede** (não conecta), mesmo com o certificado instalado, faça o seguinte:

---

## 1. Liberar a porta 8443 no Firewall (PC)

O Windows costuma bloquear conexões de outros aparelhos. Libere a porta **uma vez**:

1. Abra o **PowerShell como Administrador**:
   - Botão direito no menu Iniciar → **Windows PowerShell (Admin)**  
   - ou pesquise "PowerShell", botão direito → **Executar como administrador**

2. Vá até a pasta do projeto e execute:
   ```powershell
   cd C:\Users\eduardo.vieira\Documents\Ventrys\gestao
   .\liberar-firewall-8443.ps1
   ```

3. Se pedir para permitir execução de scripts, digite `S` e Enter.

4. Deve aparecer: **"Porta 8443 liberada no firewall"**.

---

## 2. Conferir o IP do servidor

No PowerShell (pode ser normal, não precisa ser admin):

```powershell
cd C:\Users\eduardo.vieira\Documents\Ventrys\gestao
.\descobrir-ip.ps1
```

Use o IP que aparecer na linha **HTTPS (celular/câmera)**. Exemplo: `https://192.168.0.250:8443`

---

## 3. Celular na mesma rede

- O celular deve estar no **mesmo Wi‑Fi** do PC (não use só dados móveis).
- Se o PC estiver no cabo (ethernet) e o celular no Wi‑Fi do **mesmo roteador**, costuma funcionar.

---

## 4. Testar de novo no celular

1. Abra o navegador.
2. Acesse: **https://IP_DO_PC:8443**  
   (o mesmo IP que apareceu no `descobrir-ip.ps1`).
3. Faça login e teste a câmera.

---

## Se ainda der erro de rede

- Desative por 1 minuto o **antivírus** ou **firewall de terceiros** no PC e teste de novo.
- No celular, tente outro navegador (Chrome e Firefox).
- Reinicie o roteador Wi‑Fi e tente de novo.
