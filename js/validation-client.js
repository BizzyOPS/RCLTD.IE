/* ============================================================================
   CLIENT-SIDE VALIDATION LIBRARY - ROBOTICS & CONTROL LTD
   
   Comprehensive form validation and sanitization system providing real-time
   input validation, XSS prevention, and user feedback for all contact forms
   and user-facing form elements throughout the website.
   
   Features:
   - Real-time validation with immediate feedback
   - Comprehensive input sanitization and XSS prevention
   - Multiple validation rules (required, pattern, length limits)
   - Custom error messages for user guidance
   - Cross-browser compatible validation logic
   - ARIA accessibility compliance for screen readers
   
   Dependencies: Works with css/validation.css for styling
   Browser Support: Modern browsers (Chrome 60+, Firefox 55+, Safari 12+)
   Security: Input sanitization, pattern validation, length limits
   ============================================================================ */

function FormValidator() {
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
            // Search and other fields
            search: {
                required: false,
                maxLength: 100,
                errorMessage: 'Search query too long'
            }
        };
        
        this.securityPatterns = [
            // XSS patterns - simple patterns without backtracking issues
            /<script/gi,
            /<\/script/gi,
            /javascript\s*:/gi,
            /vbscript\s*:/gi,
            /\son\w+\s*=/gi,
            /<iframe/gi,
            /<object/gi,
            /<embed/gi,
            
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
};

/**
 * Sanitize input to prevent XSS and other attacks
 */
FormValidator.prototype.sanitizeInput = function(input) {
        if (typeof input !== 'string') return '';
        
        // HTML entity encoding
        var entityMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };
        
        return input.replace(/[&<>"'`=\/]/g, function(char) { return entityMap[char]; });
};

/**
 * Check for malicious patterns in input
 */
FormValidator.prototype.detectMaliciousContent = function(input) {
        if (typeof input !== 'string') return false;
        return this.securityPatterns.some(pattern => pattern.test(input));
};

/**
 * Validate a single field
 */
FormValidator.prototype.validateField = function(fieldName, value, customRules) {
        customRules = customRules || {};
        var rules = Object.assign({}, this.validationRules[fieldName], customRules);
        if (!rules) return { isValid: true, errors: [] };
        
        var errors = [];
        var stringValue = String(value || '').trim();
        
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
            errors.push(this.formatFieldName(fieldName) + ' must be at least ' + rules.minLength + ' characters long');
        }
        
        if (rules.maxLength && stringValue.length > rules.maxLength) {
            errors.push(this.formatFieldName(fieldName) + ' must be no more than ' + rules.maxLength + ' characters long');
        }
        
        // Pattern validation
        if (rules.pattern && stringValue && !rules.pattern.test(stringValue)) {
            errors.push(rules.errorMessage || (this.formatFieldName(fieldName) + ' format is invalid'));
        }
        
        // Email specific validation
        if (fieldName === 'email' && stringValue) {
            var emailValid = this.validateEmail(stringValue);
            if (!emailValid) {
                errors.push('Please enter a valid email address');
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors,
            sanitizedValue: this.sanitizeInput(stringValue)
        };
};

/**
 * Enhanced email validation
 */
FormValidator.prototype.validateEmail = function(email) {
        // Basic pattern check
        var emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailPattern.test(email)) return false;
        
        // Additional checks
        var parts = email.split('@');
        if (parts.length !== 2) return false;
        
        var localPart = parts[0];
        var domain = parts[1];
        
        // Local part checks
        if (localPart.length > 64) return false;
        if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
        if (localPart.includes('..')) return false;
        
        // Domain checks
        if (domain.length > 253) return false;
        if (domain.startsWith('-') || domain.endsWith('-')) return false;
        
        return true;
};

/**
 * Validate entire form
 */
