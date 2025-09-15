/**
 * OWASP A10: Server-Side Request Forgery (SSRF) Prevention
 * Robotics & Control Ltd - Enterprise Security Implementation
 * 
 * This module implements comprehensive SSRF prevention including:
 * - URL validation and allowlisting/blocklisting
 * - Network segmentation simulation and access controls
 * - Outbound request filtering and monitoring
 * - DNS rebinding attack prevention
 * - Internal service protection
 */

const url = require('url');
const dns = require('dns').promises;
const net = require('net');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

// ==================== SSRF PREVENTION CONFIGURATION ====================

const SSRF_CONFIG = {
    // URL validation and filtering
    urlValidation: {
        enableUrlValidation: true,
        enableSchemeValidation: true,
        enableHostValidation: true,
        enablePortValidation: true,
        enablePathValidation: true,
        allowedSchemes: ['http', 'https'],
        blockedSchemes: ['file', 'ftp', 'gopher', 'jar', 'ldap', 'mailto', 'netdoc', 'dict'],
        maxUrlLength: 2048,
        allowDataUrls: false,
        allowJavascriptUrls: false
    },
    
    // Network access controls
    networkSecurity: {
        enableNetworkFiltering: true,
        enablePrivateNetworkBlocking: true,
        enableLoopbackBlocking: true,
        enableLinkLocalBlocking: true,
        enableMulticastBlocking: true,
        enableCloudMetadataBlocking: true,
        blockedNetworks: [
            '127.0.0.0/8',      // Loopback
            '10.0.0.0/8',       // Private Class A
            '172.16.0.0/12',    // Private Class B
            '192.168.0.0/16',   // Private Class C
            '169.254.0.0/16',   // Link-local
            '224.0.0.0/4',      // Multicast
            '::1/128',          // IPv6 loopback
            'fc00::/7',         // IPv6 private
            'fe80::/10'         // IPv6 link-local
        ],
        allowedNetworks: [],
        blockedPorts: [22, 23, 25, 53, 135, 137, 138, 139, 445, 993, 995, 1433, 1521, 3306, 3389, 5432, 5984, 6379, 8080, 9200]
    },
    
    // Allowlist and blocklist management
    accessControl: {
        enableAllowlist: true,
        enableBlocklist: true,
        allowlistMode: 'strict', // 'strict' or 'permissive'
        allowedDomains: [
            'api.openai.com',
            'registry.npmjs.org',
            'github.com',
            'cdn.jsdelivr.net',
            'fonts.googleapis.com',
            'fonts.gstatic.com',
            'cdnjs.cloudflare.com',
            'unpkg.com'
        ],
        allowedIPs: [],
        blockedDomains: [
            'localhost',
            'metadata.google.internal',
            '169.254.169.254',
            'metadata.azure.com',
            'metadata.packet.net',
            'metadata.digitalocean.com'
        ],
        blockedIPs: [
            '127.0.0.1',
            '0.0.0.0',
            '::1'
        ]
    },
    
    // DNS security
    dnsSecurity: {
        enableDnsValidation: true,
        enableDnsRebindingProtection: true,
        enableCnameValidation: true,
        dnsTimeout: 5000,
        maxDnsRetries: 2,
        allowedDnsServers: [],
        blockedDnsServers: []
    },
    
    // Request monitoring and logging
    monitoring: {
        enableRequestLogging: true,
        enableAnomalyDetection: true,
        enableRateLimiting: true,
        logAllRequests: true,
        logBlockedRequests: true,
        alertOnSsrfAttempts: true,
        maxRequestsPerMinute: 30,
        maxRequestsPerHour: 500
    },
    
    // Response handling
    responseHandling: {
        enableResponseValidation: true,
        enableContentTypeValidation: true,
        enableSizeValidation: true,
        maxResponseSize: 10 * 1024 * 1024, // 10MB
        allowedContentTypes: [
            'application/json',
            'text/plain',
            'text/html',
            'application/xml',
            'text/xml',
            'application/javascript',
            'text/css'
        ],
        blockedContentTypes: [
            'application/octet-stream',
            'application/x-executable',
            'application/x-msdownload'
        ]
    }
};

// ==================== SSRF PREVENTION MANAGER CLASS ====================

class SSRFPreventionManager {
    constructor(config = SSRF_CONFIG) {
        this.config = config;
        this.ssrfAttempts = [];
        this.requestHistory = new Map();
        this.dnsCache = new Map();
        this.blockedRequests = [];
        this.allowedDestinations = new Set();
        this.requestCounts = new Map();
        
        // Initialize system
        this.initialize();
    }

