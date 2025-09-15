// Modern JavaScript for RCLtd Website

// Particles initialization with performance optimizations
function initParticles() {
    if (typeof tsParticles !== 'undefined') {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Responsive particle configuration based on screen size
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth < 1024;
        
        // If user prefers reduced motion, disable particles entirely
        if (prefersReducedMotion) {
            return;
        }
        
        // Adaptive settings based on device capability
        const particleCount = isMobile ? 15 : isTablet ? 25 : 30;
        const fpsLimit = isMobile ? 30 : 45;
        const linksEnabled = !isMobile; // Disable links on mobile for better performance
        const interactiveMode = isMobile ? false : true;
        
        tsParticles.load('tsparticles', {
            background: {
                color: {
                    value: 'transparent'
                }
            },
            fpsLimit: fpsLimit,
            interactivity: {
                events: {
                    onClick: {
                        enable: interactiveMode,
                        mode: 'push'
                    },
                    onHover: {
                        enable: interactiveMode,
                        mode: 'repulse'
                    },
                    resize: true
                },
                modes: {
                    push: {
                        quantity: isMobile ? 1 : 2
                    },
                    repulse: {
                        distance: isMobile ? 100 : 150,
                        duration: 0.3
                    }
                }
            },
            particles: {
                color: {
                    value: ['#0891b2', '#67e8f9', '#6b7280', '#ffffff']
                },
                links: {
                    color: '#0891b2',
                    distance: isMobile ? 0 : 120,
                    enable: linksEnabled,
                    opacity: 0.2,
                    width: 1
                },
                collisions: {
                    enable: false // Disabled for better performance
                },
                move: {
                    direction: 'none',
                    enable: true,
                    outModes: {
                        default: 'out'
                    },
                    random: false,
                    speed: isMobile ? 1 : 1.5,
                    straight: false
                },
                number: {
                    density: {
                        enable: true,
                        area: isMobile ? 400 : 800
                    },
                    value: particleCount
                },
                opacity: {
                    value: isMobile ? 0.3 : 0.4
                },
                shape: {
                    type: isMobile ? ['circle'] : ['circle', 'triangle', 'star']
                },
                size: {
                    value: { min: 1, max: isMobile ? 3 : 4 }
                }
            },
            detectRetina: true,
            pauseOnBlur: true,
            pauseOnOutsideViewport: true
        });
    }
}

// Hero Carousel initialization
function initHeroCarousel() {
    if (typeof EmblaCarousel !== 'undefined') {
        const emblaNode = document.querySelector('#hero-embla');
        const viewportNode = emblaNode;
        const prevBtn = document.querySelector('.embla__prev');
        const nextBtn = document.querySelector('.embla__next');
        const dotsContainer = document.querySelector('.embla__dots');
        
        if (emblaNode && viewportNode) {
            // Check for reduced motion preference
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            
            // Only enable autoplay if user doesn't prefer reduced motion
            const autoplay = (!prefersReducedMotion && typeof EmblaCarouselAutoplay !== 'undefined') ? 
                EmblaCarouselAutoplay({ delay: 4000, stopOnInteraction: false }) : null;
            
            const plugins = autoplay ? [autoplay] : [];
            
            const embla = EmblaCarousel(viewportNode, {
                loop: true,
                dragFree: false,
                containScroll: 'trimSnaps'
            }, plugins);
            
            // Navigation buttons
            if (prevBtn && nextBtn) {
                prevBtn.addEventListener('click', () => embla.scrollPrev());
                nextBtn.addEventListener('click', () => embla.scrollNext());
                
                const updateButtonStates = () => {
                    prevBtn.disabled = !embla.canScrollPrev();
                    nextBtn.disabled = !embla.canScrollNext();
                };
                
                embla.on('select', updateButtonStates);
                updateButtonStates();
            }
            
            // Dots navigation
            if (dotsContainer) {
                const slides = embla.slideNodes();
                
                slides.forEach((_, index) => {
                    const dot = document.createElement('button');
                    dot.className = 'embla__dot';
                    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
                    dot.addEventListener('click', () => embla.scrollTo(index));
                    dotsContainer.appendChild(dot);
                });
                
                const updateDots = () => {
                    const selectedIndex = embla.selectedScrollSnap();
                    const dots = dotsContainer.querySelectorAll('.embla__dot');
                    dots.forEach((dot, index) => {
                        const isSelected = index === selectedIndex;
                        dot.classList.toggle('embla__dot--selected', isSelected);
                        // Improve accessibility with aria-current
                        if (isSelected) {
                            dot.setAttribute('aria-current', 'true');
                        } else {
                            dot.removeAttribute('aria-current');
                        }
                    });
                };
                
                embla.on('select', updateDots);
                updateDots();
            }
        }
    }
}

