# Responsive Design Testing Plan

## Overview
Testing the website's responsiveness across multiple viewport sizes to ensure proper scaling and functionality.

## Test Viewport Sizes
Based on CSS breakpoints found in the code:

### Mobile Viewports
- **Extra Small**: 320px width (minimum mobile)
- **Small Mobile**: 375px width (iPhone standard)
- **Large Mobile**: 479px width (breakpoint boundary)

### Tablet Viewports  
- **Small Tablet**: 768px width (iPad portrait)
- **Large Tablet**: 1024px width (iPad landscape)

### Desktop Viewports
- **Standard Desktop**: 1440px width (common laptop)
- **Large Desktop**: 1920px width (full HD monitor)

## CSS Breakpoints Identified
- `max-width: 479px` - Extra small mobile
- `max-width: 767px` - Mobile  
- `max-width: 768px` - Mobile/Tablet boundary
- `min-width: 768px` - Tablet and up
- `min-width: 1024px` - Desktop and up
- `min-width: 1440px` - Large desktop

## Pages to Test
1. **Homepage** (`index.html`)
2. **Safety Training** (`safety-training.html`) 
3. **Contact Page** (`contact.html`)

## Elements to Verify at Each Breakpoint

### Navigation
- Mobile (<768px): Hamburger menu, stacked items
- Desktop (≥768px): Horizontal menu, contact info visible
- Touch targets minimum 44px on mobile

### Hero Section
- Mobile: Stacked content, smaller typography
- Desktop (≥768px): Two-column grid, larger typography

### Content Grids
- Services: 1 col mobile → 2 cols tablet → 3 cols desktop
- About: 1 col mobile → 2 cols tablet+

### Typography Scaling
- Hero title: 1.75rem mobile → 3rem desktop
- Proper font scaling at all breakpoints

### Interactive Elements
- Chatbot: Full-screen mobile, corner popup desktop
- Tooltips: Hidden on mobile (<767px)
- Form elements: Proper sizing and spacing

### Layout Elements
- Footer: Stacked mobile, columns desktop
- Scroll-to-top: Adjusted size and position
- Social icons: Larger on mobile for touch

## Test Scenarios
For each page and viewport size, verify:
1. No horizontal scrolling
2. Content readable without zooming
3. Interactive elements accessible
4. Images scale properly
5. Text doesn't overflow containers
6. Navigation functions correctly
7. Loading animations work
8. No visual glitches or overlapping elements

## Success Criteria
- All content visible and accessible at each viewport
- Touch targets meet 44px minimum on mobile
- Typography scales appropriately
- No horizontal scrolling on any viewport
- All interactive elements functional
- Visual hierarchy maintained across breakpoints