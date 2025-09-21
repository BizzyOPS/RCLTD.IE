// Set dynamic header height for proper spacing
function setHeaderOffset() {
    const header = document.querySelector('.header');
    if (!header) return;
    const h = Math.ceil(header.getBoundingClientRect().height);
    // Use exact header height for seamless professional look
    document.documentElement.style.setProperty('--header-height', h + 'px');
    console.log('Header height set to exact:', h + 'px');
}

// Apply header offset on load and resize
window.addEventListener('load', setHeaderOffset);
window.addEventListener('resize', setHeaderOffset);

// Watch for header content changes
if (window.ResizeObserver) {
    const headerObserver = new ResizeObserver(setHeaderOffset);
    const header = document.querySelector('.header');
    if (header) {
        headerObserver.observe(header);
    }
}

// PARTICLES COMPLETELY DISABLED - NO PARTICLE CODE SHOULD EXECUTE
// Override all particle functions before any code runs
if (typeof window !== 'undefined') {
    window.tsParticles = { load: function() { return Promise.resolve(); }, loadFull: function() { return Promise.resolve(); } };
    window.particlesJS = function() {};
    
    // Block any tsParticles script loading
    var originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        var element = originalCreateElement.call(document, tagName);
        if (tagName.toLowerCase() === 'script') {
            var originalSetAttribute = element.setAttribute;
            element.setAttribute = function(name, value) {
                if (name === 'src' && value && value.includes('tsparticles')) {
                    return; // Block tsParticles loading
                }
                return originalSetAttribute.call(this, name, value);
            };
        }
        return element;
    };
}

