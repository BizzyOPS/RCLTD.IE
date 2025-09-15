/**
 * OWASP A07: Authentication & Session Management
 * Robotics & Control Ltd - Enterprise Security Implementation
 * 
 * This module enhances the existing access control system with:
 * - Multi-factor authentication (MFA) framework
 * - Enhanced session security and management
 * - Password policy enforcement and breach checking
 * - Account lockout and brute force protection
 * - Authentication logging and monitoring
 */

const crypto = require('crypto');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');

// ==================== AUTHENTICATION & SESSION MANAGEMENT CONFIGURATION ====================

const AUTH_SESSION_CONFIG = {
    // Multi-Factor Authentication
    mfa: {
        enableMFA: true,
        requireMFAForAdmins: true,
        requireMFAForSensitive: true,
        totpWindow: 2,              // Allow 2 time windows (±30 seconds)
        backupCodesCount: 8,        // Number of backup codes
        qrCodeSize: 200,            // QR code size in pixels
        serviceName: 'Robotics & Control Ltd',
        issuer: 'RoboticsControl',
        algorithms: ['sha1', 'sha256', 'sha512']
    },
    
    // Enhanced session management
    sessions: {
        maxConcurrent: 3,           // Maximum concurrent sessions per user
        idleTimeout: 30 * 60 * 1000,         // 30 minutes
        absoluteTimeout: 8 * 60 * 60 * 1000, // 8 hours
        refreshThreshold: 15 * 60 * 1000,    // Refresh token every 15 minutes
        secureTransport: true,      // Require HTTPS
        httpOnly: true,             // HttpOnly cookies
        sameSite: 'strict',         // SameSite attribute
        regenerateOnAuth: true,     // Regenerate session ID on authentication
        trackGeolocation: true,     // Track session geolocation
        trackDeviceFingerprint: true // Track device fingerprinting
    },
    
    // Password policy
    passwords: {
        minLength: 12,
        maxLength: 128,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
        minUniqueChars: 8,
        preventReuse: 12,           // Prevent reuse of last 12 passwords
        maxAge: 90 * 24 * 60 * 60 * 1000,   // 90 days
        breachChecking: true,       // Check against known breaches
        commonPasswordCheck: true,  // Check against common passwords
        personalInfoCheck: true     // Prevent use of personal information
    },
    
    // Account lockout and brute force protection
    lockout: {
        enableAccountLockout: true,
        maxFailedAttempts: 5,
        lockoutDuration: 30 * 60 * 1000,    // 30 minutes
        progressiveLockout: true,   // Increase lockout duration with repeated failures
        lockoutMultiplier: 2,       // Multiply lockout duration by this factor
        maxLockoutDuration: 24 * 60 * 60 * 1000, // 24 hours maximum
        trackAttemptsByIP: true,    // Track failed attempts by IP
        ipLockoutThreshold: 50,     // Lock IP after 50 failed attempts
        ipLockoutDuration: 60 * 60 * 1000,   // 1 hour IP lockout
        captchaThreshold: 3         // Show CAPTCHA after 3 failed attempts
    },
    
    // Authentication methods
    authMethods: {
        password: true,
        mfa: true,
        apiKey: true,
        oauth: false,               // Future implementation
        certificate: false,        // Future implementation
        biometric: false           // Future implementation
    },
    
    // Session monitoring
    monitoring: {
        enableSessionAnalytics: true,
        enableAnomalyDetection: true,
        enableGeoLocationTracking: true,
        enableDeviceTracking: true,
        suspiciousActivityThreshold: 5,
        alertOnSimultaneousLogin: true,
        alertOnLocationChange: true,
        alertOnDeviceChange: true
    }
};

// ==================== ENHANCED AUTHENTICATION MANAGER CLASS ====================

class EnhancedAuthenticationManager {
    constructor(accessControlManager, config = AUTH_SESSION_CONFIG) {
        this.config = config;
        this.accessControlManager = accessControlManager;
        this.mfaSecrets = new Map();
        this.sessionAnalytics = new Map();
        this.failedAttempts = new Map();
        this.lockedAccounts = new Map();
        this.lockedIPs = new Map();
        this.passwordHistory = new Map();
        this.deviceFingerprints = new Map();
        this.breachedPasswords = new Set();
        this.commonPasswords = new Set();
        
        // Initialize system
        this.initialize();
    }

    /**
     * Initialize enhanced authentication system
     */
    async initialize() {
        try {
            // Ensure data directories exist
            await fs.ensureDir('./security-data/auth');
            await fs.ensureDir('./security-data/sessions');
            
            // Load existing data
            await this.loadMFASecrets();
            await this.loadPasswordHistory();
            await this.loadBreachedPasswords();
            await this.loadCommonPasswords();
            await this.loadDeviceFingerprints();
            
            // Start monitoring intervals
            this.startAuthenticationMonitoring();
            
            console.log('[OWASP-A07] Enhanced Authentication Manager initialized');
            
        } catch (error) {
            console.error('[OWASP-A07] Failed to initialize authentication manager:', error);
            throw error;
        }
    }

