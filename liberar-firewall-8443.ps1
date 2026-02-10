# Liberar porta 8443 no Firewall do Windows (HTTPS local - Patrimonio)
# Execute como Administrador: botao direito no PowerShell -> "Executar como administrador"

$ruleName = "Patrimonio HTTPS (8443)"
$existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue

if ($existing) {
    Write-Host "Regra '$ruleName' ja existe. Removendo para recriar..." -ForegroundColor Yellow
    Remove-NetFirewallRule -DisplayName $ruleName
}

New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -LocalPort 8443 -Protocol TCP -Action Allow
Write-Host "Porta 8443 liberada no firewall. Tente acessar do celular novamente." -ForegroundColor Green
