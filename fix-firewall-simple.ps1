# Quiz System Firewall Configuration
# Run as Administrator

Write-Host "=== Quiz System Firewall Setup ===" -ForegroundColor Cyan

# Check admin rights
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: Administrator rights required" -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator" -ForegroundColor Yellow
    pause
    exit
}

Write-Host "Admin rights confirmed" -ForegroundColor Green
Write-Host ""

# Remove old rules
Write-Host "Removing old rules..." -ForegroundColor Yellow
Remove-NetFirewallRule -DisplayName "Quiz System Frontend" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "Quiz System Backend" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "Quiz System Frontend (Public)" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "Quiz System Backend (Public)" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "Quiz System Frontend (Private)" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "Quiz System Backend (Private)" -ErrorAction SilentlyContinue

# Create new rules
Write-Host "Creating firewall rules..." -ForegroundColor Yellow

# Frontend port 3000 - Public network
New-NetFirewallRule -DisplayName "Quiz System Frontend (Public)" `
    -Direction Inbound `
    -LocalPort 3000 `
    -Protocol TCP `
    -Action Allow `
    -Profile Public `
    -Description "Allow Quiz System Frontend on Public network"

# Frontend port 3000 - Private network
New-NetFirewallRule -DisplayName "Quiz System Frontend (Private)" `
    -Direction Inbound `
    -LocalPort 3000 `
    -Protocol TCP `
    -Action Allow `
    -Profile Private `
    -Description "Allow Quiz System Frontend on Private network"

# Backend port 5000 - Public network
New-NetFirewallRule -DisplayName "Quiz System Backend (Public)" `
    -Direction Inbound `
    -LocalPort 5000 `
    -Protocol TCP `
    -Action Allow `
    -Profile Public `
    -Description "Allow Quiz System Backend on Public network"

# Backend port 5000 - Private network
New-NetFirewallRule -DisplayName "Quiz System Backend (Private)" `
    -Direction Inbound `
    -LocalPort 5000 `
    -Protocol TCP `
    -Action Allow `
    -Profile Private `
    -Description "Allow Quiz System Backend on Private network"

Write-Host ""
Write-Host "Firewall rules created successfully!" -ForegroundColor Green
Write-Host ""

# Show current rules
Write-Host "Current firewall rules:" -ForegroundColor Cyan
Get-NetFirewallRule -DisplayName "*Quiz*" | Select-Object DisplayName, Enabled, Direction, Action, Profile | Format-Table

# Show network profile
Write-Host "Current network profile:" -ForegroundColor Cyan
Get-NetConnectionProfile | Select-Object Name, NetworkCategory, InterfaceAlias | Format-Table

# Test ports
Write-Host "Port status:" -ForegroundColor Cyan
$port3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
$port5000 = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue

if ($port3000) {
    Write-Host "Port 3000: Listening" -ForegroundColor Green
} else {
    Write-Host "Port 3000: Not listening (frontend may not be running)" -ForegroundColor Yellow
}

if ($port5000) {
    Write-Host "Port 5000: Listening" -ForegroundColor Green
} else {
    Write-Host "Port 5000: Not listening (backend may not be running)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start backend: cd backend; npm run dev"
Write-Host "2. Start frontend: cd frontend; npm run dev"
Write-Host "3. Access from other devices: http://your-ip:3000"
Write-Host ""

pause
