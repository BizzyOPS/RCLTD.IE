# Overview

This project is a professional static website for Robotics & Control Ltd, an Irish technology company established in 2010. The website serves as the primary online presence for showcasing the company's industrial automation, safety solutions, electrical design, and panel building services. The site features a multi-page architecture with interactive elements including a chatbot, training platform, and comprehensive contact forms designed to generate leads and establish the company's expertise in the automation industry.

## Recent Updates (September 29, 2025)

- **Department Contact System Implementation**: Successfully integrated department-specific email routing system with dedicated contact information for HSO (chelsey.omahony@rcltd.ie), Operations (morgan@rcltd.ie), Marketing (benedict.larkin@rcltd.ie), and General Administration (lmccormack@rcltd.ie) 
- **Enhanced About Page**: Added professional department contact cards with SVG icons, hover effects, and clear contact information
- **Enhanced Contact Page**: Added department contact section and dropdown selection in contact form for targeted email routing
- **Backend Email Routing**: Updated contact-form.php with department validation, case-insensitive email matching, and proper routing logic to send emails to appropriate department contacts
- **Professional Styling**: Added comprehensive CSS styling for department contact cards, responsive grid layouts, and professional visual design
- **Bug Fixes**: Resolved critical order-of-operations issue in contact form processing to ensure proper department email routing
- **Complete Professional Icon System**: Successfully replaced all emoji icons across the entire website with professional PNG alternatives, creating 35+ custom PNG icons including search, phone, email, target, delivery, tools, location, ruler, testing, package, graduation, control panel, clock, people, electrical, robot, analytics, automation, safety, checklist, training, factory, automotive, gear, rocket, handshake, food, sensor, display, and network icons for all service cards, feature items, category cards, and interactive elements
- **Enhanced Visual Consistency**: Added comprehensive CSS styling for SVG icons with consistent sizing (2.5rem for service cards, 20px for feature icons, 32px for category/industry icons) and brand-consistent coloring using CSS filters
- **Button Text Color Resolution**: Fixed critical CSS specificity and caching issue causing the "Schedule Training" button to display teal text instead of white, implementing multi-layered CSS solutions including high-specificity rules, pseudo-class overrides, inline styles, cache-busting parameters, and ID-based targeting
- **Cross-Browser Compatibility**: Ensured all emoji-to-SVG replacements and CSS fixes work consistently across browsers with proper fallbacks and cache management
- **Streamlined Service Page Layouts**: Successfully removed hero sections and company intro sections from all individual service pages (automation.html, safety.html, design.html, panel.html) to make section headings the first visible content, creating a cleaner, more focused user experience that immediately showcases service capabilities without introductory content
- **Complete Modern Colored Icon System**: Successfully replaced 35+ black and white icons across the entire website with modern, professional colored icons in Flaticon style, including all service icons (automation, safety, electrical, panel building), utility icons (phone, email, clock, people, analytics, gear), feature icons (robot, electrical, factory, tools, search, delivery), training course icons (forklift, fire safety, first aid), and industry icons (automotive, food, beverage) with vibrant colors and professional design for enhanced visual appeal and user experience
- **Footer Enhancement**: Improved footer visibility and professional appearance by removing "Certifications & Partnerships" headers across all pages, enlarging footer logo from 40px to responsive sizing (68px mobile, 84px tablet, 96px desktop), and optimizing certification images with consistent max-height values for better proportional design and visual hierarchy
- **Safety Training Page Cleanup**: Removed problematic loading animation system causing unwanted visual artifacts at the bottom of the safety training page, cleaning up the training-loader.js script and associated HTML elements for a cleaner, more professional user experience
- **Auto-Hide Header Implementation**: Enhanced header functionality to automatically disappear when scrolling down and reappear when scrolling up, maximizing page view space and improving user experience. The header uses smooth transitions and maintains theme switching while providing intelligent scroll-based hiding with a 100px threshold for optimal usability
- **About Page Hero Section Removal**: Removed the hero section from the About page to create a cleaner, more focused layout that immediately showcases company information without introductory content
- **About Page Video Relocation**: Moved the company introduction video from the intro section to the "Ready to Transform" section for better visual impact and engagement at the call-to-action point
- **Blog Page Streamlining**: Removed the hero section and CEng/TÜV badges from the Blog page, restructured the featured article section to single-column layout at the very top for immediate content visibility without white space or distracting visual elements
- **Hero Section Addition**: Added professional hero sections to About and Blog pages matching the Store page design, featuring badge elements, page titles, and compelling subtitles for consistent user experience across all major pages
- **About Page Video Enhancement**: Removed the teal gradient background box from the company introduction video for a cleaner, more professional presentation
- **Unified Icon System**: Implemented comprehensive icon sizing and transparency system across all pages with professional sizing (Large 48px for prominent icons, Medium 40px for categories, Medium-Small 32px for details, Small 24px for inline icons), removed white background CSS from safety training page icons, added consistent drop-shadow effects for icons on dark backgrounds, and consolidated all icon CSS rules into a single unified system eliminating duplicate definitions

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The website is built as a static multi-page HTML application with 17 individual pages covering services, company information, and legal documentation. The architecture follows a component-based CSS methodology using BEM-like naming conventions and employs semantic HTML for accessibility and SEO optimization. The design system utilizes CSS custom properties (variables) for consistent theming across all pages, with a mobile-first responsive approach.

