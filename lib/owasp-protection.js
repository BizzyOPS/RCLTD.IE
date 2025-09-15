/**
 * OWASP Top 10 (2021) Comprehensive Protection System
 * Robotics & Control Ltd - Enterprise Security Implementation
 * 
 * This module consolidates all OWASP Top 10 security protections into an
 * integrated enterprise-grade security framework with compliance validation.
 */

const { AccessControlManager } = require('./owasp-a01-access-control');
const { CryptographicManager } = require('./owasp-a02-cryptographic');
const { InjectionPreventionManager } = require('./owasp-a03-injection');
const { InsecureDesignManager } = require('./owasp-a04-insecure-design');
const { MisconfigurationManager } = require('./owasp-a05-misconfiguration');
const { VulnerableComponentsManager } = require('./owasp-a06-vulnerable-components');
const { AuthenticationManager } = require('./owasp-a07-authentication');
const { IntegrityManager } = require('./owasp-a08-integrity');
const { EnhancedSecurityLoggingManager } = require('./owasp-a09-logging');
const { SSRFPreventionManager } = require('./owasp-a10-ssrf');

const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

// ==================== OWASP PROTECTION CONFIGURATION ====================

const OWASP_PROTECTION_CONFIG = {
    // Global protection settings
    global: {
        enableAllProtections: true,
        enableComplianceMode: true,
        enableRealTimeMonitoring: true,
        enableAutomatedResponse: true,
        enablePerformanceOptimization: true,
        enableDetailedLogging: true
    },
    
    // Individual OWASP protection toggles
    protections: {
        a01_access_control: true,
        a02_cryptographic: true,
        a03_injection: true,
        a04_insecure_design: true,
        a05_misconfiguration: true,
        a06_vulnerable_components: true,
        a07_authentication: true,
        a08_integrity: true,
        a09_logging: true,
        a10_ssrf: true
    },
    
    // Compliance frameworks
    compliance: {
        enableOWASPCompliance: true,
        enableGDPRCompliance: true,
        enableISO27001Compliance: true,
        enableSOXCompliance: true,
        enablePCIDSSCompliance: false, // Enable if payment processing
        generateComplianceReports: true,
        complianceAuditLevel: 'comprehensive' // 'basic', 'standard', 'comprehensive'
    },
    
    // Performance and optimization
    performance: {
        enableCaching: true,
        cacheTimeout: 300000, // 5 minutes
        enableAsyncProcessing: true,
        maxConcurrentChecks: 100,
        requestTimeout: 30000,
        enableResourcePooling: true
    },
    
    // Alerting and notifications
    alerting: {
        enableRealTimeAlerts: true,
        enableEmailAlerts: false, // Configure email settings if needed
        enableWebhookAlerts: false, // Configure webhook settings if needed
        alertThresholds: {
            critical: 1,      // Immediate alert
            high: 3,          // Alert after 3 occurrences
            medium: 10,       // Alert after 10 occurrences
            low: 50           // Alert after 50 occurrences
        }
    }
};

// ==================== OWASP PROTECTION MANAGER CLASS ====================

class OWASPProtectionManager {
    constructor(securityMonitor, config = OWASP_PROTECTION_CONFIG) {
        this.config = config;
        this.securityMonitor = securityMonitor;
        
        // Initialize protection managers
        this.managers = {};
        this.complianceData = new Map();
        this.protectionStats = new Map();
        this.alertHistory = [];
        this.performanceMetrics = new Map();
        
        // Protection status tracking
        this.protectionStatus = {
            initialized: false,
            activeProtections: 0,
            totalThreatsBlocked: 0,
            lastComplianceCheck: null,
            systemHealth: 'unknown'
        };
    }

