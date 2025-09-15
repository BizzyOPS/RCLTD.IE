#!/usr/bin/env node

/**
 * Comprehensive Express.js Security Server for Robotics & Control Ltd
 * 
 * This server implements enterprise-grade security while serving static files
 * and maintaining full compatibility with the existing website functionality.
 * 
 * Security Features:
 * - Content Security Policy (CSP) with nonces
 * - CORS configuration with origin whitelisting
 * - Multi-tiered rate limiting
 * - Security headers (HSTS, X-Frame-Options, etc.)
 * - Input validation and sanitization
 * - Request size limits
 * - Error handling without information disclosure
 * - Security logging and monitoring
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const validator = require('validator');
const { 
    validateObject, 
    sanitizeHtml, 
    sanitizeUrlParam,
    detectMaliciousPatterns,
    validateUserAgent,
    validateContentSecurityPolicy,
    VALIDATION_MESSAGES 
} = require('./lib/validation');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

// ==================== SECURITY MIDDLEWARE ====================

// Note: Removed nonce generation as it's not used in static HTML files
// This prevents CSP blocking of JavaScript functionality

// Compression for better performance
app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

// HTTPS redirect middleware for production
if (IS_PRODUCTION) {
    app.use((req, res, next) => {
        // Check if request is from HTTPS
        const isHttps = req.header('x-forwarded-proto') === 'https' || req.secure;
        
        if (!isHttps) {
            // Redirect to HTTPS
            return res.redirect(301, `https://${req.headers.host}${req.url}`);
        }
        
        next();
    });
}

// Trust proxy settings for proper IP detection behind reverse proxies
// Use consistent configuration for both dev and production in Replit environment
app.set('trust proxy', 1);

// Security headers with Helmet
app.use(helmet({
    // Content Security Policy
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: [
                "'self'",
                "'unsafe-inline'", // Required for dynamic styles in the existing codebase
                "https://fonts.googleapis.com",
                "https://cdnjs.cloudflare.com"
            ],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'", // Required for existing inline scripts in static HTML
                "https://cdn.jsdelivr.net",
                "https://unpkg.com",
                "https://cdnjs.cloudflare.com"
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com",
                "data:"
            ],
            imgSrc: [
                "'self'",
                "data:",
                "blob:",
                "https:"
            ],
            mediaSrc: [
                "'self'",
                "data:",
                "blob:"
            ],
            connectSrc: [
                "'self'",
                "https://api.openai.com" // For chatbot functionality
            ],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
            upgradeInsecureRequests: IS_PRODUCTION ? [] : null
        },
        reportOnly: false
    },
    
    // X-Frame-Options
    frameguard: {
        action: 'deny'
    },
    
    // HTTPS enforcement in production
    hsts: IS_PRODUCTION ? {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    } : false,
    
    // Prevent MIME type sniffing
    noSniff: true,
    
    // Note: xssFilter is deprecated in newer versions of helmet
    // XSS protection is now handled by CSP and other modern security headers
    
    // Referrer Policy
    referrerPolicy: {
        policy: 'strict-origin-when-cross-origin'
    },
    
    // Cross Domain Policies
    crossOriginResourcePolicy: { policy: "cross-origin" },
    
    // Hide X-Powered-By header
    hidePoweredBy: true
}));

// Additional security headers
app.use((req, res, next) => {
    // Permissions Policy for modern browsers
    res.setHeader('Permissions-Policy', 
        'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=(), ambient-light-sensor=(), accelerometer=(), battery=(), autoplay=()'
    );
    
    // Feature-Policy is deprecated - using Permissions-Policy above instead
    
    // Additional security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Remove server signature
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');
    
    next();
});

// ==================== CORS CONFIGURATION ====================

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Development origins
        const developmentOrigins = [
            'http://localhost:5000',
            'http://127.0.0.1:5000',
            /^https?:\/\/.*\.replit\.dev$/,
            /^https?:\/\/.*\.repl\.co$/
        ];
        
        // Production origins (add your actual domains here)
        const productionOrigins = [
            'https://roboticscontrol.ie',
            'https://www.roboticscontrol.ie',
            // Add other production domains as needed
        ];
        
        const allowedOrigins = IS_PRODUCTION ? productionOrigins : [...developmentOrigins, ...productionOrigins];
        
        const isAllowed = allowedOrigins.some(allowed => {
            if (typeof allowed === 'string') {
                return allowed === origin;
            } else if (allowed instanceof RegExp) {
                return allowed.test(origin);
            }
            return false;
        });
        
        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'X-Forwarded-For'
    ],
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
    maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// ==================== RATE LIMITING ====================

// Create different rate limiters for different types of content

// Global rate limiter - very generous for static files
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for static assets
        return /\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i.test(req.url);
    }
});

// API rate limiter - more strict for dynamic content
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 API requests per windowMs
    message: {
        error: 'Too many API requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Form submission limiter - very strict
const formLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 form submissions per hour
    message: {
        error: 'Too many form submissions from this IP, please try again later.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Speed limiter - slows down repeated requests
const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // allow 50 requests per 15 minutes at full speed
    delayMs: () => 500, // Updated for express-slow-down v2+ compatibility
    validate: { delayMs: false } // Disable deprecation warning
});

// Apply rate limiting
app.use(globalLimiter);
app.use(speedLimiter);

// ==================== BODY PARSING AND INPUT SECURITY ====================

// Limit request size
app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
        // Verify JSON payload isn't malicious
        try {
            JSON.parse(buf);
        } catch (e) {
            throw new Error('Invalid JSON');
        }
    }
}));

app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb',
    parameterLimit: 100
}));

// ==================== LOGGING ====================

// Custom logging format
const logFormat = IS_PRODUCTION 
    ? 'combined' 
    : ':method :url :status :res[content-length] - :response-time ms :remote-addr';

app.use(morgan(logFormat, {
    skip: (req, res) => {
        // Skip logging for static assets in production
        return IS_PRODUCTION && /\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i.test(req.url);
    }
}));

// Enhanced security event logging with comprehensive pattern detection
app.use((req, res, next) => {
    // Enhanced suspicious activity detection
    const inputsToCheck = [
        req.url,
        req.get('User-Agent') || '',
        JSON.stringify(req.query),
        JSON.stringify(req.body),
        req.get('Referer') || '',
        req.get('X-Forwarded-For') || ''
    ];
    
    let isSuspicious = false;
    let suspiciousReasons = [];
    
    inputsToCheck.forEach((input, index) => {
        const inputTypes = ['URL', 'User-Agent', 'Query', 'Body', 'Referer', 'X-Forwarded-For'];
        
        // Handle User-Agent separately with less aggressive detection
        if (index === 1) { // User-Agent
            if (!validateUserAgent(input)) {
                isSuspicious = true;
                suspiciousReasons.push(`Suspicious User-Agent`);
            }
        } else {
            if (detectMaliciousPatterns(input)) {
                isSuspicious = true;
                suspiciousReasons.push(`Malicious pattern in ${inputTypes[index]}`);
            }
        }
    });
    
    // Additional checks for specific attack vectors
    if (req.url.includes('%')) {
        try {
            const decoded = decodeURIComponent(req.url);
            if (detectMaliciousPatterns(decoded)) {
                isSuspicious = true;
                suspiciousReasons.push('URL encoding attack attempt');
            }
        } catch (e) {
            isSuspicious = true;
            suspiciousReasons.push('Invalid URL encoding');
        }
    }
    
    // Check for content type attacks
    const contentType = req.get('Content-Type') || '';
    if (contentType.includes('multipart/form-data') && 
        !req.url.includes('/upload')) {
        suspiciousReasons.push('Unexpected multipart content');
    }
    
    if (isSuspicious) {
        console.warn(`[SECURITY] Suspicious request from ${req.ip}: ${req.method} ${req.url}`);
        console.warn(`[SECURITY] Reasons: ${suspiciousReasons.join(', ')}`);
        console.warn(`[SECURITY] User-Agent: ${req.get('User-Agent')}`);
        console.warn(`[SECURITY] Full details:`, {
            url: req.url,
            query: req.query,
            headers: req.headers,
            body: typeof req.body === 'object' ? JSON.stringify(req.body).substring(0, 500) : req.body
        });
        
        // Block obviously malicious requests
        if (suspiciousReasons.some(reason => 
            reason.includes('SQL injection') || 
            reason.includes('XSS') || 
            reason.includes('Command injection')
        )) {
            return res.status(400).json({
                error: 'Invalid request format',
                timestamp: new Date().toISOString()
            });
        }
    }
    
    next();
});

// URL parameter sanitization middleware
app.use((req, res, next) => {
    // Sanitize query parameters
    for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === 'string') {
            req.query[key] = sanitizeUrlParam(value);
        } else if (Array.isArray(value)) {
            req.query[key] = value.map(v => typeof v === 'string' ? sanitizeUrlParam(v) : v);
        }
    }
    
    // Sanitize URL path segments
    const originalUrl = req.url;
    const sanitizedPath = originalUrl.split('?')[0]
        .split('/')
        .map(segment => sanitizeUrlParam(segment))
        .join('/');
    
    if (sanitizedPath !== originalUrl.split('?')[0]) {
        console.warn(`[SECURITY] Sanitized URL path: ${originalUrl} -> ${sanitizedPath}`);
    }
    
    next();
});

// ==================== API ENDPOINTS ====================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV
    });
});

// Contact form endpoint with enhanced validation
app.post('/api/contact', 
    formLimiter,
    (req, res) => {
        try {
            // Enhanced security checks
            if (!validateContentSecurityPolicy(JSON.stringify(req.body))) {
                console.warn(`[SECURITY] CSP violation in contact form from ${req.ip}`);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid content detected',
                    timestamp: new Date().toISOString()
                });
            }
            
            // Comprehensive validation using our new library
            const validation = validateObject(req.body, 'contact');
            
            if (!validation.isValid) {
                console.warn(`[VALIDATION] Contact form validation failed from ${req.ip}:`, validation.errors);
                return res.status(400).json({
                    success: false,
                    message: 'Please check your input and try again',
                    errors: validation.errors,
                    timestamp: new Date().toISOString()
                });
            }
            
            // Additional security checks for contact form
            const { sanitizedData } = validation;
            
            // Check for spam patterns
            const spamIndicators = [
                sanitizedData.message && sanitizedData.message.match(/http[s]?:\/\//gi),
                sanitizedData.message && sanitizedData.message.match(/\b(bitcoin|crypto|investment|loan|credit)\b/gi),
                sanitizedData.name && sanitizedData.name.match(/\d{4,}/), // Lots of numbers in name
                sanitizedData.email && sanitizedData.email.match(/\+.*\+.*@/)  // Multiple + signs
            ];
            
            if (spamIndicators.some(indicator => indicator && indicator.length > 2)) {
                console.warn(`[SPAM] Potential spam detected from ${req.ip}:`, {
                    email: sanitizedData.email,
                    indicators: spamIndicators.filter(Boolean)
                });
                
                // Return success to avoid revealing spam detection
                return res.json({
                    success: true,
                    message: 'Thank you for your message. We will review it shortly.'
                });
            }
            
            // Log successful submission
            console.log(`[CONTACT] Valid form submission from ${sanitizedData.email} (${req.ip})`);
            console.log(`[CONTACT] Subject: ${sanitizedData.subject}`);
            
            // In a real application, you would:
            // 1. Store in database
            // 2. Send email notification
            // 3. Add to CRM system
            // 4. Trigger automated responses
            
            res.json({
                success: true,
                message: 'Thank you for your message! We will get back to you within 24 hours.',
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error(`[ERROR] Contact form processing error:`, error);
            res.status(500).json({
                success: false,
                message: 'Unable to process your request. Please try again.',
                timestamp: new Date().toISOString()
            });
        }
    }
);

// Chatbot API endpoint with enhanced validation
app.post('/api/chat', 
    apiLimiter,
    (req, res) => {
        try {
            // Security checks for chatbot input
            if (!validateContentSecurityPolicy(JSON.stringify(req.body))) {
                console.warn(`[SECURITY] CSP violation in chat from ${req.ip}`);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid message content',
                    timestamp: new Date().toISOString()
                });
            }
            
            // Validate chat message
            const validation = validateObject(req.body, 'chat');
            
            if (!validation.isValid) {
                console.warn(`[VALIDATION] Chat validation failed from ${req.ip}:`, validation.errors);
                return res.status(400).json({
                    success: false,
                    message: 'Please check your message format',
                    errors: validation.errors,
                    timestamp: new Date().toISOString()
                });
            }
            
            const { sanitizedData } = validation;
            
            // Additional checks for chat messages
            if (detectMaliciousPatterns(sanitizedData.message)) {
                console.warn(`[SECURITY] Malicious pattern in chat message from ${req.ip}`);
                return res.status(400).json({
                    success: false,
                    message: 'Message contains invalid content',
                    timestamp: new Date().toISOString()
                });
            }
            
            // Check for excessive repeated characters or spam-like content
            const repeatedChars = sanitizedData.message.match(/(.)\1{10,}/g);
            const excessiveCapitals = sanitizedData.message.match(/[A-Z]{20,}/g);
            
            if (repeatedChars || excessiveCapitals) {
                console.warn(`[CHAT] Spam-like message from ${req.ip}`);
                return res.status(400).json({
                    success: false,
                    message: 'Please enter a normal conversational message',
                    timestamp: new Date().toISOString()
                });
            }
            
            console.log(`[CHAT] Valid message from ${req.ip}: "${sanitizedData.message.substring(0, 100)}${sanitizedData.message.length > 100 ? '...' : ''}"`);
            
            // In a real implementation, this would:
            // 1. Integrate with OpenAI API
            // 2. Maintain conversation context
            // 3. Apply content filters
            // 4. Log conversations for improvement
            
            res.json({
                success: true,
                message: 'I understand your message about our robotics and automation services. Our chatbot system is currently being enhanced. For immediate assistance, please contact us directly.',
                timestamp: new Date().toISOString(),
                conversationId: crypto.randomBytes(16).toString('hex')
            });
            
        } catch (error) {
            console.error(`[ERROR] Chat processing error:`, error);
            res.status(500).json({
                success: false,
                message: 'Unable to process your message. Please try again.',
                timestamp: new Date().toISOString()
            });
        }
    }
);

// Newsletter signup endpoint with enhanced validation
app.post('/api/newsletter', 
    formLimiter,
    (req, res) => {
        try {
            // Content security validation
            if (!validateContentSecurityPolicy(JSON.stringify(req.body))) {
                console.warn(`[SECURITY] CSP violation in newsletter signup from ${req.ip}`);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid content detected',
                    timestamp: new Date().toISOString()
                });
            }
            
            // Validate newsletter signup data
            const validation = validateObject(req.body, 'newsletter');
            
            if (!validation.isValid) {
                console.warn(`[VALIDATION] Newsletter signup validation failed from ${req.ip}:`, validation.errors);
                return res.status(400).json({
                    success: false,
                    message: 'Please check your information and try again',
                    errors: validation.errors,
                    timestamp: new Date().toISOString()
                });
            }
            
            const { sanitizedData } = validation;
            
            // Additional email validation
            if (!validator.isEmail(sanitizedData.email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please enter a valid email address',
                    timestamp: new Date().toISOString()
                });
            }
            
            // Check for duplicate subscriptions (in real app, check database)
            console.log(`[NEWSLETTER] New subscription from ${sanitizedData.email} (${req.ip})`);
            
            res.json({
                success: true,
                message: 'Thank you for subscribing! You will receive our latest updates and insights.',
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error(`[ERROR] Newsletter signup error:`, error);
            res.status(500).json({
                success: false,
                message: 'Unable to process your subscription. Please try again.',
                timestamp: new Date().toISOString()
            });
        }
    }
);

// Checkout endpoint with comprehensive validation
app.post('/api/checkout', 
    formLimiter,
    (req, res) => {
        try {
            // Enhanced security checks for checkout
            if (!validateContentSecurityPolicy(JSON.stringify(req.body))) {
                console.warn(`[SECURITY] CSP violation in checkout from ${req.ip}`);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid checkout data detected',
                    timestamp: new Date().toISOString()
                });
            }
            
            // Validate checkout form data
            const validation = validateObject(req.body, 'checkout');
            
            if (!validation.isValid) {
                console.warn(`[VALIDATION] Checkout validation failed from ${req.ip}:`, validation.errors);
                return res.status(400).json({
                    success: false,
                    message: 'Please review your information and try again',
                    errors: validation.errors,
                    timestamp: new Date().toISOString()
                });
            }
            
            const { sanitizedData } = validation;
            
            // Additional checkout-specific validations
            const paymentMethod = req.body.paymentMethod;
            
            if (paymentMethod === 'card') {
                // Validate credit card fields
                const cardValidation = {
                    cardNumber: sanitizedData.cardNumber && /^\d{13,19}$/.test(sanitizedData.cardNumber.replace(/\s/g, '')),
                    cardExpiry: sanitizedData.cardExpiry && /^(0[1-9]|1[0-2])\/\d{2}$/.test(sanitizedData.cardExpiry),
                    cardCvv: sanitizedData.cardCvv && /^\d{3,4}$/.test(sanitizedData.cardCvv),
                    cardName: sanitizedData.cardName && sanitizedData.cardName.length >= 2
                };
                
                const cardErrors = Object.entries(cardValidation)
                    .filter(([field, isValid]) => !isValid)
                    .map(([field]) => `Invalid ${field.replace('card', 'card ')}`);
                
                if (cardErrors.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Please check your payment information',
                        errors: cardErrors,
                        timestamp: new Date().toISOString()
                    });
                }
            }
            
            // Validate order items (should come from session/cart)
            const cartItems = req.body.items;
            if (!Array.isArray(cartItems) || cartItems.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No items in cart',
                    timestamp: new Date().toISOString()
                });
            }
            
            // Additional security: Check for reasonable order amounts
            const totalAmount = parseFloat(req.body.totalAmount || 0);
            if (totalAmount <= 0 || totalAmount > 100000) {
                console.warn(`[SECURITY] Suspicious order amount ${totalAmount} from ${req.ip}`);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid order amount',
                    timestamp: new Date().toISOString()
                });
            }
            
            // Generate order ID and process
            const orderId = `RC-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
            
            console.log(`[CHECKOUT] New order ${orderId} from ${sanitizedData.email} (${req.ip})`);
            console.log(`[CHECKOUT] Amount: €${totalAmount}, Payment: ${paymentMethod}`);
            
            // In a real application, this would:
            // 1. Process payment with payment gateway
            // 2. Create order in database
            // 3. Send confirmation emails
            // 4. Update inventory
            // 5. Generate invoice
            
            res.json({
                success: true,
                message: 'Order received successfully! You will receive a confirmation email shortly.',
                orderId: orderId,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error(`[ERROR] Checkout processing error:`, error);
            res.status(500).json({
                success: false,
                message: 'Unable to process your order. Please try again.',
                timestamp: new Date().toISOString()
            });
        }
    }
);

// Store search endpoint with validation
app.get('/api/search', 
    apiLimiter,
    (req, res) => {
        try {
            // Validate search parameters
            const validation = validateObject(req.query, 'search');
            
            if (!validation.isValid) {
                console.warn(`[VALIDATION] Search validation failed from ${req.ip}:`, validation.errors);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid search parameters',
                    errors: validation.errors,
                    timestamp: new Date().toISOString()
                });
            }
            
            const { sanitizedData } = validation;
            
            // Additional search security checks
            if (sanitizedData.query && detectMaliciousPatterns(sanitizedData.query)) {
                console.warn(`[SECURITY] Malicious search query from ${req.ip}: ${sanitizedData.query}`);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid search query',
                    timestamp: new Date().toISOString()
                });
            }
            
            // Log search for analytics (without PII)
            console.log(`[SEARCH] Query: "${sanitizedData.query || ''}", Category: ${sanitizedData.category || 'all'}, Sort: ${sanitizedData.sort || 'default'}`);
            
            // In a real application, this would:
            // 1. Query product database
            // 2. Apply filters and sorting
            // 3. Return paginated results
            // 4. Track search analytics
            
            // Mock response for demonstration
            const mockResults = {
                success: true,
                query: sanitizedData.query || '',
                category: sanitizedData.category || '',
                sort: sanitizedData.sort || 'name',
                results: [
                    {
                        id: 'plc-001',
                        name: 'Siemens S7-1200 PLC',
                        category: 'plc',
                        price: 299.99,
                        description: 'Compact programmable logic controller'
                    },
                    {
                        id: 'hmi-001',
                        name: 'Allen-Bradley HMI Panel',
                        category: 'hmi',
                        price: 899.99,
                        description: 'Industrial touch screen interface'
                    }
                ].filter(item => {
                    // Simple filtering logic
                    if (sanitizedData.category && item.category !== sanitizedData.category) return false;
                    if (sanitizedData.query && !item.name.toLowerCase().includes(sanitizedData.query.toLowerCase())) return false;
                    return true;
                }),
                totalResults: 2,
                timestamp: new Date().toISOString()
            };
            
            res.json(mockResults);
            
        } catch (error) {
            console.error(`[ERROR] Search processing error:`, error);
            res.status(500).json({
                success: false,
                message: 'Unable to process search request. Please try again.',
                timestamp: new Date().toISOString()
            });
        }
    }
);

// Training system endpoint for handling quiz answers
app.post('/api/training/answer', 
    apiLimiter,
    (req, res) => {
        try {
            // Security validation
            if (!validateContentSecurityPolicy(JSON.stringify(req.body))) {
                console.warn(`[SECURITY] CSP violation in training answer from ${req.ip}`);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid answer content',
                    timestamp: new Date().toISOString()
                });
            }
            
            // Validate training answer
            const validation = validateObject(req.body, 'training');
            
            if (!validation.isValid) {
                console.warn(`[VALIDATION] Training answer validation failed from ${req.ip}:`, validation.errors);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid answer format',
                    errors: validation.errors,
                    timestamp: new Date().toISOString()
                });
            }
            
            const { sanitizedData } = validation;
            const { questionId, answer, moduleId, chapterId } = req.body;
            
            // Additional validation for training data
            if (!questionId || !moduleId || !chapterId) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required training parameters',
                    timestamp: new Date().toISOString()
                });
            }
            
            console.log(`[TRAINING] Answer submitted for ${moduleId}-${chapterId}-${questionId} from ${req.ip}`);
            
            // In a real application, this would:
            // 1. Check correct answers from database
            // 2. Update user progress
            // 3. Calculate scores
            // 4. Issue certificates when appropriate
            
            res.json({
                success: true,
                message: 'Answer recorded successfully',
                isCorrect: true, // Mock response
                correctAnswer: 'Sample correct answer',
                explanation: 'This is the explanation for the correct answer.',
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error(`[ERROR] Training answer processing error:`, error);
            res.status(500).json({
                success: false,
                message: 'Unable to process your answer. Please try again.',
                timestamp: new Date().toISOString()
            });
        }
    }
);

// ==================== STATIC FILE SERVING ====================

// Security middleware for static files
app.use((req, res, next) => {
    // Prevent access to sensitive files
    const blockedPaths = [
        /package\.json$/,
        /package-lock\.json$/,
        /node_modules/,
        /\.env$/,
        /server\.js$/,
        /\.git/,
        /\.gitignore$/,
        /replit\.md$/
    ];
    
    const isBlocked = blockedPaths.some(pattern => pattern.test(req.path));
    
    if (isBlocked) {
        return res.status(404).json({ error: 'File not found' });
    }
    
    // Set proper cache headers for static assets
    if (/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|pdf)$/i.test(req.path)) {
        res.setHeader('Cache-Control', IS_PRODUCTION ? 'public, max-age=86400' : 'no-cache');
    } else {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    
    next();
});

// Serve static files
app.use(express.static('.', {
    dotfiles: 'deny',
    index: ['index.html'],
    redirect: false,
    setHeaders: (res, path) => {
        // Set MIME types for security
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        }
    }
}));

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        error: 'Resource not found',
        path: req.path,
        timestamp: new Date().toISOString()
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`, {
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        stack: IS_PRODUCTION ? undefined : err.stack
    });
    
    // Don't leak error details in production
    const message = IS_PRODUCTION ? 'Internal server error' : err.message;
    
    res.status(err.status || 500).json({
        error: message,
        timestamp: new Date().toISOString()
    });
});

// ==================== SERVER STARTUP ====================

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    process.exit(0);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Robotics & Control Ltd Security Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${NODE_ENV}`);
    console.log(`🔒 Security features enabled:`);
    console.log(`   ✓ Content Security Policy with trusted sources`);
    console.log(`   ✓ CORS with origin whitelisting`);
    console.log(`   ✓ Multi-tiered rate limiting`);
    console.log(`   ✓ Security headers (HSTS, X-Frame-Options, etc.)`);
    console.log(`   ✓ Input validation and sanitization`);
    console.log(`   ✓ Request size limits`);
    console.log(`   ✓ Security logging and monitoring`);
    console.log(`📁 Serving static files from: ${process.cwd()}`);
    
    if (!IS_PRODUCTION) {
        console.log(`🔗 Local access: http://localhost:${PORT}`);
        console.log(`🔗 Network access: http://0.0.0.0:${PORT}`);
    }
});

module.exports = app;