#!/bin/bash

# 依赖更新脚本
# 用于清理旧依赖并安装新版本

echo "🔄 开始更新后端依赖..."
echo ""

# 检查是否在 backend 目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在 backend 目录下运行此脚本"
    exit 1
fi

# 备份 package-lock.json（如果存在）
if [ -f "package-lock.json" ]; then
    echo "📦 备份 package-lock.json..."
    cp package-lock.json package-lock.json.backup
fi

# 删除 node_modules
if [ -d "node_modules" ]; then
    echo "🗑️  删除 node_modules..."
    rm -rf node_modules
fi

# 删除 package-lock.json
if [ -f "package-lock.json" ]; then
    echo "🗑️  删除 package-lock.json..."
    rm package-lock.json
fi

# 清理 npm 缓存
echo "🧹 清理 npm 缓存..."
npm cache clean --force

# 安装依赖
echo ""
echo "📥 安装新依赖..."
npm install

# 检查安装结果
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 依赖更新成功！"
    echo ""
    echo "📋 验证步骤:"
    echo "  1. 运行 'npm run build' 测试构建"
    echo "  2. 运行 'npm run lint' 测试 ESLint"
    echo "  3. 运行 'npm run dev' 启动开发服务器"
    echo ""
    
    # 删除备份
    if [ -f "package-lock.json.backup" ]; then
        rm package-lock.json.backup
    fi
else
    echo ""
    echo "❌ 依赖安装失败"
    echo ""
    echo "🔄 恢复备份..."
    if [ -f "package-lock.json.backup" ]; then
        mv package-lock.json.backup package-lock.json
        npm install
    fi
    exit 1
fi
