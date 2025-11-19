@echo off
chcp 65001 >nul 2>&1
cls
echo ========================================
echo    多学生测验系统 - 启动服务
echo ========================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误: 未找到 Node.js
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)

REM 尝试启动 MongoDB
echo 📊 启动 MongoDB...
net start MongoDB >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ MongoDB 已启动
) else (
    echo ⚠️  MongoDB 启动失败 (可能已在运行或未安装)
    echo 💡 如果使用 MongoDB Atlas，请忽略此警告
)
echo.

REM 保存当前目录
set "ROOT_DIR=%CD%"

REM 启动后端
echo 🚀 启动后端服务...
cd /d "%ROOT_DIR%\backend"
if not exist "node_modules" (
    echo 📦 安装后端依赖...
    call npm install
)
start "Quiz System - Backend" cmd /k "npm run dev"
timeout /t 2 /nobreak >nul

REM 启动前端
echo 🎨 启动前端服务...
cd /d "%ROOT_DIR%\frontend"
if not exist "node_modules" (
    echo 📦 安装前端依赖...
    call npm install
)
start "Quiz System - Frontend" cmd /k "npm run dev"

REM 返回根目录
cd /d "%ROOT_DIR%"

echo.
echo ========================================
echo ✅ 服务启动完成！
echo ========================================
echo.
echo 📍 后端: http://localhost:5000
echo 📍 前端: http://localhost:3000
echo.
echo 💡 两个窗口已打开，请保持运行
echo 💡 使用 stop-services.bat 停止服务
echo.
echo 🌐 5秒后打开浏览器...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
pause
