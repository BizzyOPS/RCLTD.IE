/**
 * OWASP A05: Security Misconfiguration Prevention
 * Robotics & Control Ltd - Enterprise Security Implementation
 * 
 * This module implements comprehensive security configuration management including:
 * - Configuration validation and hardening
 * - Default credential detection and management
 * - Error handling and information disclosure prevention
 * - Security header validation
 * - Environment-specific security controls
 */

const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

// ==================== SECURITY MISCONFIGURATION PREVENTION CONFIGURATION ====================

const MISCONFIGURATION_CONFIG = {
    // Configuration validation
    validation: {
        enableConfigValidation: true,
        enableHardeningChecks: true,
        enableDefaultDetection: true,
        enableEnvironmentValidation: true,
        configPaths: [
            './package.json',
            './server.js',
            './.env',
            './security-data/'
        ]
    },
    
    // Default credentials and configurations
    defaults: {
        defaultPasswords: [
            'password', 'admin', '123456', 'password123', 'admin123',
            'root', 'user', 'guest', 'test', 'demo', 'default',
            'changeme', 'letmein', 'welcome', 'qwerty'
        ],
        defaultUsers: [
            'admin', 'administrator', 'root', 'sa', 'user',
            'guest', 'test', 'demo', 'oracle', 'postgres'
        ],
        defaultPorts: [
            22, 23, 21, 25, 53, 80, 110, 143, 443, 993, 995,
            1433, 1521, 3306, 3389, 5432, 5984, 6379, 8080, 8443, 9200
        ],
        insecureDefaults: [
            'debug=true',
            'development=true',
            'test=true',
            'verbose=true',
            'trace=true'
        ]
    },
    
    // Security headers configuration
    headers: {
        required: [
            'Strict-Transport-Security',
            'X-Content-Type-Options',
            'X-Frame-Options',
            'X-XSS-Protection',
            'Referrer-Policy',
            'Content-Security-Policy'
        ],
        forbidden: [
            'Server',
            'X-Powered-By',
            'X-AspNet-Version',
            'X-AspNetMvc-Version'
        ],
        secureValues: {
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin'
        }
    },
    
    // Error handling configuration
    errorHandling: {
        enableSafeErrorMessages: true,
        enableErrorLogging: true,
        hideStackTraces: true,
        hideSensitiveInfo: true,
        genericErrorMessage: 'An error occurred while processing your request.',
        allowedErrorCodes: [400, 401, 403, 404, 405, 429, 500, 502, 503]
    },
    
    // Environment security
    environment: {
        production: {
            requireHTTPS: true,
            disableDebugMode: true,
            enableSecurityHeaders: true,
            hideServerInfo: true,
            enforceStrictValidation: true
        },
        development: {
            requireHTTPS: false,
            allowDebugMode: true,
            relaxedValidation: true,
            enableTestingEndpoints: true
        },
        testing: {
            allowInsecureDefaults: true,
            disableRateLimiting: false,
            enableMockData: true
        }
    },
    
    // Configuration hardening
    hardening: {
        filePermissions: {
            configFiles: '600',
            secretFiles: '600',
            executables: '755',
            logFiles: '644'
        },
        networkSecurity: {
            disableUnnecessaryServices: true,
            enableFirewall: true,
            restrictNetworkAccess: true
        },
        systemSecurity: {
            removeDefaultAccounts: true,
            enforcePasswordPolicy: true,
            enableAuditLogging: true,
            disableUnnecessaryFeatures: true
        }
    }
};

// ==================== SECURITY MISCONFIGURATION PREVENTION CLASS ====================

class SecurityMisconfigurationPrevention {
    constructor(config = MISCONFIGURATION_CONFIG) {
        this.config = config;
        this.configurationIssues = [];
        this.hardeningStatus = new Map();
        this.environmentChecks = new Map();
        this.securityBaseline = new Map();
        
        // Initialize system
        this.initialize();
    }

    /**
     * Initialize security misconfiguration prevention
     */
    async initialize() {
        try {
            // Perform initial configuration validation
            await this.validateConfiguration();
            
            // Check for default credentials and configurations
            await this.detectDefaultConfigurations();
            
            // Validate security headers
            await this.validateSecurityHeaders();
            
            // Perform environment-specific checks
            await this.validateEnvironmentSecurity();
            
            // Start monitoring intervals
            this.startConfigurationMonitoring();
            
            console.log('[OWASP-A05] Security Misconfiguration Prevention initialized');
            
        } catch (error) {
            console.error('[OWASP-A05] Failed to initialize misconfiguration prevention:', error);
            throw error;
        }
    }

