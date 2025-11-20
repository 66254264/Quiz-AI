#!/bin/bash

# 测试豆包 API 连接
# 使用方法：bash test-doubao-api.sh

echo "🔍 测试豆包 API 连接..."
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_DIR="/var/www/quiz-ai"

# 读取配置
if [ -f "$PROJECT_DIR/backend/.env" ]; then
    source "$PROJECT_DIR/backend/.env"
else
    echo -e "${RED}❌ .env 文件不存在${NC}"
    exit 1
fi

echo "=========================================="
echo "1. 检查豆包 API 配置"
echo "=========================================="
echo "DOUBAO_API_URL: $DOUBAO_API_URL"
echo "DOUBAO_API_KEY: ${DOUBAO_API_KEY:0:20}...（已隐藏）"
echo "DOUBAO_MODEL: $DOUBAO_MODEL"
echo ""

if [ -z "$DOUBAO_API_KEY" ] || [ "$DOUBAO_API_KEY" = "your-doubao-api-key" ]; then
    echo -e "${RED}❌ DOUBAO_API_KEY 未正确配置${NC}"
    exit 1
fi

echo "=========================================="
echo "2. 测试 DNS 解析"
echo "=========================================="
echo "解析 ark.cn-beijing.volces.com"
nslookup ark.cn-beijing.volces.com || dig ark.cn-beijing.volces.com
echo ""

echo "=========================================="
echo "3. 测试网络连接"
echo "=========================================="
echo "Ping 测试（3次）："
ping -c 3 ark.cn-beijing.volces.com 2>&1 || echo "Ping 失败（可能被防火墙阻止，这是正常的）"
echo ""

echo "=========================================="
echo "4. 测试 HTTPS 连接"
echo "=========================================="
echo "测试 SSL 连接："
timeout 10 openssl s_client -connect ark.cn-beijing.volces.com:443 -servername ark.cn-beijing.volces.com < /dev/null 2>&1 | grep -E "connect|Verify return code"
echo ""

echo "=========================================="
echo "5. 测试 API 端点（简单请求）"
echo "=========================================="
echo "发送测试请求到豆包 API..."

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" --max-time 10 \
  -X POST "$DOUBAO_API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DOUBAO_API_KEY" \
  -d '{
    "model": "'"$DOUBAO_MODEL"'",
    "messages": [
      {
        "role": "user",
        "content": "测试连接"
      }
    ],
    "max_tokens": 10
  }')

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d':' -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

echo ""
echo "HTTP 状态码: $HTTP_CODE"
echo ""
echo "响应内容:"
echo "$BODY" | head -n 20
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ 豆包 API 连接成功！${NC}"
elif [ "$HTTP_CODE" = "401" ]; then
    echo -e "${RED}❌ 认证失败：API Key 可能无效${NC}"
elif [ "$HTTP_CODE" = "429" ]; then
    echo -e "${YELLOW}⚠️  请求过多：API 配额可能用完${NC}"
elif [ -z "$HTTP_CODE" ]; then
    echo -e "${RED}❌ 连接失败：无法访问豆包 API${NC}"
else
    echo -e "${YELLOW}⚠️  收到错误响应：HTTP $HTTP_CODE${NC}"
fi
echo ""

echo "=========================================="
echo "6. 检查服务器出站规则"
echo "=========================================="
echo "检查防火墙出站规则："
sudo iptables -L OUTPUT -n -v 2>/dev/null | head -n 10 || echo "无法查看 iptables 规则"
echo ""

echo "=========================================="
echo "7. 检查阿里云安全组"
echo "=========================================="
echo -e "${YELLOW}请手动检查阿里云控制台：${NC}"
echo "1. 登录阿里云控制台"
echo "2. 进入 ECS 实例"
echo "3. 查看安全组规则"
echo "4. 确保出方向规则允许 HTTPS (443) 访问"
echo ""

echo "=========================================="
echo "诊断完成"
echo "=========================================="
echo ""
echo "📋 常见问题："
echo ""
echo "1. 如果 DNS 解析失败："
echo "   - 检查 /etc/resolv.conf"
echo "   - 尝试使用公共 DNS: echo 'nameserver 8.8.8.8' | sudo tee -a /etc/resolv.conf"
echo ""
echo "2. 如果连接超时："
echo "   - 检查阿里云安全组出方向规则"
echo "   - 确保允许访问 443 端口"
echo ""
echo "3. 如果认证失败 (401)："
echo "   - 检查 DOUBAO_API_KEY 是否正确"
echo "   - 检查 API Key 是否过期"
echo ""
echo "4. 如果配额用完 (429)："
echo "   - 等待配额重置"
echo "   - 或升级豆包 API 套餐"
echo ""
