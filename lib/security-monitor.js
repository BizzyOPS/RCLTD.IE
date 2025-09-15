/**
 * Real-time Security Monitoring System
 * Robotics & Control Ltd - Enterprise Security Monitoring
 * 
 * This module provides real-time security event monitoring, attack pattern detection,
 * and automated threat response for the Express server.
 */

const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { detectMaliciousPatterns, validateUserAgent } = require('./validation');

// ==================== SECURITY MONITORING CONFIGURATION ====================

const SECURITY_CONFIG = {
    // Attack detection thresholds
    thresholds: {
        requestsPerMinute: 100,
        suspiciousRequestsPerMinute: 10,
        failedAttemptsPerHour: 50,
        uniqueIpsPerHour: 1000,
        largePayloadThreshold: 1024 * 1024, // 1MB
        suspiciousUserAgents: 5
    },
    
    // Monitoring settings
    monitoring: {
        enabled: true,
        realTimeAlerts: true,
        logToFile: true,
        logToConsole: true,
        retentionDays: 30
    },
    
    // Response actions
    responses: {
        autoBlock: false,    // Set to true for automatic IP blocking
        alertAdmins: true,
        logAllRequests: false, // Set to true for comprehensive logging
        rateLimitAggressive: true
    },
    
    // File paths
    paths: {
        securityLogs: './security-logs',
        alertLogs: './security-logs/alerts',
        metrics: './security-logs/metrics',
        blockedIps: './security-logs/blocked-ips.json'
    }
};

// ==================== SECURITY MONITOR CLASS ====================

class SecurityMonitor {
    constructor(config = SECURITY_CONFIG) {
        this.config = config;
        this.metrics = new Map();
        this.suspiciousIps = new Map();
        this.blockedIps = new Set();
        this.attackPatterns = new Map();
        this.alertHistory = [];
        
        // Initialize tracking windows
        this.requestsWindow = new Map(); // IP -> request timestamps
        this.suspiciousWindow = new Map(); // IP -> suspicious activity timestamps
        this.userAgentTracking = new Map(); // IP -> User-Agent patterns
        
        // Initialize system
        this.initialize();
        
        // Start cleanup intervals
        this.startCleanupIntervals();
    }

    /**
     * Initialize the security monitoring system
     */
    async initialize() {
        try {
            // Ensure log directories exist
            await fs.ensureDir(this.config.paths.securityLogs);
            await fs.ensureDir(this.config.paths.alertLogs);
            await fs.ensureDir(this.config.paths.metrics);
            
            // Load blocked IPs if file exists
            await this.loadBlockedIps();
            
            console.log('[SECURITY-MONITOR] Security monitoring system initialized');
            console.log(`[SECURITY-MONITOR] Real-time alerts: ${this.config.monitoring.realTimeAlerts}`);
            console.log(`[SECURITY-MONITOR] Auto-blocking: ${this.config.responses.autoBlock}`);
            
        } catch (error) {
            console.error('[SECURITY-MONITOR] Failed to initialize:', error);
            throw error;
        }
    }

    /**
     * Main middleware for Express to monitor all requests
     */
    middleware() {
        return (req, res, next) => {
            const startTime = Date.now();
            const requestId = uuidv4();
            
            // Add request ID to request object
            req.securityRequestId = requestId;
            
            // Check if IP is blocked
            if (this.isIpBlocked(req.ip)) {
                console.warn(`[SECURITY-MONITOR] Blocked IP ${req.ip} attempted access`);
                return res.status(403).json({ 
                    error: 'Access denied',
                    requestId: requestId,
                    timestamp: new Date().toISOString()
                });
            }
            
            // Create security context for this request
            const securityContext = this.createSecurityContext(req);
            
            // Analyze request for threats
            const threatAnalysis = this.analyzeThreat(req, securityContext);
            
            // Update metrics
            this.updateMetrics(req.ip, threatAnalysis);
            
            // Log if suspicious or logging enabled
            if (threatAnalysis.isSuspicious || this.config.responses.logAllRequests) {
                this.logSecurityEvent(req, threatAnalysis, requestId);
            }
            
            // Handle suspicious activity
            if (threatAnalysis.isSuspicious) {
                this.handleSuspiciousActivity(req, threatAnalysis, requestId);
            }
            
            // Monitor response
            const originalSend = res.send;
            const monitor = this; // Capture SecurityMonitor instance
            res.send = function(data) {
                const responseTime = Date.now() - startTime;
                
                // Log response metrics using captured monitor instance
                monitor.logResponseMetrics(req, res, responseTime, threatAnalysis);
                
                return originalSend.call(this, data);
            };
            
            next();
        };
    }