    /**
     * Initialize comprehensive OWASP protection system
     */
    async initialize() {
        try {
            console.log('[OWASP-PROTECTION] Initializing comprehensive OWASP Top 10 protection system...');
            
            // Initialize protection managers
            await this.initializeProtectionManagers();
            
            // Initialize compliance system
            await this.initializeComplianceSystem();
            
            // Initialize monitoring and alerting
            await this.initializeMonitoringSystem();
            
            // Load existing data
            await this.loadProtectionData();
            
            // Perform initial compliance validation
            await this.performInitialComplianceCheck();
            
            // Mark system as initialized
            this.protectionStatus.initialized = true;
            this.protectionStatus.systemHealth = 'healthy';
            
            console.log('[OWASP-PROTECTION] OWASP Top 10 protection system initialized successfully');
            console.log(`[OWASP-PROTECTION] Active protections: ${this.protectionStatus.activeProtections}/10`);
            
            return true;
            
        } catch (error) {
            console.error('[OWASP-PROTECTION] Failed to initialize OWASP protection system:', error);
            this.protectionStatus.systemHealth = 'error';
            throw error;
        }
    }

    /**
     * Initialize individual protection managers
     */
    async initializeProtectionManagers() {
        const initPromises = [];
        
        // A01: Access Control
        if (this.config.protections.a01_access_control) {
            const accessControl = new AccessControlManager();
            accessControl.securityMonitor = this.securityMonitor;
            initPromises.push(
                accessControl.initialize().then(() => {
                    this.managers.accessControl = accessControl;
                    this.protectionStatus.activeProtections++;
                    console.log('[OWASP-PROTECTION] A01 Access Control initialized');
                })
            );
        }
        
        // A02: Cryptographic Failures
        if (this.config.protections.a02_cryptographic) {
            const cryptographic = new CryptographicManager();
            initPromises.push(
                cryptographic.initialize().then(() => {
                    this.managers.cryptographic = cryptographic;
                    this.protectionStatus.activeProtections++;
                    console.log('[OWASP-PROTECTION] A02 Cryptographic protection initialized');
                })
            );
        }
        
        // A03: Injection Prevention
        if (this.config.protections.a03_injection) {
            const injection = new InjectionPreventionManager();
            initPromises.push(
                injection.initialize().then(() => {
                    this.managers.injection = injection;
                    this.protectionStatus.activeProtections++;
                    console.log('[OWASP-PROTECTION] A03 Injection prevention initialized');
                })
            );
        }
        
        // A04: Insecure Design
        if (this.config.protections.a04_insecure_design) {
            const insecureDesign = new InsecureDesignManager();
            initPromises.push(
                insecureDesign.initialize().then(() => {
                    this.managers.insecureDesign = insecureDesign;
                    this.protectionStatus.activeProtections++;
                    console.log('[OWASP-PROTECTION] A04 Insecure Design protection initialized');
                })
            );
        }
        
        // A05: Security Misconfiguration
        if (this.config.protections.a05_misconfiguration) {
            const misconfiguration = new MisconfigurationManager();
            initPromises.push(
                misconfiguration.initialize().then(() => {
                    this.managers.misconfiguration = misconfiguration;
                    this.protectionStatus.activeProtections++;
                    console.log('[OWASP-PROTECTION] A05 Misconfiguration protection initialized');
                })
            );
        }
        
        // A06: Vulnerable Components
        if (this.config.protections.a06_vulnerable_components) {
            const vulnerableComponents = new VulnerableComponentsManager();
            initPromises.push(
                vulnerableComponents.initialize().then(() => {
                    this.managers.vulnerableComponents = vulnerableComponents;
                    this.protectionStatus.activeProtections++;
                    console.log('[OWASP-PROTECTION] A06 Vulnerable Components protection initialized');
                })
            );
        }
        
        // A07: Authentication Failures
        if (this.config.protections.a07_authentication) {
            const authentication = new AuthenticationManager();
            authentication.securityMonitor = this.securityMonitor;
            initPromises.push(
                authentication.initialize().then(() => {
                    this.managers.authentication = authentication;
                    this.protectionStatus.activeProtections++;
                    console.log('[OWASP-PROTECTION] A07 Authentication protection initialized');
                })
            );
        }
        
        // A08: Software and Data Integrity
        if (this.config.protections.a08_integrity) {
            const integrity = new IntegrityManager();
            initPromises.push(
                integrity.initialize().then(() => {
                    this.managers.integrity = integrity;
                    this.protectionStatus.activeProtections++;
                    console.log('[OWASP-PROTECTION] A08 Integrity protection initialized');
                })
            );
        }
        
        // A09: Security Logging and Monitoring
        if (this.config.protections.a09_logging) {
            const logging = new EnhancedSecurityLoggingManager();
            logging.securityMonitor = this.securityMonitor;
            initPromises.push(
                logging.initialize().then(() => {
                    this.managers.logging = logging;
                    this.protectionStatus.activeProtections++;
                    console.log('[OWASP-PROTECTION] A09 Enhanced Logging initialized');
                })
            );
        }
        
        // A10: Server-Side Request Forgery
        if (this.config.protections.a10_ssrf) {
            const ssrf = new SSRFPreventionManager();
            initPromises.push(
                ssrf.initialize().then(() => {
                    this.managers.ssrf = ssrf;
                    this.protectionStatus.activeProtections++;
                    console.log('[OWASP-PROTECTION] A10 SSRF prevention initialized');
                })
            );
        }
        
        // Wait for all initializations to complete
        await Promise.all(initPromises);
    }

