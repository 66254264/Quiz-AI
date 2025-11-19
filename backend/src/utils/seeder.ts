import { User, Question, QuizSession } from '../models';

/**
 * Seed initial data for development and testing
 */
export const seedDatabase = async (): Promise<void> => {
  try {
    console.log('🌱 Starting database seeding...');

    // Check if data already exists
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('📊 Database already contains data, skipping seeding');
      return;
    }

    // Create default admin teacher
    const adminTeacher = new User({
      username: 'admin_teacher',
      email: 'teacher@example.com',
      password: 'Teacher123!',
      role: 'teacher',
      profile: {
        firstName: 'Admin',
        lastName: 'Teacher'
      }
    });
    await adminTeacher.save();

    // Create sample students
    const students = [
      {
        username: 'student1',
        email: 'student1@example.com',
        password: 'Student123!',
        role: 'student' as const,
        profile: {
          firstName: 'John',
          lastName: 'Doe'
        }
      },
      {
        username: 'student2',
        email: 'student2@example.com',
        password: 'Student123!',
        role: 'student' as const,
        profile: {
          firstName: 'Jane',
          lastName: 'Smith'
        }
      }
    ];

    await User.insertMany(students);

    // Create sample questions
    const sampleQuestions = [
      {
        title: 'JavaScript Basics',
        content: 'What is the correct way to declare a variable in JavaScript?',
        options: [
          { id: 'a', text: 'var myVar = 5;' },
          { id: 'b', text: 'variable myVar = 5;' },
          { id: 'c', text: 'v myVar = 5;' },
          { id: 'd', text: 'declare myVar = 5;' }
        ],
        correctAnswer: 'a',
        explanation: 'The var keyword is used to declare variables in JavaScript.',
        difficulty: 'easy' as const,
        tags: ['javascript', 'variables'],
        createdBy: adminTeacher._id
      },
      {
        title: 'React Components',
        content: 'Which of the following is the correct way to create a functional component in React?',
        options: [
          { id: 'a', text: 'function MyComponent() { return <div>Hello</div>; }' },
          { id: 'b', text: 'const MyComponent = () => { return <div>Hello</div>; }' },
          { id: 'c', text: 'class MyComponent extends React.Component { render() { return <div>Hello</div>; } }' },
          { id: 'd', text: 'Both A and B are correct' }
        ],
        correctAnswer: 'd',
        explanation: 'Both function declarations and arrow functions can be used to create functional components.',
        difficulty: 'medium' as const,
        tags: ['react', 'components'],
        createdBy: adminTeacher._id
      },
      {
        title: 'Database Concepts',
        content: 'What does ACID stand for in database systems?',
        options: [
          { id: 'a', text: 'Atomicity, Consistency, Isolation, Durability' },
          { id: 'b', text: 'Accuracy, Consistency, Integrity, Durability' },
          { id: 'c', text: 'Atomicity, Concurrency, Isolation, Durability' },
          { id: 'd', text: 'Accuracy, Concurrency, Integrity, Dependency' }
        ],
        correctAnswer: 'a',
        explanation: 'ACID stands for Atomicity, Consistency, Isolation, and Durability - the four key properties of database transactions.',
        difficulty: 'hard' as const,
        tags: ['database', 'concepts'],
        createdBy: adminTeacher._id
      }
    ];

    const createdQuestions = await Question.insertMany(sampleQuestions);

    // Create a sample quiz session
    const sampleQuiz = new QuizSession({
      title: 'Programming Fundamentals Quiz',
      description: 'A basic quiz covering JavaScript, React, and database concepts',
      questions: createdQuestions.map(q => q._id),
      timeLimit: 30, // 30 minutes
      isActive: true,
      createdBy: adminTeacher._id
    });
    await sampleQuiz.save();

    console.log('✅ Database seeding completed successfully');
    console.log(`📊 Created: 1 teacher, ${students.length} students, ${sampleQuestions.length} questions, 1 quiz`);
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

/**
 * Clear all data from the database (use with caution!)
 */
export const clearDatabase = async (): Promise<void> => {
  try {
    console.log('🗑️ Clearing database...');
    
    await User.deleteMany({});
    await Question.deleteMany({});
    await QuizSession.deleteMany({});
    
    console.log('✅ Database cleared successfully');
  } catch (error) {
    console.error('❌ Database clearing failed:', error);
    throw error;
  }
};

/**
 * Reset database with fresh seed data
 */
export const resetDatabase = async (): Promise<void> => {
  await clearDatabase();
  await seedDatabase();
};

// Run seeder if this file is executed directly
if (require.main === module) {
  const { connectDatabase } = require('../config/database');
  
  connectDatabase()
    .then(async () => {
      await seedDatabase();
      console.log('✅ Seeding complete, exiting...');
      process.exit(0);
    })
    .catch((error: Error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}