# 修复防火墙配置脚本
# 需要管理员权限运行

Write-Host "=== Quiz System 防火墙配置 ===" -ForegroundColor Cyan
Write-Host ""

# 检查管理员权限
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "❌ 错误: 需要管理员权限" -ForegroundColor Red
    Write-Host "请右键点击 PowerShell，选择'以管理员身份运行'" -ForegroundColor Yellow
    pause
    exit
}

Write-Host "✅ 管理员权限确认" -ForegroundColor Green
Write-Host ""

# 删除旧规则（如果存在）
Write-Host "清理旧的防火墙规则..." -ForegroundColor Yellow
Remove-NetFirewallRule -DisplayName "Quiz System Frontend" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "Quiz System Backend" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "Quiz System Frontend (Public)" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "Quiz System Backend (Public)" -ErrorAction SilentlyContinue

# 为所有网络配置文件创建规则
Write-Host "创建新的防火墙规则..." -ForegroundColor Yellow

# 前端端口 3000 - 专用网络
New-NetFirewallRule -DisplayName "Quiz System Frontend" `
    -Direction Inbound `
    -LocalPort 3000 `
    -Protocol TCP `
    -Action Allow `
    -Profile Private `
    -Description "允许访问 Quiz System 前端 (专用网络)"

# 前端端口 3000 - 公用网络
New-NetFirewallRule -DisplayName "Quiz System Frontend (Public)" `
    -Direction Inbound `
    -LocalPort 3000 `
    -Protocol TCP `
    -Action Allow `
    -Profile Public `
    -Description "允许访问 Quiz System 前端 (公用网络)"

# 后端端口 5000 - 专用网络
New-NetFirewallRule -DisplayName "Quiz System Backend" `
    -Direction Inbound `
    -LocalPort 5000 `
    -Protocol TCP `
    -Action Allow `
    -Profile Private `
    -Description "允许访问 Quiz System 后端 (专用网络)"

# 后端端口 5000 - 公用网络
New-NetFirewallRule -DisplayName "Quiz System Backend (Public)" `
    -Direction Inbound `
    -LocalPort 5000 `
    -Protocol TCP `
    -Action Allow `
    -Profile Public `
    -Description "允许访问 Quiz System 后端 (公用网络)"

Write-Host ""
Write-Host "✅ 防火墙规则创建成功！" -ForegroundColor Green
Write-Host ""

# 显示当前规则
Write-Host "当前防火墙规则:" -ForegroundColor Cyan
Get-NetFirewallRule -DisplayName "*Quiz*" | Select-Object DisplayName, Enabled, Direction, Action, Profile | Format-Table

# 显示网络配置文件
Write-Host "当前网络配置:" -ForegroundColor Cyan
Get-NetConnectionProfile | Select-Object Name, NetworkCategory, InterfaceAlias | Format-Table

# 测试端口
Write-Host "测试端口监听状态:" -ForegroundColor Cyan
Write-Host "端口 3000:" -NoNewline
$port3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Host " ✅ 正在监听" -ForegroundColor Green
} else {
    Write-Host " ⚠️  未监听 (前端服务可能未启动)" -ForegroundColor Yellow
}

Write-Host "端口 5000:" -NoNewline
$port5000 = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue
if ($port5000) {
    Write-Host " ✅ 正在监听" -ForegroundColor Green
} else {
    Write-Host " ⚠️  未监听 (后端服务可能未启动)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== 配置完成 ===" -ForegroundColor Green
Write-Host ""
Write-Host "下一步:" -ForegroundColor Cyan
Write-Host "1. 确保后端服务正在运行: cd backend && npm run dev"
Write-Host "2. 确保前端服务正在运行: cd frontend && npm run dev"
Write-Host "3. 在其他设备访问: http://your-ip:3000"
Write-Host ""

pause
