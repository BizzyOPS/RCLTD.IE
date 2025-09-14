# Robotics & Control Ltd Website

## Overview

This is a static website for Robotics & Control Ltd, an Irish technology company providing automation, safety, electrical design, and panel building services. The website serves as a professional showcase for their services across pharmaceutical, industrial, and automotive sectors. It features a modern, responsive design with multiple service pages, contact information, and company details.

## Recent Changes

**September 14, 2025**
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