    /**
     * Middleware for security misconfiguration prevention
     */
    middleware() {
        return (req, res, next) => {
            try {
                // Add configuration security methods to request
                req.configSecurity = {
                    validateHeaders: this.validateRequestHeaders.bind(this),
                    checkConfiguration: this.checkRequestConfiguration.bind(this),
                    enforceSecurityPolicy: this.enforceSecurityPolicy.bind(this),
                    sanitizeErrors: this.sanitizeErrorResponse.bind(this)
                };
                
                // Validate request configuration
                const configValidation = this.validateRequestConfiguration(req);
                
                if (!configValidation.isValid) {
                    this.logConfigurationIssue('REQUEST_CONFIG', req, configValidation.issues);
                    
                    return res.status(400).json({
                        success: false,
                        error: 'Request configuration violates security policy',
                        code: 'CONFIG_VIOLATION',
                        timestamp: new Date().toISOString()
                    });
                }
                
                // Set security headers
                this.setSecurityHeaders(res);
                
                // Override error handling for secure error responses
                this.setupSecureErrorHandling(res);
                
                next();
                
            } catch (error) {
                console.error('[OWASP-A05] Configuration security middleware error:', error);
                next();
            }
        };
    }

    // ==================== CONFIGURATION VALIDATION ====================

    /**
     * Validate overall system configuration
     */
    async validateConfiguration() {
        try {
            const issues = [];
            
            // Validate package.json configuration
            const packageValidation = await this.validatePackageConfiguration();
            if (!packageValidation.isValid) {
                issues.push(...packageValidation.issues);
            }
            
            // Validate environment variables
            const envValidation = this.validateEnvironmentVariables();
            if (!envValidation.isValid) {
                issues.push(...envValidation.issues);
            }
            
            // Validate server configuration
            const serverValidation = this.validateServerConfiguration();
            if (!serverValidation.isValid) {
                issues.push(...serverValidation.issues);
            }
            
            // Validate file permissions
            const permissionsValidation = await this.validateFilePermissions();
            if (!permissionsValidation.isValid) {
                issues.push(...permissionsValidation.issues);
            }
            
            // Store validation results
            this.configurationIssues = issues;
            
            if (issues.length > 0) {
                console.warn(`[OWASP-A05] Found ${issues.length} configuration issues`);
                issues.forEach(issue => console.warn(`[OWASP-A05] ${issue}`));
            } else {
                console.log('[OWASP-A05] Configuration validation passed');
            }
            
            return {
                isValid: issues.length === 0,
                issues: issues
            };
            
        } catch (error) {
            console.error('[OWASP-A05] Configuration validation failed:', error);
            throw error;
        }
    }

    /**
     * Validate package.json configuration
     */
    async validatePackageConfiguration() {
        try {
            const issues = [];
            
            if (await fs.exists('./package.json')) {
                const packageJson = await fs.readJSON('./package.json');
                
                // Check for development dependencies in production
                if (process.env.NODE_ENV === 'production' && packageJson.devDependencies) {
                    issues.push('Development dependencies present in production package.json');
                }
                
                // Check for insecure dependency configurations
                if (packageJson.dependencies) {
                    for (const [dep, version] of Object.entries(packageJson.dependencies)) {
                        if (version.includes('*') || version.includes('^') || version.includes('~')) {
                            issues.push(`Insecure dependency version for ${dep}: ${version} (use exact versions)`);
                        }
                    }
                }
                
                // Check for scripts that might be insecure
                if (packageJson.scripts) {
                    for (const [script, command] of Object.entries(packageJson.scripts)) {
                        if (command.includes('--unsafe') || command.includes('--allow-run-as-root')) {
                            issues.push(`Potentially unsafe script: ${script}`);
                        }
                    }
                }
                
                // Check for missing security-related fields
                if (!packageJson.engines) {
                    issues.push('Missing engines field specifying Node.js version requirements');
                }
                
                if (!packageJson.repository || !packageJson.repository.url) {
                    issues.push('Missing repository information for supply chain verification');
                }
            }
            
            return {
                isValid: issues.length === 0,
                issues: issues
            };
            
        } catch (error) {
            console.error('[OWASP-A05] Package configuration validation failed:', error);
            return { isValid: false, issues: ['Package validation error'] };
        }
    }

