const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const DOUBAO_API_URL = process.env.DOUBAO_API_URL;
const DOUBAO_API_KEY = process.env.DOUBAO_API_KEY;
const DOUBAO_MODEL = process.env.DOUBAO_MODEL;

console.log('🔍 测试豆包API配置...\n');
console.log('API URL:', DOUBAO_API_URL);
console.log('API Key:', DOUBAO_API_KEY ? `${DOUBAO_API_KEY.substring(0, 10)}...` : '未配置');
console.log('Model:', DOUBAO_MODEL);
console.log('\n📤 发送测试请求...\n');

const testRequest = async () => {
  try {
    const response = await axios.post(
      DOUBAO_API_URL,
      {
        model: DOUBAO_MODEL,
        messages: [
          {
            role: 'system',
            content: '你是一位教育专家。'
          },
          {
            role: 'user',
            content: '请简单介绍一下什么是JavaScript？'
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      },
      {
        headers: {
          'Authorization': `Bearer ${DOUBAO_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('✅ API调用成功！\n');
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
    if (response.data?.choices?.[0]?.message?.content) {
      console.log('\n📝 AI回复内容:');
      console.log(response.data.choices[0].message.content);
    }
  } catch (error) {
    console.error('❌ API调用失败！\n');
    console.error('错误类型:', error.code);
    console.error('错误消息:', error.message);
    
    if (error.response) {
      console.error('\n响应状态:', error.response.status);
      console.error('响应头:', JSON.stringify(error.response.headers, null, 2));
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    }
    
    console.error('\n💡 可能的问题:');
    console.error('1. API Key 不正确');
    console.error('2. Endpoint ID 不正确');
    console.error('3. 网络连接问题');
    console.error('4. API配额已用完');
    console.error('5. 需要在火山引擎控制台激活服务');
  }
};

testRequest();
