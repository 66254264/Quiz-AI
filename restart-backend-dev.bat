@echo off
echo 正在重启后端开发服务...
echo.

echo 1. 停止现有的Node进程...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo 2. 启动后端开发服务（nodemon）...
cd backend
start "Quiz Backend Dev" cmd /k "npm run dev"

echo.
echo 后端开发服务已启动！
echo 修改代码后会自动重启
echo 请查看新打开的窗口查看日志
echo.
pause