## JavaScript Architecture
Built with vanilla JavaScript (ES6+) organized using the Module Pattern, the site features several key interactive components:
- **Loading Animation System**: Logo-based loading animations for professional page transitions
- **Navigation Controller**: Responsive navigation with dropdown menus and mobile hamburger functionality
- **Chatbot Interface**: "Controller Bot" AI assistant for customer engagement and lead qualification
- **Training Platform**: Interactive safety training system with progress tracking and certification
- **Form Validation**: Real-time client-side validation with XSS prevention and accessibility compliance
- **Tooltip System**: Professional tooltip interface for contextual help and information

## Design Patterns
The project implements several key design patterns:
- **Progressive Enhancement**: Core functionality works without JavaScript, enhanced features layer on top
- **Component-Based CSS**: Modular CSS architecture with reusable components
- **Accessibility-First**: WCAG 2.1 AA compliance with ARIA attributes and keyboard navigation
- **SEO Optimization**: Structured data, meta descriptions, and semantic markup throughout
- **Security-by-Design**: Input sanitization, XSS prevention, and secure form handling

## File Organization
The project follows a logical directory structure:
- `/css/` - Stylesheets with variables, main styles, and validation-specific CSS
- `/js/` - JavaScript modules for app functionality, chatbot, validation, and training
- `/images/` - Optimized images including logos, heroes, and service graphics
- `/videos/` - Loading animations and promotional content
- Root HTML files for each page with comprehensive meta tags and accessibility features

# External Dependencies

## Third-Party Services
- **Google Fonts**: Inter font family loaded via CDN for consistent typography
- **Google Analytics**: Integrated for website analytics and visitor tracking
- **Google Maps**: Embedded into the contact page for business location services

## Email Integration
- **PHP Contact Forms**: Server-side form processing via `contact-form.php`
- **Email Configuration**: Designed for Plesk hosting environment with `info@rcltd.ie` contact email

## Development Tools
- **Node.js Environment**: Package.json configured for local development and security auditing
- **Security Auditing**: Comprehensive security tools including audit-ci, better-npm-audit, and vulnerability scanning
- **Code Quality**: Semgrep rules for static analysis and security validation

## Browser Support
- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+
- **Polyfill Support**: Cross-browser compatibility shims for older browser features
- **Progressive Enhancement**: Core functionality works across all browsers with enhanced features for modern ones

## Assets and Media
- **Responsive Images**: Logo and hero images optimized for multiple screen sizes
- **Video Content**: MP4 loading animations and promotional videos
- **Icon System**: Custom favicon implementation and service-related iconography
- **Font Loading**: Optimized web font loading with fallback font stacks