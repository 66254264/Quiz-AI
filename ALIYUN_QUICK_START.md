# 阿里云部署快速开始

这是一个快速部署指南，帮助你在 10 分钟内将项目部署到阿里云服务器。

## 前置条件

- ✅ 已购买阿里云 ECS 服务器（Alibaba Cloud Linux）
- ✅ 已配置安全组（开放 22、80、443 端口）
- ✅ 已有域名并解析到服务器 IP
- ✅ 可以通过 SSH 连接到服务器

## 快速部署步骤

### 第一步：初始化服务器（首次部署）

```bash
# 1. 连接到服务器
ssh root@your-server-ip

# 2. 下载初始化脚本
wget https://raw.githubusercontent.com/your-repo/setup-aliyun-server.sh
# 或者手动上传 setup-aliyun-server.sh 文件

# 3. 运行初始化脚本
sudo bash setup-aliyun-server.sh

# 4. 切换到 deploy 用户
su - deploy
```

### 第二步：部署项目

```bash
# 1. 克隆项目代码
cd ~/apps
git clone <your-repository-url> quiz-system
cd quiz-system

# 2. 配置环境变量
nano backend/.env
```

编辑 `backend/.env`，修改以下配置：

```env
# 生产环境配置
NODE_ENV=production
PORT=5000

# 数据库
MONGODB_URI=mongodb://localhost:27017/quiz-system

# JWT 密钥（必须修改！）
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this

# CORS（改为你的域名）
CORS_ORIGIN=https://your-domain.com

# 豆包 API
DOUBAO_API_KEY=your-doubao-api-key
```

创建前端生产环境配置：

```bash
nano frontend/.env.production
```

```env
VITE_API_URL=https://your-domain.com/api
```

```bash
# 3. 运行部署脚本
bash deploy-aliyun.sh
```

### 第三步：配置 Nginx

```bash
# 1. 复制 Nginx 配置
sudo cp nginx.conf.template /etc/nginx/conf.d/quiz-system.conf

# 2. 编辑配置文件
sudo nano /etc/nginx/conf.d/quiz-system.conf

# 将所有 your-domain.com 替换为你的实际域名
# 将 /home/deploy/apps/quiz-system 替换为实际路径（如果不同）

# 3. 测试配置
sudo nginx -t

# 4. 重启 Nginx
sudo systemctl restart nginx
```

### 第四步：配置 SSL 证书

```bash
# 使用 Let's Encrypt 免费证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 按提示输入邮箱并同意条款
```

### 第五步：验证部署

```bash
# 1. 检查服务状态
pm2 status

# 2. 查看日志
pm2 logs quiz-system-backend --lines 50

# 3. 测试 API
curl https://your-domain.com/api/health

# 4. 访问网站
# 在浏览器打开：https://your-domain.com
```

## 完成！🎉

现在你的应用已经成功部署到阿里云服务器上了！

---

## 常用命令

### 服务管理

```bash
# 查看服务状态
pm2 status

# 重启后端
pm2 restart quiz-system-backend

# 查看日志
pm2 logs quiz-system-backend

# 停止服务
pm2 stop quiz-system-backend

# 启动服务
pm2 start ecosystem.config.js
```

### 更新应用

```bash
# 使用部署脚本（推荐）
cd ~/apps/quiz-system
bash deploy-aliyun.sh

# 或手动更新
git pull
npm run install:all
npm run build
pm2 restart quiz-system-backend
sudo systemctl reload nginx
```

### 查看日志

```bash
# 应用日志
pm2 logs quiz-system-backend

# Nginx 访问日志
sudo tail -f /var/log/nginx/quiz-system-access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/quiz-system-error.log

# MongoDB 日志
sudo tail -f /var/log/mongodb/mongod.log
```

### 数据库管理

```bash
# 连接到 MongoDB
mongosh

# 切换数据库
use quiz-system

# 查看集合
show collections

# 备份数据库
mongodump --db=quiz-system --out=/home/deploy/backups/mongodb/$(date +%Y%m%d)

# 恢复数据库
mongorestore --db=quiz-system /home/deploy/backups/mongodb/20231120/quiz-system
```

---

## 故障排查

### 问题 1：无法访问网站

```bash
# 检查 Nginx 状态
sudo systemctl status nginx

# 检查 Nginx 配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

### 问题 2：API 502 错误

```bash
# 检查后端服务
pm2 status

# 查看后端日志
pm2 logs quiz-system-backend

# 重启后端
pm2 restart quiz-system-backend
```

### 问题 3：MongoDB 连接失败

```bash
# 检查 MongoDB 状态
sudo systemctl status mongod

# 重启 MongoDB
sudo systemctl restart mongod

# 查看日志
sudo tail -f /var/log/mongodb/mongod.log
```

### 问题 4：端口被占用

```bash
# 查看端口占用
sudo netstat -tlnp | grep :5000

# 杀死进程
sudo kill -9 <PID>
```

---

## 安全建议

1. ✅ 修改 SSH 默认端口
2. ✅ 禁用 root 远程登录
3. ✅ 使用 SSH 密钥认证
4. ✅ 配置防火墙
5. ✅ 定期更新系统
6. ✅ 定期备份数据库
7. ✅ 使用强密码
8. ✅ 启用 HTTPS

---

## 性能优化

### 1. 启用 Redis 缓存（可选）

```bash
# 安装 Redis
sudo yum install -y redis
sudo systemctl start redis
sudo systemctl enable redis

# 在后端代码中配置 Redis
```

### 2. 配置 CDN（推荐）

使用阿里云 CDN 加速静态资源：
1. 在阿里云控制台开通 CDN
2. 添加加速域名
3. 配置源站
4. 更新前端配置

### 3. 数据库优化

```bash
# 连接到 MongoDB
mongosh

# 创建索引
use quiz-system
db.users.createIndex({ email: 1 }, { unique: true })
db.quizzes.createIndex({ teacherId: 1 })
db.questions.createIndex({ quizId: 1 })
db.quizSessions.createIndex({ studentId: 1, quizId: 1 })
```

---

## 监控和告警

### 1. 使用 PM2 监控

```bash
# 实时监控
pm2 monit

# 查看详细信息
pm2 show quiz-system-backend
```

### 2. 配置阿里云监控

1. 登录阿里云控制台
2. 进入云监控服务
3. 配置 ECS 监控
4. 设置告警规则（CPU、内存、磁盘）

---

## 备份策略

### 自动备份脚本

```bash
# 创建备份脚本
cat > ~/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="$HOME/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
mongodump --db=quiz-system --out=$BACKUP_DIR/$DATE
tar -czf $BACKUP_DIR/$DATE.tar.gz -C $BACKUP_DIR $DATE
rm -rf $BACKUP_DIR/$DATE
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x ~/backup.sh

# 添加定时任务（每天凌晨 2 点）
crontab -e
# 添加：0 2 * * * /home/deploy/backup.sh
```

---

## 更多帮助

- 📚 详细部署指南：[ALIYUN_DEPLOYMENT_GUIDE.md](ALIYUN_DEPLOYMENT_GUIDE.md)
- 🔧 批处理脚本：[BATCH_SCRIPTS_GUIDE.md](BATCH_SCRIPTS_GUIDE.md)
- 📖 项目文档：[README.md](README.md)

---

**祝部署顺利！** 🚀