    /**
     * Middleware for enhanced authentication
     */
    middleware() {
        return (req, res, next) => {
            try {
                // Add enhanced authentication methods to request
                req.enhancedAuth = {
                    setupMFA: this.setupMFA.bind(this),
                    verifyMFA: this.verifyMFA.bind(this),
                    validatePassword: this.validatePassword.bind(this),
                    checkPasswordBreach: this.checkPasswordBreach.bind(this),
                    trackSession: this.trackSession.bind(this),
                    analyzeSessionAnomaly: this.analyzeSessionAnomaly.bind(this),
                    generateDeviceFingerprint: this.generateDeviceFingerprint.bind(this)
                };
                
                // Track session analytics
                this.trackSessionAnalytics(req);
                
                // Check for session anomalies
                const anomalyCheck = this.detectSessionAnomaly(req);
                if (anomalyCheck.isAnomalous) {
                    this.logSecurityEvent('SESSION_ANOMALY', req, anomalyCheck);
                    
                    // Don't block but require re-authentication for sensitive operations
                    req.requireReauth = true;
                }
                
                next();
                
            } catch (error) {
                console.error('[OWASP-A07] Enhanced authentication middleware error:', error);
                next();
            }
        };
    }

    // ==================== MULTI-FACTOR AUTHENTICATION ====================

