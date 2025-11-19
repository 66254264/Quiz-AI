import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../contexts/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // 只在有错误时才清除，避免不必要的状态更新
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔐 开始登录...', new Date().toISOString());
    console.log('👤 用户名:', formData.username);
    console.log('🎯 Toast 对象:', toast);
    
    try {
      const success = await login(formData.username, formData.password);
      console.log('🔐 登录结果:', success);
      console.log('🔐 登录结果类型:', typeof success);
      console.log('🔐 success === true:', success === true);
      console.log('🔐 success === false:', success === false);
      
      if (success) {
        console.log('✅ 进入成功分支');
        const user = useAuthStore.getState().user;
        console.log('👤 当前用户:', user);
        console.log('🎯 用户角色:', user?.role);
        
        console.log('✅ 准备显示成功 Toast');
        toast.success('登录成功！');
        const redirectPath = user?.role === 'teacher' ? '/teacher/questions' : '/student/quizzes';
        console.log('🚀 准备跳转到:', redirectPath);
        
        // 使用 setTimeout 确保状态更新完成
        setTimeout(() => {
          console.log('🚀 执行跳转...');
          navigate(redirectPath, { replace: true });
        }, 100);
      } else {
        console.log('❌ 进入失败分支');
        // 获取最新的错误信息
        const currentError = useAuthStore.getState().error;
        console.error('❌ 登录失败，错误信息:', currentError);
        console.log('❌ 准备显示错误 Toast');
        
        const errorMsg = currentError || '登录失败，请检查您的用户名和密码';
        console.log('❌ Toast 错误消息:', errorMsg);
        console.log('❌ 即将调用 toast.error，参数:', errorMsg, 5000);
        
        // 立即显示 Toast，使用 requestAnimationFrame 确保在下一帧显示
        requestAnimationFrame(() => {
          toast.error(errorMsg, 5000);
          console.log('❌ Toast.error 已调用完成');
        });
      }
    } catch (err) {
      console.error('💥 登录异常:', err);
      const errorMessage = err instanceof Error ? err.message : '登录过程中发生错误';
      console.log('💥 准备显示异常 Toast:', errorMessage);
      toast.error(errorMessage, 5000);
      console.log('💥 Toast.error 已调用');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo 和标题区域 */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="mt-6 text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            欢迎使用
          </h2>
          <p className="mt-3 text-base text-gray-600">
            AI智能答题系统
          </p>
        </div>
        
        {/* 登录表单卡片 */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 space-y-6 border border-gray-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* 用户名输入 */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white text-left"
                  placeholder="用户名"
                />
              </div>
            </div>

            {/* 密码输入 */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white text-left"
                  placeholder="密码"
                />
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 animate-shake">
                <div className="flex">
                  <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="small" />
                  <span className="ml-2">登录中...</span>
                </>
              ) : (
                <>
                  <span>登录</span>
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* 注册链接 */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              还没有账号？
              <Link 
                to="/register" 
                className="ml-1 font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                立即注册
              </Link>
            </p>
          </div>
        </div>

        {/* 底部提示 */}
        <p className="text-center text-xs text-gray-500">
          登录即同意服务条款和隐私政策
        </p>
      </div>

      {/* 添加动画样式 */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
};
