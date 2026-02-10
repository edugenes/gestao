# Liberar porta 3001 no Firewall do Windows (Backend - Patrimonio)
# Execute como Administrador: botao direito no PowerShell -> "Executar como administrador"

$ruleName = "Patrimonio Backend (3001)"
$existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue

if ($existing) {
    Write-Host "Regra '$ruleName' ja existe. Removendo para recriar..." -ForegroundColor Yellow
    Remove-NetFirewallRule -DisplayName $ruleName
}

New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
Write-Host "Porta 3001 liberada no firewall. O app Android deve conseguir conectar agora." -ForegroundColor Green