    /**
     * Create security context for request analysis
     */
    createSecurityContext(req) {
        const ip = req.ip;
        const userAgent = req.get('User-Agent') || '';
        const now = Date.now();
        
        return {
            ip: ip,
            userAgent: userAgent,
            timestamp: now,
            url: req.url,
            method: req.method,
            headers: req.headers,
            body: req.body,
            query: req.query,
            contentLength: parseInt(req.get('Content-Length') || '0'),
            referer: req.get('Referer') || '',
            forwardedFor: req.get('X-Forwarded-For') || '',
            realIp: req.get('X-Real-IP') || '',
            
            // Request frequency data
            recentRequests: this.getRecentRequests(ip),
            recentSuspicious: this.getRecentSuspicious(ip),
            userAgentHistory: this.getUserAgentHistory(ip)
        };
    }

    /**
     * Analyze request for security threats
     */
    analyzeThreat(req, context) {
        const threats = [];
        let riskScore = 0;
        let isSuspicious = false;
        
        // 1. Rate limiting analysis
        const rateLimitAnalysis = this.analyzeRateLimit(context);
        if (rateLimitAnalysis.suspicious) {
            threats.push('rate_limit_exceeded');
            riskScore += rateLimitAnalysis.score;
            isSuspicious = true;
        }
        
        // 2. Malicious content detection
        const contentAnalysis = this.analyzeContent(context);
        if (contentAnalysis.suspicious) {
            threats.push('malicious_content');
            riskScore += contentAnalysis.score;
            isSuspicious = true;
        }
        
        // 3. User-Agent analysis
        const userAgentAnalysis = this.analyzeUserAgent(context);
        if (userAgentAnalysis.suspicious) {
            threats.push('suspicious_user_agent');
            riskScore += userAgentAnalysis.score;
            isSuspicious = true;
        }
        
        // 4. Payload size analysis
        const payloadAnalysis = this.analyzePayload(context);
        if (payloadAnalysis.suspicious) {
            threats.push('large_payload');
            riskScore += payloadAnalysis.score;
        }
        
        // 5. Path traversal detection
        const pathAnalysis = this.analyzePath(context);
        if (pathAnalysis.suspicious) {
            threats.push('path_traversal');
            riskScore += pathAnalysis.score;
            isSuspicious = true;
        }
        
        // 6. SQL injection detection
        const sqlAnalysis = this.analyzeSqlInjection(context);
        if (sqlAnalysis.suspicious) {
            threats.push('sql_injection');
            riskScore += sqlAnalysis.score;
            isSuspicious = true;
        }
        
        // 7. XSS detection
        const xssAnalysis = this.analyzeXSS(context);
        if (xssAnalysis.suspicious) {
            threats.push('xss_attempt');
            riskScore += xssAnalysis.score;
            isSuspicious = true;
        }
        
        // 8. Bot detection
        const botAnalysis = this.analyzeBot(context);
        if (botAnalysis.suspicious) {
            threats.push('bot_activity');
            riskScore += botAnalysis.score;
        }
        
        return {
            isSuspicious: isSuspicious,
            threats: threats,
            riskScore: Math.min(riskScore, 100), // Cap at 100
            analyses: {
                rateLimit: rateLimitAnalysis,
                content: contentAnalysis,
                userAgent: userAgentAnalysis,
                payload: payloadAnalysis,
                path: pathAnalysis,
                sql: sqlAnalysis,
                xss: xssAnalysis,
                bot: botAnalysis
            }
        };
    }

