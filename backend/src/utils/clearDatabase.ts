import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { User, Question, QuizSession, Submission } from '../models';

/**
 * Clear all data from the database
 */
const clearDatabase = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();
    
    console.log('🗑️  Clearing database...');
    
    // Delete all data
    await User.deleteMany({});
    await Question.deleteMany({});
    await QuizSession.deleteMany({});
    await Submission.deleteMany({});
    
    console.log('✅ Database cleared successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
};

clearDatabase();
