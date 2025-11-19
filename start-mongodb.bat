@echo off
chcp 65001 >nul 2>&1
cls
echo ========================================
echo    启动 MongoDB 服务
echo ========================================
echo.

REM 检查 MongoDB 是否已经在运行
echo 📊 检查 MongoDB 状态...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if %ERRORLEVEL% EQU 0 (
    echo ✅ MongoDB 已经在运行
    echo.
    pause
    exit /b 0
)

REM 启动 MongoDB 服务
echo 🚀 正在启动 MongoDB 服务...
net start MongoDB
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ MongoDB 服务启动成功
    echo 🌐 端口: 27017
) else (
    echo.
    echo ❌ MongoDB 服务启动失败
    echo.
    echo 💡 可能的原因:
    echo    1. MongoDB 未安装或未配置为 Windows 服务
    echo    2. 服务已禁用
    echo    3. 权限不足（需要管理员权限）
    echo.
    echo 💡 解决方案:
    echo    1. 以管理员身份运行此脚本
    echo    2. 安装 MongoDB: https://www.mongodb.com/try/download/community
    echo    3. 使用 MongoDB Atlas: https://www.mongodb.com/cloud/atlas
    echo    4. 手动启动: 以管理员身份运行 "net start MongoDB"
)

echo.
echo ========================================
pause