    /**
     * Initialize SSRF prevention system
     */
    async initialize() {
        try {
            // Ensure data directories exist
            await fs.ensureDir('./security-data/ssrf');
            
            // Load existing data
            await this.loadSSRFData();
            
            // Initialize allowed destinations
            this.initializeAllowedDestinations();
            
            // Start monitoring intervals
            this.startSSRFMonitoring();
            
            console.log('[OWASP-A10] SSRF Prevention Manager initialized');
            
        } catch (error) {
            console.error('[OWASP-A10] Failed to initialize SSRF prevention:', error);
            throw error;
        }
    }

    /**
     * Middleware for SSRF prevention
     */
    middleware() {
        return async (req, res, next) => {
            try {
                // Add SSRF prevention methods to request
                req.ssrfPrevention = {
                    validateUrl: this.validateUrl.bind(this),
                    checkNetworkAccess: this.checkNetworkAccess.bind(this),
                    filterOutboundRequest: this.filterOutboundRequest.bind(this),
                    validateDestination: this.validateDestination.bind(this),
                    monitorRequest: this.monitorRequest.bind(this)
                };
                
                // Check for SSRF attempts in request
                const ssrfCheck = await this.checkRequestForSSRF(req);
                
                if (!ssrfCheck.isValid) {
                    this.logSSRFAttempt('REQUEST_VALIDATION', req, ssrfCheck.violations);
                    
                    return res.status(400).json({
                        success: false,
                        error: 'Request contains potential SSRF attempt',
                        code: 'SSRF_BLOCKED',
                        timestamp: new Date().toISOString()
                    });
                }
                
                // Rate limiting for outbound requests
                if (this.isOutboundRequest(req)) {
                    const rateLimitCheck = this.checkRateLimit(req.ip);
                    
                    if (!rateLimitCheck.allowed) {
                        return res.status(429).json({
                            success: false,
                            error: 'Too many outbound requests',
                            retryAfter: rateLimitCheck.retryAfter,
                            timestamp: new Date().toISOString()
                        });
                    }
                }
                
                next();
                
            } catch (error) {
                console.error('[OWASP-A10] SSRF prevention middleware error:', error);
                next();
            }
        };
    }

    // ==================== URL VALIDATION ====================

    /**
     * Validate URL for SSRF vulnerabilities
     */
    async validateUrl(targetUrl, context = {}) {
        try {
            const violations = [];
            
            if (!targetUrl || typeof targetUrl !== 'string') {
                violations.push('Invalid URL format');
                return { isValid: false, violations: violations };
            }
            
            // Length validation
            if (targetUrl.length > this.config.urlValidation.maxUrlLength) {
                violations.push(`URL exceeds maximum length (${this.config.urlValidation.maxUrlLength})`);
            }
            
            // Parse URL
            let parsedUrl;
            try {
                parsedUrl = new URL(targetUrl);
            } catch (parseError) {
                violations.push('URL parsing failed - invalid format');
                return { isValid: false, violations: violations };
            }
            
            // Scheme validation
            const schemeValidation = this.validateScheme(parsedUrl.protocol);
            if (!schemeValidation.isValid) {
                violations.push(...schemeValidation.violations);
            }
            
            // Host validation
            const hostValidation = await this.validateHost(parsedUrl.hostname);
            if (!hostValidation.isValid) {
                violations.push(...hostValidation.violations);
            }
            
            // Port validation
            const portValidation = this.validatePort(parsedUrl.port, parsedUrl.protocol);
            if (!portValidation.isValid) {
                violations.push(...portValidation.violations);
            }
            
            // Path validation
            const pathValidation = this.validatePath(parsedUrl.pathname);
            if (!pathValidation.isValid) {
                violations.push(...pathValidation.violations);
            }
            
            // DNS rebinding protection
            const dnsValidation = await this.validateDNSRebinding(parsedUrl.hostname);
            if (!dnsValidation.isValid) {
                violations.push(...dnsValidation.violations);
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations,
                parsedUrl: parsedUrl,
                resolvedIPs: hostValidation.resolvedIPs || []
            };
            
        } catch (error) {
            console.error('[OWASP-A10] URL validation failed:', error);
            return {
                isValid: false,
                violations: [`URL validation error: ${error.message}`]
            };
        }
    }