// Hero Carousel initialization
function initHeroCarousel() {
    // Hero background cycling is now handled by CSS keyframes animation
    // Check for reduced motion preference to respect user accessibility settings
    var prefersReducedMotion = false;
    
    // Feature detection for matchMedia (IE10+)
    if (window.matchMedia) {
        prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    if (prefersReducedMotion) {
        // Disable CSS animation for users who prefer reduced motion
        var heroElement = document.querySelector ? document.querySelector('.hero-cover-image') : null;
        if (heroElement) {
            heroElement.style.animation = 'none';
            heroElement.style.backgroundImage = "url('images/hero-electrical-control.png')";
        }
    }
    
    // Skip background manipulation for fixed background elements
    var storeHeroElements = document.querySelectorAll ? document.querySelectorAll('.store-hero') : [];
    for (var i = 0; i < storeHeroElements.length; i++) {
        if (storeHeroElements[i].getAttribute('data-bg-fixed') === 'true') {
            // Skip this element - it has a fixed background that shouldn't be changed
            continue;
        }
    }
}

// Hero Video initialization with reduced motion support
function initHeroVideo() {
    var heroVideo = document.querySelector ? document.querySelector('.hero-robot-video') : null;
    
    if (heroVideo) {
        // Check for reduced motion preference
        var prefersReducedMotion = false;
        if (window.matchMedia) {
            prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }
        
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
            var playVideo = function() {
                if (heroVideo.paused) {
                    if (heroVideo.play) {
                        var playPromise = heroVideo.play();
                        if (playPromise && playPromise.catch) {
                            playPromise.catch(function(e) {
                                // Handle autoplay restrictions
                            });
                        }
                    }
                } else {
                    heroVideo.pause();
                }
            };
            
            heroVideo.addEventListener('click', playVideo);
            // IE-compatible event handling
            if (heroVideo.addEventListener) {
                heroVideo.addEventListener('keydown', function(e) {
                    var key = e.key || e.keyCode;
                    if (key === 'Enter' || key === ' ' || key === 13 || key === 32) {
                        if (e.preventDefault) e.preventDefault();
                        playVideo();
                    }
                });
            } else if (heroVideo.attachEvent) {
                // IE8 fallback
                heroVideo.attachEvent('onkeydown', function(e) {
                    if (e.keyCode === 13 || e.keyCode === 32) {
                        e.returnValue = false;
                        playVideo();
                    }
                });
            }
        } else {
            // For users who don't prefer reduced motion, ensure autoplay works
            heroVideo.setAttribute('autoplay', '');
            heroVideo.setAttribute('loop', '');
            
            // Try to play the video (browsers may still block autoplay)
            if (heroVideo.play) {
                var playPromise = heroVideo.play();
                if (playPromise && playPromise.catch) {
                    playPromise.catch(function(e) {
                        // Handle autoplay restrictions
                    });
                }
            }
        }
        
        // Add error handling with IE compatibility
        if (heroVideo.addEventListener) {
            heroVideo.addEventListener('error', function(e) {
                // Hide video container if there's an error
                var videoContainer = heroVideo.closest ? heroVideo.closest('.hero-visual') : null;
                if (videoContainer) {
                    videoContainer.style.display = 'none';
                }
            });
        } else if (heroVideo.attachEvent) {
            heroVideo.attachEvent('onerror', function(e) {
                var videoContainer = heroVideo.parentNode;
                while (videoContainer && !videoContainer.classList.contains('hero-visual')) {
                    videoContainer = videoContainer.parentNode;
                }
                if (videoContainer) {
                    videoContainer.style.display = 'none';
                }
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Set header height immediately
    setHeaderOffset();
    
    // Initialize all components
    initNavigation();
    initScrollEffects();
    initContactForm();
    initAnimations();
    initGDPR();
    initPageLoader();
    initHeroCarousel();
    initHeroVideo();
});

// Navigation functionality
function initNavigation() {
    var navToggle = document.querySelector ? document.querySelector('.nav-toggle') : null;
    var navMenu = document.querySelector ? document.querySelector('.nav-menu') : null;
    var header = document.querySelector ? document.querySelector('.header') : null;
    
    // Mobile menu toggle
    if (navToggle && navMenu) {
        // Set up ARIA attributes
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-controls', 'nav-menu');
        navMenu.setAttribute('id', 'nav-menu');
        
        // IE-compatible event handling
        if (navToggle.addEventListener) {
            navToggle.addEventListener('click', function() {
                var isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('mobile-open');
                navToggle.setAttribute('aria-expanded', !isExpanded);
            });
        } else if (navToggle.attachEvent) {
            navToggle.attachEvent('onclick', function() {
                var isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
                // IE8/9 classList fallback
                if (navToggle.className.indexOf('active') > -1) {
                    navToggle.className = navToggle.className.replace(' active', '');
                } else {
                    navToggle.className += ' active';
                }
                if (navMenu.className.indexOf('mobile-open') > -1) {
                    navMenu.className = navMenu.className.replace(' mobile-open', '');
                } else {
                    navMenu.className += ' mobile-open';
                }
                navToggle.setAttribute('aria-expanded', !isExpanded);
            });
        }
        
        // Close mobile menu when clicking on a link
        var navLinks = document.querySelectorAll ? document.querySelectorAll('.nav-link') : [];
        for (var i = 0; i < navLinks.length; i++) {
            var link = navLinks[i];
            if (link.addEventListener) {
                link.addEventListener('click', function() {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('mobile-open');
                    navToggle.setAttribute('aria-expanded', 'false');
                });
            } else if (link.attachEvent) {
                link.attachEvent('onclick', function() {
                    navToggle.className = navToggle.className.replace(' active', '');
                    navMenu.className = navMenu.className.replace(' mobile-open', '');
                    navToggle.setAttribute('aria-expanded', 'false');
                });
            }
        }
        
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
    var dropdowns = document.querySelectorAll('.nav-dropdown');
    for (var d = 0; d < dropdowns.length; d++) {
        var dropdown = dropdowns[d];
        var toggle = dropdown.querySelector('.nav-dropdown-toggle');
        var menu = dropdown.querySelector('.nav-dropdown-menu');
        
        if (toggle && menu) {
            // Handle toggle button clicks
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Close other dropdowns
                for (var j = 0; j < dropdowns.length; j++) {
                    var otherDropdown = dropdowns[j];
                    if (otherDropdown !== dropdown) {
                        otherDropdown.classList.remove('open');
                    }
                }
                
                // Toggle current dropdown
                dropdown.classList.toggle('open');
            });
            
            // Close dropdown when clicking on dropdown links
            var dropdownLinks = menu.querySelectorAll('.nav-link');
            for (var l = 0; l < dropdownLinks.length; l++) {
                var link = dropdownLinks[l];
                link.addEventListener('click', function() {
                    dropdown.classList.remove('open');
                    // Also close mobile menu if open
                    if (navToggle && navMenu) {
                        navToggle.classList.remove('active');
                        navMenu.classList.remove('mobile-open');
                        navToggle.setAttribute('aria-expanded', 'false');
                    }
                });
            }
        }
    }
    
    // Close all dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        var target = e.target;
        var closestDropdown = null;
        // IE11 doesn't support closest, so we traverse manually
        while (target && !closestDropdown) {
            if (target.classList && target.classList.contains('nav-dropdown')) {
                closestDropdown = target;
            }
            target = target.parentNode;
        }
        if (!closestDropdown) {
            for (var d = 0; d < dropdowns.length; d++) {
                dropdowns[d].classList.remove('open');
            }
        }
    });
    
    // Close dropdowns on escape key
    document.addEventListener('keydown', function(e) {
        var key = e.key || e.keyCode;
        if (key === 'Escape' || key === 27) {
            for (var d = 0; d < dropdowns.length; d++) {
                dropdowns[d].classList.remove('open');
            }
        }
    });
    
    // Header scroll effect - improved to prevent flickering
    if (header) {
        var lastScrollY = window.scrollY || window.pageYOffset;
        
        window.addEventListener('scroll', function() {
            var currentScrollY = window.scrollY || window.pageYOffset;
            
            // Determine if we're on a dark or light section
            var isDarkSection = currentScrollY < window.innerHeight * 0.6;
            
            // Remove any existing theme classes
            header.classList.remove('on-dark');
            header.classList.remove('on-light');
            
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
        var initialScrollY = window.scrollY || window.pageYOffset;
        var initialIsDarkSection = initialScrollY < window.innerHeight * 0.6;
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
    var anchorLinks = document.querySelectorAll('a[href^="#"]');
    for (var i = 0; i < anchorLinks.length; i++) {
        var link = anchorLinks[i];
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var targetId = this.getAttribute('href').substring(1);
            var targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                var header = document.querySelector('.header');
                var headerHeight = header ? header.offsetHeight : 0;
                var targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                // IE11 doesn't support behavior: smooth, so we use fallback
                if (window.scrollTo && window.scrollTo.length > 1) {
                    try {
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    } catch (e) {
                        window.scrollTo(0, targetPosition);
                    }
                } else {
                    window.scrollTo(0, targetPosition);
                }
            }
        });
    }
    
    // Intersection Observer for scroll animations - with IE11 fallback
    if (window.IntersectionObserver) {
        var observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        var observer = new IntersectionObserver(function(entries) {
            for (var i = 0; i < entries.length; i++) {
                var entry = entries[i];
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            }
        }, observerOptions);
        
        // Observe elements for animation
        var animateElements = document.querySelectorAll('.service-card, .about-content, .cta-content');
        for (var i = 0; i < animateElements.length; i++) {
            observer.observe(animateElements[i]);
        }
    } else {
        // Fallback for browsers without IntersectionObserver
        var animateElements = document.querySelectorAll('.service-card, .about-content, .cta-content');
        for (var i = 0; i < animateElements.length; i++) {
            animateElements[i].classList.add('animate-in');
        }
    }
}

