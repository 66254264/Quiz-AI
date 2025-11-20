# 阿里云 IP 访问部署指南

本指南适用于没有域名，仅使用 IP 地址访问的部署场景。

## 服务器信息

- **服务器 IP**: 8.137.159.161
- **系统**: Alibaba Cloud Linux
- **项目路径**: /var/www/quiz-ai

## 快速部署步骤

### 第一步：准备服务器环境

```bash
# 1. 连接到服务器
ssh root@8.137.159.161

# 2. 更新系统
yum update -y

# 3. 安装必要软件
yum install -y wget curl vim git

# 4. 安装 Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# 验证安装
node --version
npm --version

# 5. 安装 MongoDB
cat > /etc/yum.repos.d/mongodb-org-6.0.repo << 'EOF'
[mongodb-org-6.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/6.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-6.0.asc
EOF

yum install -y mongodb-org

# 启动 MongoDB
systemctl start mongod
systemctl enable mongod
systemctl status mongod

# 6. 安装 Nginx
yum install -y nginx

# 启动 Nginx
systemctl start nginx
systemctl enable nginx
systemctl status nginx

# 7. 安装 PM2
npm install -g pm2

# 8. 配置防火墙
systemctl start firewalld
systemctl enable firewalld

# 开放必要端口
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-service=ssh
firewall-cmd --reload

# 查看防火墙状态
firewall-cmd --list-all
```

### 第二步：配置阿里云安全组

1. 登录阿里云控制台
2. 进入 ECS 实例管理
3. 点击"安全组" → "配置规则"
4. 添加入方向规则：
   - **HTTP**: 端口 80，源地址 0.0.0.0/0
   - **HTTPS**: 端口 443，源地址 0.0.0.0/0（可选）
   - **SSH**: 端口 22，源地址 0.0.0.0/0（建议限制为你的 IP）

### 第三步：部署项目

```bash
# 1. 创建项目目录
mkdir -p /var/www
cd /var/www

# 2. 克隆或上传项目代码
# 方式 A：使用 Git
git clone <your-repository-url> quiz-ai

# 方式 B：使用 SCP 上传（在本地执行）
# scp -r ./quiz-ai root@8.137.159.161:/var/www/

# 3. 进入项目目录
cd /var/www/quiz-ai

# 4. 配置后端环境变量
cat > backend/.env << 'EOF'
# 生产环境配置
NODE_ENV=production
PORT=5000

# 数据库
MONGODB_URI=mongodb://localhost:27017/quiz-system

# JWT 密钥（请修改为强密码！）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS（使用 IP 地址）
CORS_ORIGIN=http://8.137.159.161

# 速率限制
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# 豆包 API（请填写你的实际配置）
DOUBAO_API_URL=https://ark.cn-beijing.volces.com/api/v3/chat/completions
DOUBAO_API_KEY=your-doubao-api-key
DOUBAO_MODEL=ep-20251119102644-bsgsx
EOF

# 5. 配置前端环境变量
cat > frontend/.env.production << 'EOF'
VITE_API_URL=http://8.137.159.161/api
EOF

# 6. 运行部署脚本
bash deploy-ip.sh
```

### 第四步：验证部署

```bash
# 1. 检查服务状态
pm2 status

# 2. 查看后端日志
pm2 logs quiz-system-backend --lines 50

# 3. 测试 API
curl http://8.137.159.161/api/health
curl http://localhost:5000/api/health

# 4. 检查 Nginx 状态
systemctl status nginx

# 5. 查看 Nginx 日志
tail -f /var/log/nginx/error.log
```

### 第五步：访问应用

在浏览器中打开：
- **前端**: http://8.137.159.161
- **后端 API**: http://8.137.159.161/api

## 配置文件说明

### 1. Nginx 配置 (`/etc/nginx/conf.d/quiz-system.conf`)