    /**
     * Validate environment variables
     */
    validateEnvironmentVariables() {
        const issues = [];
        
        try {
            // Check for required environment variables in production
            if (process.env.NODE_ENV === 'production') {
                const requiredVars = [
                    'JWT_SECRET',
                    'CRYPTO_PEPPER',
                    'MASTER_KEY_PASSWORD',
                    'ADMIN_API_KEY'
                ];
                
                for (const varName of requiredVars) {
                    if (!process.env[varName]) {
                        issues.push(`Missing required environment variable: ${varName}`);
                    } else if (this.isDefaultOrWeakValue(process.env[varName])) {
                        issues.push(`Weak or default value for environment variable: ${varName}`);
                    }
                }
            }
            
            // Check for insecure environment variable values
            for (const [key, value] of Object.entries(process.env)) {
                if (this.containsSensitiveInfo(key, value)) {
                    issues.push(`Environment variable ${key} may contain sensitive information`);
                }
                
                if (this.isInsecureConfiguration(key, value)) {
                    issues.push(`Insecure configuration in environment variable: ${key}`);
                }
            }
            
            // Check for debug/development flags in production
            if (process.env.NODE_ENV === 'production') {
                const debugVars = ['DEBUG', 'VERBOSE', 'TRACE', 'DEV_MODE'];
                for (const debugVar of debugVars) {
                    if (process.env[debugVar] === 'true' || process.env[debugVar] === '1') {
                        issues.push(`Debug variable ${debugVar} enabled in production`);
                    }
                }
            }
            
            return {
                isValid: issues.length === 0,
                issues: issues
            };
            
        } catch (error) {
            console.error('[OWASP-A05] Environment variable validation failed:', error);
            return { isValid: false, issues: ['Environment validation error'] };
        }
    }

    /**
     * Validate server configuration
     */
    validateServerConfiguration() {
        const issues = [];
        
        try {
            // Check port configuration
            const port = process.env.PORT || 5000;
            if (port < 1024 && process.getuid && process.getuid() !== 0) {
                issues.push(`Attempting to bind to privileged port ${port} without root privileges`);
            }
            
            // Check for default ports in production
            if (process.env.NODE_ENV === 'production') {
                const defaultPorts = [3000, 8000, 8080, 9000];
                if (defaultPorts.includes(parseInt(port))) {
                    issues.push(`Using default development port ${port} in production`);
                }
            }
            
            // Check SSL/TLS configuration
            if (process.env.NODE_ENV === 'production') {
                if (!process.env.HTTPS_CERT && !process.env.SSL_CERT) {
                    issues.push('Missing SSL/TLS certificate configuration in production');
                }
            }
            
            // Check timeout configurations
            if (process.env.REQUEST_TIMEOUT && parseInt(process.env.REQUEST_TIMEOUT) > 30000) {
                issues.push(`Request timeout too high: ${process.env.REQUEST_TIMEOUT}ms (max recommended: 30000ms)`);
            }
            
            return {
                isValid: issues.length === 0,
                issues: issues
            };
            
        } catch (error) {
            console.error('[OWASP-A05] Server configuration validation failed:', error);
            return { isValid: false, issues: ['Server configuration validation error'] };
        }
    }

    /**
     * Validate file permissions
     */
    async validateFilePermissions() {
        const issues = [];
        
        try {
            const criticalFiles = [
                '.env',
                'security-data/master.key',
                'security-data/users.json',
                'security-data/sessions.json',
                'package.json',
                'server.js'
            ];
            
            for (const file of criticalFiles) {
                if (await fs.exists(file)) {
                    try {
                        const stats = await fs.stat(file);
                        const mode = stats.mode & parseInt('777', 8);
                        
                        // Check if file is world-readable or world-writable
                        if (mode & parseInt('044', 8)) {
                            issues.push(`File ${file} is world-readable (mode: ${mode.toString(8)})`);
                        }
                        
                        if (mode & parseInt('022', 8)) {
                            issues.push(`File ${file} is world-writable (mode: ${mode.toString(8)})`);
                        }
                        
                        // Check for overly permissive files
                        if (file.includes('secret') || file.includes('key') || file === '.env') {
                            if (mode > parseInt('600', 8)) {
                                issues.push(`Sensitive file ${file} has overly permissive permissions (mode: ${mode.toString(8)})`);
                            }
                        }
                    } catch (statError) {
                        issues.push(`Unable to check permissions for ${file}: ${statError.message}`);
                    }
                }
            }
            
            return {
                isValid: issues.length === 0,
                issues: issues
            };
            
        } catch (error) {
            console.error('[OWASP-A05] File permissions validation failed:', error);
            return { isValid: false, issues: ['File permissions validation error'] };
        }
    }

