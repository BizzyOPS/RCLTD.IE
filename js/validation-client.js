/**
 * Client-Side Validation Library for Robotics & Control Ltd
 * 
 * Comprehensive input validation and sanitization for all user-facing forms
 * with real-time feedback and XSS prevention.
 */

class FormValidator {
    constructor() {
        this.validationRules = {
            // Personal information rules
            firstName: {
                required: true,
                minLength: 1,
                maxLength: 50,
                pattern: /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\'\-\s]+$/,
                errorMessage: 'First name must contain only letters, spaces, hyphens, and apostrophes'
            },
            lastName: {
                required: true,
                minLength: 1,
                maxLength: 50,
                pattern: /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\'\-\s]+$/,
                errorMessage: 'Last name must contain only letters, spaces, hyphens, and apostrophes'
            },
            name: {
                required: true,
                minLength: 2,
                maxLength: 100,
                pattern: /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\'\-\s]+$/,
                errorMessage: 'Name must contain only letters, spaces, hyphens, and apostrophes'
            },
            email: {
                required: true,
                maxLength: 254,
                pattern: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
                errorMessage: 'Please enter a valid email address'
            },
            phone: {
                required: false,
                minLength: 8,
                maxLength: 20,
                pattern: /^[\+]?[(]?[\d\s\-\(\)\.]{8,20}$/,
                errorMessage: 'Please enter a valid phone number'
            },
            company: {
                required: false,
                maxLength: 100,
                pattern: /^[a-zA-Z0-9À-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\'\-\s\.\,\&\(\)]*$/,
                errorMessage: 'Company name contains invalid characters'
            },
            // Address fields
            address: {
                required: true,
                minLength: 5,
                maxLength: 200,
                pattern: /^[a-zA-Z0-9À-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\'\-\s\.\,\#\/]+$/,
                errorMessage: 'Please enter a valid street address'
            },
            city: {
                required: true,
                minLength: 1,
                maxLength: 100,
                pattern: /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\'\-\s]+$/,
                errorMessage: 'City name must contain only letters, spaces, hyphens, and apostrophes'
            },
            county: {
                required: true,
                minLength: 1,
                maxLength: 100,
                pattern: /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\'\-\s]+$/,
                errorMessage: 'County name must contain only letters, spaces, hyphens, and apostrophes'
            },
            postalCode: {
                required: false,
                minLength: 2,
                maxLength: 12,
                pattern: /^[a-zA-Z0-9\s\-]*$/,
                errorMessage: 'Please enter a valid postal code'
            },
            // Content fields
            message: {
                required: true,
                minLength: 10,
                maxLength: 2000,
                errorMessage: 'Message must be between 10 and 2000 characters'
            },
            subject: {
                required: false,
                minLength: 5,
                maxLength: 200,
                errorMessage: 'Subject must be between 5 and 200 characters'
            },
            // Payment fields
            cardNumber: {
                required: false,
                pattern: /^\d{13,19}$/,
                errorMessage: 'Please enter a valid card number'
            },
            cardExpiry: {
                required: false,
                pattern: /^(0[1-9]|1[0-2])\/\d{2}$/,
                errorMessage: 'Please enter expiry date in MM/YY format'
            },
            cardCvv: {
                required: false,
                pattern: /^\d{3,4}$/,
                errorMessage: 'Please enter a valid CVV'
            },
            cardName: {
                required: false,
                minLength: 2,
                maxLength: 100,
                pattern: /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\'\-\s]+$/,
                errorMessage: 'Cardholder name must contain only letters, spaces, hyphens, and apostrophes'
            },
            // Search and other fields
            search: {
                required: false,
                maxLength: 100,
                errorMessage: 'Search query too long'
            }
        };
        
        this.securityPatterns = [
            // XSS patterns
            /<script[^>]*>.*?<\/script>/gi,
            /javascript\s*:/gi,
            /vbscript\s*:/gi,
            /on(load|error|click|focus|blur|mouseover|mouseout)\s*=/gi,
            /<iframe[^>]*>/gi,
            /<object[^>]*>/gi,
            /<embed[^>]*>/gi,
            
            // SQL injection patterns
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\s+)/gi,
            /(\bUNION\s+SELECT\b)/gi,
            /'(\s*(OR|AND)\s+.*=)|('.*;\s*--)/gi,
            
            // Path traversal
            /\.\.\//g,
            /%2e%2e%2f/gi,
            
            // Command injection
            /(\;\s*(rm|del|format|wget|curl|python|perl|ruby|php|bash|sh|cmd|powershell))/gi
        ];
    }
    
    /**
     * Sanitize input to prevent XSS and other attacks
     */
    sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        
        // HTML entity encoding
        const entityMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };
        
