/**
 * 检查数据库连接和集合
 * 
 * 运行方法：
 * node check-database.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-system';

async function checkDatabase() {
  try {
    console.log('🔌 连接到 MongoDB...');
    console.log('📍 URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 已连接到 MongoDB\n');

    const db = mongoose.connection.db;
    
    // 列出所有集合
    console.log('📋 数据库中的所有集合：');
    const collections = await db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    console.log('\n📊 各集合的文档数量：');
    
    // 检查 users 集合
    const usersCount = await db.collection('users').countDocuments();
    console.log(`  - users: ${usersCount} 条`);
    
    // 检查 questions 集合
    const questionsCount = await db.collection('questions').countDocuments();
    console.log(`  - questions: ${questionsCount} 条`);
    
    // 检查 quizsessions 集合（注意：Mongoose 会自动将 QuizSession 转为 quizsessions）
    const quizSessionsCount = await db.collection('quizsessions').countDocuments();
    console.log(`  - quizsessions: ${quizSessionsCount} 条`);
    
    // 检查 submissions 集合
    const submissionsCount = await db.collection('submissions').countDocuments();
    console.log(`  - submissions: ${submissionsCount} 条`);
    
    // 检查 questionanalyses 集合
    const analysesCount = await db.collection('questionanalyses').countDocuments();
    console.log(`  - questionanalyses: ${analysesCount} 条`);
    
    // 如果 quizsessions 为空，检查是否有其他可能的集合名
    if (quizSessionsCount === 0) {
      console.log('\n⚠️  quizsessions 集合为空！');
      console.log('🔍 检查是否有其他可能的集合名...');
      
      const possibleNames = ['quizzes', 'quiz', 'QuizSession', 'QuizSessions', 'quizSession'];
      for (const name of possibleNames) {
        try {
          const count = await db.collection(name).countDocuments();
          if (count > 0) {
            console.log(`  ✅ 找到了！集合 "${name}" 有 ${count} 条文档`);
          }
        } catch (err) {
          // 集合不存在，忽略
        }
      }
    } else {
      console.log('\n📄 quizsessions 集合中的文档：');
      const quizzes = await db.collection('quizsessions').find({}).limit(5).toArray();
      quizzes.forEach((quiz, index) => {
        console.log(`\n  ${index + 1}. ${quiz.title || '(无标题)'}`);
        console.log(`     ID: ${quiz._id}`);
        console.log(`     状态: ${quiz.isActive ? '已发布' : '草稿'}`);
        console.log(`     创建者: ${quiz.createdBy}`);
        console.log(`     题目数: ${quiz.questions?.length || 0}`);
      });
    }
    
    // 检查最近的数据库操作日志
    console.log('\n📝 检查数据库连接状态：');
    const adminDb = db.admin();
    const serverStatus = await adminDb.serverStatus();
    console.log(`  - MongoDB 版本: ${serverStatus.version}`);
    console.log(`  - 连接数: ${serverStatus.connections.current}`);
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error('详细信息:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 已断开 MongoDB 连接');
    process.exit(0);
  }
}

checkDatabase();
