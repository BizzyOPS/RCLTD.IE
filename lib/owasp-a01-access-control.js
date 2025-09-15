/**
 * OWASP A01: Broken Access Control Protection
 * Robotics & Control Ltd - Enterprise Security Implementation
 * 
 * This module implements comprehensive access control measures including:
 * - Role-based access control (RBAC)
 * - Session management and validation
 * - Authorization checks and privilege escalation prevention
 * - Resource-level access control
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const path = require('path');

// ==================== ACCESS CONTROL CONFIGURATION ====================

const ACCESS_CONTROL_CONFIG = {
    // JWT Configuration
    jwt: {
        secret: process.env.JWT_SECRET || (() => {
            throw new Error('JWT_SECRET environment variable is required for security. Set a strong secret key.');
        })(),
        expiresIn: '24h',
        algorithm: 'HS256',
        issuer: 'robotics-control-ltd',
        audience: 'robotics-control-api'
    },
    
    // Session Configuration
    session: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict',
        name: 'rc_session_id'
    },
    
    // Role Definitions
    roles: {
        GUEST: {
            level: 0,
            permissions: ['read:public', 'submit:contact', 'view:products']
        },
        USER: {
            level: 1,
            permissions: ['read:public', 'read:user', 'submit:contact', 'view:products', 'create:order']
        },
        ADMIN: {
            level: 2,
            permissions: ['read:*', 'write:*', 'delete:non-critical', 'manage:users', 'view:security']
        },
        SUPER_ADMIN: {
            level: 3,
            permissions: ['*']
        }
    },
    
    // Resource Protection
    protectedRoutes: {
        '/api/security/*': ['ADMIN', 'SUPER_ADMIN'],
        '/api/admin/*': ['ADMIN', 'SUPER_ADMIN'],
        '/api/reports/*': ['ADMIN', 'SUPER_ADMIN'],
        '/api/users/*': ['ADMIN', 'SUPER_ADMIN'],
        '/api/vulnerability/*': ['ADMIN', 'SUPER_ADMIN'],
        '/api/config/*': ['SUPER_ADMIN']
    },
    
    // Account Security
    security: {
        maxLoginAttempts: 5,
        lockoutDuration: 30 * 60 * 1000, // 30 minutes
        passwordMinLength: 12,
        passwordRequirements: {
            uppercase: true,
            lowercase: true,
            numbers: true,
            symbols: true
        },
        sessionRotationInterval: 4 * 60 * 60 * 1000, // 4 hours
        concurrentSessionLimit: 3
    },
    
    // File paths
    paths: {
        users: './security-data/users.json',
        sessions: './security-data/sessions.json',
        loginAttempts: './security-data/login-attempts.json'
    }
};

// ==================== ACCESS CONTROL CLASS ====================

class AccessControlManager {
    constructor(config = ACCESS_CONTROL_CONFIG) {
        this.config = config;
        this.users = new Map();
        this.sessions = new Map();
        this.loginAttempts = new Map();
        this.activeTokens = new Set();
        
        // Initialize system
        this.initialize();
    }

    /**
     * Initialize the access control system
     */
    async initialize() {
        try {
            // Ensure data directories exist
            await fs.ensureDir('./security-data');
            
            // Load existing data
            await this.loadUsers();
            await this.loadSessions();
            await this.loadLoginAttempts();
            
            // Create default admin user if none exists
            await this.createDefaultAdmin();
            
            // Start cleanup intervals
            this.startCleanupIntervals();
            
            console.log('[OWASP-A01] Access Control Manager initialized');
            
        } catch (error) {
            console.error('[OWASP-A01] Failed to initialize access control:', error);
            throw error;
        }
    }

    /**
     * Middleware for request authentication and authorization
     */
    middleware() {
        return async (req, res, next) => {
            try {
                // Extract authentication information
                const authInfo = this.extractAuthInfo(req);
                
                // Check if route requires authentication
                const isProtectedRoute = this.isProtectedRoute(req.path);
                
                if (!isProtectedRoute) {
                    // Public route - assign guest role
                    req.user = {
                        id: 'guest',
                        role: 'GUEST',
                        permissions: this.config.roles.GUEST.permissions,
                        isAuthenticated: false
                    };
                    return next();
                }
                
                // Protected route - require authentication
                if (!authInfo.token && !authInfo.sessionId) {
                    return this.sendUnauthorized(res, 'Authentication required');
                }
                
                // Validate token or session
                const user = await this.validateAuth(authInfo);
                
                if (!user) {
                    return this.sendUnauthorized(res, 'Invalid or expired authentication');
                }
                
                // Check authorization for the specific route
                const hasAccess = this.checkAuthorization(user, req.path, req.method);
                
                if (!hasAccess) {
                    return this.sendForbidden(res, 'Insufficient permissions');
                }
                
                // Attach user to request
                req.user = user;
                
                // Log access for security monitoring
                this.logAccess(user, req);
                
                next();
                
            } catch (error) {
                console.error('[OWASP-A01] Authentication middleware error:', error);
                return this.sendUnauthorized(res, 'Authentication failed');
            }
        };
    }

    /**
     * User registration with security validation
     */
    async registerUser(userData) {
        try {
            // Validate input
            const validation = this.validateUserData(userData);
            if (!validation.isValid) {
                throw new Error(`Registration validation failed: ${validation.errors.join(', ')}`);
            }
            
            // Check if user already exists
            if (this.users.has(userData.email.toLowerCase())) {
                throw new Error('User already exists');
            }
            
            // Validate password strength
            const passwordValidation = this.validatePassword(userData.password);
            if (!passwordValidation.isValid) {
                throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
            }
            
            // Hash password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
            
            // Create user object
            const user = {
                id: uuidv4(),
                email: userData.email.toLowerCase(),
                name: userData.name,
                role: userData.role || 'USER',
                hashedPassword: hashedPassword,
                createdAt: new Date().toISOString(),
                isActive: true,
                lastLogin: null,
                loginAttempts: 0,
                lockedUntil: null,
                passwordChangedAt: new Date().toISOString(),
                sessions: []
            };
            
            // Store user
            this.users.set(user.email, user);
            await this.saveUsers();
            
            console.log(`[OWASP-A01] User registered: ${user.email} with role ${user.role}`);
            
            return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                createdAt: user.createdAt
            };
            
        } catch (error) {
            console.error('[OWASP-A01] User registration failed:', error);
            throw error;
        }
    }

    /**
     * User authentication with brute force protection
     */
    async authenticateUser(email, password, clientInfo = {}) {
        try {
            const userEmail = email.toLowerCase();
            const user = this.users.get(userEmail);
            
            // Check if user exists
            if (!user) {
                // Perform dummy hash to prevent timing attacks
                await bcrypt.hash('dummy', 12);
                throw new Error('Invalid credentials');
            }
            
            // Check if account is locked
            if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
                throw new Error('Account is temporarily locked due to too many failed attempts');
            }
            
            // Check if account is active
            if (!user.isActive) {
                throw new Error('Account is deactivated');
            }
            
            // Validate password
            const passwordValid = await bcrypt.compare(password, user.hashedPassword);
            
            if (!passwordValid) {
                // Increment login attempts
                await this.recordFailedLogin(userEmail, clientInfo.ip);
                throw new Error('Invalid credentials');
            }
            
            // Reset login attempts on successful login
            user.loginAttempts = 0;
            user.lockedUntil = null;
            user.lastLogin = new Date().toISOString();
            
            // Create session
            const session = await this.createSession(user, clientInfo);
            
            // Generate JWT token
            const token = this.generateJWT(user);
            
            await this.saveUsers();
            
            console.log(`[OWASP-A01] User authenticated: ${user.email}`);
            
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    permissions: this.config.roles[user.role].permissions
                },
                session: session,
                token: token
            };
            
        } catch (error) {
            console.error('[OWASP-A01] Authentication failed:', error);
            throw error;
        }
    }

    /**
     * Create secure session
     */
    async createSession(user, clientInfo = {}) {
        try {
            const sessionId = crypto.randomBytes(32).toString('hex');
            
            const session = {
                id: sessionId,
                userId: user.id,
                userEmail: user.email,
                role: user.role,
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + this.config.session.maxAge).toISOString(),
                lastActivity: new Date().toISOString(),
                ipAddress: clientInfo.ip || 'unknown',
                userAgent: clientInfo.userAgent || 'unknown',
                isActive: true,
                rotationCount: 0
            };
            
            // Limit concurrent sessions
            await this.limitConcurrentSessions(user.id);
            
            // Store session
            this.sessions.set(sessionId, session);
            
            // Add to user's session list
            user.sessions = user.sessions || [];
            user.sessions.push({
                id: sessionId,
                createdAt: session.createdAt,
                ipAddress: session.ipAddress
            });
            
            await this.saveSessions();
            
            return session;
            
        } catch (error) {
            console.error('[OWASP-A01] Session creation failed:', error);
            throw error;
        }
    }

    /**
     * Validate authentication (token or session)
     */
    async validateAuth(authInfo) {
        try {
            if (authInfo.token) {
                return await this.validateJWT(authInfo.token);
            } else if (authInfo.sessionId) {
                return await this.validateSession(authInfo.sessionId);
            }
            
            return null;
            
        } catch (error) {
            console.error('[OWASP-A01] Auth validation failed:', error);
            return null;
        }
    }

    /**
     * Validate JWT token
     */
    async validateJWT(token) {
        try {
            const decoded = jwt.verify(token, this.config.jwt.secret, {
                algorithms: [this.config.jwt.algorithm],
                issuer: this.config.jwt.issuer,
                audience: this.config.jwt.audience
            });
            
            // Check if token is in active tokens set (for revocation)
            if (!this.activeTokens.has(token)) {
                throw new Error('Token has been revoked');
            }
            
            // Get user data
            const user = this.users.get(decoded.email);
            if (!user || !user.isActive) {
                throw new Error('User not found or inactive');
            }
            
            return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                permissions: this.config.roles[user.role].permissions,
                isAuthenticated: true,
                authMethod: 'jwt'
            };
            
        } catch (error) {
            console.error('[OWASP-A01] JWT validation failed:', error);
            return null;
        }
    }

    /**
     * Validate session
     */
    async validateSession(sessionId) {
        try {
            const session = this.sessions.get(sessionId);
            
            if (!session || !session.isActive) {
                return null;
            }
            
            // Check expiration
            if (new Date() > new Date(session.expiresAt)) {
                await this.invalidateSession(sessionId);
                return null;
            }
            
            // Check if session needs rotation
            const rotationNeeded = this.checkSessionRotationNeeded(session);
            if (rotationNeeded) {
                await this.rotateSession(sessionId);
            }
            
            // Update last activity
            session.lastActivity = new Date().toISOString();
            await this.saveSessions();
            
            // Get user data
            const user = this.users.get(session.userEmail);
            if (!user || !user.isActive) {
                await this.invalidateSession(sessionId);
                return null;
            }
            
            return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                permissions: this.config.roles[user.role].permissions,
                isAuthenticated: true,
                authMethod: 'session',
                sessionId: sessionId
            };
            
        } catch (error) {
            console.error('[OWASP-A01] Session validation failed:', error);
            return null;
        }
    }

    /**
     * Check authorization for specific resource
     */
    checkAuthorization(user, path, method = 'GET') {
        try {
            // Super admin has access to everything
            if (user.role === 'SUPER_ADMIN') {
                return true;
            }
            
            // Check protected routes
            for (const [routePattern, allowedRoles] of Object.entries(this.config.protectedRoutes)) {
                const regex = new RegExp(routePattern.replace(/\*/g, '.*'));
                if (regex.test(path)) {
                    return allowedRoles.includes(user.role);
                }
            }
            
            // Check permissions
            const requiredPermission = this.getRequiredPermission(path, method);
            if (requiredPermission) {
                return this.hasPermission(user, requiredPermission);
            }
            
            // Default allow for non-protected routes
            return true;
            
        } catch (error) {
            console.error('[OWASP-A01] Authorization check failed:', error);
            return false;
        }
    }

    /**
     * Extract authentication information from request
     */
    extractAuthInfo(req) {
        const authInfo = {};
        
        // Check Authorization header for JWT
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            authInfo.token = authHeader.slice(7);
        }
        
        // Check API key
        const apiKey = req.headers['x-api-key'];
        if (apiKey) {
            authInfo.apiKey = apiKey;
        }
        
        // Check session cookie
        const sessionId = req.cookies?.[this.config.session.name];
        if (sessionId) {
            authInfo.sessionId = sessionId;
        }
        
        return authInfo;
    }

    /**
     * Check if route is protected
     */
    isProtectedRoute(path) {
        if (!this.config || !this.config.protectedRoutes) {
            console.warn('[OWASP-A01] Protected routes configuration not found');
            return false;
        }
        
        for (const routePattern of Object.keys(this.config.protectedRoutes)) {
            const regex = new RegExp(routePattern.replace(/\*/g, '.*'));
            if (regex.test(path)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Generate JWT token
     */
    generateJWT(user) {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            iat: Math.floor(Date.now() / 1000)
        };
        
        const token = jwt.sign(payload, this.config.jwt.secret, {
            expiresIn: this.config.jwt.expiresIn,
            algorithm: this.config.jwt.algorithm,
            issuer: this.config.jwt.issuer,
            audience: this.config.jwt.audience
        });
        
        // Add to active tokens for revocation tracking
        this.activeTokens.add(token);
        
        return token;
    }

    /**
     * Validate user data for registration
     */
    validateUserData(userData) {
        const errors = [];
        
        if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
            errors.push('Valid email is required');
        }
        
        if (!userData.name || userData.name.length < 2 || userData.name.length > 100) {
            errors.push('Name must be between 2 and 100 characters');
        }
        
        if (!userData.password) {
            errors.push('Password is required');
        }
        
        if (userData.role && !this.config.roles[userData.role]) {
            errors.push('Invalid role specified');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Validate password strength
     */
    validatePassword(password) {
        const errors = [];
        const requirements = this.config.security.passwordRequirements;
        
        if (password.length < this.config.security.passwordMinLength) {
            errors.push(`Password must be at least ${this.config.security.passwordMinLength} characters long`);
        }
        
        if (requirements.uppercase && !/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        
        if (requirements.lowercase && !/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        
        if (requirements.numbers && !/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        
        if (requirements.symbols && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Record failed login attempt
     */
    async recordFailedLogin(email, ip) {
        try {
            const user = this.users.get(email);
            if (user) {
                user.loginAttempts = (user.loginAttempts || 0) + 1;
                
                if (user.loginAttempts >= this.config.security.maxLoginAttempts) {
                    user.lockedUntil = new Date(Date.now() + this.config.security.lockoutDuration).toISOString();
                    console.warn(`[OWASP-A01] Account locked: ${email} due to ${user.loginAttempts} failed attempts`);
                }
                
                await this.saveUsers();
            }
            
            // Track IP-based attempts
            const ipAttempts = this.loginAttempts.get(ip) || { count: 0, lastAttempt: null };
            ipAttempts.count++;
            ipAttempts.lastAttempt = new Date().toISOString();
            this.loginAttempts.set(ip, ipAttempts);
            
            await this.saveLoginAttempts();
            
        } catch (error) {
            console.error('[OWASP-A01] Failed to record login attempt:', error);
        }
    }

    /**
     * Limit concurrent sessions per user
     */
    async limitConcurrentSessions(userId) {
        try {
            const userSessions = Array.from(this.sessions.values())
                .filter(session => session.userId === userId && session.isActive);
            
            if (userSessions.length >= this.config.security.concurrentSessionLimit) {
                // Remove oldest sessions
                userSessions
                    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                    .slice(0, userSessions.length - this.config.security.concurrentSessionLimit + 1)
                    .forEach(session => {
                        this.invalidateSession(session.id);
                    });
            }
        } catch (error) {
            console.error('[OWASP-A01] Failed to limit concurrent sessions:', error);
        }
    }

    /**
     * Check if session needs rotation
     */
    checkSessionRotationNeeded(session) {
        const rotationInterval = this.config.security.sessionRotationInterval;
        const lastRotation = session.lastRotation || session.createdAt;
        return (Date.now() - new Date(lastRotation).getTime()) > rotationInterval;
    }

    /**
     * Rotate session ID
     */
    async rotateSession(oldSessionId) {
        try {
            const oldSession = this.sessions.get(oldSessionId);
            if (!oldSession) return;
            
            const newSessionId = crypto.randomBytes(32).toString('hex');
            const newSession = {
                ...oldSession,
                id: newSessionId,
                lastRotation: new Date().toISOString(),
                rotationCount: (oldSession.rotationCount || 0) + 1
            };
            
            // Remove old session and add new one
            this.sessions.delete(oldSessionId);
            this.sessions.set(newSessionId, newSession);
            
            await this.saveSessions();
            
            console.log(`[OWASP-A01] Session rotated: ${oldSessionId} -> ${newSessionId}`);
            
        } catch (error) {
            console.error('[OWASP-A01] Session rotation failed:', error);
        }
    }

    /**
     * Invalidate session
     */
    async invalidateSession(sessionId) {
        try {
            const session = this.sessions.get(sessionId);
            if (session) {
                session.isActive = false;
                session.invalidatedAt = new Date().toISOString();
                await this.saveSessions();
            }
        } catch (error) {
            console.error('[OWASP-A01] Session invalidation failed:', error);
        }
    }

    /**
     * Get required permission for path and method
     */
    getRequiredPermission(path, method) {
        // Define permission mapping
        const permissionMap = {
            'GET /api/security': 'view:security',
            'POST /api/security': 'manage:security',
            'GET /api/admin': 'view:admin',
            'POST /api/admin': 'manage:admin',
            'GET /api/reports': 'view:reports',
            'DELETE /api/*': 'delete:resource'
        };
        
        const key = `${method} ${path}`;
        return permissionMap[key] || null;
    }

    /**
     * Check if user has specific permission
     */
    hasPermission(user, permission) {
        if (!user.permissions) return false;
        
        // Check for wildcard permission
        if (user.permissions.includes('*')) return true;
        
        // Check for exact permission
        if (user.permissions.includes(permission)) return true;
        
        // Check for wildcard in permission category
        const [category] = permission.split(':');
        if (user.permissions.includes(`${category}:*`)) return true;
        
        return false;
    }

    /**
     * Send unauthorized response
     */
    sendUnauthorized(res, message = 'Unauthorized') {
        return res.status(401).json({
            success: false,
            error: message,
            code: 'UNAUTHORIZED',
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Send forbidden response
     */
    sendForbidden(res, message = 'Forbidden') {
        return res.status(403).json({
            success: false,
            error: message,
            code: 'FORBIDDEN',
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Log access for security monitoring
     */
    logAccess(user, req) {
        console.log(`[OWASP-A01] Access granted: ${user.email} (${user.role}) -> ${req.method} ${req.path}`);
    }

    /**
     * Create default admin user
     */
    async createDefaultAdmin() {
        try {
            const adminEmail = process.env.ADMIN_EMAIL || 'admin@roboticscontrol.ie';
            
            if (!this.users.has(adminEmail)) {
                const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'RoboticsControl2025!Admin';
                
                await this.registerUser({
                    email: adminEmail,
                    name: 'System Administrator',
                    password: defaultPassword,
                    role: 'SUPER_ADMIN'
                });
                
                console.log(`[OWASP-A01] Default admin user created: ${adminEmail}`);
                console.log(`[OWASP-A01] Default password: ${defaultPassword}`);
                console.log('[OWASP-A01] IMPORTANT: Change the default password immediately!');
            }
        } catch (error) {
            console.error('[OWASP-A01] Failed to create default admin:', error);
        }
    }

    /**
     * Start cleanup intervals
     */
    startCleanupIntervals() {
        // Clean expired sessions every hour
        setInterval(() => {
            this.cleanupExpiredSessions();
        }, 60 * 60 * 1000);
        
        // Clean old login attempts every day
        setInterval(() => {
            this.cleanupLoginAttempts();
        }, 24 * 60 * 60 * 1000);
    }

    /**
     * Cleanup expired sessions
     */
    async cleanupExpiredSessions() {
        try {
            const now = new Date();
            let cleanedCount = 0;
            
            for (const [sessionId, session] of this.sessions.entries()) {
                if (new Date(session.expiresAt) < now) {
                    this.sessions.delete(sessionId);
                    cleanedCount++;
                }
            }
            
            if (cleanedCount > 0) {
                await this.saveSessions();
                console.log(`[OWASP-A01] Cleaned up ${cleanedCount} expired sessions`);
            }
        } catch (error) {
            console.error('[OWASP-A01] Session cleanup failed:', error);
        }
    }

    /**
     * Cleanup old login attempts
     */
    async cleanupLoginAttempts() {
        try {
            const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
            let cleanedCount = 0;
            
            for (const [ip, attempts] of this.loginAttempts.entries()) {
                if (new Date(attempts.lastAttempt) < cutoff) {
                    this.loginAttempts.delete(ip);
                    cleanedCount++;
                }
            }
            
            if (cleanedCount > 0) {
                await this.saveLoginAttempts();
                console.log(`[OWASP-A01] Cleaned up ${cleanedCount} old login attempts`);
            }
        } catch (error) {
            console.error('[OWASP-A01] Login attempts cleanup failed:', error);
        }
    }

    // ==================== DATA PERSISTENCE ====================

    async loadUsers() {
        try {
            if (await fs.exists(this.config.paths.users)) {
                const data = await fs.readJSON(this.config.paths.users);
                this.users = new Map(Object.entries(data));
                console.log(`[OWASP-A01] Loaded ${this.users.size} users`);
            }
        } catch (error) {
            console.error('[OWASP-A01] Failed to load users:', error);
        }
    }

    async saveUsers() {
        try {
            const data = Object.fromEntries(this.users);
            await fs.writeJSON(this.config.paths.users, data, { spaces: 2 });
        } catch (error) {
            console.error('[OWASP-A01] Failed to save users:', error);
        }
    }

    async loadSessions() {
        try {
            if (await fs.exists(this.config.paths.sessions)) {
                const data = await fs.readJSON(this.config.paths.sessions);
                this.sessions = new Map(Object.entries(data));
                console.log(`[OWASP-A01] Loaded ${this.sessions.size} sessions`);
            }
        } catch (error) {
            console.error('[OWASP-A01] Failed to load sessions:', error);
        }
    }

    async saveSessions() {
        try {
            const data = Object.fromEntries(this.sessions);
            await fs.writeJSON(this.config.paths.sessions, data, { spaces: 2 });
        } catch (error) {
            console.error('[OWASP-A01] Failed to save sessions:', error);
        }
    }

    async loadLoginAttempts() {
        try {
            if (await fs.exists(this.config.paths.loginAttempts)) {
                const data = await fs.readJSON(this.config.paths.loginAttempts);
                this.loginAttempts = new Map(Object.entries(data));
                console.log(`[OWASP-A01] Loaded ${this.loginAttempts.size} login attempt records`);
            }
        } catch (error) {
            console.error('[OWASP-A01] Failed to load login attempts:', error);
        }
    }

    async saveLoginAttempts() {
        try {
            const data = Object.fromEntries(this.loginAttempts);
            await fs.writeJSON(this.config.paths.loginAttempts, data, { spaces: 2 });
        } catch (error) {
            console.error('[OWASP-A01] Failed to save login attempts:', error);
        }
    }

    // ==================== PUBLIC API ====================

    /**
     * Get user by email
     */
    getUser(email) {
        return this.users.get(email.toLowerCase());
    }

    /**
     * Get session by ID
     */
    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }

    /**
     * Revoke JWT token
     */
    revokeToken(token) {
        this.activeTokens.delete(token);
    }

    /**
     * Get access control configuration
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Get security metrics
     */
    getSecurityMetrics() {
        return {
            totalUsers: this.users.size,
            activeSessions: Array.from(this.sessions.values()).filter(s => s.isActive).length,
            lockedAccounts: Array.from(this.users.values()).filter(u => u.lockedUntil && new Date() < new Date(u.lockedUntil)).length,
            recentLoginAttempts: this.loginAttempts.size,
            activeTokens: this.activeTokens.size
        };
    }
}

module.exports = {
    AccessControlManager,
    ACCESS_CONTROL_CONFIG
};