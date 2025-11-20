#!/bin/bash

# Linux 服务器脚本：更新 frontend 代码
# 使用方法：bash update-frontend.sh [method]
# method: git (默认), local

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

METHOD=${1:-git}
PROJECT_DIR="$HOME/apps/quiz-system"
BACKUP_DIR="$HOME/backups/frontend"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${GREEN}🚀 开始更新 frontend 代码...${NC}"
echo ""

# 检查项目目录
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ 错误：项目目录不存在：$PROJECT_DIR${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

# 方法 1：从 Git 更新（推荐）
if [ "$METHOD" = "git" ]; then
    echo -e "${CYAN}📦 方法：Git 更新${NC}"
    echo ""
    
    # 备份当前版本
    echo -e "${YELLOW}💾 备份当前版本...${NC}"
    mkdir -p "$BACKUP_DIR"
    if [ -d "frontend" ]; then
        tar -czf "$BACKUP_DIR/frontend-backup-$TIMESTAMP.tar.gz" frontend/ 2>/dev/null || true
        echo -e "${GREEN}✅ 备份完成：$BACKUP_DIR/frontend-backup-$TIMESTAMP.tar.gz${NC}"
    fi
    
    # 拉取最新代码
    echo -e "${YELLOW}📥 拉取最新代码...${NC}"
    git pull origin main || git pull origin master
    echo -e "${GREEN}✅ 代码更新完成${NC}"
    
    # 安装依赖
    echo -e "${YELLOW}📦 安装依赖...${NC}"
    cd frontend
    npm install
    echo -e "${GREEN}✅ 依赖安装完成${NC}"
    
    # 构建项目
    echo -e "${YELLOW}🔨 构建项目...${NC}"
    npm run build
    echo -e "${GREEN}✅ 构建完成${NC}"
    
    # 重启服务
    echo -e "${YELLOW}🔄 重启服务...${NC}"
    cd ..
    if command -v pm2 &> /dev/null; then
        pm2 restart quiz-system-backend 2>/dev/null || echo "PM2 服务未运行"
    fi
    
    if command -v nginx &> /dev/null; then
        sudo systemctl reload nginx 2>/dev/null || echo "Nginx 重载失败"
    fi
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✨ Frontend 更新完成！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""

# 方法 2：从本地压缩包更新
elif [ "$METHOD" = "local" ]; then
    echo -e "${CYAN}📦 方法：本地压缩包更新${NC}"
    echo ""
    
    # 查找最新的压缩包
    ARCHIVE=$(ls -t ~/frontend-*.tar.gz 2>/dev/null | head -1)
    
    if [ -z "$ARCHIVE" ]; then
        echo -e "${RED}❌ 错误：未找到 frontend 压缩包${NC}"
        echo "请先使用 scp 上传压缩包到 ~/ 目录"
        exit 1
    fi
    
    echo -e "${YELLOW}📦 找到压缩包：$ARCHIVE${NC}"
    
    # 备份当前版本
    echo -e "${YELLOW}💾 备份当前版本...${NC}"
    mkdir -p "$BACKUP_DIR"
    if [ -d "frontend" ]; then
        mv frontend "frontend.backup.$TIMESTAMP"
        echo -e "${GREEN}✅ 备份完成：frontend.backup.$TIMESTAMP${NC}"
    fi
    
    # 解压新文件
    echo -e "${YELLOW}📂 解压文件...${NC}"
    tar -xzf "$ARCHIVE" -C "$PROJECT_DIR/"
    echo -e "${GREEN}✅ 解压完成${NC}"
    
    # 清理压缩包
    echo -e "${YELLOW}🗑️  清理压缩包...${NC}"
    rm "$ARCHIVE"
    
    # 安装依赖
    echo -e "${YELLOW}📦 安装依赖...${NC}"
    cd frontend
    npm install
    echo -e "${GREEN}✅ 依赖安装完成${NC}"
    
    # 构建项目
    echo -e "${YELLOW}🔨 构建项目...${NC}"
    npm run build
    echo -e "${GREEN}✅ 构建完成${NC}"
    
    # 重启服务
    echo -e "${YELLOW}🔄 重启服务...${NC}"
    cd ..
    if command -v pm2 &> /dev/null; then
        pm2 restart quiz-system-backend 2>/dev/null || echo "PM2 服务未运行"
    fi
    
    if command -v nginx &> /dev/null; then
        sudo systemctl reload nginx 2>/dev/null || echo "Nginx 重载失败"
    fi
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✨ Frontend 更新完成！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""

else
    echo -e "${RED}❌ 错误：未知的更新方法：$METHOD${NC}"
    echo "可用方法：git, local"
    exit 1
fi

# 显示构建结果
echo -e "${CYAN}📊 构建结果：${NC}"
ls -lh frontend/dist/ | head -10

echo ""
echo -e "${CYAN}📝 服务状态：${NC}"
if command -v pm2 &> /dev/null; then
    pm2 status
fi

echo ""
echo -e "${YELLOW}💡 提示：${NC}"
echo "  - 备份位置：$BACKUP_DIR/"
echo "  - 如需回滚，运行：tar -xzf $BACKUP_DIR/frontend-backup-$TIMESTAMP.tar.gz"
echo "  - 查看日志：pm2 logs quiz-system-backend"
echo ""
