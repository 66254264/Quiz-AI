# End-to-End Validation Guide

This document provides a comprehensive checklist for validating all system functionality.

## Prerequisites

1. MongoDB running on localhost:27017
2. Backend server running on localhost:5000
3. Frontend dev server running on localhost:3000

## Starting the System

### 1. Start MongoDB
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 2. Start Backend
```bash
cd backend
npm install
npm run dev
```

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

## Validation Checklist

### ✅ Authentication Flow

#### Teacher Registration
- [ ] Navigate to http://localhost:3000/register
- [ ] Fill in registration form with teacher role:
  - Username: teacher1
  - Email: teacher@test.com
  - Password: password123
  - Role: Teacher
  - First Name: Test
  - Last Name: Teacher
- [ ] Click "注册" button
- [ ] Verify success toast appears
- [ ] Verify redirect to /teacher/questions
- [ ] Verify user name appears in navbar

#### Student Registration
- [ ] Open incognito/private window
- [ ] Navigate to http://localhost:3000/register
- [ ] Fill in registration form with student role:
  - Username: student1
  - Email: student@test.com
  - Password: password123
  - Role: Student
  - First Name: Test
  - Last Name: Student
- [ ] Click "注册" button
- [ ] Verify success toast appears
- [ ] Verify redirect to /student/quizzes
- [ ] Verify user name appears in navbar

#### Login/Logout
- [ ] Click "退出" button
- [ ] Verify redirect to /login
- [ ] Verify success toast appears
- [ ] Login with teacher credentials
- [ ] Verify redirect to teacher dashboard
- [ ] Logout and login with student credentials
- [ ] Verify redirect to student dashboard

### ✅ Teacher Workflow

#### Question Management
- [ ] Login as teacher
- [ ] Navigate to /teacher/questions
- [ ] Click "创建题目" button
- [ ] Fill in question form:
  - Title: "测试题目1"
  - Content: "这是一道测试题"
  - Options: Add 4 options (A, B, C, D)
  - Select correct answer
  - Difficulty: Medium
  - Tags: "测试"
- [ ] Click "保存" button
- [ ] Verify success toast appears
- [ ] Verify question appears in list
- [ ] Click edit icon on question
- [ ] Modify question title
- [ ] Save changes
- [ ] Verify changes reflected in list
- [ ] Create at least 5 more questions for testing

#### Quiz Session Creation (Backend)
Note: Quiz session creation UI is not implemented, so we'll use the backend seeder:
```bash
cd backend
npm run seed
```
- [ ] Verify seeder creates quiz sessions
- [ ] Check MongoDB for quiz sessions

#### Analytics Dashboard
- [ ] Navigate to /teacher/analytics
- [ ] Verify overall statistics display
- [ ] Select a quiz from dropdown
- [ ] Verify question statistics load
- [ ] Verify student performance table loads
- [ ] Test sorting functionality
- [ ] Test filtering options

### ✅ Student Workflow

#### Quiz Taking
- [ ] Login as student
- [ ] Navigate to /student/quizzes
- [ ] Verify available quizzes display
- [ ] Click "开始答题" on a quiz
- [ ] Verify redirect to quiz taking page
- [ ] Verify questions display correctly
- [ ] Verify progress indicator works
- [ ] Select answers for all questions
- [ ] Verify "提交答案" button enables
- [ ] Click "提交答案"
- [ ] Verify confirmation dialog appears
- [ ] Confirm submission

#### Results Review
- [ ] Verify redirect to results page
- [ ] Verify score displays correctly
- [ ] Verify percentage calculation is accurate
- [ ] Verify correct/incorrect indicators
- [ ] Verify correct answers shown
- [ ] Verify explanations display (if available)
- [ ] Click "返回答题列表"
- [ ] Verify redirect to quiz list

#### Multiple Attempts
- [ ] Take the same quiz again
- [ ] Verify new submission is created
- [ ] Verify results reflect new attempt

### ✅ Mobile Responsiveness

#### Mobile View (< 768px)
- [ ] Open Chrome DevTools
- [ ] Toggle device toolbar (Ctrl+Shift+M)
- [ ] Select iPhone 12 Pro
- [ ] Test all pages in portrait mode
- [ ] Verify touch-friendly buttons (44px minimum)
- [ ] Verify mobile navigation works
- [ ] Verify forms are usable
- [ ] Test in landscape mode
- [ ] Verify orientation changes handled

#### Tablet View (768px - 1024px)
- [ ] Select iPad Air
- [ ] Test all pages in portrait mode
- [ ] Test all pages in landscape mode
- [ ] Verify layout adapts appropriately
- [ ] Verify sidebar behavior