    /**
     * Analyze rate limiting patterns
     */
    analyzeRateLimit(context) {
        const { ip, timestamp } = context;
        const recentRequests = context.recentRequests.length;
        const recentSuspicious = context.recentSuspicious.length;
        
        let suspicious = false;
        let score = 0;
        const issues = [];
        
        // Check requests per minute
        if (recentRequests > this.config.thresholds.requestsPerMinute) {
            suspicious = true;
            score += 30;
            issues.push(`${recentRequests} requests in last minute (threshold: ${this.config.thresholds.requestsPerMinute})`);
        }
        
        // Check suspicious activity frequency
        if (recentSuspicious > this.config.thresholds.suspiciousRequestsPerMinute) {
            suspicious = true;
            score += 50;
            issues.push(`${recentSuspicious} suspicious requests in last minute`);
        }
        
        return { suspicious, score, issues, metrics: { recentRequests, recentSuspicious } };
    }

    /**
     * Analyze request content for malicious patterns
     */
    analyzeContent(context) {
        const inputs = [
            context.url,
            JSON.stringify(context.query),
            JSON.stringify(context.body),
            context.referer
        ];
        
        let suspicious = false;
        let score = 0;
        const issues = [];
        
        inputs.forEach((input, index) => {
            const inputNames = ['URL', 'Query', 'Body', 'Referer'];
            
            if (detectMaliciousPatterns(input)) {
                suspicious = true;
                score += 40;
                issues.push(`Malicious pattern detected in ${inputNames[index]}`);
            }
        });
        
        return { suspicious, score, issues };
    }

    /**
     * Analyze User-Agent for suspicious patterns
     */
    analyzeUserAgent(context) {
        const { userAgent, ip } = context;
        
        let suspicious = false;
        let score = 0;
        const issues = [];
        
        // Validate User-Agent
        if (!validateUserAgent(userAgent)) {
            suspicious = true;
            score += 35;
            issues.push('Suspicious User-Agent pattern detected');
        }
        
        // Check for missing User-Agent
        if (!userAgent || userAgent.length === 0) {
            suspicious = true;
            score += 20;
            issues.push('Missing User-Agent header');
        }
        
        // Check for User-Agent switching (potential bot behavior)
        const history = context.userAgentHistory;
        if (history.size > 5) { // More than 5 different User-Agents from same IP
            suspicious = true;
            score += 25;
            issues.push(`Multiple User-Agents from same IP (${history.size})`);
        }
        
        return { suspicious, score, issues };
    }

    /**
     * Analyze payload size
     */
    analyzePayload(context) {
        const { contentLength } = context;
        
        let suspicious = false;
        let score = 0;
        const issues = [];
        
        if (contentLength > this.config.thresholds.largePayloadThreshold) {
            suspicious = true;
            score += 15;
            issues.push(`Large payload size: ${contentLength} bytes`);
        }
        
        return { suspicious, score, issues };
    }

    /**
     * Analyze for path traversal attempts
     */
    analyzePath(context) {
        const { url } = context;
        
        const pathTraversalPatterns = [
            /\.\.\//g,
            /\.\.\\+/g,
            /%2e%2e%2f/gi,
            /%2e%2e%5c/gi,
            /\/etc\/passwd/gi,
            /\/windows\/system32/gi
        ];
        
        let suspicious = false;
        let score = 0;
        const issues = [];
        
        pathTraversalPatterns.forEach(pattern => {
            if (pattern.test(url)) {
                suspicious = true;
                score += 45;
                issues.push('Path traversal pattern detected');
            }
        });
        
        return { suspicious, score, issues };
    }

