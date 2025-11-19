import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestionAnalysis extends Document {
  questionId: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  analysis: string;
  createdAt: Date;
  updatedAt: Date;
}

const questionAnalysisSchema = new Schema<IQuestionAnalysis>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    quizId: {
      type: Schema.Types.ObjectId,
      ref: 'QuizSession',
      required: true,
    },
    analysis: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// 创建复合索引，确保每个题目在每个测验中只有一个分析记录
questionAnalysisSchema.index({ questionId: 1, quizId: 1 }, { unique: true });

export const QuestionAnalysis = mongoose.model<IQuestionAnalysis>('QuestionAnalysis', questionAnalysisSchema);
