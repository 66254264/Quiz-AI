/**
 * 删除 email 字段的唯一索引
 * 
 * 运行方法：
 * node remove-email-index.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-system';

async function removeEmailIndex() {
  try {
    console.log('🔌 连接到 MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 已连接到 MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // 获取所有索引
    console.log('\n📋 当前索引列表：');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    // 检查是否存在 email_1 索引
    const emailIndex = indexes.find(idx => idx.name === 'email_1');
    
    if (emailIndex) {
      console.log('\n🗑️  删除 email_1 索引...');
      await collection.dropIndex('email_1');
      console.log('✅ email_1 索引已删除');
    } else {
      console.log('\n⚠️  未找到 email_1 索引，可能已经被删除');
    }

    // 显示删除后的索引列表
    console.log('\n📋 删除后的索引列表：');
    const newIndexes = await collection.indexes();
    newIndexes.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    console.log('\n✅ 完成！现在邮箱可以重复了。');
    console.log('⚠️  请重启后端服务以应用更改。');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 已断开 MongoDB 连接');
    process.exit(0);
  }
}

removeEmailIndex();
