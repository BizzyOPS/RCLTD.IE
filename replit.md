# Overview

This project is a professional static website for Robotics & Control Ltd, an Irish technology company, showcasing its industrial automation, safety solutions, electrical design, and panel building services. The website features a multi-page architecture with interactive elements, including a chatbot, training platform, and comprehensive contact forms designed to generate leads and establish the company's expertise in the automation industry. The site aims to provide a robust online presence with a professional and consistent brand image, incorporating social sharing meta tags, a unified icon system, and a CEMBRE-inspired store page redesign for an enhanced user experience and B2B focus.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The website is a static multi-page HTML application built with semantic HTML for accessibility and SEO. It uses a component-based CSS methodology with BEM-like naming conventions and CSS custom properties for consistent theming. A mobile-first responsive approach is implemented across 17 individual pages. The design incorporates a clean, minimal aesthetic with professional typography, unified icon systems, and consistent branding. Specific UI/UX decisions include a CEMBRE-inspired store page design with 4:3 aspect ratio images, professional typography hierarchy, 2-column grid layouts, and brand-consistent color schemes (teal #10b981, dark teal #0f766e). The site also features an auto-hide header for maximized view space and professional footer enhancements.

## JavaScript Architecture
Built with vanilla JavaScript (ES6+) organized using the Module Pattern, key interactive components include:
- A responsive navigation controller.
- A "Controller Bot" AI assistant with intelligent conversation flow, state management, and smart department routing:
  - **Conversation State Management**: Tracks discovery mode, service category, and industry context
  - **Guided Service Discovery**: 6-category discovery flow (automation, safety, design, panel, training, general)
  - **Industry-Specific Guidance**: Pharmaceutical, automotive, food & beverage automation advice
  - **Smart Department Routing**: Sales (automation, training), Technical (safety, design), Support (complaints/issues)
  - **Security**: URL encoding with encodeURIComponent via buildContactLink() helper
  - **Reset Functionality**: "start over", "reset", "main menu" commands to restart conversation
  - **Complete CTAs**: Every response includes contact links, phone numbers, and email
- An interactive safety training platform.
- Real-time client-side form validation with XSS prevention.
- A professional tooltip system.

## Design Patterns
The project adheres to:
- **Progressive Enhancement**: Core functionality works without JavaScript.
- **Component-Based CSS**: Modular and reusable CSS architecture.
- **Accessibility-First**: WCAG 2.1 AA compliance with ARIA attributes.
- **SEO Optimization**: Structured data and semantic markup.
- **Security-by-Design**: Production-grade input sanitization and secure form handling (Sept 2025):
  - **Trusted Data Model**: Application HTML built from static, trusted `trainingData` definitions - no parsing of untrusted content
  - **Comprehensive Escaping**: All dynamic strings (titles, descriptions, user input) flow through `escapeHtml()`/`escapeAttr()` before interpolation
  - **No User Input to innerHTML**: Strict separation - user input is escaped as text, never parsed as HTML
  - **Defense-in-Depth**: Multiple validation layers including client-side sanitization and server-side validation
  - **CodeQL Compliant**: No regex backtracking, no innerHTML security warnings, no DOM reinterpretation issues

## System Design Choices
- **Icon System**: Comprehensive custom PNG icon system with consistent sizing, coloring, drop-shadow effects, and aggressive transparency removal for seamless integration. This includes 48 professionally edited transparent PNG icon files.
- **Image Optimization**: Images are optimized for multiple screen sizes.
- **Homepage Hero Carousel (Sept 2025)**: Dynamic 40-second rotating background carousel showcasing 5 professional Unsplash images relevant to core services: industrial automation, electrical control panels, machine safety, panel building, and industrial technology. Images cycle smoothly using CSS keyframe animation.
- **Form Handling**: Department-specific email routing system with backend validation.
- **Page Layouts**: Streamlined service page layouts removing hero sections and intros to immediately showcase content. Hero sections are consistently applied or removed across pages for a unified user experience.
- **Hero Section Styling (Sept 2025)**: Black to navy to light gray gradient (`linear-gradient(180deg, #000000 0%, #0a1929 25%, #1e3a5f 50%, #4a5f7f 75%, #e5e7eb 100%)`) with sophisticated dual-layer hexagon pattern overlay applied to About, Services, Individual Service Pages (Automation, Safety, Design, Panel Building), Contact, Blog, and Store pages. The hexagon pattern uses color-coordinated tones (cyan/blue for dark gradient sections, gray/slate for lighter sections) that blend naturally with the background gradient. The pattern fades from visible (top) to transparent (bottom) with a mid-emphasis overlay layer for enhanced depth. Homepage and Safety Training maintain their unique hero styling.
- **Navigation System (Sept 2025)**: Auto-hide header that disappears on scroll down and reappears on scroll up. Mobile navigation menu is fully scrollable with enhanced dropdown visibility for all service pages.
- **Services Page Design (Sept 2025)**: Clean modern layout with unified hero section (matching About/Store/Blog), 5 service cards in responsive grid, feature lists with checkmarks, teal branding throughout. Full mobile responsiveness with proper viewport scaling.
- **Contact Page Design (Sept 2025)**: Modern split-screen B2B layout with unified hero section (matching About/Store/Blog), contact information on left (methods cards + office hours), simplified 5-field form on right (name, email, phone, service, message), trust/statistics section, and conversion-optimized minimal aesthetic matching CEMBRE-inspired design system. Fully responsive with mobile stacking.

# External Dependencies

## Third-Party Services
- **Google Fonts**: Inter font family for consistent typography.
- **Google Analytics**: For website analytics.
- **Google Maps**: Embedded for business location services.

## Email Integration
- **PHP Contact Forms**: Server-side processing via `contact-form.php`.
- **Email Configuration**: Designed for Plesk hosting with `info@rcltd.ie` as the primary contact.

## Development Tools
- **Node.js Environment**: Used for local development and security auditing.
- **ImageMagick**: System dependency for image processing, specifically aggressive transparency removal on icons.

## Browser Support
- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+.
- **Polyfill Support**: For cross-browser compatibility.