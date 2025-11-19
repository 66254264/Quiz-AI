# 性能和安全优化文档

本文档描述了在多学生答题系统中实施的安全防护措施和性能优化。

## 安全防护措施 (Requirements 6.4, 6.5)

### 1. API速率限制

实现了多层次的速率限制策略：

- **通用API限制**: 15分钟内每个IP最多100个请求
- **认证端点限制**: 15分钟内每个IP最多5次登录/注册尝试（防止暴力破解）
- **测验提交限制**: 5分钟内每个IP最多10次提交（防止垃圾提交）
- **题目创建限制**: 1分钟内每个IP最多10次创建（防止垃圾题目）
- **分析端点限制**: 1分钟内每个IP最多30次请求（防止过度查询）

**文件位置**: `backend/src/middleware/rateLimiter.ts`

### 2. 输入验证和清理

#### NoSQL注入防护
- 自动移除或替换危险的MongoDB操作符（`$`, `.`）
- 递归清理请求体、查询参数和URL参数

#### XSS防护
- 移除HTML标签（`<script>`, `<iframe>`）
- 清理JavaScript协议和事件处理器
- 递归处理所有字符串输入

**文件位置**: `backend/src/middleware/sanitize.ts`

### 3. CORS和安全头配置

#### CORS配置
- 白名单机制，仅允许特定来源
- 支持凭证传递
- 限制HTTP方法和请求头

#### 安全头
- **Content Security Policy**: 限制资源加载来源
- **HSTS**: 强制HTTPS连接
- **X-Frame-Options**: 防止点击劫持
- **X-Content-Type-Options**: 防止MIME类型嗅探
- **Referrer Policy**: 控制引用信息泄露

**文件位置**: `backend/src/middleware/security.ts`

### 4. 攻击检测和日志

- 检测路径遍历攻击模式
- 检测SQL/NoSQL注入模式
- 检测XSS攻击模式
- 记录可疑请求的详细信息（IP、URL、User-Agent等）

### 5. 请求大小限制

- 最大请求体大小：10MB
- 防止大负载攻击
- 超过限制返回413错误

## 性能优化 (Requirement 5.4)

### 1. 前端代码分割和懒加载

#### 路由级代码分割
使用React的`lazy()`和`Suspense`实现按需加载：

```typescript
const QuestionManagement = lazy(() => import('./pages/teacher/QuestionManagement'))
const Analytics = lazy(() => import('./pages/teacher/Analytics'))
const QuizList = lazy(() => import('./pages/student/QuizList'))
```

**优势**:
- 减少初始加载时间
- 按需加载功能模块
- 改善首屏渲染性能

**文件位置**: `frontend/src/App.tsx`

#### Vite构建优化
- 手动代码分块（vendor chunks, feature chunks）
- 生产环境移除console.log
- 内联小于4KB的资源
- 优化依赖预构建

**文件位置**: `frontend/vite.config.ts`

### 2. API响应缓存

#### 前端缓存
实现了智能的内存缓存系统：

- **缓存策略**: 仅缓存GET请求
- **TTL配置**: 
  - SHORT: 1分钟
  - MEDIUM: 5分钟
  - LONG: 15分钟
  - VERY_LONG: 1小时
- **自动失效**: 
  - POST/PUT/DELETE操作自动清除相关缓存
  - 定期清理过期条目
- **模式匹配**: 支持正则表达式批量清除

**文件位置**: 
- `frontend/src/utils/cache.ts`
- `frontend/src/utils/api.ts`
- `frontend/src/services/questionService.ts`

#### 后端缓存
实现了服务器端响应缓存：

- **缓存范围**: 
  - 分析数据（5-15分钟）
  - 测验列表（5分钟）
  - 测验结果（15分钟）
- **用户隔离**: 每个用户独立的缓存空间
- **自动失效**: 提交测验时清除分析缓存

**文件位置**: 
- `backend/src/middleware/cache.ts`
- `backend/src/routes/analyticsRoutes.ts`
- `backend/src/routes/quizRoutes.ts`

