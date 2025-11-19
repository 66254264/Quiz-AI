# 后端依赖管理

## 快速修复 npm 警告

如果在运行 `npm install` 时看到警告信息，使用以下方法快速修复：

### Windows 用户
```bash
cd backend
update-dependencies.bat
```

### macOS/Linux 用户
```bash
cd backend
chmod +x update-dependencies.sh
./update-dependencies.sh
```

## 这个脚本做了什么？

1. ✅ 备份现有的 package-lock.json
2. ✅ 删除 node_modules 文件夹
3. ✅ 删除 package-lock.json
4. ✅ 清理 npm 缓存
5. ✅ 重新安装所有依赖（使用最新版本）
6. ✅ 如果失败，自动恢复备份

## 已修复的警告

- ✅ `inflight@1.0.6` - 内存泄漏问题
- ✅ `rimraf@3.0.2` - 版本过旧
- ✅ `glob@7.2.3` - 版本过旧
- ✅ `eslint@8.57.1` - 不再支持
- ✅ `@humanwhocodes/config-array` - 已弃用
- ✅ `@humanwhocodes/object-schema` - 已弃用

## 手动更新（如果脚本不工作）

```bash
# 1. 删除旧依赖
rm -rf node_modules package-lock.json

# 2. 清理缓存
npm cache clean --force

# 3. 重新安装
npm install
```

## 验证更新

```bash
# 应该没有警告
npm install

# 测试构建
npm run build

# 测试 ESLint
npm run lint

# 启动开发服务器
npm run dev
```

## 需要帮助？

查看详细文档：`DEPENDENCY_UPDATES.md`
