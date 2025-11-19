# 调试 Toast 闪现消失问题

## 已完成的修复

### 1. 使用 requestAnimationFrame
在 Login.tsx 中，使用 `requestAnimationFrame` 确保 Toast 在下一帧显示，避免与组件渲染冲突。

### 2. 使用 useRef 保存 timeout
在 ToastContext 中，使用 `useRef` 保存所有 timeout ID，防止它们被意外清除。

### 3. 添加详细的日志
每个关键步骤都有日志输出，便于追踪问题。

## 测试步骤

### 步骤 1: 清空控制台
打开浏览器开发者工具（F12），清空控制台日志。

### 步骤 2: 尝试登录失败
1. 输入错误的邮箱或密码
2. 点击登录按钮
3. **仔细观察控制台输出**

### 步骤 3: 分析日志

**预期看到的完整日志序列**：
```
🔐 开始登录...
📧 邮箱: [你的邮箱]
🎯 Toast 对象: {success: ƒ, error: ƒ, ...}
📡 调用 authService.login...
🌐 API Request: POST /auth/login (no-cache)
❌ API Error: POST /auth/login
🔐 authService.login 响应: {success: false, error: {...}}
❌ 登录失败: {message: "...", code: "..."}
📡 登录响应: {success: false, error: {...}}
🔐 登录结果: false
🔐 登录结果类型: boolean
🔐 success === true: false
🔐 success === false: true
❌ 进入失败分支
❌ 登录失败，错误信息: Invalid email or password
❌ 准备显示错误 Toast
❌ Toast 错误消息: Invalid email or password
❌ 即将调用 toast.error，参数: Invalid email or password 5000
🍞 [ToastContext] 显示 Toast: {type: "error", message: "...", duration: 5000, id: "..."}
🍞 [ToastContext] 当前 Toast 数量: 1
🍞 [ToastContext] 设置定时器: toast-... 时长: 5000
❌ Toast.error 已调用完成
🍞 [ToastContainer] 渲染，Toast 数量: 1
🍞 [ToastContainer] Toast 列表: [...]
```

**5 秒后应该看到**：
```
🍞 [ToastContext] 定时移除 Toast: toast-...
🍞 [ToastContainer] 渲染，Toast 数量: 0
```

### 步骤 4: 检查异常情况

#### 情况 A: Toast 被提前移除
如果看到：
```
🍞 [ToastContext] removeToast 被调用: toast-...
```
在 5 秒之前出现，说明有其他代码调用了 `removeToast`。

**检查**：
- 是否有其他地方调用了 `clearError()`？
- 是否有组件卸载导致清理？

#### 情况 B: Toast 创建后立即消失
如果看到：
```
🍞 [ToastContext] 显示 Toast
🍞 [ToastContext] 定时移除 Toast
```
几乎同时出现，说明 duration 可能有问题。

**检查**：
- duration 是否真的是 5000？
- 是否有多个 Toast 被创建？

#### 情况 C: ToastContainer 没有渲染
如果没有看到：
```
🍞 [ToastContainer] 渲染，Toast 数量: 1
```

**检查**：
- ToastContainer 是否被正确挂载？
- 是否有 CSS 问题导致不可见？

## 对比测试

### 测试登录成功（作为对照）
1. 输入正确的邮箱和密码
2. 点击登录
3. 观察 Toast 是否正常显示

**预期日志**：
```
✅ 进入成功分支
✅ 准备显示成功 Toast
🍞 [ToastContext] 显示 Toast: {type: "success", ...}
```

### 测试 /test-toast 页面
1. 访问 `http://localhost:5173/test-toast`
2. 点击"测试错误 Toast"按钮
3. 观察 Toast 是否正常显示 5 秒

**如果测试页面正常**：
- 说明 Toast 系统本身没问题
- 问题出在登录失败的特定处理逻辑上

**如果测试页面也有问题**：
- 说明 Toast 系统本身有问题
- 需要检查 ToastContext 和 ToastContainer

## 可能的根本原因

### 原因 1: 组件重新渲染导致 Toast 被清除
**症状**：Toast 创建后立即消失
**原因**：Login 组件的 `error` 状态变化导致重新渲染
**解决**：使用 `requestAnimationFrame` 延迟 Toast 创建

### 原因 2: setTimeout 被过早清除
**症状**：Toast 显示但不到 5 秒就消失
**原因**：组件卸载或状态更新导致 setTimeout 被清除
**解决**：使用 `useRef` 保存 timeout ID

### 原因 3: 多次调用 removeToast
**症状**：日志显示 `removeToast 被调用` 多次
**原因**：有多个地方触发了 Toast 移除
**解决**：检查所有调用 `removeToast` 的地方

### 原因 4: CSS 动画问题
**症状**：Toast 元素存在但不可见
**原因**：动画或 z-index 问题
**解决**：检查浏览器开发者工具中的元素

## 下一步调试

如果问题仍然存在，请提供：

1. **完整的控制台日志**（从点击登录到 Toast 消失）
2. **Toast 消失的准确时间**（是立即消失还是几秒后？）
3. **测试页面的表现**（/test-toast 是否正常？）
4. **浏览器信息**（Chrome/Firefox/Safari，版本号）

## 临时解决方案

如果问题紧急，可以临时增加 Toast 显示时间：

```typescript
// 在 Login.tsx 中
toast.error(errorMsg, 10000);  // 改为 10 秒
```

或者禁用自动消失：

```typescript
// 在 Login.tsx 中
toast.error(errorMsg, 0);  // 0 表示不自动消失，需要手动关闭
```
