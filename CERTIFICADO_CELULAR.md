# Instalar certificado no celular (1 vez por aparelho)

Para a **câmera do inventário** funcionar na rede local, o celular precisa confiar no certificado do servidor. Só é preciso fazer **uma vez** em cada aparelho.

---

## 1. Obter o arquivo `root.crt`

- **No servidor**, o arquivo está em: **Área de Trabalho** (`root.crt`) ou em `C:\caddy\certs\root.crt`.
- Envie para o celular por:
  - e-mail (para você mesmo), ou
  - WhatsApp (para você mesmo), ou
  - pen drive / compartilhamento de pasta.

---

## 2. No Android

1. Abra o arquivo **`root.crt`** no celular (pelo e-mail, WhatsApp ou arquivos).
2. Se pedir, escolha **Abrir com** → **Configurações** ou **Instalar certificado**.
3. Dê um **nome** (ex.: `Patrimônio`).
4. Tipo de certificado: **Certificado CA** (não “Certificado de usuário”).
5. Confirme (pode pedir PIN/senha do aparelho).
6. Pronto.

---

## 3. Acessar o sistema

1. Feche **completamente** o navegador (em Apps → Chrome → Forçar parada).
2. Abra de novo e acesse: **`https://IP_DO_SERVIDOR:8443`**  
   Exemplo: `https://192.168.0.250:8443`
3. Faça login e use o inventário com câmera normalmente.

---

## Resumo

| Passo | O que fazer |
|-------|-------------|
| 1 | Enviar `root.crt` do servidor para o celular |
| 2 | Abrir o arquivo no celular e instalar como **Certificado CA** |
| 3 | Fechar o navegador, abrir de novo e acessar `https://IP:8443` |

Se o IP do servidor mudar, use o novo IP na URL. O certificado continua válido.
