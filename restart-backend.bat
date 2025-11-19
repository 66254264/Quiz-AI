@echo off
echo 正在重启后端服务...
echo.

echo 1. 停止现有的Node进程...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo 2. 重新编译TypeScript...
cd backend
call npm run build
if errorlevel 1 (
    echo 编译失败！
    pause
    exit /b 1
)

echo.
echo 3. 启动后端服务...
start "Quiz Backend" cmd /k "npm start"

echo.
echo 后端服务已重启！
echo 请查看新打开的窗口查看日志
echo.
pause
