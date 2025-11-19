# 调试：quizsessions 集合为空

## 问题描述

前端显示创建了两个测验，但数据库中 `quizsessions` 集合是空的。

## 可能的原因

### 1. 数据库连接问题
- 后端连接到了错误的数据库
- 环境变量配置错误

### 2. 集合名称问题
- Mongoose 模型名称与实际集合名称不匹配
- 可能数据保存到了其他集合

### 3. 数据未真正保存
- 创建请求失败但前端没有正确处理错误
- 事务回滚
- 权限问题

### 4. 前端缓存问题
- 前端显示的是缓存数据
- 实际请求失败了

## 调试步骤

### 步骤 1: 运行数据库检查脚本

```bash
cd backend
node check-database.js
```

这个脚本会：
- ✅ 列出所有集合
- ✅ 显示每个集合的文档数量
- ✅ 检查是否有其他可能的集合名
- ✅ 显示 quizsessions 中的文档（如果有）

### 步骤 2: 检查后端日志

启动后端并查看控制台输出：

```bash
cd backend
npm run dev
```

尝试创建一个新测验，观察：
- 是否有错误日志
- 是否有 "创建测验成功" 的日志
- 数据库连接是否正常

### 步骤 3: 检查环境变量

查看 `backend/.env` 文件：

```bash
cat backend/.env
```

确认 `MONGODB_URI` 是否正确：
```
MONGODB_URI=mongodb://localhost:27017/quiz-system
```

### 步骤 4: 使用 MongoDB Compass 检查

1. 打开 MongoDB Compass
2. 连接到数据库
3. 查看 `quiz-system` 数据库
4. 检查所有集合
5. 查看 `quizsessions` 集合的内容

### 步骤 5: 检查前端网络请求

1. 打开浏览器开发者工具（F12）
2. 切换到 Network 标签
3. 尝试创建一个测验
4. 查看 POST 请求到 `/api/quizzes/teacher`
5. 检查：
   - 请求状态码（应该是 201）
   - 响应内容
   - 是否有错误

### 步骤 6: 直接查询数据库

使用 MongoDB Shell：

```bash
mongosh

use quiz-system

# 查看所有集合
show collections

# 查看 quizsessions 集合
db.quizsessions.find().pretty()

# 查看文档数量
db.quizsessions.countDocuments()

# 查看最近创建的文档
db.quizsessions.find().sort({createdAt: -1}).limit(5).pretty()
```

## 常见问题和解决方案

### 问题 1: 集合名称不匹配

**症状**：数据保存到了 `quizSessions` 而不是 `quizsessions`

**解决**：检查 Mongoose 模型定义

```typescript
// backend/src/models/QuizSession.ts
export const QuizSession = mongoose.model<IQuizSession>('QuizSession', quizSessionSchema);
```

Mongoose 会自动将 `QuizSession` 转换为 `quizsessions`（小写+复数）。

如果需要指定集合名称：
```typescript
export const QuizSession = mongoose.model<IQuizSession>(
  'QuizSession', 
  quizSessionSchema,
  'quizsessions'  // 明确指定集合名称
);
```

### 问题 2: 数据库连接到错误的数据库

**症状**：后端日志显示连接成功，但数据在其他数据库

**检查**：
```javascript
// 在后端启动时添加日志
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB 已连接');
  console.log('📍 数据库名称:', mongoose.connection.name);
  console.log('📍 主机:', mongoose.connection.host);
});
```

### 问题 3: 创建请求失败

**症状**：前端显示成功，但实际请求失败

**检查前端代码**：
```typescript
// frontend/src/pages/teacher/QuizManagement.tsx
const handleSubmit = async (formData) => {
  try {
    const response = await teacherQuizService.createQuiz(formData);
    console.log('📝 创建响应:', response);  // 添加日志
    
    if (response.success) {
      toast.success('测验创建成功');
    } else {
      console.error('❌ 创建失败:', response.error);  // 添加日志
      toast.error(response.error?.message || '创建失败');
    }
  } catch (err) {
    console.error('💥 创建异常:', err);  // 添加日志
  }
};
```

### 问题 4: 权限问题

**症状**：MongoDB 拒绝写入操作

**检查**：
```bash
# 在 MongoDB Shell 中
db.runCommand({connectionStatus: 1})
```

确保用户有写入权限。

### 问题 5: 前端缓存

**症状**：前端显示旧数据

**解决**：
1. 清除浏览器缓存
2. 硬刷新（Ctrl+Shift+R）
3. 检查前端是否使用了缓存

## 测试创建测验

### 使用 curl 测试后端 API

```bash
# 1. 先登录获取 token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher1","password":"password123"}'

# 2. 使用 token 创建测验
curl -X POST http://localhost:5000/api/quizzes/teacher \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "测试测验",
    "description": "这是一个测试",
    "questions": ["QUESTION_ID_1", "QUESTION_ID_2"],
    "timeLimit": 30
  }'
```

### 使用 Postman 测试

1. POST `http://localhost:5000/api/auth/login`
   - Body: `{"username":"teacher1","password":"password123"}`
   - 获取 accessToken

2. POST `http://localhost:5000/api/quizzes/teacher`
   - Headers: `Authorization: Bearer YOUR_TOKEN`
   - Body: 测验数据

3. 检查响应状态码和内容

## 添加调试日志

在 `backend/src/controllers/quizController.ts` 中添加日志：

```typescript
export const createQuiz = async (req: Request, res: Response) => {
  try {
    console.log('📝 收到创建测验请求');
    console.log('📝 请求数据:', req.body);
    console.log('📝 用户ID:', req.user?.userId);
    
    const quiz = new QuizSession({
      title,
      description,
      questions,
      timeLimit,
      isActive: false,
      createdBy: userId
    });

    console.log('📝 准备保存测验...');
    await quiz.save();
    console.log('✅ 测验已保存:', quiz._id);
    console.log('✅ 集合名称:', quiz.collection.name);

    // ...
  } catch (error: any) {
    console.error('❌ 创建测验失败:', error);
    // ...
  }
};
```

## 检查清单

- [ ] 运行 `check-database.js` 脚本
- [ ] 检查 `.env` 文件中的 `MONGODB_URI`
- [ ] 查看后端启动日志
- [ ] 使用 MongoDB Compass 查看数据库
- [ ] 检查浏览器 Network 标签
- [ ] 使用 MongoDB Shell 直接查询
- [ ] 添加调试日志并重新测试
- [ ] 使用 curl 或 Postman 测试 API

## 下一步

根据调试结果：
1. 如果数据在其他集合 → 修改模型定义
2. 如果连接错误 → 修改 `.env` 配置
3. 如果请求失败 → 检查错误日志和权限
4. 如果是缓存问题 → 清除缓存并刷新

请运行 `check-database.js` 脚本并告诉我结果！
