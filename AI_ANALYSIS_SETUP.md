# AI解题分析功能配置指南

## 功能说明

在题目统计分析页面，每道题目下方都有一个"AI解题分析"按钮。点击后会调用豆包AI大模型对题目进行智能分析，包括：

1. 题目考查的知识点
2. 正确答案的解题思路
3. 常见错误选项的误区分析
4. 学习建议

## 配置步骤

### 1. 获取豆包API密钥

1. 访问火山引擎控制台：https://console.volcengine.com/ark
2. 注册/登录账号
3. 创建推理接入点（Endpoint）
4. 选择合适的模型（推荐：doubao-pro-32k）
5. 获取API Key和Endpoint ID

### 2. 配置环境变量

在 `backend/.env` 文件中添加以下配置：

```env
# AI Configuration (豆包API)
DOUBAO_API_URL=https://ark.cn-beijing.volces.com/api/v3/chat/completions
DOUBAO_API_KEY=你的API密钥
DOUBAO_MODEL=你的endpoint-id
```

### 3. 重启后端服务

配置完成后，重启后端服务使配置生效：

```bash
# 停止服务
npm run stop

# 启动服务
npm run start
```

## 使用方法

1. 登录教师账号
2. 进入"统计分析"页面
3. 选择要分析的测验
4. 切换到"题目分析"标签
5. 点击任意题目下方的"AI解题分析"按钮
6. 等待几秒钟，AI分析结果会显示在题目下方
7. 可以点击"收起"按钮隐藏分析结果

## 注意事项

1. **API费用**：豆包API按调用次数和token数量计费，请注意控制使用频率
2. **响应时间**：AI分析通常需要3-10秒，请耐心等待
3. **错误处理**：如果API未配置或调用失败，会显示友好的错误提示
4. **缓存机制**：分析结果会在前端缓存，刷新页面后需要重新分析
5. **权限控制**：只有教师账号可以使用AI分析功能

## API配置说明

### DOUBAO_API_URL
豆包API的接口地址，默认为：
```
https://ark.cn-beijing.volces.com/api/v3/chat/completions
```

### DOUBAO_API_KEY
你的豆包API密钥，格式类似：
```
sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### DOUBAO_MODEL
你的推理接入点ID（Endpoint ID），格式类似：
```
ep-20241119155555-xxxxx
```

## 故障排查

### 问题1：提示"AI分析服务未配置"
- 检查 `.env` 文件中是否正确配置了 `DOUBAO_API_KEY`
- 确保环境变量已生效（重启服务）

### 问题2：提示"AI分析请求超时"
- 检查网络连接
- 豆包API服务可能繁忙，稍后重试

### 问题3：提示"AI分析服务暂时不可用"
- 检查API Key是否正确
- 检查Endpoint ID是否正确
- 查看后端日志获取详细错误信息

## 技术实现

### 后端
- `backend/src/services/doubaoService.ts` - 豆包API调用服务
- `backend/src/controllers/analyticsController.ts` - 添加了 `analyzeQuestion` 方法
- `backend/src/routes/analyticsRoutes.ts` - 添加了 `/questions/:questionId/analyze` 路由

### 前端
- `frontend/src/services/analyticsService.ts` - 添加了 `analyzeQuestion` 方法
- `frontend/src/components/teacher/analytics/QuestionStats.tsx` - 添加了AI分析按钮和结果展示

## 扩展建议

1. **批量分析**：可以添加"批量分析所有题目"功能
2. **分析历史**：将分析结果保存到数据库，避免重复调用API
3. **自定义提示词**：允许教师自定义AI分析的侧重点
4. **多模型支持**：支持切换不同的AI模型（GPT、文心一言等）
