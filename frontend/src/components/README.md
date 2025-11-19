# 响应式组件说明

## 布局组件

### ResponsiveLayout
主要的响应式布局容器，集成了导航栏和侧边栏。
- 自动适配桌面和移动端
- 支持侧边栏切换
- 角色区分（教师/学生）

### Navbar
响应式导航栏组件
- 桌面端：水平导航菜单
- 移动端：汉堡菜单 + 下拉导航
- 支持当前路由高亮

### Sidebar
响应式侧边栏组件
- 桌面端：固定显示
- 移动端：抽屉式侧边栏，带遮罩层
- 图标 + 文字导航

## 移动端优化组件

### TouchButton
触摸友好的按钮组件
- 最小触摸目标 44px
- 触摸反馈动画
- 多种样式变体

### MobileInput / MobileTextarea / MobileSelect
移动端优化的表单组件
- 更大的输入框和字体
- 触摸友好的尺寸
- 错误提示和帮助文本

### BottomSheet
移动端底部弹出层
- 移动端：从底部滑出
- 桌面端：居中模态框
- 支持手势拖动关闭

### LoadingSpinner
加载指示器
- 多种尺寸
- 可选消息文本
- 全屏或内联模式

### PullToRefresh
下拉刷新组件
- 触摸手势支持
- 刷新进度指示
- 自定义刷新阈值

### OrientationAware
屏幕方向感知组件
- 检测横竖屏切换
- 可选方向提示
- 不同方向显示不同内容

## Hooks

### useMediaQuery
媒体查询 Hook
- `useIsMobile()` - 检测移动设备
- `useIsTablet()` - 检测平板设备
- `useIsDesktop()` - 检测桌面设备

### useOrientation
屏幕方向 Hook
- 返回 'portrait' 或 'landscape'
- 自动监听方向变化

### useSwipe
滑动手势 Hook
- 支持上下左右滑动
- 可配置最小滑动距离
- 触摸事件处理

## 样式优化

### Tailwind 配置
- 添加 xs 断点 (475px)
- 安全区域支持（刘海屏）
- 触摸操作优化类
- 文本截断工具类

### 全局样式
- 触摸友好的最小尺寸
- 平滑滚动
- 防止横向滚动
- 安全区域内边距

### 移动端 Meta 标签
- 视口配置
- PWA 支持
- 主题颜色
- 状态栏样式

## 使用示例

```tsx
// 使用响应式布局
<ResponsiveLayout role="student" showSidebar={true}>
  <YourContent />
</ResponsiveLayout>

// 使用触摸按钮
<TouchButton variant="primary" size="large" fullWidth>
  提交答案
</TouchButton>

// 使用移动输入框
<MobileInput
  label="题目标题"
  error={errors.title}
  value={title}
  onChange={(e) => setTitle(e.target.value)}
/>

// 使用底部弹出层
<BottomSheet isOpen={isOpen} onClose={onClose} title="选项">
  <YourContent />
</BottomSheet>

// 使用媒体查询
const isMobile = useIsMobile();
if (isMobile) {
  // 移动端特定逻辑
}

// 使用滑动手势
const swipeHandlers = useSwipe({
  onSwipeLeft: handleNext,
  onSwipeRight: handlePrevious,
});
<div {...swipeHandlers}>
  <Content />
</div>
```

## 响应式断点

- xs: 475px
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

## 触摸目标尺寸

根据 WCAG 和移动端最佳实践：
- 最小触摸目标：44x44px
- 推荐触摸目标：48x48px
- 按钮间距：至少 8px

## 性能优化

- 使用 CSS transform 实现动画
- 避免布局抖动
- 懒加载和代码分割
- 触摸事件防抖