    /**
     * Validate URL scheme
     */
    validateScheme(protocol) {
        const violations = [];
        const scheme = protocol.replace(':', '').toLowerCase();
        
        // Check blocked schemes
        if (this.config.urlValidation.blockedSchemes.includes(scheme)) {
            violations.push(`Blocked URL scheme: ${scheme}`);
        }
        
        // Check allowed schemes
        if (!this.config.urlValidation.allowedSchemes.includes(scheme)) {
            violations.push(`URL scheme not allowed: ${scheme}`);
        }
        
        // Special cases
        if (scheme === 'data' && !this.config.urlValidation.allowDataUrls) {
            violations.push('Data URLs are not allowed');
        }
        
        if (scheme === 'javascript' && !this.config.urlValidation.allowJavascriptUrls) {
            violations.push('JavaScript URLs are not allowed');
        }
        
        return {
            isValid: violations.length === 0,
            violations: violations
        };
    }

    /**
     * Validate hostname
     */
    async validateHost(hostname) {
        try {
            const violations = [];
            let resolvedIPs = [];
            
            if (!hostname) {
                violations.push('Hostname is required');
                return { isValid: false, violations: violations };
            }
            
            // Check blocked domains
            if (this.config.accessControl.blockedDomains.includes(hostname.toLowerCase())) {
                violations.push(`Blocked domain: ${hostname}`);
            }
            
            // Check if allowlist is enabled and hostname is not allowed
            if (this.config.accessControl.enableAllowlist && 
                this.config.accessControl.allowlistMode === 'strict') {
                
                const isAllowed = this.config.accessControl.allowedDomains.some(domain => 
                    hostname.toLowerCase() === domain.toLowerCase() ||
                    hostname.toLowerCase().endsWith('.' + domain.toLowerCase())
                );
                
                if (!isAllowed) {
                    violations.push(`Domain not in allowlist: ${hostname}`);
                }
            }
            
            // Resolve hostname to IP addresses
            try {
                const addresses = await this.resolveHostname(hostname);
                resolvedIPs = addresses;
                
                // Validate resolved IPs
                for (const ip of addresses) {
                    const ipValidation = this.validateIPAddress(ip);
                    if (!ipValidation.isValid) {
                        violations.push(...ipValidation.violations);
                    }
                }
            } catch (dnsError) {
                violations.push(`DNS resolution failed: ${dnsError.message}`);
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations,
                resolvedIPs: resolvedIPs
            };
            
        } catch (error) {
            console.error('[OWASP-A10] Host validation failed:', error);
            return {
                isValid: false,
                violations: [`Host validation error: ${error.message}`]
            };
        }
    }

    /**
     * Validate port
     */
    validatePort(port, protocol) {
        const violations = [];
        
        // Default ports for protocols
        const defaultPorts = {
            'http:': 80,
            'https:': 443,
            'ftp:': 21,
            'ssh:': 22,
            'telnet:': 23
        };
        
        const actualPort = port ? parseInt(port) : defaultPorts[protocol] || 80;
        
        // Check blocked ports
        if (this.config.networkSecurity.blockedPorts.includes(actualPort)) {
            violations.push(`Blocked port: ${actualPort}`);
        }
        
        // Port range validation
        if (actualPort < 1 || actualPort > 65535) {
            violations.push(`Invalid port range: ${actualPort}`);
        }
        
        // Check for dangerous ports
        const dangerousPorts = [22, 23, 25, 53, 135, 137, 138, 139, 445, 1433, 1521, 3306, 3389, 5432, 6379];
        if (dangerousPorts.includes(actualPort)) {
            violations.push(`Potentially dangerous port: ${actualPort}`);
        }
        
        return {
            isValid: violations.length === 0,
            violations: violations,
            port: actualPort
        };
    }

    /**
     * Validate URL path
     */
    validatePath(pathname) {
        const violations = [];
        
        if (!pathname) {
            return { isValid: true, violations: [] };
        }
        
        // Check for path traversal attempts
        if (pathname.includes('../') || pathname.includes('..\\')) {
            violations.push('Path traversal attempt detected');
        }
        
        // Check for suspicious paths
        const suspiciousPaths = [
            '/admin',
            '/config',
            '/secret',
            '/internal',
            '/metadata',
            '/.env',
            '/.git',
            '/proc/',
            '/sys/',
            '/dev/'
        ];
        
        for (const suspiciousPath of suspiciousPaths) {
            if (pathname.toLowerCase().includes(suspiciousPath)) {
                violations.push(`Suspicious path detected: ${suspiciousPath}`);
            }
        }
        
        return {
            isValid: violations.length === 0,
            violations: violations
        };
    }

    // ==================== NETWORK VALIDATION ====================