#### Desktop View (> 1024px)
- [ ] Test on full desktop viewport
- [ ] Verify sidebar always visible
- [ ] Verify responsive layout works
- [ ] Test window resizing

### ✅ Data Consistency

#### Teacher View
- [ ] Create multiple questions
- [ ] Verify all questions saved to database
- [ ] Check MongoDB directly:
```javascript
use quiz-system
db.questions.find().pretty()
```

#### Student Submissions
- [ ] Student completes quiz
- [ ] Check submissions in database:
```javascript
db.submissions.find().pretty()
```
- [ ] Verify all answers recorded
- [ ] Verify score calculated correctly
- [ ] Verify timestamps accurate

#### Analytics Accuracy
- [ ] Multiple students complete same quiz
- [ ] Check analytics dashboard
- [ ] Verify statistics match database:
```javascript
db.submissions.aggregate([
  { $group: {
    _id: "$quizId",
    avgScore: { $avg: "$score" },
    totalSubmissions: { $sum: 1 }
  }}
])
```

### ✅ Error Handling

#### Network Errors
- [ ] Stop backend server
- [ ] Try to perform actions in frontend
- [ ] Verify error toasts appear
- [ ] Verify user-friendly error messages
- [ ] Restart backend
- [ ] Verify system recovers

#### Validation Errors
- [ ] Try to create question with empty fields
- [ ] Verify validation messages appear
- [ ] Try to submit quiz without answering all questions
- [ ] Verify appropriate feedback

#### Authentication Errors
- [ ] Try to access protected routes without login
- [ ] Verify redirect to login page
- [ ] Try to access teacher routes as student
- [ ] Verify redirect to appropriate dashboard
- [ ] Try invalid login credentials
- [ ] Verify error message displays

### ✅ Performance

#### Load Times
- [ ] Measure initial page load (< 3s)
- [ ] Measure route transitions (< 500ms)
- [ ] Measure API response times (< 1s)
- [ ] Check Network tab in DevTools
- [ ] Verify code splitting working (multiple JS chunks)

#### Caching
- [ ] Load question list
- [ ] Check Network tab for cache hits
- [ ] Reload page
- [ ] Verify cached data used
- [ ] Create new question
- [ ] Verify cache invalidated

#### Bundle Size
- [ ] Run production build:
```bash
cd frontend
npm run build
```
- [ ] Check dist folder size
- [ ] Verify main bundle < 500KB
- [ ] Verify vendor chunks separated

### ✅ Security

#### Authentication
- [ ] Verify JWT tokens stored in localStorage
- [ ] Verify tokens sent in Authorization header
- [ ] Verify expired tokens handled
- [ ] Verify logout clears tokens

#### Authorization
- [ ] Verify students cannot access teacher routes
- [ ] Verify teachers cannot access student routes
- [ ] Verify API endpoints protected
- [ ] Try accessing API without token (should fail)

#### Input Sanitization
- [ ] Try XSS attacks in question content
- [ ] Verify content sanitized
- [ ] Try SQL injection patterns
- [ ] Verify MongoDB queries safe

## Test Data Setup

### Quick Test Data Script
Run this in MongoDB shell to create test data:

```javascript
use quiz-system

// Create test users (passwords are hashed, use registration instead)

// Create quiz session
db.quizsessions.insertOne({
  title: "测试测验",
  description: "这是一个测试测验",
  questions: [], // Add question IDs after creating questions
  timeLimit: 30,
  isActive: true,
  createdBy: ObjectId("teacher_id_here"),
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## Common Issues and Solutions

### Issue: Cannot connect to MongoDB
**Solution**: Ensure MongoDB is running and accessible on localhost:27017

### Issue: CORS errors
**Solution**: Verify CORS_ORIGIN in backend .env matches frontend URL

### Issue: 401 Unauthorized errors
**Solution**: Check if JWT tokens are valid and not expired

### Issue: Questions not loading
**Solution**: Verify questions exist in database and API endpoint working

### Issue: Mobile layout broken
**Solution**: Check Tailwind responsive classes and viewport meta tag

## Success Criteria

All checkboxes above should be checked (✓) for complete validation.

### Critical Paths (Must Pass)
1. ✅ User registration and login
2. ✅ Teacher can create and manage questions
3. ✅ Student can take quiz and view results
4. ✅ Analytics display correctly
5. ✅ Mobile responsive on all devices

### Important Paths (Should Pass)
1. ✅ Error handling works correctly
2. ✅ Performance meets targets
3. ✅ Security measures in place
4. ✅ Data consistency maintained

### Nice to Have (Optional)
1. ✅ Caching improves performance
2. ✅ Animations smooth
3. ✅ Accessibility features work
