/**
 * ============================================================================
 * CENTRALIZED INITIALIZATION SYSTEM
 * Robotics & Control Ltd - Professional Website
 * ============================================================================
 * 
 * This file consolidates all JavaScript initialization logic to avoid
 * duplicate DOMContentLoaded listeners and improve code organization.
 * 
 * FEATURES:
 * - Single initialization point for all modules
 * - Proper error handling and fallbacks
 * - Performance optimized with lazy loading
 * - Cross-browser compatibility
 * 
 * MODULES INITIALIZED:
 * - Header management and scroll effects
 * - Navigation system (mobile/desktop)
 * - Tooltip system for enhanced UX
 * - Chatbot interface
 * - Form validation system
 * - Training platform (when applicable)
 * - Page loader and animations
 * 
 * @version 2.0
 * @author Robotics & Control Ltd Development Team
 * @created 2025
 */

(function() {
    'use strict';

    /**
     * Core initialization manager
     * Handles the sequential loading and initialization of all website modules
     */
    var WebsiteInitializer = {
        
        /**
         * Flag to prevent duplicate initialization
         */
        initialized: false,
        
        /**
         * Array to store initialization errors for debugging
         */
        initErrors: [],
        
        /**
         * Main initialization method
         * Called once when DOM is ready
         */
        init: function() {
            if (this.initialized) {
                console.warn('Website already initialized, skipping duplicate initialization');
                return;
            }
            
            console.log('Initializing Robotics & Control Ltd website...');
            
            try {
                // Core systems - these must load first
                this.initCoreFeatures();
                
                // UI enhancement systems
                this.initUIEnhancements();
                
                // Interactive systems
                this.initInteractiveSystems();
                
                // Performance optimizations
                this.initPerformanceFeatures();
                
                this.initialized = true;
                console.log('Website initialization completed successfully');
                
            } catch (error) {
                console.error('Critical error during website initialization:', error);
                this.initErrors.push(error);
            }
        },
        
        /**
         * Initialize core website features
         * These are essential for basic functionality
         */
        initCoreFeatures: function() {
            // Force scroll to top on page load
            this.forceScrollToTop();
            
            // Initialize header management
            if (typeof DynamicHeaderManager !== 'undefined') {
                window.headerManager = new DynamicHeaderManager();
            }
            
            // Initialize scroll-to-top button
            if (typeof ScrollToTopManager !== 'undefined') {
                window.scrollToTopManager = new ScrollToTopManager();
            }
            
            // Set up header height calculation
            if (typeof setHeaderOffset === 'function') {
                setHeaderOffset();
            }
        },
        
        /**
         * Initialize UI enhancement systems
         * These improve user experience but aren't critical
         */
        initUIEnhancements: function() {
            // Initialize tooltip system
            if (typeof ProTooltip !== 'undefined') {
                window.proTooltip = new ProTooltip();
            }
            
            // Initialize page loader if present
            if (typeof initPageLoader === 'function') {
                initPageLoader();
            }
        },
        
        /**
         * Initialize interactive systems
         * These handle user interactions and dynamic content
         */
        initInteractiveSystems: function() {
            // Initialize chatbot
            if (typeof ControllerBot !== 'undefined') {
                window.controllerBot = new ControllerBot();
            }
            
            // Initialize form validation - create instance if needed
            if (typeof FormValidator !== 'undefined') {
                if (!window.formValidator) {
                    window.formValidator = new FormValidator();
                }
                this.initFormValidation();
            }
            
            // Initialize training system if on training page
            if (typeof SafetyTrainingSystem !== 'undefined' && document.body.classList.contains('safety-training-page')) {
                window.trainingSystem = new SafetyTrainingSystem();
            }
        },
        
        /**
         * Initialize form validation for all forms with data-validate attribute
         */
        initFormValidation: function() {
            var formsToValidate = document.querySelectorAll('form[data-validate]');
            
            for (var i = 0; i < formsToValidate.length; i++) {
                var form = formsToValidate[i];
                var options = {};
                
                // Parse options from data attributes
                if (form.dataset.validateOnInput === 'true') options.validateOnInput = true;
                if (form.dataset.showSuccess === 'false') options.showSuccessIndicators = false;
                
                window.formValidator.setupFormValidation(form, options);
            }
            
            // Set up specialized card input formatting
            this.initCardInputFormatting();
        },
        
        /**
         * Initialize credit card input formatting
         */
        initCardInputFormatting: function() {
            // Card number formatting
            var cardNumberInputs = document.querySelectorAll('input[name="cardNumber"], input[id*="card-number"]');
            for (var j = 0; j < cardNumberInputs.length; j++) {
                var input = cardNumberInputs[j];
                input.addEventListener('input', this.createInputFormatter('formatCardNumber', input));
            }
            
            // Expiry date formatting
            var cardExpiryInputs = document.querySelectorAll('input[name="cardExpiry"], input[id*="expiry"]');
            for (var k = 0; k < cardExpiryInputs.length; k++) {
                var input = cardExpiryInputs[k];
                input.addEventListener('input', this.createInputFormatter('formatExpiryDate', input));
            }
            
            // CVV formatting
            var cardCvvInputs = document.querySelectorAll('input[name="cardCvv"], input[id*="cvv"]');
            for (var l = 0; l < cardCvvInputs.length; l++) {
                var input = cardCvvInputs[l];
                input.addEventListener('input', this.createInputFormatter('formatCVV', input));
            }
        },
        
        /**
         * Create input formatter function with proper closure
         * @param {string} methodName - The FormValidator method to call
         * @param {HTMLElement} input - The input element
         * @returns {Function} Event handler function
         */
        createInputFormatter: function(methodName, input) {
            return function() {
                if (window.formValidator && typeof window.formValidator[methodName] === 'function') {
                    window.formValidator[methodName](input);
                }
            };
        },
        
        /**
         * Initialize performance optimization features
         */
        initPerformanceFeatures: function() {
            // Set up lazy loading for images
            this.initLazyLoading();
            
            // Initialize animations
            if (typeof initAnimations === 'function') {
                initAnimations();
            }
            
            // Initialize GDPR functionality
            if (typeof initGDPR === 'function') {
                initGDPR();
            }
        },
        
        /**
         * Initialize lazy loading for images
         */
        initLazyLoading: function() {
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
        },
        
        /**
         * Force scroll to top on page load
         * Ensures consistent page positioning
         */
        forceScrollToTop: function() {
            // Immediately scroll to top without animation on page load
            window.scrollTo(0, 0);
            
            // Handle browser back/forward navigation
            if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
            }
            
            // Ensure scroll position is reset after a short delay
            setTimeout(function() {
                window.scrollTo(0, 0);
            }, 100);
        }
    };
    
    /**
     * Initialize website when DOM is ready
     */
    document.addEventListener('DOMContentLoaded', function() {
        WebsiteInitializer.init();
    });
    
    /**
     * Handle page show events (browser back/forward)
     */
    window.addEventListener('pageshow', function() {
        WebsiteInitializer.forceScrollToTop();
    });
    
    /**
     * Global error handler for uncaught errors
     */
    window.addEventListener('error', function(event) {
        console.error('Uncaught error:', event.error);
    });
    
    /**
     * Global promise rejection handler
     */
    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled promise rejection:', event.reason);
    });
    
    // Expose initializer for debugging
    window.WebsiteInitializer = WebsiteInitializer;
    
})();