#!/bin/bash

# MongoDB 数据查看工具
# 使用方法：bash view-database.sh

echo "📊 MongoDB 数据查看工具"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "请选择要查看的内容："
echo ""
echo "1. 查看所有集合（表）"
echo "2. 查看所有用户"
echo "3. 查看所有测验"
echo "4. 查看所有问题"
echo "5. 查看所有答题会话"
echo "6. 查看所有答案"
echo "7. 查看所有 AI 分析记录"
echo "8. 统计各表记录数"
echo "9. 查看特定用户（通过邮箱）"
echo "10. 查看特定测验（通过 ID）"
echo "0. 退出"
echo ""

read -p "请输入选项 (0-10): " choice

case $choice in
    1)
        echo ""
        echo -e "${YELLOW}📋 所有集合：${NC}"
        mongosh quiz-system --quiet --eval 'show collections'
        ;;
    2)
        echo ""
        echo -e "${YELLOW}👥 所有用户：${NC}"
        mongosh quiz-system --quiet --eval '
            db.users.find({}, { 
                name: 1, 
                email: 1, 
                role: 1, 
                createdAt: 1 
            }).forEach(user => {
                print("---");
                print("姓名:", user.name);
                print("邮箱:", user.email);
                print("角色:", user.role);
                print("创建时间:", user.createdAt);
            });
            print("\n总计:", db.users.countDocuments(), "个用户");
        '
        ;;
    3)
        echo ""
        echo -e "${YELLOW}📝 所有测验：${NC}"
        mongosh quiz-system --quiet --eval '
            db.quizzes.find({}, { 
                title: 1, 
                isPublished: 1, 
                createdAt: 1 
            }).forEach(quiz => {
                print("---");
                print("ID:", quiz._id);
                print("标题:", quiz.title);
                print("状态:", quiz.isPublished ? "已发布" : "未发布");
                print("创建时间:", quiz.createdAt);
            });
            print("\n总计:", db.quizzes.countDocuments(), "个测验");
        '
        ;;
    4)
        echo ""
        echo -e "${YELLOW}❓ 所有问题：${NC}"
        mongosh quiz-system --quiet --eval '
            db.questions.find({}, { 
                questionText: 1, 
                type: 1, 
                quizId: 1 
            }).limit(10).forEach(q => {
                print("---");
                print("ID:", q._id);
                print("问题:", q.questionText.substring(0, 50) + "...");
                print("类型:", q.type);
                print("测验ID:", q.quizId);
            });
            print("\n总计:", db.questions.countDocuments(), "个问题（仅显示前10个）");
        '
        ;;
    5)
        echo ""
        echo -e "${YELLOW}📊 所有答题会话：${NC}"
        mongosh quiz-system --quiet --eval '
            db.quizsessions.find({}, { 
                studentId: 1, 
                quizId: 1, 
                status: 1, 
                score: 1,
                createdAt: 1 
            }).limit(10).forEach(session => {
                print("---");
                print("会话ID:", session._id);
                print("学生ID:", session.studentId);
                print("测验ID:", session.quizId);
                print("状态:", session.status);
                print("分数:", session.score || "未评分");
                print("创建时间:", session.createdAt);
            });
            print("\n总计:", db.quizsessions.countDocuments(), "个会话（仅显示前10个）");
        '
        ;;
    6)
        echo ""
        echo -e "${YELLOW}✍️  所有答案：${NC}"
        mongosh quiz-system --quiet --eval '
            db.answers.find({}, { 
                sessionId: 1, 
                questionId: 1, 
                isCorrect: 1 
            }).limit(10).forEach(answer => {
                print("---");
                print("答案ID:", answer._id);
                print("会话ID:", answer.sessionId);
                print("问题ID:", answer.questionId);
                print("是否正确:", answer.isCorrect);
            });
            print("\n总计:", db.answers.countDocuments(), "个答案（仅显示前10个）");
        '
        ;;
    7)
        echo ""
        echo -e "${YELLOW}🤖 所有 AI 分析记录：${NC}"
        mongosh quiz-system --quiet --eval '
            db.questionanalyses.find({}, { 
                questionId: 1, 
                createdAt: 1 
            }).forEach(analysis => {
                print("---");
                print("分析ID:", analysis._id);
                print("问题ID:", analysis.questionId);
                print("创建时间:", analysis.createdAt);
            });
            print("\n总计:", db.questionanalyses.countDocuments(), "个分析记录");
        '
        ;;
    8)
        echo ""
        echo -e "${YELLOW}📊 统计信息：${NC}"
        mongosh quiz-system --quiet --eval '
            print("用户数:", db.users.countDocuments());
            print("  - 老师:", db.users.countDocuments({ role: "teacher" }));
            print("  - 学生:", db.users.countDocuments({ role: "student" }));
            print("");
            print("测验数:", db.quizzes.countDocuments());
            print("  - 已发布:", db.quizzes.countDocuments({ isPublished: true }));
            print("  - 未发布:", db.quizzes.countDocuments({ isPublished: false }));
            print("");
            print("问题数:", db.questions.countDocuments());
            print("答题会话数:", db.quizsessions.countDocuments());
            print("  - 进行中:", db.quizsessions.countDocuments({ status: "in_progress" }));
            print("  - 已完成:", db.quizsessions.countDocuments({ status: "completed" }));
            print("");
            print("答案数:", db.answers.countDocuments());
            print("AI分析数:", db.questionanalyses.countDocuments());
        '
        ;;
    9)
        echo ""
        read -p "请输入用户邮箱: " email
        if [ ! -z "$email" ]; then
            echo ""
            echo -e "${YELLOW}👤 用户信息：${NC}"
            mongosh quiz-system --quiet --eval "
                var user = db.users.findOne({ email: '$email' });
                if (user) {
                    print('ID:', user._id);
                    print('姓名:', user.name);
                    print('邮箱:', user.email);
                    print('角色:', user.role);
                    print('创建时间:', user.createdAt);
                } else {
                    print('未找到该用户');
                }
            "
        else
            echo "邮箱不能为空"
        fi
        ;;
    10)
        echo ""
        read -p "请输入测验 ID: " quizId
        if [ ! -z "$quizId" ]; then
            echo ""
            echo -e "${YELLOW}📝 测验信息：${NC}"
            mongosh quiz-system --quiet --eval "
                var quiz = db.quizzes.findOne({ _id: ObjectId('$quizId') });
                if (quiz) {
                    print('ID:', quiz._id);
                    print('标题:', quiz.title);
                    print('描述:', quiz.description || '无');
                    print('状态:', quiz.isPublished ? '已发布' : '未发布');
                    print('创建时间:', quiz.createdAt);
                    print('');
                    var questionCount = db.questions.countDocuments({ quizId: quiz._id });
                    print('问题数:', questionCount);
                } else {
                    print('未找到该测验');
                }
            "
        else
            echo "测验 ID 不能为空"
        fi
        ;;
    0)
        echo "退出"
        exit 0
        ;;
    *)
        echo "无效的选项"
        ;;
esac

echo ""
echo "查看完成！"