FormValidator.prototype.validateForm = function(formElement, customRules) {
        customRules = customRules || {};
        var results = {};
        var allErrors = [];
        var sanitizedData = {};
        
        // Get all input elements
        var inputs = formElement.querySelectorAll('input, textarea, select');
        var self = this;
        
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            var fieldName = input.name || input.id;
            if (!fieldName) continue;
            
            var value = input.type === 'checkbox' ? input.checked : input.value;
            var result = self.validateField(fieldName, value, customRules[fieldName]);
            
            results[fieldName] = result;
            sanitizedData[fieldName] = result.sanitizedValue;
            
            if (!result.isValid) {
                allErrors = allErrors.concat(result.errors);
                self.showFieldError(input, result.errors[0]);
            } else {
                self.clearFieldError(input);
            }
        }
        
        return {
            isValid: allErrors.length === 0,
            errors: allErrors,
            sanitizedData: sanitizedData,
            fieldResults: results
        };
};

/**
 * Show error message for a field
 */
FormValidator.prototype.showFieldError = function(fieldElement, message) {
        this.clearFieldError(fieldElement);
        
        fieldElement.classList.add('invalid');
        
        // Create error message element
        var errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');
        errorElement.setAttribute('aria-live', 'polite');
        
        // Insert error message after the field
        fieldElement.parentNode.insertBefore(errorElement, fieldElement.nextSibling);
        
        // Announce error to screen readers
        this.announceError(message);
};

/**
 * Clear error message for a field
 */
FormValidator.prototype.clearFieldError = function(fieldElement) {
        fieldElement.classList.remove('invalid');
        
        var existingError = fieldElement.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
};

/**
 * Announce error to screen readers
 */
FormValidator.prototype.announceError = function(message) {
        var announcer = document.getElementById('error-announcer') || this.createErrorAnnouncer();
        announcer.textContent = message;
        
        // Clear after a short delay
        var self = this;
        setTimeout(function() {
            announcer.textContent = '';
        }, 1000);
};

/**
 * Create hidden element for screen reader announcements
 */
FormValidator.prototype.createErrorAnnouncer = function() {
        var announcer = document.createElement('div');
        announcer.id = 'error-announcer';
        announcer.className = 'sr-only';
        announcer.setAttribute('aria-live', 'assertive');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
        document.body.appendChild(announcer);
        return announcer;
};

/**
 * Format field name for display
 */
FormValidator.prototype.formatFieldName = function(fieldName) {
        var nameMap = {
            firstName: 'First name',
            lastName: 'Last name',
            postalCode: 'Postal code',
            cardNumber: 'Card number',
            cardExpiry: 'Expiry date',
            cardCvv: 'CVV',
            cardName: 'Cardholder name'
        };
        
        return nameMap[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
};

/**
 * Set up real-time validation for a form
 */
FormValidator.prototype.setupFormValidation = function(formElement, options) {
        options = options || {};
        var validateOnBlur = options.validateOnBlur !== undefined ? options.validateOnBlur : true;
        var validateOnInput = options.validateOnInput !== undefined ? options.validateOnInput : false;
        var showSuccessIndicators = options.showSuccessIndicators !== undefined ? options.showSuccessIndicators : true;
        var customRules = options.customRules || {};
        
        var inputs = formElement.querySelectorAll('input, textarea, select');
        var self = this;
        
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            
            // Validation on blur
            if (validateOnBlur) {
                input.addEventListener('blur', (function(input) {
                    return function() {
                        var fieldName = input.name || input.id;
                        if (fieldName) {
                            var value = input.type === 'checkbox' ? input.checked : input.value;
                            var result = self.validateField(fieldName, value, customRules[fieldName]);
                            
                            if (!result.isValid) {
                                self.showFieldError(input, result.errors[0]);
                            } else {
                                self.clearFieldError(input);
                                if (showSuccessIndicators && input.value.trim()) {
                                    input.classList.add('valid');
                                }
                            }
                        }
                    };
                })(input));
            }
            
            // Clear errors on input
            input.addEventListener('input', (function(input) {
                return function() {
                    self.clearFieldError(input);
                    input.classList.remove('valid', 'invalid');
                    
                    // Immediate validation for certain fields
                    if (validateOnInput) {
                        var fieldName = input.name || input.id;
                        if (fieldName) {
                            var value = input.type === 'checkbox' ? input.checked : input.value;
                            var result = self.validateField(fieldName, value, customRules[fieldName]);
                            
                            if (value.trim() && result.isValid && showSuccessIndicators) {
                                input.classList.add('valid');
                            }
                        }
                    }
                };
            })(input));
        }
        
        // Form submission validation
        formElement.addEventListener('submit', function(e) {
            e.preventDefault();
            
            var validation = self.validateForm(formElement, customRules);
            
            if (validation.isValid) {
                // Trigger custom submission handler
                var submitEvent = new CustomEvent('validSubmit', {
                    detail: {
                        sanitizedData: validation.sanitizedData,
                        originalForm: formElement
                    }
                });
                formElement.dispatchEvent(submitEvent);
            } else {
                // Focus first invalid field
                var firstInvalidField = formElement.querySelector('.invalid');
                if (firstInvalidField) {
                    firstInvalidField.focus();
                }
                
                // Announce validation failure
                self.announceError('Form validation failed. Please check ' + validation.errors.length + ' field' + (validation.errors.length > 1 ? 's' : '') + '.');
            }
        });
};

