# 多学生共同答题系统

一个支持教师创建选择题、创建测验；学生在线答题、实时查看结果和教师端统计分析学生答题情况的在线答题平台。

## 功能特性

- 🎯 教师题目管理：创建、编辑、删除选择题
- 📝 学生在线答题：响应式答题界面
- 📊 实时结果反馈：即时显示答题结果和统计
- 📱 移动端适配：支持手机和平板设备
- 🔐 用户认证：教师和学生角色权限管理
- 📈 数据分析：详细的答题统计和分析 AI题目解答

## 技术栈

### 前端
- React 18 + TypeScript
- Vite (构建工具)
- Tailwind CSS (样式)
- React Router (路由)
- Zustand (状态管理)
- Axios (HTTP 客户端)

### 后端
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT (身份认证)
- Helmet (安全)

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- MongoDB >= 5.0
- npm >= 8.0.0

### 安装依赖
```bash
npm run install:all
```

### 配置环境变量
```bash
cp backend/.env.example backend/.env
# 编辑 backend/.env 文件，配置数据库连接等信息
```

### 启动开发服务器

#### Windows 用户（推荐）
使用一键启动脚本：
```bash
# 启动所有服务（包括 MongoDB）
start-services.bat

# 检查服务状态
check-status.bat

# 测试 MongoDB 连接
test-mongodb.bat

# 停止所有服务
stop-services.bat

# 重启服务
restart-services.bat
```

**遇到 MongoDB 连接错误？**
- 查看 [MongoDB 连接修复指南](FIX_MONGODB_CONNECTION.md)
- 或运行 `test-mongodb.bat` 进行诊断

详细说明请查看 [批处理脚本使用指南](BATCH_SCRIPTS_GUIDE.md)

#### 手动启动
```bash
npm run dev
```

- 前端: http://localhost:3000
- 后端: http://localhost:5000

## 项目结构

```
├── frontend/          # React 前端应用
├── backend/           # Node.js 后端 API
├── package.json       # 根项目配置
└── README.md         # 项目说明
```

## 生产环境部署

### 阿里云部署

本项目提供完整的阿里云部署方案，支持一键部署到 Alibaba Cloud Linux 服务器。

#### 快速开始

```bash
# 1. 初始化服务器（首次部署）
sudo bash setup-aliyun-server.sh

# 2. 部署应用
bash deploy-aliyun.sh
```

#### 部署文档

- 📚 [阿里云部署完整指南](ALIYUN_DEPLOYMENT_GUIDE.md) - 详细的部署步骤和配置说明
- 🚀 [快速开始指南](ALIYUN_QUICK_START.md) - 10分钟快速部署
- ✅ [部署检查清单](DEPLOYMENT_CHECKLIST.md) - 确保部署万无一失

#### 部署脚本

- `setup-aliyun-server.sh` - 服务器环境初始化脚本
- `deploy-aliyun.sh` - 应用部署和更新脚本
- `ecosystem.config.js` - PM2 进程管理配置
- `nginx.conf.template` - Nginx 配置模板

#### 技术栈

- **服务器**: Alibaba Cloud Linux
- **Web服务器**: Nginx
- **进程管理**: PM2
- **数据库**: MongoDB
- **SSL证书**: Let's Encrypt / 阿里云SSL

### 其他云平台

项目也可以部署到其他云平台（AWS、腾讯云、华为云等），请参考阿里云部署指南进行相应调整。