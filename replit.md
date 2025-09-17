# Robotics & Control Ltd Website

## Overview
This static website for Robotics & Control Ltd, an Irish technology company, showcases its automation, safety, electrical design, and panel building services. It targets pharmaceutical, industrial, and automotive sectors with a professional, responsive design, featuring service pages, contact information, and company details. The project aims to establish a strong online presence, attract new clients, and provide a clear representation of the company's expertise and offerings.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Static HTML Structure**: Multi-page website with dedicated pages for each service area (automation, safety, design, panel building, blog, contact).
- **CSS Framework**: Custom CSS with a modern design system utilizing CSS custom properties for consistent theming.
- **Responsive Design**: Mobile-first approach with responsive navigation and layout, ensuring optimal viewing across all devices.
- **Typography**: Uses the Inter font family from Google Fonts for a clean and professional appearance.
- **Color System**: A modern palette based on a teal primary color (#0891b2) complemented by grey, black, and white accents.
- **UI/UX Decisions**: Enlarged logo, orange hamburger menu, teal navigation links, and orange 'Quote' buttons for consistent branding. Professional gradient backgrounds, subtle industrial aesthetics, and professional hero images are used throughout. Particle animations have been removed for a more business-focused appearance.

### Design Patterns
- **Component-Based CSS**: Structured CSS using a BEM-like methodology for reusable components.
- **Semantic HTML**: Proper use of semantic elements for improved accessibility and SEO.
- **Progressive Enhancement**: Ensures base functionality works without JavaScript, with JS features adding enhancements.
- **SEO Optimization**: Includes meta descriptions, keywords, Open Graph tags, and structured data markup.

### JavaScript Architecture
- **Vanilla JavaScript**: Utilizes modern ES6+ features without external frameworks.
- **Loading Animation**: Professional logo-based loading animation with a fade-out effect on all pages.
- **Module Pattern**: Functions are organized into logical modules for navigation, scroll effects, contact forms, and animations.
- **Event-Driven**: Relies on DOM event listeners for user interactions.
- **Accessibility**: Incorporates ARIA attributes and keyboard navigation support.
- **AI Chatbot**: A specialized sales tool providing detailed service descriptions, industry-specific responses, and integrated navigation links.

### Navigation System
- **Services Dropdown Navigation**: A streamlined navigation system with a 'Services' dropdown menu encompassing all service links.
- **Dual-Function Services**: The 'Services' text links to an overview page, while a dedicated arrow button toggles the dropdown.
- **Responsive Navigation**: Features a mobile hamburger menu with smooth transitions and touch-friendly interactions.
- **Active State Management**: Visual indicators for the current page and active service within the dropdown.
- **Accessibility Features**: Includes proper ARIA labels, keyboard navigation, and focus management.
- **Standardized Structure**: Consistent navigation across all pages for a uniform user experience.
- **Scroll-to-Top**: A smooth scroll-to-top button appears when scrolling down, positioned at the bottom-right.
- **Clickable Logo**: The logo and business name in the header are clickable, returning users to the homepage.
- **Solid Header**: Implemented a solid header that merges with page colors and dynamically switches between dark/light backgrounds for optimal readability.

## External Dependencies

### Third-Party Services
- **Google Fonts**: The Inter font family is loaded via CDN for consistent typography.
- **Google Analytics**: Structured data markup implies integration for website analytics.
- **Google Maps**: Integrated into contact page for location services.

### Assets and Media
- **Images**: Logo and service-related hero images are stored in the `/images/` directory. Hero images are designed for responsive coverage (1920×1080 pixels or higher) with a central "safe zone" for critical content.
- **Icons**: Custom hamburger menu implementation and other service-related icons.
- **Favicons**: Standard favicon setup for brand consistency.