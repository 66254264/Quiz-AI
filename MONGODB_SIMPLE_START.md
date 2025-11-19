# MongoDB 自动启动 - 简化版

## ✨ 功能

`start-services.bat` 会自动执行 `net start MongoDB` 启动 MongoDB 服务。

## 🚀 使用方法

### 一键启动
```bash
start-services.bat
```

脚本会：
1. 检查 MongoDB 是否运行
2. 如果未运行，执行 `net start MongoDB`
3. 继续启动后端和前端服务

### 单独管理 MongoDB
```bash
# 启动 MongoDB
start-mongodb.bat

# 停止 MongoDB
stop-mongodb.bat
```

## 📋 前提条件

MongoDB 必须已安装并配置为 Windows 服务。

### 安装 MongoDB
1. 下载：https://www.mongodb.com/try/download/community
2. 安装时选择：
   - ✅ "Install MongoDB as a Service"
   - ✅ Service Name: MongoDB
   - ✅ Run service as Network Service user
3. 完成安装

### 验证安装
```bash
# 检查服务是否存在
sc query MongoDB

# 手动启动测试
net start MongoDB
```

## 💡 常见问题

### Q: 提示"服务名无效"
**A:** MongoDB 未安装或未配置为服务
- 重新安装 MongoDB，确保选择"作为服务安装"
- 或使用 MongoDB Atlas（云数据库）

### Q: 提示"拒绝访问"
**A:** 需要管理员权限
- 右键点击脚本 → "以管理员身份运行"

### Q: 不想安装本地 MongoDB
**A:** 使用 MongoDB Atlas
1. 注册：https://www.mongodb.com/cloud/atlas/register
2. 创建免费集群
3. 获取连接字符串
4. 在 `backend/.env` 中配置：
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quiz-system
   ```

## 🎯 优势

- ✅ **简单**：一行命令 `net start MongoDB`
- ✅ **可靠**：使用 Windows 服务管理
- ✅ **标准**：MongoDB 官方推荐方式
- ✅ **高效**：无需复杂的路径查找
- ✅ **稳定**：服务自动管理生命周期

## 📝 命令说明

### net start MongoDB
- 启动名为"MongoDB"的 Windows 服务
- 需要管理员权限
- 服务必须已存在

### net stop MongoDB
- 停止名为"MongoDB"的 Windows 服务
- 需要管理员权限
- 优雅地关闭数据库连接

## 🔗 相关资源

- [MongoDB 安装指南](https://docs.mongodb.com/manual/installation/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Windows 服务管理](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/net-start)
