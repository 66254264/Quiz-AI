@echo off
chcp 65001 >nul 2>&1
cls
echo ========================================
echo    多学生测验系统 - 服务状态
echo ========================================
echo.

REM 检查 Node.js
echo 📦 Node.js:
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('node --version') do echo    ✅ 已安装 %%i
) else (
    echo    ❌ 未安装
)

REM 检查 npm
echo.
echo 📦 npm:
where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('npm --version') do echo    ✅ 已安装 v%%i
) else (
    echo    ❌ 未安装
)

REM 检查 MongoDB
echo.
echo 📊 MongoDB:
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if %ERRORLEVEL% EQU 0 (
    echo    ✅ 正在运行
    for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq mongod.exe" ^| find "mongod.exe"') do (
        echo    📍 PID: %%a
    )
    REM 检查端口
    netstat -ano | find ":27017" | find "LISTENING" >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo    🌐 端口 27017: 监听中
    )
) else (
    echo    ⚠️  未运行
    echo    💡 使用 start-mongodb.bat 启动
)

REM 检查后端服务 (端口 5000)
echo.
echo 🚀 后端服务 (端口 5000):
netstat -ano | find ":5000" | find "LISTENING" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo    ✅ 正在运行
    for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do (
        echo    📍 PID: %%a
    )
) else (
    echo    ❌ 未运行
)

REM 检查前端服务 (端口 3000)
echo.
echo 🎨 前端服务 (端口 3000):
netstat -ano | find ":3000" | find "LISTENING" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo    ✅ 正在运行
    for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
        echo    📍 PID: %%a
    )
) else (
    echo    ❌ 未运行
)

REM 检查依赖安装
echo.
echo 📦 依赖安装状态:
if exist "backend\node_modules" (
    echo    ✅ 后端依赖已安装
) else (
    echo    ❌ 后端依赖未安装
)
if exist "frontend\node_modules" (
    echo    ✅ 前端依赖已安装
) else (
    echo    ❌ 前端依赖未安装
)

echo.
echo ========================================
echo 💡 快速操作:
echo    - 启动服务: start-services.bat
echo    - 停止服务: stop-services.bat
echo    - 重启服务: restart-services.bat
echo ========================================
echo.
pause
