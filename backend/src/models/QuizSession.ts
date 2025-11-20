import mongoose, { Schema } from 'mongoose';
import { IQuizSession } from '../types';

const quizSessionSchema = new Schema<IQuizSession>({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  questions: [{
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  }],
  timeLimit: {
    type: Number,
    min: [1, 'Time limit must be at least 1 minute'],
    max: [480, 'Time limit cannot exceed 8 hours (480 minutes)']
  },
  isActive: {
    type: Boolean,
    default: true,
    required: true
  },
  createdBy: {
    type: String,
    ref: 'User',
    required: [true, 'Creator is required']
  }
}, {
  timestamps: true
});

// Validation for questions array
quizSessionSchema.pre('validate', function(next) {
  const quiz = this as unknown as IQuizSession;
  if (quiz.questions.length === 0) {
    next(new Error('Quiz must have at least one question'));
  } else if (quiz.questions.length > 100) {
    next(new Error('Quiz cannot have more than 100 questions'));
  } else {
    // Check for duplicate question IDs
    const questionIds = quiz.questions.map((id: any) => id.toString());
    const uniqueIds = new Set(questionIds);
    if (questionIds.length !== uniqueIds.size) {
      next(new Error('Duplicate questions are not allowed in a quiz'));
    } else {
      next();
    }
  }
});

// Indexes for performance optimization
quizSessionSchema.index({ createdBy: 1 });
quizSessionSchema.index({ isActive: 1 });
quizSessionSchema.index({ createdAt: -1 });
quizSessionSchema.index({ title: 'text', description: 'text' }); // Text search index

// Virtual for question count
quizSessionSchema.virtual('questionCount').get(function() {
  const quiz = this as unknown as IQuizSession;
  return quiz.questions ? quiz.questions.length : 0;
});

// Ensure virtual fields are serialized
quizSessionSchema.set('toJSON', { virtuals: true });

// ==========================================
// 级联删除中间件
// ==========================================

// 删除测验时，自动删除相关数据
quizSessionSchema.pre('findOneAndDelete', async function(next) {
  try {
    const quiz = await this.model.findOne(this.getFilter());
    if (quiz) {
      console.log(`🗑️  触发级联删除: 测验 ${quiz._id}`);
      
      // 动态导入以避免循环依赖
      const { Submission } = await import('./Submission');
      const { QuestionAnalysis } = await import('./QuestionAnalysis');
      
      // 删除所有提交记录
      await Submission.deleteMany({ quizId: quiz._id.toString() });
      
      // 删除所有问题的 AI 分析
      if (quiz.questions && quiz.questions.length > 0) {
        await QuestionAnalysis.deleteMany({ 
          questionId: { $in: quiz.questions } 
        });
      }
      
      console.log(`✅ 级联删除完成: 测验 ${quiz._id}`);
    }
    next();
  } catch (error) {
    console.error('❌ 级联删除失败:', error);
    next(error as Error);
  }
});

export const QuizSession = mongoose.model<IQuizSession>('QuizSession', quizSessionSchema);