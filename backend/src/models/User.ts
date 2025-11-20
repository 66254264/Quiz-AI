import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: false,  // 允许邮箱重复
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['teacher', 'student'],
    required: [true, 'Role is required'],
    default: 'student'
  },
  profile: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    avatar: {
      type: String,
      default: null
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(_doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Index for performance optimization
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// ==========================================
// 级联删除中间件
// ==========================================

// 删除用户时，自动删除相关数据
userSchema.pre('findOneAndDelete', async function(next) {
  try {
    const user = await this.model.findOne(this.getFilter());
    if (user) {
      console.log(`🗑️  触发级联删除: 用户 ${user._id} (${user.role})`);
      
      // 动态导入以避免循环依赖
      const { QuizSession } = await import('./QuizSession');
      const { Question } = await import('./Question');
      const { Submission } = await import('./Submission');
      
      if (user.role === 'teacher') {
        // 删除老师创建的所有测验（会触发测验的级联删除）
        const quizzes = await QuizSession.find({ createdBy: user._id.toString() });
        for (const quiz of quizzes) {
          await QuizSession.findByIdAndDelete(quiz._id);
        }
        
        // 删除老师创建的所有问题（会触发问题的级联删除）
        const questions = await Question.find({ createdBy: user._id.toString() });
        for (const question of questions) {
          await Question.findByIdAndDelete(question._id);
        }
      } else if (user.role === 'student') {
        // 删除学生的所有提交记录
        await Submission.deleteMany({ studentId: user._id.toString() });
      }
      
      console.log(`✅ 级联删除完成: 用户 ${user._id}`);
    }
    next();
  } catch (error) {
    console.error('❌ 级联删除失败:', error);
    next(error as Error);
  }
});

export const User = mongoose.model<IUser>('User', userSchema);