// Hero Video initialization with reduced motion support
function initHeroVideo() {
    const heroVideo = document.querySelector('.hero-robot-video');
    
    if (heroVideo) {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            // Disable autoplay and loop for users who prefer reduced motion
            heroVideo.removeAttribute('autoplay');
            heroVideo.removeAttribute('loop');
            
            // Pause the video if it's already playing
            heroVideo.pause();
            
            // Show the first frame
            heroVideo.currentTime = 0;
            
            // Add manual control hint for accessibility
            heroVideo.setAttribute('aria-label', 'Robotics video - click to play manually');
            heroVideo.setAttribute('tabindex', '0');
            
            // Allow manual play on click or Enter key
            const playVideo = () => {
                if (heroVideo.paused) {
                    heroVideo.play().catch(e => {
                        console.log('Video play failed:', e);
                    });
                } else {
                    heroVideo.pause();
                }
            };
            
            heroVideo.addEventListener('click', playVideo);
            heroVideo.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    playVideo();
                }
            });
        } else {
            // For users who don't prefer reduced motion, ensure autoplay works
            heroVideo.setAttribute('autoplay', '');
            heroVideo.setAttribute('loop', '');
            
            // Try to play the video (browsers may still block autoplay)
            heroVideo.play().catch(e => {
                console.log('Autoplay prevented by browser:', e);
            });
        }
        
        // Add error handling
        heroVideo.addEventListener('error', (e) => {
            console.error('Video loading error:', e);
            // Hide video container if there's an error
            const videoContainer = heroVideo.closest('.hero-visual');
            if (videoContainer) {
                videoContainer.style.display = 'none';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initScrollEffects();
    initContactForm();
    initAnimations();
    initGDPR();
    initPageLoader();
    initParticles();
    initHeroCarousel();
    initHeroVideo();
});

// Navigation functionality
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const header = document.querySelector('.header');
    
    // Mobile menu toggle
    if (navToggle && navMenu) {
        // Set up ARIA attributes
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-controls', 'nav-menu');
        navMenu.setAttribute('id', 'nav-menu');
        
        navToggle.addEventListener('click', function() {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('mobile-open');
            navToggle.setAttribute('aria-expanded', !isExpanded);
        });
        
        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('mobile-open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('mobile-open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Close mobile menu with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('mobile-open')) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('mobile-open');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.focus();
            }
        });
    }
    
    // Dropdown functionality
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.nav-dropdown-toggle');
        const menu = dropdown.querySelector('.nav-dropdown-menu');
        
        if (toggle && menu) {
            // Handle toggle button clicks
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Close other dropdowns
                dropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.classList.remove('open');
                    }
                });
                
                // Toggle current dropdown
                dropdown.classList.toggle('open');
            });
            
            // Close dropdown when clicking on dropdown links
            const dropdownLinks = menu.querySelectorAll('.nav-link');
            dropdownLinks.forEach(link => {
                link.addEventListener('click', () => {
                    dropdown.classList.remove('open');
                    // Also close mobile menu if open
                    if (navToggle && navMenu) {
                        navToggle.classList.remove('active');
                        navMenu.classList.remove('mobile-open');
                        navToggle.setAttribute('aria-expanded', 'false');
                    }
                });
            });
        }
    });
    
    // Close all dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-dropdown')) {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('open');
            });
        }
    });
    
    // Close dropdowns on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('open');
            });
        }
    });
    
    // Header scroll effect - improved to prevent flickering
    if (header) {
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', function() {
            const currentScrollY = window.scrollY;
            
            // Determine if we're on a dark or light section
            const isDarkSection = currentScrollY < window.innerHeight * 0.6;
            
            // Remove any existing theme classes
            header.classList.remove('on-dark', 'on-light');
            
            // Add appropriate theme class based on scroll position
            if (isDarkSection) {
                header.classList.add('on-dark');
            } else {
                header.classList.add('on-light');
            }
            
            // Clear any inline styles that might conflict
            header.style.backgroundColor = '';
            header.style.boxShadow = '';
            
            lastScrollY = currentScrollY;
        });
        
        // Initialize header state on page load
        const initialIsDarkSection = window.scrollY < window.innerHeight * 0.6;
        if (initialIsDarkSection) {
            header.classList.add('on-dark');
        } else {
            header.classList.add('on-light');
        }
    }
}

