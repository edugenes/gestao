# 🌐 Acesso pela Rede Local

Este guia explica como acessar o sistema de patrimônio pela rede local, permitindo que celulares e outros dispositivos na mesma rede possam usar o sistema.

## 📋 Pré-requisitos

- Backend e Frontend rodando
- Dispositivos na mesma rede Wi-Fi/Ethernet

## 🔧 Configuração

### 1. Descobrir o IP da Máquina

**Windows (PowerShell):**
```powershell
ipconfig | findstr IPv4
```

**Windows (CMD):**
```cmd
ipconfig
```
Procure por "IPv4" na saída. O IP geralmente começa com `192.168.x.x` ou `10.x.x.x`.

**Linux/Mac:**
```bash
ifconfig | grep "inet "
# ou
ip addr show | grep "inet "
```

### 2. Backend

O backend já está configurado para aceitar conexões da rede:
- Escuta em `0.0.0.0` (todas as interfaces)
- CORS permite automaticamente IPs locais
- Ao iniciar, mostra os IPs disponíveis no console

**Exemplo de saída ao iniciar:**
```
🚀 Backend rodando:
   Local:   http://localhost:3001
   Rede:    http://192.168.1.100:3001
   Swagger: http://localhost:3001/api/docs
```

### 3. Frontend

O frontend já está configurado para aceitar conexões da rede (`host: "::"` no `vite.config.ts`).

**Para acessar de outros dispositivos:**

1. Descubra o IP da máquina (passo 1)
2. No celular/dispositivo, acesse: `http://SEU_IP:8080`
   - Exemplo: `http://192.168.1.100:8080`

### 4. Configurar URL da API no Frontend (Opcional)

✅ **O frontend detecta automaticamente o IP/hostname atual!**

Quando você acessa o sistema por `http://192.168.1.100:8080`, o frontend automaticamente usa `http://192.168.1.100:3001` para o backend.

**Você só precisa configurar manualmente se:**
- O backend estiver em uma porta diferente de 3001
- O backend estiver em outro servidor/IP diferente

Nesse caso, crie um arquivo `.env` na pasta `asset-guardian/`:
```env
VITE_API_URL=http://IP_DO_BACKEND:PORTA
```

**Exemplo:**
```env
VITE_API_URL=http://192.168.1.100:3001
```

## 📱 Acessando pelo Celular

1. Certifique-se de que o celular está na mesma rede Wi-Fi
2. Abra o navegador no celular
3. Digite: `http://SEU_IP:8080`
   - Exemplo: `http://192.168.1.100:8080`
4. Faça login normalmente

## 🔒 Segurança

⚠️ **Importante:**
- Esta configuração permite acesso apenas na rede local
- Não exponha o sistema para a internet sem proteção adequada (firewall, VPN, etc.)
- Em produção, use HTTPS e autenticação adequada

## 🐛 Troubleshooting

### Frontend não carrega no celular
- Verifique se o IP está correto
- Verifique se o firewall do Windows não está bloqueando a porta 8080
- Tente acessar `http://SEU_IP:8080` no navegador do próprio computador

### API não responde
- Verifique se o backend está rodando
- Verifique se o IP do backend está correto no `.env` do frontend
- Verifique o console do backend para ver os IPs disponíveis

### CORS Error
- O backend já permite automaticamente IPs locais
- Se ainda houver erro, adicione o IP específico no `CORS_ORIGIN` do `.env` do backend:
  ```
  CORS_ORIGIN=http://localhost:8080,http://192.168.1.100:8080
  ```

## 📝 Notas

- O IP pode mudar se você reconectar na rede Wi-Fi
- Use IP estático ou DHCP reservation para manter o mesmo IP
- Para acesso externo (fora da rede), considere usar VPN ou túnel reverso (ngrok, Cloudflare Tunnel, etc.)