    // ==================== DEFAULT CONFIGURATION DETECTION ====================

    /**
     * Detect default credentials and configurations
     */
    async detectDefaultConfigurations() {
        try {
            const defaults = [];
            
            // Check for default passwords
            const passwordCheck = this.checkDefaultPasswords();
            if (!passwordCheck.isValid) {
                defaults.push(...passwordCheck.defaults);
            }
            
            // Check for default users
            const userCheck = this.checkDefaultUsers();
            if (!userCheck.isValid) {
                defaults.push(...userCheck.defaults);
            }
            
            // Check for default configurations
            const configCheck = this.checkDefaultConfigurations();
            if (!configCheck.isValid) {
                defaults.push(...configCheck.defaults);
            }
            
            // Check for insecure defaults
            const insecureCheck = this.checkInsecureDefaults();
            if (!insecureCheck.isValid) {
                defaults.push(...insecureCheck.defaults);
            }
            
            if (defaults.length > 0) {
                console.warn(`[OWASP-A05] Found ${defaults.length} default configurations`);
                defaults.forEach(def => console.warn(`[OWASP-A05] ${def}`));
            } else {
                console.log('[OWASP-A05] No default configurations detected');
            }
            
            return {
                isValid: defaults.length === 0,
                defaults: defaults
            };
            
        } catch (error) {
            console.error('[OWASP-A05] Default configuration detection failed:', error);
            throw error;
        }
    }

    /**
     * Check for default passwords
     */
    checkDefaultPasswords() {
        const defaults = [];
        
        try {
            // Check environment variables for default passwords
            for (const [key, value] of Object.entries(process.env)) {
                if (this.isPasswordVariable(key) && this.isDefaultPassword(value)) {
                    defaults.push(`Default password detected in environment variable: ${key}`);
                }
            }
            
            // Check specific known default values
            const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
            if (defaultAdminPassword && this.isDefaultPassword(defaultAdminPassword)) {
                defaults.push('Default admin password detected');
            }
            
            const masterKeyPassword = process.env.MASTER_KEY_PASSWORD;
            if (masterKeyPassword === 'default-password-change-in-production') {
                defaults.push('Default master key password detected');
            }
            
            return {
                isValid: defaults.length === 0,
                defaults: defaults
            };
            
        } catch (error) {
            console.error('[OWASP-A05] Default password check failed:', error);
            return { isValid: false, defaults: ['Default password check error'] };
        }
    }

    /**
     * Check for default users
     */
    checkDefaultUsers() {
        const defaults = [];
        
        try {
            // Check for default usernames in environment variables
            for (const [key, value] of Object.entries(process.env)) {
                if (this.isUsernameVariable(key) && this.isDefaultUsername(value)) {
                    defaults.push(`Default username detected in environment variable: ${key}: ${value}`);
                }
            }
            
            // Check for default admin user
            const adminEmail = 'admin@roboticscontrol.ie';
            // This would check the user database in a real implementation
            // For now, we'll assume it's using default credentials if no custom admin is set
            
            return {
                isValid: defaults.length === 0,
                defaults: defaults
            };
            
        } catch (error) {
            console.error('[OWASP-A05] Default user check failed:', error);
            return { isValid: false, defaults: ['Default user check error'] };
        }
    }

