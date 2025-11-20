import mongoose, { Schema } from 'mongoose';
import { IQuestion } from '../types';

const questionSchema = new Schema<IQuestion>({
  title: {
    type: String,
    required: [true, 'Question title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Question content is required'],
    trim: true,
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  options: [{
    id: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: [true, 'Option text is required'],
      trim: true,
      maxlength: [500, 'Option text cannot exceed 500 characters']
    }
  }],
  correctAnswer: {
    type: String,
    required: [true, 'Correct answer is required'],
    validate: {
      validator: function(this: IQuestion, value: string) {
        return this.options.some(option => option.id === value);
      },
      message: 'Correct answer must match one of the option IDs'
    }
  },
  explanation: {
    type: String,
    trim: true,
    maxlength: [1000, 'Explanation cannot exceed 1000 characters']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: [true, 'Difficulty level is required'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  createdBy: {
    type: String,
    ref: 'User',
    required: [true, 'Creator is required']
  }
}, {
  timestamps: true
});

// Validation for options array
questionSchema.pre('validate', function(next) {
  const question = this as unknown as IQuestion;
  if (question.options.length < 2) {
    next(new Error('Question must have at least 2 options'));
  } else if (question.options.length > 6) {
    next(new Error('Question cannot have more than 6 options'));
  } else {
    // Check for duplicate option IDs
    const optionIds = question.options.map((option: { id: string; text: string }) => option.id);
    const uniqueIds = new Set(optionIds);
    if (optionIds.length !== uniqueIds.size) {
      next(new Error('Option IDs must be unique'));
    } else {
      next();
    }
  }
});

// Indexes for performance optimization
questionSchema.index({ createdBy: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ createdAt: -1 });
questionSchema.index({ title: 'text', content: 'text' }); // Text search index

// ==========================================
// 级联删除中间件
// ==========================================

// 删除问题时，自动删除相关数据
questionSchema.pre('findOneAndDelete', async function(next) {
  try {
    const question = await this.model.findOne(this.getFilter());
    if (question) {
      console.log(`🗑️  触发级联删除: 问题 ${question._id}`);
      
      // 动态导入以避免循环依赖
      const { QuestionAnalysis } = await import('./QuestionAnalysis');
      const { QuizSession } = await import('./QuizSession');
      
      // 删除 AI 分析
      await QuestionAnalysis.deleteMany({ questionId: question._id });
      
      // 从所有测验中移除该问题
      await QuizSession.updateMany(
        { questions: question._id },
        { $pull: { questions: question._id } }
      );
      
      console.log(`✅ 级联删除完成: 问题 ${question._id}`);
    }
    next();
  } catch (error) {
    console.error('❌ 级联删除失败:', error);
    next(error as Error);
  }
});

export const Question = mongoose.model<IQuestion>('Question', questionSchema);