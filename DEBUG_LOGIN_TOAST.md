# 调试登录错误提示问题

## 问题现象
邮箱或密码输入错误后，点击登录按钮，页面没有显示错误提示。

## 调试步骤

### 1. 确认后端服务运行
```bash
# 在 backend 目录下
npm run dev
```
确保看到类似输出：
```
Server running on port 5000
MongoDB connected successfully
```

### 2. 打开浏览器开发者工具
- 按 F12 打开开发者工具
- 切换到 Console（控制台）标签
- 切换到 Network（网络）标签

### 3. 尝试登录并查看日志

输入错误的邮箱或密码，点击登录，应该看到以下日志：

#### 预期的控制台日志顺序：
```
🔐 开始登录... [时间戳]
📧 邮箱: [你输入的邮箱]
🎯 Toast 对象: {success: ƒ, error: ƒ, warning: ƒ, info: ƒ, ...}
📡 调用 authService.login...
🌐 API Request: POST /auth/login (no-cache)
🔐 authService.login 响应: {success: false, error: {...}}
❌ 登录失败: {message: "Invalid email or password", code: "INVALID_CREDENTIALS"}
📡 登录响应: {success: false, error: {...}}
🔐 登录结果: false
❌ 登录失败，错误信息: Invalid email or password
❌ 准备显示错误 Toast
❌ Toast 错误消息: Invalid email or password
🍞 [ToastContext] 显示 Toast: {type: "error", message: "Invalid email or password", duration: 5000, id: "..."}
🍞 [ToastContext] 当前 Toast 数量: 1
❌ Toast.error 已调用
🍞 [ToastContainer] 渲染，Toast 数量: 1
🍞 [ToastContainer] Toast 列表: [{id: "...", type: "error", message: "...", duration: 5000}]
```

#### 预期的网络请求：
- URL: `http://localhost:5000/api/auth/login`
- Method: POST
- Status: 401 (Unauthorized)
- Response:
```json
{
  "success": false,
  "error": {
    "message": "Invalid email or password",
    "code": "INVALID_CREDENTIALS"
  }
}
```

### 4. 检查 Toast 是否显示

在页面右上角应该看到一个红色的错误提示框，显示 5 秒钟。

## 可能的问题和解决方案

### 问题 1: 后端未运行
**症状**: 控制台显示网络错误
```
❌ API Error: POST /auth/login
💥 登录异常: Network Error
```

**解决**: 启动后端服务
```bash
cd backend
npm run dev
```

### 问题 2: CORS 错误
**症状**: 控制台显示 CORS 相关错误
```
Access to fetch at 'http://localhost:5000/api/auth/login' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**解决**: 检查后端 CORS 配置（backend/src/index.ts）

### 问题 3: Toast 未渲染
**症状**: 控制台显示 Toast 相关日志，但页面上看不到

**检查**:
1. 确认 `ToastContainer` 在 App.tsx 中被渲染
2. 检查 CSS 样式是否正确加载
3. 检查 z-index 是否被其他元素覆盖

**解决**: 
```tsx
// 在 App.tsx 中确认有这两行
<ToastProvider>
  ...
  <ToastContainer />
</ToastProvider>
```

### 问题 4: Toast 对象未定义
**症状**: 控制台显示
```
🎯 Toast 对象: undefined
```

**解决**: 确认 Login 组件在 ToastProvider 内部

### 问题 5: 错误信息为空
**症状**: 
```
❌ 登录失败，错误信息: null
```

**检查**: 
1. 后端是否正确返回错误信息
2. authService 是否正确解析错误
3. api.ts 是否正确处理错误响应

## 测试用例

### 测试 1: 错误的邮箱
- 输入: `nonexistent@example.com` / `anypassword`
- 预期: 显示 "Invalid email or password"

### 测试 2: 错误的密码
- 输入: 正确的邮箱 / 错误的密码
- 预期: 显示 "Invalid email or password"

### 测试 3: 网络错误
- 关闭后端服务
- 输入任意邮箱密码
- 预期: 显示 "网络连接失败，请检查您的网络"

## 快速测试

使用提供的 `test-login-error.html` 文件：
```bash
# 在浏览器中打开
open test-login-error.html
```

点击测试按钮，查看后端 API 是否正常返回错误信息。

## 联系信息

如果以上步骤都无法解决问题，请提供：
1. 完整的控制台日志
2. 网络请求的详细信息
3. 浏览器版本和操作系统信息
