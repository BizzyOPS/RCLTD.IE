# Robotics & Control Ltd Website

## Overview

This is a static website for Robotics & Control Ltd, an Irish technology company providing automation, safety, electrical design, and panel building services. The website serves as a professional showcase for their services across pharmaceutical, industrial, and automotive sectors. It features a modern, responsive design with multiple service pages, contact information, and company details.

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
- **Module Pattern**: Functions organized into logical modules (navigation, scroll effects, contact forms, animations)
- **Event-Driven**: DOM event listeners for user interactions
- **Accessibility**: ARIA attributes and keyboard navigation support

### Navigation System
- **Responsive Navigation**: Mobile hamburger menu with smooth transitions
- **Active State Management**: Visual indication of current page
- **Accessibility Features**: Proper ARIA labels, keyboard navigation, and focus management
- **Mobile-First**: Collapsible menu for mobile devices with touch-friendly interactions

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