// Scroll effects and animations
function initScrollEffects() {
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const header = document.querySelector('.header');
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card, .about-content, .cta-content');
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// Contact form functionality
function initContactForm() {
    const contactForm = document.querySelector('#contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Form validation
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            if (validateForm(data)) {
                // Show success message
                showFormMessage('Thank you for your message! We will get back to you soon.', 'success');
                contactForm.reset();
            } else {
                showFormMessage('Please fill in all required fields correctly.', 'error');
            }
        });
        
        // Real-time validation
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(input);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(input);
            });
        });
    }
}

// Form validation functions
function validateForm(data) {
    let isValid = true;
    
    // Required fields
    const requiredFields = ['name', 'email', 'message'];
    requiredFields.forEach(field => {
        if (!data[field] || data[field].trim() === '') {
            isValid = false;
        }
    });
    
    // Email validation
    if (data.email && !isValidEmail(data.email)) {
        isValid = false;
    }
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    
    // Remove existing error
    clearFieldError(field);
    
    if (field.hasAttribute('required') && value === '') {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    if (fieldName === 'email' && value && !isValidEmail(value)) {
        showFieldError(field, 'Please enter a valid email address');
        return false;
    }
    
    return true;
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    field.parentNode.appendChild(errorElement);
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

function showFormMessage(message, type) {
    // Remove existing message
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageElement = document.createElement('div');
    messageElement.className = `form-message ${type}`;
    messageElement.textContent = message;
    
    const form = document.querySelector('#contact-form');
    form.parentNode.insertBefore(messageElement, form);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        messageElement.remove();
    }, 5000);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Animation and interaction effects
function initAnimations() {
    // Service card hover effects
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-4px)';
        });
    });
    
    // Partner logo carousel
    const partnerTrack = document.querySelector('.partners-track');
    if (partnerTrack) {
        // Pause animation on hover
        partnerTrack.addEventListener('mouseenter', function() {
            this.style.animationPlayState = 'paused';
        });
        
        partnerTrack.addEventListener('mouseleave', function() {
            this.style.animationPlayState = 'running';
        });
    }
    
    // Button hover effects
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Performance optimizations
window.addEventListener('load', function() {
    // Lazy load images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
});

// GDPR Cookie Consent functionality
function initGDPR() {
    const gdprBanner = document.getElementById('gdpr-banner');
    const acceptBtn = document.getElementById('gdpr-accept');
    const settingsBtn = document.getElementById('gdpr-settings');
    
    if (!gdprBanner) return;
    
    // Check if user has already given consent
    const hasConsent = localStorage.getItem('rcltd-cookie-consent');
    
    if (!hasConsent) {
        // Show banner after a short delay
        setTimeout(() => {
            gdprBanner.classList.add('show');
        }, 2000);
    }
    
    // Accept all cookies
    if (acceptBtn) {
        acceptBtn.addEventListener('click', function() {
            localStorage.setItem('rcltd-cookie-consent', 'accepted');
            localStorage.setItem('rcltd-cookie-preferences', JSON.stringify({
                essential: true,
                analytics: true,
                marketing: true
            }));
            hideBanner();
        });
    }
    
    // Cookie settings (simplified - shows accept for now)
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            localStorage.setItem('rcltd-cookie-consent', 'customized');
            localStorage.setItem('rcltd-cookie-preferences', JSON.stringify({
                essential: true,
                analytics: false,
                marketing: false
            }));
            hideBanner();
        });
    }
    
    function hideBanner() {
        gdprBanner.classList.remove('show');
        setTimeout(() => {
            gdprBanner.style.display = 'none';
        }, 300);
    }
}

