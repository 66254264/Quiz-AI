# 阿里云服务器部署指南

本指南详细说明如何将多学生答题系统部署到阿里云 Alibaba Cloud Linux 服务器上。

## 目录
- [服务器要求](#服务器要求)
- [部署前准备](#部署前准备)
- [安装依赖环境](#安装依赖环境)
- [部署应用](#部署应用)
- [配置 Nginx](#配置-nginx)
- [配置 PM2](#配置-pm2)
- [配置防火墙](#配置防火墙)
- [SSL 证书配置](#ssl-证书配置)
- [常见问题](#常见问题)

---

## 服务器要求

### 最低配置
- CPU: 2核
- 内存: 4GB
- 硬盘: 40GB
- 操作系统: Alibaba Cloud Linux 2/3
- 带宽: 1Mbps（建议 3Mbps 以上）

### 推荐配置
- CPU: 4核
- 内存: 8GB
- 硬盘: 100GB SSD
- 带宽: 5Mbps

---

## 部署前准备

### 1. 连接到服务器
```bash
ssh root@your-server-ip
```

### 2. 更新系统
```bash
yum update -y
```

### 3. 创建部署用户（推荐）
```bash
# 创建用户
useradd -m -s /bin/bash deploy

# 设置密码
passwd deploy

# 添加 sudo 权限
echo "deploy ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# 切换到 deploy 用户
su - deploy
```

---

## 安装依赖环境

### 1. 安装 Node.js 18+

```bash
# 使用 NodeSource 仓库安装 Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 验证安装
node --version  # 应该显示 v18.x.x
npm --version
```

### 2. 安装 MongoDB

```bash
# 添加 MongoDB 仓库
sudo tee /etc/yum.repos.d/mongodb-org-6.0.repo << EOF
[mongodb-org-6.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/6.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-6.0.asc
EOF

# 安装 MongoDB
sudo yum install -y mongodb-org

# 启动 MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# 验证安装
sudo systemctl status mongod
mongosh --version
```

### 3. 安装 Nginx

```bash
# 安装 Nginx
sudo yum install -y nginx

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 验证安装
nginx -v
```

### 4. 安装 PM2（进程管理器）

```bash
# 全局安装 PM2
sudo npm install -g pm2

# 验证安装
pm2 --version
```

### 5. 安装 Git

```bash
sudo yum install -y git
git --version
```

---

## 部署应用

### 1. 克隆项目代码

```bash
# 创建项目目录
mkdir -p ~/apps
cd ~/apps

# 克隆代码（替换为你的仓库地址）
git clone <your-repository-url> quiz-system
cd quiz-system
```

### 2. 安装项目依赖

```bash
# 安装所有依赖
npm run install:all
```

### 3. 配置环境变量

#### 后端环境变量
```bash
# 创建生产环境配置
cat > backend/.env.production << 'EOF'
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/quiz-system

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=30d

# CORS Configuration
CORS_ORIGIN=https://your-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# AI Configuration (豆包API)
DOUBAO_API_URL=https://ark.cn-beijing.volces.com/api/v3/chat/completions
DOUBAO_API_KEY=your-doubao-api-key
DOUBAO_MODEL=ep-20251119102644-bsgsx
EOF

# 复制为 .env
cp backend/.env.production backend/.env
```

**重要：** 请修改以下配置：
- `JWT_SECRET`: 生成强密码（可使用 `openssl rand -base64 32`）
- `JWT_REFRESH_SECRET`: 生成另一个强密码
- `CORS_ORIGIN`: 改为你的域名
- `DOUBAO_API_KEY`: 你的豆包 API 密钥

#### 前端环境变量
```bash
# 创建生产环境配置
cat > frontend/.env.production << 'EOF'
# 生产环境配置
VITE_API_URL=https://your-domain.com/api
EOF
```

**重要：** 将 `your-domain.com` 替换为你的实际域名

### 4. 构建项目

```bash
# 构建前端和后端
npm run build

# 验证构建结果
ls -la backend/dist
ls -la frontend/dist
```

---

## 配置 Nginx

### 1. 创建 Nginx 配置文件

```bash
sudo tee /etc/nginx/conf.d/quiz-system.conf << 'EOF'
# 后端 API 服务器
upstream backend {
    server 127.0.0.1:5000;
    keepalive 64;
}

# HTTP 服务器（重定向到 HTTPS）
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # 用于 Let's Encrypt 验证
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # 重定向到 HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS 服务器
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL 证书配置（稍后配置）
    # ssl_certificate /etc/nginx/ssl/fullchain.pem;
    # ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    
    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # 前端静态文件
    root /home/deploy/apps/quiz-system/frontend/dist;
    index index.html;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
    
    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 后端 API 代理
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
```

**重要：** 将 `your-domain.com` 替换为你的实际域名

### 2. 测试并重启 Nginx

```bash
# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

---

## 配置 PM2

### 1. 创建 PM2 配置文件

```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'quiz-system-backend',
    script: './backend/dist/server.js',
    cwd: '/home/deploy/apps/quiz-system',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/backend-error.log',
    out_file: './logs/backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10
  }]
};
EOF
```

### 2. 启动应用

```bash
# 创建日志目录
mkdir -p logs

# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs quiz-system-backend

# 设置开机自启
pm2 startup
pm2 save
```

### 3. PM2 常用命令

```bash
# 重启应用
pm2 restart quiz-system-backend

# 停止应用
pm2 stop quiz-system-backend

# 查看详细信息
pm2 show quiz-system-backend

# 监控
pm2 monit

# 查看日志
pm2 logs quiz-system-backend --lines 100
```

---

## 配置防火墙

### 1. 配置阿里云安全组

登录阿里云控制台，配置安全组规则：

| 规则方向 | 协议类型 | 端口范围 | 授权对象 | 说明 |
|---------|---------|---------|---------|------|
| 入方向 | TCP | 22 | 你的IP/0.0.0.0/0 | SSH |
| 入方向 | TCP | 80 | 0.0.0.0/0 | HTTP |
| 入方向 | TCP | 443 | 0.0.0.0/0 | HTTPS |

### 2. 配置系统防火墙（firewalld）

```bash
# 启动防火墙
sudo systemctl start firewalld
sudo systemctl enable firewalld

# 开放端口
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh

# 重载配置
sudo firewall-cmd --reload

# 查看规则
sudo firewall-cmd --list-all
```

---

## SSL 证书配置

### 方式一：使用 Let's Encrypt（免费，推荐）

```bash
# 安装 Certbot
sudo yum install -y certbot python3-certbot-nginx

# 创建证书目录
sudo mkdir -p /var/www/certbot

# 获取证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期
sudo certbot renew --dry-run

# 添加自动续期任务
echo "0 3 * * * root certbot renew --quiet" | sudo tee -a /etc/crontab
```

### 方式二：使用阿里云 SSL 证书

1. 在阿里云控制台申请免费 SSL 证书
2. 下载证书文件（Nginx 格式）
3. 上传到服务器：

```bash
# 创建证书目录
sudo mkdir -p /etc/nginx/ssl

# 上传证书文件
sudo scp your-cert.pem root@your-server-ip:/etc/nginx/ssl/fullchain.pem
sudo scp your-key.pem root@your-server-ip:/etc/nginx/ssl/privkey.pem

# 设置权限
sudo chmod 600 /etc/nginx/ssl/*.pem
```

4. 取消注释 Nginx 配置中的 SSL 证书行：

```bash
sudo nano /etc/nginx/conf.d/quiz-system.conf
# 取消注释：
# ssl_certificate /etc/nginx/ssl/fullchain.pem;
# ssl_certificate_key /etc/nginx/ssl/privkey.pem;
```

5. 重启 Nginx：

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## 部署脚本

创建自动化部署脚本：

```bash
cat > deploy.sh << 'EOF'
#!/bin/bash

echo "🚀 开始部署..."

# 进入项目目录
cd ~/apps/quiz-system

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 安装依赖
echo "📦 安装依赖..."
npm run install:all

# 构建项目
echo "🔨 构建项目..."
npm run build

# 重启后端服务
echo "🔄 重启后端服务..."
pm2 restart quiz-system-backend

# 重启 Nginx
echo "🔄 重启 Nginx..."
sudo systemctl reload nginx

echo "✅ 部署完成！"
pm2 status
EOF

chmod +x deploy.sh
```

使用部署脚本：
```bash
./deploy.sh
```

---

## 数据库备份

### 1. 创建备份脚本

```bash
cat > backup-mongodb.sh << 'EOF'
#!/bin/bash

# 配置
BACKUP_DIR="/home/deploy/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="quiz-system"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
mongodump --db=$DB_NAME --out=$BACKUP_DIR/$DATE

# 压缩备份
cd $BACKUP_DIR
tar -czf $DATE.tar.gz $DATE
rm -rf $DATE

# 删除 7 天前的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "✅ 数据库备份完成: $BACKUP_DIR/$DATE.tar.gz"
EOF

chmod +x backup-mongodb.sh
```

### 2. 设置定时备份

```bash
# 添加定时任务（每天凌晨 2 点备份）
crontab -e

# 添加以下行：
0 2 * * * /home/deploy/apps/quiz-system/backup-mongodb.sh >> /home/deploy/logs/backup.log 2>&1
```

---

## 监控和日志

### 1. 查看应用日志

```bash
# PM2 日志
pm2 logs quiz-system-backend

# Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# MongoDB 日志
sudo tail -f /var/log/mongodb/mongod.log
```

### 2. 系统监控

```bash
# 查看系统资源
htop

# 查看磁盘使用
df -h

# 查看内存使用
free -h

# 查看进程
pm2 monit
```

---

## 常见问题

### 1. 端口被占用

```bash
# 查看端口占用
sudo netstat -tlnp | grep :5000

# 杀死进程
sudo kill -9 <PID>
```

### 2. MongoDB 连接失败

```bash
# 检查 MongoDB 状态
sudo systemctl status mongod

# 重启 MongoDB
sudo systemctl restart mongod

# 查看日志
sudo tail -f /var/log/mongodb/mongod.log
```

### 3. Nginx 502 错误

```bash
# 检查后端是否运行
pm2 status

# 检查 Nginx 配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

### 4. 前端页面空白

```bash
# 检查构建文件
ls -la frontend/dist

# 检查 Nginx 配置中的 root 路径
sudo nginx -t

# 查看浏览器控制台错误
```

### 5. 内存不足

```bash
# 创建 swap 文件（2GB）
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 永久启用
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 性能优化

### 1. 启用 HTTP/2

已在 Nginx 配置中启用：`listen 443 ssl http2;`

### 2. 启用 Gzip 压缩

已在 Nginx 配置中启用

### 3. 配置 CDN（可选）

使用阿里云 CDN 加速静态资源：
1. 在阿里云控制台开通 CDN
2. 添加加速域名
3. 配置源站为你的服务器 IP
4. 更新前端 API 地址

### 4. 数据库索引优化

```bash
# 连接到 MongoDB
mongosh

# 切换数据库
use quiz-system

# 创建索引
db.users.createIndex({ email: 1 }, { unique: true })
db.quizzes.createIndex({ teacherId: 1 })
db.questions.createIndex({ quizId: 1 })
```

---

## 更新应用

```bash
# 使用部署脚本
./deploy.sh

# 或手动更新
cd ~/apps/quiz-system
git pull
npm run install:all
npm run build
pm2 restart quiz-system-backend
sudo systemctl reload nginx
```

---

## 安全建议

1. ✅ 定期更新系统和依赖包
2. ✅ 使用强密码和 SSH 密钥认证
3. ✅ 配置防火墙，只开放必要端口
4. ✅ 启用 HTTPS
5. ✅ 定期备份数据库
6. ✅ 监控服务器资源和日志
7. ✅ 使用非 root 用户运行应用
8. ✅ 配置 fail2ban 防止暴力破解

---

## 技术支持

如遇到问题，请检查：
1. 服务器日志：`pm2 logs`
2. Nginx 日志：`/var/log/nginx/`
3. MongoDB 日志：`/var/log/mongodb/`
4. 系统日志：`journalctl -xe`

---

**部署完成后，访问 https://your-domain.com 即可使用系统！** 🎉
