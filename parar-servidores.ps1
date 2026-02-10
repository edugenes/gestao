# Script para parar todos os servidores do projeto

Write-Host "Parando todos os servidores..." -ForegroundColor Yellow
Write-Host ""

# Parar ngrok
Write-Host "Parando ngrok..." -ForegroundColor Cyan
Get-Process -Name "ngrok" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Parar processos Node.js (backend e frontend)
Write-Host "Parando processos Node.js..." -ForegroundColor Cyan
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Parar Caddy
Write-Host "Parando Caddy..." -ForegroundColor Cyan
Get-Process | Where-Object {$_.ProcessName -like "*caddy*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Verificar portas
Write-Host ""
Write-Host "Verificando portas..." -ForegroundColor Cyan
$ports = @(3001, 8080, 8443, 4040)
$stillRunning = $false

foreach ($port in $ports) {
    $result = netstat -ano | findstr ":$port" | findstr "LISTENING"
    if ($result) {
        Write-Host "⚠️  Porta $port ainda em uso!" -ForegroundColor Yellow
        $stillRunning = $true
        
        # Tentar parar pelo PID
        $pids = $result | ForEach-Object {
            $parts = $_ -split '\s+'
            $parts[-1]
        } | Select-Object -Unique
        
        foreach ($pid in $pids) {
            if ($pid -match '^\d+$') {
                try {
                    Stop-Process -Id $pid -Force -ErrorAction Stop
                    Write-Host "   Processo $pid parado" -ForegroundColor Green
                } catch {
                    Write-Host "   Não foi possível parar processo $pid" -ForegroundColor Red
                }
            }
        }
    } else {
        Write-Host "Porta $port livre" -ForegroundColor Green
    }
}

Write-Host ""
if ($stillRunning) {
    Write-Host "Algumas portas ainda podem estar em uso." -ForegroundColor Yellow
    Write-Host "Feche manualmente os terminais onde os servidores estavam rodando." -ForegroundColor Yellow
} else {
    Write-Host "Todos os servidores foram parados!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Processos Node.js restantes:" -ForegroundColor Cyan
$nodeProcs = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcs) {
    $nodeProcs | Format-Table Id, ProcessName, Path -AutoSize
} else {
    Write-Host "Nenhum processo Node.js rodando" -ForegroundColor Green
}

Write-Host ""
Write-Host "Processos ngrok restantes:" -ForegroundColor Cyan
$ngrokProcs = Get-Process -Name "ngrok" -ErrorAction SilentlyContinue
if ($ngrokProcs) {
    $ngrokProcs | Format-Table Id, ProcessName -AutoSize
} else {
    Write-Host "Nenhum processo ngrok rodando" -ForegroundColor Green
}
