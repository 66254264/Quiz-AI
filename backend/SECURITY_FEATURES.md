# 安全功能概述

## 已实施的安全措施

### 1. 速率限制 (Rate Limiting)
- 通用API: 15分钟/100请求
- 认证端点: 15分钟/5请求
- 测验提交: 5分钟/10请求
- 题目创建: 1分钟/10请求
- 分析查询: 1分钟/30请求

### 2. 输入验证和清理
- NoSQL注入防护（移除 `$` 和 `.` 操作符）
- XSS防护（清理HTML标签和JavaScript）
- 参数污染防护
- 请求大小限制（10MB）

### 3. 安全头配置
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options (防点击劫持)
- X-Content-Type-Options (防MIME嗅探)
- X-XSS-Protection

### 4. CORS配置
- 白名单机制
- 凭证支持
- 方法和头限制

### 5. 攻击检测
- 路径遍历检测
- SQL/NoSQL注入检测
- XSS攻击检测
- 可疑活动日志

## 使用方法

所有安全中间件已自动应用到服务器。无需额外配置即可使用。

## 配置

在 `.env` 文件中调整安全参数：

```env
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_REQUEST_SIZE=10mb
```

## 监控

检查控制台日志以查看：
- 速率限制触发
- 可疑请求警告
- 输入清理通知