// Contact form functionality
function initContactForm() {
    var contactForm = document.querySelector('#contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Form validation - IE11 compatible
            var formData = new FormData(contactForm);
            var data = {};
            // IE11 doesn't support Object.fromEntries, so we iterate manually
            for (var pair of formData.entries()) {
                data[pair[0]] = pair[1];
            }
            
            if (validateForm(data)) {
                // Show success message
                showFormMessage('Thank you for your message! We will get back to you soon.', 'success');
                contactForm.reset();
            } else {
                showFormMessage('Please fill in all required fields correctly.', 'error');
            }
        });
        
        // Real-time validation
        var inputs = contactForm.querySelectorAll('input, textarea');
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        }
    }
}

// Form validation functions
function validateForm(data) {
    var isValid = true;
    
    // Required fields
    var requiredFields = ['name', 'email', 'message'];
    for (var i = 0; i < requiredFields.length; i++) {
        var field = requiredFields[i];
        if (!data[field] || data[field].trim() === '') {
            isValid = false;
        }
    }
    
    // Email validation
    if (data.email && !isValidEmail(data.email)) {
        isValid = false;
    }
    
    return isValid;
}

function validateField(field) {
    var value = field.value.trim();
    var fieldName = field.name;
    
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
    var existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    var errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    field.parentNode.appendChild(errorElement);
}

