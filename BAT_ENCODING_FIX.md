# 批处理文件中文乱码修复

## 问题原因

Windows 批处理文件中的中文可能出现乱码，原因包括：
1. 文件编码不是 UTF-8
2. 控制台代码页不是 UTF-8 (65001)
3. `chcp` 命令的输出干扰

## 已修复

所有批处理文件已更新：

### 修改内容
```batch
# 之前
@echo off
chcp 65001 >nul

# 现在
@echo off
chcp 65001 >nul 2>&1
cls
```

### 修复说明
1. `chcp 65001 >nul 2>&1` - 完全隐藏 chcp 命令的输出（包括错误）
2. `cls` - 清屏，确保界面干净
3. 文件必须以 UTF-8 编码保存

## 验证文件编码

### 使用 VS Code
1. 打开批处理文件
2. 查看右下角状态栏
3. 应该显示 "UTF-8"
4. 如果不是，点击编码 → "通过编码保存" → 选择 "UTF-8"

### 使用 Notepad++
1. 打开批处理文件
2. 菜单：编码 → 转为 UTF-8 编码
3. 保存文件

### 使用记事本
1. 打开批处理文件
2. 文件 → 另存为
3. 编码选择：UTF-8
4. 保存

## 测试

运行任一批处理文件，中文应该正常显示：

```bash
start-services.bat
```

应该看到：
```
========================================
   多学生测验系统 - 启动服务
========================================

📦 Node.js:
   ✅ 已安装 v18.17.0
...
```

## 如果仍然乱码

### 方法 1：手动设置控制台代码页
```batch
# 在运行批处理文件前，先执行：
chcp 65001
```

### 方法 2：修改控制台属性
1. 右键点击命令提示符标题栏
2. 属性 → 选项
3. 勾选 "使用旧版控制台"（取消勾选）
4. 确定

### 方法 3：使用 PowerShell
PowerShell 对 UTF-8 支持更好：
```powershell
# 在 PowerShell 中运行
.\start-services.bat
```

### 方法 4：使用 Windows Terminal
Windows Terminal 默认支持 UTF-8：
1. 安装 Windows Terminal（Microsoft Store）
2. 在 Windows Terminal 中运行批处理文件

## 文件列表

已修复的批处理文件：
- ✅ start-services.bat
- ✅ stop-services.bat
- ✅ restart-services.bat
- ✅ start-mongodb.bat
- ✅ stop-mongodb.bat
- ✅ check-status.bat

## Git 配置

`.gitattributes` 已配置，确保批处理文件使用正确的行尾符：

```
*.bat text eol=crlf
```

这确保在不同系统间克隆时，批处理文件保持 Windows 格式。

## 最佳实践

### 编辑批处理文件时
1. 使用支持 UTF-8 的编辑器（VS Code、Notepad++）
2. 确保文件保存为 UTF-8 编码
3. 保持 CRLF 行尾符（Windows 标准）
4. 测试运行确保中文正常显示

### 创建新批处理文件时
```batch
@echo off
chcp 65001 >nul 2>&1
cls
echo 你的中文内容
pause
```

## 常见问题

### Q: 为什么使用 `>nul 2>&1`？
A: 
- `>nul` - 隐藏标准输出
- `2>&1` - 将错误输出重定向到标准输出（也被隐藏）
- 完全静默 chcp 命令

### Q: 为什么要 `cls`？
A: 清屏确保界面干净，避免之前的输出干扰

### Q: UTF-8 和 UTF-8 BOM 有什么区别？
A: 
- UTF-8：无 BOM，推荐用于批处理文件
- UTF-8 BOM：有字节顺序标记，可能导致问题

### Q: 可以使用 GBK 编码吗？
A: 不推荐。UTF-8 是国际标准，兼容性更好。

## 参考资料

- [Windows 代码页](https://docs.microsoft.com/en-us/windows/win32/intl/code-page-identifiers)
- [UTF-8 编码](https://en.wikipedia.org/wiki/UTF-8)
- [批处理文件最佳实践](https://ss64.com/nt/syntax.html)
