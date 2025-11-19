# AI分析功能快速修复指南

## 问题
点击"AI解题分析"按钮后显示"AI分析失败，请稍后重试"

## 原因
豆包API配置正确，但后端服务没有重启，导致环境变量未生效。

## 快速解决（3步）

### 第1步：测试API配置

双击运行：**test-ai-config.bat**

或手动执行：
```bash
node backend/test-doubao-api.js
```

**预期结果：** 看到 "✅ API调用成功！" 和AI的回复内容

**如果失败：** 检查 `backend/.env` 中的API配置是否正确

---

### 第2步：重启后端服务

**停止所有Node进程：**
```bash
taskkill /F /IM node.exe
```

**启动后端开发服务：**

双击运行：**restart-backend-dev.bat**

或手动执行：
```bash
cd backend
npm run dev
```

**预期结果：** 看到以下日志
```
🚀 Server is running on port 5000
✅ Connected to MongoDB
```

---

### 第3步：测试AI分析

1. 刷新前端页面（如果前端也被关闭了，需要重新启动：`cd frontend && npm run dev`）
2. 登录教师账号
3. 进入"统计分析" → "题目分析"
4. 点击任意题目的"AI解题分析"按钮
5. 等待3-10秒

**预期结果：** 看到AI分析内容显示在题目下方

**后端日志应该显示：**
```
📝 收到AI分析请求
环境变量检查:
- DOUBAO_API_URL: 已配置
- DOUBAO_API_KEY: 已配置
- DOUBAO_MODEL: 已配置
✅ 题目找到: xxx
🤖 开始调用AI分析...
✅ AI分析成功
```

---

## 如果还是不工作

### 检查清单

- [ ] `backend/.env` 文件存在且包含正确的API配置
- [ ] 运行 `test-ai-config.bat` 显示API调用成功
- [ ] 后端服务已重启（看到新的启动日志）
- [ ] 后端日志显示"环境变量检查: 已配置"
- [ ] MongoDB服务正在运行
- [ ] 前端页面已刷新

### 查看详细日志

点击AI分析按钮后，立即查看后端控制台：

**如果看到"环境变量检查: 未配置"：**
→ 后端服务没有正确加载环境变量，需要重启

**如果看到"豆包API调用失败"：**
→ 查看具体错误信息，可能是API Key或网络问题

**如果没有任何日志输出：**
→ 请求可能没有到达后端，检查前端网络请求

---

## 配置文件示例

`backend/.env` 应该包含：

```env
# AI Configuration (豆包API)
DOUBAO_API_URL=https://ark.cn-beijing.volces.com/api/v3/chat/completions
DOUBAO_API_KEY=你的实际API密钥（类似：7d069c8f-xxxx-xxxx-xxxx-xxxxxxxxxxxx）
DOUBAO_MODEL=你的实际Endpoint-ID（类似：ep-20251119102644-xxxxx）
```

---

## 获取帮助

如果问题仍未解决，请提供以下信息：

1. **test-ai-config.bat 的输出结果**
2. **后端日志的完整输出**（从启动到点击AI分析按钮）
3. **浏览器控制台的错误信息**（F12 → Console）
4. **浏览器网络请求**（F12 → Network → 找到 analyze 请求）

---

## 相关文档

- **AI_ANALYSIS_SETUP.md** - 完整的配置指南
- **AI_ANALYSIS_TROUBLESHOOTING.md** - 详细的故障排查
- **RESTART_SERVICES.md** - 服务重启指南

---

## 一键脚本

我已经创建了以下脚本方便你使用：

| 脚本 | 用途 |
|------|------|
| **test-ai-config.bat** | 测试API配置是否正确 |
| **restart-backend-dev.bat** | 重启后端开发服务 |
| **restart-backend.bat** | 重启后端生产服务 |
| **start-services-simple.bat** | 同时启动前后端 |

---

## 成功标志

当一切正常时，你应该看到：

1. ✅ test-ai-config.bat 显示"API调用成功"
2. ✅ 后端日志显示"环境变量检查: 已配置"
3. ✅ 点击AI分析按钮后，3-10秒内显示分析结果
4. ✅ 分析结果包含知识点、解题思路、误区分析等内容

祝你使用愉快！🎉