function clearFieldError(field) {
    field.classList.remove('error');
    var errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

function showFormMessage(message, type) {
    // Remove existing message
    var existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    var messageElement = document.createElement('div');
    messageElement.className = 'form-message ' + type;
    messageElement.textContent = message;
    
    var form = document.querySelector('#contact-form');
    form.parentNode.insertBefore(messageElement, form);
    
    // Auto-remove after 5 seconds
    setTimeout(function() {
        messageElement.remove();
    }, 5000);
}

function isValidEmail(email) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Animation and interaction effects
function initAnimations() {
    // Service card hover effects
    var serviceCards = document.querySelectorAll('.service-card');
    for (var i = 0; i < serviceCards.length; i++) {
        var card = serviceCards[i];
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-4px)';
        });
    }
    
    // Partner logo carousel
    var partnerTrack = document.querySelector('.partners-track');
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
    var buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    }
}

// Utility functions
function debounce(func, wait) {
    var timeout;
    return function executedFunction() {
        var args = Array.prototype.slice.call(arguments);
        var later = function() {
            clearTimeout(timeout);
            func.apply(null, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    var inThrottle;
    return function() {
        var args = arguments;
        var context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(function() { inThrottle = false; }, limit);
        }
    };
}

// Performance optimizations
window.addEventListener('load', function() {
    // Lazy load images
    if ('IntersectionObserver' in window) {
        var imageObserver = new IntersectionObserver(function(entries, observer) {
            for (var i = 0; i < entries.length; i++) {
                var entry = entries[i];
                if (entry.isIntersecting) {
                    var img = entry.target;
                    if (img.dataset && img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                }
            }
        });
        
        var lazyImages = document.querySelectorAll('img[data-src]');
        for (var i = 0; i < lazyImages.length; i++) {
            imageObserver.observe(lazyImages[i]);
        }
    }
});

// GDPR Cookie Consent functionality
function initGDPR() {
    var gdprBanner = document.getElementById('gdpr-banner');
    var acceptBtn = document.getElementById('gdpr-accept');
    var settingsBtn = document.getElementById('gdpr-settings');
    
    if (!gdprBanner) return;
    
    // Check if user has already given consent
    var hasConsent = localStorage.getItem('rcltd-cookie-consent');
    
    if (!hasConsent) {
        // Show banner after a short delay
        setTimeout(function() {
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
        setTimeout(function() {
            gdprBanner.style.display = 'none';
        }, 300);
    }
}

// Advanced Page Loading Animation with Progress and Technical Messages
function initPageLoader() {
    var pageLoader = document.getElementById('page-loader');
    
    if (!pageLoader) return;
    
    // Check for reduced motion preference
    var prefersReducedMotion = false;
    if (window.matchMedia) {
        prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    // Get or create progress elements with retry mechanism
    function findLoaderElements() {
        var progressCounter = pageLoader.querySelector('.progress-counter');
        var progressBar = pageLoader.querySelector('.progress-bar');
        return { progressCounter: progressCounter, progressBar: progressBar };
    }
    
    // Try to find elements with multiple retry attempts
    var attempts = 0;
    var maxAttempts = 5;
    var retryDelay = 50;
    
    function attemptToFindElements() {
        attempts++;
        var loaderElements = findLoaderElements();
        var progressCounter = loaderElements.progressCounter;
        var progressBar = loaderElements.progressBar;
        
        if (progressCounter && progressBar) {
            startAdvancedLoader(progressCounter, progressBar, pageLoader);
            return;
        }
        
        if (attempts < maxAttempts) {
            setTimeout(attemptToFindElements, retryDelay);
        } else {
            // Using simple loader - this is expected behavior
            initSimpleLoader();
        }
    }
    
    // Initial attempt
    var initialLoaderElements = findLoaderElements();
    var progressCounter = initialLoaderElements.progressCounter;
    var progressBar = initialLoaderElements.progressBar;
    if (progressCounter && progressBar) {
        startAdvancedLoader(progressCounter, progressBar, pageLoader);
    } else {
        attemptToFindElements();
    }
}

function startAdvancedLoader(progressCounter, progressBar, pageLoader) {
    console.log('Starting advanced loader with elements:', !!progressCounter, !!progressBar, !!pageLoader);
    
    // Check for reduced motion preference
    var prefersReducedMotion = false;
    if (window.matchMedia) {
        prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    // Store pageLoader reference to ensure it's accessible throughout the function
    var loaderElement = pageLoader;
    
    var currentProgress = 0;
    var loaderStartTime = Date.now();
    var minLoadTime = prefersReducedMotion ? 500 : 3000; // Reduced timing for better UX
    var maxLoadTime = prefersReducedMotion ? 1000 : 4500; // Reduced timing for better UX
    
    // Initialize display
    progressCounter.textContent = '0%';
    progressBar.style.width = '0%';
    progressBar.style.transition = 'width 0.3s ease';
    
    // Animation timing
    var progressUpdateInterval = prefersReducedMotion ? 30 : 60;
    
    console.log('Starting progress animation...');
    
    // Progress animation function
    function updateProgress() {
        console.log('Progress update called, current:', currentProgress);
        
        if (currentProgress < 100) {
            // Variable speed progression for more natural feel
            var increment;
            if (currentProgress < 25) {
                increment = Math.random() * 4 + 2; // 2-6% increments early (faster start)
            } else if (currentProgress < 75) {
                increment = Math.random() * 3 + 1; // 1-4% increments middle
            } else {
                increment = Math.random() * 2 + 0.5; // 0.5-2.5% increments near end
            }
            
            currentProgress = Math.min(100, currentProgress + increment);
            
            // Update display
            var displayProgress = Math.floor(currentProgress);
            progressCounter.textContent = displayProgress + '%';
            progressBar.style.width = currentProgress + '%';
            
            console.log('Progress updated to:', displayProgress + '%');
            
            // Show logo at 60% progress and keep it visible
            if (currentProgress >= 60) {
                var logo = loaderElement.querySelector('.loader-logo');
                if (logo && !logo.classList.contains('show')) {
                    logo.classList.add('show');
                    console.log('Logo should now be visible at', displayProgress + '%');
                }
            }
            
            // Continue animation
            setTimeout(updateProgress, progressUpdateInterval);
        } else {
            // Progress complete - show final message briefly then hide
            console.log('Progress animation completed');
            setTimeout(function() {
                completeLoader();
            }, prefersReducedMotion ? 200 : 500);
        }
    }
    
    // Progress bar animation only (no messages)
    
    // Complete loader function
    function completeLoader() {
        var elapsedTime = Date.now() - loaderStartTime;
        var remainingTime = Math.max(0, minLoadTime - elapsedTime);
        
        setTimeout(function() {
            if (loaderElement) {
                loaderElement.classList.add('hidden');
                
                // Remove loader from DOM after animation completes
                setTimeout(function() {
                    if (loaderElement.parentNode) {
                        loaderElement.parentNode.removeChild(loaderElement);
                    }
                }, 500);
            }
        }, remainingTime);
    }
    
    // Start animations immediately
    console.log('Initializing animation start, reduced motion:', prefersReducedMotion);
    
    if (!prefersReducedMotion) {
        // Start animation immediately
        console.log('Starting updateProgress in 100ms...');
        setTimeout(updateProgress, 100); // Minimal delay for smooth start
    } else {
        // Simplified version for reduced motion
        console.log('Using reduced motion - fast completion');
        currentProgress = 100;
        progressCounter.textContent = '100%';
        progressBar.style.width = '100%';
        setTimeout(completeLoader, 500);
    }
    
    // Page load event handler
    window.addEventListener('load', function pageLoadHandler() {
        console.log('Page load event triggered, current progress:', currentProgress);
        // If page loads before animation completes, ensure it reaches 100%
        if (currentProgress < 100) {
            console.log('Speeding up progress to completion');
            var remainingProgress = 100 - currentProgress;
            var speedUpInterval = 25;
            
            function speedUpProgress() {
                if (currentProgress < 100) {
                    currentProgress = Math.min(100, currentProgress + Math.max(5, remainingProgress / 8));
                    var displayProgress = Math.floor(currentProgress);
                    progressCounter.textContent = displayProgress + '%';
                    progressBar.style.width = currentProgress + '%';
                    
                    console.log('Speed up progress:', displayProgress + '%');
                    
                    if (currentProgress < 100) {
                        setTimeout(speedUpProgress, speedUpInterval);
                    } else {
                        console.log('Speed up completed, hiding loader');
                        setTimeout(completeLoader, 200);
                    }
                }
            }
            speedUpProgress();
        } else {
            console.log('Progress already at 100%, completing loader');
            setTimeout(completeLoader, 200);
        }
    });
    
    // Fallback: Force hide loader after maximum time
    var fallbackTimeout = setTimeout(function() {
        if (loaderElement && !loaderElement.classList.contains('hidden')) {
            loaderElement.classList.add('hidden');
            setTimeout(function() {
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
    var pageLoader = document.getElementById('page-loader');
    if (!pageLoader) return;
    
    // Hide loader after page is fully loaded
    window.addEventListener('load', function() {
        setTimeout(function() {
            pageLoader.classList.add('hidden');
            setTimeout(function() {
                if (pageLoader.parentNode) {
                    pageLoader.parentNode.removeChild(pageLoader);
                }
            }, 500);
        }, 1000);
    });
    
    // Fallback timer
    setTimeout(function() {
        if (pageLoader && !pageLoader.classList.contains('hidden')) {
            pageLoader.classList.add('hidden');
            setTimeout(function() {
                if (pageLoader.parentNode) {
                    pageLoader.parentNode.removeChild(pageLoader);
                }
            }, 500);
        }
    }, 5000);
}

// CSS animations
var style = document.createElement('style');
style.textContent = [
    '    .animate-in {',
    '        animation: slideInUp 0.6s ease-out forwards;',
    '    }',
    '    ',
    '    @keyframes slideInUp {',
    '        from {',
    '            opacity: 0;',
    '            transform: translateY(30px);',
    '        }',
    '        to {',
    '            opacity: 1;',
    '            transform: translateY(0);',
    '        }',
    '    }',
    '    ',
    '    .form-message {',
    '        padding: 1rem;',
    '        border-radius: 0.5rem;',
    '        margin-bottom: 1rem;',
    '        font-weight: 500;',
    '    }',
    '    ',
    '    .form-message.success {',
    '        background-color: #d1fae5;',
    '        color: #065f46;',
    '        border: 1px solid #a7f3d0;',
    '    }',
    '    ',
    '    .form-message.error {',
    '        background-color: #fee2e2;',
    '        color: #991b1b;',
    '        border: 1px solid #fca5a5;',
    '    }',
    '    ',
    '    .error-message {',
    '        display: block;',
    '        color: #dc2626;',
    '        font-size: 0.875rem;',
    '        margin-top: 0.25rem;',
    '    }'
].join('\n');
document.head.appendChild(style);






// Dynamic Header Glass Effect with Background Detection and Scroll Hide/Show
function DynamicHeaderManager() {
    this.header = document.querySelector('.header');
    this.heroSection = document.querySelector('.hero');
    this.servicesSection = document.querySelector('.services, #services');
    this.lastScrollY = window.scrollY;
    this.previousScrollY = window.scrollY;
    this.scrollDirection = 'up';
    this.ticking = false;
    this.scrollThreshold = 60; // Minimum scroll distance before hiding header
    this.hideHeaderWhenScrollDown = true;
    this.isHeaderVisible = true;
    
    if (this.header) {
        // Initialize header as visible
        this.header.classList.add('header-visible');
        this.header.classList.remove('header-hidden');
        this.init();
    }
}

DynamicHeaderManager.prototype.init = function() {
    // Set initial state
    this.updateHeaderState();
    
    var self = this;
    // Listen for scroll events with throttling
    window.addEventListener('scroll', function() {
        self.lastScrollY = window.scrollY;
        self.requestTick();
    });
    
    // Listen for resize events
    window.addEventListener('resize', function() {
        self.updateHeaderState();
    });
    
    // Initial state after load
    window.addEventListener('load', function() {
        setTimeout(function() { self.updateHeaderState(); }, 100);
    });
};

DynamicHeaderManager.prototype.requestTick = function() {
    if (!this.ticking) {
        var self = this;
        requestAnimationFrame(function() { self.updateHeaderState(); });
        this.ticking = true;
    }
};

DynamicHeaderManager.prototype.updateHeaderState = function() {
    this.ticking = false;
    
    if (!this.header) return;
    
    var scrollY = this.lastScrollY;
    var headerHeight = this.header.offsetHeight;
    
    // Scroll direction detection and header hide/show logic
    var scrollDelta = scrollY - this.previousScrollY;
    var scrollingDown = scrollDelta > 0;
    var scrollingUp = scrollDelta < 0;
    var scrollDistance = Math.abs(scrollDelta);
    
    // Determine scroll direction
    if (scrollDistance > 2) { // Ignore tiny scroll movements
        this.scrollDirection = scrollingDown ? 'down' : 'up';
    }
    
    // Header visibility logic
    var shouldHideHeader = false;
    var shouldShowHeader = false;
    
    if (scrollY < this.scrollThreshold) {
        // Always show header near the top
        shouldShowHeader = true;
    } else if (this.scrollDirection === 'down' && scrollingDown && scrollDistance > 5) {
        // Hide header when scrolling down significantly
        shouldHideHeader = true;
    } else if (this.scrollDirection === 'up' && scrollingUp && scrollDistance > 3) {
        // Show header when scrolling up
        shouldShowHeader = true;
    }
    
    // Apply header visibility changes
    if (shouldHideHeader && this.isHeaderVisible) {
        this.header.classList.remove('header-visible');
        this.header.classList.add('header-hidden');
        this.isHeaderVisible = false;
    } else if (shouldShowHeader && !this.isHeaderVisible) {
        this.header.classList.remove('header-hidden');
        this.header.classList.add('header-visible');
        this.isHeaderVisible = true;
    }
    
    // Calculate the transition point more accurately for background detection
    var transitionPoint = 400; // fallback minimum
    
    if (this.heroSection) {
        // Get hero section bounds with buffer for smoother transition
        var heroRect = this.heroSection.getBoundingClientRect();
        var heroBottom = heroRect.bottom + scrollY - headerHeight - 30;
        transitionPoint = Math.max(heroBottom, 400);
    }
    
    // Determine if header is over dark or light background
    var isOverDark = scrollY < transitionPoint;
    
    // Force remove both classes first to prevent conflicts
    this.header.classList.remove('on-dark', 'on-light');
    
    // Add the appropriate class in the next frame for smooth transition
    var self = this;
    requestAnimationFrame(function() {
        if (isOverDark) {
            self.header.classList.add('on-dark');
        } else {
            self.header.classList.add('on-light');
        }
    });
    
    // Update scroll position for next iteration
    this.previousScrollY = scrollY;
    
    // Ensure no conflicting inline styles
    this.header.style.backdropFilter = 'none';
    this.header.style.webkitBackdropFilter = 'none';
    this.header.style.background = '';
    this.header.style.borderBottom = '';
    this.header.style.boxShadow = '';
};

// Scroll to Top Functionality
function ScrollToTopManager() {
    this.scrollButton = document.getElementById('scroll-to-top');
    this.init();
}

ScrollToTopManager.prototype.init = function() {
    if (!this.scrollButton) return;

    var self = this;
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() { self.toggleVisibility(); });
    
    // Smooth scroll to top when clicked
    this.scrollButton.addEventListener('click', function() { self.scrollToTop(); });
};

ScrollToTopManager.prototype.toggleVisibility = function() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 300) {
        this.scrollButton.classList.add('visible');
    } else {
        this.scrollButton.classList.remove('visible');
    }
};

ScrollToTopManager.prototype.scrollToTop = function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};

// Force scroll to top on page load
function forceScrollToTop() {
    // Immediately scroll to top without animation on page load
    window.scrollTo(0, 0);
    
    // Also handle browser back/forward navigation
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    
    // Ensure scroll position is reset after a short delay in case of any conflicts
    setTimeout(function() {
        window.scrollTo(0, 0);
    }, 100);
}

// Initialize all managers and force scroll to top
document.addEventListener('DOMContentLoaded', function() {
    forceScrollToTop();
    window.headerManager = new DynamicHeaderManager();
    window.scrollToTopManager = new ScrollToTopManager();
});

// Also force scroll to top on page show (handles browser back/forward)
window.addEventListener('pageshow', function() {
    forceScrollToTop();
});