    /**
     * Analyze for SQL injection attempts
     */
    analyzeSqlInjection(context) {
        const inputs = [
            context.url,
            JSON.stringify(context.query),
            JSON.stringify(context.body)
        ];
        
        const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\s+)/gi,
            /(\bUNION\s+SELECT\b)/gi,
            /'(\s*(OR|AND)\s+.*=)|('.*;\s*--)/gi,
            /(\s*(;|'|\"|`)\s*(DROP|DELETE|UPDATE|INSERT))/gi
        ];
        
        let suspicious = false;
        let score = 0;
        const issues = [];
        
        inputs.forEach(input => {
            sqlPatterns.forEach(pattern => {
                if (pattern.test(input)) {
                    suspicious = true;
                    score += 50;
                    issues.push('SQL injection pattern detected');
                }
            });
        });
        
        return { suspicious, score, issues };
    }

    /**
     * Analyze for XSS attempts
     */
    analyzeXSS(context) {
        const inputs = [
            context.url,
            JSON.stringify(context.query),
            JSON.stringify(context.body)
        ];
        
        const xssPatterns = [
            /<script[^>]*>.*?<\/script>/gi,
            /javascript\s*:/gi,
            /vbscript\s*:/gi,
            /on(load|error|click|focus|blur|mouseover|mouseout)\s*=/gi,
            /<iframe[^>]*>/gi,
            /<object[^>]*>/gi
        ];
        
        let suspicious = false;
        let score = 0;
        const issues = [];
        
        inputs.forEach(input => {
            xssPatterns.forEach(pattern => {
                if (pattern.test(input)) {
                    suspicious = true;
                    score += 45;
                    issues.push('XSS pattern detected');
                }
            });
        });
        
        return { suspicious, score, issues };
    }

    /**
     * Analyze for bot activity
     */
    analyzeBot(context) {
        const { userAgent, recentRequests } = context;
        
        const botPatterns = [
            /bot/gi,
            /crawler/gi,
            /spider/gi,
            /scraper/gi,
            /python-requests/gi,
            /curl/gi,
            /wget/gi
        ];
        
        let suspicious = false;
        let score = 0;
        const issues = [];
        
        // Check for bot User-Agent patterns
        botPatterns.forEach(pattern => {
            if (pattern.test(userAgent)) {
                score += 10; // Not necessarily suspicious, but noteworthy
                issues.push('Bot-like User-Agent detected');
            }
        });
        
        // High frequency requests might indicate bot activity
        if (recentRequests.length > 50) {
            suspicious = true;
            score += 20;
            issues.push('High-frequency requests indicative of bot activity');
        }
        
        return { suspicious, score, issues };
    }

    /**
     * Handle suspicious activity
     */
    async handleSuspiciousActivity(req, threatAnalysis, requestId) {
        const ip = req.ip;
        const timestamp = new Date().toISOString();
        
        // Update suspicious activity tracking
        if (!this.suspiciousWindow.has(ip)) {
            this.suspiciousWindow.set(ip, []);
        }
        this.suspiciousWindow.get(ip).push(Date.now());
        
        // Create security alert
        const alert = {
            id: uuidv4(),
            requestId: requestId,
            timestamp: timestamp,
            ip: ip,
            userAgent: req.get('User-Agent') || '',
            url: req.url,
            method: req.method,
            threats: threatAnalysis.threats,
            riskScore: threatAnalysis.riskScore,
            details: threatAnalysis.analyses
        };
        
        this.alertHistory.push(alert);
        
        // Log alert
        if (this.config.monitoring.logToConsole) {
            console.warn(`[SECURITY-ALERT] Suspicious activity from ${ip}: ${threatAnalysis.threats.join(', ')} (Risk: ${threatAnalysis.riskScore})`);
        }
        
        // Save alert to file
        if (this.config.monitoring.logToFile) {
            await this.saveSecurityAlert(alert);
        }
        
        // Check for auto-blocking
        if (this.config.responses.autoBlock && threatAnalysis.riskScore > 70) {
            await this.blockIp(ip, `High risk score: ${threatAnalysis.riskScore}`);
        }
        
        // Send real-time alerts
        if (this.config.monitoring.realTimeAlerts) {
            await this.sendRealTimeAlert(alert);
        }
    }

    /**
     * Update security metrics
     */
    updateMetrics(ip, threatAnalysis) {
        const now = Date.now();
        
        // Update request tracking
        if (!this.requestsWindow.has(ip)) {
            this.requestsWindow.set(ip, []);
        }
        this.requestsWindow.get(ip).push(now);
        
        // Update User-Agent tracking
        if (!this.userAgentTracking.has(ip)) {
            this.userAgentTracking.set(ip, new Set());
        }
        
        // Track overall metrics
        if (!this.metrics.has('daily')) {
            this.metrics.set('daily', {
                totalRequests: 0,
                suspiciousRequests: 0,
                blockedRequests: 0,
                uniqueIps: new Set(),
                threatTypes: new Map()
            });
        }
        
        const daily = this.metrics.get('daily');
        daily.totalRequests++;
        daily.uniqueIps.add(ip);
        
        if (threatAnalysis.isSuspicious) {
            daily.suspiciousRequests++;
            threatAnalysis.threats.forEach(threat => {
                daily.threatTypes.set(threat, (daily.threatTypes.get(threat) || 0) + 1);
            });
        }
    }

    /**
     * Get recent requests for an IP
     */
    getRecentRequests(ip) {
        const requests = this.requestsWindow.get(ip) || [];
        const oneMinuteAgo = Date.now() - 60000;
        return requests.filter(timestamp => timestamp > oneMinuteAgo);
    }

    /**
     * Get recent suspicious activity for an IP
     */
    getRecentSuspicious(ip) {
        const suspicious = this.suspiciousWindow.get(ip) || [];
        const oneMinuteAgo = Date.now() - 60000;
        return suspicious.filter(timestamp => timestamp > oneMinuteAgo);
    }

    /**
     * Get User-Agent history for an IP
     */
    getUserAgentHistory(ip) {
        return this.userAgentTracking.get(ip) || new Set();
    }

    /**
     * Check if IP is blocked
     */
    isIpBlocked(ip) {
        return this.blockedIps.has(ip);
    }

    /**
     * Block an IP address
     */
    async blockIp(ip, reason) {
        this.blockedIps.add(ip);
        
        const blockEntry = {
            ip: ip,
            reason: reason,
            timestamp: new Date().toISOString(),
            id: uuidv4()
        };
        
        console.warn(`[SECURITY-MONITOR] Blocked IP ${ip}: ${reason}`);
        
        // Save to persistent storage
        await this.saveBlockedIps();
        
        // Log the blocking action
        await this.logSecurityEvent({
            ip: ip,
            url: '/blocked',
            method: 'BLOCK',
            headers: {}
        }, {
            isSuspicious: true,
            threats: ['ip_blocked'],
            riskScore: 100
        }, blockEntry.id);
    }

    /**
     * Unblock an IP address
     */
    async unblockIp(ip) {
        this.blockedIps.delete(ip);
        console.log(`[SECURITY-MONITOR] Unblocked IP ${ip}`);
        await this.saveBlockedIps();
    }

    /**
     * Save blocked IPs to file
     */
    async saveBlockedIps() {
        try {
            const data = Array.from(this.blockedIps);
            await fs.writeJSON(this.config.paths.blockedIps, data, { spaces: 2 });
        } catch (error) {
            console.error('[SECURITY-MONITOR] Failed to save blocked IPs:', error);
        }
    }

    /**
     * Load blocked IPs from file
     */
    async loadBlockedIps() {
        try {
            if (await fs.exists(this.config.paths.blockedIps)) {
                const data = await fs.readJSON(this.config.paths.blockedIps);
                this.blockedIps = new Set(data);
                console.log(`[SECURITY-MONITOR] Loaded ${this.blockedIps.size} blocked IPs`);
            }
        } catch (error) {
            console.error('[SECURITY-MONITOR] Failed to load blocked IPs:', error);
        }
    }

    /**
     * Log security event to file
     */
    async logSecurityEvent(req, threatAnalysis, requestId) {
        try {
            const logEntry = {
                id: requestId,
                timestamp: new Date().toISOString(),
                ip: req.ip,
                userAgent: req.get ? req.get('User-Agent') : req.userAgent || '',
                method: req.method,
                url: req.url,
                headers: req.headers,
                body: req.body ? JSON.stringify(req.body).substring(0, 1000) : '',
                query: req.query ? JSON.stringify(req.query) : '',
                suspicious: threatAnalysis.isSuspicious,
                threats: threatAnalysis.threats,
                riskScore: threatAnalysis.riskScore
            };
            
            const date = new Date().toISOString().split('T')[0];
            const logFile = path.join(this.config.paths.securityLogs, `security-${date}.log`);
            
            await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n');
        } catch (error) {
            console.error('[SECURITY-MONITOR] Failed to log security event:', error);
        }
    }

    /**
     * Save security alert
     */
    async saveSecurityAlert(alert) {
        try {
            const date = new Date().toISOString().split('T')[0];
            const alertFile = path.join(this.config.paths.alertLogs, `alerts-${date}.json`);
            
            let alerts = [];
            if (await fs.exists(alertFile)) {
                alerts = await fs.readJSON(alertFile);
            }
            
            alerts.push(alert);
            await fs.writeJSON(alertFile, alerts, { spaces: 2 });
        } catch (error) {
            console.error('[SECURITY-MONITOR] Failed to save security alert:', error);
        }
    }

    /**
     * Log response metrics
     */
    logResponseMetrics(req, res, responseTime, threatAnalysis) {
        // Update response time metrics
        const daily = this.metrics.get('daily');
        if (daily) {
            if (!daily.responseTimes) daily.responseTimes = [];
            daily.responseTimes.push(responseTime);
            
            if (res.statusCode >= 400) {
                daily.errorResponses = (daily.errorResponses || 0) + 1;
            }
        }
    }

    /**
     * Send real-time alert
     */
    async sendRealTimeAlert(alert) {
        // Implementation for real-time alerting (Slack, email, etc.)
        console.log(`[SECURITY-ALERT] Real-time alert: ${alert.threats.join(', ')} from ${alert.ip}`);
    }

    /**
     * Start cleanup intervals
     */
    startCleanupIntervals() {
        // Clean up old request tracking data every 5 minutes
        setInterval(() => {
            this.cleanupTrackingData();
        }, 5 * 60 * 1000);
        
        // Clean up old log files daily
        setInterval(() => {
            this.cleanupOldLogs();
        }, 24 * 60 * 60 * 1000);
    }

    /**
     * Clean up old tracking data
     */
    cleanupTrackingData() {
        const oneHourAgo = Date.now() - 3600000;
        
        // Clean request windows
        for (const [ip, requests] of this.requestsWindow.entries()) {
            const recent = requests.filter(timestamp => timestamp > oneHourAgo);
            if (recent.length === 0) {
                this.requestsWindow.delete(ip);
            } else {
                this.requestsWindow.set(ip, recent);
            }
        }
        
        // Clean suspicious windows
        for (const [ip, suspicious] of this.suspiciousWindow.entries()) {
            const recent = suspicious.filter(timestamp => timestamp > oneHourAgo);
            if (recent.length === 0) {
                this.suspiciousWindow.delete(ip);
            } else {
                this.suspiciousWindow.set(ip, recent);
            }
        }
    }

    /**
     * Clean up old log files
     */
    async cleanupOldLogs() {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - this.config.monitoring.retentionDays);
            
            const logDirs = [
                this.config.paths.securityLogs,
                this.config.paths.alertLogs,
                this.config.paths.metrics
            ];
            
            for (const logDir of logDirs) {
                if (await fs.exists(logDir)) {
                    const files = await fs.readdir(logDir);
                    for (const file of files) {
                        const filePath = path.join(logDir, file);
                        const stats = await fs.stat(filePath);
                        
                        if (stats.mtime < cutoffDate) {
                            await fs.remove(filePath);
                            console.log(`[SECURITY-MONITOR] Cleaned up old log: ${file}`);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('[SECURITY-MONITOR] Failed to cleanup old logs:', error);
        }
    }

    /**
     * Get security metrics for dashboard
     */
    getSecurityMetrics() {
        const daily = this.metrics.get('daily') || {};
        
        return {
            totalRequests: daily.totalRequests || 0,
            suspiciousRequests: daily.suspiciousRequests || 0,
            blockedRequests: daily.blockedRequests || 0,
            uniqueIps: daily.uniqueIps ? daily.uniqueIps.size : 0,
            blockedIps: this.blockedIps.size,
            recentAlerts: this.alertHistory.slice(-10),
            threatTypes: daily.threatTypes ? Object.fromEntries(daily.threatTypes) : {},
            averageResponseTime: daily.responseTimes ? 
                daily.responseTimes.reduce((a, b) => a + b, 0) / daily.responseTimes.length : 0,
            errorRate: daily.errorResponses ? 
                (daily.errorResponses / daily.totalRequests) * 100 : 0
        };
    }

    /**
     * Get recent security alerts
     */
    getRecentAlerts(limit = 20) {
        return this.alertHistory.slice(-limit);
    }

    /**
     * Get blocked IPs list
     */
    getBlockedIps() {
        return Array.from(this.blockedIps);
    }
}

// ==================== EXPORTS ====================

module.exports = {
    SecurityMonitor,
    SECURITY_CONFIG
};