    /**
     * Setup MFA for a user
     */
    async setupMFA(userId, userEmail) {
        try {
            // Generate TOTP secret
            const secret = speakeasy.generateSecret({
                name: `${this.config.mfa.serviceName} (${userEmail})`,
                issuer: this.config.mfa.issuer,
                length: 32
            });
            
            // Generate backup codes
            const backupCodes = this.generateBackupCodes();
            
            // Store MFA data
            const mfaData = {
                userId: userId,
                secret: secret.base32,
                backupCodes: backupCodes.map(code => ({
                    code: this.hashBackupCode(code),
                    used: false,
                    createdAt: new Date().toISOString()
                })),
                enabled: false,  // User must verify setup before enabling
                createdAt: new Date().toISOString(),
                verifiedAt: null
            };
            
            this.mfaSecrets.set(userId, mfaData);
            await this.saveMFASecrets();
            
            // Generate QR code
            const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url, {
                width: this.config.mfa.qrCodeSize
            });
            
            console.log(`[OWASP-A07] MFA setup initiated for user ${userId}`);
            
            return {
                secret: secret.base32,
                qrCode: qrCodeDataURL,
                backupCodes: backupCodes, // Return raw codes to user (display once)
                manualEntryKey: secret.base32
            };
            
        } catch (error) {
            console.error('[OWASP-A07] MFA setup failed:', error);
            throw error;
        }
    }

    /**
     * Verify MFA setup
     */
    async verifyMFASetup(userId, token) {
        try {
            const mfaData = this.mfaSecrets.get(userId);
            
            if (!mfaData) {
                throw new Error('MFA not set up for this user');
            }
            
            if (mfaData.enabled) {
                throw new Error('MFA already enabled for this user');
            }
            
            // Verify the token
            const verified = speakeasy.totp.verify({
                secret: mfaData.secret,
                encoding: 'base32',
                token: token,
                window: this.config.mfa.totpWindow
            });
            
            if (!verified) {
                throw new Error('Invalid MFA token');
            }
            
            // Enable MFA
            mfaData.enabled = true;
            mfaData.verifiedAt = new Date().toISOString();
            
            await this.saveMFASecrets();
            
            console.log(`[OWASP-A07] MFA enabled for user ${userId}`);
            
            return { success: true, message: 'MFA successfully enabled' };
            
        } catch (error) {
            console.error('[OWASP-A07] MFA verification failed:', error);
            throw error;
        }
    }

    /**
     * Verify MFA token
     */
    async verifyMFA(userId, token, context = {}) {
        try {
            const mfaData = this.mfaSecrets.get(userId);
            
            if (!mfaData || !mfaData.enabled) {
                throw new Error('MFA not enabled for this user');
            }
            
            // First try TOTP verification
            const totpVerified = speakeasy.totp.verify({
                secret: mfaData.secret,
                encoding: 'base32',
                token: token,
                window: this.config.mfa.totpWindow
            });
            
            if (totpVerified) {
                console.log(`[OWASP-A07] TOTP MFA verified for user ${userId}`);
                return { 
                    success: true, 
                    method: 'totp',
                    timestamp: new Date().toISOString()
                };
            }
            
            // Try backup code verification
            const backupVerified = await this.verifyBackupCode(userId, token);
            if (backupVerified) {
                console.log(`[OWASP-A07] Backup code MFA verified for user ${userId}`);
                return { 
                    success: true, 
                    method: 'backup_code',
                    timestamp: new Date().toISOString()
                };
            }
            
            // Log failed MFA attempt
            this.recordFailedMFAAttempt(userId, context);
            
            throw new Error('Invalid MFA token');
            
        } catch (error) {
            console.error('[OWASP-A07] MFA verification failed:', error);
            throw error;
        }
    }

    /**
     * Verify backup code
     */
    async verifyBackupCode(userId, code) {
        try {
            const mfaData = this.mfaSecrets.get(userId);
            if (!mfaData) return false;
            
            const hashedCode = this.hashBackupCode(code);
            
            // Find matching unused backup code
            const backupCode = mfaData.backupCodes.find(bc => 
                bc.code === hashedCode && !bc.used
            );
            
            if (backupCode) {
                // Mark backup code as used
                backupCode.used = true;
                backupCode.usedAt = new Date().toISOString();
                
                await this.saveMFASecrets();
                
                // Generate new backup codes if running low
                const unusedCodes = mfaData.backupCodes.filter(bc => !bc.used);
                if (unusedCodes.length <= 2) {
                    await this.regenerateBackupCodes(userId);
                }
                
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('[OWASP-A07] Backup code verification failed:', error);
            return false;
        }
    }

    /**
     * Generate backup codes
     */
    generateBackupCodes() {
        const codes = [];
        
        for (let i = 0; i < this.config.mfa.backupCodesCount; i++) {
            // Generate 8-digit backup code
            const code = crypto.randomBytes(4).toString('hex').toUpperCase();
            codes.push(code);
        }
        
        return codes;
    }

    /**
     * Hash backup code
     */
    hashBackupCode(code) {
        return crypto.createHash('sha256').update(code).digest('hex');
    }

    /**
     * Regenerate backup codes
     */
    async regenerateBackupCodes(userId) {
        try {
            const mfaData = this.mfaSecrets.get(userId);
            if (!mfaData) throw new Error('MFA not found for user');
            
            const newBackupCodes = this.generateBackupCodes();
            
            // Replace old backup codes
            mfaData.backupCodes = newBackupCodes.map(code => ({
                code: this.hashBackupCode(code),
                used: false,
                createdAt: new Date().toISOString()
            }));
            
            await this.saveMFASecrets();
            
            console.log(`[OWASP-A07] Backup codes regenerated for user ${userId}`);
            
            return newBackupCodes;
            
        } catch (error) {
            console.error('[OWASP-A07] Backup code regeneration failed:', error);
            throw error;
        }
    }

    // ==================== ENHANCED SESSION MANAGEMENT ====================

    /**
     * Create enhanced session
     */
    async createEnhancedSession(user, clientInfo = {}) {
        try {
            // Generate session data
            const sessionId = crypto.randomBytes(32).toString('hex');
            const deviceFingerprint = this.generateDeviceFingerprint(clientInfo);
            
            const sessionData = {
                id: sessionId,
                userId: user.id,
                userEmail: user.email,
                role: user.role,
                createdAt: new Date().toISOString(),
                lastActivity: new Date().toISOString(),
                expiresAt: new Date(Date.now() + this.config.sessions.absoluteTimeout).toISOString(),
                clientInfo: {
                    ip: clientInfo.ip || 'unknown',
                    userAgent: clientInfo.userAgent || 'unknown',
                    deviceFingerprint: deviceFingerprint,
                    geolocation: clientInfo.geolocation || null
                },
                security: {
                    mfaVerified: false,
                    privilegeLevel: 'standard',
                    secureTransport: clientInfo.secure || false,
                    refreshTokens: []
                },
                analytics: {
                    pageViews: 0,
                    actions: [],
                    anomalyScore: 0
                }
            };
            
            // Store session
            this.sessionAnalytics.set(sessionId, sessionData);
            
            // Check concurrent session limits
            await this.enforceConcurrentSessionLimits(user.id);
            
            // Store device fingerprint
            this.storeDeviceFingerprint(user.id, deviceFingerprint, clientInfo);
            
            console.log(`[OWASP-A07] Enhanced session created for user ${user.id}`);
            
            return sessionData;
            
        } catch (error) {
            console.error('[OWASP-A07] Enhanced session creation failed:', error);
            throw error;
        }
    }

    /**
     * Validate and refresh session
     */
    async validateAndRefreshSession(sessionId, clientInfo = {}) {
        try {
            const session = this.sessionAnalytics.get(sessionId);
            
            if (!session) {
                throw new Error('Session not found');
            }
            
            const now = new Date();
            
            // Check absolute timeout
            if (now > new Date(session.expiresAt)) {
                await this.invalidateSession(sessionId);
                throw new Error('Session expired');
            }
            
            // Check idle timeout
            const lastActivity = new Date(session.lastActivity);
            if (now - lastActivity > this.config.sessions.idleTimeout) {
                await this.invalidateSession(sessionId);
                throw new Error('Session idle timeout');
            }
            
            // Verify device fingerprint
            const currentFingerprint = this.generateDeviceFingerprint(clientInfo);
            if (session.clientInfo.deviceFingerprint !== currentFingerprint) {
                // Log potential session hijacking
                this.logSecurityEvent('SESSION_FINGERPRINT_MISMATCH', {
                    sessionId: sessionId,
                    expectedFingerprint: session.clientInfo.deviceFingerprint,
                    actualFingerprint: currentFingerprint
                });
                
                // Require re-authentication
                session.security.privilegeLevel = 'reauth_required';
            }
            
            // Check if refresh is needed
            const lastRefresh = new Date(session.lastActivity);
            if (now - lastRefresh > this.config.sessions.refreshThreshold) {
                session.lastActivity = now.toISOString();
                
                // Generate new refresh token
                const refreshToken = crypto.randomBytes(32).toString('hex');
                session.security.refreshTokens.push({
                    token: refreshToken,
                    createdAt: now.toISOString(),
                    expiresAt: new Date(now.getTime() + this.config.sessions.refreshThreshold).toISOString()
                });
                
                // Keep only last 3 refresh tokens
                if (session.security.refreshTokens.length > 3) {
                    session.security.refreshTokens = session.security.refreshTokens.slice(-3);
                }
            }
            
            return session;
            
        } catch (error) {
            console.error('[OWASP-A07] Session validation failed:', error);
            throw error;
        }
    }

    /**
     * Generate device fingerprint
     */
    generateDeviceFingerprint(clientInfo) {
        const fingerprintData = {
            userAgent: clientInfo.userAgent || '',
            acceptLanguage: clientInfo.acceptLanguage || '',
            acceptEncoding: clientInfo.acceptEncoding || '',
            connection: clientInfo.connection || '',
            dnt: clientInfo.dnt || '',
            timezone: clientInfo.timezone || '',
            screen: clientInfo.screen || '',
            colorDepth: clientInfo.colorDepth || '',
            platform: clientInfo.platform || ''
        };
        
        const fingerprintString = JSON.stringify(fingerprintData);
        return crypto.createHash('sha256').update(fingerprintString).digest('hex');
    }

    /**
     * Store device fingerprint
     */
    storeDeviceFingerprint(userId, fingerprint, clientInfo) {
        if (!this.deviceFingerprints.has(userId)) {
            this.deviceFingerprints.set(userId, []);
        }
        
        const userFingerprints = this.deviceFingerprints.get(userId);
        
        // Check if fingerprint already exists
        const existing = userFingerprints.find(fp => fp.fingerprint === fingerprint);
        
        if (existing) {
            existing.lastSeen = new Date().toISOString();
            existing.useCount++;
        } else {
            userFingerprints.push({
                fingerprint: fingerprint,
                firstSeen: new Date().toISOString(),
                lastSeen: new Date().toISOString(),
                useCount: 1,
                clientInfo: {
                    userAgent: clientInfo.userAgent,
                    ip: clientInfo.ip,
                    geolocation: clientInfo.geolocation
                },
                trusted: false
            });
            
            // Keep only last 10 fingerprints per user
            if (userFingerprints.length > 10) {
                userFingerprints.splice(0, userFingerprints.length - 10);
            }
        }
    }

    /**
     * Enforce concurrent session limits
     */
    async enforceConcurrentSessionLimits(userId) {
        try {
            const userSessions = Array.from(this.sessionAnalytics.values())
                .filter(session => session.userId === userId)
                .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
            
            if (userSessions.length >= this.config.sessions.maxConcurrent) {
                // Remove oldest sessions
                const sessionsToRemove = userSessions.slice(this.config.sessions.maxConcurrent - 1);
                
                for (const session of sessionsToRemove) {
                    await this.invalidateSession(session.id);
                }
                
                console.log(`[OWASP-A07] Enforced concurrent session limit for user ${userId}, removed ${sessionsToRemove.length} sessions`);
            }
            
        } catch (error) {
            console.error('[OWASP-A07] Failed to enforce concurrent session limits:', error);
        }
    }

    /**
     * Invalidate session
     */
    async invalidateSession(sessionId) {
        try {
            const session = this.sessionAnalytics.get(sessionId);
            
            if (session) {
                session.invalidatedAt = new Date().toISOString();
                session.isValid = false;
                
                console.log(`[OWASP-A07] Session invalidated: ${sessionId}`);
            }
            
        } catch (error) {
            console.error('[OWASP-A07] Session invalidation failed:', error);
        }
    }

    // ==================== PASSWORD POLICY ENFORCEMENT ====================

    /**
     * Validate password against policy
     */
    async validatePassword(password, userInfo = {}) {
        try {
            const errors = [];
            const warnings = [];
            
            // Length checks
            if (password.length < this.config.passwords.minLength) {
                errors.push(`Password must be at least ${this.config.passwords.minLength} characters long`);
            }
            
            if (password.length > this.config.passwords.maxLength) {
                errors.push(`Password must not exceed ${this.config.passwords.maxLength} characters`);
            }
            
            // Character composition checks
            if (this.config.passwords.requireUppercase && !/[A-Z]/.test(password)) {
                errors.push('Password must contain at least one uppercase letter');
            }
            
            if (this.config.passwords.requireLowercase && !/[a-z]/.test(password)) {
                errors.push('Password must contain at least one lowercase letter');
            }
            
            if (this.config.passwords.requireNumbers && !/\d/.test(password)) {
                errors.push('Password must contain at least one number');
            }
            
            if (this.config.passwords.requireSymbols && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) {
                errors.push('Password must contain at least one special character');
            }
            
            // Unique character check
            const uniqueChars = new Set(password).size;
            if (uniqueChars < this.config.passwords.minUniqueChars) {
                errors.push(`Password must contain at least ${this.config.passwords.minUniqueChars} unique characters`);
            }
            
            // Common password check
            if (this.config.passwords.commonPasswordCheck && this.isCommonPassword(password)) {
                errors.push('Password is too common, please choose a more unique password');
            }
            
            // Breach checking
            if (this.config.passwords.breachChecking && this.isBreachedPassword(password)) {
                errors.push('Password has been found in data breaches, please choose a different password');
            }
            
            // Personal information check
            if (this.config.passwords.personalInfoCheck && userInfo) {
                const personalInfoCheck = this.containsPersonalInfo(password, userInfo);
                if (personalInfoCheck.contains) {
                    errors.push(`Password contains personal information: ${personalInfoCheck.info.join(', ')}`);
                }
            }
            
            // Password history check
            if (userInfo.userId) {
                const historyCheck = await this.checkPasswordHistory(userInfo.userId, password);
                if (!historyCheck.isValid) {
                    errors.push(`Password cannot be one of your last ${this.config.passwords.preventReuse} passwords`);
                }
            }
            
            // Calculate password strength
            const strength = this.calculatePasswordStrength(password);
            
            if (strength.score < 3) {
                warnings.push('Password is weak, consider making it stronger');
            }
            
            return {
                isValid: errors.length === 0,
                errors: errors,
                warnings: warnings,
                strength: strength,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('[OWASP-A07] Password validation failed:', error);
            return {
                isValid: false,
                errors: ['Password validation error'],
                warnings: [],
                strength: { score: 0, feedback: 'Unable to validate password' }
            };
        }
    }

    /**
     * Check if password is breached
     */
    isBreachedPassword(password) {
        const passwordHash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
        return this.breachedPasswords.has(passwordHash);
    }

    /**
     * Check if password is common
     */
    isCommonPassword(password) {
        return this.commonPasswords.has(password.toLowerCase());
    }

    /**
     * Check if password contains personal information
     */
    containsPersonalInfo(password, userInfo) {
        const personalInfo = [];
        const passwordLower = password.toLowerCase();
        
        if (userInfo.firstName && passwordLower.includes(userInfo.firstName.toLowerCase())) {
            personalInfo.push('first name');
        }
        
        if (userInfo.lastName && passwordLower.includes(userInfo.lastName.toLowerCase())) {
            personalInfo.push('last name');
        }
        
        if (userInfo.email) {
            const emailParts = userInfo.email.split('@')[0].toLowerCase();
            if (passwordLower.includes(emailParts)) {
                personalInfo.push('email address');
            }
        }
        
        if (userInfo.birthDate) {
            const birthYear = new Date(userInfo.birthDate).getFullYear().toString();
            if (passwordLower.includes(birthYear)) {
                personalInfo.push('birth year');
            }
        }
        
        return {
            contains: personalInfo.length > 0,
            info: personalInfo
        };
    }

    /**
     * Check password history
     */
    async checkPasswordHistory(userId, newPassword) {
        try {
            const userHistory = this.passwordHistory.get(userId);
            
            if (!userHistory || userHistory.length === 0) {
                return { isValid: true };
            }
            
            // Hash the new password for comparison
            const newPasswordHash = await bcrypt.hash(newPassword, 10);
            
            // Check against recent passwords
            for (const historicalPassword of userHistory) {
                const matches = await bcrypt.compare(newPassword, historicalPassword.hash);
                if (matches) {
                    return { isValid: false, reason: 'Password recently used' };
                }
            }
            
            return { isValid: true };
            
        } catch (error) {
            console.error('[OWASP-A07] Password history check failed:', error);
            return { isValid: true }; // Fail open for availability
        }
    }

    /**
     * Store password in history
     */
    async storePasswordHistory(userId, password) {
        try {
            if (!this.passwordHistory.has(userId)) {
                this.passwordHistory.set(userId, []);
            }
            
            const userHistory = this.passwordHistory.get(userId);
            const passwordHash = await bcrypt.hash(password, 10);
            
            userHistory.push({
                hash: passwordHash,
                createdAt: new Date().toISOString()
            });
            
            // Keep only the configured number of historical passwords
            if (userHistory.length > this.config.passwords.preventReuse) {
                userHistory.splice(0, userHistory.length - this.config.passwords.preventReuse);
            }
            
            await this.savePasswordHistory();
            
        } catch (error) {
            console.error('[OWASP-A07] Failed to store password history:', error);
        }
    }

    /**
     * Calculate password strength
     */
    calculatePasswordStrength(password) {
        let score = 0;
        const feedback = [];
        
        // Length bonus
        if (password.length >= 12) score += 1;
        if (password.length >= 16) score += 1;
        if (password.length >= 20) score += 1;
        
        // Character variety
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/\d/.test(password)) score += 1;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) score += 1;
        
        // Complexity bonus
        const uniqueChars = new Set(password).size;
        if (uniqueChars >= password.length * 0.8) score += 1;
        
        // Pattern penalties
        if (/(.)\1{2,}/.test(password)) score -= 1; // Repeated characters
        if (/123|abc|qwe|asd|zxc/i.test(password)) score -= 1; // Sequential patterns
        
        // Generate feedback
        if (score < 2) {
            feedback.push('Very weak password');
        } else if (score < 4) {
            feedback.push('Weak password');
        } else if (score < 6) {
            feedback.push('Fair password');
        } else if (score < 8) {
            feedback.push('Good password');
        } else {
            feedback.push('Strong password');
        }
        
        return {
            score: Math.max(0, score),
            maxScore: 10,
            feedback: feedback,
            percentage: Math.round((Math.max(0, score) / 10) * 100)
        };
    }

    // ==================== ACCOUNT LOCKOUT & BRUTE FORCE PROTECTION ====================

    /**
     * Record failed authentication attempt
     */
    recordFailedAttempt(identifier, context = {}) {
        try {
            const now = new Date();
            
            // Record user account attempt
            if (!this.failedAttempts.has(identifier)) {
                this.failedAttempts.set(identifier, []);
            }
            
            const attempts = this.failedAttempts.get(identifier);
            attempts.push({
                timestamp: now.toISOString(),
                ip: context.ip || 'unknown',
                userAgent: context.userAgent || 'unknown',
                type: context.type || 'password'
            });
            
            // Keep only recent attempts (last 24 hours)
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const recentAttempts = attempts.filter(attempt => 
                new Date(attempt.timestamp) > oneDayAgo
            );
            this.failedAttempts.set(identifier, recentAttempts);
            
            // Check if account should be locked
            if (recentAttempts.length >= this.config.lockout.maxFailedAttempts) {
                this.lockAccount(identifier, context);
            }
            
            // Record IP-based attempts if enabled
            if (this.config.lockout.trackAttemptsByIP && context.ip) {
                this.recordIPFailedAttempt(context.ip, context);
            }
            
        } catch (error) {
            console.error('[OWASP-A07] Failed to record failed attempt:', error);
        }
    }

    /**
     * Record IP-based failed attempt
     */
    recordIPFailedAttempt(ip, context = {}) {
        try {
            if (!this.failedAttempts.has(`ip:${ip}`)) {
                this.failedAttempts.set(`ip:${ip}`, []);
            }
            
            const attempts = this.failedAttempts.get(`ip:${ip}`);
            attempts.push({
                timestamp: new Date().toISOString(),
                userAgent: context.userAgent || 'unknown',
                targetUser: context.targetUser || 'unknown'
            });
            
            // Keep only recent attempts (last hour)
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const recentAttempts = attempts.filter(attempt => 
                new Date(attempt.timestamp) > oneHourAgo
            );
            this.failedAttempts.set(`ip:${ip}`, recentAttempts);
            
            // Check if IP should be locked
            if (recentAttempts.length >= this.config.lockout.ipLockoutThreshold) {
                this.lockIP(ip, context);
            }
            
        } catch (error) {
            console.error('[OWASP-A07] Failed to record IP failed attempt:', error);
        }
    }

    /**
     * Lock user account
     */
    lockAccount(identifier, context = {}) {
        try {
            const now = new Date();
            const previousLockout = this.lockedAccounts.get(identifier);
            
            // Calculate lockout duration (progressive lockout)
            let lockoutDuration = this.config.lockout.lockoutDuration;
            
            if (this.config.lockout.progressiveLockout && previousLockout) {
                const timeSinceLastLockout = now - new Date(previousLockout.unlockedAt || previousLockout.lockedAt);
                const oneHour = 60 * 60 * 1000;
                
                // If lockout was recent, increase duration
                if (timeSinceLastLockout < oneHour) {
                    lockoutDuration *= this.config.lockout.lockoutMultiplier;
                    lockoutDuration = Math.min(lockoutDuration, this.config.lockout.maxLockoutDuration);
                }
            }
            
            const lockoutData = {
                identifier: identifier,
                lockedAt: now.toISOString(),
                unlockAt: new Date(now.getTime() + lockoutDuration).toISOString(),
                reason: 'Too many failed authentication attempts',
                attemptCount: this.failedAttempts.get(identifier)?.length || 0,
                lockoutDuration: lockoutDuration,
                context: context
            };
            
            this.lockedAccounts.set(identifier, lockoutData);
            
            console.warn(`[OWASP-A07] Account locked: ${identifier} for ${lockoutDuration / 1000} seconds`);
            
            // Log security event
            this.logSecurityEvent('ACCOUNT_LOCKED', {
                identifier: identifier,
                lockoutData: lockoutData
            });
            
        } catch (error) {
            console.error('[OWASP-A07] Failed to lock account:', error);
        }
    }

    /**
     * Lock IP address
     */
    lockIP(ip, context = {}) {
        try {
            const now = new Date();
            const lockoutData = {
                ip: ip,
                lockedAt: now.toISOString(),
                unlockAt: new Date(now.getTime() + this.config.lockout.ipLockoutDuration).toISOString(),
                reason: 'Too many failed authentication attempts from this IP',
                attemptCount: this.failedAttempts.get(`ip:${ip}`)?.length || 0,
                context: context
            };
            
            this.lockedIPs.set(ip, lockoutData);
            
            console.warn(`[OWASP-A07] IP locked: ${ip} for ${this.config.lockout.ipLockoutDuration / 1000} seconds`);
            
            // Log security event
            this.logSecurityEvent('IP_LOCKED', {
                ip: ip,
                lockoutData: lockoutData
            });
            
        } catch (error) {
            console.error('[OWASP-A07] Failed to lock IP:', error);
        }
    }

    /**
     * Check if account is locked
     */
    isAccountLocked(identifier) {
        const lockoutData = this.lockedAccounts.get(identifier);
        
        if (!lockoutData) return false;
        
        const now = new Date();
        const unlockTime = new Date(lockoutData.unlockAt);
        
        if (now >= unlockTime) {
            // Lockout has expired, remove it
            lockoutData.unlockedAt = now.toISOString();
            this.lockedAccounts.delete(identifier);
            
            console.log(`[OWASP-A07] Account unlocked: ${identifier}`);
            return false;
        }
        
        return true;
    }

    /**
     * Check if IP is locked
     */
    isIPLocked(ip) {
        const lockoutData = this.lockedIPs.get(ip);
        
        if (!lockoutData) return false;
        
        const now = new Date();
        const unlockTime = new Date(lockoutData.unlockAt);
        
        if (now >= unlockTime) {
            // Lockout has expired, remove it
            this.lockedIPs.delete(ip);
            
            console.log(`[OWASP-A07] IP unlocked: ${ip}`);
            return false;
        }
        
        return true;
    }

    // ==================== SESSION ANALYTICS & ANOMALY DETECTION ====================

    /**
     * Track session analytics
     */
    trackSessionAnalytics(req) {
        try {
            const sessionId = req.sessionId || req.headers['x-session-id'];
            
            if (!sessionId) return;
            
            const session = this.sessionAnalytics.get(sessionId);
            if (!session) return;
            
            // Update analytics
            session.analytics.pageViews++;
            session.analytics.actions.push({
                type: 'page_view',
                path: req.path,
                method: req.method,
                timestamp: new Date().toISOString(),
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            
            // Keep only last 100 actions
            if (session.analytics.actions.length > 100) {
                session.analytics.actions = session.analytics.actions.slice(-100);
            }
            
            // Update last activity
            session.lastActivity = new Date().toISOString();
            
        } catch (error) {
            console.error('[OWASP-A07] Failed to track session analytics:', error);
        }
    }

    /**
     * Detect session anomalies
     */
    detectSessionAnomaly(req) {
        try {
            const sessionId = req.sessionId || req.headers['x-session-id'];
            
            if (!sessionId) {
                return { isAnomalous: false };
            }
            
            const session = this.sessionAnalytics.get(sessionId);
            if (!session) {
                return { isAnomalous: false };
            }
            
            const anomalies = [];
            let anomalyScore = 0;
            
            // Check for IP address changes
            if (req.ip !== session.clientInfo.ip) {
                anomalies.push('IP address changed');
                anomalyScore += 30;
            }
            
            // Check for user agent changes
            const currentUA = req.get('User-Agent');
            if (currentUA && currentUA !== session.clientInfo.userAgent) {
                anomalies.push('User agent changed');
                anomalyScore += 20;
            }
            
            // Check for unusual activity patterns
            const recentActions = session.analytics.actions.filter(action => 
                new Date(action.timestamp) > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
            );
            
            if (recentActions.length > 50) {
                anomalies.push('Unusual high activity');
                anomalyScore += 25;
            }
            
            // Check for geolocation changes (if available)
            if (req.geolocation && session.clientInfo.geolocation) {
                const distance = this.calculateDistance(
                    req.geolocation,
                    session.clientInfo.geolocation
                );
                
                if (distance > 1000) { // More than 1000km
                    anomalies.push('Significant location change');
                    anomalyScore += 40;
                }
            }
            
            // Update session anomaly score
            session.analytics.anomalyScore = anomalyScore;
            
            return {
                isAnomalous: anomalyScore >= this.config.monitoring.suspiciousActivityThreshold,
                anomalies: anomalies,
                score: anomalyScore,
                session: session
            };
            
        } catch (error) {
            console.error('[OWASP-A07] Session anomaly detection failed:', error);
            return { isAnomalous: false, error: error.message };
        }
    }

    /**
     * Analyze session anomaly
     */
    analyzeSessionAnomaly(sessionId) {
        const session = this.sessionAnalytics.get(sessionId);
        if (!session) return null;
        
        return {
            sessionId: sessionId,
            userId: session.userId,
            anomalyScore: session.analytics.anomalyScore,
            lastActivity: session.lastActivity,
            suspicious: session.analytics.anomalyScore >= this.config.monitoring.suspiciousActivityThreshold
        };
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Record failed MFA attempt
     */
    recordFailedMFAAttempt(userId, context = {}) {
        this.recordFailedAttempt(`mfa:${userId}`, {
            ...context,
            type: 'mfa'
        });
    }

    /**
     * Calculate distance between two geolocations
     */
    calculateDistance(geo1, geo2) {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = this.degreesToRadians(geo2.lat - geo1.lat);
        const dLon = this.degreesToRadians(geo2.lon - geo1.lon);
        
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.degreesToRadians(geo1.lat)) * Math.cos(this.degreesToRadians(geo2.lat)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        return distance;
    }

    /**
     * Convert degrees to radians
     */
    degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Log security event
     */
    logSecurityEvent(type, data) {
        const event = {
            type: type,
            timestamp: new Date().toISOString(),
            data: data
        };
        
        console.warn(`[OWASP-A07] Security event: ${type}`, event);
    }

    /**
     * Start authentication monitoring
     */
    startAuthenticationMonitoring() {
        // Clean up expired sessions and lockouts every 5 minutes
        setInterval(() => {
            this.cleanupExpiredSessions();
            this.cleanupExpiredLockouts();
        }, 5 * 60 * 1000);
        
        // Save data every hour
        setInterval(() => {
            this.saveMFASecrets();
            this.savePasswordHistory();
            this.saveDeviceFingerprints();
        }, 60 * 60 * 1000);
    }

    /**
     * Cleanup expired sessions
     */
    cleanupExpiredSessions() {
        const now = new Date();
        let cleanedCount = 0;
        
        for (const [sessionId, session] of this.sessionAnalytics.entries()) {
            if (new Date(session.expiresAt) < now) {
                this.sessionAnalytics.delete(sessionId);
                cleanedCount++;
            }
        }
        
        if (cleanedCount > 0) {
            console.log(`[OWASP-A07] Cleaned up ${cleanedCount} expired sessions`);
        }
    }

    /**
     * Cleanup expired lockouts
     */
    cleanupExpiredLockouts() {
        const now = new Date();
        let cleanedAccounts = 0;
        let cleanedIPs = 0;
        
        for (const [identifier, lockout] of this.lockedAccounts.entries()) {
            if (new Date(lockout.unlockAt) < now) {
                this.lockedAccounts.delete(identifier);
                cleanedAccounts++;
            }
        }
        
        for (const [ip, lockout] of this.lockedIPs.entries()) {
            if (new Date(lockout.unlockAt) < now) {
                this.lockedIPs.delete(ip);
                cleanedIPs++;
            }
        }
        
        if (cleanedAccounts > 0 || cleanedIPs > 0) {
            console.log(`[OWASP-A07] Cleaned up ${cleanedAccounts} account lockouts and ${cleanedIPs} IP lockouts`);
        }
    }

    // ==================== DATA PERSISTENCE ====================

    async loadMFASecrets() {
        try {
            const secretsPath = './security-data/auth/mfa-secrets.json';
            if (await fs.exists(secretsPath)) {
                const data = await fs.readJSON(secretsPath);
                this.mfaSecrets = new Map(Object.entries(data));
                console.log(`[OWASP-A07] Loaded ${this.mfaSecrets.size} MFA secrets`);
            }
        } catch (error) {
            console.error('[OWASP-A07] Failed to load MFA secrets:', error);
        }
    }

    async saveMFASecrets() {
        try {
            const secretsPath = './security-data/auth/mfa-secrets.json';
            const data = Object.fromEntries(this.mfaSecrets);
            await fs.writeJSON(secretsPath, data, { spaces: 2 });
        } catch (error) {
            console.error('[OWASP-A07] Failed to save MFA secrets:', error);
        }
    }

    async loadPasswordHistory() {
        try {
            const historyPath = './security-data/auth/password-history.json';
            if (await fs.exists(historyPath)) {
                const data = await fs.readJSON(historyPath);
                this.passwordHistory = new Map(Object.entries(data));
                console.log(`[OWASP-A07] Loaded password history for ${this.passwordHistory.size} users`);
            }
        } catch (error) {
            console.error('[OWASP-A07] Failed to load password history:', error);
        }
    }

    async savePasswordHistory() {
        try {
            const historyPath = './security-data/auth/password-history.json';
            const data = Object.fromEntries(this.passwordHistory);
            await fs.writeJSON(historyPath, data, { spaces: 2 });
        } catch (error) {
            console.error('[OWASP-A07] Failed to save password history:', error);
        }
    }

    async loadBreachedPasswords() {
        try {
            // In a real implementation, this would load from a breach database
            // For now, we'll load a sample set
            const breachedPath = './security-data/auth/breached-passwords.json';
            if (await fs.exists(breachedPath)) {
                const data = await fs.readJSON(breachedPath);
                this.breachedPasswords = new Set(data);
                console.log(`[OWASP-A07] Loaded ${this.breachedPasswords.size} breached password hashes`);
            } else {
                // Create sample breach data
                const sampleBreaches = [
                    'PASSWORD', '123456', 'QWERTY', 'ABC123', 'ADMIN',
                    'LETMEIN', 'WELCOME', 'MONKEY', 'DRAGON', 'MASTER'
                ].map(pwd => crypto.createHash('sha1').update(pwd).digest('hex').toUpperCase());
                
                this.breachedPasswords = new Set(sampleBreaches);
                await fs.writeJSON(breachedPath, Array.from(this.breachedPasswords), { spaces: 2 });
            }
        } catch (error) {
            console.error('[OWASP-A07] Failed to load breached passwords:', error);
        }
    }

    async loadCommonPasswords() {
        try {
            const commonPath = './security-data/auth/common-passwords.json';
            if (await fs.exists(commonPath)) {
                const data = await fs.readJSON(commonPath);
                this.commonPasswords = new Set(data);
                console.log(`[OWASP-A07] Loaded ${this.commonPasswords.size} common passwords`);
            } else {
                // Create sample common passwords
                const sampleCommon = [
                    'password', '123456', 'qwerty', 'abc123', 'admin',
                    'letmein', 'welcome', 'monkey', 'dragon', 'master',
                    'password123', 'admin123', 'user123', 'test123',
                    '12345678', '1234567890', 'password1', 'password12'
                ];
                
                this.commonPasswords = new Set(sampleCommon);
                await fs.writeJSON(commonPath, Array.from(this.commonPasswords), { spaces: 2 });
            }
        } catch (error) {
            console.error('[OWASP-A07] Failed to load common passwords:', error);
        }
    }

    async loadDeviceFingerprints() {
        try {
            const fingerprintsPath = './security-data/auth/device-fingerprints.json';
            if (await fs.exists(fingerprintsPath)) {
                const data = await fs.readJSON(fingerprintsPath);
                this.deviceFingerprints = new Map(Object.entries(data));
                console.log(`[OWASP-A07] Loaded device fingerprints for ${this.deviceFingerprints.size} users`);
            }
        } catch (error) {
            console.error('[OWASP-A07] Failed to load device fingerprints:', error);
        }
    }

    async saveDeviceFingerprints() {
        try {
            const fingerprintsPath = './security-data/auth/device-fingerprints.json';
            const data = Object.fromEntries(this.deviceFingerprints);
            await fs.writeJSON(fingerprintsPath, data, { spaces: 2 });
        } catch (error) {
            console.error('[OWASP-A07] Failed to save device fingerprints:', error);
        }
    }

    // ==================== PUBLIC API ====================

    /**
     * Get authentication metrics
     */
    getAuthenticationMetrics() {
        return {
            activeSessions: this.sessionAnalytics.size,
            lockedAccounts: this.lockedAccounts.size,
            lockedIPs: this.lockedIPs.size,
            mfaEnabledUsers: Array.from(this.mfaSecrets.values()).filter(mfa => mfa.enabled).length,
            totalMFAUsers: this.mfaSecrets.size,
            recentFailedAttempts: Array.from(this.failedAttempts.values())
                .flat()
                .filter(attempt => new Date(attempt.timestamp) > new Date(Date.now() - 60 * 60 * 1000))
                .length,
            averageSessionAnomalyScore: this.calculateAverageSessionAnomalyScore()
        };
    }

    /**
     * Calculate average session anomaly score
     */
    calculateAverageSessionAnomalyScore() {
        const sessions = Array.from(this.sessionAnalytics.values());
        if (sessions.length === 0) return 0;
        
        const totalScore = sessions.reduce((sum, session) => 
            sum + (session.analytics.anomalyScore || 0), 0
        );
        
        return totalScore / sessions.length;
    }

    /**
     * Get MFA status for user
     */
    getMFAStatus(userId) {
        const mfaData = this.mfaSecrets.get(userId);
        
        if (!mfaData) {
            return { enabled: false, setup: false };
        }
        
        return {
            enabled: mfaData.enabled,
            setup: true,
            backupCodesRemaining: mfaData.backupCodes.filter(bc => !bc.used).length,
            createdAt: mfaData.createdAt,
            verifiedAt: mfaData.verifiedAt
        };
    }

    /**
     * Check password breach status
     */
    checkPasswordBreach(password) {
        return this.isBreachedPassword(password);
    }

    /**
     * Track session for specific user
     */
    trackSession(sessionId, data) {
        const session = this.sessionAnalytics.get(sessionId);
        if (session) {
            session.analytics.actions.push({
                ...data,
                timestamp: new Date().toISOString()
            });
        }
    }
}

module.exports = {
    AuthenticationManager: EnhancedAuthenticationManager,
    AUTH_SESSION_CONFIG
};