// Advanced Page Loading Animation with Progress and Technical Messages
function initPageLoader() {
    const pageLoader = document.getElementById('page-loader');
    
    if (!pageLoader) return;
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Get or create progress elements with retry mechanism
    function findLoaderElements() {
        const progressCounter = pageLoader.querySelector('.progress-counter');
        const progressBar = pageLoader.querySelector('.progress-bar');
        const techStatus = pageLoader.querySelector('.tech-status');
        return { progressCounter, progressBar, techStatus };
    }
    
    // Try to find elements with multiple retry attempts
    let attempts = 0;
    const maxAttempts = 5;
    const retryDelay = 50;
    
    function attemptToFindElements() {
        attempts++;
        const { progressCounter, progressBar, techStatus } = findLoaderElements();
        
        if (progressCounter && progressBar && techStatus) {
            startAdvancedLoader(progressCounter, progressBar, techStatus, pageLoader);
            return;
        }
        
        if (attempts < maxAttempts) {
            setTimeout(attemptToFindElements, retryDelay);
        } else {
            console.warn('Loader elements not found in DOM after multiple retries - falling back to simple loader');
            initSimpleLoader();
        }
    }
    
    // Initial attempt
    const { progressCounter, progressBar, techStatus } = findLoaderElements();
    if (progressCounter && progressBar && techStatus) {
        startAdvancedLoader(progressCounter, progressBar, techStatus, pageLoader);
    } else {
        attemptToFindElements();
    }
}

function startAdvancedLoader(progressCounter, progressBar, techStatus, pageLoader) {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Store pageLoader reference to ensure it's accessible throughout the function
    const loaderElement = pageLoader;
    
    // Technical loading messages for robotics/automation
    const techMessages = [
        'Initializing robotic systems...',
        'Connecting to PLC networks...',
        'Loading safety protocols...',
        'Calibrating automation sensors...',
        'Establishing machine control...',
        'Synchronizing industrial networks...',
        'Validating safety systems...',
        'Optimizing control algorithms...',
        'Loading panel configurations...',
        'Finalizing system integration...',
        'Systems ready for operation...'
    ];
    
    let currentProgress = 0;
    let currentMessageIndex = 0;
    let loaderStartTime = Date.now();
    const minLoadTime = prefersReducedMotion ? 800 : 2500; // Shorter for reduced motion
    const maxLoadTime = prefersReducedMotion ? 1500 : 4000;
    
    // Initialize display
    progressCounter.textContent = '0%';
    progressBar.style.width = '0%';
    techStatus.textContent = techMessages[0];
    
    // Animation timing
    const progressUpdateInterval = prefersReducedMotion ? 50 : 80;
    const messageChangeInterval = prefersReducedMotion ? 400 : 600;
    
    // Progress animation function
    function updateProgress() {
        if (currentProgress < 100) {
            // Variable speed progression for more natural feel
            let increment;
            if (currentProgress < 20) {
                increment = Math.random() * 3 + 1; // 1-4% increments early
            } else if (currentProgress < 80) {
                increment = Math.random() * 2 + 0.5; // 0.5-2.5% increments middle
            } else {
                increment = Math.random() * 1 + 0.2; // 0.2-1.2% increments near end
            }
            
            currentProgress = Math.min(100, currentProgress + increment);
            
            // Update display
            progressCounter.textContent = Math.floor(currentProgress) + '%';
            progressBar.style.width = currentProgress + '%';
            
            // Continue animation
            setTimeout(updateProgress, progressUpdateInterval);
        } else {
            // Progress complete - show final message briefly then hide
            setTimeout(() => {
                completeLoader();
            }, prefersReducedMotion ? 200 : 500);
        }
    }
    
    // Message rotation function
    function updateMessage() {
        if (currentProgress < 95) {
            currentMessageIndex = (currentMessageIndex + 1) % techMessages.length;
            techStatus.style.opacity = '0';
            
            setTimeout(() => {
                techStatus.textContent = techMessages[currentMessageIndex];
                techStatus.style.opacity = '1';
            }, 200);
            
            setTimeout(updateMessage, messageChangeInterval);
        }
    }
    
    // Complete loader function
    function completeLoader() {
        const elapsedTime = Date.now() - loaderStartTime;
        const remainingTime = Math.max(0, minLoadTime - elapsedTime);
        
        setTimeout(() => {
            if (loaderElement) {
                loaderElement.classList.add('hidden');
                
                // Remove loader from DOM after animation completes
                setTimeout(() => {
                    if (loaderElement.parentNode) {
                        loaderElement.parentNode.removeChild(loaderElement);
                    }
                }, 500);
            }
        }, remainingTime);
    }
    
    // Start animations
    if (!prefersReducedMotion) {
        setTimeout(updateProgress, 300); // Slight delay for visual effect
        setTimeout(updateMessage, messageChangeInterval);
    } else {
        // Simplified version for reduced motion
        currentProgress = 100;
        progressCounter.textContent = '100%';
        progressBar.style.width = '100%';
        techStatus.textContent = 'Systems ready for operation...';
        setTimeout(completeLoader, 800);
    }
    
    // Page load event handler
    window.addEventListener('load', function pageLoadHandler() {
        // If page loads before animation completes, speed up to finish
        if (currentProgress < 100) {
            const remainingProgress = 100 - currentProgress;
            const speedUpInterval = 30;
            
            function speedUpProgress() {
                if (currentProgress < 100) {
                    currentProgress = Math.min(100, currentProgress + (remainingProgress / 10));
                    progressCounter.textContent = Math.floor(currentProgress) + '%';
                    progressBar.style.width = currentProgress + '%';
                    
                    if (currentProgress < 100) {
                        setTimeout(speedUpProgress, speedUpInterval);
                    } else {
                        setTimeout(completeLoader, 300);
                    }
                }
            }
            speedUpProgress();
        }
    });
    
    // Fallback: Force hide loader after maximum time
    const fallbackTimeout = setTimeout(() => {
        if (loaderElement && !loaderElement.classList.contains('hidden')) {
            loaderElement.classList.add('hidden');
            setTimeout(() => {
                if (loaderElement && loaderElement.parentNode) {
                    loaderElement.parentNode.removeChild(loaderElement);
                }
            }, 500);
        }
    }, maxLoadTime);
    
    // Return cleanup function in case it's needed
    return function cleanup() {
        clearTimeout(fallbackTimeout);
    };
}

