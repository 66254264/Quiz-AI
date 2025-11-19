# AI分析功能故障排查指南

## 问题：点击"AI解题分析"按钮后显示"AI分析失败，请稍后重试"

### 原因分析

经过测试，豆包API配置正确且可以正常调用，问题可能是：
1. **后端服务未重启** - 修改环境变量后需要重启后端服务
2. **环境变量未加载** - 后端服务启动时没有正确读取.env文件

### 解决方案

#### 方案1：重启后端服务（推荐）

1. **停止所有Node进程**
   ```bash
   # Windows
   taskkill /F /IM node.exe
   ```

2. **使用开发模式启动后端**（会自动重启）
   ```bash
   # 双击运行
   restart-backend-dev.bat
   
   # 或手动执行
   cd backend
   npm run dev
   ```

3. **查看后端日志**
   - 确认看到 "🚀 Server is running on port 5000"
   - 确认看到 "✅ Connected to MongoDB"

4. **测试AI功能**
   - 刷新前端页面
   - 进入统计分析 > 题目分析
   - 点击"AI解题分析"按钮
   - 查看后端日志中的详细输出

#### 方案2：验证API配置

运行测试脚本验证豆包API是否正常：
```bash
node backend/test-doubao-api.js
```

如果看到 "✅ API调用成功！" 说明配置正确。

#### 方案3：检查后端日志

点击AI分析按钮后，查看后端控制台输出：

**正常情况应该看到：**
```
📝 收到AI分析请求
题目ID: 67xxxxx
测验ID: 67xxxxx
环境变量检查:
- DOUBAO_API_URL: 已配置
- DOUBAO_API_KEY: 已配置
- DOUBAO_MODEL: 已配置
✅ 题目找到: xxx
📊 统计数据: { totalAttempts: x, correctAttempts: x, correctRate: x }
🤖 开始调用AI分析...
🤖 开始AI分析...
API URL: https://ark.cn-beijing.volces.com/api/v3/chat/completions
Model: ep-20251119102644-bsgsx
API Key配置: 已配置
📤 发送请求到豆包API...
📥 收到响应: 200
✅ AI分析成功
✅ AI分析完成
```

**如果看到环境变量"未配置"：**
- 确认 `backend/.env` 文件存在且包含正确配置
- 重启后端服务
- 确保使用 `npm run dev` 或 `npm start` 启动（不要直接用node命令）

**如果看到API调用错误：**
- 检查网络连接
- 验证API Key和Endpoint ID是否正确
- 查看火山引擎控制台确认服务已激活

### 快速测试步骤

1. **停止后端**
   ```bash
   taskkill /F /IM node.exe
   ```

2. **启动后端开发模式**
   ```bash
   cd backend
   npm run dev
   ```

3. **等待启动完成**（看到 "🚀 Server is running"）

4. **刷新前端页面**

5. **测试AI分析**
   - 进入统计分析
   - 选择一个有提交数据的测验
   - 切换到"题目分析"
   - 点击任意题目的"AI解题分析"按钮

6. **观察后端日志**
   - 应该看到详细的调试信息
   - 如果成功，会显示AI返回的分析内容

### 常见错误及解决

#### 错误1：环境变量未配置
```
环境变量检查:
- DOUBAO_API_URL: 未配置
- DOUBAO_API_KEY: 未配置
- DOUBAO_MODEL: 未配置
```
**解决：** 确认 `backend/.env` 文件存在，然后重启后端服务

#### 错误2：API认证失败
```
响应状态: 401
响应数据: { "error": { "message": "Invalid API key" } }
```
**解决：** 检查API Key是否正确，重新从火山引擎控制台获取

#### 错误3：Endpoint不存在
```
响应状态: 404
响应数据: { "error": { "message": "Model not found" } }
```
**解决：** 检查Endpoint ID是否正确，确认在火山引擎控制台已创建

#### 错误4：网络超时
```
错误类型: ECONNABORTED
错误消息: timeout of 30000ms exceeded
```
**解决：** 检查网络连接，或稍后重试

### 验证配置文件

确认 `backend/.env` 包含以下内容：
```env
DOUBAO_API_URL=https://ark.cn-beijing.volces.com/api/v3/chat/completions
DOUBAO_API_KEY=你的实际API密钥
DOUBAO_MODEL=你的实际Endpoint-ID
```

### 获取支持

如果问题仍未解决：
1. 运行 `node backend/test-doubao-api.js` 并截图结果
2. 查看后端日志并复制完整错误信息
3. 检查火山引擎控制台的API调用记录
4. 确认API配额是否充足

### 开发模式 vs 生产模式

**开发模式（推荐用于调试）：**
```bash
npm run dev
```
- 使用 nodemon 自动重启
- 修改代码后自动生效
- 有详细的日志输出

**生产模式：**
```bash
npm run build
npm start
```
- 需要先编译TypeScript
- 修改代码后需要重新编译
- 性能更好但调试不便

### 下一步

1. 使用 `restart-backend-dev.bat` 重启后端
2. 刷新前端页面
3. 测试AI分析功能
4. 查看后端日志确认问题是否解决
