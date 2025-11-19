@echo off
REM 依赖更新脚本 (Windows)
REM 用于清理旧依赖并安装新版本

echo 🔄 开始更新后端依赖...
echo.

REM 检查是否在 backend 目录
if not exist "package.json" (
    echo ❌ 错误: 请在 backend 目录下运行此脚本
    exit /b 1
)

REM 备份 package-lock.json（如果存在）
if exist "package-lock.json" (
    echo 📦 备份 package-lock.json...
    copy package-lock.json package-lock.json.backup >nul
)

REM 删除 node_modules
if exist "node_modules" (
    echo 🗑️  删除 node_modules...
    rmdir /s /q node_modules
)

REM 删除 package-lock.json
if exist "package-lock.json" (
    echo 🗑️  删除 package-lock.json...
    del package-lock.json
)

REM 清理 npm 缓存
echo 🧹 清理 npm 缓存...
call npm cache clean --force

REM 安装依赖
echo.
echo 📥 安装新依赖...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 依赖更新成功！
    echo.
    echo 📋 验证步骤:
    echo   1. 运行 'npm run build' 测试构建
    echo   2. 运行 'npm run lint' 测试 ESLint
    echo   3. 运行 'npm run dev' 启动开发服务器
    echo.
    
    REM 删除备份
    if exist "package-lock.json.backup" (
        del package-lock.json.backup
    )
) else (
    echo.
    echo ❌ 依赖安装失败
    echo.
    echo 🔄 恢复备份...
    if exist "package-lock.json.backup" (
        move /y package-lock.json.backup package-lock.json >nul
        call npm install
    )
    exit /b 1
)