/**
 * Format card number with spaces
 */
FormValidator.prototype.formatCardNumber = function(input) {
        var value = input.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
        var match = value.match(/.{1,4}/g);
        var formattedValue = match ? match.join(' ') : value;
        
        if (formattedValue.length > 19) {
            formattedValue = formattedValue.substr(0, 19);
        }
        
        input.value = formattedValue;
};

/**
 * Format expiry date
 */
FormValidator.prototype.formatExpiryDate = function(input) {
        var value = input.value.replace(/\D/g, '');
        
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        
        input.value = value;
};

/**
 * Format CVV
 */
FormValidator.prototype.formatCVV = function(input) {
        var value = input.value.replace(/\D/g, '');
        input.value = value.substring(0, 4);
};

// Global form validator instance
window.formValidator = new FormValidator();

// Auto-initialize validation for forms with data-validate attribute
document.addEventListener('DOMContentLoaded', function() {
    var formsToValidate = document.querySelectorAll('form[data-validate]');
    
    for (var i = 0; i < formsToValidate.length; i++) {
        var form = formsToValidate[i];
        var options = {};
        
        // Parse options from data attributes
        if (form.dataset.validateOnInput === 'true') options.validateOnInput = true;
        if (form.dataset.showSuccess === 'false') options.showSuccessIndicators = false;
        
        formValidator.setupFormValidation(form, options);
    }
    
    // Set up card number formatting
    var cardNumberInputs = document.querySelectorAll('input[name="cardNumber"], input[id*="card-number"]');
    for (var j = 0; j < cardNumberInputs.length; j++) {
        var input = cardNumberInputs[j];
        input.addEventListener('input', (function(input) {
            return function() { formValidator.formatCardNumber(input); };
        })(input));
    }
    
    // Set up expiry date formatting
    var cardExpiryInputs = document.querySelectorAll('input[name="cardExpiry"], input[id*="expiry"]');
    for (var k = 0; k < cardExpiryInputs.length; k++) {
        var input = cardExpiryInputs[k];
        input.addEventListener('input', (function(input) {
            return function() { formValidator.formatExpiryDate(input); };
        })(input));
    }
    
    // Set up CVV formatting
    var cardCvvInputs = document.querySelectorAll('input[name="cardCvv"], input[id*="cvv"]');
    for (var l = 0; l < cardCvvInputs.length; l++) {
        var input = cardCvvInputs[l];
        input.addEventListener('input', (function(input) {
            return function() { formValidator.formatCVV(input); };
        })(input));
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormValidator;
}