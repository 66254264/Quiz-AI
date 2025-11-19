import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LoadingSpinner } from './components/common/LoadingSpinner'
import { ToastProvider } from './contexts/ToastContext'
import { ToastContainer } from './components/common/Toast'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { useAuthStore } from './store/authStore'
import './App.css'

// Lazy load page components for code splitting
const Login = lazy(() => import('./pages/auth/Login').then(module => ({ default: module.Login })))
const Register = lazy(() => import('./pages/auth/Register').then(module => ({ default: module.Register })))
const TestToast = lazy(() => import('./pages/TestToast').then(module => ({ default: module.TestToast })))
const QuestionManagement = lazy(() => import('./pages/teacher/QuestionManagement').then(module => ({ default: module.QuestionManagement })))
const QuizManagement = lazy(() => import('./pages/teacher/QuizManagement').then(module => ({ default: module.QuizManagement })))
const Analytics = lazy(() => import('./pages/teacher/Analytics'))
const QuizList = lazy(() => import('./pages/student/QuizList').then(module => ({ default: module.QuizList })))
const QuizTaking = lazy(() => import('./pages/student/QuizTaking').then(module => ({ default: module.QuizTaking })))
const QuizResult = lazy(() => import('./pages/student/QuizResult').then(module => ({ default: module.QuizResult })))

// Home component - redirects based on auth status
const Home = () => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  const redirectPath = user?.role === 'teacher' ? '/teacher/questions' : '/student/quizzes';
  return <Navigate to={redirectPath} replace />;
}

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Check authentication status on app load
    checkAuth();
  }, [checkAuth]);

  return (
    <ToastProvider>
      <ToastContainer />
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <div className="App">
          <main>
            <Suspense fallback={<LoadingSpinner size="large" message="加载中..." />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/test-toast" element={<TestToast />} />
                
                {/* Protected teacher routes */}
                <Route 
                  path="/teacher/questions" 
                  element={
                    <ProtectedRoute requiredRole="teacher">
                      <QuestionManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/teacher/quizzes" 
                  element={
                    <ProtectedRoute requiredRole="teacher">
                      <QuizManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/teacher/analytics" 
                  element={
                    <ProtectedRoute requiredRole="teacher">
                      <Analytics />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Protected student routes */}
                <Route 
                  path="/student/quizzes" 
                  element={
                    <ProtectedRoute requiredRole="student">
                      <QuizList />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/student/quiz/:quizId" 
                  element={
                    <ProtectedRoute requiredRole="student">
                      <QuizTaking />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/student/quiz/:quizId/result" 
                  element={
                    <ProtectedRoute requiredRole="student">
                      <QuizResult />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Default route */}
                <Route path="/" element={<Home />} />
                
                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </Router>
    </ToastProvider>
  )
}

export default App