    /**
     * Initialize compliance system
     */
    async initializeComplianceSystem() {
        try {
            await fs.ensureDir('./security-data/compliance');
            await fs.ensureDir('./compliance-reports');
            
            // Load existing compliance data
            await this.loadComplianceData();
            
            console.log('[OWASP-PROTECTION] Compliance system initialized');
            
        } catch (error) {
            console.error('[OWASP-PROTECTION] Compliance system initialization failed:', error);
        }
    }

    /**
     * Initialize monitoring system
     */
    async initializeMonitoringSystem() {
        try {
            // Start performance monitoring
            this.startPerformanceMonitoring();
            
            // Start health checks
            this.startHealthChecks();
            
            // Start compliance monitoring
            this.startComplianceMonitoring();
            
            console.log('[OWASP-PROTECTION] Monitoring system initialized');
            
        } catch (error) {
            console.error('[OWASP-PROTECTION] Monitoring system initialization failed:', error);
        }
    }

    /**
     * Main middleware factory for OWASP protections
     */
    middleware() {
        return async (req, res, next) => {
            const startTime = Date.now();
            
            try {
                // Add OWASP protection methods to request
                req.owaspProtection = {
                    checkCompliance: this.checkCompliance.bind(this),
                    validateSecurity: this.validateSecurity.bind(this),
                    logSecurityEvent: this.logSecurityEvent.bind(this),
                    generateSecurityReport: this.generateSecurityReport.bind(this)
                };
                
                // Apply protection middlewares in order
                await this.applyOWASPProtections(req, res);
                
                // Log request processing
                await this.logRequestProcessing(req, startTime);
                
                next();
                
            } catch (error) {
                console.error('[OWASP-PROTECTION] Middleware error:', error);
                
                // Log security incident
                await this.logSecurityIncident('MIDDLEWARE_ERROR', {
                    error: error.message,
                    stack: error.stack,
                    request: {
                        method: req.method,
                        url: req.url,
                        ip: req.ip
                    }
                });
                
                // Continue processing with error logged
                next();
            }
        };
    }

