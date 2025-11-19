# 测验级联删除功能

## 功能说明

当教师删除一个测验时，系统会自动删除与该测验相关的所有数据，包括：
1. 测验本身
2. 学生提交的答题记录
3. 题目的 AI 分析数据

这样可以确保数据的一致性，避免孤立数据残留。

## 修改内容

### backend/src/controllers/quizController.ts

#### 修改前
```typescript
export const deleteQuiz = async (req: Request, res: Response) => {
  // ... 验证代码 ...
  
  // 只删除测验本身
  const quiz = await QuizSession.findOneAndDelete({
    _id: id,
    createdBy: userId
  });
  
  // ❌ 问题：提交记录和分析数据没有被删除
};
```

#### 修改后
```typescript
export const deleteQuiz = async (req: Request, res: Response) => {
  // ... 验证代码 ...
  
  // 1. 删除相关的提交记录
  const deletedSubmissions = await Submission.deleteMany({ quizId: id });
  
  // 2. 删除相关的题目分析数据
  const deletedAnalyses = await QuestionAnalysis.deleteMany({ quizId: id });
  
  // 3. 删除测验本身
  await QuizSession.findByIdAndDelete(id);
  
  // ✅ 返回删除的数据统计
  return {
    message: '测验及相关数据删除成功',
    deletedSubmissions: deletedSubmissions.deletedCount,
    deletedAnalyses: deletedAnalyses.deletedCount
  };
};
```

## 删除流程

```
删除测验请求
    ↓
验证用户权限
    ↓
查找测验是否存在
    ↓
删除提交记录 (Submission)
    ↓
删除分析数据 (QuestionAnalysis)
    ↓
删除测验本身 (QuizSession)
    ↓
返回删除统计
```

## 删除的数据

### 1. 提交记录 (Submission)
- 学生的答题记录
- 分数和正确率
- 答题时间
- 每道题的答案

**查询条件**：`{ quizId: id }`

### 2. 分析数据 (QuestionAnalysis)
- 题目的 AI 分析结果
- 错误原因分析
- 改进建议

**查询条件**：`{ quizId: id }`

### 3. 测验本身 (QuizSession)
- 测验配置
- 题目列表
- 时间限制等

## 返回数据

### 成功响应
```json
{
  "success": true,
  "data": {
    "message": "测验及相关数据删除成功",
    "quizId": "测验ID",
    "deletedSubmissions": 15,  // 删除的提交记录数
    "deletedAnalyses": 10       // 删除的分析数据数
  }
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "message": "测验未找到或无权限删除",
    "code": "QUIZ_NOT_FOUND"
  }
}
```

## 日志输出

删除操作会在控制台输出详细日志：

```
🗑️ 删除了 15 条提交记录
🗑️ 删除了 10 条分析数据
🗑️ 删除了测验: 期末考试
```

## 测试场景

### 测试 1: 删除有提交记录的测验
1. 创建一个测验
2. 让学生提交答题
3. 教师删除该测验
4. **预期**：
   - 测验被删除 ✅
   - 提交记录被删除 ✅
   - 统计分析中不再显示该测验 ✅

### 测试 2: 删除有 AI 分析的测验
1. 创建一个测验
2. 生成题目的 AI 分析
3. 教师删除该测验
4. **预期**：
   - 测验被删除 ✅
   - AI 分析数据被删除 ✅

### 测试 3: 删除空测验
1. 创建一个测验（无提交记录）
2. 教师删除该测验
3. **预期**：
   - 测验被删除 ✅
   - 返回 `deletedSubmissions: 0` ✅
   - 返回 `deletedAnalyses: 0` ✅

### 测试 4: 权限验证
1. 教师 A 创建测验
2. 教师 B 尝试删除该测验
3. **预期**：
   - 删除失败 ❌
   - 返回 "测验未找到或无权限删除"

## 数据库操作

### 删除提交记录
```javascript
await Submission.deleteMany({ quizId: id });
```

### 删除分析数据
```javascript
await QuestionAnalysis.deleteMany({ quizId: id });
```

### 删除测验
```javascript
await QuizSession.findByIdAndDelete(id);
```

## 性能考虑

### 批量删除
使用 `deleteMany()` 进行批量删除，比逐条删除更高效。

### 事务处理（可选）
如果需要确保原子性，可以使用 MongoDB 事务：

```typescript
const session = await mongoose.startSession();
session.startTransaction();

try {
  await Submission.deleteMany({ quizId: id }, { session });
  await QuestionAnalysis.deleteMany({ quizId: id }, { session });
  await QuizSession.findByIdAndDelete(id, { session });
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

## 注意事项

1. **不可恢复**：删除操作是永久性的，无法恢复
2. **权限检查**：只有创建者可以删除测验
3. **级联删除**：自动删除所有相关数据
4. **日志记录**：所有删除操作都有日志记录

## 前端影响

### 测验管理页面
- 删除测验后，列表自动刷新
- 显示删除成功的提示

### 统计分析页面
- 删除的测验不再出现在下拉列表中
- 如果当前选中的测验被删除，自动切换到其他测验

## 数据一致性

### 删除前
```
QuizSession (测验)
    ├── Submission (提交记录 1)
    ├── Submission (提交记录 2)
    ├── Submission (提交记录 3)
    ├── QuestionAnalysis (分析 1)
    └── QuestionAnalysis (分析 2)
```

### 删除后
```
(所有数据都被删除)
```

## 需要重启

修改后需要重启后端服务：
```bash
cd backend
npm run dev
```

## 缓存清除

### 后端缓存清除
删除测验时会自动清除统计分析相关的缓存：

```typescript
// backend/src/routes/teacherQuizRoutes.ts
router.delete(
  '/:id',
  invalidateCacheMiddleware(/\/analytics/), // 清除统计分析缓存
  // ...
  deleteQuiz
);
```

### 前端数据刷新

#### 1. 测验管理页面
删除成功后自动刷新列表：
```typescript
setRefreshTrigger(prev => prev + 1);
```

#### 2. 统计分析页面
- ✅ 添加了刷新按钮，可手动刷新测验列表
- ✅ 页面获得焦点时自动刷新（从其他页面返回时）
- ✅ 删除的测验会从下拉列表中消失

## 用户体验流程

1. 教师在"测验管理"页面删除测验
2. 系统删除测验及相关数据
3. 显示成功提示
4. 测验列表自动刷新
5. 切换到"统计分析"页面
6. 页面自动刷新，删除的测验不再显示
7. 或者点击刷新按钮手动刷新

## 总结

- ✅ 删除测验时自动删除相关数据
- ✅ 包括提交记录和分析数据
- ✅ 返回删除统计信息
- ✅ 添加详细的日志输出
- ✅ 自动清除后端缓存
- ✅ 前端自动刷新数据
- ✅ 统计分析页面添加刷新按钮
- ✅ 页面焦点时自动刷新
- ✅ 确保数据一致性
- ⚠️ 需要重启后端服务
