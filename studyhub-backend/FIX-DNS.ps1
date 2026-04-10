# Run in PowerShell as Administrator:
#   Right-click PowerShell → "Run as Administrator"
#   cd to studyhub-backend folder
#   .\FIX-DNS.ps1

Write-Host ""
Write-Host "Fixing DNS for MongoDB Atlas..." -ForegroundColor Cyan

$adapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }

foreach ($a in $adapters) {
    Set-DnsClientServerAddress -InterfaceAlias $a.Name -ServerAddresses "8.8.8.8","8.8.4.4"
    Write-Host "  Updated: $($a.Name)" -ForegroundColor Green
}

ipconfig /flushdns | Out-Null
Write-Host "  DNS cache cleared" -ForegroundColor Green
Write-Host ""
Write-Host "Done! Now run: npm run dev" -ForegroundColor Yellow
Write-Host ""
