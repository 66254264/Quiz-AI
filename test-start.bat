@echo off
chcp 65001 >nul 2>&1
cls
echo ========================================
echo    测试启动脚本
echo ========================================
echo.

echo 测试 1: 基本输出
echo ✅ 中文显示正常
echo.

echo 测试 2: 检查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js 未安装
) else (
    echo ✅ Node.js 已安装
)
echo.

echo 测试 3: 检查 MongoDB 进程
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  MongoDB 未运行
) else (
    echo ✅ MongoDB 正在运行
)
echo.

echo 测试 4: 检查目录
if exist "backend" (
    echo ✅ backend 目录存在
) else (
    echo ❌ backend 目录不存在
)

if exist "frontend" (
    echo ✅ frontend 目录存在
) else (
    echo ❌ frontend 目录不存在
)
echo.

echo ========================================
echo 测试完成！
echo.
echo 如果以上测试都通过，start-services.bat 应该可以正常运行
echo ========================================
pause
