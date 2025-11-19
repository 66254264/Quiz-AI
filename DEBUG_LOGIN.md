# 登录问题调试指南

## 问题：点击登录后页面闪一下并刷新

这说明页面正在重新加载，导致控制台日志被清空。

## 解决步骤

### 步骤 1: 启用浏览器日志保留

1. 打开浏览器开发者工具（F12）
2. 切换到 **Console** 标签页
3. 在控制台顶部找到并**勾选** "Preserve log" 或"保留日志"选项
   - Chrome/Edge: 右上角的齿轮图标 → Preserve log
   - Firefox: 右上角的齿轮图标 → Persist Logs

这样即使页面刷新，之前的日志也会保留。

### 步骤 2: 检查 Network 标签

1. 打开 **Network** 标签页
2. 勾选 "Preserve log"
3. 点击登录按钮
4. 查看网络请求列表：
   - 是否有 `/api/auth/login` 请求？
   - 状态码是多少？（200, 400, 401, 500?）
   - 点击该请求，查看 **Response** 标签的内容

### 步骤 3: 检查 localStorage

登录后，在控制台运行以下命令：

```javascript
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));
console.log('User:', localStorage.getItem('user'));
```

如果这些值存在，说明登录成功了，问题在于跳转。

### 步骤 4: 手动测试跳转

在控制台运行：

```javascript
// 检查当前路径
console.log('当前路径:', window.location.pathname);

// 尝试手动跳转
window.location.href = '/teacher/questions';
```

如果手动跳转有效，说明 `navigate()` 函数有问题。

## 可能的原因和解决方案

### 原因 1: 表单自动提交
虽然代码中有 `e.preventDefault()`，但某些情况下可能不起作用。

**解决方案**: 已在代码中添加，无需额外操作。

### 原因 2: React Router 配置问题
可能是 Router 配置导致页面刷新。

**解决方案**: 检查 App.tsx 中的 BrowserRouter 配置。

### 原因 3: 浏览器密码管理器
浏览器的密码管理器可能触发了表单提交。

**解决方案**: 
- 暂时禁用浏览器的密码管理器
- 或者使用隐身模式测试

### 原因 4: API 响应格式不匹配
后端返回的数据格式与前端期望的不一致。

**解决方案**: 检查 Network 标签中的响应数据。

## 快速测试命令

在浏览器控制台运行以下命令来测试登录流程：

```javascript
// 1. 清空 localStorage
localStorage.clear();

// 2. 手动调用登录 API
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'teacher@example.com',
    password: 'Teacher123!'
  })
})
.then(r => r.json())
.then(data => {
  console.log('登录响应:', data);
  if (data.success) {
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    console.log('✅ Token 已存储');
    console.log('用户角色:', data.data.user.role);
    // 手动跳转
    window.location.href = data.data.user.role === 'teacher' 
      ? '/teacher/questions' 
      : '/student/quizzes';
  }
})
.catch(err => console.error('错误:', err));
```

## 下一步

请按照以下顺序操作：

1. ✅ **启用 "Preserve log"**
2. ✅ **重新登录并查看完整日志**
3. ✅ **检查 Network 标签的 login 请求**
4. ✅ **告诉我你看到的内容**

特别注意：
- Console 中的所有日志（包括错误）
- Network 中 `/api/auth/login` 的状态码和响应
- 是否有其他异常的网络请求
