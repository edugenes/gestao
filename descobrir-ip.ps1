# Script para descobrir o IP local da máquina
# Execute: .\descobrir-ip.ps1

Write-Host "`n🔍 Procurando IPs da rede local...`n" -ForegroundColor Cyan

$interfaces = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*"
} | Sort-Object InterfaceIndex

if ($interfaces.Count -eq 0) {
    Write-Host "❌ Nenhum IP encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ IPs encontrados:`n" -ForegroundColor Green

foreach ($iface in $interfaces) {
    $ip = $iface.IPAddress
    $interface = Get-NetAdapter -InterfaceIndex $iface.InterfaceIndex -ErrorAction SilentlyContinue
    $name = if ($interface) { $interface.Name } else { "Interface $($iface.InterfaceIndex)" }
    
    Write-Host "   📡 $name" -ForegroundColor Yellow
    Write-Host "      IP: $ip" -ForegroundColor White
    
    # Verificar se é IP comum de rede local
    if ($ip -match "^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\.") {
        Write-Host "      HTTPS (celular/camera): https://$ip`:8443" -ForegroundColor Green
        Write-Host "      Frontend: http://$ip`:8080" -ForegroundColor Green
        Write-Host "      Backend:  http://$ip`:3001" -ForegroundColor Green
    }
    Write-Host ""
}

Write-Host "💡 Dica: Use o IP acima para acessar o sistema de outros dispositivos na mesma rede.`n" -ForegroundColor Cyan
