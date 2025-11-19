# Windows 批处理脚本使用指南

本项目提供了一套 Windows 批处理脚本，用于快速管理开发服务。

## 📋 可用脚本

### 核心脚本

### 1. `start-services.bat` - 启动所有服务
**功能：**
- 自动检查 Node.js 是否安装
- 检查 MongoDB 运行状态
- 首次运行时自动安装依赖
- 启动后端服务（端口 5000）
- 启动前端服务（端口 3000）
- 自动在浏览器中打开应用

**使用方法：**
```bash
# 双击运行或在命令行中执行
start-services.bat
```

**注意事项：**
- 会打开两个新的命令行窗口（后端和前端）
- 请保持这些窗口运行
- 首次运行可能需要较长时间安装依赖

---

### 2. `stop-services.bat` - 停止服务
**功能：**
- 停止前端服务（端口 3000）
- 停止后端服务（端口 5000）
- 关闭相关的命令行窗口
- 清理所有相关进程

**使用方法：**
```bash
# 双击运行或在命令行中执行
stop-services.bat
```

**注意事项：**
- 会强制终止所有相关进程
- 确保已保存所有工作

---

### 3. `restart-services.bat` - 重启服务
**功能：**
- 先停止所有服务
- 等待 3 秒
- 重新启动所有服务

**使用方法：**
```bash
# 双击运行或在命令行中执行
restart-services.bat
```

**适用场景：**
- 修改了配置文件后
- 遇到服务异常时
- 清除速率限制时

---

### 4. `check-status.bat` - 检查服务状态
**功能：**
- 检查 Node.js 安装状态
- 检查 npm 版本
- 检查 MongoDB 运行状态
- 检查后端服务状态（端口 5000）
- 检查前端服务状态（端口 3000）
- 检查依赖安装状态

**使用方法：**
```bash
# 双击运行或在命令行中执行
check-status.bat
```

**输出示例：**
```
📦 Node.js:
   ✅ 已安装 v18.17.0

📦 npm:
   ✅ 已安装 v9.6.7

📊 MongoDB:
   ✅ 正在运行

🚀 后端服务 (端口 5000):
   ✅ 正在运行
   📍 PID: 12345

🎨 前端服务 (端口 3000):
   ✅ 正在运行
   📍 PID: 67890
```

---

### MongoDB 管理脚本

### 5. `start-mongodb.bat` - 启动 MongoDB
**功能：**
- 检查 MongoDB 是否已运行
- 自动查找 MongoDB 安装路径
- 创建数据目录
- 启动 MongoDB 服务或进程
- 提供 MongoDB Atlas 使用指南

**使用方法：**
```bash
# 双击运行或在命令行中执行
start-mongodb.bat
```

**注意事项：**
- 支持 MongoDB 4.4、5.0、6.0、7.0 版本
- 数据存储在项目根目录的 `data/db` 文件夹
- 默认端口：27017

---

### 6. `stop-mongodb.bat` - 停止 MongoDB
**功能：**
- 检查 MongoDB 运行状态
- 停止 MongoDB 服务
- 清理 MongoDB 进程

**使用方法：**
```bash
# 双击运行或在命令行中执行
stop-mongodb.bat
```

---

## 🚀 快速开始

### 首次使用
1. 确保已安装 Node.js
2. 双击运行 `start-services.bat`
   - 脚本会自动检测并启动 MongoDB（如果已安装）
   - 如果未安装 MongoDB，会提供安装指南
3. 等待依赖安装和服务启动
4. 浏览器会自动打开 http://localhost:3000

**MongoDB 选项：**
- **本地安装**：脚本会自动启动
- **MongoDB Atlas**：在 `backend/.env` 中配置连接字符串
- **手动管理**：使用 `start-mongodb.bat` 和 `stop-mongodb.bat`

### 日常使用
```bash
# 启动服务
start-services.bat

# 检查状态
check-status.bat

# 停止服务
stop-services.bat

# 重启服务（修改配置后）
restart-services.bat
```

---

## ⚠️ 常见问题

### 1. 端口被占用
**错误信息：** "端口 3000/5000 已被占用"

**解决方法：**
```bash
# 运行停止脚本
stop-services.bat

# 或手动查找并终止进程
netstat -ano | findstr :3000
taskkill /F /PID <进程ID>
```

### 2. MongoDB 未运行
**错误信息：** "⚠️ 警告: MongoDB 未运行"

**解决方法：**
- 启动本地 MongoDB 服务
- 或使用 MongoDB Atlas（云数据库）
- 修改 `backend/.env` 中的数据库连接字符串

### 3. 依赖安装失败
**解决方法：**
```bash
# 手动安装后端依赖
cd backend
npm install

# 手动安装前端依赖
cd frontend
npm install
```

### 4. 权限不足
**解决方法：**
- 右键点击批处理文件
- 选择"以管理员身份运行"

---

## 🔧 高级用法

### 修改端口
如需修改默认端口，编辑以下文件：

**后端端口（默认 5000）：**
- 文件：`backend/.env`
- 变量：`PORT=5000`

**前端端口（默认 3000）：**
- 文件：`frontend/vite.config.ts`
- 配置：`server.port: 3000`

修改后需要更新批处理脚本中的端口号。

### 自定义启动参数
编辑 `start-services.bat`，修改启动命令：

```batch
REM 后端开发模式
start "Quiz System - Backend" cmd /k "npm run dev"

REM 前端开发模式
start "Quiz System - Frontend" cmd /k "npm run dev"
```

---

## 📝 脚本维护

### 文件位置
所有批处理脚本位于项目根目录：
```
project-root/
├── start-services.bat
├── stop-services.bat
├── restart-services.bat
├── check-status.bat
└── BATCH_SCRIPTS_GUIDE.md
```

### 编辑脚本
使用任何文本编辑器打开 `.bat` 文件即可编辑。

**注意：**
- 保存时使用 UTF-8 编码
- 保持 `@echo off` 和 `chcp 65001` 在文件开头
- 测试修改后的脚本

---

## 💡 提示

1. **保持窗口打开**：启动服务后会打开两个命令行窗口，不要关闭它们
2. **查看日志**：在命令行窗口中可以看到实时日志
3. **快速停止**：在任一服务窗口中按 `Ctrl+C` 可停止该服务
4. **定期检查**：使用 `check-status.bat` 确认服务运行正常
5. **遇到问题**：先尝试 `restart-services.bat` 重启服务

---

## 🔗 相关文档

- [快速开始指南](QUICK_START.md)
- [测试账号](TEST_ACCOUNTS.md)
- [故障排除](TROUBLESHOOTING.md)
- [速率限制说明](backend/RATE_LIMIT_INFO.md)
