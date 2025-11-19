# AI分析功能调试指南

## 当前状态

✅ 后端API调用成功（从服务端日志可以看到）
✅ 豆包API返回了分析结果
❌ 前端显示"AI分析失败"

## 问题分析

后端成功获取了AI分析结果，但前端没有正确接收或显示。可能的原因：

1. **超时问题** - 前端默认10秒超时，AI分析可能需要更长时间
2. **响应格式问题** - 前端解析响应数据时出错
3. **错误处理问题** - 前端的错误处理逻辑捕获了某个异常

## 已实施的修复

### 1. 增加前端超时时间

```typescript
// frontend/src/services/analyticsService.ts
const response = await api.post(
  `/analytics/questions/${questionId}/analyze`, 
  { quizId },
  { timeout: 60000 } // 从10秒增加到60秒
);
```

### 2. 添加详细日志

**前端日志（浏览器控制台）：**
- 📤 发送AI分析请求
- 📥 收到响应
- 响应数据结构
- 分析结果详情

**后端日志（服务端控制台）：**
- 📝 收到AI分析请求
- 环境变量检查
- ✅ 题目找到
- 📊 统计数据
- 🤖 开始调用AI分析
- ✅ AI分析完成

### 3. 增强错误处理

添加了更详细的错误信息捕获和显示。

## 调试步骤

### 步骤1：确认后端服务已重启

```bash
# 停止所有Node进程
taskkill /F /IM node.exe

# 启动后端开发服务
cd backend
npm run dev
```

**确认看到：**
```
🚀 Server is running on port 5000
✅ Connected to MongoDB
```

### 步骤2：刷新前端页面

如果前端也被关闭了，重新启动：
```bash
cd frontend
npm run dev
```

### 步骤3：打开浏览器开发者工具

按 F12 打开开发者工具，切换到 **Console** 标签

### 步骤4：测试AI分析

1. 登录教师账号
2. 进入"统计分析" → "题目分析"
3. 点击任意题目的"AI解题分析"按钮
4. **立即查看两个地方的日志：**
   - 浏览器控制台（前端日志）
   - 后端服务窗口（后端日志）

### 步骤5：分析日志输出

#### 正常情况（前端控制台应该显示）：

```
🤖 开始AI分析，题目ID: xxx 测验ID: xxx
📤 发送AI分析请求: {questionId: "xxx", quizId: "xxx"}
📥 收到响应: {data: {...}, status: 200, ...}
响应数据: {success: true, data: {questionId: "xxx", analysis: "..."}}
分析结果: {questionId: "xxx", analysis: "..."}
✅ AI分析成功
分析结果类型: string
分析结果长度: xxx
分析结果前100字符: ### 1. 题目考查的知识点...
✅ 分析结果已保存到状态
```

#### 如果出错（查看具体错误信息）：

```
❌ AI分析失败: Error: ...
错误类型: ...
错误消息: ...
HTTP状态: ...
响应数据: ...
```

## 常见问题及解决

### 问题1：前端显示"timeout of 10000ms exceeded"

**原因：** 请求超时
**解决：** 已修复，超时时间增加到60秒

### 问题2：前端显示"服务器返回的数据格式不正确"

**原因：** 响应数据结构不符合预期
**检查：** 
1. 查看浏览器控制台的"响应数据"日志
2. 确认格式是否为：`{success: true, data: {questionId, analysis}}`

### 问题3：前端显示"Network Error"

**原因：** 无法连接到后端
**解决：**
1. 确认后端服务正在运行
2. 访问 http://localhost:5000/health 测试连接
3. 检查防火墙设置

### 问题4：前端显示"401 Unauthorized"

**原因：** Token过期或无效
**解决：**
1. 退出登录
2. 重新登录
3. 再次测试

### 问题5：后端日志显示"题目未找到"

**原因：** 题目ID不正确
**解决：**
1. 确认在有提交数据的测验中测试
2. 检查题目ID是否正确

## 网络请求检查

在浏览器开发者工具中：

1. 切换到 **Network** 标签
2. 点击"AI解题分析"按钮
3. 找到 `analyze` 请求
4. 查看：
   - **Request URL**: 应该是 `http://localhost:5000/api/analytics/questions/{questionId}/analyze`
   - **Request Method**: POST
   - **Status Code**: 应该是 200
   - **Request Headers**: 应该包含 `Authorization: Bearer ...`
   - **Request Payload**: `{quizId: "..."}`
   - **Response**: 查看完整的响应数据

## 如果问题仍未解决

### 收集以下信息：

1. **浏览器控制台的完整日志**（从点击按钮开始）
2. **后端服务的完整日志**（从收到请求开始）
3. **Network标签中analyze请求的详细信息**
   - Request Headers
   - Request Payload
   - Response Headers
   - Response Body
4. **浏览器和Node.js版本**

### 临时解决方案

如果急需使用，可以暂时使用模拟数据：

```typescript
// 在 frontend/src/services/analyticsService.ts 中临时修改
analyzeQuestion: async (questionId: string, quizId: string): Promise<string> => {
  // 临时返回模拟数据
  return `### 1. 题目考查的知识点
这是一个测试分析结果。

### 2. 正确答案的解题思路
详细的解题步骤...

### 3. 常见错误选项的误区分析
错误选项分析...

### 4. 学习建议
学习建议内容...`;
}
```

## 下一步

1. 重启后端服务
2. 刷新前端页面
3. 打开浏览器开发者工具（F12）
4. 点击"AI解题分析"按钮
5. 查看控制台日志
6. 根据日志信息判断问题所在

## 成功标志

当一切正常时，你应该看到：

✅ 浏览器控制台显示完整的请求和响应日志
✅ 后端控制台显示"✅ AI分析完成"
✅ 页面上显示AI分析结果（紫色背景区域）
✅ 分析结果包含知识点、解题思路等内容
