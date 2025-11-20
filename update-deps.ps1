# Windows PowerShell 脚本：更新前端依赖
# 使用方法：.\update-deps.ps1

Write-Host "🔄 开始更新前端依赖..." -ForegroundColor Green
Write-Host ""

# 进入 frontend 目录
Set-Location frontend

# 备份当前的 package-lock.json
if (Test-Path package-lock.json) {
    Write-Host "💾 备份 package-lock.json..." -ForegroundColor Yellow
    Copy-Item package-lock.json package-lock.json.backup
}

# 删除旧依赖
Write-Host "🗑️  删除旧依赖..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# 清理 npm 缓存
Write-Host "🧹 清理 npm 缓存..." -ForegroundColor Yellow
npm cache clean --force

# 重新安装依赖
Write-Host "📦 安装新依赖..." -ForegroundColor Yellow
npm install

# 检查是否有错误
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ 依赖安装成功！" -ForegroundColor Green
    Write-Host ""
    
    # 测试构建
    Write-Host "🔨 测试构建..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "✨ 依赖更新完成！" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 已安装的版本：" -ForegroundColor Cyan
        npm list react react-dom vite typescript --depth=0
        Write-Host ""
        Write-Host "💡 下一步：" -ForegroundColor Yellow
        Write-Host "  1. 测试开发服务器：npm run dev" -ForegroundColor Gray
        Write-Host "  2. 提交更改：git add . && git commit -m 'Update dependencies'" -ForegroundColor Gray
        Write-Host "  3. 推送到远程：git push origin main" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ 构建失败！" -ForegroundColor Red
        Write-Host "请检查错误信息并修复" -ForegroundColor Yellow
        
        # 询问是否回滚
        $rollback = Read-Host "是否回滚到旧版本？(y/n)"
        if ($rollback -eq "y") {
            Write-Host "🔄 回滚中..." -ForegroundColor Yellow
            if (Test-Path package-lock.json.backup) {
                Copy-Item package-lock.json.backup package-lock.json
                Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
                npm install
                Write-Host "✅ 已回滚到旧版本" -ForegroundColor Green
            }
        }
    }
} else {
    Write-Host ""
    Write-Host "❌ 依赖安装失败！" -ForegroundColor Red
    Write-Host "请检查网络连接和 npm 配置" -ForegroundColor Yellow
    
    # 恢复备份
    if (Test-Path package-lock.json.backup) {
        Write-Host "🔄 恢复备份..." -ForegroundColor Yellow
        Copy-Item package-lock.json.backup package-lock.json
    }
}

# 返回根目录
Set-Location ..