// Simple fallback loader for when elements are missing
function initSimpleLoader() {
    const pageLoader = document.getElementById('page-loader');
    if (!pageLoader) return;
    
    // Hide loader after page is fully loaded
    window.addEventListener('load', function() {
        setTimeout(() => {
            pageLoader.classList.add('hidden');
            setTimeout(() => {
                if (pageLoader.parentNode) {
                    pageLoader.parentNode.removeChild(pageLoader);
                }
            }, 500);
        }, 1000);
    });
    
    // Fallback timer
    setTimeout(() => {
        if (pageLoader && !pageLoader.classList.contains('hidden')) {
            pageLoader.classList.add('hidden');
            setTimeout(() => {
                if (pageLoader.parentNode) {
                    pageLoader.parentNode.removeChild(pageLoader);
                }
            }, 500);
        }
    }, 5000);
}

// CSS animations
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        animation: slideInUp 0.6s ease-out forwards;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .form-message {
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        font-weight: 500;
    }
    
    .form-message.success {
        background-color: #d1fae5;
        color: #065f46;
        border: 1px solid #a7f3d0;
    }
    
    .form-message.error {
        background-color: #fee2e2;
        color: #991b1b;
        border: 1px solid #fca5a5;
    }
    
    .error-message {
        display: block;
        color: #dc2626;
        font-size: 0.875rem;
        margin-top: 0.25rem;
    }
    
    input.error,
    textarea.error {
        border-color: #dc2626;
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
    }
