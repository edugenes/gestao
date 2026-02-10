# Script para testar se o backend esta acessivel na rede
# Execute: .\testar-backend.ps1 [IP_OU_HOST] [PORTA]
# Exemplo: .\testar-backend.ps1 192.168.0.250 3001

param(
    [string]$IP = "192.168.0.250",
    [int]$PORTA = 3001
)

Write-Host ""
Write-Host "Testando conectividade com o backend..." -ForegroundColor Cyan
Write-Host "   IP: $IP" -ForegroundColor White
Write-Host "   Porta: $PORTA" -ForegroundColor White
Write-Host ""

# 1. Teste de ping (se for IP)
if ($IP -match '^\d+\.\d+\.\d+\.\d+$') {
    Write-Host "Testando ping..." -ForegroundColor Yellow
    $ping = Test-Connection -ComputerName $IP -Count 2 -Quiet -ErrorAction SilentlyContinue
    if ($ping) {
        Write-Host "   OK: Ping funcionou" -ForegroundColor Green
    } else {
        Write-Host "   ERRO: Ping falhou - dispositivo pode estar offline ou em outra rede" -ForegroundColor Red
    }
    Write-Host ""
}

# 2. Teste de porta TCP
Write-Host "Testando porta TCP $PORTA..." -ForegroundColor Yellow
try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $tcpClient.ReceiveTimeout = 3000
    $tcpClient.SendTimeout = 3000
    $connect = $tcpClient.BeginConnect($IP, $PORTA, $null, $null)
    $wait = $connect.AsyncWaitHandle.WaitOne(3000, $false)
    
    if ($wait) {
        $tcpClient.EndConnect($connect)
        Write-Host "   OK: Porta $PORTA esta aberta e aceitando conexoes" -ForegroundColor Green
        $tcpClient.Close()
    } else {
        Write-Host "   ERRO: Porta $PORTA nao respondeu em 3 segundos" -ForegroundColor Red
        $tcpClient.Close()
    }
} catch {
    Write-Host "   ERRO: Nao foi possivel conectar na porta $PORTA : $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 3. Teste HTTP GET (deve retornar 404 para /auth/login, mas confirma que o servidor responde)
Write-Host "Testando requisicao HTTP GET..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://${IP}:${PORTA}/auth/login" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   AVISO: Resposta HTTP $($response.StatusCode) (esperado: 404 para GET /auth/login)" -ForegroundColor Yellow
    Write-Host "   OK: Servidor esta respondendo HTTP" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 404) {
        Write-Host "   OK: Servidor respondeu 404 (esperado para GET /auth/login)" -ForegroundColor Green
        Write-Host "   OK: Backend esta funcionando corretamente" -ForegroundColor Green
    } elseif ($statusCode) {
        Write-Host "   AVISO: Resposta HTTP $statusCode" -ForegroundColor Yellow
    } else {
        Write-Host "   ERRO: Nao foi possivel fazer requisicao HTTP: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   DICA: Verifique se o backend esta rodando e se o firewall permite conexoes" -ForegroundColor Cyan
    }
}
Write-Host ""

# 4. Teste POST /auth/login (com credenciais invalidas - deve retornar 401)
Write-Host "Testando POST /auth/login (credenciais invalidas)..." -ForegroundColor Yellow
try {
    $body = @{ email = "teste@teste.com"; password = "senhaerrada" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "http://${IP}:${PORTA}/auth/login" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   AVISO: Login retornou sucesso (nao esperado com credenciais invalidas)" -ForegroundColor Yellow
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "   OK: Endpoint /auth/login respondeu 401 (esperado para credenciais invalidas)" -ForegroundColor Green
        Write-Host "   OK: Backend esta processando requisicoes POST corretamente" -ForegroundColor Green
    } elseif ($statusCode) {
        Write-Host "   AVISO: Resposta HTTP $statusCode" -ForegroundColor Yellow
    } else {
        Write-Host "   ERRO: Nao foi possivel fazer POST: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "Resumo:" -ForegroundColor Cyan
Write-Host "   - Se todos os testes passaram, o backend esta acessivel na rede." -ForegroundColor White
Write-Host "   - Configure no app: http://${IP}:${PORTA}" -ForegroundColor White
Write-Host "   - Se algum teste falhou, verifique firewall e se o backend esta rodando." -ForegroundColor White
Write-Host ""