    /**
     * Validate IP address for network restrictions
     */
    validateIPAddress(ip) {
        const violations = [];
        
        // Check blocked IPs
        if (this.config.accessControl.blockedIPs.includes(ip)) {
            violations.push(`Blocked IP address: ${ip}`);
        }
        
        // Check for private networks
        if (this.config.networkSecurity.enablePrivateNetworkBlocking && this.isPrivateIP(ip)) {
            violations.push(`Private network access blocked: ${ip}`);
        }
        
        // Check for loopback addresses
        if (this.config.networkSecurity.enableLoopbackBlocking && this.isLoopbackIP(ip)) {
            violations.push(`Loopback address blocked: ${ip}`);
        }
        
        // Check for link-local addresses
        if (this.config.networkSecurity.enableLinkLocalBlocking && this.isLinkLocalIP(ip)) {
            violations.push(`Link-local address blocked: ${ip}`);
        }
        
        // Check for multicast addresses
        if (this.config.networkSecurity.enableMulticastBlocking && this.isMulticastIP(ip)) {
            violations.push(`Multicast address blocked: ${ip}`);
        }
        
        // Check for cloud metadata services
        if (this.config.networkSecurity.enableCloudMetadataBlocking && this.isCloudMetadataIP(ip)) {
            violations.push(`Cloud metadata service blocked: ${ip}`);
        }
        
        // Check against blocked networks
        for (const network of this.config.networkSecurity.blockedNetworks) {
            if (this.isIPInNetwork(ip, network)) {
                violations.push(`IP in blocked network: ${ip} (${network})`);
            }
        }
        
        return {
            isValid: violations.length === 0,
            violations: violations
        };
    }

    /**
     * Check if IP is private
     */
    isPrivateIP(ip) {
        const privateRanges = [
            { start: '10.0.0.0', end: '10.255.255.255' },
            { start: '172.16.0.0', end: '172.31.255.255' },
            { start: '192.168.0.0', end: '192.168.255.255' }
        ];
        
        return privateRanges.some(range => this.isIPInRange(ip, range.start, range.end));
    }

    /**
     * Check if IP is loopback
     */
    isLoopbackIP(ip) {
        return ip === '127.0.0.1' || ip === '::1' || ip.startsWith('127.');
    }

    /**
     * Check if IP is link-local
     */
    isLinkLocalIP(ip) {
        return ip.startsWith('169.254.') || ip.startsWith('fe80:');
    }

    /**
     * Check if IP is multicast
     */
    isMulticastIP(ip) {
        return ip.startsWith('224.') || ip.startsWith('ff');
    }

    /**
     * Check if IP is cloud metadata service
     */
    isCloudMetadataIP(ip) {
        const metadataIPs = [
            '169.254.169.254',  // AWS, Google Cloud
            '169.254.169.250',  // Azure
            '100.100.100.200'   // Alibaba Cloud
        ];
        
        return metadataIPs.includes(ip);
    }

