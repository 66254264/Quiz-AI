@echo off
chcp 65001 >nul 2>&1
cls
echo ========================================
echo    MongoDB 连接测试
echo ========================================
echo.

REM 检查 MongoDB 进程
echo [1/4] 检查 MongoDB 进程...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if %ERRORLEVEL% EQU 0 (
    echo     ✅ MongoDB 进程正在运行
    for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq mongod.exe" ^| find "mongod.exe"') do (
        echo     📍 PID: %%a
    )
) else (
    echo     ❌ MongoDB 进程未运行
    echo     💡 运行: net start MongoDB
)
echo.

REM 检查端口
echo [2/4] 检查端口 27017...
netstat -ano | find ":27017" | find "LISTENING" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo     ✅ 端口 27017 正在监听
    for /f "tokens=2,5" %%a in ('netstat -ano ^| find ":27017" ^| find "LISTENING"') do (
        echo     📍 地址: %%a  PID: %%b
    )
) else (
    echo     ❌ 端口 27017 未监听
)
echo.

REM 检查服务
echo [3/4] 检查 MongoDB 服务...
sc query MongoDB >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo     ✅ MongoDB 服务已安装
    for /f "tokens=3" %%a in ('sc query MongoDB ^| find "STATE"') do (
        if "%%a"=="RUNNING" (
            echo     ✅ 服务状态: 运行中
        ) else (
            echo     ⚠️  服务状态: %%a
            echo     💡 运行: net start MongoDB
        )
    )
) else (
    echo     ❌ MongoDB 服务未安装
    echo     💡 安装 MongoDB 时选择 "作为服务安装"
)
echo.

REM 检查配置文件
echo [4/4] 检查后端配置...
if exist "backend\.env" (
    echo     ✅ backend/.env 文件存在
    findstr /C:"MONGODB_URI" backend\.env >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo     ✅ 找到 MONGODB_URI 配置
        for /f "tokens=2 delims==" %%a in ('findstr /C:"MONGODB_URI" backend\.env') do (
            echo     📍 连接: %%a
        )
    ) else (
        echo     ⚠️  未找到 MONGODB_URI 配置
        echo     💡 添加: MONGODB_URI=mongodb://localhost:27017/quiz-system
    )
) else (
    echo     ❌ backend/.env 文件不存在
    echo     💡 复制 backend/.env.example 为 backend/.env
)
echo.

echo ========================================
echo 诊断结果
echo ========================================
echo.

REM 综合判断
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
set MONGO_RUNNING=%ERRORLEVEL%

netstat -ano | find ":27017" | find "LISTENING" >nul 2>nul
set PORT_LISTENING=%ERRORLEVEL%

if %MONGO_RUNNING% EQU 0 (
    if %PORT_LISTENING% EQU 0 (
        echo ✅ MongoDB 运行正常
        echo 💡 可以启动后端服务
    ) else (
        echo ⚠️  MongoDB 进程运行但端口未监听
        echo 💡 可能正在启动中，请等待几秒
    )
) else (
    echo ❌ MongoDB 未运行
    echo.
    echo 💡 解决方案:
    echo    1. 运行: net start MongoDB
    echo    2. 或运行: start-mongodb.bat
    echo    3. 或使用 MongoDB Atlas
)

echo.
echo ========================================
pause
