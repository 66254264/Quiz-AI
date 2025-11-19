# 重启服务指南

## 问题：AI分析功能不工作

### 原因
修改了环境变量（.env文件）后，需要重启后端服务才能生效。

### 解决步骤

#### 步骤1：停止所有服务

打开命令提示符（CMD）或PowerShell，执行：

```bash
taskkill /F /IM node.exe
```

这会停止所有Node.js进程（包括前端和后端）。

#### 步骤2：启动后端服务

**方式A：使用开发模式（推荐，支持热重载）**

```bash
cd backend
npm run dev
```

或者双击运行：`restart-backend-dev.bat`

**方式B：使用生产模式**

```bash
cd backend
npm run build
npm start
```

或者双击运行：`restart-backend.bat`

#### 步骤3：启动前端服务

打开新的命令提示符窗口：

```bash
cd frontend
npm run dev
```

#### 步骤4：验证服务

1. **检查后端**
   - 访问：http://localhost:5000/health
   - 应该看到：`{"status":"OK","message":"Quiz System API is running",...}`

2. **检查前端**
   - 访问：http://localhost:3000
   - 应该能正常打开登录页面

#### 步骤5：测试AI分析

1. 登录教师账号
2. 进入"统计分析"页面
3. 选择一个有提交数据的测验
4. 切换到"题目分析"标签
5. 点击任意题目的"AI解题分析"按钮
6. 等待3-10秒
7. 应该看到AI分析结果显示在题目下方

### 查看日志

**后端日志应该显示：**
```
🚀 Server is running on port 5000
✅ Connected to MongoDB
📝 收到AI分析请求
🤖 开始AI分析...
✅ AI分析成功
```

**如果看到错误：**
- 查看 `AI_ANALYSIS_TROUBLESHOOTING.md` 获取详细排查步骤

### 快速重启脚本

我已经创建了以下批处理文件方便你使用：

1. **restart-backend-dev.bat** - 重启后端开发服务
2. **restart-backend.bat** - 重启后端生产服务
3. **start-services-simple.bat** - 同时启动前后端服务

### 注意事项

1. **环境变量修改后必须重启** - 修改 `.env` 文件后，必须重启后端服务
2. **开发模式 vs 生产模式** - 开发模式支持热重载，修改代码自动生效
3. **端口占用** - 如果提示端口被占用，先执行 `taskkill /F /IM node.exe`
4. **MongoDB必须运行** - 确保MongoDB服务正在运行

### 测试API配置

运行测试脚本验证豆包API：

```bash
node backend/test-doubao-api.js
```

如果看到 "✅ API调用成功！" 说明配置正确。

### 常见问题

**Q: 重启后还是不工作？**
A: 
1. 确认 `backend/.env` 文件包含正确的API配置
2. 查看后端日志中的环境变量检查部分
3. 运行 `node backend/test-doubao-api.js` 测试API

**Q: 如何确认后端已经重启？**
A: 
1. 查看后端日志的启动时间
2. 访问 http://localhost:5000/health 查看时间戳
3. 后端日志应该显示 "🚀 Server is running"

**Q: 前端显示网络错误？**
A: 
1. 确认后端服务正在运行
2. 检查后端端口是否为5000
3. 查看浏览器控制台的网络请求

### 下一步

1. 执行 `taskkill /F /IM node.exe` 停止所有服务
2. 双击运行 `restart-backend-dev.bat` 启动后端
3. 在新窗口中启动前端：`cd frontend && npm run dev`
4. 测试AI分析功能
5. 如有问题，查看 `AI_ANALYSIS_TROUBLESHOOTING.md`
