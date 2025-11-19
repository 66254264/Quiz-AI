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

export const QuizSession = mongoose.model<IQuizSession>('QuizSession', quizSessionSchema);