        return input.replace(/[&<>"'`=\/]/g, (char) => entityMap[char]);
    }
    
    /**
     * Check for malicious patterns in input
     */
    detectMaliciousContent(input) {
        if (typeof input !== 'string') return false;
        return this.securityPatterns.some(pattern => pattern.test(input));
    }
    
    /**
     * Validate a single field
     */
    validateField(fieldName, value, customRules = {}) {
        const rules = { ...this.validationRules[fieldName], ...customRules };
        if (!rules) return { isValid: true, errors: [] };
        
        const errors = [];
        const stringValue = String(value || '').trim();
        
        // Security check first
        if (this.detectMaliciousContent(stringValue)) {
            return {
                isValid: false,
                errors: ['Input contains potentially harmful content'],
                sanitizedValue: this.sanitizeInput(stringValue)
            };
        }
        
        // Required field validation
        if (rules.required && (!stringValue || stringValue.length === 0)) {
            errors.push(`${this.formatFieldName(fieldName)} is required`);
        }
        
        // Skip further validation if empty and not required
        if (!stringValue && !rules.required) {
            return { isValid: true, errors: [], sanitizedValue: '' };
        }
        
        // Length validation
        if (rules.minLength && stringValue.length < rules.minLength) {
            errors.push(`${this.formatFieldName(fieldName)} must be at least ${rules.minLength} characters long`);
        }
        
        if (rules.maxLength && stringValue.length > rules.maxLength) {
            errors.push(`${this.formatFieldName(fieldName)} must be no more than ${rules.maxLength} characters long`);
        }
        
        // Pattern validation
        if (rules.pattern && stringValue && !rules.pattern.test(stringValue)) {
            errors.push(rules.errorMessage || `${this.formatFieldName(fieldName)} format is invalid`);
        }
        
        // Email specific validation
        if (fieldName === 'email' && stringValue) {
            const emailValid = this.validateEmail(stringValue);
            if (!emailValid) {
                errors.push('Please enter a valid email address');
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            sanitizedValue: this.sanitizeInput(stringValue)
        };
    }
    
    /**
     * Enhanced email validation
     */
    validateEmail(email) {
        // Basic pattern check
        const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailPattern.test(email)) return false;
        
        // Additional checks
        const parts = email.split('@');
        if (parts.length !== 2) return false;
        
        const [localPart, domain] = parts;
        
        // Local part checks
        if (localPart.length > 64) return false;
        if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
        if (localPart.includes('..')) return false;
        
        // Domain checks
        if (domain.length > 253) return false;
        if (domain.startsWith('-') || domain.endsWith('-')) return false;
        
        return true;
    }
    
    /**
     * Validate entire form
     */
    validateForm(formElement, customRules = {}) {
        const results = {};
        const allErrors = [];
        const sanitizedData = {};
        
        // Get all input elements
        const inputs = formElement.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            const fieldName = input.name || input.id;
            if (!fieldName) return;
            
            const value = input.type === 'checkbox' ? input.checked : input.value;
            const result = this.validateField(fieldName, value, customRules[fieldName]);
            
            results[fieldName] = result;
            sanitizedData[fieldName] = result.sanitizedValue;
            
            if (!result.isValid) {
                allErrors.push(...result.errors);
                this.showFieldError(input, result.errors[0]);
            } else {
                this.clearFieldError(input);
            }
        });
        
