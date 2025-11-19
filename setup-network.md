# 快速配置局域网访问

## 你的 IP 地址
```
your ip
```

## 配置步骤

### 1. 创建前端环境变量文件
在 `frontend` 目录下创建 `.env` 文件：

```bash
cd frontend
```

创建 `.env` 文件，内容如下：
```env
VITE_API_URL=http://your ip:5000/api
```

### 2. 配置防火墙（Windows PowerShell 管理员）
```powershell
New-NetFirewallRule -DisplayName "Quiz System Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Quiz System Backend" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

### 3. 启动服务

#### 终端 1 - 后端
```bash
cd backend
npm run dev
```

#### 终端 2 - 前端
```bash
cd frontend
npm run dev
```

### 4. 访问地址

**本机访问**：
- http://localhost:3000

**局域网其他设备访问**：
- http://your-ip:3000

## 测试

### 测试后端
在浏览器访问：
```
http://your-ip:5000/health
```

应该返回：
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

### 测试前端
在浏览器访问：
```
http://your-ip:3000
```

应该看到登录页面。

## 注意事项

⚠️ **每次 IP 地址变化后**，需要更新 `frontend/.env` 文件并重启前端服务！

⚠️ **修改 .env 后必须重启前端**，否则不会生效！

## 本地开发

如果只在本机开发，使用 `.env.development`：
```bash
cd frontend
copy .env.development .env
```

这样 API URL 会是 `http://localhost:5000/api`