    /**
     * Check if IP is in network range
     */
    isIPInNetwork(ip, network) {
        try {
            // Simplified CIDR check - in production, use proper IP library
            const [networkIP, prefixLength] = network.split('/');
            
            if (ip === networkIP) return true;
            
            // For now, check if IP starts with network prefix
            const ipParts = ip.split('.');
            const networkParts = networkIP.split('.');
            
            const bitsToCheck = Math.floor(parseInt(prefixLength) / 8);
            
            for (let i = 0; i < bitsToCheck && i < 4; i++) {
                if (ipParts[i] !== networkParts[i]) {
                    return false;
                }
            }
            
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Check if IP is in range
     */
    isIPInRange(ip, startIP, endIP) {
        // Simplified IP range check
        const ipNum = this.ipToNumber(ip);
        const startNum = this.ipToNumber(startIP);
        const endNum = this.ipToNumber(endIP);
        
        return ipNum >= startNum && ipNum <= endNum;
    }

    /**
     * Convert IP to number for comparison
     */
    ipToNumber(ip) {
        return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
    }

    // ==================== DNS SECURITY ====================

    /**
     * Resolve hostname with security checks
     */
    async resolveHostname(hostname) {
        try {
            // Check DNS cache first
            const cacheKey = hostname.toLowerCase();
            const cached = this.dnsCache.get(cacheKey);
            
            if (cached && Date.now() - cached.timestamp < 300000) { // 5 minute cache
                return cached.addresses;
            }
            
            // Perform DNS resolution with timeout
            const addresses = await Promise.race([
                dns.resolve4(hostname),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('DNS timeout')), this.config.dnsSecurity.dnsTimeout)
                )
            ]);
            
            // Cache the result
            this.dnsCache.set(cacheKey, {
                addresses: addresses,
                timestamp: Date.now()
            });
            
            return addresses;
            
        } catch (error) {
            console.error(`[OWASP-A10] DNS resolution failed for ${hostname}:`, error);
            throw error;
        }
    }

    /**
     * Validate against DNS rebinding attacks
     */
    async validateDNSRebinding(hostname) {
        try {
            const violations = [];
            
            // Check if hostname resolves to internal IPs
            const addresses = await this.resolveHostname(hostname);
            
            for (const ip of addresses) {
                if (this.isPrivateIP(ip) || this.isLoopbackIP(ip)) {
                    violations.push(`DNS rebinding attempt detected: ${hostname} resolves to internal IP ${ip}`);
                }
            }
            
            // Check for suspicious hostname patterns
            const suspiciousPatterns = [
                /\d+\.\d+\.\d+\.\d+/,  // IP address as hostname
                /localhost/i,
                /internal/i,
                /\.local$/i,
                /\.internal$/i
            ];
            
            for (const pattern of suspiciousPatterns) {
                if (pattern.test(hostname)) {
                    violations.push(`Suspicious hostname pattern: ${hostname}`);
                }
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations
            };
            
        } catch (error) {
            // DNS resolution failure is handled in resolveHostname
            return { isValid: true, violations: [] };
        }
    }

    // ==================== REQUEST FILTERING ====================

    /**
     * Filter outbound requests
     */
    async filterOutboundRequest(requestConfig) {
        try {
            const violations = [];
            
            // Validate destination URL
            const urlValidation = await this.validateUrl(requestConfig.url);
            if (!urlValidation.isValid) {
                violations.push(...urlValidation.violations);
            }
            
            // Check request method
            if (requestConfig.method && !['GET', 'POST', 'PUT', 'DELETE', 'HEAD'].includes(requestConfig.method.toUpperCase())) {
                violations.push(`Blocked HTTP method: ${requestConfig.method}`);
            }
            
            // Check request headers
            if (requestConfig.headers) {
                const headerValidation = this.validateRequestHeaders(requestConfig.headers);
                if (!headerValidation.isValid) {
                    violations.push(...headerValidation.violations);
                }
            }
            
            // Check request body size
            if (requestConfig.data && JSON.stringify(requestConfig.data).length > 1024 * 1024) { // 1MB
                violations.push('Request body too large');
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations,
                filteredRequest: this.sanitizeRequestConfig(requestConfig)
            };
            
        } catch (error) {
            console.error('[OWASP-A10] Request filtering failed:', error);
            return {
                isValid: false,
                violations: [`Request filtering error: ${error.message}`]
            };
        }
    }

    /**
     * Validate request headers
     */
    validateRequestHeaders(headers) {
        const violations = [];
        
        // Check for suspicious headers
        const suspiciousHeaders = [
            'x-forwarded-for',
            'x-real-ip',
            'x-forwarded-host',
            'x-forwarded-proto'
        ];
        
        for (const header of suspiciousHeaders) {
            if (headers[header]) {
                violations.push(`Suspicious header detected: ${header}`);
            }
        }
        
        // Check for authorization headers pointing to internal services
        if (headers.authorization && headers.authorization.includes('metadata')) {
            violations.push('Potentially malicious authorization header');
        }
        
        return {
            isValid: violations.length === 0,
            violations: violations
        };
    }

    /**
     * Sanitize request configuration
     */
    sanitizeRequestConfig(requestConfig) {
        const sanitized = { ...requestConfig };
        
        // Remove potentially dangerous headers
        if (sanitized.headers) {
            delete sanitized.headers['x-forwarded-for'];
            delete sanitized.headers['x-real-ip'];
            delete sanitized.headers['x-forwarded-host'];
            delete sanitized.headers['x-forwarded-proto'];
        }
        
        // Add security headers
        if (!sanitized.headers) {
            sanitized.headers = {};
        }
        
        sanitized.headers['User-Agent'] = 'RoboticsControl-SecureClient/1.0';
        sanitized.headers['X-Requested-With'] = 'RoboticsControl';
        
        return sanitized;
    }

    // ==================== REQUEST MONITORING ====================

    /**
     * Check request for SSRF attempts
     */
    async checkRequestForSSRF(req) {
        try {
            const violations = [];
            
            // Check URL parameters for potential SSRF targets
            for (const [key, value] of Object.entries(req.query || {})) {
                if (this.isUrlParameter(key, value)) {
                    const urlValidation = await this.validateUrl(value);
                    if (!urlValidation.isValid) {
                        violations.push(`SSRF attempt in query parameter ${key}: ${urlValidation.violations.join(', ')}`);
                    }
                }
            }
            
            // Check request body for potential SSRF targets
            if (req.body) {
                const bodyValidation = await this.checkRequestBodyForSSRF(req.body);
                if (!bodyValidation.isValid) {
                    violations.push(...bodyValidation.violations);
                }
            }
            
            // Check headers for SSRF indicators
            const headerValidation = this.checkHeadersForSSRF(req.headers);
            if (!headerValidation.isValid) {
                violations.push(...headerValidation.violations);
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations
            };
            
        } catch (error) {
            console.error('[OWASP-A10] SSRF request check failed:', error);
            return {
                isValid: false,
                violations: [`SSRF check error: ${error.message}`]
            };
        }
    }

    /**
     * Check if parameter contains URL
     */
    isUrlParameter(key, value) {
        if (typeof value !== 'string') return false;
        
        const urlParams = ['url', 'uri', 'link', 'href', 'src', 'target', 'redirect', 'callback', 'endpoint'];
        const keyLower = key.toLowerCase();
        
        return urlParams.some(param => keyLower.includes(param)) || 
               value.match(/^https?:\/\//i) || 
               value.match(/^ftp:\/\//i);
    }

    /**
     * Check request body for SSRF attempts
     */
    async checkRequestBodyForSSRF(body) {
        try {
            const violations = [];
            
            if (typeof body === 'object') {
                for (const [key, value] of Object.entries(body)) {
                    if (this.isUrlParameter(key, value)) {
                        const urlValidation = await this.validateUrl(value);
                        if (!urlValidation.isValid) {
                            violations.push(`SSRF attempt in body parameter ${key}: ${urlValidation.violations.join(', ')}`);
                        }
                    }
                    
                    // Recursively check nested objects
                    if (typeof value === 'object' && value !== null) {
                        const nestedValidation = await this.checkRequestBodyForSSRF(value);
                        if (!nestedValidation.isValid) {
                            violations.push(...nestedValidation.violations);
                        }
                    }
                }
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations
            };
            
        } catch (error) {
            console.error('[OWASP-A10] Request body SSRF check failed:', error);
            return {
                isValid: false,
                violations: [`Body SSRF check error: ${error.message}`]
            };
        }
    }

    /**
     * Check headers for SSRF indicators
     */
    checkHeadersForSSRF(headers) {
        const violations = [];
        
        // Check for host header manipulation
        if (headers.host && (this.isPrivateIP(headers.host) || headers.host.includes('localhost'))) {
            violations.push(`Suspicious host header: ${headers.host}`);
        }
        
        // Check for referer-based SSRF
        if (headers.referer) {
            try {
                const refererUrl = new URL(headers.referer);
                if (this.isPrivateIP(refererUrl.hostname) || refererUrl.hostname === 'localhost') {
                    violations.push(`Suspicious referer header: ${headers.referer}`);
                }
            } catch (refererError) {
                // Invalid referer URL - might be SSRF attempt
                violations.push(`Invalid referer header format: ${headers.referer}`);
            }
        }
        
        return {
            isValid: violations.length === 0,
            violations: violations
        };
    }

    /**
     * Check if request is outbound
     */
    isOutboundRequest(req) {
        // Check if request contains parameters that might trigger outbound requests
        const outboundIndicators = [
            '/api/webhook',
            '/api/callback',
            '/api/fetch',
            '/api/proxy',
            '/api/external'
        ];
        
        return outboundIndicators.some(indicator => req.path.includes(indicator)) ||
               Object.keys(req.query || {}).some(key => this.isUrlParameter(key, req.query[key]));
    }

    /**
     * Check rate limit for outbound requests
     */
    checkRateLimit(ip) {
        const now = Date.now();
        const windowMinute = Math.floor(now / 60000);
        const windowHour = Math.floor(now / 3600000);
        
        const minuteKey = `${ip}:${windowMinute}`;
        const hourKey = `${ip}:${windowHour}`;
        
        // Get current counts
        const minuteCount = this.requestCounts.get(minuteKey) || 0;
        const hourCount = this.requestCounts.get(hourKey) || 0;
        
        // Check limits
        if (minuteCount >= this.config.monitoring.maxRequestsPerMinute) {
            return {
                allowed: false,
                reason: 'Per-minute limit exceeded',
                retryAfter: 60 - (Math.floor(now / 1000) % 60)
            };
        }
        
        if (hourCount >= this.config.monitoring.maxRequestsPerHour) {
            return {
                allowed: false,
                reason: 'Per-hour limit exceeded',
                retryAfter: 3600 - (Math.floor(now / 1000) % 3600)
            };
        }
        
        // Increment counts
        this.requestCounts.set(minuteKey, minuteCount + 1);
        this.requestCounts.set(hourKey, hourCount + 1);
        
        // Cleanup old entries
        this.cleanupRateLimitCounters();
        
        return { allowed: true };
    }

    /**
     * Cleanup rate limit counters
     */
    cleanupRateLimitCounters() {
        const now = Date.now();
        const cutoffTime = now - 3600000; // 1 hour ago
        
        for (const [key, value] of this.requestCounts.entries()) {
            const keyTime = parseInt(key.split(':')[1]) * 60000; // Convert to milliseconds
            if (keyTime < cutoffTime) {
                this.requestCounts.delete(key);
            }
        }
    }

    // ==================== DESTINATION VALIDATION ====================

    /**
     * Validate destination
     */
    async validateDestination(destination) {
        try {
            // Parse destination URL
            const urlValidation = await this.validateUrl(destination);
            
            if (!urlValidation.isValid) {
                return urlValidation;
            }
            
            const parsedUrl = urlValidation.parsedUrl;
            
            // Check if destination is in allowed destinations
            const destinationKey = `${parsedUrl.hostname}:${parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80)}`;
            
            if (this.allowedDestinations.has(destinationKey)) {
                return { isValid: true, violations: [] };
            }
            
            // Additional network checks
            const networkValidation = await this.checkNetworkAccess(parsedUrl.hostname, parsedUrl.port);
            
            return networkValidation;
            
        } catch (error) {
            console.error('[OWASP-A10] Destination validation failed:', error);
            return {
                isValid: false,
                violations: [`Destination validation error: ${error.message}`]
            };
        }
    }

    /**
     * Check network access
     */
    async checkNetworkAccess(hostname, port) {
        try {
            const violations = [];
            
            // Resolve hostname
            const addresses = await this.resolveHostname(hostname);
            
            // Check each resolved IP
            for (const ip of addresses) {
                const ipValidation = this.validateIPAddress(ip);
                if (!ipValidation.isValid) {
                    violations.push(...ipValidation.violations);
                }
                
                // Check port accessibility (simplified)
                const portNum = parseInt(port) || 80;
                if (this.config.networkSecurity.blockedPorts.includes(portNum)) {
                    violations.push(`Blocked port access: ${portNum}`);
                }
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations,
                resolvedIPs: addresses
            };
            
        } catch (error) {
            console.error('[OWASP-A10] Network access check failed:', error);
            return {
                isValid: false,
                violations: [`Network access check error: ${error.message}`]
            };
        }
    }

    // ==================== MONITORING AND LOGGING ====================

    /**
     * Monitor request
     */
    monitorRequest(req, destination, result) {
        try {
            const requestLog = {
                id: uuidv4(),
                timestamp: new Date().toISOString(),
                source: {
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    path: req.path,
                    method: req.method
                },
                destination: destination,
                result: result,
                blocked: !result.isValid
            };
            
            this.requestHistory.set(requestLog.id, requestLog);
            
            // Keep only recent history
            if (this.requestHistory.size > 1000) {
                const entries = Array.from(this.requestHistory.entries());
                entries.slice(0, entries.length - 1000).forEach(([key]) => {
                    this.requestHistory.delete(key);
                });
            }
            
            // Log blocked requests
            if (!result.isValid) {
                console.warn(`[OWASP-A10] Blocked outbound request: ${req.ip} -> ${destination}`, result.violations);
            }
            
        } catch (error) {
            console.error('[OWASP-A10] Request monitoring failed:', error);
        }
    }

    /**
     * Log SSRF attempt
     */
    logSSRFAttempt(type, req, violations) {
        try {
            const attempt = {
                id: uuidv4(),
                type: type,
                timestamp: new Date().toISOString(),
                source: {
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    path: req.path,
                    method: req.method,
                    query: req.query,
                    body: req.body
                },
                violations: violations,
                severity: 'high'
            };
            
            this.ssrfAttempts.push(attempt);
            
            // Keep only recent attempts
            if (this.ssrfAttempts.length > 500) {
                this.ssrfAttempts = this.ssrfAttempts.slice(-500);
            }
            
            console.warn(`[OWASP-A10] SSRF attempt detected:`, attempt);
            
        } catch (error) {
            console.error('[OWASP-A10] SSRF attempt logging failed:', error);
        }
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Initialize allowed destinations
     */
    initializeAllowedDestinations() {
        // Add allowed domains with their default ports
        for (const domain of this.config.accessControl.allowedDomains) {
            this.allowedDestinations.add(`${domain}:443`);
            this.allowedDestinations.add(`${domain}:80`);
        }
        
        // Add explicitly allowed IPs
        for (const ip of this.config.accessControl.allowedIPs) {
            this.allowedDestinations.add(`${ip}:443`);
            this.allowedDestinations.add(`${ip}:80`);
        }
    }

    /**
     * Start SSRF monitoring
     */
    startSSRFMonitoring() {
        // Clean up old data every hour
        setInterval(() => {
            this.cleanupOldData();
        }, 60 * 60 * 1000);
        
        // Save SSRF data every 30 minutes
        setInterval(() => {
            this.saveSSRFData();
        }, 30 * 60 * 1000);
        
        // Clear DNS cache every 10 minutes
        setInterval(() => {
            this.cleanupDNSCache();
        }, 10 * 60 * 1000);
    }

    /**
     * Cleanup old data
     */
    cleanupOldData() {
        try {
            const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
            
            // Cleanup SSRF attempts
            this.ssrfAttempts = this.ssrfAttempts.filter(attempt => 
                new Date(attempt.timestamp) > cutoff
            );
            
            // Cleanup blocked requests
            this.blockedRequests = this.blockedRequests.filter(request => 
                new Date(request.timestamp) > cutoff
            );
            
            console.log('[OWASP-A10] Cleaned up old SSRF data');
            
        } catch (error) {
            console.error('[OWASP-A10] Data cleanup failed:', error);
        }
    }

    /**
     * Cleanup DNS cache
     */
    cleanupDNSCache() {
        try {
            const now = Date.now();
            const maxAge = 300000; // 5 minutes
            
            for (const [hostname, cacheEntry] of this.dnsCache.entries()) {
                if (now - cacheEntry.timestamp > maxAge) {
                    this.dnsCache.delete(hostname);
                }
            }
            
        } catch (error) {
            console.error('[OWASP-A10] DNS cache cleanup failed:', error);
        }
    }

    // ==================== DATA PERSISTENCE ====================

    async loadSSRFData() {
        try {
            const ssrfDataPath = './security-data/ssrf/ssrf-data.json';
            if (await fs.exists(ssrfDataPath)) {
                const data = await fs.readJSON(ssrfDataPath);
                this.ssrfAttempts = data.ssrfAttempts || [];
                this.blockedRequests = data.blockedRequests || [];
                console.log(`[OWASP-A10] Loaded ${this.ssrfAttempts.length} SSRF attempts and ${this.blockedRequests.length} blocked requests`);
            }
        } catch (error) {
            console.error('[OWASP-A10] Failed to load SSRF data:', error);
        }
    }

    async saveSSRFData() {
        try {
            const ssrfDataPath = './security-data/ssrf/ssrf-data.json';
            const data = {
                ssrfAttempts: this.ssrfAttempts,
                blockedRequests: this.blockedRequests,
                lastUpdated: new Date().toISOString()
            };
            await fs.writeJSON(ssrfDataPath, data, { spaces: 2 });
        } catch (error) {
            console.error('[OWASP-A10] Failed to save SSRF data:', error);
        }
    }

    // ==================== PUBLIC API ====================

    /**
     * Get SSRF prevention metrics
     */
    getSSRFMetrics() {
        return {
            totalSSRFAttempts: this.ssrfAttempts.length,
            recentSSRFAttempts: this.ssrfAttempts.filter(attempt => 
                new Date(attempt.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
            ).length,
            blockedRequests: this.blockedRequests.length,
            allowedDestinations: this.allowedDestinations.size,
            dnsCacheSize: this.dnsCache.size,
            requestHistorySize: this.requestHistory.size
        };
    }

    /**
     * Get recent SSRF attempts
     */
    getRecentSSRFAttempts(limit = 50) {
        return this.ssrfAttempts
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }

    /**
     * Get blocked requests
     */
    getBlockedRequests(limit = 50) {
        return this.blockedRequests
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }

    /**
     * Add allowed destination
     */
    addAllowedDestination(hostname, port = 443) {
        const destinationKey = `${hostname}:${port}`;
        this.allowedDestinations.add(destinationKey);
        console.log(`[OWASP-A10] Added allowed destination: ${destinationKey}`);
    }

    /**
     * Remove allowed destination
     */
    removeAllowedDestination(hostname, port = 443) {
        const destinationKey = `${hostname}:${port}`;
        this.allowedDestinations.delete(destinationKey);
        console.log(`[OWASP-A10] Removed allowed destination: ${destinationKey}`);
    }

    /**
     * Check if destination is allowed
     */
    isDestinationAllowed(hostname, port = 443) {
        const destinationKey = `${hostname}:${port}`;
        return this.allowedDestinations.has(destinationKey);
    }
}

module.exports = {
    SSRFPreventionManager,
    SSRF_CONFIG
};