# Robotics & Control Ltd Website

## Overview

This is a static website for Robotics & Control Ltd, an Irish technology company providing automation, safety, electrical design, and panel building services. The website serves as a professional showcase for their services across pharmaceutical, industrial, and automotive sectors. It features a modern, responsive design with multiple service pages, contact information, and company details.

## Recent Changes

**September 14, 2025**
- **Professional Background Redesign**: Removed unprofessional circuit board traces ("black lines") above main heading and replaced with clean professional gradient background featuring Black → Dark Blue → Navy Blue → Grey → White color blending for enhanced visual appeal
- **Mobile Navigation Fix**: Resolved navigation menu glitching and scrollability issues by disabling all animation effects on navigation elements and implementing 80vh height with smooth touch scrolling for access to all pages
- **Digital Glitch Effect Implementation**: Created proper digital glitch effect (not glow) with RGB channel splitting, scanline artifacts, and jittery movement applied to main page headings only (hero titles and primary h1 headings) with hover and viewport entry triggers
- **Interactive Popup Tooltips**: Added dismissible popup tooltips to homepage service cards and expertise sections that appear automatically after page load with helpful information and professional styling
- **Responsive Training Scaling**: Fixed all scaling issues across training sections and knowledge check questions for mobile and desktop
- **Mobile Navigation Touch Target Improvements**: Enhanced mobile menu usability by implementing proper touch targets (44px minimum height) for all navigation links, improved spacing, and visual feedback for better mobile accessibility
- **Custom Industrial Background Design**: Redesigned homepage hero background with black-to-grey-to-white gradient and floating mechanical cogs. Replaced electric circuit animation with proper gear-shaped elements in white, yellow, red, and brown colors that gently float without rotation for subtle industrial aesthetic
- **Enhanced AI Chatbot with Service Specificity**: Completely transformed Controller Bot from generic assistant to specialized R&C Ltd sales tool with detailed service descriptions, industry-specific responses (pharmaceutical, automotive, food & beverage), and comprehensive navigation features
- **Chatbot Navigation Integration**: Added clickable links throughout all chatbot responses directing users to relevant pages (automation.html, safety.html, contact.html, etc.) with professional styling and hover effects
- **Expanded Quick Action Buttons**: Increased from 3 to 6 quick action buttons covering all core services (Automation, Safety, Electrical Design, Panel Building, Training, Get Quote) for improved user guidance
- **Security Implementation**: Implemented comprehensive XSS protection with HTML escaping, URL sanitization, and safe Markdown rendering while maintaining full functionality
- **LinkedIn Social Media Integration**: Added LinkedIn social media button to all 15 page footers (automation.html, blog.html, cart.html, checkout.html, contact.html, cookies-policy.html, design.html, panel.html, privacy-policy.html, refund-policy.html, safety-training.html, safety.html, services.html, store.html, terms-of-service.html) with proper URL https://www.linkedin.com/company/robotics-control/
- **Footer Contact Link Visibility Fix**: Changed footer phone and email link colors from rgba(255,255,255,0.9) to white for better visibility, with green hover color (#10b981) for improved accessibility
- **Contact Page Interactive Cards**: Made contact page phone, email, and location cards fully clickable with proper anchor tags and hover effects, including telephone links, mailto links, and Google Maps integration
- **Shopping Cart Navigation Fix**: Resolved cart icon confusion by changing from sidebar toggle button to proper navigation links to cart.html across all pages, eliminating user confusion about cart functionality
- **Page Load Position**: Ensured all pages start at the top when loaded, preventing browsers from remembering previous scroll positions
- **Scroll to Top Feature**: Added smooth scroll-to-top button that appears when scrolling down 300px, positioned bottom-right with professional teal styling
- **Clickable Logo Navigation**: Logo and business name in header now clickable and take users back to homepage across all 13 pages
- **Solid Header Navigation**: Implemented solid header that merges with page colors and dynamically switches between dark/light backgrounds
- **Dynamic Text Contrast**: Header text automatically switches between white (on dark backgrounds) and black (on light backgrounds) for optimal readability
- **Enhanced Circuit Background**: Replaced rain-like lines with proper PCB circuit board patterns that resemble actual electronic components
- **Safety Training Grading System**: Implemented 90% pass requirement with detailed grading results and celebration effects for perfect scores
- **Training Course Updates**: Removed certificate references from all training descriptions and meta tags
- **Responsive Training Scaling**: Fixed all scaling issues across training sections and knowledge check questions for mobile and desktop
- **Celebration Effects**: Added confetti animation and celebration message for 100% perfect scores
- **Hero Section Electric Background**: Implemented dark electric circuit pattern background extending down to services section
- **Animated Hero Title**: Added glitch/electric crackle effects with randomized letter animations for dynamic visual impact
- **Professional Hero Images**: Replaced carousel with 5 new professional robotics images showcasing company expertise
- **Extended Dark Background**: Extended electric background coverage from 60% to 75% with seamless fade to white
- **SEO-Optimized Animations**: Maintained semantic HTML structure while adding impressive visual effects
- **Footer Certifications**: Added professional certifications and partnerships section to footer across all pages with integrated color scheme
- **Interactive Particles**: Added moving particles animation with multiple colors and shapes for visual engagement
- **Image Carousel**: Integrated responsive carousel with autoplay, navigation controls, and touch/swipe support
- **Accessibility Features**: Full reduced motion support and ARIA compliance for inclusive user experience
- **Performance Optimization**: Responsive particle settings and efficient animations for all device types
- Replaced logo with professional Robotics & Control Ltd branding across all pages
- Updated loading screens to use real logo instead of diamond animation for enhanced brand identity
- Added R&C diamond loading animation across all 13 pages for brand consistency (later replaced with logo)
- Restructured navigation with single Services dropdown menu replacing individual service items
- Created new comprehensive services.html overview page with all services listed
- Standardized navigation structure across all pages with proper active states
- Implemented dual-function Services navigation (text links to overview, arrow toggles dropdown)
- Fixed mobile dropdown behavior for proper expand/collapse functionality

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Static HTML Structure**: Multi-page website with dedicated pages for each service area (automation, safety, design, panel building, safety training, blog, contact)
- **CSS Framework**: Custom CSS with modern design system using CSS custom properties for consistent theming
- **Responsive Design**: Mobile-first approach with responsive navigation and layout
- **Typography**: Inter font family from Google Fonts for clean, professional appearance
- **Color System**: Modern palette using teal primary color (#0891b2) with grey, black, and white accents

### Design Patterns
- **Component-Based CSS**: Structured CSS using BEM-like methodology with reusable components
- **Semantic HTML**: Proper use of semantic elements for accessibility and SEO
- **Progressive Enhancement**: Base functionality works without JavaScript, enhanced with JS features
- **SEO Optimization**: Meta descriptions, keywords, Open Graph tags, and structured data markup

### JavaScript Architecture
- **Vanilla JavaScript**: No frameworks, using modern ES6+ features
- **Loading Animation**: Professional logo-based loading animation with fade-out effect on all pages
- **Module Pattern**: Functions organized into logical modules (navigation, scroll effects, contact forms, animations)
- **Event-Driven**: DOM event listeners for user interactions
- **Accessibility**: ARIA attributes and keyboard navigation support

### Navigation System
- **Services Dropdown Navigation**: Streamlined navigation with Services dropdown menu containing all service links
- **Dual-Function Services**: Services text navigates to overview page, dedicated arrow button toggles dropdown
- **Responsive Navigation**: Mobile hamburger menu with smooth transitions
- **Active State Management**: Visual indication of current page and active service in dropdown
- **Accessibility Features**: Proper ARIA labels, keyboard navigation, and focus management
- **Mobile-First**: Collapsible menu for mobile devices with touch-friendly interactions
- **Standardized Structure**: Identical navigation across all 13 pages for consistent user experience

## External Dependencies

### Third-Party Services
- **Google Fonts**: Inter font family loaded via CDN for consistent typography
- **Google Analytics**: Structured data markup suggests analytics integration (implementation not visible in provided files)

### Potential Integrations
- **Contact Forms**: Contact page suggests form handling capability (backend integration required)
- **Blog System**: Blog page indicates content management needs
- **SEO Tools**: Structured data markup for search engine optimization

### Assets and Media
- **Images**: Logo and potentially service-related images stored in `/images/` directory
- **Icons**: Custom hamburger menu implementation, likely additional icons for services
- **Favicons**: Standard favicon setup expected for brand consistency