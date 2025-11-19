# 登录方式修改：从邮箱改为用户名

## 修改内容

将登录方式从使用"邮箱 + 密码"改为使用"用户名 + 密码"。

## 修改的文件

### 后端修改

#### 1. backend/src/routes/authRoutes.ts ⭐ 重要
```typescript
// 修改前 - 验证 email
body('email')
  .trim()
  .isEmail()
  .withMessage('Please provide a valid email')
  .normalizeEmail(),

// 修改后 - 验证 username
body('username')
  .trim()
  .notEmpty()
  .withMessage('Username is required')
  .isLength({ min: 3, max: 30 })
  .withMessage('Username must be between 3 and 30 characters'),
```

**变更**：
- 验证规则从 `email` 改为 `username`
- 移除 `isEmail()` 验证
- 添加长度验证（3-30 字符）
- 更新错误消息

#### 2. backend/src/controllers/authController.ts
```typescript
// 修改前
const { email, password } = req.body;
const user = await User.findOne({ email }).select('+password');
message: 'Invalid email or password'

// 修改后
const { username, password } = req.body;
const user = await User.findOne({ username }).select('+password');
message: 'Invalid username or password'
```

**变更**：
- 从请求体中获取 `username` 而不是 `email`
- 使用 `username` 查询用户
- 错误消息改为 "Invalid username or password"

### 前端修改

#### 2. frontend/src/pages/auth/Login.tsx
```typescript
// 修改前
const [formData, setFormData] = useState({
  email: '',
  password: '',
});

// 修改后
const [formData, setFormData] = useState({
  username: '',
  password: '',
});
```

**变更**：
- 表单字段从 `email` 改为 `username`
- 输入框类型从 `type="email"` 改为 `type="text"`
- placeholder 从 "邮箱地址" 改为 "用户名"
- label 从 "邮箱地址" 改为 "用户名"
- autoComplete 从 "email" 改为 "username"

#### 3. frontend/src/store/authStore.ts
```typescript
// 修改前
login: (email: string, password: string) => Promise<boolean>;
login: async (email, password) => {
  const response = await authService.login({ email, password });
}

// 修改后
login: (username: string, password: string) => Promise<boolean>;
login: async (username, password) => {
  const response = await authService.login({ username, password });
}
```

**变更**：
- 函数签名参数从 `email` 改为 `username`
- 传递给 authService 的参数改为 `username`

#### 4. frontend/src/types/index.ts
```typescript
// 修改前
export interface LoginCredentials {
  email: string;
  password: string;
}

// 修改后
export interface LoginCredentials {
  username: string;
  password: string;
}
```

**变更**：
- LoginCredentials 接口的字段从 `email` 改为 `username`

## 影响范围

### 不受影响的功能
- ✅ 注册功能（仍然需要邮箱和用户名）
- ✅ 用户资料（仍然包含邮箱信息）
- ✅ Token 生成和验证
- ✅ 受保护的路由
- ✅ 角色权限

### 需要注意的地方
- ⚠️ 用户需要记住自己的用户名而不是邮箱
- ⚠️ 用户名必须是唯一的（注册时已验证）
- ⚠️ 错误提示已更新为 "Invalid username or password"

## 测试步骤

### 1. 测试登录成功
1. 访问 `http://localhost:5173/login`
2. 输入正确的用户名和密码
3. **预期**：成功登录并跳转到对应页面

### 2. 测试登录失败 - 错误用户名
1. 输入不存在的用户名
2. 输入任意密码
3. **预期**：显示 "Invalid username or password" 错误

### 3. 测试登录失败 - 错误密码
1. 输入正确的用户名
2. 输入错误的密码
3. **预期**：显示 "Invalid username or password" 错误

### 4. 测试表单验证
1. 尝试提交空表单
2. **预期**：浏览器显示 "请填写此字段" 提示

## API 变更

### 登录接口

**端点**：`POST /api/auth/login`

**请求体（修改前）**：
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**请求体（修改后）**：
```json
{
  "username": "username123",
  "password": "password123"
}
```

**响应**：保持不变
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "username": "username123",
      "email": "user@example.com",
      "role": "student",
      "profile": {...}
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

## 数据库影响

- ✅ 无需修改数据库结构
- ✅ 用户表仍然包含 `username` 和 `email` 字段
- ✅ 现有用户数据不受影响

## 向后兼容性

**不兼容**：
- ❌ 旧的前端代码无法与新的后端 API 一起工作
- ❌ 需要同时更新前端和后端

**建议**：
- 如果需要支持两种登录方式，可以修改后端同时接受 `username` 或 `email`
- 当前实现只支持用户名登录

## 可选：支持邮箱或用户名登录

如果需要同时支持邮箱和用户名登录，可以这样修改后端：

```typescript
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // 尝试通过用户名或邮箱查找用户
    const user = await User.findOne({
      $or: [
        { username: username },
        { email: username }  // 允许使用邮箱登录
      ]
    }).select('+password');

    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: {
          message: 'Invalid username/email or password',
          code: 'INVALID_CREDENTIALS'
        }
      };
      return res.status(401).json(response);
    }

    // ... 其余代码保持不变
  }
};
```

这样用户可以使用用户名或邮箱登录，前端仍然只需要一个输入框。

## 总结

- ✅ 登录方式已从邮箱改为用户名
- ✅ 前后端代码已同步更新
- ✅ 类型定义已更新
- ✅ 错误消息已更新
- ✅ 所有相关代码已修改完成

现在用户需要使用用户名而不是邮箱来登录系统。
