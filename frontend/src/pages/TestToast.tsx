import React from 'react';
import { useToast } from '../contexts/ToastContext';

export const TestToast: React.FC = () => {
  const toast = useToast();

  const testSuccess = () => {
    console.log('测试成功 Toast');
    toast.success('这是一个成功消息！', 5000);
  };

  const testError = () => {
    console.log('测试错误 Toast');
    toast.error('这是一个错误消息！', 5000);
  };

  const testWarning = () => {
    console.log('测试警告 Toast');
    toast.warning('这是一个警告消息！', 5000);
  };

  const testInfo = () => {
    console.log('测试信息 Toast');
    toast.info('这是一个信息消息！', 5000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold text-center mb-8">Toast 测试页面</h1>
        
        <button
          onClick={testSuccess}
          className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          测试成功 Toast
        </button>

        <button
          onClick={testError}
          className="w-full py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          测试错误 Toast
        </button>

        <button
          onClick={testWarning}
          className="w-full py-3 px-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
        >
          测试警告 Toast
        </button>

        <button
          onClick={testInfo}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          测试信息 Toast
        </button>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold mb-2">使用说明：</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>打开浏览器开发者工具（F12）</li>
            <li>点击上面的按钮</li>
            <li>查看右上角是否出现 Toast 提示</li>
            <li>查看控制台日志</li>
          </ol>
        </div>

        <div className="mt-4">
          <a
            href="/login"
            className="block text-center text-blue-600 hover:text-blue-800 underline"
          >
            返回登录页面
          </a>
        </div>
      </div>
    </div>
  );
};
