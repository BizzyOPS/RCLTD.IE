# Robotics & Control Ltd Website

## Overview
This project is a static website for Robotics & Control Ltd, an Irish technology company. Its primary purpose is to establish a strong online presence, attract new clients, and clearly represent the company's expertise in automation, safety, electrical design, and panel building services. The website targets pharmaceutical, industrial, and automotive sectors, providing a professional and responsive platform with dedicated service pages, contact information, and company details.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The website features a multi-page static HTML structure. It utilizes custom CSS with a modern design system, employing CSS custom properties for consistent theming and a mobile-first responsive design. Typography uses the Inter font family, and the color palette is based on a teal primary color with grey, black, and white accents. UI/UX decisions include an enlarged logo, an orange hamburger menu, teal navigation links, and orange 'Quote' buttons for branding consistency. Professional gradient backgrounds, subtle industrial aesthetics, and professional hero images are used throughout.

### Design Patterns
Key design patterns include Component-Based CSS using a BEM-like methodology, Semantic HTML for accessibility and SEO, and Progressive Enhancement. SEO optimization is integrated with meta descriptions, Open Graph tags, and structured data.

### JavaScript Architecture
Built with Vanilla JavaScript (ES6+), the site features a logo-based loading animation. JavaScript is organized using the Module Pattern for navigation, scroll effects, contact forms, and animations. It is event-driven and incorporates accessibility features like ARIA attributes. An AI Chatbot serves as a specialized sales tool with detailed service descriptions and navigation links.

### Navigation System
A streamlined navigation system includes a 'Services' dropdown menu. The 'Services' text links to an overview page, while an arrow button toggles the dropdown. Responsive navigation features a mobile hamburger menu with smooth transitions. Active state management, accessibility features with ARIA labels and keyboard navigation, and a consistent structure across all pages are implemented. A smooth scroll-to-top button appears on scroll, and the header, including the clickable logo, is solid, merging with page colors and dynamically switching backgrounds for readability.

## External Dependencies

### Third-Party Services
- **Google Fonts**: Inter font family loaded via CDN.
- **Google Analytics**: Implied integration for website analytics.
- **Google Maps**: Integrated into the contact page for location services.

### Assets and Media
- **Images**: Logo and service-related hero images are stored in `/images/` and are designed for responsive coverage.
- **Icons**: Custom hamburger menu implementation and service-related icons.
- **Favicons**: Standard favicon setup.