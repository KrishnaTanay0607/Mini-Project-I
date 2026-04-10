# Run this in PowerShell as Administrator on your laptop
# It sets Google DNS which fixes MongoDB Atlas connection issues

Write-Host "Setting DNS to Google (8.8.8.8)..." -ForegroundColor Cyan

# Get Wi-Fi adapter name
$adapter = Get-NetAdapter | Where-Object { $_.Status -eq "Up" -and ($_.Name -like "*Wi-Fi*" -or $_.Name -like "*Wireless*" -or $_.Name -like "*WiFi*") } | Select-Object -First 1

if ($adapter) {
    Set-DnsClientServerAddress -InterfaceAlias $adapter.Name -ServerAddresses "8.8.8.8","8.8.4.4"
    Write-Host "✅ DNS updated on: $($adapter.Name)" -ForegroundColor Green
} else {
    # Try all active adapters
    Get-NetAdapter | Where-Object { $_.Status -eq "Up" } | ForEach-Object {
        Set-DnsClientServerAddress -InterfaceAlias $_.Name -ServerAddresses "8.8.8.8","8.8.4.4"
        Write-Host "✅ DNS updated on: $($_.Name)" -ForegroundColor Green
    }
}

# Flush DNS cache
Clear-DnsClientCache
Write-Host "✅ DNS cache cleared" -ForegroundColor Green
Write-Host ""
Write-Host "Now restart the backend: npm run dev" -ForegroundColor Yellow
