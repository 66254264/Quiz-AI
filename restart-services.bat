@echo off
chcp 65001 >nul 2>&1
cls
echo ========================================
echo    多学生测验系统 - 重启服务
echo ========================================
echo.

echo 🔄 正在重启服务...
echo.

REM 先停止服务
call stop-services.bat

echo.
echo ⏳ 等待 3 秒后重新启动...
timeout /t 3 /nobreak >nul

REM 再启动服务
call start-services.bat
