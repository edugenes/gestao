# Script para iniciar Backend e Frontend
# Execute: .\iniciar-servidores.ps1

Write-Host "`nIniciando servidores do Sistema de Patrimônio...`n" -ForegroundColor Cyan

# Verificar se estamos no diretório correto
if (-not (Test-Path "backend") -or -not (Test-Path "asset-guardian")) {
    Write-Host "Erro: Execute este script na raiz do projeto (onde estão as pastas 'backend' e 'asset-guardian')" -ForegroundColor Red
    exit 1
}

# Obter IPs da máquina
Write-Host "Descobrindo IPs da rede local...`n" -ForegroundColor Yellow
$interfaces = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*"
} | Sort-Object InterfaceIndex

if ($interfaces.Count -gt 0) {
    $mainIP = $interfaces[0].IPAddress
    Write-Host "IP principal: $mainIP" -ForegroundColor Green
    Write-Host "   Frontend: http://$mainIP`:8080" -ForegroundColor Cyan
    Write-Host "   Backend:  http://$mainIP`:3001`n" -ForegroundColor Cyan
} else {
    Write-Host "Nenhum IP encontrado. Use 'localhost' para acesso local.`n" -ForegroundColor Yellow
}

# Iniciar Backend
Write-Host "Iniciando Backend (porta 3001)...`n" -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location backend
    npm run start:dev
}

# Aguardar um pouco para o backend iniciar
Start-Sleep -Seconds 3

# Iniciar Frontend
Write-Host "Iniciando Frontend (porta 8080)...`n" -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location asset-guardian
    npm run dev
}

Write-Host "Servidores iniciados em background!`n" -ForegroundColor Green
Write-Host "Para ver os logs:" -ForegroundColor Cyan
Write-Host "   Backend:  Receive-Job -Id $($backendJob.Id) -Keep" -ForegroundColor White
Write-Host "   Frontend: Receive-Job -Id $($frontendJob.Id) -Keep`n" -ForegroundColor White

Write-Host "Para parar os servidores:" -ForegroundColor Yellow
Write-Host "   Stop-Job -Id $($backendJob.Id),$($frontendJob.Id)" -ForegroundColor White
Write-Host "   Remove-Job -Id $($backendJob.Id),$($frontendJob.Id)`n" -ForegroundColor White

# Mostrar logs em tempo real
Write-Host "Mostrando logs (Ctrl+C para parar)...`n" -ForegroundColor Cyan
try {
    while ($true) {
        $backendOutput = Receive-Job -Id $backendJob.Id -ErrorAction SilentlyContinue
        $frontendOutput = Receive-Job -Id $frontendJob.Id -ErrorAction SilentlyContinue
        
        if ($backendOutput) {
            Write-Host "[BACKEND] $backendOutput" -ForegroundColor Green
        }
        if ($frontendOutput) {
            Write-Host "[FRONTEND] $frontendOutput" -ForegroundColor Blue
        }
        
        Start-Sleep -Milliseconds 500
    }
} catch {
    Write-Host "`nParando servidores...`n" -ForegroundColor Yellow
    Stop-Job -Id $backendJob.Id,$frontendJob.Id -ErrorAction SilentlyContinue
    Remove-Job -Id $backendJob.Id,$frontendJob.Id -ErrorAction SilentlyContinue
    Write-Host "Servidores parados.`n" -ForegroundColor Green
}
