#!/bin/bash

# 阿里云服务器部署脚本 - IP 访问版本
# 服务器 IP: 8.137.159.161
# 项目路径: /var/www/quiz-ai
# 使用方法：bash deploy-ip.sh

set -e

echo "🚀 开始部署多学生答题系统到阿里云服务器（IP 访问）..."
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 配置变量
PROJECT_DIR="/var/www/quiz-ai"
BACKUP_DIR="/var/backups/quiz-ai"
DATE=$(date +%Y%m%d_%H%M%S)
SERVER_IP="8.137.159.161"

# 检查是否在项目目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 错误：请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 步骤 1: 备份当前版本
echo -e "${YELLOW}📦 备份当前版本...${NC}"
if [ -d "$PROJECT_DIR/backend/dist" ] || [ -d "$PROJECT_DIR/frontend/dist" ]; then
    sudo mkdir -p "$BACKUP_DIR"
    sudo tar -czf "$BACKUP_DIR/backup-$DATE.tar.gz" -C "$PROJECT_DIR" backend/dist frontend/dist 2>/dev/null || true
    echo -e "${GREEN}✅ 备份完成: $BACKUP_DIR/backup-$DATE.tar.gz${NC}"
else
    echo -e "${YELLOW}⚠️  首次部署，跳过备份${NC}"
fi

# 步骤 2: 检查环境变量
echo -e "${YELLOW}🔍 检查环境变量...${NC}"
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ 错误：backend/.env 文件不存在${NC}"
    echo "请先创建 backend/.env 文件并配置环境变量"
    exit 1
fi

# 检查前端环境变量中的 API URL
if [ -f "frontend/.env.production" ]; then
    if ! grep -q "VITE_API_URL=http://$SERVER_IP/api" frontend/.env.production; then
        echo -e "${YELLOW}⚠️  更新前端 API 地址...${NC}"
        echo "VITE_API_URL=http://$SERVER_IP/api" > frontend/.env.production
    fi
else
    echo -e "${YELLOW}⚠️  创建前端生产环境配置...${NC}"
    echo "VITE_API_URL=http://$SERVER_IP/api" > frontend/.env.production
fi

echo -e "${GREEN}✅ 环境变量检查完成${NC}"

# 步骤 3: 安装依赖
echo -e "${YELLOW}📦 安装依赖...${NC}"
npm run install:all
echo -e "${GREEN}✅ 依赖安装完成${NC}"

# 步骤 4: 构建项目
echo -e "${YELLOW}🔨 构建项目...${NC}"
npm run build

# 检查构建结果
if [ ! -d "backend/dist" ] || [ ! -d "frontend/dist" ]; then
    echo -e "${RED}❌ 构建失败${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 项目构建完成${NC}"

# 步骤 5: 配置 Nginx
echo -e "${YELLOW}🔧 配置 Nginx...${NC}"
if [ -f "nginx-ip.conf" ]; then
    sudo cp nginx-ip.conf /etc/nginx/conf.d/quiz-system.conf
    sudo nginx -t
    echo -e "${GREEN}✅ Nginx 配置完成${NC}"
else
    echo -e "${YELLOW}⚠️  nginx-ip.conf 不存在，跳过 Nginx 配置${NC}"
fi

# 步骤 6: 重启后端服务
echo -e "${YELLOW}🔄 重启后端服务...${NC}"
if command -v pm2 &> /dev/null; then
    cd backend
    pm2 restart quiz-system-backend 2>/dev/null || pm2 start dist/server.js --name quiz-system-backend
    pm2 save
    cd ..
    echo -e "${GREEN}✅ 后端服务已重启${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 未安装，请手动启动后端服务${NC}"
fi

# 步骤 7: 重启 Nginx
echo -e "${YELLOW}🔄 重启 Nginx...${NC}"
if command -v nginx &> /dev/null; then
    sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx 已重启${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx 未安装，跳过${NC}"
fi

# 步骤 8: 清理旧备份（保留最近 5 个）
echo -e "${YELLOW}🧹 清理旧备份...${NC}"
if [ -d "$BACKUP_DIR" ]; then
    sudo find "$BACKUP_DIR" -name "backup-*.tar.gz" -type f | sort -r | tail -n +6 | xargs sudo rm -f 2>/dev/null || true
    echo -e "${GREEN}✅ 清理完成${NC}"
fi

# 步骤 9: 显示服务状态
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

if command -v pm2 &> /dev/null; then
    echo "📊 服务状态："
    pm2 status
    echo ""
fi

echo "📝 部署信息："
echo "  - 部署时间: $DATE"
echo "  - 项目目录: $PROJECT_DIR"
echo "  - 备份位置: $BACKUP_DIR/backup-$DATE.tar.gz"
echo "  - 服务器 IP: $SERVER_IP"
echo ""

echo "🔗 访问地址："
echo "  - 前端: http://$SERVER_IP"
echo "  - 后端 API: http://$SERVER_IP/api"
echo "  - 健康检查: http://$SERVER_IP/health"
echo ""

echo "📋 常用命令："
echo "  - 查看日志: pm2 logs quiz-system-backend"
echo "  - 重启服务: pm2 restart quiz-system-backend"
echo "  - 查看状态: pm2 status"
echo "  - Nginx 日志: sudo tail -f /var/log/nginx/error.log"
echo ""

echo -e "${GREEN}✨ 部署成功！${NC}"
