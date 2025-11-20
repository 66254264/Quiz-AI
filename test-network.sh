#!/bin/bash

# 测试网络连接问题
# 使用方法：bash test-network.sh

echo "🔍 诊断网络连接问题..."
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "1. 测试基本网络连接"
echo "=========================================="
echo "测试连接到百度："
curl -I --max-time 5 https://www.baidu.com 2>&1 | head -n 5
echo ""

echo "测试连接到阿里云："
curl -I --max-time 5 https://www.aliyun.com 2>&1 | head -n 5
echo ""

echo "=========================================="
echo "2. 测试 DNS 解析"
echo "=========================================="
echo "当前 DNS 配置："
cat /etc/resolv.conf
echo ""

echo "解析豆包域名："
nslookup ark.cn-beijing.volces.com 2>&1
echo ""

echo "=========================================="
echo "3. 测试到豆包服务器的连接"
echo "=========================================="
echo "测试 TCP 连接到 443 端口："
timeout 5 bash -c 'cat < /dev/null > /dev/tcp/ark.cn-beijing.volces.com/443' 2>&1 && echo -e "${GREEN}✅ 端口 443 可达${NC}" || echo -e "${RED}❌ 端口 443 不可达${NC}"
echo ""

echo "使用 telnet 测试（如果可用）："
timeout 5 telnet ark.cn-beijing.volces.com 443 2>&1 | head -n 5 || echo "telnet 不可用或连接失败"
echo ""

echo "使用 nc 测试（如果可用）："
timeout 5 nc -zv ark.cn-beijing.volces.com 443 2>&1 || echo "nc 不可用或连接失败"
echo ""

echo "=========================================="
echo "4. 测试 curl 详细信息"
echo "=========================================="
echo "使用 curl 详细模式测试："
curl -v --max-time 10 https://ark.cn-beijing.volces.com 2>&1 | head -n 30
echo ""

echo "=========================================="
echo "5. 检查路由"
echo "=========================================="
echo "路由表："
ip route | head -n 10
echo ""

echo "默认网关："
ip route | grep default
echo ""

echo "=========================================="
echo "6. 检查网络接口"
echo "=========================================="
echo "网络接口状态："
ip addr show | grep -E "inet |UP"
echo ""

echo "=========================================="
echo "7. 检查防火墙状态"
echo "=========================================="
echo "firewalld 状态："
systemctl status firewalld --no-pager | head -n 5
echo ""

echo "iptables 规则："
sudo iptables -L -n | head -n 20
echo ""

echo "=========================================="
echo "8. 测试其他 HTTPS 服务"
echo "=========================================="
echo "测试 GitHub API："
curl -I --max-time 5 https://api.github.com 2>&1 | head -n 5
echo ""

echo "测试 Google："
curl -I --max-time 5 https://www.google.com 2>&1 | head -n 5
echo ""

echo "=========================================="
echo "诊断完成"
echo "=========================================="
echo ""
echo "📋 可能的问题："
echo ""
echo "1. 阿里云安全组限制："
echo "   - 登录阿里云控制台"
echo "   - ECS 实例 → 安全组 → 配置规则"
echo "   - 检查【出方向】规则"
echo "   - 添加规则：协议=TCP, 端口=443, 目标=0.0.0.0/0, 动作=允许"
echo ""
echo "2. DNS 解析问题："
echo "   - 修改 DNS: sudo vi /etc/resolv.conf"
echo "   - 添加: nameserver 8.8.8.8"
echo ""
echo "3. 网络配置问题："
echo "   - 检查网络接口是否正常"
echo "   - 检查默认路由是否存在"
echo ""
echo "4. 防火墙阻止："
echo "   - 临时关闭测试: sudo systemctl stop firewalld"
echo "   - 如果可以访问，则配置防火墙规则"
echo ""
