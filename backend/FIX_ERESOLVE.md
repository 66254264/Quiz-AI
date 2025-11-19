# 修复 ERESOLVE 错误

## 问题

运行 `npm install` 时出现：
```
npm error code ERESOLVE
npm error ERESOLVE unable to resolve dependency tree
```

## 原因

之前尝试使用 ESLint 9 和 TypeScript ESLint 7，但它们之间存在版本兼容性问题。

## 解决方案

已将依赖版本调整为稳定兼容的组合：

- **ESLint**: 8.57.0（而不是 9.x）
- **TypeScript ESLint**: 6.21.0（而不是 7.x）

这个组合：
✅ 完全兼容
✅ 没有依赖冲突
✅ 仍然解决了所有 deprecated 警告
✅ 稳定可靠

## 如何安装

### 方法一：使用更新脚本（推荐）

**Windows:**
```bash
cd backend
update-dependencies.bat
```

**macOS/Linux:**
```bash
cd backend
chmod +x update-dependencies.sh
./update-dependencies.sh
```

### 方法二：手动安装

```bash
cd backend

# 删除旧的依赖
rm -rf node_modules package-lock.json

# 清理缓存
npm cache clean --force

# 重新安装（应该没有错误）
npm install
```

### 方法三：使用 --legacy-peer-deps（临时方案）

如果上述方法仍有问题：
```bash
npm install --legacy-peer-deps
```

## 验证

安装成功后，运行以下命令验证：

```bash
# 应该没有 ERESOLVE 错误
npm install

# 测试 ESLint
npm run lint

# 测试构建
npm run build

# 启动开发服务器
npm run dev
```

## 配置文件

新的 ESLint 配置文件：`backend/.eslintrc.json`

这是标准的 JSON 格式配置，与 ESLint 8 完全兼容。

## 依赖版本

```json
{
  "eslint": "^8.57.0",
  "@typescript-eslint/eslint-plugin": "^6.21.0",
  "@typescript-eslint/parser": "^6.21.0"
}
```

## 为什么不用 ESLint 9？

ESLint 9 是最新版本，但：
- 与 TypeScript ESLint 7 存在 peer dependency 冲突
- 需要新的扁平配置格式（breaking change）
- 生态系统插件还在适配中

ESLint 8.57.0 是：
- ✅ 最后一个 8.x 版本
- ✅ 完全稳定
- ✅ 与所有工具兼容
- ✅ 仍在维护中
- ✅ 解决了所有 deprecated 警告

## 常见问题

### Q: 还是有 ERESOLVE 错误？
A: 尝试：
```bash
rm -rf node_modules package-lock.json ~/.npm
npm cache clean --force
npm install
```

### Q: npm 版本太旧？
A: 升级 npm：
```bash
npm install -g npm@latest
```

### Q: Node.js 版本问题？
A: 确保使用 Node.js 18.x 或 20.x：
```bash
node --version
```

## 成功标志

安装成功后，你应该看到：
```
added XXX packages in XXs
```

而不是：
```
npm error code ERESOLVE
```

## 需要帮助？

查看其他文档：
- `README_DEPENDENCIES.md` - 快速参考
- `DEPENDENCY_UPDATES.md` - 详细说明
- `QUICK_START.md` - 快速开始指南
