# 姓名显示顺序修改

## 修改内容

将所有显示姓名的地方改为"姓+名"的顺序，符合中文习惯。

## 修改的文件

### 1. frontend/src/components/common/Navbar.tsx

#### 桌面端导航栏
**修改前**：
```tsx
{user.profile.firstName} {user.profile.lastName}
// 显示为：三 张（名 姓）
```

**修改后**：
```tsx
{user.profile.lastName}{user.profile.firstName}
// 显示为：张三（姓名）
```

#### 移动端菜单
**修改前**：
```tsx
{user.profile.firstName} {user.profile.lastName}
// 显示为：三 张（名 姓）
```

**修改后**：
```tsx
{user.profile.lastName}{user.profile.firstName}
// 显示为：张三（姓名）
```

### 2. backend/src/controllers/analyticsController.ts

#### 学生表现分析
**修改前**：
```typescript
studentName: `${student.profile.firstName} ${student.profile.lastName}`
// 返回：三 张（名 姓）
```

**修改后**：
```typescript
studentName: `${student.profile.lastName}${student.profile.firstName}`
// 返回：张三（姓名）
```

## 显示效果

### 示例用户信息
```json
{
  "profile": {
    "firstName": "三",
    "lastName": "张"
  }
}
```

### 修改前
- 导航栏（桌面端）：显示 "三 张"
- 导航栏（移动端）：显示 "三 张"
- 学生表现列表：显示 "三 张"

### 修改后
- 导航栏（桌面端）：显示 "张三"
- 导航栏（移动端）：显示 "张三"
- 学生表现列表：显示 "张三"

## 影响范围

### 已修改
- ✅ 导航栏（桌面端）
- ✅ 导航栏（移动端）
- ✅ 统计分析 - 学生表现列表

### 不受影响
- ✅ 注册表单（输入框顺序已经是姓在前）
- ✅ 数据库存储（firstName 和 lastName 字段名不变）

## 数据存储说明

虽然显示顺序改为"姓+名"，但数据库中的字段名保持不变：
- `firstName`: 存储"名"
- `lastName`: 存储"姓"

这样做的好处：
1. 保持数据库结构稳定
2. 与国际惯例一致（firstName, lastName）
3. 只需在显示层调整顺序

## 测试建议

### 测试 1: 教师端
1. 以教师身份登录
2. 查看右上角导航栏
3. **预期**：显示"姓名"格式，如"张三"

### 测试 2: 学生端
1. 以学生身份登录
2. 查看右上角导航栏
3. **预期**：显示"姓名"格式，如"李四"

### 测试 3: 移动端
1. 缩小浏览器窗口到移动端尺寸
2. 点击菜单按钮
3. 查看用户名显示
4. **预期**：显示"姓名"格式

### 测试 4: 新注册用户
1. 注册新用户：
   - 姓：王
   - 名：五
2. 登录后查看导航栏
3. **预期**：显示"王五"

### 测试 5: 统计分析页面
1. 以教师身份登录
2. 进入"统计分析"页面
3. 选择一个测验
4. 点击"学生表现"标签
5. 查看学生列表中的姓名
6. **预期**：所有学生姓名显示为"姓名"格式

## 其他显示姓名的地方

目前只在导航栏显示用户姓名。如果将来在其他地方显示姓名，请使用相同的格式：

```tsx
// ✅ 正确的显示方式
{user.profile.lastName}{user.profile.firstName}

// ❌ 错误的显示方式
{user.profile.firstName} {user.profile.lastName}
```

## 注意事项

1. **无空格**：姓和名之间没有空格，符合中文习惯
2. **字段名不变**：数据库字段名保持 firstName 和 lastName
3. **只改显示**：只修改前端显示逻辑，不影响数据存储
4. **国际化考虑**：如果将来需要支持英文名，可能需要根据语言设置调整显示顺序

## 需要重启

### 前端
前端修改会自动热更新，无需重启。

### 后端
后端修改需要重启服务：
```bash
cd backend
npm run dev
```

## 总结

- ✅ 导航栏姓名显示已改为"姓+名"顺序
- ✅ 统计分析页面学生姓名已改为"姓+名"顺序
- ✅ 符合中文姓名习惯
- ✅ 数据库结构不变
- ✅ 前端和后端都已修改
- ⚠️ 需要重启后端服务