    /**
     * Apply OWASP protections to request
     */
    async applyOWASPProtections(req, res) {
        const protectionResults = [];
        
        // A09: Enhanced Logging (always first)
        if (this.managers.logging) {
            try {
                await this.applyMiddleware(this.managers.logging.middleware(), req, res);
                protectionResults.push({ protection: 'A09', status: 'applied' });
            } catch (error) {
                protectionResults.push({ protection: 'A09', status: 'error', error: error.message });
            }
        }
        
        // A01: Access Control
        if (this.managers.accessControl) {
            try {
                await this.applyMiddleware(this.managers.accessControl.middleware(), req, res);
                protectionResults.push({ protection: 'A01', status: 'applied' });
            } catch (error) {
                protectionResults.push({ protection: 'A01', status: 'error', error: error.message });
            }
        }
        
        // A07: Authentication
        if (this.managers.authentication) {
            try {
                await this.applyMiddleware(this.managers.authentication.middleware(), req, res);
                protectionResults.push({ protection: 'A07', status: 'applied' });
            } catch (error) {
                protectionResults.push({ protection: 'A07', status: 'error', error: error.message });
            }
        }
        
        // A03: Injection Prevention
        if (this.managers.injection) {
            try {
                await this.applyMiddleware(this.managers.injection.middleware(), req, res);
                protectionResults.push({ protection: 'A03', status: 'applied' });
            } catch (error) {
                protectionResults.push({ protection: 'A03', status: 'error', error: error.message });
            }
        }
        
        // A10: SSRF Prevention
        if (this.managers.ssrf) {
            try {
                await this.applyMiddleware(this.managers.ssrf.middleware(), req, res);
                protectionResults.push({ protection: 'A10', status: 'applied' });
            } catch (error) {
                protectionResults.push({ protection: 'A10', status: 'error', error: error.message });
            }
        }
        
        // A02: Cryptographic (for sensitive endpoints)
        if (this.managers.cryptographic && this.isSensitiveEndpoint(req)) {
            try {
                await this.applyMiddleware(this.managers.cryptographic.middleware(), req, res);
                protectionResults.push({ protection: 'A02', status: 'applied' });
            } catch (error) {
                protectionResults.push({ protection: 'A02', status: 'error', error: error.message });
            }
        }
        
        // A05: Misconfiguration checks
        if (this.managers.misconfiguration) {
            try {
                await this.applyMiddleware(this.managers.misconfiguration.middleware(), req, res);
                protectionResults.push({ protection: 'A05', status: 'applied' });
            } catch (error) {
                protectionResults.push({ protection: 'A05', status: 'error', error: error.message });
            }
        }
        
        // Store protection results in request for monitoring
        req.owaspProtectionResults = protectionResults;
    }