`;
document.head.appendChild(style);

// Hero Title Glitch Animation
class HeroTitleAnimator {
    constructor(selector) {
        this.element = document.querySelector(selector);
        this.hasAnimated = false;
        this.init();
    }
    
    init() {
        if (!this.element) return;
        
        // Wait for page load and loading animation to complete
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.startAnimation();
            }, 2000); // Wait for loading animation
        });
    }
    
    startAnimation() {
        if (this.hasAnimated) return;
        this.hasAnimated = true;
        
        // Initial fade-in with transform
        this.element.style.opacity = '0';
        this.element.style.transform = 'translateY(30px)';
        this.element.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        
        // Fade in first
        setTimeout(() => {
            this.element.style.opacity = '1';
            this.element.style.transform = 'translateY(0)';
        }, 100);
        
        // Then add glitch effect after fade-in completes
        setTimeout(() => {
            this.element.style.transition = 'none'; // Remove transition for glitch
            
            // Set up glitch effect for hero title
            if (!this.element.classList.contains('glitch-text')) {
                setupGlitchText(this.element);
            }
            
            triggerGlitch(this.element);
        }, 1000);
    }
}

// Initialize glitch effects for hero title only
function initGlitchHeading() {
    console.log('Initializing glitch heading...');
    
    // Respect reduced motion preference
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        console.log('Reduced motion enabled, skipping glitch effect');
        return;
    }
    
    // Select only the hero title specifically
    const heroTitle = document.querySelector('.hero-title');
    console.log('Found hero title:', heroTitle);
    
    if (heroTitle && !heroTitle.classList.contains('glitch-text')) {
        console.log('Setting up glitch effect...');
        // Set up the glitch effect
        setupGlitchText(heroTitle);
        
        // Add hover trigger
        heroTitle.addEventListener('mouseenter', () => {
            console.log('Hero title hovered');
            if (!heroTitle.classList.contains('glitching')) {
                triggerGlitch(heroTitle);
            }
        });
        
        // Add click trigger for testing
        heroTitle.addEventListener('click', () => {
            console.log('Hero title clicked');
            triggerGlitch(heroTitle);
        });
        
        // Trigger immediately for testing
        setTimeout(() => {
            console.log('Testing glitch effect...');
            triggerGlitch(heroTitle);
        }, 2000);
        
        // Add intersection observer for viewport entry
        if (window.IntersectionObserver) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !entry.target.dataset.glitchTriggered) {
                        console.log('Hero title entered viewport');
                        // Delay for initial effect
                        setTimeout(() => {
                            triggerGlitch(entry.target);
                            entry.target.dataset.glitchTriggered = 'true';
                        }, 1000);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(heroTitle);
        }
    } else if (!heroTitle) {
        console.log('No hero title found!');
    } else {
        console.log('Hero title already has glitch effect');
    }
}

function setupGlitchText(element) {
    // Get text from the nested span if it exists, otherwise from the element itself
    const textElement = element.querySelector('.hero-title-content') || element;
    const text = textElement.textContent.trim();
    
    element.classList.add('glitch-text');
    element.setAttribute('data-text', text);
    
    // Wrap each character in a span for individual animation
    const chars = text.split('').map(char => 
        char === ' ' ? '<span class="glitch-char">&nbsp;</span>' : `<span class="glitch-char">${char}</span>`
    ).join('');
    
    // Replace the content of the text element
    if (textElement !== element) {
        textElement.innerHTML = chars;
    } else {
        element.innerHTML = chars;
    }
}

function triggerGlitch(element) {
    if (element.classList.contains('glitching')) return;
    
    console.log('Triggering glitch effect on:', element);
    element.classList.add('glitching');
    
    // Randomly animate individual characters with staggered delays
    const chars = element.querySelectorAll('.glitch-char');
    console.log('Found glitch characters:', chars.length);
    
    chars.forEach((char, index) => {
        // Random delay between 0-300ms for each character
        const delay = Math.random() * 300;
        setTimeout(() => {
            char.style.animationDelay = `${delay}ms`;
        }, delay);
    });
    
    // Remove glitch effect after animation completes
    setTimeout(() => {
        element.classList.remove('glitching');
        console.log('Glitch effect completed');
    }, 1000);
    
    // Schedule periodic glitch effect every 8-12 seconds
    if (!element.dataset.periodicGlitch) {
        element.dataset.periodicGlitch = 'true';
        const scheduleNext = () => {
            const delay = 8000 + Math.random() * 4000; // 8-12 seconds
            setTimeout(() => {
                if (document.contains(element)) {
                    triggerGlitch(element);
                    scheduleNext();
                }
            }, delay);
        };
        scheduleNext();
    }
}

// Auto glitch effect for all page headings
function autoGlitchEffect() {
    // Select main headings across all pages
    const headings = document.querySelectorAll(`
        .hero-title,
        .page-title,
        main h1,
        .main-title,
        .section-title,
        h1.title,
        .content h1:first-of-type
    `);
    
    headings.forEach((heading, index) => {
        // Skip if already processed or inside navigation
        if (heading.classList.contains('glitch-text') || 
            heading.closest('.nav, .nav-brand, .header, .navigation')) {
            return;
        }
        
        heading.style.position = 'relative';
        heading.classList.add('glitch-text');
        
        // Stagger initial glitch timing for multiple headings
        const initialDelay = 1000 + (index * 500);
        
        // Initial glitch after staggered delay
        setTimeout(() => {
            heading.classList.add('glitching');
            setTimeout(() => {
                heading.classList.remove('glitching');
            }, 1000);
        }, initialDelay);
        
        // Auto-trigger glitch every 8-12 seconds with random offset
        const interval = 8000 + Math.random() * 4000; // 8-12 seconds
        setInterval(() => {
            heading.classList.add('glitching');
            setTimeout(() => {
                heading.classList.remove('glitching');
            }, 1000);
        }, interval);
    });
}

// Initialize effects
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.heroTitleAnimator = new HeroTitleAnimator('.hero-title');
        autoGlitchEffect();
    }, 100);
});

// Dynamic Header Glass Effect with Background Detection
class DynamicHeaderManager {
    constructor() {
        this.header = document.querySelector('.header');
        this.heroSection = document.querySelector('.hero');
        this.servicesSection = document.querySelector('.services, #services');
        this.lastScrollY = window.scrollY;
        this.ticking = false;
        
        if (this.header) {
            this.init();
        }
    }
    
    init() {
        // Set initial state
        this.updateHeaderState();
        
        // Listen for scroll events with throttling
        window.addEventListener('scroll', () => {
            this.lastScrollY = window.scrollY;
            this.requestTick();
        });
        
        // Listen for resize events
        window.addEventListener('resize', () => {
            this.updateHeaderState();
        });
        
        // Initial state after load
        window.addEventListener('load', () => {
            setTimeout(() => this.updateHeaderState(), 100);
        });
    }
    
    requestTick() {
        if (!this.ticking) {
            requestAnimationFrame(() => this.updateHeaderState());
            this.ticking = true;
        }
    }
    
    updateHeaderState() {
        this.ticking = false;
        
        if (!this.header) return;
        
        const scrollY = this.lastScrollY;
        const headerHeight = this.header.offsetHeight;
        
        // Calculate the transition point more accurately
        let transitionPoint = 400; // fallback minimum
        
        if (this.heroSection) {
            // Get hero section bounds with buffer for smoother transition
            const heroRect = this.heroSection.getBoundingClientRect();
            const heroBottom = heroRect.bottom + scrollY - headerHeight - 30;
            transitionPoint = Math.max(heroBottom, 400);
        }
        
        // Determine if header is over dark or light background
        const isOverDark = scrollY < transitionPoint;
        
        // Force remove both classes first to prevent conflicts
        this.header.classList.remove('on-dark', 'on-light');
        
        // Add the appropriate class in the next frame for smooth transition
        requestAnimationFrame(() => {
            if (isOverDark) {
                this.header.classList.add('on-dark');
            } else {
                this.header.classList.add('on-light');
            }
        });
        
        // Ensure no conflicting inline styles
        this.header.style.backdropFilter = 'none';
        this.header.style.webkitBackdropFilter = 'none';
        this.header.style.background = '';
        this.header.style.borderBottom = '';
        this.header.style.boxShadow = '';
    }
}

// Scroll to Top Functionality
class ScrollToTopManager {
    constructor() {
        this.scrollButton = document.getElementById('scroll-to-top');
        this.init();
    }

    init() {
        if (!this.scrollButton) return;

        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => this.toggleVisibility());
        
        // Smooth scroll to top when clicked
        this.scrollButton.addEventListener('click', () => this.scrollToTop());
    }

    toggleVisibility() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 300) {
            this.scrollButton.classList.add('visible');
        } else {
            this.scrollButton.classList.remove('visible');
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// Force scroll to top on page load
function forceScrollToTop() {
    // Immediately scroll to top without animation on page load
    window.scrollTo(0, 0);
    
    // Also handle browser back/forward navigation
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    
    // Ensure scroll position is reset after a short delay in case of any conflicts
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 100);
}

// Initialize all managers and force scroll to top
document.addEventListener('DOMContentLoaded', () => {
    forceScrollToTop();
    window.headerManager = new DynamicHeaderManager();
    window.scrollToTopManager = new ScrollToTopManager();
});

// Also force scroll to top on page show (handles browser back/forward)
window.addEventListener('pageshow', () => {
    forceScrollToTop();
});