@echo off
chcp 65001 >nul 2>&1
cls
echo ========================================
echo    停止 MongoDB 服务
echo ========================================
echo.

REM 检查 MongoDB 是否在运行
echo 📊 检查 MongoDB 状态...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if %ERRORLEVEL% NEQ 0 (
    echo ℹ️  MongoDB 未运行
    echo.
    pause
    exit /b 0
)

REM 停止 MongoDB 服务
echo 🛑 正在停止 MongoDB 服务...
net stop MongoDB
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ MongoDB 服务已停止
) else (
    echo.
    echo ⚠️  服务停止失败
    echo 💡 可能需要管理员权限
    echo    请以管理员身份运行此脚本
)

echo.
echo ========================================
echo 💡 提示:
echo    - 使用 start-mongodb.bat 重新启动
echo    - 或使用 start-services.bat 启动所有服务
echo ========================================
echo.
pause
