# Windows PowerShell 脚本：同步代码到阿里云服务器
# 使用方法：.\sync-to-server.ps1

param(
    [string]$ServerIP = "your-server-ip",
    [string]$Username = "deploy",
    [string]$Method = "git"  # 可选：git, scp, rsync
)

Write-Host "🚀 开始同步代码到服务器..." -ForegroundColor Green
Write-Host ""

# 检查参数
if ($ServerIP -eq "your-server-ip") {
    Write-Host "❌ 错误：请设置服务器 IP 地址" -ForegroundColor Red
    Write-Host "使用方法：.\sync-to-server.ps1 -ServerIP 123.456.789.012" -ForegroundColor Yellow
    exit 1
}

# 方法 1：使用 Git（推荐）
if ($Method -eq "git") {
    Write-Host "📦 方法：Git 同步" -ForegroundColor Cyan
    Write-Host ""
    
    # 检查是否有未提交的更改
    $status = git status --porcelain
    if ($status) {
        Write-Host "📝 提交本地更改..." -ForegroundColor Yellow
        git add .
        $commitMsg = Read-Host "请输入提交信息（直接回车使用默认）"
        if ([string]::IsNullOrWhiteSpace($commitMsg)) {
            $commitMsg = "Update frontend build configuration - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        }
        git commit -m $commitMsg
    }
    
    Write-Host "⬆️  推送到远程仓库..." -ForegroundColor Yellow
    git push origin main
    
    Write-Host ""
    Write-Host "✅ 代码已推送到 Git 仓库" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 请在服务器上执行以下命令：" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "ssh $Username@$ServerIP" -ForegroundColor White
    Write-Host "cd ~/apps/quiz-system" -ForegroundColor White
    Write-Host "git pull origin main" -ForegroundColor White
    Write-Host "cd frontend && npm install && npm run build" -ForegroundColor White
    Write-Host "pm2 restart quiz-system-backend" -ForegroundColor White
    Write-Host ""
}

# 方法 2：使用 SCP
elseif ($Method -eq "scp") {
    Write-Host "📦 方法：SCP 直接传输" -ForegroundColor Cyan
    Write-Host ""
    
    # 压缩 frontend 文件夹
    Write-Host "📦 压缩 frontend 文件夹..." -ForegroundColor Yellow
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $archiveName = "frontend-$timestamp.tar.gz"
    
    # 使用 tar 压缩（需要 Git Bash 或 WSL）
    if (Get-Command tar -ErrorAction SilentlyContinue) {
        tar -czf $archiveName --exclude='node_modules' --exclude='dist' --exclude='.git' frontend/
        
        Write-Host "⬆️  上传到服务器..." -ForegroundColor Yellow
        scp $archiveName "${Username}@${ServerIP}:~/"
        
        Write-Host "🗑️  清理本地压缩包..." -ForegroundColor Yellow
        Remove-Item $archiveName
        
        Write-Host ""
        Write-Host "✅ 文件已上传到服务器" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 请在服务器上执行以下命令：" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "ssh $Username@$ServerIP" -ForegroundColor White
        Write-Host "cd ~/apps/quiz-system" -ForegroundColor White
        Write-Host "mv frontend frontend.backup.$timestamp" -ForegroundColor White
        Write-Host "tar -xzf ~/$archiveName" -ForegroundColor White
        Write-Host "rm ~/$archiveName" -ForegroundColor White
        Write-Host "cd frontend && npm install && npm run build" -ForegroundColor White
        Write-Host "pm2 restart quiz-system-backend" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host "❌ 错误：未找到 tar 命令" -ForegroundColor Red
        Write-Host "请安装 Git for Windows 或使用 WSL" -ForegroundColor Yellow
        exit 1
    }
}

# 方法 3：使用 rsync
elseif ($Method -eq "rsync") {
    Write-Host "📦 方法：rsync 增量同步" -ForegroundColor Cyan
    Write-Host ""
    
    if (Get-Command rsync -ErrorAction SilentlyContinue) {
        Write-Host "🔄 同步 frontend 文件夹..." -ForegroundColor Yellow
        rsync -avz --delete `
            --exclude 'node_modules' `
            --exclude 'dist' `
            --exclude '.git' `
            frontend/ "${Username}@${ServerIP}:~/apps/quiz-system/frontend/"
        
        Write-Host ""
        Write-Host "✅ 文件已同步到服务器" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 请在服务器上执行以下命令：" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "ssh $Username@$ServerIP" -ForegroundColor White
        Write-Host "cd ~/apps/quiz-system/frontend" -ForegroundColor White
        Write-Host "npm install && npm run build" -ForegroundColor White
        Write-Host "pm2 restart quiz-system-backend" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host "❌ 错误：未找到 rsync 命令" -ForegroundColor Red
        Write-Host "请安装 Git for Windows 或使用 WSL" -ForegroundColor Yellow
        exit 1
    }
}

else {
    Write-Host "❌ 错误：未知的同步方法：$Method" -ForegroundColor Red
    Write-Host "可用方法：git, scp, rsync" -ForegroundColor Yellow
    exit 1
}

Write-Host "💡 提示：" -ForegroundColor Yellow
Write-Host "  - 使用 Git 方法最安全，推荐用于生产环境" -ForegroundColor Gray
Write-Host "  - 使用 SCP 方法适合快速测试" -ForegroundColor Gray
Write-Host "  - 使用 rsync 方法适合大文件增量同步" -ForegroundColor Gray
Write-Host ""