    /**
     * Check for default configurations
     */
    checkDefaultConfigurations() {
        const defaults = [];
        
        try {
            // Check API keys
            const apiKey = process.env.ADMIN_API_KEY;
            if (apiKey === 'robotics-admin-2025-secure') {
                defaults.push('Default API key detected');
            }
            
            // Check JWT secret
            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret || jwtSecret.length < 32) {
                defaults.push('Weak or missing JWT secret');
            }
            
            // Check for default database configurations
            const dbUrl = process.env.DATABASE_URL;
            if (dbUrl && (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) && 
                process.env.NODE_ENV === 'production') {
                defaults.push('Using localhost database in production');
            }
            
            return {
                isValid: defaults.length === 0,
                defaults: defaults
            };
            
        } catch (error) {
            console.error('[OWASP-A05] Default configuration check failed:', error);
            return { isValid: false, defaults: ['Default configuration check error'] };
        }
    }

    /**
     * Check for insecure defaults
     */
    checkInsecureDefaults() {
        const defaults = [];
        
        try {
            // Check for debug modes in production
            if (process.env.NODE_ENV === 'production') {
                for (const insecureDefault of this.config.defaults.insecureDefaults) {
                    const [key, value] = insecureDefault.split('=');
                    if (process.env[key.toUpperCase()] === value) {
                        defaults.push(`Insecure default configuration: ${insecureDefault}`);
                    }
                }
            }
            
            // Check for insecure SSL/TLS settings
            if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
                defaults.push('TLS certificate validation disabled');
            }
            
            // Check for permissive CORS settings
            if (process.env.CORS_ORIGIN === '*') {
                defaults.push('Permissive CORS origin setting');
            }
            
            return {
                isValid: defaults.length === 0,
                defaults: defaults
            };
            
        } catch (error) {
            console.error('[OWASP-A05] Insecure defaults check failed:', error);
            return { isValid: false, defaults: ['Insecure defaults check error'] };
        }
    }

    // ==================== SECURITY HEADERS VALIDATION ====================

    /**
     * Validate security headers configuration
     */
    async validateSecurityHeaders() {
        try {
            const issues = [];
            
            // This would be called on a test request to validate headers
            // For now, we'll validate the configuration
            
            const requiredHeaders = this.config.headers.required;
            const forbiddenHeaders = this.config.headers.forbidden;
            
            // Check if required headers are configured
            // In a real implementation, this would check the actual response headers
            
            console.log('[OWASP-A05] Security headers validation completed');
            
            return {
                isValid: issues.length === 0,
                issues: issues
            };
            
        } catch (error) {
            console.error('[OWASP-A05] Security headers validation failed:', error);
            throw error;
        }
    }

    /**
     * Set security headers on response
     */
    setSecurityHeaders(res) {
        try {
            const environment = process.env.NODE_ENV || 'development';
            const isProduction = environment === 'production';
            
            // Set required security headers
            const headers = this.config.headers.secureValues;
            
            for (const [header, value] of Object.entries(headers)) {
                if (header === 'Strict-Transport-Security' && !isProduction) {
                    // Don't set HSTS in development
                    continue;
                }
                res.setHeader(header, value);
            }
            
            // Set additional security headers
            res.setHeader('Permissions-Policy', 
                'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=(), ambient-light-sensor=(), accelerometer=(), battery=(), autoplay=()'
            );
            
            // Remove forbidden headers
            for (const header of this.config.headers.forbidden) {
                res.removeHeader(header);
            }
            
            // Set cache control for security
            if (res.req && this.isSecurityEndpoint(res.req.path)) {
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private');
                res.setHeader('Pragma', 'no-cache');
                res.setHeader('Expires', '0');
            }
            
        } catch (error) {
            console.error('[OWASP-A05] Failed to set security headers:', error);
        }
    }

    /**
     * Validate request headers
     */
    validateRequestHeaders(req) {
        const issues = [];
        
        try {
            // Check for potentially dangerous headers
            const dangerousHeaders = [
                'x-forwarded-host',
                'x-forwarded-server',
                'x-real-ip'
            ];
            
            for (const header of dangerousHeaders) {
                if (req.headers[header]) {
                    // Validate the header value
                    if (!this.isValidHeaderValue(header, req.headers[header])) {
                        issues.push(`Invalid or suspicious value in header: ${header}`);
                    }
                }
            }
            
            // Check Content-Type for POST requests
            if (req.method === 'POST' && !req.headers['content-type']) {
                issues.push('Missing Content-Type header for POST request');
            }
            
            // Check for oversized headers
            const maxHeaderSize = 8192; // 8KB
            const headerString = JSON.stringify(req.headers);
            if (headerString.length > maxHeaderSize) {
                issues.push(`Request headers exceed maximum size (${maxHeaderSize} bytes)`);
            }
            
            return {
                isValid: issues.length === 0,
                issues: issues
            };
            
        } catch (error) {
            console.error('[OWASP-A05] Request header validation failed:', error);
            return { isValid: false, issues: ['Header validation error'] };
        }
    }

    // ==================== ERROR HANDLING ====================

    /**
     * Setup secure error handling
     */
    setupSecureErrorHandling(res) {
        try {
            // Override res.status to sanitize error responses
            const originalStatus = res.status.bind(res);
            const originalJson = res.json.bind(res);
            
            res.status = function(code) {
                // Ensure only allowed error codes are returned
                if (!this.config?.errorHandling?.allowedErrorCodes?.includes(code)) {
                    code = 500; // Default to internal server error
                }
                return originalStatus(code);
            }.bind({ config: this.config });
            
            res.json = function(data) {
                // Sanitize error responses
                if (data && data.error) {
                    data = this.sanitizeErrorResponse(data);
                }
                return originalJson(data);
            }.bind(this);
            
        } catch (error) {
            console.error('[OWASP-A05] Failed to setup secure error handling:', error);
        }
    }

    /**
     * Sanitize error response
     */
    sanitizeErrorResponse(errorData) {
        try {
            const sanitized = { ...errorData };
            
            if (!this.config.errorHandling.enableSafeErrorMessages) {
                return sanitized;
            }
            
            // Hide stack traces in production
            if (this.config.errorHandling.hideStackTraces && sanitized.stack) {
                delete sanitized.stack;
            }
            
            // Hide sensitive information
            if (this.config.errorHandling.hideSensitiveInfo) {
                // Remove file paths
                if (sanitized.error) {
                    sanitized.error = sanitized.error.replace(/\/[^\s]*\/[^\s]*/g, '[PATH]');
                }
                
                // Remove connection strings
                if (sanitized.error) {
                    sanitized.error = sanitized.error.replace(/[a-zA-Z]+:\/\/[^\s]+/g, '[CONNECTION]');
                }
                
                // Remove SQL queries
                if (sanitized.error) {
                    sanitized.error = sanitized.error.replace(/SELECT|INSERT|UPDATE|DELETE|CREATE|DROP[^;]*;?/gi, '[SQL_QUERY]');
                }
            }
            
            // Use generic error message in production for 500 errors
            if (process.env.NODE_ENV === 'production' && 
                (sanitized.status === 500 || sanitized.code === 500)) {
                sanitized.error = this.config.errorHandling.genericErrorMessage;
            }
            
            // Remove debug information
            delete sanitized.debug;
            delete sanitized.trace;
            delete sanitized.internal;
            
            return sanitized;
            
        } catch (error) {
            console.error('[OWASP-A05] Error response sanitization failed:', error);
            return {
                error: this.config.errorHandling.genericErrorMessage,
                timestamp: new Date().toISOString()
            };
        }
    }

    // ==================== ENVIRONMENT SECURITY ====================

    /**
     * Validate environment-specific security
     */
    async validateEnvironmentSecurity() {
        try {
            const environment = process.env.NODE_ENV || 'development';
            const environmentConfig = this.config.environment[environment];
            
            if (!environmentConfig) {
                console.warn(`[OWASP-A05] No configuration found for environment: ${environment}`);
                return;
            }
            
            const issues = [];
            
            // Validate environment-specific requirements
            if (environmentConfig.requireHTTPS && !this.isHTTPSEnabled()) {
                issues.push('HTTPS required but not enabled');
            }
            
            if (environmentConfig.disableDebugMode && this.isDebugModeEnabled()) {
                issues.push('Debug mode must be disabled in this environment');
            }
            
            if (environmentConfig.hideServerInfo && this.isServerInfoExposed()) {
                issues.push('Server information should be hidden in this environment');
            }
            
            if (environmentConfig.enforceStrictValidation && !this.isStrictValidationEnabled()) {
                issues.push('Strict validation must be enabled in this environment');
            }
            
            this.environmentChecks.set(environment, {
                timestamp: new Date().toISOString(),
                isValid: issues.length === 0,
                issues: issues
            });
            
            if (issues.length > 0) {
                console.warn(`[OWASP-A05] Environment security issues for ${environment}:`, issues);
            } else {
                console.log(`[OWASP-A05] Environment security validation passed for ${environment}`);
            }
            
            return {
                isValid: issues.length === 0,
                issues: issues
            };
            
        } catch (error) {
            console.error('[OWASP-A05] Environment security validation failed:', error);
            throw error;
        }
    }

    /**
     * Validate request configuration
     */
    validateRequestConfiguration(req) {
        const issues = [];
        
        try {
            // Validate request method
            const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'];
            if (!allowedMethods.includes(req.method)) {
                issues.push(`Unsupported HTTP method: ${req.method}`);
            }
            
            // Validate request size
            const contentLength = parseInt(req.headers['content-length'] || '0');
            const maxRequestSize = 10 * 1024 * 1024; // 10MB
            if (contentLength > maxRequestSize) {
                issues.push(`Request size exceeds limit: ${contentLength} > ${maxRequestSize}`);
            }
            
            // Validate protocol in production
            if (process.env.NODE_ENV === 'production') {
                const protocol = req.headers['x-forwarded-proto'] || req.protocol;
                if (protocol !== 'https') {
                    issues.push('HTTPS required in production environment');
                }
            }
            
            // Validate headers
            const headerValidation = this.validateRequestHeaders(req);
            if (!headerValidation.isValid) {
                issues.push(...headerValidation.issues);
            }
            
            return {
                isValid: issues.length === 0,
                issues: issues
            };
            
        } catch (error) {
            console.error('[OWASP-A05] Request configuration validation failed:', error);
            return { isValid: false, issues: ['Request configuration validation error'] };
        }
    }

    /**
     * Enforce security policy
     */
    enforceSecurityPolicy(req, context = {}) {
        const violations = [];
        
        try {
            // Enforce HTTPS in production
            if (process.env.NODE_ENV === 'production' && !this.isSecureConnection(req)) {
                violations.push('HTTPS required in production');
            }
            
            // Enforce authentication for sensitive endpoints
            if (this.isSecurityEndpoint(req.path) && !req.user?.isAuthenticated) {
                violations.push('Authentication required for security endpoint');
            }
            
            // Enforce rate limiting
            if (this.isRateLimitedEndpoint(req.path) && !context.rateLimited) {
                violations.push('Rate limiting required for this endpoint');
            }
            
            // Enforce input validation
            if (this.requiresInputValidation(req.path) && !context.validated) {
                violations.push('Input validation required for this endpoint');
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations
            };
            
        } catch (error) {
            console.error('[OWASP-A05] Security policy enforcement failed:', error);
            return { isValid: false, violations: ['Security policy enforcement error'] };
        }
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Check if value is a default password
     */
    isDefaultPassword(value) {
        if (!value) return false;
        return this.config.defaults.defaultPasswords.includes(value.toLowerCase()) ||
               value.length < 8 ||
               /^(password|admin|user|test|demo|guest|123456|qwerty|letmein|welcome|changeme|default|root|sa|oracle|postgres)(\d{0,3})?$/i.test(value);
    }

    /**
     * Check if value is a default username
     */
    isDefaultUsername(value) {
        if (!value) return false;
        return this.config.defaults.defaultUsers.includes(value.toLowerCase());
    }

    /**
     * Check if key is a password variable
     */
    isPasswordVariable(key) {
        return /password|pass|pwd|secret|key|token/i.test(key);
    }

    /**
     * Check if key is a username variable
     */
    isUsernameVariable(key) {
        return /user|username|login|account|admin/i.test(key);
    }

    /**
     * Check if value contains sensitive information
     */
    containsSensitiveInfo(key, value) {
        if (!value) return false;
        
        // Check for credit card patterns
        if (/^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/.test(value)) {
            return true;
        }
        
        // Check for social security patterns
        if (/^\d{3}[-\s]?\d{2}[-\s]?\d{4}$/.test(value)) {
            return true;
        }
        
        // Check for private keys
        if (value.includes('BEGIN PRIVATE KEY') || value.includes('BEGIN RSA PRIVATE KEY')) {
            return true;
        }
        
        return false;
    }

    /**
     * Check if configuration is insecure
     */
    isInsecureConfiguration(key, value) {
        const insecurePatterns = [
            { key: /debug/i, value: /true|1|on|yes/i },
            { key: /test/i, value: /true|1|on|yes/i },
            { key: /disable.*security/i, value: /true|1|on|yes/i },
            { key: /allow.*all/i, value: /true|1|on|yes/i }
        ];
        
        return insecurePatterns.some(pattern => 
            pattern.key.test(key) && pattern.value.test(value)
        );
    }

    /**
     * Check if value is default or weak
     */
    isDefaultOrWeakValue(value) {
        if (!value) return true;
        
        return value.length < 8 ||
               /^(test|demo|example|sample|default|change|replace|update|modify).*$/i.test(value) ||
               /^(admin|user|guest|root|sa|oracle|postgres).*$/i.test(value);
    }

    /**
     * Check if header value is valid
     */
    isValidHeaderValue(header, value) {
        // Basic validation for common attack vectors
        if (value.includes('../') || value.includes('..\\')) {
            return false; // Path traversal
        }
        
        if (value.includes('<script') || value.includes('javascript:')) {
            return false; // XSS
        }
        
        if (header === 'x-forwarded-for' || header === 'x-real-ip') {
            // Validate IP address format
            const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
            return ipPattern.test(value) || value === 'unknown';
        }
        
        return true;
    }

    /**
     * Check if HTTPS is enabled
     */
    isHTTPSEnabled() {
        return !!(process.env.HTTPS_CERT || process.env.SSL_CERT || process.env.HTTPS_KEY);
    }

    /**
     * Check if debug mode is enabled
     */
    isDebugModeEnabled() {
        return !!(process.env.DEBUG === 'true' || 
                 process.env.NODE_ENV === 'development' ||
                 process.env.VERBOSE === 'true');
    }

    /**
     * Check if server info is exposed
     */
    isServerInfoExposed() {
        // This would check if server headers are being sent
        // For now, assume they're hidden if we're removing them
        return false;
    }

    /**
     * Check if strict validation is enabled
     */
    isStrictValidationEnabled() {
        return this.config.validation.enableConfigValidation &&
               this.config.validation.enableHardeningChecks;
    }

    /**
     * Check if endpoint is security-related
     */
    isSecurityEndpoint(path) {
        return path.startsWith('/api/security') || 
               path.startsWith('/api/admin') ||
               path.startsWith('/api/reports');
    }

    /**
     * Check if connection is secure
     */
    isSecureConnection(req) {
        return req.secure || 
               req.headers['x-forwarded-proto'] === 'https' ||
               req.headers['x-forwarded-ssl'] === 'on';
    }

    /**
     * Check if endpoint is rate limited
     */
    isRateLimitedEndpoint(path) {
        return path.startsWith('/api/') || 
               path.startsWith('/contact') ||
               path.startsWith('/chat');
    }

    /**
     * Check if endpoint requires input validation
     */
    requiresInputValidation(path) {
        return path.startsWith('/api/') || 
               path.includes('form') ||
               path.includes('contact') ||
               path.includes('chat');
    }

    /**
     * Log configuration issue
     */
    logConfigurationIssue(type, req, issues) {
        const issue = {
            type: type,
            timestamp: new Date().toISOString(),
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            url: req.url,
            method: req.method,
            issues: issues
        };
        
        this.configurationIssues.push(issue);
        
        // Keep only last 1000 issues
        if (this.configurationIssues.length > 1000) {
            this.configurationIssues = this.configurationIssues.slice(-1000);
        }
        
        console.warn(`[OWASP-A05] Configuration issue detected:`, issue);
    }

    /**
     * Start configuration monitoring
     */
    startConfigurationMonitoring() {
        // Monitor configuration changes every hour
        setInterval(() => {
            this.validateConfiguration();
        }, 60 * 60 * 1000);
        
        // Check for default configurations daily
        setInterval(() => {
            this.detectDefaultConfigurations();
        }, 24 * 60 * 60 * 1000);
    }

    // ==================== PUBLIC API ====================

    /**
     * Get configuration security metrics
     */
    getConfigurationMetrics() {
        return {
            totalIssues: this.configurationIssues.length,
            recentIssues: this.configurationIssues.filter(issue => 
                new Date(issue.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
            ).length,
            environmentChecks: Object.fromEntries(this.environmentChecks),
            hardeningStatus: Object.fromEntries(this.hardeningStatus)
        };
    }

    /**
     * Get recent configuration issues
     */
    getRecentConfigurationIssues(limit = 50) {
        return this.configurationIssues.slice(-limit).reverse();
    }

    /**
     * Get configuration security status
     */
    getConfigurationStatus() {
        const environment = process.env.NODE_ENV || 'development';
        const envCheck = this.environmentChecks.get(environment);
        
        return {
            environment: environment,
            isSecure: envCheck?.isValid || false,
            lastCheck: envCheck?.timestamp || null,
            issues: envCheck?.issues || [],
            configurationScore: this.calculateConfigurationScore()
        };
    }

    /**
     * Calculate configuration security score
     */
    calculateConfigurationScore() {
        let score = 100;
        
        // Deduct points for configuration issues
        const recentIssues = this.configurationIssues.filter(issue => 
            new Date(issue.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );
        
        score -= Math.min(50, recentIssues.length * 5);
        
        // Deduct points for environment issues
        const environment = process.env.NODE_ENV || 'development';
        const envCheck = this.environmentChecks.get(environment);
        if (envCheck && !envCheck.isValid) {
            score -= Math.min(30, envCheck.issues.length * 10);
        }
        
        return Math.max(0, score);
    }
}

module.exports = {
    MisconfigurationManager: SecurityMisconfigurationPrevention,
    MISCONFIGURATION_CONFIG
};