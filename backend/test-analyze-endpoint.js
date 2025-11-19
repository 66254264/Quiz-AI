const axios = require('axios');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

// 测试AI分析端点
const testAnalyzeEndpoint = async () => {
  console.log('🧪 测试AI分析端点\n');
  
  // 这里需要替换为实际的值
  const QUESTION_ID = '请替换为实际的题目ID';
  const QUIZ_ID = '请替换为实际的测验ID';
  const TOKEN = '请替换为实际的JWT Token';
  
  if (QUESTION_ID.includes('请替换') || QUIZ_ID.includes('请替换') || TOKEN.includes('请替换')) {
    console.log('⚠️ 请先编辑此文件，填入实际的题目ID、测验ID和Token');
    console.log('\n如何获取这些值：');
    console.log('1. 题目ID和测验ID：从浏览器开发者工具的Network标签中查看');
    console.log('2. Token：从浏览器localStorage中获取accessToken');
    console.log('\n或者直接在浏览器中测试，查看控制台日志');
    return;
  }

  try {
    console.log('发送请求到:', `http://localhost:5000/api/analytics/questions/${QUESTION_ID}/analyze`);
    console.log('请求体:', { quizId: QUIZ_ID });
    console.log('');

    const response = await axios.post(
      `http://localhost:5000/api/analytics/questions/${QUESTION_ID}/analyze`,
      { quizId: QUIZ_ID },
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    console.log('✅ 请求成功！\n');
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data && response.data.data.analysis) {
      console.log('\n✅ 数据格式正确！');
      console.log('\nAI分析内容:');
      console.log(response.data.data.analysis);
    } else {
      console.log('\n❌ 数据格式不正确！');
      console.log('期望格式: { success: true, data: { questionId, analysis } }');
    }
  } catch (error) {
    console.error('❌ 请求失败！\n');
    console.error('错误类型:', error.code);
    console.error('错误消息:', error.message);
    
    if (error.response) {
      console.error('\n响应状态:', error.response.status);
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    }
  }
};

testAnalyzeEndpoint();
