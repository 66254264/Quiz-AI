@echo off
chcp 65001 >nul
echo ========================================
echo 测试AI分析API端点
echo ========================================
echo.

echo 请提供以下信息：
echo.

set /p TOKEN="请输入JWT Token (从浏览器开发者工具获取): "
set /p QUESTION_ID="请输入题目ID: "
set /p QUIZ_ID="请输入测验ID: "

echo.
echo 正在测试API端点...
echo.

curl -X POST http://localhost:5000/api/analytics/questions/%QUESTION_ID%/analyze ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"quizId\":\"%QUIZ_ID%\"}" ^
  -v

echo.
echo.
pause
