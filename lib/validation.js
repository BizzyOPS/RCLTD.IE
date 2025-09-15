/**
 * Comprehensive Input Validation and Sanitization Library
 * Robotics & Control Ltd - Security Enhanced Validation
 * 
 * This library provides enterprise-grade input validation and sanitization
 * for all user inputs throughout the website application.
 */

const validator = require('validator');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const escapeHtml = require('escape-html');
const { filterXSS } = require('xss');

// Initialize DOMPurify with JSDOM for server-side HTML sanitization
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// ==================== VALIDATION SCHEMAS ====================

// Define validation schemas for different input types
const ValidationSchemas = {
    // Personal information validation
    firstName: {
        minLength: 1,
        maxLength: 50,
        pattern: /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\'\-\s]+$/,
        required: true,
        trim: true
    },
    lastName: {
        minLength: 1,
        maxLength: 50,
        pattern: /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\'\-\s]+$/,
        required: true,
        trim: true
    },
    fullName: {
        minLength: 2,
        maxLength: 100,
        pattern: /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\'\-\s]+$/,
        required: true,
        trim: true
    },
    email: {
        required: true,
        isEmail: true,
        maxLength: 254,
        normalizeEmail: {
            gmail_lowercase: true,
            gmail_remove_dots: false,
            outlookdotcom_lowercase: true,
            yahoo_lowercase: true,
            icloud_lowercase: true
        }
    },
    phone: {
        minLength: 8,
        maxLength: 20,
        pattern: /^[\+]?[(]?[\d\s\-\(\)\.]{8,20}$/,
        required: false,
        trim: true
    },
    company: {
        minLength: 1,
        maxLength: 100,
        pattern: /^[a-zA-Z0-9À-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\'\-\s\.\,\&\(\)]+$/,
        required: false,
        trim: true
    },
    address: {
        minLength: 5,
        maxLength: 200,
        pattern: /^[a-zA-Z0-9À-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\'\-\s\.\,\#\/]+$/,
        required: true,
        trim: true
    },
    city: {
        minLength: 1,
        maxLength: 100,
        pattern: /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\'\-\s]+$/,
        required: true,
        trim: true
    },
    county: {
        minLength: 1,
        maxLength: 100,
        pattern: /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\'\-\s]+$/,
        required: true,
        trim: true
    },
    postalCode: {
        minLength: 2,
        maxLength: 12,
        pattern: /^[a-zA-Z0-9\s\-]+$/,
        required: false,
        trim: true
    },
    // Message and content validation
    message: {
        minLength: 10,
        maxLength: 2000,
        required: true,
        trim: true,
        sanitizeHtml: true
    },
    subject: {
        minLength: 5,
        maxLength: 200,
        required: true,
        trim: true,
        sanitizeHtml: false
    },
    chatMessage: {
        minLength: 1,
        maxLength: 500,
        required: true,
        trim: true,
        sanitizeHtml: true
    },
    // Search and filtering
    searchQuery: {
        minLength: 1,
        maxLength: 100,
        required: false,
        trim: true,
        sanitizeHtml: true
    },
    category: {
        enum: ['', 'plc', 'hmi', 'drives', 'sensors', 'safety', 'networking', 'accessories'],
        required: false
    },
    sortOrder: {
        enum: ['name', 'price-low', 'price-high', 'newest', 'popularity'],
        required: false
    },
    // Payment information
    cardNumber: {
        pattern: /^[\d\s]{13,19}$/,
        required: false,
        trim: true
    },
    cardExpiry: {
        pattern: /^(0[1-9]|1[0-2])\/\d{2}$/,
        required: false,
        trim: true
    },
    cardCvv: {
        pattern: /^\d{3,4}$/,
        required: false,
        trim: true
    },
    cardName: {
        minLength: 2,
        maxLength: 100,
        pattern: /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\'\-\s]+$/,
        required: false,
        trim: true
    },
    // Training system
    trainingAnswer: {
        minLength: 1,
        maxLength: 200,
        required: true,
        trim: true,
        sanitizeHtml: true
    }
};

// ==================== SANITIZATION FUNCTIONS ====================

/**
 * Comprehensive HTML sanitization using multiple layers
 */
function sanitizeHtml(input, options = {}) {
    if (!input || typeof input !== 'string') return '';
    
    const config = {
        allowBasicFormatting: options.allowBasicFormatting || false,
        strictMode: options.strictMode !== false, // Default to strict
        ...options
    };
    
    let sanitized = input;
    
    if (config.strictMode) {
        // Strict mode: Remove all HTML tags and encode entities
        sanitized = escapeHtml(sanitized);
    } else if (config.allowBasicFormatting) {
        // Allow basic formatting but sanitize dangerous content
        sanitized = DOMPurify.sanitize(sanitized, {
            ALLOWED_TAGS: ['b', 'i', 'strong', 'em', 'u', 'br', 'p'],
            ALLOWED_ATTR: [],
            KEEP_CONTENT: true
        });
    } else {
        // Use XSS library for moderate sanitization
        sanitized = filterXSS(sanitized, {
            whiteList: {}, // No tags allowed
            stripIgnoreTag: true,
            stripIgnoreTagBody: ['script', 'style']
        });
    }
    
    return sanitized;
}

/**
 * Sanitize input for SQL contexts (prevent SQL injection)
 */
function sanitizeForSql(input) {
    if (!input || typeof input !== 'string') return '';
    
    // Remove common SQL injection patterns
    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
        /(\b(OR|AND)\s+[\d\w]+\s*=\s*[\d\w]+)/gi,
        /(--|\/\*|\*\/)/g,
        /(\b(CHAR|NCHAR|VARCHAR|NVARCHAR)\s*\()/gi,
        /(\b(CAST|CONVERT|SUBSTRING)\s*\()/gi
    ];
    
    let sanitized = input;
    sqlPatterns.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '');
    });
    
    return sanitized.trim();
}

/**
 * Sanitize file names and paths
 */
function sanitizeFileName(fileName) {
    if (!fileName || typeof fileName !== 'string') return '';
    
    // Remove path traversal attempts and dangerous characters
    return fileName
        .replace(/[<>:"/\\|?*]/g, '')
        .replace(/\.\./g, '')
        .replace(/^\./, '')
        .substring(0, 255)
        .trim();
}

/**
 * Sanitize URL parameters
 */
function sanitizeUrlParam(param) {
    if (!param || typeof param !== 'string') return '';
    
    return decodeURIComponent(param)
        .replace(/[<>'"]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '')
        .trim();
}

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Core validation function for any input
 */
function validateInput(value, schema, fieldName = 'field') {
    const errors = [];
    
    // Handle null/undefined
    if (value === null || value === undefined) {
        value = '';
    }
    
    // Convert to string for processing
    const stringValue = String(value);
    
    // Trim if required
    let processedValue = schema.trim ? stringValue.trim() : stringValue;
    
    // Required field validation
    if (schema.required && (!processedValue || processedValue.length === 0)) {
        errors.push(`${fieldName} is required`);
        return { isValid: false, errors, sanitizedValue: '' };
    }
    
    // Skip further validation if empty and not required
    if (!processedValue && !schema.required) {
        return { isValid: true, errors: [], sanitizedValue: '' };
    }
    
    // Length validation
    if (schema.minLength && processedValue.length < schema.minLength) {
        errors.push(`${fieldName} must be at least ${schema.minLength} characters long`);
    }
    
    if (schema.maxLength && processedValue.length > schema.maxLength) {
        errors.push(`${fieldName} must be no more than ${schema.maxLength} characters long`);
        processedValue = processedValue.substring(0, schema.maxLength);
    }
    
    // Pattern validation
    if (schema.pattern && !schema.pattern.test(processedValue)) {
        errors.push(`${fieldName} format is invalid`);
    }
    
    // Enum validation
    if (schema.enum && !schema.enum.includes(processedValue)) {
        errors.push(`${fieldName} must be one of: ${schema.enum.join(', ')}`);
    }
    
    // Email validation
    if (schema.isEmail && !validator.isEmail(processedValue)) {
        errors.push(`${fieldName} must be a valid email address`);
    }
    
    // Normalize email
    if (schema.isEmail && schema.normalizeEmail && validator.isEmail(processedValue)) {
        processedValue = validator.normalizeEmail(processedValue, schema.normalizeEmail);
    }
    
    // HTML sanitization
    if (schema.sanitizeHtml !== false) {
        processedValue = sanitizeHtml(processedValue, {
            strictMode: schema.sanitizeHtml === true || schema.sanitizeHtml === undefined
        });
    }
    
    // SQL sanitization for all text inputs
    processedValue = sanitizeForSql(processedValue);
    
    return {
        isValid: errors.length === 0,
        errors,
        sanitizedValue: processedValue
    };
}

/**
 * Validate entire object against schema
 */
function validateObject(data, schemaName) {
    if (!data || typeof data !== 'object') {
        return {
            isValid: false,
            errors: ['Invalid data format'],
            sanitizedData: {}
        };
    }
    
    const results = {};
    const allErrors = [];
    const sanitizedData = {};
    
    // Get the appropriate schema based on form type
    const schema = getValidationSchema(schemaName);
    
    for (const [field, rules] of Object.entries(schema)) {
        const fieldValue = data[field];
        const result = validateInput(fieldValue, rules, field);
        
        results[field] = result;
        sanitizedData[field] = result.sanitizedValue;
        
        if (!result.isValid) {
            allErrors.push(...result.errors);
        }
    }
    
    return {
        isValid: allErrors.length === 0,
        errors: allErrors,
        sanitizedData,
        fieldResults: results
    };
}

/**
 * Get validation schema for specific form types
 */
function getValidationSchema(schemaType) {
    const schemas = {
        contact: {
            name: ValidationSchemas.fullName,
            email: ValidationSchemas.email,
            company: ValidationSchemas.company,
            phone: ValidationSchemas.phone,
            service: ValidationSchemas.category,
            message: ValidationSchemas.message
        },
        checkout: {
            firstName: ValidationSchemas.firstName,
            lastName: ValidationSchemas.lastName,
            email: ValidationSchemas.email,
            phone: ValidationSchemas.phone,
            company: ValidationSchemas.company,
            address: ValidationSchemas.address,
            city: ValidationSchemas.city,
            county: ValidationSchemas.county,
            postalCode: ValidationSchemas.postalCode,
            cardNumber: ValidationSchemas.cardNumber,
            cardExpiry: ValidationSchemas.cardExpiry,
            cardCvv: ValidationSchemas.cardCvv,
            cardName: ValidationSchemas.cardName
        },
        newsletter: {
            email: ValidationSchemas.email,
            name: ValidationSchemas.fullName
        },
        chat: {
            message: ValidationSchemas.chatMessage
        },
        search: {
            query: ValidationSchemas.searchQuery,
            category: ValidationSchemas.category,
            sort: ValidationSchemas.sortOrder
        },
        training: {
            answer: ValidationSchemas.trainingAnswer
        }
    };
    
    return schemas[schemaType] || {};
}

// ==================== SECURITY CHECKS ====================

/**
 * Detect potentially malicious input patterns
 */
function detectMaliciousPatterns(input) {
    if (!input || typeof input !== 'string') return false;
    
    // Skip User-Agent header validation - these often contain legitimate "script" references
    // This function should not be used directly on User-Agent strings
    
    const maliciousPatterns = [
        // XSS patterns - more specific to avoid false positives
        /<script[^>]*>.*?<\/script>/gi,
        /javascript\s*:/gi,  // More specific
        /vbscript\s*:/gi,     // More specific
        /on(load|error|click|focus|blur|mouseover|mouseout)\s*=/gi,
        /<iframe[^>]*>/gi,
        /<object[^>]*>/gi,
        /<embed[^>]*>/gi,
        /<link[^>]*>/gi,
        /<meta[^>]*>/gi,
        
        // SQL injection patterns - more specific
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\s+)/gi,
        /(\bUNION\s+SELECT\b)/gi,
        /'(\s*(OR|AND)\s+.*=)|('.*;\s*--)/gi,
        /(\s*(;|'|\"|`)\s*(DROP|DELETE|UPDATE|INSERT))/gi,
        
        // Path traversal
        /\.\.\//g,
        /\.\.\\+/g,
        /%2e%2e%2f/gi,
        /%2e%2e%5c/gi,
        
        // Command injection - more specific
        /(\|\s*(rm|del|format|wget|curl|nc|netcat))/gi,
        /(\;\s*(rm|del|format|wget|curl|nc|netcat|python|perl|ruby|php|bash|sh|cmd|powershell))/gi,
        /(`.*`)/g,  // Command substitution
        
        // Data exfiltration
        /data:.*base64/gi,
        /data:text\/html/gi,
        /data:application\/javascript/gi
    ];
    
    return maliciousPatterns.some(pattern => pattern.test(input));
}

/**
 * Specific User-Agent validation (less aggressive)
 */
function validateUserAgent(userAgent) {
    if (!userAgent || typeof userAgent !== 'string') return true;
    
    const suspiciousUserAgentPatterns = [
        /sqlmap/gi,
        /nikto/gi,
        /nessus/gi,
        /nmap/gi,
        /<script/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /python-requests/gi,  // Often used in automated attacks
        /libwww-perl/gi,      // Often used in automated attacks
        /wget/gi,             // Command line tool
        /curl\/[0-9]/gi       // Command line tool (but allow browser curl)
    ];
    
    return !suspiciousUserAgentPatterns.some(pattern => pattern.test(userAgent));
}

/**
 * Rate limiting check for input validation
 */
function checkInputRateLimit(ip, inputType = 'general') {
    // This would integrate with the server's rate limiting
    // For now, return true (allowed)
    return true;
}

/**
 * Content Security Policy validation for user-generated content
 */
function validateContentSecurityPolicy(content) {
    if (!content || typeof content !== 'string') return true;
    
    // Check for CSP-violating content
    const cspViolations = [
        /data:\s*text\/html/gi,
        /data:\s*application\/javascript/gi,
        /data:\s*text\/javascript/gi,
        /javascript:\s*/gi,
        /vbscript:\s*/gi
    ];
    
    return !cspViolations.some(pattern => pattern.test(content));
}

// ==================== EXPORTS ====================

module.exports = {
    // Core validation functions
    validateInput,
    validateObject,
    getValidationSchema,
    
    // Sanitization functions
    sanitizeHtml,
    sanitizeForSql,
    sanitizeFileName,
    sanitizeUrlParam,
    
    // Security functions
    detectMaliciousPatterns,
    validateUserAgent,
    checkInputRateLimit,
    validateContentSecurityPolicy,
    
    // Schemas for reference
    ValidationSchemas,
    
    // Utility functions
    escapeHtml: escapeHtml,
    
    // Constants for validation
    VALIDATION_MESSAGES: {
        REQUIRED: 'This field is required',
        INVALID_EMAIL: 'Please enter a valid email address',
        INVALID_PHONE: 'Please enter a valid phone number',
        TOO_SHORT: 'Input is too short',
        TOO_LONG: 'Input is too long',
        INVALID_FORMAT: 'Invalid format',
        MALICIOUS_CONTENT: 'Content contains potentially harmful data',
        RATE_LIMITED: 'Too many requests, please try again later'
    }
};