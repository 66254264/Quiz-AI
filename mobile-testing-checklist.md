# Mobile Testing Checklist

## Device Testing Matrix

### iOS Devices
- [ ] iPhone SE (375x667) - Small screen
- [ ] iPhone 12/13 (390x844) - Standard
- [ ] iPhone 12/13 Pro Max (428x926) - Large
- [ ] iPad Mini (768x1024) - Small tablet
- [ ] iPad Air (820x1180) - Standard tablet
- [ ] iPad Pro 12.9" (1024x1366) - Large tablet

### Android Devices
- [ ] Samsung Galaxy S20 (360x800) - Small
- [ ] Google Pixel 5 (393x851) - Standard
- [ ] Samsung Galaxy S21 Ultra (412x915) - Large
- [ ] Samsung Galaxy Tab A (768x1024) - Tablet

## Orientation Testing

### Portrait Mode
- [ ] Login page layout
- [ ] Registration page layout
- [ ] Question list (teacher)
- [ ] Question form (teacher)
- [ ] Quiz list (student)
- [ ] Quiz taking interface
- [ ] Results page
- [ ] Analytics dashboard

### Landscape Mode
- [ ] Login page layout
- [ ] Registration page layout
- [ ] Question list (teacher)
- [ ] Question form (teacher)
- [ ] Quiz list (student)
- [ ] Quiz taking interface
- [ ] Results page
- [ ] Analytics dashboard

## Touch Interaction Testing

### Button Sizes
- [ ] All buttons minimum 44x44px
- [ ] Touch targets well-spaced (8px minimum)
- [ ] No overlapping touch areas
- [ ] Buttons respond to touch immediately

### Form Inputs
- [ ] Text inputs large enough for touch
- [ ] Keyboard doesn't obscure inputs
- [ ] Auto-focus works correctly
- [ ] Input validation visible
- [ ] Error messages readable

### Gestures
- [ ] Swipe to navigate (where applicable)
- [ ] Pull to refresh works
- [ ] Scroll smooth and responsive
- [ ] Pinch to zoom disabled (where appropriate)
- [ ] Long press actions work

## Layout Testing

### Responsive Breakpoints
- [ ] < 640px (mobile)
- [ ] 640px - 768px (large mobile)
- [ ] 768px - 1024px (tablet)
- [ ] > 1024px (desktop)

### Component Adaptation
- [ ] Navbar collapses on mobile
- [ ] Sidebar becomes drawer on mobile
- [ ] Tables become cards on mobile
- [ ] Forms stack vertically on mobile
- [ ] Images scale appropriately
- [ ] Text remains readable

### Spacing and Padding
- [ ] Adequate padding on all sides
- [ ] Content not touching edges
- [ ] Consistent spacing between elements
- [ ] No horizontal scrolling
- [ ] Safe area respected (notch, home indicator)

## Typography Testing

### Font Sizes
- [ ] Minimum 16px for body text
- [ ] Headings appropriately sized
- [ ] Labels readable
- [ ] Error messages visible
- [ ] No text truncation

### Line Height
- [ ] Adequate line spacing
- [ ] Paragraphs readable
- [ ] Lists well-spaced

## Navigation Testing

### Mobile Navigation
- [ ] Hamburger menu works
- [ ] Menu items accessible
- [ ] Back button works
- [ ] Breadcrumbs (if any) work
- [ ] Deep linking works

### Tab Navigation
- [ ] Tabs visible and accessible
- [ ] Active tab indicated
- [ ] Tab content loads correctly
- [ ] Swipe between tabs (if implemented)

## Performance Testing

### Load Times
- [ ] Initial load < 3s on 3G
- [ ] Route transitions < 500ms
- [ ] Images load progressively
- [ ] Lazy loading works

### Scrolling Performance
- [ ] Smooth 60fps scrolling
- [ ] No jank or stuttering
- [ ] Long lists virtualized
- [ ] Infinite scroll works

### Memory Usage
- [ ] No memory leaks
- [ ] App doesn't crash
- [ ] Background tabs don't consume resources

## Functionality Testing

### Teacher Features (Mobile)
- [ ] Can create questions
- [ ] Can edit questions
- [ ] Can delete questions
- [ ] Can view analytics
- [ ] Can filter/sort data
- [ ] Can export data

### Student Features (Mobile)
- [ ] Can view quiz list
- [ ] Can start quiz
- [ ] Can answer questions
- [ ] Can navigate between questions
- [ ] Can submit quiz
- [ ] Can view results

