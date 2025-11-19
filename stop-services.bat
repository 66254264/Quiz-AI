@echo off
chcp 65001 >nul 2>&1
cls
echo ========================================
echo    多学生测验系统 - 停止服务
echo ========================================
echo.

echo 🛑 正在停止服务...
echo.

REM 停止前端服务 (Vite 通常运行在 Node.js 进程中)
echo 📍 停止前端服务 (端口 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo    终止进程 PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

REM 停止后端服务 (端口 5000)
echo 📍 停止后端服务 (端口 5000)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do (
    echo    终止进程 PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

REM 额外清理：关闭所有标题包含 "Quiz System" 的命令行窗口
echo 📍 关闭相关命令行窗口...
taskkill /FI "WINDOWTITLE eq Quiz System - Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Quiz System - Frontend*" /F >nul 2>&1

REM 询问是否停止 MongoDB（5秒超时，默认否）
echo.
choice /C YN /M "是否同时停止 MongoDB 服务" /T 5 /D N >nul 2>&1
if errorlevel 2 goto skip_mongodb
if errorlevel 1 (
    echo 📍 停止 MongoDB 服务...
    net stop MongoDB >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo    ✅ MongoDB 已停止
    )
)
:skip_mongodb

REM 等待一下确保进程完全终止
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo ✅ 服务已停止
echo ========================================
echo.
echo 💡 提示:
echo    - 所有服务已关闭
echo    - 可以使用 start-services.bat 重新启动
echo.
pause
