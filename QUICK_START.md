# 快速开始指南

5分钟内让答题系统运行起来！

## 前置要求

- 已安装 Node.js v16+
- 已安装并运行 MongoDB
- Git（可选）

## 第一步：安装依赖

### 后端

**方法一：使用更新脚本（推荐，无警告）**
```bash
cd backend

# Windows
update-dependencies.bat

# macOS/Linux
chmod +x update-dependencies.sh
./update-dependencies.sh
```

**方法二：直接安装**
```bash
cd backend
npm install
```

> 💡 **提示**: 如果看到依赖警告，使用方法一的更新脚本可以解决所有警告。

### 前端
```bash
cd frontend
npm install
```

## 第二步：配置环境

`.env` 文件已经为本地开发配置好了，无需修改！

### 后端 (.env)
- MongoDB: `mongodb://localhost:27017/quiz-system`
- 端口: `5000`
- CORS: `http://localhost:3000`

### 前端 (.env)
- API 地址: `http://localhost:5000/api`

## 第三步：启动 MongoDB

### Windows
```bash
net start MongoDB
```

### macOS
```bash
brew services start mongodb-community
```

### Linux
```bash
sudo systemctl start mongod
```

## 第四步：初始化数据库（可选但推荐）

这会创建测试用的测验数据（1个教师、2个学生、3道题目、1个测验）：

```bash
cd backend
npm run seed
```

**创建的测试账号：**
- 教师：teacher@example.com / Teacher123!
- 学生1：student1@example.com / Student123!
- 学生2：student2@example.com / Student123!

> 💡 详细说明请查看 `backend/SEEDER_GUIDE.md`

## 第五步：启动后端服务器

```bash
cd backend
npm run dev
```

你应该看到：
```
🚀 Server is running on port 5000
📊 Health check: http://localhost:5000/health
🔗 API base: http://localhost:5000/api
✅ Connected to MongoDB
```

## 第六步：启动前端服务器

打开新的终端窗口：

```bash
cd frontend
npm run dev
```

你应该看到：
```
  VITE v4.3.2  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## 第七步：访问应用

在浏览器中打开：
```
http://localhost:3000
```

## 第八步：创建第一个账号

### 注册教师账号
1. 点击"立即注册"
2. 填写表单：
   - 角色：教师
   - 用户名：teacher1
   - 邮箱：teacher@test.com
   - 密码：password123
   - 名：Test
   - 姓：Teacher
3. 点击"注册"
4. 将自动跳转到题目管理页面

### 注册学生账号
1. 打开无痕/隐私浏览窗口
2. 访问 http://localhost:3000
3. 点击"立即注册"
4. 填写表单：
   - 角色：学生
   - 用户名：student1
   - 邮箱：student@test.com
   - 密码：password123
   - 名：Test
   - 姓：Student
5. 点击"注册"
6. 将自动跳转到测验列表页面

## 第九步：测试系统

### 作为教师
1. 创建题目：
   - 点击"创建题目"
   - 填写标题、内容、选项
   - 选择正确答案
   - 点击"保存"

2. 查看统计分析：
   - 点击导航栏中的"统计分析"
   - 查看整体统计数据
   - 选择测验查看详细统计

### 作为学生
1. 查看可用测验：
   - 如果运行了数据初始化脚本，应该能看到测验列表
   
2. 参加测验：
   - 点击"开始答题"
   - 回答问题
   - 点击"提交答案"
   
3. 查看结果：
   - 查看分数和百分比
   - 查看正确/错误答案

## 故障排除

### npm 依赖警告
**问题**：安装依赖时出现 deprecated 警告

**解决方案**：
```bash
cd backend
# Windows: update-dependencies.bat
# macOS/Linux: ./update-dependencies.sh
```

或查看 `backend/DEPENDENCY_UPDATES.md` 了解详情。

### MongoDB 连接错误
**问题**：`MongooseServerSelectionError: connect ECONNREFUSED`

**解决方案**：
- 确保 MongoDB 正在运行
- 检查 MongoDB 是否在 27017 端口
- 尝试运行：`mongosh` 测试连接

### 端口已被占用
**问题**：`Error: listen EADDRINUSE: address already in use :::5000`

**解决方案**：
- 结束占用端口的进程
- Windows: `netstat -ano | findstr :5000` 然后 `taskkill /PID <进程ID> /F`
- macOS/Linux: `lsof -ti:5000 | xargs kill -9`

### CORS 错误
**问题**：`Access to XMLHttpRequest blocked by CORS policy`

**解决方案**：
- 确保后端运行在 5000 端口
- 确保前端运行在 3000 端口
- 检查 backend/.env 中的 CORS_ORIGIN 配置

### 没有可用测验
**问题**：学生看到"暂无可用测验"

**解决方案**：
- 运行数据初始化脚本：`cd backend && npm run seed`
- 或等待教师创建测验会话（UI 未实现）

## 测试集成

运行自动化集成测试：

```bash
node test-integration.js
```

这将测试：
- ✅ 健康检查
- ✅ 用户注册
- ✅ 用户登录
- ✅ 题目创建
- ✅ 测验流程
- ✅ 统计分析

## 移动端测试

1. 打开 Chrome 开发者工具（F12）
2. 点击设备工具栏图标（Ctrl+Shift+M）
3. 选择设备（例如 iPhone 12 Pro）
4. 测试所有功能

## 下一步

1. ✅ 创建更多题目
2. ✅ 参加多个测验
3. ✅ 查看统计分析
4. ✅ 在移动设备上测试
5. ✅ 阅读 `e2e-validation.md` 进行全面测试
6. ✅ 阅读 `build-production.md` 了解部署方法

## 常用命令

### 后端
```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm start            # 启动生产服务器
npm run seed         # 初始化测试数据
```

### 前端
```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产构建
npm run lint         # 运行 ESLint
```

## 默认测试账号

运行集成测试脚本后，你将拥有：

**教师账号**
- 邮箱：teacher@test.com
- 密码：password123

**学生账号**
- 邮箱：student@test.com
- 密码：password123

## 支持文档

- 📖 完整验证指南：`e2e-validation.md`
- 🚀 生产环境部署：`build-production.md`
- 📱 移动端测试：`mobile-testing-checklist.md`
- ✅ 集成状态：`INTEGRATION_COMPLETE.md`

## 成功！

如果你可以：
- ✅ 注册和登录
- ✅ 创建题目（教师）
- ✅ 参加测验（学生）
- ✅ 查看结果
- ✅ 查看统计分析

那么你的系统运行完美！🎉

---

**需要帮助？** 查看故障排除部分或阅读详细指南。