        return {
            isValid: allErrors.length === 0,
            errors: allErrors,
            sanitizedData,
            fieldResults: results
        };
    }
    
    /**
     * Show error message for a field
     */
    showFieldError(fieldElement, message) {
        this.clearFieldError(fieldElement);
        
        fieldElement.classList.add('invalid');
        
        // Create error message element
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');
        errorElement.setAttribute('aria-live', 'polite');
        
        // Insert error message after the field
        fieldElement.parentNode.insertBefore(errorElement, fieldElement.nextSibling);
        
        // Announce error to screen readers
        this.announceError(message);
    }
    
    /**
     * Clear error message for a field
     */
    clearFieldError(fieldElement) {
        fieldElement.classList.remove('invalid');
        
        const existingError = fieldElement.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
    
    /**
     * Announce error to screen readers
     */
    announceError(message) {
        const announcer = document.getElementById('error-announcer') || this.createErrorAnnouncer();
        announcer.textContent = message;
        
        // Clear after a short delay
        setTimeout(() => {
            announcer.textContent = '';
        }, 1000);
    }
    
    /**
     * Create hidden element for screen reader announcements
     */
    createErrorAnnouncer() {
        const announcer = document.createElement('div');
        announcer.id = 'error-announcer';
        announcer.className = 'sr-only';
        announcer.setAttribute('aria-live', 'assertive');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
        document.body.appendChild(announcer);
        return announcer;
    }
    
    /**
     * Format field name for display
     */
    formatFieldName(fieldName) {
        const nameMap = {
            firstName: 'First name',
            lastName: 'Last name',
            postalCode: 'Postal code',
            cardNumber: 'Card number',
            cardExpiry: 'Expiry date',
            cardCvv: 'CVV',
            cardName: 'Cardholder name'
        };
        
        return nameMap[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    }
    
    /**
     * Set up real-time validation for a form
     */
    setupFormValidation(formElement, options = {}) {
        const {
            validateOnBlur = true,
            validateOnInput = false,
            showSuccessIndicators = true,
            customRules = {}
        } = options;
        
        const inputs = formElement.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Validation on blur
            if (validateOnBlur) {
                input.addEventListener('blur', () => {
                    const fieldName = input.name || input.id;
                    if (fieldName) {
                        const value = input.type === 'checkbox' ? input.checked : input.value;
                        const result = this.validateField(fieldName, value, customRules[fieldName]);
                        
                        if (!result.isValid) {
                            this.showFieldError(input, result.errors[0]);
                        } else {
                            this.clearFieldError(input);
                            if (showSuccessIndicators && input.value.trim()) {
                                input.classList.add('valid');
                            }
                        }
                    }
                });
            }
            
            // Clear errors on input
            input.addEventListener('input', () => {
                this.clearFieldError(input);
                input.classList.remove('valid', 'invalid');
                
                // Immediate validation for certain fields
                if (validateOnInput) {
                    const fieldName = input.name || input.id;
                    if (fieldName) {
                        const value = input.type === 'checkbox' ? input.checked : input.value;
                        const result = this.validateField(fieldName, value, customRules[fieldName]);
                        
                        if (value.trim() && result.isValid && showSuccessIndicators) {
                            input.classList.add('valid');
                        }
                    }
                }
            });
        });
        
        // Form submission validation
        formElement.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const validation = this.validateForm(formElement, customRules);
            
            if (validation.isValid) {
                // Trigger custom submission handler
                const submitEvent = new CustomEvent('validSubmit', {
                    detail: {
                        sanitizedData: validation.sanitizedData,
                        originalForm: formElement
                    }
                });
                formElement.dispatchEvent(submitEvent);
            } else {
                // Focus first invalid field
                const firstInvalidField = formElement.querySelector('.invalid');
                if (firstInvalidField) {
                    firstInvalidField.focus();
                }
                
                // Announce validation failure
                this.announceError(`Form validation failed. Please check ${validation.errors.length} field${validation.errors.length > 1 ? 's' : ''}.`);
            }
        });
    }
    
    /**
     * Format card number with spaces
     */
    formatCardNumber(input) {
        let value = input.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        
        if (formattedValue.length > 19) {
            formattedValue = formattedValue.substr(0, 19);
        }
        
        input.value = formattedValue;
    }
    
    /**
     * Format expiry date
     */
    formatExpiryDate(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        
        input.value = value;
    }
    
    /**
     * Format CVV
     */
    formatCVV(input) {
        let value = input.value.replace(/\D/g, '');
        input.value = value.substring(0, 4);
    }
}

// Global form validator instance
window.formValidator = new FormValidator();

// Auto-initialize validation for forms with data-validate attribute
document.addEventListener('DOMContentLoaded', () => {
    const formsToValidate = document.querySelectorAll('form[data-validate]');
    
    formsToValidate.forEach(form => {
        const options = {};
        
        // Parse options from data attributes
        if (form.dataset.validateOnInput === 'true') options.validateOnInput = true;
        if (form.dataset.showSuccess === 'false') options.showSuccessIndicators = false;
        
        formValidator.setupFormValidation(form, options);
    });
    
    // Set up card number formatting
    document.querySelectorAll('input[name="cardNumber"], input[id*="card-number"]').forEach(input => {
        input.addEventListener('input', () => formValidator.formatCardNumber(input));
    });
    
    // Set up expiry date formatting
    document.querySelectorAll('input[name="cardExpiry"], input[id*="expiry"]').forEach(input => {
        input.addEventListener('input', () => formValidator.formatExpiryDate(input));
    });
    
    // Set up CVV formatting
    document.querySelectorAll('input[name="cardCvv"], input[id*="cvv"]').forEach(input => {
        input.addEventListener('input', () => formValidator.formatCVV(input));
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormValidator;
}