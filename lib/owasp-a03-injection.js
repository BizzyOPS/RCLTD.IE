/**
 * OWASP A03: Injection Prevention
 * Robotics & Control Ltd - Enterprise Security Implementation
 * 
 * This module implements comprehensive injection prevention including:
 * - SQL injection prevention
 * - Command injection protection
 * - NoSQL injection prevention
 * - LDAP injection protection
 * - XPath injection prevention
 * - Template injection prevention
 */

const validator = require('validator');
const { sanitizeHtml, detectMaliciousPatterns } = require('./validation');

// ==================== INJECTION PREVENTION CONFIGURATION ====================

const INJECTION_CONFIG = {
    // SQL injection prevention
    sql: {
        enableParameterizedQueries: true,
        enableQueryWhitelist: true,
        enableInputSanitization: true,
        maxQueryLength: 5000,
        blockedKeywords: [
            'EXEC', 'EXECUTE', 'SP_', 'XP_', 'OPENROWSET', 'OPENQUERY',
            'OPENDATASOURCE', 'BULK', 'READTEXT', 'WRITETEXT', 'UPDATETEXT',
            'BACKUP', 'RESTORE', 'SHUTDOWN', 'RECONFIGURE'
        ],
        dangerousPatterns: [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b.*[;'])/gi,
            /(UNION\s+SELECT)/gi,
            /(\b(OR|AND)\s+[\d\w]+\s*=\s*[\d\w]+)/gi,
            /(--|\/\*|\*\/)/g,
            /(\b(CAST|CONVERT|SUBSTRING)\s*\()/gi,
            /('.*OR.*'.*=.*')/gi
        ]
    },
    
    // Command injection prevention
    command: {
        enableCommandValidation: true,
        enablePathValidation: true,
        allowedCommands: [], // Whitelist approach
        blockedCommands: [
            'rm', 'del', 'format', 'fdisk', 'mkfs', 'dd',
            'nc', 'netcat', 'telnet', 'ssh', 'ftp', 'wget', 'curl',
            'python', 'perl', 'ruby', 'php', 'bash', 'sh', 'cmd',
            'powershell', 'pwsh', 'node', 'java'
        ],
        dangerousChars: ['|', '&', ';', '`', '$', '(', ')', '<', '>', '{', '}'],
        maxCommandLength: 1000
    },
    
    // NoSQL injection prevention
    nosql: {
        enableObjectValidation: true,
        enableTypeChecking: true,
        blockedOperators: [
            '$where', '$regex', '$ne', '$nin', '$gt', '$gte', '$lt', '$lte',
            '$exists', '$type', '$mod', '$all', '$size', '$elemMatch'
        ],
        maxDepth: 5,
        maxKeys: 50
    },
    
    // LDAP injection prevention
    ldap: {
        enableFilterValidation: true,
        enableDnValidation: true,
        dangerousChars: ['*', '(', ')', '\\', '/', '+', '"', "'", '<', '>', ';', '=', ','],
        maxFilterLength: 1000
    },
    
    // XPath injection prevention
    xpath: {
        enableExpressionValidation: true,
        blockedFunctions: [
            'document', 'system-property', 'current', 'generate-id',
            'unparsed-entity-uri', 'key', 'format-number'
        ],
        dangerousPatterns: [
            /(\[.*or.*\])/gi,
            /(\[.*and.*\])/gi,
            /('.*or.*')/gi,
            /(".*or.*")/gi
        ]
    },
    
    // Template injection prevention
    template: {
        enableTemplateValidation: true,
        blockedPatterns: [
            /\{\{.*\}\}/g,        // Handlebars/Mustache
            /\<%.*%\>/g,          // EJS/ERB
            /\{%.*%\}/g,          // Jinja2/Twig
            /\$\{.*\}/g,          // JSP EL
            /#\{.*\}/g,           // Spring EL
            /@\{.*\}/g            // Thymeleaf
        ]
    },
    
    // Input validation
    validation: {
        maxInputLength: 10000,
        enableStrictValidation: true,
        enableContentTypeValidation: true,
        enableEncodingValidation: true
    }
};

// ==================== INJECTION PREVENTION CLASS ====================

class InjectionPrevention {
    constructor(config = INJECTION_CONFIG) {
        this.config = config;
        this.parameterizedQueries = new Map();
        this.queryWhitelist = new Set();
        this.violationLog = [];
        
        // Initialize system
        this.initialize();
    }

    /**
     * Initialize injection prevention system
     */
    async initialize() {
        try {
            // Initialize query whitelist with common safe queries
            this.initializeQueryWhitelist();
            
            // Set up violation monitoring
            this.startViolationMonitoring();
            
            console.log('[OWASP-A03] Injection Prevention initialized');
            
            return Promise.resolve();
            
        } catch (error) {
            console.error('[OWASP-A03] Failed to initialize injection prevention:', error);
            throw error;
        }
    }

    /**
     * Middleware for injection prevention
     */
    middleware() {
        return (req, res, next) => {
            try {
                // Add injection prevention methods to request
                req.injectionPrevention = {
                    validateSqlInput: this.validateSqlInput.bind(this),
                    validateCommandInput: this.validateCommandInput.bind(this),
                    validateNoSqlInput: this.validateNoSqlInput.bind(this),
                    validateLdapInput: this.validateLdapInput.bind(this),
                    validateXPathInput: this.validateXPathInput.bind(this),
                    validateTemplateInput: this.validateTemplateInput.bind(this),
                    sanitizeInput: this.sanitizeInput.bind(this),
                    createParameterizedQuery: this.createParameterizedQuery.bind(this)
                };
                
                // Validate all inputs in request
                const validationResult = this.validateRequestInputs(req);
                
                if (!validationResult.isValid) {
                    this.logViolation('REQUEST_VALIDATION', req, validationResult.violations);
                    
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid input detected',
                        code: 'INJECTION_ATTEMPT',
                        timestamp: new Date().toISOString()
                    });
                }
                
                next();
                
            } catch (error) {
                console.error('[OWASP-A03] Injection prevention middleware error:', error);
                next();
            }
        };
    }

    // ==================== SQL INJECTION PREVENTION ====================

    /**
     * Validate SQL input for injection attempts
     */
    validateSqlInput(input, context = {}) {
        try {
            const violations = [];
            
            if (!input || typeof input !== 'string') {
                return { isValid: true, violations: [] };
            }
            
            // Check input length
            if (input.length > this.config.sql.maxQueryLength) {
                violations.push(`SQL input exceeds maximum length (${this.config.sql.maxQueryLength})`);
            }
            
            // Check for blocked keywords
            const inputUpper = input.toUpperCase();
            for (const keyword of this.config.sql.blockedKeywords) {
                if (inputUpper.includes(keyword)) {
                    violations.push(`Blocked SQL keyword detected: ${keyword}`);
                }
            }
            
            // Check for dangerous patterns
            for (const pattern of this.config.sql.dangerousPatterns) {
                if (pattern.test(input)) {
                    violations.push(`Dangerous SQL pattern detected: ${pattern.source}`);
                }
            }
            
            // Check for common SQL injection signatures
            const injectionSignatures = [
                /'.*OR.*'.*=.*'/gi,        // Classic OR injection
                /1=1/gi,                   // Classic tautology
                /UNION.*SELECT/gi,         // Union-based injection
                /;.*DROP/gi,               // Command chaining
                /\/\*.*\*\//g,             // SQL comments
                /--.*$/gm,                 // SQL line comments
                /\bEXEC\s*\(/gi,          // Stored procedure execution
                /\bXP_/gi,                 // Extended stored procedures
                /\bSP_/gi,                 // System stored procedures
                /\bOPENROWSET/gi,         // OPENROWSET function
                /\bSHUTDOWN/gi,           // Database shutdown
                /\bBACKUP/gi,             // Database backup
                /\bRESTORE/gi             // Database restore
            ];
            
            for (const signature of injectionSignatures) {
                if (signature.test(input)) {
                    violations.push(`SQL injection signature detected: ${signature.source}`);
                }
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations,
                sanitized: this.sanitizeSqlInput(input)
            };
            
        } catch (error) {
            console.error('[OWASP-A03] SQL input validation failed:', error);
            return { isValid: false, violations: ['SQL validation error'] };
        }
    }

    /**
     * Sanitize SQL input
     */
    sanitizeSqlInput(input) {
        if (!input || typeof input !== 'string') return '';
        
        return input
            // Remove SQL comments
            .replace(/--.*$/gm, '')
            .replace(/\/\*.*?\*\//g, '')
            // Escape single quotes
            .replace(/'/g, "''")
            // Remove null bytes
            .replace(/\0/g, '')
            // Limit dangerous characters
            .replace(/[;\\]/g, '')
            .trim();
    }

    /**
     * Create parameterized query template
     */
    createParameterizedQuery(queryTemplate, parameters = {}) {
        try {
            // Validate query template
            if (!queryTemplate || typeof queryTemplate !== 'string') {
                throw new Error('Invalid query template');
            }
            
            // Check if query is in whitelist
            if (this.config.sql.enableQueryWhitelist && !this.isQueryWhitelisted(queryTemplate)) {
                throw new Error('Query not in approved whitelist');
            }
            
            // Validate all parameters
            for (const [key, value] of Object.entries(parameters)) {
                const validation = this.validateSqlInput(value, { parameter: true });
                if (!validation.isValid) {
                    throw new Error(`Parameter ${key} failed validation: ${validation.violations.join(', ')}`);
                }
                parameters[key] = validation.sanitized;
            }
            
            // Store parameterized query for audit
            const queryId = this.generateQueryId();
            this.parameterizedQueries.set(queryId, {
                template: queryTemplate,
                parameters: parameters,
                timestamp: new Date().toISOString()
            });
            
            return {
                queryId: queryId,
                template: queryTemplate,
                parameters: parameters
            };
            
        } catch (error) {
            console.error('[OWASP-A03] Parameterized query creation failed:', error);
            throw error;
        }
    }

    /**
     * Check if query is whitelisted
     */
    isQueryWhitelisted(query) {
        const normalizedQuery = query.replace(/\s+/g, ' ').trim().toUpperCase();
        return this.queryWhitelist.has(normalizedQuery);
    }

    /**
     * Add query to whitelist
     */
    addToQueryWhitelist(query) {
        const normalizedQuery = query.replace(/\s+/g, ' ').trim().toUpperCase();
        this.queryWhitelist.add(normalizedQuery);
    }

    // ==================== COMMAND INJECTION PREVENTION ====================

    /**
     * Validate command input for injection attempts
     */
    validateCommandInput(input, context = {}) {
        try {
            const violations = [];
            
            if (!input || typeof input !== 'string') {
                return { isValid: true, violations: [] };
            }
            
            // Check input length
            if (input.length > this.config.command.maxCommandLength) {
                violations.push(`Command input exceeds maximum length (${this.config.command.maxCommandLength})`);
            }
            
            // Check for dangerous characters
            for (const char of this.config.command.dangerousChars) {
                if (input.includes(char)) {
                    violations.push(`Dangerous command character detected: ${char}`);
                }
            }
            
            // Check for blocked commands
            const inputLower = input.toLowerCase();
            for (const command of this.config.command.blockedCommands) {
                if (inputLower.includes(command)) {
                    violations.push(`Blocked command detected: ${command}`);
                }
            }
            
            // Check for command injection patterns
            const injectionPatterns = [
                /[;&|`$()]/g,              // Command separators and substitution
                /\.\.\//g,                 // Path traversal
                /\s*(rm|del|format)\s+/gi, // Destructive commands
                /\s*(wget|curl)\s+/gi,     // Network commands
                /\s*(nc|netcat)\s+/gi,     // Network tools
                /\s*(bash|sh|cmd)\s+/gi,   // Shell invocation
                /\$\{.*\}/g,               // Variable substitution
                /`.*`/g,                   // Command substitution
                /\$\(.*\)/g                // Command substitution
            ];
            
            for (const pattern of injectionPatterns) {
                if (pattern.test(input)) {
                    violations.push(`Command injection pattern detected: ${pattern.source}`);
                }
            }
            
            // If whitelist is enabled, check against allowed commands
            if (this.config.command.allowedCommands.length > 0) {
                const isAllowed = this.config.command.allowedCommands.some(cmd => 
                    inputLower.startsWith(cmd.toLowerCase())
                );
                
                if (!isAllowed) {
                    violations.push('Command not in allowed whitelist');
                }
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations,
                sanitized: this.sanitizeCommandInput(input)
            };
            
        } catch (error) {
            console.error('[OWASP-A03] Command input validation failed:', error);
            return { isValid: false, violations: ['Command validation error'] };
        }
    }

    /**
     * Sanitize command input
     */
    sanitizeCommandInput(input) {
        if (!input || typeof input !== 'string') return '';
        
        return input
            // Remove dangerous characters
            .replace(/[;&|`$()]/g, '')
            // Remove path traversal attempts
            .replace(/\.\.\//g, '')
            // Remove variable substitution
            .replace(/\$\{.*?\}/g, '')
            .replace(/\$\(.*?\)/g, '')
            // Remove command substitution
            .replace(/`.*?`/g, '')
            .trim();
    }

    // ==================== NOSQL INJECTION PREVENTION ====================

    /**
     * Validate NoSQL input for injection attempts
     */
    validateNoSqlInput(input, context = {}) {
        try {
            const violations = [];
            
            if (input === null || input === undefined) {
                return { isValid: true, violations: [] };
            }
            
            // Validate object structure if input is an object
            if (typeof input === 'object') {
                const objectValidation = this.validateNoSqlObject(input, 0);
                if (!objectValidation.isValid) {
                    violations.push(...objectValidation.violations);
                }
            }
            
            // Validate string inputs
            if (typeof input === 'string') {
                // Check for JavaScript code injection
                const jsPatterns = [
                    /function\s*\(/gi,
                    /=>\s*{/gi,
                    /eval\s*\(/gi,
                    /setTimeout\s*\(/gi,
                    /setInterval\s*\(/gi,
                    /new\s+Function/gi,
                    /constructor/gi
                ];
                
                for (const pattern of jsPatterns) {
                    if (pattern.test(input)) {
                        violations.push(`NoSQL JavaScript injection pattern detected: ${pattern.source}`);
                    }
                }
                
                // Check for regex injection
                if (input.includes('$regex') || input.includes('$where')) {
                    violations.push('NoSQL regex/where clause injection detected');
                }
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations,
                sanitized: this.sanitizeNoSqlInput(input)
            };
            
        } catch (error) {
            console.error('[OWASP-A03] NoSQL input validation failed:', error);
            return { isValid: false, violations: ['NoSQL validation error'] };
        }
    }

    /**
     * Validate NoSQL object structure
     */
    validateNoSqlObject(obj, depth = 0) {
        const violations = [];
        
        // Check maximum depth
        if (depth > this.config.nosql.maxDepth) {
            violations.push(`NoSQL object exceeds maximum depth (${this.config.nosql.maxDepth})`);
            return { isValid: false, violations };
        }
        
        // Check number of keys
        const keys = Object.keys(obj);
        if (keys.length > this.config.nosql.maxKeys) {
            violations.push(`NoSQL object exceeds maximum keys (${this.config.nosql.maxKeys})`);
        }
        
        // Check for blocked operators
        for (const key of keys) {
            if (this.config.nosql.blockedOperators.includes(key)) {
                violations.push(`Blocked NoSQL operator detected: ${key}`);
            }
            
            // Recursively validate nested objects
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                const nestedValidation = this.validateNoSqlObject(obj[key], depth + 1);
                if (!nestedValidation.isValid) {
                    violations.push(...nestedValidation.violations);
                }
            }
        }
        
        return {
            isValid: violations.length === 0,
            violations: violations
        };
    }

    /**
     * Sanitize NoSQL input
     */
    sanitizeNoSqlInput(input) {
        if (input === null || input === undefined) return input;
        
        if (typeof input === 'string') {
            return input
                .replace(/function\s*\(/gi, '')
                .replace(/eval\s*\(/gi, '')
                .replace(/constructor/gi, '')
                .replace(/\$where/gi, '')
                .replace(/\$regex/gi, '');
        }
        
        if (typeof input === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(input)) {
                // Skip blocked operators
                if (!this.config.nosql.blockedOperators.includes(key)) {
                    sanitized[key] = this.sanitizeNoSqlInput(value);
                }
            }
            return sanitized;
        }
        
        return input;
    }

    // ==================== LDAP INJECTION PREVENTION ====================

    /**
     * Validate LDAP input for injection attempts
     */
    validateLdapInput(input, context = {}) {
        try {
            const violations = [];
            
            if (!input || typeof input !== 'string') {
                return { isValid: true, violations: [] };
            }
            
            // Check input length
            if (input.length > this.config.ldap.maxFilterLength) {
                violations.push(`LDAP input exceeds maximum length (${this.config.ldap.maxFilterLength})`);
            }
            
            // Check for dangerous characters
            for (const char of this.config.ldap.dangerousChars) {
                if (input.includes(char)) {
                    violations.push(`Dangerous LDAP character detected: ${char}`);
                }
            }
            
            // Check for LDAP injection patterns
            const injectionPatterns = [
                /\(\|/g,                   // OR operator
                /\(&/g,                    // AND operator
                /\(\!/g,                   // NOT operator
                /\*\)/g,                   // Wildcard
                /\)\(/g,                   // Filter chaining
                /\(\*\*\)/g,              // Double wildcard
                /\(\w*=\*\)/g             // Attribute equals wildcard
            ];
            
            for (const pattern of injectionPatterns) {
                if (pattern.test(input)) {
                    violations.push(`LDAP injection pattern detected: ${pattern.source}`);
                }
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations,
                sanitized: this.sanitizeLdapInput(input)
            };
            
        } catch (error) {
            console.error('[OWASP-A03] LDAP input validation failed:', error);
            return { isValid: false, violations: ['LDAP validation error'] };
        }
    }

    /**
     * Sanitize LDAP input
     */
    sanitizeLdapInput(input) {
        if (!input || typeof input !== 'string') return '';
        
        // Escape LDAP special characters
        const escapeMap = {
            '*': '\\2a',
            '(': '\\28',
            ')': '\\29',
            '\\': '\\5c',
            '/': '\\2f',
            '+': '\\2b',
            '"': '\\22',
            "'": '\\27',
            '<': '\\3c',
            '>': '\\3e',
            ';': '\\3b',
            '=': '\\3d',
            ',': '\\2c'
        };
        
        return input.replace(/[*()\\/+"'<>;=,]/g, char => escapeMap[char] || char);
    }

    // ==================== XPATH INJECTION PREVENTION ====================

    /**
     * Validate XPath input for injection attempts
     */
    validateXPathInput(input, context = {}) {
        try {
            const violations = [];
            
            if (!input || typeof input !== 'string') {
                return { isValid: true, violations: [] };
            }
            
            // Check for blocked functions
            const inputLower = input.toLowerCase();
            for (const func of this.config.xpath.blockedFunctions) {
                if (inputLower.includes(func)) {
                    violations.push(`Blocked XPath function detected: ${func}`);
                }
            }
            
            // Check for dangerous patterns
            for (const pattern of this.config.xpath.dangerousPatterns) {
                if (pattern.test(input)) {
                    violations.push(`XPath injection pattern detected: ${pattern.source}`);
                }
            }
            
            // Check for XPath injection signatures
            const injectionSignatures = [
                /'\s+or\s+'/gi,           // OR injection
                /"\s+or\s+"/gi,           // OR injection with double quotes
                /\[\s*\]/g,               // Empty predicates
                /\/\*.*\*\//g,            // XPath comments
                /\[.*=.*\]/g,             // Predicate injection
                /ancestor::/gi,           // Axis navigation
                /descendant::/gi,         // Axis navigation
                /preceding::/gi,          // Axis navigation
                /following::/gi           // Axis navigation
            ];
            
            for (const signature of injectionSignatures) {
                if (signature.test(input)) {
                    violations.push(`XPath injection signature detected: ${signature.source}`);
                }
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations,
                sanitized: this.sanitizeXPathInput(input)
            };
            
        } catch (error) {
            console.error('[OWASP-A03] XPath input validation failed:', error);
            return { isValid: false, violations: ['XPath validation error'] };
        }
    }

    /**
     * Sanitize XPath input
     */
    sanitizeXPathInput(input) {
        if (!input || typeof input !== 'string') return '';
        
        return input
            // Escape quotes
            .replace(/'/g, "&apos;")
            .replace(/"/g, "&quot;")
            // Remove dangerous operators
            .replace(/\s+or\s+/gi, '')
            .replace(/\s+and\s+/gi, '')
            // Remove axis navigation
            .replace(/ancestor::/gi, '')
            .replace(/descendant::/gi, '')
            .replace(/preceding::/gi, '')
            .replace(/following::/gi, '')
            .trim();
    }

    // ==================== TEMPLATE INJECTION PREVENTION ====================

    /**
     * Validate template input for injection attempts
     */
    validateTemplateInput(input, context = {}) {
        try {
            const violations = [];
            
            if (!input || typeof input !== 'string') {
                return { isValid: true, violations: [] };
            }
            
            // Check for template injection patterns
            for (const pattern of this.config.template.blockedPatterns) {
                if (pattern.test(input)) {
                    violations.push(`Template injection pattern detected: ${pattern.source}`);
                }
            }
            
            // Check for server-side template injection signatures
            const injectionSignatures = [
                /\{\{.*\}\}/g,            // Handlebars/Mustache
                /\<%.*%\>/g,              // EJS/ERB
                /\{%.*%\}/g,              // Jinja2/Twig
                /\$\{.*\}/g,              // JSP EL/JavaScript template literals
                /#\{.*\}/g,               // Spring EL/Ruby interpolation
                /@\{.*\}/g,               // Thymeleaf
                /\{\{.*\|.*\}\}/g,        // Template filters
                /\{% *for.*%\}/gi,        // Template loops
                /\{% *if.*%\}/gi,         // Template conditionals
                /__.*__/g,                // Python special methods
                /\[\[.*\]\]/g             // Angular-like templates
            ];
            
            for (const signature of injectionSignatures) {
                if (signature.test(input)) {
                    violations.push(`Template injection signature detected: ${signature.source}`);
                }
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations,
                sanitized: this.sanitizeTemplateInput(input)
            };
            
        } catch (error) {
            console.error('[OWASP-A03] Template input validation failed:', error);
            return { isValid: false, violations: ['Template validation error'] };
        }
    }

    /**
     * Sanitize template input
     */
    sanitizeTemplateInput(input) {
        if (!input || typeof input !== 'string') return '';
        
        return input
            // Remove template syntax
            .replace(/\{\{.*?\}\}/g, '')
            .replace(/\<%.*?%\>/g, '')
            .replace(/\{%.*?%\}/g, '')
            .replace(/\$\{.*?\}/g, '')
            .replace(/#\{.*?\}/g, '')
            .replace(/@\{.*?\}/g, '')
            .replace(/\[\[.*?\]\]/g, '')
            .trim();
    }

    // ==================== GENERAL INPUT SANITIZATION ====================

    /**
     * Comprehensive input sanitization
     */
    sanitizeInput(input, options = {}) {
        try {
            if (input === null || input === undefined) return input;
            
            const config = { ...this.config.validation, ...options };
            
            if (typeof input === 'string') {
                let sanitized = input;
                
                // Length check
                if (sanitized.length > config.maxInputLength) {
                    sanitized = sanitized.substring(0, config.maxInputLength);
                }
                
                // Apply context-specific sanitization
                if (config.context === 'sql') {
                    sanitized = this.sanitizeSqlInput(sanitized);
                } else if (config.context === 'command') {
                    sanitized = this.sanitizeCommandInput(sanitized);
                } else if (config.context === 'ldap') {
                    sanitized = this.sanitizeLdapInput(sanitized);
                } else if (config.context === 'xpath') {
                    sanitized = this.sanitizeXPathInput(sanitized);
                } else if (config.context === 'template') {
                    sanitized = this.sanitizeTemplateInput(sanitized);
                } else {
                    // General HTML/XSS sanitization
                    sanitized = sanitizeHtml(sanitized, { strictMode: true });
                }
                
                return sanitized;
            }
            
            if (typeof input === 'object') {
                if (config.context === 'nosql') {
                    return this.sanitizeNoSqlInput(input);
                }
                
                // Recursively sanitize object properties
                const sanitized = {};
                for (const [key, value] of Object.entries(input)) {
                    sanitized[key] = this.sanitizeInput(value, config);
                }
                return sanitized;
            }
            
            return input;
            
        } catch (error) {
            console.error('[OWASP-A03] Input sanitization failed:', error);
            return '';
        }
    }

    /**
     * Validate all inputs in a request
     */
    validateRequestInputs(req) {
        try {
            const violations = [];
            
            // Validate query parameters
            if (req.query && typeof req.query === 'object') {
                for (const [key, value] of Object.entries(req.query)) {
                    const validation = this.validateGenericInput(value, { source: `query.${key}` });
                    if (!validation.isValid) {
                        violations.push(...validation.violations.map(v => `Query ${key}: ${v}`));
                    }
                }
            }
            
            // Validate body parameters
            if (req.body && typeof req.body === 'object') {
                for (const [key, value] of Object.entries(req.body)) {
                    const validation = this.validateGenericInput(value, { source: `body.${key}` });
                    if (!validation.isValid) {
                        violations.push(...validation.violations.map(v => `Body ${key}: ${v}`));
                    }
                }
            }
            
            // Validate headers (selective)
            const headersToValidate = ['x-forwarded-for', 'referer', 'user-agent'];
            for (const header of headersToValidate) {
                if (req.headers[header]) {
                    const validation = this.validateGenericInput(req.headers[header], { source: `header.${header}` });
                    if (!validation.isValid) {
                        violations.push(...validation.violations.map(v => `Header ${header}: ${v}`));
                    }
                }
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations
            };
            
        } catch (error) {
            console.error('[OWASP-A03] Request input validation failed:', error);
            return { isValid: false, violations: ['Request validation error'] };
        }
    }

    /**
     * Generic input validation
     */
    validateGenericInput(input, context = {}) {
        try {
            const violations = [];
            
            if (input === null || input === undefined) {
                return { isValid: true, violations: [] };
            }
            
            if (typeof input === 'string') {
                // Check for general malicious patterns
                if (detectMaliciousPatterns(input)) {
                    violations.push('Malicious pattern detected');
                }
                
                // Apply all injection checks
                const sqlCheck = this.validateSqlInput(input);
                if (!sqlCheck.isValid) {
                    violations.push(...sqlCheck.violations);
                }
                
                const commandCheck = this.validateCommandInput(input);
                if (!commandCheck.isValid) {
                    violations.push(...commandCheck.violations);
                }
                
                const templateCheck = this.validateTemplateInput(input);
                if (!templateCheck.isValid) {
                    violations.push(...templateCheck.violations);
                }
            }
            
            if (typeof input === 'object') {
                const nosqlCheck = this.validateNoSqlInput(input);
                if (!nosqlCheck.isValid) {
                    violations.push(...nosqlCheck.violations);
                }
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations
            };
            
        } catch (error) {
            console.error('[OWASP-A03] Generic input validation failed:', error);
            return { isValid: false, violations: ['Generic validation error'] };
        }
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Initialize query whitelist with common safe queries
     */
    initializeQueryWhitelist() {
        const safeQueries = [
            'SELECT * FROM users WHERE id = ?',
            'SELECT * FROM products WHERE category = ?',
            'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
            'UPDATE users SET last_login = ? WHERE id = ?',
            'SELECT COUNT(*) FROM orders WHERE user_id = ?'
        ];
        
        safeQueries.forEach(query => this.addToQueryWhitelist(query));
    }

    /**
     * Generate unique query ID
     */
    generateQueryId() {
        return `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Log injection violation
     */
    logViolation(type, req, violations) {
        const violation = {
            type: type,
            timestamp: new Date().toISOString(),
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            url: req.url,
            method: req.method,
            violations: violations,
            headers: req.headers,
            body: req.body,
            query: req.query
        };
        
        this.violationLog.push(violation);
        
        // Keep only last 1000 violations
        if (this.violationLog.length > 1000) {
            this.violationLog = this.violationLog.slice(-1000);
        }
        
        console.warn(`[OWASP-A03] Injection attempt detected:`, violation);
    }

    /**
     * Start violation monitoring
     */
    startViolationMonitoring() {
        // Clean up old violations every hour
        setInterval(() => {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            this.violationLog = this.violationLog.filter(v => new Date(v.timestamp) > oneHourAgo);
        }, 60 * 60 * 1000);
    }

    // ==================== PUBLIC API ====================

    /**
     * Get injection prevention metrics
     */
    getInjectionMetrics() {
        return {
            totalViolations: this.violationLog.length,
            recentViolations: this.violationLog.filter(v => 
                new Date(v.timestamp) > new Date(Date.now() - 60 * 60 * 1000)
            ).length,
            whitelistedQueries: this.queryWhitelist.size,
            parameterizedQueries: this.parameterizedQueries.size,
            violationTypes: this.getViolationTypeStats()
        };
    }

    /**
     * Get violation type statistics
     */
    getViolationTypeStats() {
        const stats = {};
        this.violationLog.forEach(violation => {
            stats[violation.type] = (stats[violation.type] || 0) + 1;
        });
        return stats;
    }

    /**
     * Get recent violations
     */
    getRecentViolations(limit = 50) {
        return this.violationLog
            .slice(-limit)
            .reverse();
    }

    /**
     * Get injection prevention configuration
     */
    getConfig() {
        return { ...this.config };
    }
}

module.exports = {
    InjectionPreventionManager: InjectionPrevention,
    INJECTION_CONFIG
};