### Authentication (Mobile)
- [ ] Can register
- [ ] Can login
- [ ] Can logout
- [ ] Session persists
- [ ] Auto-logout works

## Browser Testing

### iOS Browsers
- [ ] Safari (primary)
- [ ] Chrome
- [ ] Firefox

### Android Browsers
- [ ] Chrome (primary)
- [ ] Samsung Internet
- [ ] Firefox

## Network Conditions

### Connection Types
- [ ] WiFi
- [ ] 4G
- [ ] 3G
- [ ] Slow 3G
- [ ] Offline (error handling)

### Network Interruptions
- [ ] Handle connection loss gracefully
- [ ] Show appropriate error messages
- [ ] Retry failed requests
- [ ] Cache works offline

## Accessibility Testing

### Screen Reader
- [ ] VoiceOver (iOS) works
- [ ] TalkBack (Android) works
- [ ] All interactive elements labeled
- [ ] Navigation logical

### Visual
- [ ] Sufficient color contrast
- [ ] Text scalable
- [ ] Focus indicators visible
- [ ] No color-only information

### Motor
- [ ] Large touch targets
- [ ] No time-based interactions
- [ ] Alternative input methods work

## Edge Cases

### Content Overflow
- [ ] Long usernames handled
- [ ] Long question text handled
- [ ] Many options handled
- [ ] Long error messages handled

### Empty States
- [ ] No questions message
- [ ] No quizzes message
- [ ] No results message
- [ ] Loading states shown

### Error States
- [ ] Network errors shown
- [ ] Validation errors shown
- [ ] Server errors shown
- [ ] 404 pages work

## Specific Component Testing

### Question Form (Mobile)
- [ ] All fields accessible
- [ ] Add/remove options works
- [ ] Validation visible
- [ ] Save button accessible
- [ ] Cancel button accessible

### Quiz Taking (Mobile)
- [ ] Questions readable
- [ ] Options selectable
- [ ] Progress indicator visible
- [ ] Navigation buttons accessible
- [ ] Submit button accessible

### Results Page (Mobile)
- [ ] Score visible
- [ ] Percentage visible
- [ ] Answer review readable
- [ ] Correct/incorrect indicators clear
- [ ] Return button accessible

### Analytics (Mobile)
- [ ] Charts render correctly
- [ ] Tables scrollable
- [ ] Filters accessible
- [ ] Data readable
- [ ] Export works

## Testing Tools

### Browser DevTools
```
Chrome DevTools:
1. F12 to open DevTools
2. Ctrl+Shift+M for device toolbar
3. Select device from dropdown
4. Test in portrait and landscape
```

### Real Device Testing
```
iOS:
1. Connect iPhone via USB
2. Enable Web Inspector in Safari
3. Open Safari > Develop > [Device]

Android:
1. Enable USB debugging
2. Connect via USB
3. Chrome > chrome://inspect
```

### Responsive Testing Tools
- Chrome DevTools Device Mode
- Firefox Responsive Design Mode
- BrowserStack (real devices)
- LambdaTest (real devices)

## Common Mobile Issues

### Issue: Text too small
**Fix**: Increase font-size, minimum 16px

### Issue: Buttons too small
**Fix**: Increase padding, minimum 44x44px

### Issue: Horizontal scrolling
**Fix**: Check max-width, use overflow-x: hidden

### Issue: Keyboard covers input
**Fix**: Scroll input into view on focus

### Issue: Slow performance
**Fix**: Optimize images, reduce bundle size, lazy load

### Issue: Touch not working
**Fix**: Check z-index, pointer-events, touch-action

## Testing Checklist Summary

### Critical (Must Pass)
- [ ] All pages render correctly on mobile
- [ ] All interactive elements work with touch
- [ ] Navigation works on all devices
- [ ] Forms are usable on mobile
- [ ] Performance acceptable on 3G

### Important (Should Pass)
- [ ] Orientation changes handled
- [ ] Gestures work smoothly
- [ ] Typography readable
- [ ] Spacing appropriate
- [ ] Network errors handled

### Nice to Have
- [ ] Animations smooth
- [ ] PWA features work
- [ ] Offline mode works
- [ ] Advanced gestures work

## Sign-off

- [ ] All critical tests passed
- [ ] All important tests passed
- [ ] Known issues documented
- [ ] Mobile testing complete

**Tested by**: _______________
**Date**: _______________
**Devices tested**: _______________
