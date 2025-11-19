# MongoDB 自动启动功能说明

## ✨ 新功能

`start-services.bat` 现在可以自动启动 MongoDB 服务！

## 🚀 工作流程

### 简单直接
启动服务时，脚本会：
1. ✅ 检查 MongoDB 是否已在运行
2. ✅ 如果未运行，执行 `net start MongoDB`
3. ✅ 显示启动结果

### 前提条件
- MongoDB 已安装并配置为 Windows 服务
- 或使用 MongoDB Atlas（云数据库）

### 如果启动失败
脚本会提示：
- 💡 确保 MongoDB 已安装
- 💡 或使用 MongoDB Atlas
- 💡 或手动运行 `net start MongoDB`

## 📋 新增脚本

### `start-mongodb.bat`
独立的 MongoDB 启动脚本：
- 🚀 执行 `net start MongoDB`
- ✅ 显示启动状态
- 💡 提供失败时的解决方案

### `stop-mongodb.bat`
独立的 MongoDB 停止脚本：
- 🛑 执行 `net stop MongoDB`
- ✅ 显示停止状态
- 💡 提示需要管理员权限

## 🎯 使用场景

### 场景 1：已安装 MongoDB（推荐）
```bash
# 一键启动所有服务（包括 MongoDB）
start-services.bat
```
脚本会自动处理一切！

### 场景 2：使用 MongoDB Atlas
```bash
# 1. 在 backend/.env 中配置连接字符串
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quiz-system

# 2. 启动服务（跳过 MongoDB 检查）
start-services.bat
```

### 场景 3：手动管理 MongoDB
```bash
# 1. 单独启动 MongoDB
start-mongodb.bat

# 2. 启动应用服务
start-services.bat

# 3. 停止 MongoDB
stop-mongodb.bat
```

## ⚙️ MongoDB 服务配置

MongoDB 作为 Windows 服务运行时：
- 📂 数据目录：由 MongoDB 安装时配置
- 🌐 默认端口：27017
- ⚙️ 配置文件：`C:\Program Files\MongoDB\Server\{version}\bin\mongod.cfg`

如需修改配置，请编辑 MongoDB 配置文件或重新安装 MongoDB。

## 🔧 故障排除

### 问题 1：MongoDB 启动失败
**可能原因：**
- 端口 27017 被占用
- 数据目录权限不足
- MongoDB 配置错误

**解决方法：**
```bash
# 1. 检查端口占用
netstat -ano | findstr :27017

# 2. 手动启动查看错误
start-mongodb.bat

# 3. 使用 MongoDB Atlas
# 在 backend/.env 中配置云数据库
```

### 问题 2：找不到 MongoDB
**解决方法：**
```bash
# 选项 1：安装 MongoDB
# 下载：https://www.mongodb.com/try/download/community
# 安装到默认路径

# 选项 2：使用 MongoDB Atlas
# 注册：https://www.mongodb.com/cloud/atlas/register
# 配置连接字符串到 backend/.env

# 选项 3：手动指定路径
# 运行 start-mongodb.bat
# 选择 "手动指定路径" 选项
```

### 问题 3：数据目录错误
**解决方法：**
```bash
# 删除并重新创建数据目录
rmdir /s /q data
mkdir data\db

# 重新启动 MongoDB
start-mongodb.bat
```

## 💡 最佳实践

### 开发环境
```bash
# 推荐：使用本地 MongoDB
1. 安装 MongoDB Community Server
2. 使用 start-services.bat 一键启动
3. 数据存储在本地，速度快
```

### 生产环境
```bash
# 推荐：使用 MongoDB Atlas
1. 注册 MongoDB Atlas 账号
2. 创建集群（免费层可用）
3. 配置连接字符串
4. 无需本地安装 MongoDB
```

### 团队协作
```bash
# 推荐：统一使用 MongoDB Atlas
1. 团队共享一个 Atlas 集群
2. 每个成员配置相同的连接字符串
3. 数据同步，便于协作
```

## 📊 MongoDB 版本支持

脚本支持所有配置为 Windows 服务的 MongoDB 版本。

**推荐安装方式：**
- 下载 MongoDB Community Server
- 安装时选择"作为服务安装"
- 服务名称：MongoDB

## 🔗 相关资源

- [MongoDB 下载](https://www.mongodb.com/try/download/community)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [MongoDB 文档](https://docs.mongodb.com/)
- [批处理脚本指南](BATCH_SCRIPTS_GUIDE.md)

## 📝 更新日志

### v2.0 - MongoDB 自动启动（简化版）
- ✅ 自动启动 MongoDB Windows 服务
- ✅ 使用 `net start MongoDB` 命令
- ✅ 新增独立的 MongoDB 管理脚本
- ✅ 简洁高效的实现
- ✅ 提供清晰的错误提示
