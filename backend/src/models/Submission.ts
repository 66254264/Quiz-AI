import mongoose, { Schema } from 'mongoose';
import { ISubmission } from '../types';

const submissionSchema = new Schema<ISubmission>({
  quizId: {
    type: String,
    ref: 'QuizSession',
    required: [true, 'Quiz ID is required']
  },
  studentId: {
    type: String,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  answers: [{
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    selectedAnswer: {
      type: String,
      required: [true, 'Selected answer is required']
    },
    isCorrect: {
      type: Boolean,
      required: true
    }
  }],
  score: {
    type: Number,
    required: true,
    min: [0, 'Score cannot be negative'],
    validate: {
      validator: function(this: ISubmission, value: number) {
        return value <= this.totalQuestions;
      },
      message: 'Score cannot exceed total questions'
    }
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: [1, 'Total questions must be at least 1']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  submitTime: {
    type: Date,
    required: [true, 'Submit time is required'],
    validate: {
      validator: function(this: ISubmission, value: Date) {
        return value >= this.startTime;
      },
      message: 'Submit time must be after start time'
    }
  },
  timeSpent: {
    type: Number,
    min: [0, 'Time spent cannot be negative'],
    default: 0
  }
}, {
  timestamps: true
});

// Validation for answers array
submissionSchema.pre('validate', function(next) {
  const submission = this as any;
  if (submission.answers.length !== submission.totalQuestions) {
    next(new Error('Number of answers must match total questions'));
  } else {
    // Check for duplicate question IDs in answers
    const questionIds = submission.answers.map((answer: any) => answer.questionId.toString());
    const uniqueIds = new Set(questionIds);
    if (questionIds.length !== uniqueIds.size) {
      next(new Error('Duplicate answers for the same question are not allowed'));
    } else {
      next();
    }
  }
});

// Calculate time spent before saving
submissionSchema.pre('save', function(next) {
  const submission = this as any;
  if (submission.startTime && submission.submitTime) {
    submission.timeSpent = Math.floor((submission.submitTime.getTime() - submission.startTime.getTime()) / 1000);
  }
  next();
});

// Indexes for performance optimization
submissionSchema.index({ quizId: 1 });
submissionSchema.index({ studentId: 1 });
submissionSchema.index({ quizId: 1, studentId: 1 }, { unique: true }); // Prevent duplicate submissions
submissionSchema.index({ submitTime: -1 });
submissionSchema.index({ score: -1 });

// Virtual for percentage score
submissionSchema.virtual('percentage').get(function() {
  const submission = this as any;
  return submission.totalQuestions > 0 ? Math.round((submission.score / submission.totalQuestions) * 100) : 0;
});

// Virtual for correct answers count
submissionSchema.virtual('correctAnswers').get(function() {
  const submission = this as any;
  return submission.answers.filter((answer: any) => answer.isCorrect).length;
});

// Ensure virtual fields are serialized
submissionSchema.set('toJSON', { virtuals: true });

export const Submission = mongoose.model<ISubmission>('Submission', submissionSchema);