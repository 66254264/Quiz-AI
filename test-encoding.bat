@echo off
chcp 65001 >nul 2>&1
cls
echo ========================================
echo    中文编码测试
echo ========================================
echo.
echo 测试内容：
echo.
echo ✅ 简体中文：你好世界
echo ✅ 繁体中文：你好世界
echo ✅ 特殊符号：①②③④⑤
echo ✅ Emoji: 🚀 📦 ✨ 💡 🎯
echo ✅ 数字：1234567890
echo ✅ 英文：Hello World
echo ✅ 混合：Hello 世界 123
echo.
echo ========================================
echo.
echo 如果以上内容显示正常，说明编码配置正确！
echo 如果出现乱码，请参考 BAT_ENCODING_FIX.md
echo.
echo ========================================
pause
