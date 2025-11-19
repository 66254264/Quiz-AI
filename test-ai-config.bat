@echo off
chcp 65001 >nul
echo ========================================
echo AI分析功能配置测试
echo ========================================
echo.

echo 1. 检查环境变量文件...
if exist backend\.env (
    echo ✓ backend\.env 文件存在
    echo.
    echo 配置内容:
    findstr "DOUBAO" backend\.env
) else (
    echo ✗ backend\.env 文件不存在！
    echo 请先创建 backend\.env 文件并配置豆包API
    pause
    exit /b 1
)

echo.
echo ========================================
echo 2. 测试豆包API连接...
echo ========================================
node backend/test-doubao-api.js

echo.
echo ========================================
echo 测试完成！
echo ========================================
echo.
echo 如果看到 "✅ API调用成功！" 说明配置正确
echo 如果看到错误，请检查：
echo   1. API Key 是否正确
echo   2. Endpoint ID 是否正确
echo   3. 网络连接是否正常
echo   4. 火山引擎服务是否已激活
echo.
pause
