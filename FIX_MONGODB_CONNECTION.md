# 修复 MongoDB 连接错误

## 错误信息
```
Database connection failed: MongooseServerSelectionError: 
connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
```

## 问题原因
MongoDB 服务未运行或无法连接到端口 27017。

## 🔍 诊断步骤

### 1. 运行诊断脚本
```bash
test-mongodb.bat
```

这会检查：
- MongoDB 进程状态
- 端口 27017 监听状态
- MongoDB 服务状态
- 后端配置文件

---

## ✅ 解决方案

### 方案 1：启动本地 MongoDB（推荐用于开发）

#### 步骤 1：检查 MongoDB 是否已安装
```bash
# 检查服务是否存在
sc query MongoDB
```

#### 步骤 2：启动 MongoDB 服务
```bash
# 方法 A：使用脚本
start-mongodb.bat

# 方法 B：手动启动
net start MongoDB

# 方法 C：以管理员身份运行
# 右键点击 start-mongodb.bat → "以管理员身份运行"
```

#### 步骤 3：验证启动
```bash
# 检查进程
tasklist | findstr mongod

# 检查端口
netstat -ano | findstr :27017
```

#### 如果服务不存在
MongoDB 未安装或未配置为服务：

**安装 MongoDB：**
1. 下载：https://www.mongodb.com/try/download/community
2. 运行安装程序
3. 安装选项：
   - ✅ Complete（完整安装）
   - ✅ Install MongoDB as a Service
   - ✅ Service Name: MongoDB
   - ✅ Run service as Network Service user
4. 完成安装
5. 重新运行 `start-services.bat`

---

### 方案 2：使用 MongoDB Atlas（推荐用于生产）

MongoDB Atlas 是官方的云数据库服务，免费层足够开发使用。

#### 步骤 1：注册并创建集群
1. 访问：https://www.mongodb.com/cloud/atlas/register
2. 注册账号（可使用 Google 账号）
3. 创建免费集群（M0 Sandbox）
4. 选择云服务商和区域（推荐选择离你最近的）
5. 等待集群创建（约 3-5 分钟）

#### 步骤 2：配置网络访问
1. 在 Atlas 控制台，点击 "Network Access"
2. 点击 "Add IP Address"
3. 选择 "Allow Access from Anywhere"（开发环境）
4. 或添加你的当前 IP 地址

#### 步骤 3：创建数据库用户
1. 点击 "Database Access"
2. 点击 "Add New Database User"
3. 选择 "Password" 认证
4. 设置用户名和密码（记住这些信息）
5. 权限选择 "Read and write to any database"

#### 步骤 4：获取连接字符串
1. 点击 "Clusters" → "Connect"
2. 选择 "Connect your application"
3. 选择 Driver: Node.js，Version: 4.1 or later
4. 复制连接字符串，类似：
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

#### 步骤 5：配置后端
1. 打开 `backend/.env` 文件
2. 找到或添加 `MONGODB_URI` 配置：
   ```env
   MONGODB_URI=mongodb+srv://username:your_password@cluster0.xxxxx.mongodb.net/quiz-system?retryWrites=true&w=majority
   ```
3. 替换：
   - `username` → 你的数据库用户名
   - `your_password` → 你的数据库密码
   - `cluster0.xxxxx` → 你的集群地址
   - `quiz-system` → 数据库名称

#### 步骤 6：重启服务
```bash
restart-services.bat
```

---

### 方案 3：手动启动 MongoDB（临时方案）

如果 MongoDB 已安装但服务未配置：

#### 创建数据目录
```bash
mkdir data\db
```

#### 手动启动 MongoDB
```bash
# 找到 MongoDB 安装路径，通常是：
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath data\db

# 或
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath data\db
```

保持这个窗口打开，MongoDB 会在前台运行。

---

## 🧪 验证修复

### 1. 测试 MongoDB 连接
```bash
test-mongodb.bat
```

应该看到：
```
✅ MongoDB 运行正常
💡 可以启动后端服务
```

### 2. 启动服务
```bash
start-services.bat
```

### 3. 检查后端日志
在后端窗口中应该看到：
```
✅ Connected to MongoDB
🚀 Server is running on port 5000
```

---

## 📝 常见问题

### Q1: "拒绝访问" 错误
**A:** 需要管理员权限
- 右键点击脚本 → "以管理员身份运行"

### Q2: "服务名无效" 错误
**A:** MongoDB 未安装或未配置为服务
- 安装 MongoDB Community Server
- 或使用 MongoDB Atlas

### Q3: 端口 27017 被占用
**A:** 其他程序占用了端口
```bash
# 查找占用端口的进程
netstat -ano | findstr :27017

# 终止进程（替换 PID）
taskkill /F /PID <PID>
```

### Q4: 连接超时
**A:** 防火墙或网络问题
- 检查防火墙设置
- 如果使用 Atlas，检查 IP 白名单

### Q5: 认证失败
**A:** 用户名或密码错误
- 检查 `.env` 中的连接字符串
- 确保密码中的特殊字符已正确编码

---

## 🎯 推荐配置

### 开发环境
- **本地 MongoDB**：快速、无需网络
- 安装为 Windows 服务
- 使用 `start-services.bat` 自动启动

### 生产环境
- **MongoDB Atlas**：可靠、可扩展、免维护
- 自动备份
- 全球分布式

### 团队协作
- **MongoDB Atlas**：团队共享数据
- 统一的数据库环境
- 便于协作开发

---

## 📚 相关文档

- [MongoDB 安装指南](https://docs.mongodb.com/manual/installation/)
- [MongoDB Atlas 快速开始](https://docs.atlas.mongodb.com/getting-started/)
- [连接字符串格式](https://docs.mongodb.com/manual/reference/connection-string/)
- [test-mongodb.bat](test-mongodb.bat) - 诊断脚本
- [start-mongodb.bat](start-mongodb.bat) - 启动脚本

---

## 🆘 仍然无法解决？

1. 运行诊断脚本查看详细信息：
   ```bash
   test-mongodb.bat
   ```

2. 检查后端日志中的详细错误信息

3. 确认 `backend/.env` 文件配置正确

4. 尝试使用 MongoDB Atlas（最简单的方案）
