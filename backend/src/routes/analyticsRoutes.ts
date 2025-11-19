import { Router } from 'express';
import {
  getOverallStatistics,
  getQuestionStatistics,
  getStudentPerformance,
  getQuizList,
  analyzeQuestion,
  getQuestionAnalyses
} from '../controllers/analyticsController';
import { authenticate, authorize } from '../middleware/auth';
import { analyticsLimiter } from '../middleware/rateLimiter';
import { cacheMiddleware, invalidateCacheMiddleware, CacheTTL } from '../middleware/cache';

const router = Router();

// 所有路由都需要教师权限
router.use(authenticate, authorize('teacher'));

// Apply rate limiting to all analytics routes
router.use(analyticsLimiter);

// 获取整体统计数据 (cache for 5 minutes)
router.get('/overall', cacheMiddleware(CacheTTL.MEDIUM), getOverallStatistics);

// 获取测验列表 (cache for 15 minutes)
router.get('/quizzes', cacheMiddleware(CacheTTL.LONG), getQuizList);

// 获取按题目统计数据 (cache for 5 minutes)
router.get('/questions/:quizId', cacheMiddleware(CacheTTL.MEDIUM), getQuestionStatistics);

// 获取学生表现分析 (cache for 5 minutes)
router.get('/students/:quizId', cacheMiddleware(CacheTTL.MEDIUM), getStudentPerformance);

// 批量获取题目的AI分析结果 (cache for 5 minutes)
router.get('/questions/:quizId/analyses', cacheMiddleware(CacheTTL.MEDIUM), getQuestionAnalyses);

// AI分析题目 (no cache, real-time analysis)
router.post('/questions/:questionId/analyze', invalidateCacheMiddleware(/\/analytics/), analyzeQuestion);

export default router;