    /**
     * Helper to apply middleware with proper error handling
     */
    async applyMiddleware(middleware, req, res) {
        return new Promise((resolve, reject) => {
            try {
                middleware(req, res, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Check if endpoint is sensitive and requires additional protection
     */
    isSensitiveEndpoint(req) {
        const sensitivePatterns = [
            /\/admin/i,
            /\/api\/users/i,
            /\/api\/auth/i,
            /\/api\/payment/i,
            /\/api\/config/i,
            /\/login/i,
            /\/register/i,
            /\/profile/i
        ];
        
        return sensitivePatterns.some(pattern => pattern.test(req.url));
    }

    // ==================== COMPLIANCE VALIDATION ====================

    /**
     * Perform comprehensive OWASP compliance check
     */
    async checkCompliance() {
        try {
            const complianceId = uuidv4();
            const complianceCheck = {
                id: complianceId,
                timestamp: new Date().toISOString(),
                type: 'comprehensive',
                results: {}
            };
            
            // Check each OWASP protection
            for (const [key, manager] of Object.entries(this.managers)) {
                if (manager && manager.getComplianceStatus) {
                    try {
                        const status = await manager.getComplianceStatus();
                        complianceCheck.results[key] = {
                            compliant: status.compliant,
                            score: status.score,
                            issues: status.issues || [],
                            recommendations: status.recommendations || []
                        };
                    } catch (error) {
                        complianceCheck.results[key] = {
                            compliant: false,
                            score: 0,
                            error: error.message
                        };
                    }
                }
            }
            
            // Calculate overall compliance score
            const overallCompliance = this.calculateOverallCompliance(complianceCheck.results);
            complianceCheck.overallScore = overallCompliance.score;
            complianceCheck.overallCompliant = overallCompliance.compliant;
            complianceCheck.criticalIssues = overallCompliance.criticalIssues;
            
            // Store compliance data
            this.complianceData.set(complianceId, complianceCheck);
            
            // Update status
            this.protectionStatus.lastComplianceCheck = new Date().toISOString();
            
            // Generate compliance report if needed
            if (this.config.compliance.generateComplianceReports) {
                await this.generateComplianceReport(complianceCheck);
            }
            
            console.log(`[OWASP-PROTECTION] Compliance check completed: ${overallCompliance.score}% compliant`);
            
            return complianceCheck;
            
        } catch (error) {
            console.error('[OWASP-PROTECTION] Compliance check failed:', error);
            throw error;
        }
    }

    /**
     * Calculate overall compliance score
     */
    calculateOverallCompliance(results) {
        let totalScore = 0;
        let totalChecks = 0;
        let criticalIssues = [];
        
        for (const [protection, result] of Object.entries(results)) {
            if (result.score !== undefined) {
                totalScore += result.score;
                totalChecks++;
                
                if (result.issues) {
                    const critical = result.issues.filter(issue => issue.severity === 'critical');
                    criticalIssues.push(...critical);
                }
            }
        }
        
        const overallScore = totalChecks > 0 ? Math.round(totalScore / totalChecks) : 0;
        
        return {
            score: overallScore,
            compliant: overallScore >= 80, // 80% threshold for compliance
            criticalIssues: criticalIssues
        };
    }

    /**
     * Generate compliance report
     */
    async generateComplianceReport(complianceData) {
        try {
            const report = {
                reportId: uuidv4(),
                timestamp: new Date().toISOString(),
                organizationName: 'Robotics & Control Ltd',
                reportType: 'OWASP Top 10 (2021) Compliance',
                complianceData: complianceData,
                summary: {
                    overallScore: complianceData.overallScore,
                    compliant: complianceData.overallCompliant,
                    criticalIssues: complianceData.criticalIssues.length,
                    protectionsActive: this.protectionStatus.activeProtections,
                    threatsBlocked: this.protectionStatus.totalThreatsBlocked
                },
                recommendations: this.generateComplianceRecommendations(complianceData),
                nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
            };
            
            // Write report to file
            const reportFile = `./compliance-reports/owasp-compliance-${new Date().toISOString().split('T')[0]}.json`;
            await fs.writeJson(reportFile, report, { spaces: 2 });
            
            console.log(`[OWASP-PROTECTION] Compliance report generated: ${reportFile}`);
            
            return report;
            
        } catch (error) {
            console.error('[OWASP-PROTECTION] Compliance report generation failed:', error);
            throw error;
        }
    }

    /**
     * Generate compliance recommendations
     */
    generateComplianceRecommendations(complianceData) {
        const recommendations = [];
        
        for (const [protection, result] of Object.entries(complianceData.results)) {
            if (result.score < 80) {
                recommendations.push({
                    protection: protection,
                    priority: result.score < 50 ? 'high' : 'medium',
                    recommendation: `Improve ${protection} security posture`,
                    currentScore: result.score,
                    targetScore: 90,
                    issues: result.issues || []
                });
            }
        }
        
        return recommendations;
    }

    // ==================== SECURITY VALIDATION ====================

    /**
     * Validate security for a request/operation
     */
    async validateSecurity(context = {}) {
        try {
            const validation = {
                isValid: true,
                violations: [],
                score: 100,
                timestamp: new Date().toISOString()
            };
            
            // Basic security validation checks
            if (context.request) {
                const req = context.request;
                
                // Check for common security issues
                if (req.headers && req.headers['user-agent'] && 
                    /bot|crawler|spider/i.test(req.headers['user-agent'])) {
                    validation.score -= 10;
                    validation.violations.push('Automated request detected');
                }
                
                // Check for suspicious IP patterns
                if (req.ip && (req.ip.startsWith('127.') || req.ip === '::1')) {
                    // Local requests are generally safe
                } else if (req.ip && req.ip.includes('..')) {
                    validation.isValid = false;
                    validation.score = 0;
                    validation.violations.push('Malformed IP address');
                }
            }
            
            // Additional context-specific validations
            if (context.data) {
                // Validate data integrity if provided
                if (typeof context.data === 'object' && JSON.stringify(context.data).length > 10000) {
                    validation.score -= 20;
                    validation.violations.push('Large data payload detected');
                }
            }
            
            validation.isValid = validation.score >= 70; // 70% threshold for validity
            
            return validation;
            
        } catch (error) {
            console.error('[OWASP-PROTECTION] Security validation failed:', error);
            return {
                isValid: false,
                violations: [`Validation error: ${error.message}`],
                score: 0,
                timestamp: new Date().toISOString()
            };
        }
    }

    // ==================== SECURITY EVENT LOGGING ====================

    /**
     * Log security event with OWASP context
     */
    async logSecurityEvent(eventType, eventData) {
        try {
            const securityEvent = {
                id: uuidv4(),
                timestamp: new Date().toISOString(),
                type: eventType,
                owaspCategory: this.getOWASPCategory(eventType),
                severity: this.getEventSeverity(eventType),
                data: eventData,
                systemStatus: {
                    activeProtections: this.protectionStatus.activeProtections,
                    systemHealth: this.protectionStatus.systemHealth
                }
            };
            
            // Use enhanced logging if available
            if (this.managers.logging) {
                await this.managers.logging.logOWASPEvent(eventType, eventData);
            }
            
            // Update statistics
            this.updateSecurityStats(securityEvent);
            
            console.log(`[OWASP-PROTECTION] Security event logged: ${eventType} (${securityEvent.severity})`);
            
            return securityEvent;
            
        } catch (error) {
            console.error('[OWASP-PROTECTION] Security event logging failed:', error);
        }
    }

    /**
     * Log security incident
     */
    async logSecurityIncident(incidentType, incidentData) {
        try {
            // Use enhanced logging if available
            if (this.managers.logging) {
                await this.managers.logging.createIncident(incidentType, incidentData, 'medium');
            }
            
            // Log as security event
            await this.logSecurityEvent('SECURITY_INCIDENT', {
                incidentType: incidentType,
                ...incidentData
            });
            
        } catch (error) {
            console.error('[OWASP-PROTECTION] Security incident logging failed:', error);
        }
    }

    /**
     * Get OWASP category for event type
     */
    getOWASPCategory(eventType) {
        const categoryMap = {
            'ACCESS_DENIED': 'A01',
            'CRYPTO_FAILURE': 'A02', 
            'INJECTION_ATTEMPT': 'A03',
            'DESIGN_VIOLATION': 'A04',
            'CONFIG_ERROR': 'A05',
            'COMPONENT_VULNERABILITY': 'A06',
            'AUTH_FAILURE': 'A07',
            'INTEGRITY_VIOLATION': 'A08',
            'SECURITY_INCIDENT': 'A09',
            'SSRF_ATTEMPT': 'A10'
        };
        
        return categoryMap[eventType] || 'GENERAL';
    }

    /**
     * Get event severity
     */
    getEventSeverity(eventType) {
        const severityMap = {
            'ACCESS_DENIED': 'high',
            'CRYPTO_FAILURE': 'critical',
            'INJECTION_ATTEMPT': 'high',
            'DESIGN_VIOLATION': 'medium',
            'CONFIG_ERROR': 'medium',
            'COMPONENT_VULNERABILITY': 'high',
            'AUTH_FAILURE': 'medium',
            'INTEGRITY_VIOLATION': 'critical',
            'SECURITY_INCIDENT': 'medium',
            'SSRF_ATTEMPT': 'high',
            'MIDDLEWARE_ERROR': 'low'
        };
        
        return severityMap[eventType] || 'info';
    }

    // ==================== MONITORING AND HEALTH CHECKS ====================

    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        setInterval(async () => {
            try {
                const metrics = await this.collectPerformanceMetrics();
                this.performanceMetrics.set(Date.now(), metrics);
                
                // Keep only last hour of metrics
                const oneHourAgo = Date.now() - 60 * 60 * 1000;
                for (const [timestamp] of this.performanceMetrics) {
                    if (timestamp < oneHourAgo) {
                        this.performanceMetrics.delete(timestamp);
                    }
                }
            } catch (error) {
                console.error('[OWASP-PROTECTION] Performance monitoring error:', error);
            }
        }, 60000); // Every minute
    }

    /**
     * Start health checks
     */
    startHealthChecks() {
        setInterval(async () => {
            try {
                const health = await this.performHealthCheck();
                this.protectionStatus.systemHealth = health.status;
                
                if (health.status !== 'healthy') {
                    await this.logSecurityEvent('SYSTEM_HEALTH_DEGRADED', health);
                }
            } catch (error) {
                console.error('[OWASP-PROTECTION] Health check error:', error);
                this.protectionStatus.systemHealth = 'error';
            }
        }, 300000); // Every 5 minutes
    }

    /**
     * Start compliance monitoring
     */
    startComplianceMonitoring() {
        // Perform compliance check every 24 hours
        setInterval(async () => {
            try {
                await this.checkCompliance();
            } catch (error) {
                console.error('[OWASP-PROTECTION] Compliance monitoring error:', error);
            }
        }, 24 * 60 * 60 * 1000); // Every 24 hours
    }

    /**
     * Perform system health check
     */
    async performHealthCheck() {
        try {
            const health = {
                timestamp: new Date().toISOString(),
                status: 'healthy',
                checks: [],
                issues: []
            };
            
            // Check each manager
            for (const [key, manager] of Object.entries(this.managers)) {
                if (manager) {
                    const managerHealth = {
                        manager: key,
                        status: 'healthy'
                    };
                    
                    // Basic health check
                    if (typeof manager.healthCheck === 'function') {
                        try {
                            const result = await manager.healthCheck();
                            managerHealth.status = result.status;
                            if (result.issues) {
                                managerHealth.issues = result.issues;
                                health.issues.push(...result.issues);
                            }
                        } catch (error) {
                            managerHealth.status = 'error';
                            managerHealth.error = error.message;
                            health.issues.push(`${key}: ${error.message}`);
                        }
                    }
                    
                    health.checks.push(managerHealth);
                }
            }
            
            // Determine overall health
            const unhealthyManagers = health.checks.filter(check => check.status !== 'healthy');
            if (unhealthyManagers.length > 0) {
                health.status = unhealthyManagers.length > 2 ? 'critical' : 'degraded';
            }
            
            return health;
            
        } catch (error) {
            return {
                timestamp: new Date().toISOString(),
                status: 'error',
                error: error.message
            };
        }
    }

    /**
     * Collect performance metrics
     */
    async collectPerformanceMetrics() {
        return {
            timestamp: new Date().toISOString(),
            memoryUsage: process.memoryUsage(),
            activeProtections: this.protectionStatus.activeProtections,
            totalThreatsBlocked: this.protectionStatus.totalThreatsBlocked,
            systemHealth: this.protectionStatus.systemHealth,
            requestsProcessed: this.getRequestsProcessed()
        };
    }

    // ==================== DATA MANAGEMENT ====================

    /**
     * Load protection data
     */
    async loadProtectionData() {
        try {
            const dataFile = './security-data/owasp-protection.json';
            
            if (await fs.pathExists(dataFile)) {
                const data = await fs.readJson(dataFile);
                
                if (data.protectionStats) {
                    this.protectionStats = new Map(Object.entries(data.protectionStats));
                }
                
                if (data.protectionStatus) {
                    Object.assign(this.protectionStatus, data.protectionStatus);
                }
                
                console.log('[OWASP-PROTECTION] Protection data loaded');
            }
        } catch (error) {
            console.error('[OWASP-PROTECTION] Failed to load protection data:', error);
        }
    }

    /**
     * Load compliance data
     */
    async loadComplianceData() {
        try {
            const dataFile = './security-data/compliance/compliance-data.json';
            
            if (await fs.pathExists(dataFile)) {
                const data = await fs.readJson(dataFile);
                
                if (data.complianceData) {
                    this.complianceData = new Map(Object.entries(data.complianceData));
                }
                
                console.log('[OWASP-PROTECTION] Compliance data loaded');
            }
        } catch (error) {
            console.error('[OWASP-PROTECTION] Failed to load compliance data:', error);
        }
    }

    /**
     * Save protection data
     */
    async saveProtectionData() {
        try {
            const data = {
                timestamp: new Date().toISOString(),
                protectionStats: Object.fromEntries(this.protectionStats),
                protectionStatus: this.protectionStatus,
                performanceMetrics: Object.fromEntries(this.performanceMetrics)
            };
            
            await fs.writeJson('./security-data/owasp-protection.json', data, { spaces: 2 });
            
        } catch (error) {
            console.error('[OWASP-PROTECTION] Failed to save protection data:', error);
        }
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Update security statistics
     */
    updateSecurityStats(securityEvent) {
        const category = securityEvent.owaspCategory;
        
        if (!this.protectionStats.has(category)) {
            this.protectionStats.set(category, {
                events: 0,
                threats: 0,
                lastEvent: null
            });
        }
        
        const stats = this.protectionStats.get(category);
        stats.events++;
        
        if (securityEvent.type.includes('ATTEMPT') || securityEvent.type.includes('BLOCKED')) {
            stats.threats++;
            this.protectionStatus.totalThreatsBlocked++;
        }
        
        stats.lastEvent = securityEvent.timestamp;
    }

    /**
     * Log request processing
     */
    async logRequestProcessing(req, startTime) {
        const processingTime = Date.now() - startTime;
        
        // Log performance metrics
        if (processingTime > 1000) { // Log slow requests
            await this.logSecurityEvent('SLOW_REQUEST_PROCESSING', {
                url: req.url,
                method: req.method,
                processingTime: processingTime,
                protectionResults: req.owaspProtectionResults
            });
        }
    }

    /**
     * Get requests processed count
     */
    getRequestsProcessed() {
        return Array.from(this.protectionStats.values())
            .reduce((total, stats) => total + stats.events, 0);
    }

    /**
     * Perform initial compliance check
     */
    async performInitialComplianceCheck() {
        try {
            console.log('[OWASP-PROTECTION] Performing initial compliance validation...');
            const compliance = await this.checkCompliance();
            
            if (compliance.overallCompliant) {
                console.log(`[OWASP-PROTECTION] ✓ System is OWASP compliant (${compliance.overallScore}%)`);
            } else {
                console.warn(`[OWASP-PROTECTION] ⚠ System compliance needs improvement (${compliance.overallScore}%)`);
                console.warn(`[OWASP-PROTECTION] Critical issues: ${compliance.criticalIssues.length}`);
            }
            
        } catch (error) {
            console.error('[OWASP-PROTECTION] Initial compliance check failed:', error);
        }
    }

    // ==================== PUBLIC API ====================

    /**
     * Get system status
     */
    getStatus() {
        return {
            initialized: this.protectionStatus.initialized,
            systemHealth: this.protectionStatus.systemHealth,
            activeProtections: this.protectionStatus.activeProtections,
            totalThreatsBlocked: this.protectionStatus.totalThreatsBlocked,
            lastComplianceCheck: this.protectionStatus.lastComplianceCheck,
            protectionStats: Object.fromEntries(this.protectionStats)
        };
    }

    /**
     * Generate security report
     */
    async generateSecurityReport() {
        try {
            const report = {
                reportId: uuidv4(),
                timestamp: new Date().toISOString(),
                organizationName: 'Robotics & Control Ltd',
                reportType: 'OWASP Security Status Report',
                systemStatus: this.getStatus(),
                complianceStatus: await this.checkCompliance(),
                healthStatus: await this.performHealthCheck(),
                performanceMetrics: Object.fromEntries(this.performanceMetrics),
                recommendations: this.generateSecurityRecommendations()
            };
            
            return report;
            
        } catch (error) {
            console.error('[OWASP-PROTECTION] Security report generation failed:', error);
            throw error;
        }
    }

    /**
     * Generate security recommendations
     */
    generateSecurityRecommendations() {
        const recommendations = [];
        
        // Check system health
        if (this.protectionStatus.systemHealth !== 'healthy') {
            recommendations.push({
                priority: 'high',
                category: 'system_health',
                recommendation: 'Investigate and resolve system health issues',
                details: 'System health is not optimal, review logs and manager status'
            });
        }
        
        // Check protection coverage
        if (this.protectionStatus.activeProtections < 10) {
            recommendations.push({
                priority: 'medium',
                category: 'protection_coverage',
                recommendation: 'Enable missing OWASP protections',
                details: `${10 - this.protectionStatus.activeProtections} protections are not active`
            });
        }
        
        return recommendations;
    }
}

module.exports = OWASPProtectionManager;