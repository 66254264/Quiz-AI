# 阿里云部署检查清单

在部署到生产环境之前，请确保完成以下所有检查项。

## 📋 部署前检查

### 服务器准备

- [ ] 已购买阿里云 ECS 服务器
- [ ] 服务器配置满足最低要求（2核4G）
- [ ] 已配置安全组规则（开放 22、80、443 端口）
- [ ] 可以通过 SSH 连接到服务器
- [ ] 已更新系统：`sudo yum update -y`

### 域名配置

- [ ] 已购买域名
- [ ] 域名已备案（中国大陆服务器必需）
- [ ] DNS 已解析到服务器 IP
- [ ] 已测试域名解析：`ping your-domain.com`

### 代码准备

- [ ] 代码已提交到 Git 仓库
- [ ] 所有功能已测试通过
- [ ] 已修复所有已知 bug
- [ ] 代码已经过 lint 检查
- [ ] 已更新 README 文档

---

## 🔧 环境安装检查

### 基础环境

- [ ] Node.js 18+ 已安装：`node --version`
- [ ] npm 已安装：`npm --version`
- [ ] Git 已安装：`git --version`
- [ ] MongoDB 已安装：`mongod --version`
- [ ] Nginx 已安装：`nginx -v`
- [ ] PM2 已安装：`pm2 --version`

### 服务状态

- [ ] MongoDB 服务已启动：`sudo systemctl status mongod`
- [ ] MongoDB 已设置开机自启：`sudo systemctl enable mongod`
- [ ] Nginx 服务已启动：`sudo systemctl status nginx`
- [ ] Nginx 已设置开机自启：`sudo systemctl enable nginx`
- [ ] 防火墙已配置：`sudo firewall-cmd --list-all`

---

## ⚙️ 配置检查

### 后端配置

- [ ] 已创建 `backend/.env` 文件
- [ ] `NODE_ENV` 设置为 `production`
- [ ] `MONGODB_URI` 配置正确
- [ ] `JWT_SECRET` 已修改为强密码（不是默认值）
- [ ] `JWT_REFRESH_SECRET` 已修改为强密码
- [ ] `CORS_ORIGIN` 设置为正确的域名
- [ ] `DOUBAO_API_KEY` 配置正确
- [ ] 端口配置正确（默认 5000）

### 前端配置

- [ ] 已创建 `frontend/.env.production` 文件
- [ ] `VITE_API_URL` 设置为正确的 API 地址
- [ ] API 地址使用 HTTPS（生产环境）

### Nginx 配置

- [ ] 已复制 Nginx 配置文件到 `/etc/nginx/conf.d/`
- [ ] 配置文件中的域名已替换为实际域名
- [ ] 配置文件中的项目路径正确
- [ ] Nginx 配置测试通过：`sudo nginx -t`

### PM2 配置

- [ ] 已创建 `ecosystem.config.js` 文件
- [ ] 配置文件中的路径正确
- [ ] 实例数量配置合理（建议 2-4 个）

---

## 🚀 部署执行检查

### 代码部署

- [ ] 已克隆代码到服务器
- [ ] 已安装所有依赖：`npm run install:all`
- [ ] 后端构建成功：`npm run build:backend`
- [ ] 前端构建成功：`npm run build:frontend`
- [ ] 构建文件存在：`ls backend/dist` 和 `ls frontend/dist`

### 服务启动

- [ ] PM2 启动成功：`pm2 start ecosystem.config.js`
- [ ] 后端服务运行正常：`pm2 status`
- [ ] 后端日志无错误：`pm2 logs quiz-system-backend`
- [ ] PM2 已设置开机自启：`pm2 startup` 和 `pm2 save`

### Nginx 配置

- [ ] Nginx 配置已重载：`sudo systemctl reload nginx`
- [ ] Nginx 运行正常：`sudo systemctl status nginx`
- [ ] Nginx 日志无错误：`sudo tail /var/log/nginx/error.log`

---

## 🔒 SSL 证书检查

### Let's Encrypt

- [ ] Certbot 已安装
- [ ] SSL 证书已申请：`sudo certbot --nginx -d your-domain.com`
- [ ] 证书自动续期已配置
- [ ] HTTPS 访问正常

### 阿里云证书

- [ ] 已在阿里云申请 SSL 证书
- [ ] 证书文件已下载
- [ ] 证书文件已上传到服务器
- [ ] Nginx 配置中已启用 SSL
- [ ] HTTPS 访问正常

---

## ✅ 功能测试

### 基础功能

- [ ] 网站可以正常访问：`https://your-domain.com`
- [ ] HTTP 自动跳转到 HTTPS
- [ ] API 健康检查正常：`curl https://your-domain.com/api/health`
- [ ] 前端页面加载正常
- [ ] 静态资源加载正常（CSS、JS、图片）

### 用户功能

- [ ] 教师注册功能正常
- [ ] 教师登录功能正常
- [ ] 学生登录功能正常
- [ ] 创建题目功能正常
- [ ] 创建测验功能正常
- [ ] 学生答题功能正常
- [ ] 查看结果功能正常
- [ ] AI 分析功能正常

