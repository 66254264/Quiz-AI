import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-system';
    
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2, // Maintain at least 2 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      heartbeatFrequencyMS: 10000, // Send a ping every 10 seconds
    };

    await mongoose.connect(mongoUri, options);
    
    console.log('✅ MongoDB connected successfully');
    
    // Setup additional database configurations
    await setupDatabaseIndexes();
    await setupDatabaseValidation();
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
    throw error;
  }
};

/**
 * Setup additional database indexes for performance optimization
 */
const setupDatabaseIndexes = async (): Promise<void> => {
  try {
    const db = mongoose.connection.db;
    
    // Compound indexes for common query patterns
    
    // Users collection - compound indexes
    await db.collection('users').createIndex(
      { role: 1, createdAt: -1 },
      { background: true, name: 'role_createdAt' }
    );
    
    // Questions collection - compound indexes
    await db.collection('questions').createIndex(
      { createdBy: 1, difficulty: 1 },
      { background: true, name: 'createdBy_difficulty' }
    );
    
    await db.collection('questions').createIndex(
      { tags: 1, createdAt: -1 },
      { background: true, name: 'tags_createdAt' }
    );
    
    // QuizSessions collection - compound indexes
    await db.collection('quizsessions').createIndex(
      { createdBy: 1, isActive: 1, createdAt: -1 },
      { background: true, name: 'createdBy_isActive_createdAt' }
    );
    
    // Submissions collection - compound indexes for analytics
    await db.collection('submissions').createIndex(
      { quizId: 1, score: -1 },
      { background: true, name: 'quizId_score' }
    );
    
    await db.collection('submissions').createIndex(
      { studentId: 1, submitTime: -1 },
      { background: true, name: 'studentId_submitTime' }
    );
    
    await db.collection('submissions').createIndex(
      { quizId: 1, submitTime: -1 },
      { background: true, name: 'quizId_submitTime' }
    );
    
    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating database indexes:', error);
    // Don't throw error to prevent app startup failure
  }
};

/**
 * Setup database-level validation rules and constraints
 */
const setupDatabaseValidation = async (): Promise<void> => {
  try {
    const db = mongoose.connection.db;
    
    // Set up collection validation rules at database level
    
    // Users collection validation
    await db.command({
      collMod: 'users',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['username', 'email', 'password', 'role', 'profile'],
          properties: {
            username: {
              bsonType: 'string',
              minLength: 3,
              maxLength: 30,
              pattern: '^[a-zA-Z0-9_-]+$'
            },
            email: {
              bsonType: 'string',
              pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
            },
            role: {
              enum: ['teacher', 'student']
            }
          }
        }
      },
      validationLevel: 'moderate',
      validationAction: 'error'
    }).catch(() => {
      // Collection might not exist yet, ignore error
    });
    
    // Questions collection validation
    await db.command({
      collMod: 'questions',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['title', 'content', 'options', 'correctAnswer', 'difficulty', 'createdBy'],
          properties: {
            options: {
              bsonType: 'array',
              minItems: 2,
              maxItems: 6
            },
            difficulty: {
              enum: ['easy', 'medium', 'hard']
            }
          }
        }
      },
      validationLevel: 'moderate',
      validationAction: 'error'
    }).catch(() => {
      // Collection might not exist yet, ignore error
    });
    
    console.log('✅ Database validation rules set up successfully');
  } catch (error) {
    console.error('❌ Error setting up database validation:', error);
    // Don't throw error to prevent app startup failure
  }
};

/**
 * Get database connection statistics
 */
export const getDatabaseStats = async () => {
  try {
    const db = mongoose.connection.db;
    const stats = await db.stats();
    
    return {
      collections: stats.collections,
      dataSize: stats.dataSize,
      indexSize: stats.indexSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes
    };
  } catch (error) {
    console.error('❌ Error getting database stats:', error);
    return null;
  }
};

/**
 * Health check for database connection
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    const state = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    return state === 1;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
};