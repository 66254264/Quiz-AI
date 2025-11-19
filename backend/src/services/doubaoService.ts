import axios from 'axios';

// 豆包API配置
const DOUBAO_API_URL = process.env.DOUBAO_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const DOUBAO_API_KEY = process.env.DOUBAO_API_KEY || '';
const DOUBAO_MODEL = process.env.DOUBAO_MODEL || 'ep-20241119155555-xxxxx'; // 替换为实际的endpoint ID

interface QuestionAnalysisRequest {
  title: string;
  content: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  difficulty: string;
  correctRate: number;
  totalAttempts: number;
}

export const analyzeQuestionWithAI = async (question: QuestionAnalysisRequest): Promise<string> => {
  try {
    console.log('🤖 开始AI分析...');
    console.log('API URL:', DOUBAO_API_URL);
    console.log('Model:', DOUBAO_MODEL);
    console.log('API Key配置:', DOUBAO_API_KEY ? '已配置' : '未配置');
    
    // 构建提示词
    const prompt = `请分析以下题目，提供详细的解题思路和知识点说明：

题目标题：${question.title}
题目内容：${question.content}
难度：${question.difficulty === 'easy' ? '简单' : question.difficulty === 'medium' ? '中等' : '困难'}

选项：
${question.options.map(opt => `${opt.id}. ${opt.text} ${opt.isCorrect ? '(正确答案)' : ''}`).join('\n')}

统计数据：
- 答题次数：${question.totalAttempts}
- 正确率：${question.correctRate.toFixed(1)}%

请从以下几个方面进行分析：
1. 题目考查的知识点
2. 正确答案的解题思路
3. 常见错误选项的误区分析
4. 学习建议

请用简洁清晰的中文回答，分点说明。`;

    const requestBody = {
      model: DOUBAO_MODEL,
      messages: [
        {
          role: 'system',
          content: '你是一位经验丰富的教育专家，擅长分析题目和提供学习建议。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };

    console.log('📤 发送请求到豆包API...');

    // 调用豆包API
    const response = await axios.post(
      DOUBAO_API_URL,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${DOUBAO_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30秒超时
      }
    );

    console.log('📥 收到响应:', response.status);
    console.log('响应数据结构:', JSON.stringify(response.data, null, 2).substring(0, 500));

    if (response.data?.choices?.[0]?.message?.content) {
      console.log('✅ AI分析成功');
      return response.data.choices[0].message.content;
    } else {
      console.error('❌ AI返回数据格式错误:', response.data);
      throw new Error('AI返回数据格式错误');
    }
  } catch (error: any) {
    console.error('❌ 豆包API调用失败:');
    console.error('错误类型:', error.code);
    console.error('错误消息:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    }
    
    // 如果API未配置或调用失败，返回友好提示
    if (!DOUBAO_API_KEY || DOUBAO_API_KEY === '') {
      throw new Error('AI分析服务未配置，请联系管理员配置DOUBAO_API_KEY');
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('AI分析请求超时，请稍后重试');
    }

    // 返回更详细的错误信息
    const errorMessage = error.response?.data?.error?.message 
      || error.response?.data?.message 
      || error.message 
      || 'AI分析服务暂时不可用';
    
    throw new Error(`AI分析失败: ${errorMessage}`);
  }
};
