# Overview

This project is the official static website for Robotics & Control Ltd, an Irish technology company. It serves as a comprehensive online showcase for their industrial automation, safety solutions, electrical design, and panel building services. The website features a multi-page architecture with interactive elements like a chatbot and a training platform, alongside detailed contact forms designed to generate leads and establish the company's expertise in the automation industry. The site aims for a robust online presence with a professional and consistent brand image, incorporating social sharing meta tags, a unified icon system, and a CEMBRE-inspired design for an enhanced user experience and B2B focus.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The website is a static multi-page HTML application built with semantic HTML for accessibility and SEO. It employs a component-based CSS methodology with BEM-like naming conventions and CSS custom properties for consistent theming. A mobile-first responsive approach is implemented across 17 individual pages, emphasizing a clean, minimal aesthetic with professional typography and consistent branding. UI/UX decisions include a CEMBRE-inspired store page design, professional typography hierarchy, 2-column grid layouts, and a brand-consistent color scheme (teal #10b981, dark teal #0f766e). Features include an auto-hide header for maximized view space and enhanced professional footers.

## JavaScript Architecture
Built with vanilla JavaScript (ES6+) using the Module Pattern, key interactive components include:
- A responsive navigation controller.
- A "Controller Bot" AI assistant with intelligent conversation flow, state management, guided service discovery across 6 categories (automation, safety, design, panel, training, general), industry-specific guidance (pharmaceutical, automotive, food & beverage), and smart department routing (Sales, Technical, Support). It includes security measures like URL encoding and reset functionality.
- An interactive safety training platform.
- Real-time client-side form validation with XSS prevention.
- A professional tooltip system.

## Design Patterns
The project adheres to:
- **Progressive Enhancement**: Core functionality works without JavaScript.
- **Component-Based CSS**: Modular and reusable CSS architecture.
- **Accessibility-First**: WCAG 2.1 AA compliance with ARIA attributes.
- **SEO Optimization**: Structured data and semantic markup.
- **Security-by-Design**: Production-grade input sanitization and secure form handling, utilizing a trusted data model, comprehensive escaping for dynamic strings, strict separation to prevent user input from parsing as HTML, and multiple validation layers. It is CodeQL Compliant.

## System Design Choices
- **Icon System**: Comprehensive custom PNG icon system with consistent sizing, coloring, drop-shadow effects, and aggressive transparency removal.
- **Image Optimization**: Images are optimized for multiple screen sizes.
- **Homepage Hero Carousel**: Dynamic 40-second rotating background carousel showcasing 8 professional images relevant to core services.
- **Form Handling**: Department-specific email routing system with backend validation.
- **Page Layouts**: Streamlined service page layouts with consistent application or removal of hero sections for a unified user experience.
- **Homepage Content Structure**: Streamlined homepage focusing on core value proposition, updated statistics, "Trusted by Industry" section, capabilities overview, simplified About section, and core services showcase. Detailed company information is moved to the dedicated About page for improved information architecture.
- **Hero Section Styling**: Sophisticated dual-layer hexagon pattern overlay with a black to navy to light gray gradient applied to most pages, blending with color-coordinated tones.
- **Navigation System**: Auto-hide header that disappears on scroll down and reappears on scroll up, with a fully scrollable mobile navigation menu. Instagram social link removed from header navigation (October 2025) - social media links retained in footer only.
- **Services Page Design**: Clean modern layout with a unified hero section, responsive grid for 5 service cards, and feature lists with checkmarks.
- **Contact Page Design**: Modern split-screen B2B layout with a unified hero section, contact information, a simplified 5-field form, and a trust/statistics section.
- **Safety Training Page Design**: Features a Health and Safety Officer section with responsive 2-column grid layout (desktop) that stacks to single column on mobile, professional image display with hover effects, credential list with teal-accented icons, and smooth hover animations on credential items.

# External Dependencies

## Third-Party Services
- **Google Fonts**: Inter font family.
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