```nginx
# 后端 API 服务器
upstream backend {
    server 127.0.0.1:5000;
    keepalive 64;
}

server {
    listen 80;
    server_name 8.137.159.161;
    
    root /var/www/quiz-ai/frontend/dist;
    index index.html;
    
    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 后端 API 代理
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 2. PM2 配置 (`ecosystem.config.js`)

```javascript
module.exports = {
  apps: [{
    name: 'quiz-system-backend',
    script: './backend/dist/server.js',
    cwd: '/var/www/quiz-ai',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
```

## 常用命令

### 服务管理

```bash
# PM2 服务管理
pm2 status                          # 查看服务状态
pm2 restart quiz-system-backend     # 重启后端
pm2 stop quiz-system-backend        # 停止后端
pm2 logs quiz-system-backend        # 查看日志
pm2 monit                           # 实时监控

# Nginx 管理
sudo systemctl status nginx         # 查看状态
sudo systemctl restart nginx        # 重启
sudo systemctl reload nginx         # 重新加载配置
sudo nginx -t                       # 测试配置

# MongoDB 管理
sudo systemctl status mongod        # 查看状态
sudo systemctl restart mongod       # 重启
mongosh                             # 连接数据库
```

### 日志查看

```bash
# 应用日志
pm2 logs quiz-system-backend

# Nginx 日志
sudo tail -f /var/log/nginx/quiz-system-access.log
sudo tail -f /var/log/nginx/quiz-system-error.log

# MongoDB 日志
sudo tail -f /var/log/mongodb/mongod.log

# 系统日志
sudo journalctl -u nginx -f
sudo journalctl -u mongod -f
```

### 更新应用

```bash
# 进入项目目录
cd /var/www/quiz-ai

# 拉取最新代码
git pull

# 重新部署
bash deploy-ip.sh
```

## 故障排查

### 问题 1：无法访问网站

```bash
# 检查 Nginx 是否运行
sudo systemctl status nginx

# 检查端口是否监听
sudo netstat -tlnp | grep :80

# 检查防火墙
sudo firewall-cmd --list-all

# 检查阿里云安全组
# 登录阿里云控制台检查安全组规则
```

### 问题 2：API 502 错误

```bash
# 检查后端服务
pm2 status

# 查看后端日志
pm2 logs quiz-system-backend

# 检查后端端口
sudo netstat -tlnp | grep :5000

# 重启后端
pm2 restart quiz-system-backend
```

### 问题 3：MongoDB 连接失败

```bash
# 检查 MongoDB 状态
sudo systemctl status mongod

# 查看 MongoDB 日志
sudo tail -f /var/log/mongodb/mongod.log

# 测试连接
mongosh

# 重启 MongoDB
sudo systemctl restart mongod
```

### 问题 4：前端页面空白

```bash
# 检查前端构建文件
ls -la /var/www/quiz-ai/frontend/dist

# 检查 Nginx 配置
sudo nginx -t

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 检查文件权限
sudo chmod -R 755 /var/www/quiz-ai/frontend/dist
```

## 数据库管理

### 备份数据库

```bash
# 创建备份目录
mkdir -p /var/backups/mongodb

# 备份数据库
mongodump --db=quiz-system --out=/var/backups/mongodb/$(date +%Y%m%d)

# 压缩备份
tar -czf /var/backups/mongodb/backup-$(date +%Y%m%d).tar.gz \
  -C /var/backups/mongodb $(date +%Y%m%d)
```

### 恢复数据库

```bash
# 解压备份
tar -xzf /var/backups/mongodb/backup-20231120.tar.gz -C /tmp

# 恢复数据库
mongorestore --db=quiz-system /tmp/20231120/quiz-system
```

### 自动备份脚本

```bash
# 创建备份脚本
cat > /root/backup-mongodb.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
mongodump --db=quiz-system --out=$BACKUP_DIR/$DATE
tar -czf $BACKUP_DIR/backup-$DATE.tar.gz -C $BACKUP_DIR $DATE
rm -rf $BACKUP_DIR/$DATE
find $BACKUP_DIR -name "backup-*.tar.gz" -mtime +7 -delete
EOF

chmod +x /root/backup-mongodb.sh

# 添加定时任务（每天凌晨 2 点）
crontab -e
# 添加：0 2 * * * /root/backup-mongodb.sh
```

## 性能优化

### 1. 启用 Gzip 压缩

Nginx 配置已包含 Gzip 压缩，无需额外配置。

### 2. 配置 PM2 集群模式（可选）

```bash
# 编辑 ecosystem.config.js
nano ecosystem.config.js

# 修改为集群模式
instances: 'max',  # 使用所有 CPU 核心
exec_mode: 'cluster'

# 重启服务
pm2 restart ecosystem.config.js
```

### 3. MongoDB 索引优化

```bash
# 连接到 MongoDB
mongosh

# 切换数据库
use quiz-system

# 创建索引
db.users.createIndex({ email: 1 }, { unique: true })
db.quizzes.createIndex({ teacherId: 1 })
db.questions.createIndex({ quizId: 1 })
db.quizSessions.createIndex({ studentId: 1, quizId: 1 })
db.answers.createIndex({ sessionId: 1, questionId: 1 })
```

## 安全建议

### 1. 修改 SSH 端口

```bash
# 编辑 SSH 配置
sudo nano /etc/ssh/sshd_config

# 修改端口（例如改为 2222）
Port 2222

# 重启 SSH
sudo systemctl restart sshd

# 更新防火墙
sudo firewall-cmd --permanent --add-port=2222/tcp
sudo firewall-cmd --reload
```

### 2. 禁用 root 远程登录

```bash
# 创建普通用户
useradd -m -s /bin/bash deploy
passwd deploy

# 添加 sudo 权限
echo "deploy ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# 禁用 root 登录
sudo nano /etc/ssh/sshd_config
# 设置：PermitRootLogin no

# 重启 SSH
sudo systemctl restart sshd
```

### 3. 配置 fail2ban（防暴力破解）

```bash
# 安装 fail2ban
yum install -y fail2ban

# 启动服务
systemctl start fail2ban
systemctl enable fail2ban
```

### 4. 定期更新系统

```bash
# 手动更新
sudo yum update -y

# 自动更新（可选）
sudo yum install -y yum-cron
sudo systemctl start yum-cron
sudo systemctl enable yum-cron
```

## 监控和告警

### 1. 使用 PM2 监控

```bash
# 实时监控
pm2 monit

# 查看详细信息
pm2 show quiz-system-backend

# 设置开机自启
pm2 startup
pm2 save
```

### 2. 配置阿里云监控

1. 登录阿里云控制台
2. 进入"云监控"服务
3. 配置 ECS 监控指标
4. 设置告警规则：
   - CPU 使用率 > 80%
   - 内存使用率 > 80%
   - 磁盘使用率 > 80%
   - 网络流量异常

## 升级到 HTTPS（可选）

如果将来有域名，可以升级到 HTTPS：

```bash
# 1. 安装 Certbot
yum install -y certbot python3-certbot-nginx

# 2. 获取证书
certbot --nginx -d your-domain.com

# 3. 自动续期
echo "0 0 * * * certbot renew --quiet" | crontab -
```

## 常见问题

### Q1: 为什么使用 IP 访问而不是域名？

A: IP 访问适合以下场景：
- 测试和开发环境
- 内部系统
- 暂时没有域名
- 成本考虑

### Q2: IP 访问有什么限制？

A: 主要限制：
- 无法使用 HTTPS（需要域名）
- 不利于 SEO
- 用户体验较差（难记）
- 某些功能可能受限（如微信登录）

### Q3: 如何从 IP 访问升级到域名访问？

A: 步骤：
1. 购买域名
2. 域名解析到服务器 IP
3. 修改 Nginx 配置中的 server_name
4. 修改前后端环境变量中的 URL
5. 配置 SSL 证书
6. 重新构建和部署

## 总结

现在你的应用已经成功部署到阿里云服务器，可以通过 IP 地址访问：

- **前端**: http://8.137.159.161
- **后端 API**: http://8.137.159.161/api

记得定期备份数据库和更新系统！

---

**祝部署顺利！** 🚀
