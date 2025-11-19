# 局域网访问配置指南

## 已完成的配置

### 1. 前端配置（Vite）
在 `frontend/vite.config.ts` 中添加了：
```typescript
server: {
  host: '0.0.0.0', // 监听所有网络接口
  port: 3000,
  // ...
}
```

### 2. 后端配置（Express）
在 `backend/src/server.ts` 中修改了：
```typescript
app.listen(PORT, '0.0.0.0', () => {
  // 监听所有网络接口
});
```

## 使用步骤

### 步骤 1: 获取本机 IP 地址

#### Windows
打开命令提示符（CMD）或 PowerShell，运行：
```cmd
ipconfig
```
查找 "IPv4 地址"，通常是 `192.168.x.x` 或 `10.x.x.x` 格式。

#### macOS/Linux
打开终端，运行：
```bash
ifconfig
# 或
ip addr show
```

**示例输出**：
```
以太网适配器 以太网:
   IPv4 地址 . . . . . . . . . . . . : 192.168.1.100
```

### 步骤 2: 配置前端环境变量

复制 `.env.network` 为 `.env`：
```bash
cd frontend
copy .env.network .env
```

然后编辑 `frontend/.env`，将 IP 地址改为你的实际 IP：
```env
VITE_API_URL=http://你的IP:5000/api
```

例如：
```env
VITE_API_URL=http://your-ip:5000/api
```

### 步骤 3: 启动服务

#### 启动后端
```bash
cd backend
npm run dev
```
后端将在 `http://0.0.0.0:5000` 启动

#### 启动前端
```bash
cd frontend
npm run dev
```
前端将在 `http://0.0.0.0:3000` 启动

启动后，Vite 会显示：
```
  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.1.100:3000/
```

### 步骤 4: 在其他设备访问

假设你的电脑 IP 是 `192.168.1.100`，在同一局域网的其他设备上：

1. 打开浏览器
2. 访问：`http://192.168.1.100:3000`

## 防火墙配置

### Windows 防火墙

如果无法访问，需要允许端口通过防火墙：

#### 方法 1: 使用 PowerShell（管理员权限）
```powershell
# 允许前端端口 3000
New-NetFirewallRule -DisplayName "Quiz System Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# 允许后端端口 5000
New-NetFirewallRule -DisplayName "Quiz System Backend" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

#### 方法 2: 使用图形界面
1. 打开"Windows Defender 防火墙"
2. 点击"高级设置"
3. 选择"入站规则" → "新建规则"
4. 选择"端口" → "TCP" → 输入 `3000` 和 `5000`
5. 选择"允许连接"
6. 完成设置

### macOS 防火墙

macOS 默认允许入站连接，通常不需要额外配置。

如果启用了防火墙：
1. 系统偏好设置 → 安全性与隐私 → 防火墙
2. 点击"防火墙选项"
3. 添加 Node.js 应用程序并允许连接

### Linux 防火墙（UFW）

```bash
# 允许端口 3000
sudo ufw allow 3000/tcp

# 允许端口 5000
sudo ufw allow 5000/tcp

# 重新加载防火墙
sudo ufw reload
```

## 测试连接

### 1. 测试后端
在其他设备的浏览器访问：
```
http://192.168.1.100:5000/health
```
应该返回：
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. 测试前端
在其他设备的浏览器访问：
```
http://192.168.1.100:3000
```
应该看到登录页面。

## 常见问题

### 问题 1: 无法访问

**可能原因**：
- 防火墙阻止了端口
- IP 地址错误
- 设备不在同一局域网

**解决方案**：
1. 检查防火墙设置
2. 确认 IP 地址正确
3. 确保设备连接到同一 WiFi/路由器
4. 尝试 ping 测试：
   ```cmd
   ping 192.168.1.100
   ```

### 问题 2: 前端可以访问，但 API 请求失败（Network Error）

**原因**：前端 API URL 配置错误

**解决方案**：
检查 `frontend/.env` 文件：
```env
VITE_API_URL=http://你的实际IP:5000/api
```

**重要**：修改 `.env` 后必须重启前端服务！

```bash
# 停止前端服务（Ctrl+C）
# 然后重新启动
cd frontend
npm run dev
```

### 问题 3: 手机无法访问

**检查清单**：
- [ ] 手机和电脑在同一 WiFi
- [ ] 使用正确的 IP 地址
- [ ] 防火墙已配置
- [ ] 服务正在运行

### 问题 4: CORS 错误

如果看到 CORS 错误，检查后端的 CORS 配置：

在 `backend/src/server.ts` 中：
```typescript
app.use(cors({
  origin: '*', // 开发环境允许所有来源
  credentials: true
}));
```

## 生产环境注意事项

⚠️ **安全警告**：以上配置适用于开发和局域网测试。

在生产环境中：
1. **不要使用 `0.0.0.0`**：指定具体的 IP 地址
2. **配置 CORS**：只允许特定的域名
3. **使用 HTTPS**：加密传输数据
4. **使用反向代理**：如 Nginx
5. **配置防火墙**：只开放必要的端口

## 快速命令参考

### 查看 IP 地址
```cmd
# Windows
ipconfig

# macOS/Linux
ifconfig
```

### 测试端口是否开放
```cmd
# Windows
Test-NetConnection -ComputerName 192.168.1.100 -Port 3000

# macOS/Linux
nc -zv 192.168.1.100 3000
```

### 查看正在监听的端口
```cmd
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# macOS/Linux
lsof -i :3000
lsof -i :5000
```

## 移动设备访问

### iOS Safari / Android Chrome
1. 确保手机连接到同一 WiFi
2. 打开浏览器
3. 输入：`http://192.168.1.100:3000`
4. 可以添加到主屏幕作为 Web App

### 二维码访问（可选）
可以生成二维码方便手机扫描：
- 在线工具：https://www.qr-code-generator.com/
- 输入：`http://192.168.1.100:3000`
- 生成二维码并扫描

## 总结

✅ 已配置前端监听 `0.0.0.0:3000`
✅ 已配置后端监听 `0.0.0.0:5000`
✅ 需要配置防火墙允许端口
✅ 使用本机 IP 地址访问

**访问地址**：`http://<你的IP>:3000`