### 性能测试

- [ ] 页面加载速度正常（< 3秒）
- [ ] API 响应速度正常（< 1秒）
- [ ] 并发访问测试通过
- [ ] 内存使用正常（< 80%）
- [ ] CPU 使用正常（< 80%）

---

## 🔐 安全检查

### 服务器安全

- [ ] 已创建非 root 用户（deploy）
- [ ] SSH 密钥认证已配置
- [ ] 防火墙已启用
- [ ] 只开放必要端口（22、80、443）
- [ ] 已禁用 root 远程登录（可选）
- [ ] 已修改 SSH 默认端口（可选）

### 应用安全

- [ ] JWT 密钥使用强密码
- [ ] 数据库连接使用认证（如需要）
- [ ] API 速率限制已启用
- [ ] CORS 配置正确
- [ ] 安全头已配置（Helmet）
- [ ] 敏感信息不在代码中（使用环境变量）

### SSL 安全

- [ ] 使用 HTTPS
- [ ] SSL 证书有效
- [ ] 强制 HTTPS 重定向
- [ ] HSTS 已启用
- [ ] SSL 评级 A 或以上（可用 SSL Labs 测试）

---

## 📊 监控和日志

### 日志配置

- [ ] PM2 日志正常输出
- [ ] Nginx 访问日志正常
- [ ] Nginx 错误日志正常
- [ ] MongoDB 日志正常
- [ ] 日志目录权限正确

### 监控配置

- [ ] PM2 监控已启用：`pm2 monit`
- [ ] 阿里云监控已配置（可选）
- [ ] 告警规则已设置（可选）
- [ ] 错误追踪已配置（如 Sentry，可选）

---

## 💾 备份配置

### 数据库备份

- [ ] 备份脚本已创建
- [ ] 备份脚本可执行：`chmod +x backup.sh`
- [ ] 定时备份已配置：`crontab -l`
- [ ] 备份目录已创建
- [ ] 备份恢复已测试

### 代码备份

- [ ] 代码已推送到 Git 仓库
- [ ] 重要配置文件已备份
- [ ] 部署脚本已备份

---

## 📈 性能优化

### 前端优化

- [ ] 已启用 Gzip 压缩
- [ ] 静态资源已设置缓存
- [ ] 图片已优化
- [ ] 代码已压缩（生产构建）
- [ ] 已启用 HTTP/2

### 后端优化

- [ ] 数据库索引已创建
- [ ] API 响应已优化
- [ ] 使用 PM2 cluster 模式
- [ ] 连接池已配置

### 数据库优化

- [ ] MongoDB 索引已创建
- [ ] 查询已优化
- [ ] 连接数已配置

---

## 📝 文档更新

- [ ] README 已更新
- [ ] 部署文档已完善
- [ ] API 文档已更新
- [ ] 环境变量文档已更新
- [ ] 故障排查文档已准备

---

## 🎯 上线前最终检查

### 功能验证

- [ ] 所有核心功能已测试
- [ ] 所有页面可正常访问
- [ ] 移动端适配正常
- [ ] 浏览器兼容性测试通过

### 性能验证

- [ ] 负载测试通过
- [ ] 压力测试通过
- [ ] 内存泄漏检查通过

### 安全验证

- [ ] 安全扫描通过
- [ ] 漏洞检查通过
- [ ] 权限配置正确

### 团队准备

- [ ] 团队成员已培训
- [ ] 运维文档已准备
- [ ] 应急预案已制定
- [ ] 回滚方案已准备

---

## ✨ 上线后检查

### 立即检查（上线后 1 小时内）

- [ ] 网站可正常访问
- [ ] 所有功能正常
- [ ] 无错误日志
- [ ] 服务器资源正常
- [ ] 用户反馈正常

### 持续监控（上线后 24 小时内）

- [ ] 监控服务器资源使用
- [ ] 监控错误日志
- [ ] 监控用户反馈
- [ ] 监控性能指标
- [ ] 准备快速响应问题

---

## 📞 应急联系

### 关键人员

- 技术负责人：[姓名] [电话]
- 运维负责人：[姓名] [电话]
- 产品负责人：[姓名] [电话]

### 服务商联系

- 阿里云技术支持：95187
- 域名服务商：[联系方式]
- SSL 证书服务商：[联系方式]

---

## 🔄 回滚计划

如果部署出现严重问题，执行以下回滚步骤：

1. 停止新版本服务：`pm2 stop quiz-system-backend`
2. 恢复备份代码：`tar -xzf backup-YYYYMMDD.tar.gz`
3. 恢复数据库：`mongorestore --db=quiz-system backup/`
4. 重启服务：`pm2 restart quiz-system-backend`
5. 验证功能正常

---

**完成所有检查项后，即可正式上线！** 🚀

**部署日期：** _______________

**部署人员：** _______________

**检查人员：** _______________
