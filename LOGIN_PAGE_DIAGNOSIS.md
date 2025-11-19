# 登录后页面问题诊断

## 问题描述
用户登录成功后，页面显示"暂无题目，请创建第一道题目"。点击"创建题目"按钮后，页面显示空白。

## 已检查的组件

### ✅ 正常的组件
1. **路由配置** (`App.tsx`) - 路由设置正确
2. **认证流程** - 登录成功，token 存储正常
3. **后端 API** - 题目 CRUD 接口实现完整
4. **前端服务** - questionService 实现正确
5. **QuestionManagement 页面** - 状态管理正确
6. **QuestionForm 组件** - 表单实现完整

### 🔍 需要检查的问题

#### 1. 表单显示问题
**症状**: 点击"创建题目"后页面空白

**可能原因**:
- CSS 样式问题（白色背景上白色文字）
- JavaScript 错误导致组件崩溃
- 组件渲染但内容不可见

**已添加的调试代码**:
```tsx
// QuestionForm.tsx - 添加了蓝色调试信息框
<div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-700">
  表单已加载 - {question ? '编辑模式' : '创建模式'}
</div>

// QuestionManagement.tsx - 添加了最小高度
<div className="min-h-[400px]">
  <QuestionForm ... />
</div>
```

#### 2. 数据库问题
**症状**: 显示"暂无题目"

**可能原因**:
- 数据库中确实没有题目数据
- 后端查询条件过滤掉了所有题目
- 认证 token 中的 userId 与数据库不匹配

## 诊断步骤

### 步骤 1: 检查浏览器控制台
打开浏览器开发者工具（F12），查看：

1. **Console 标签页**
   - 是否有 JavaScript 错误？
   - 是否有网络请求失败？

2. **Network 标签页**
   - 查看 `/api/questions` 请求
   - 检查请求头是否包含 Authorization token
   - 检查响应状态码和数据

3. **Elements 标签页**
   - 检查 DOM 结构是否正确渲染
   - 查看元素的 CSS 样式

### 步骤 2: 测试后端 API

使用以下命令测试后端 API：

```bash
# 1. 登录获取 token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@example.com",
    "password": "Teacher123!"
  }'

# 2. 使用返回的 accessToken 查询题目列表
curl -X GET http://localhost:5000/api/questions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"

# 3. 创建测试题目
curl -X POST http://localhost:5000/api/questions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试题目",
    "content": "这是一道测试题目",
    "options": [
      {"id": "A", "text": "选项A"},
      {"id": "B", "text": "选项B"}
    ],
    "correctAnswer": "A",
    "difficulty": "easy",
    "tags": ["测试"]
  }'
```

### 步骤 3: 检查数据库

连接到 MongoDB 并检查数据：

```bash
# 连接到 MongoDB
mongosh

# 切换到数据库
use quiz_system

# 查看用户数据
db.users.find().pretty()

# 查看题目数据
db.questions.find().pretty()

# 检查题目的 createdBy 字段是否与用户 _id 匹配
```

### 步骤 4: 运行数据填充脚本

如果数据库为空，运行 seeder 脚本：

```bash
cd backend
npm run seed
```

## 快速修复建议

### 修复 1: 确保表单可见
表单已添加调试信息和背景色，刷新页面后应该能看到蓝色的调试框。

### 修复 2: 添加错误边界
如果组件崩溃，添加 React 错误边界来捕获错误：

```tsx
// 在 App.tsx 中添加错误边界
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return <div>出错了: {this.state.error?.message}</div>;
    }
    return this.props.children;
  }
}
```

### 修复 3: 检查 localStorage
确保 token 正确存储：

```javascript
// 在浏览器控制台运行
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));
```

## 下一步行动

请按照以下顺序操作：

1. **刷新页面** - 查看是否能看到蓝色调试信息框
2. **打开开发者工具** - 检查 Console 和 Network 标签
3. **报告发现** - 告诉我你看到了什么：
   - 是否有错误信息？
   - 网络请求的状态码是什么？
   - 是否看到了蓝色的调试框？
   - 页面是完全空白还是只有部分空白？

根据你的反馈，我会提供针对性的解决方案。