### 3. 数据库查询优化

#### 索引策略
为所有模型添加了性能索引：

**Question模型**:
- `createdBy`: 按创建者查询
- `difficulty`: 按难度筛选
- `tags`: 按标签筛选
- `createdAt`: 按时间排序
- 全文搜索索引（title, content）

**QuizSession模型**:
- `createdBy`: 按创建者查询
- `isActive`: 按状态筛选
- `createdAt`: 按时间排序
- 全文搜索索引（title, description）

**Submission模型**:
- `quizId`: 按测验查询
- `studentId`: 按学生查询
- `quizId + studentId`: 复合唯一索引（防止重复提交）
- `submitTime`: 按提交时间排序
- `score`: 按分数排序

**文件位置**: 
- `backend/src/models/Question.ts`
- `backend/src/models/QuizSession.ts`
- `backend/src/models/Submission.ts`

### 4. 响应压缩

使用gzip/deflate压缩所有HTTP响应：

- **压缩级别**: 6（平衡速度和压缩率）
- **自动检测**: 支持客户端压缩能力
- **可选禁用**: 通过`x-no-compression`头控制

**文件位置**: `backend/src/server.ts`

### 5. 性能监控工具

提供了完整的性能监控工具集：

- **渲染时间测量**: 检测慢组件
- **API调用性能**: 记录请求耗时
- **防抖和节流**: 优化高频操作
- **懒加载图片**: Intersection Observer实现
- **页面加载指标**: 自动记录性能数据
- **内存使用监控**: 跟踪JS堆使用情况

**文件位置**: `frontend/src/utils/performance.ts`

## 配置说明

### 环境变量

在`backend/.env`中配置以下变量：

```env
# 安全配置
TRUST_PROXY=1
CORS_ORIGIN=http://localhost:3000

# 速率限制
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX_REQUESTS=5
SUBMISSION_RATE_LIMIT_WINDOW_MS=300000
SUBMISSION_RATE_LIMIT_MAX_REQUESTS=10

# 请求大小限制
MAX_REQUEST_SIZE=10mb
```

## 性能指标

### 预期改进

1. **初始加载时间**: 减少40-60%（通过代码分割）
2. **API响应时间**: 减少70-90%（缓存命中时）
3. **数据库查询**: 减少50-80%（索引优化）
4. **传输大小**: 减少60-70%（gzip压缩）
5. **重复请求**: 减少80-95%（智能缓存）

### 监控建议

1. 使用浏览器开发工具监控网络请求
2. 检查控制台的性能日志
3. 监控缓存命中率
4. 跟踪API响应时间
5. 定期审查安全日志

## 最佳实践

### 开发时
- 使用性能监控工具识别瓶颈
- 避免不必要的重新渲染
- 合理使用缓存TTL

### 生产环境
- 启用所有安全中间件
- 配置适当的速率限制
- 定期审查安全日志
- 监控缓存效率
- 使用CDN加速静态资源

## 安全检查清单

- [x] API速率限制已配置
- [x] 输入验证和清理已实施
- [x] CORS白名单已配置
- [x] 安全头已设置
- [x] XSS防护已启用
- [x] NoSQL注入防护已启用
- [x] 请求大小限制已设置
- [x] 可疑活动日志已启用
- [x] 参数污染防护已启用

## 性能检查清单

- [x] 代码分割已实现
- [x] 懒加载已配置
- [x] API缓存已实施
- [x] 数据库索引已创建
- [x] 响应压缩已启用
- [x] 构建优化已配置
- [x] 性能监控工具已添加
- [x] 资源优化已配置

## 维护建议

1. **定期更新依赖**: 保持安全补丁最新
2. **审查日志**: 检查可疑活动和性能问题
3. **调整限制**: 根据实际使用情况调整速率限制
4. **清理缓存**: 必要时手动清理缓存
5. **性能测试**: 定期进行负载测试
