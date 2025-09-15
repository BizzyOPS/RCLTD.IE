/**
 * OWASP A02: Cryptographic Failures Prevention
 * Robotics & Control Ltd - Enterprise Security Implementation
 * 
 * This module implements comprehensive cryptographic security measures including:
 * - Data encryption and decryption
 * - Secure key management
 * - Certificate validation
 * - Secure random generation
 * - Hash functions and digital signatures
 */

const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');
const bcrypt = require('bcrypt');
const CryptoJS = require('crypto-js');

// ==================== CRYPTOGRAPHIC CONFIGURATION ====================

const CRYPTO_CONFIG = {
    // Encryption settings
    encryption: {
        algorithm: 'aes-256-gcm',
        keyLength: 32, // 256 bits
        ivLength: 16,  // 128 bits
        tagLength: 16, // 128 bits
        saltLength: 32 // 256 bits
    },
    
    // Key management
    keyManagement: {
        keyRotationInterval: 90 * 24 * 60 * 60 * 1000, // 90 days
        keyDerivationIterations: 100000,
        masterKeyPath: './security-data/master.key',
        keyStorePath: './security-data/keys.json'
    },
    
    // Hashing configuration
    hashing: {
        bcryptRounds: 12,
        algorithm: 'sha256',
        pepper: process.env.CRYPTO_PEPPER || (() => {
            if (process.env.NODE_ENV === 'production') {
                throw new Error('CRYPTO_PEPPER environment variable is required in production for security.');
            }
            console.warn('[CRYPTO] Using generated pepper for development. Set CRYPTO_PEPPER for production.');
            return crypto.randomBytes(32).toString('hex');
        })()
    },
    
    // Random generation
    random: {
        tokenLength: 32,
        sessionIdLength: 32,
        saltLength: 32
    },
    
    // Certificate validation
    certificates: {
        validateChain: true,
        checkRevocation: true,
        allowSelfSigned: process.env.NODE_ENV !== 'production',
        trustedCAs: []
    },
    
    // Secure cookie settings
    cookies: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        signed: true
    }
};

// ==================== CRYPTOGRAPHIC MANAGER CLASS ====================

class CryptographicManager {
    constructor(config = CRYPTO_CONFIG) {
        this.config = config;
        this.masterKey = null;
        this.dataEncryptionKeys = new Map();
        this.keyHistory = [];
        
        // Initialize cryptographic system
        this.initialize();
    }

    /**
     * Initialize the cryptographic system
     */
    async initialize() {
        try {
            // Ensure security data directory exists
            await fs.ensureDir('./security-data');
            
            // Load or generate master key
            await this.loadOrGenerateMasterKey();
            
            // Load existing keys
            await this.loadKeys();
            
            // Start key rotation schedule
            this.startKeyRotationSchedule();
            
            console.log('[OWASP-A02] Cryptographic Manager initialized');
            
        } catch (error) {
            console.error('[OWASP-A02] Failed to initialize cryptographic manager:', error);
            throw error;
        }
    }

    /**
     * Middleware for cryptographic security headers
     */
    middleware() {
        return (req, res, next) => {
            try {
                // Set cryptographic security headers
                res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
                res.setHeader('X-Content-Type-Options', 'nosniff');
                res.setHeader('X-Frame-Options', 'DENY');
                res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
                
                // Add cryptographic context to request
                req.crypto = {
                    encrypt: this.encrypt.bind(this),
                    decrypt: this.decrypt.bind(this),
                    hash: this.hash.bind(this),
                    verify: this.verify.bind(this),
                    generateToken: this.generateSecureToken.bind(this),
                    generateSalt: this.generateSalt.bind(this)
                };
                
                next();
                
            } catch (error) {
                console.error('[OWASP-A02] Cryptographic middleware error:', error);
                next();
            }
        };
    }

    // ==================== ENCRYPTION/DECRYPTION ====================

    /**
     * Encrypt sensitive data using AES-256-GCM
     */
    async encrypt(plaintext, keyId = 'default') {
        try {
            if (!plaintext) {
                throw new Error('Plaintext is required for encryption');
            }
            
            // Get or generate data encryption key
            const dataKey = await this.getDataEncryptionKey(keyId);
            
            // Generate random IV
            const iv = crypto.randomBytes(this.config.encryption.ivLength);
            
            // Create cipher
            const cipher = crypto.createCipheriv(this.config.encryption.algorithm, dataKey, iv);
            
            // Encrypt data
            let encrypted = cipher.update(plaintext, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            // Get authentication tag
            const authTag = cipher.getAuthTag();
            
            // Create encrypted object
            const encryptedData = {
                algorithm: this.config.encryption.algorithm,
                keyId: keyId,
                iv: iv.toString('hex'),
                authTag: authTag.toString('hex'),
                encrypted: encrypted,
                timestamp: new Date().toISOString()
            };
            
            return encryptedData;
            
        } catch (error) {
            console.error('[OWASP-A02] Encryption failed:', error);
            throw new Error('Data encryption failed');
        }
    }

    /**
     * Decrypt sensitive data
     */
    async decrypt(encryptedData) {
        try {
            if (!encryptedData || typeof encryptedData !== 'object') {
                throw new Error('Invalid encrypted data format');
            }
            
            // Get data encryption key
            const dataKey = await this.getDataEncryptionKey(encryptedData.keyId);
            
            if (!dataKey) {
                throw new Error('Decryption key not found');
            }
            
            // Create decipher
            const decipher = crypto.createDecipheriv(
                encryptedData.algorithm,
                dataKey,
                Buffer.from(encryptedData.iv, 'hex')
            );
            
            // Set auth tag
            decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
            
            // Decrypt data
            let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
            
        } catch (error) {
            console.error('[OWASP-A02] Decryption failed:', error);
            throw new Error('Data decryption failed');
        }
    }

    /**
     * Encrypt data with password-based encryption
     */
    encryptWithPassword(plaintext, password) {
        try {
            // Generate salt
            const salt = crypto.randomBytes(this.config.encryption.saltLength);
            
            // Derive key from password
            const key = crypto.pbkdf2Sync(
                password,
                salt,
                this.config.keyManagement.keyDerivationIterations,
                this.config.encryption.keyLength,
                'sha256'
            );
            
            // Generate IV
            const iv = crypto.randomBytes(this.config.encryption.ivLength);
            
            // Encrypt
            const cipher = crypto.createCipheriv(this.config.encryption.algorithm, key, iv);
            let encrypted = cipher.update(plaintext, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            const authTag = cipher.getAuthTag();
            
            return {
                salt: salt.toString('hex'),
                iv: iv.toString('hex'),
                authTag: authTag.toString('hex'),
                encrypted: encrypted,
                algorithm: this.config.encryption.algorithm,
                iterations: this.config.keyManagement.keyDerivationIterations
            };
            
        } catch (error) {
            console.error('[OWASP-A02] Password-based encryption failed:', error);
            throw new Error('Password-based encryption failed');
        }
    }

    /**
     * Decrypt data with password-based encryption
     */
    decryptWithPassword(encryptedData, password) {
        try {
            // Derive key from password
            const key = crypto.pbkdf2Sync(
                password,
                Buffer.from(encryptedData.salt, 'hex'),
                encryptedData.iterations,
                this.config.encryption.keyLength,
                'sha256'
            );
            
            // Decrypt
            const decipher = crypto.createDecipheriv(
                encryptedData.algorithm,
                key,
                Buffer.from(encryptedData.iv, 'hex')
            );
            
            decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
            
            let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
            
        } catch (error) {
            console.error('[OWASP-A02] Password-based decryption failed:', error);
            throw new Error('Password-based decryption failed');
        }
    }

    // ==================== HASHING AND VERIFICATION ====================

    /**
     * Create secure hash with salt and pepper
     */
    async hash(data, options = {}) {
        try {
            const config = { ...this.config.hashing, ...options };
            
            // Generate salt if not provided
            const salt = options.salt || crypto.randomBytes(config.saltLength || 32);
            
            // Combine data with pepper
            const pepperedData = data + config.pepper;
            
            // Create hash with salt
            const hash = crypto.createHash(config.algorithm);
            hash.update(salt);
            hash.update(pepperedData);
            
            const hashValue = hash.digest('hex');
            
            return {
                hash: hashValue,
                salt: salt.toString('hex'),
                algorithm: config.algorithm,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('[OWASP-A02] Hashing failed:', error);
            throw new Error('Data hashing failed');
        }
    }

    /**
     * Verify hash
     */
    async verify(data, hashData) {
        try {
            // Recreate hash with same salt and pepper
            const verificationHash = await this.hash(data, {
                salt: Buffer.from(hashData.salt, 'hex'),
                algorithm: hashData.algorithm
            });
            
            // Constant time comparison
            return crypto.timingSafeEqual(
                Buffer.from(verificationHash.hash, 'hex'),
                Buffer.from(hashData.hash, 'hex')
            );
            
        } catch (error) {
            console.error('[OWASP-A02] Hash verification failed:', error);
            return false;
        }
    }

    /**
     * Hash password with bcrypt
     */
    async hashPassword(password) {
        try {
            const saltRounds = this.config.hashing.bcryptRounds;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            
            return {
                hash: hashedPassword,
                algorithm: 'bcrypt',
                rounds: saltRounds,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('[OWASP-A02] Password hashing failed:', error);
            throw new Error('Password hashing failed');
        }
    }

    /**
     * Verify password with bcrypt
     */
    async verifyPassword(password, hashData) {
        try {
            return await bcrypt.compare(password, hashData.hash);
        } catch (error) {
            console.error('[OWASP-A02] Password verification failed:', error);
            return false;
        }
    }

    // ==================== SECURE RANDOM GENERATION ====================

    /**
     * Generate cryptographically secure random token
     */
    generateSecureToken(length = null) {
        try {
            const tokenLength = length || this.config.random.tokenLength;
            return crypto.randomBytes(tokenLength).toString('hex');
        } catch (error) {
            console.error('[OWASP-A02] Token generation failed:', error);
            throw new Error('Secure token generation failed');
        }
    }

    /**
     * Generate secure random salt
     */
    generateSalt(length = null) {
        try {
            const saltLength = length || this.config.random.saltLength;
            return crypto.randomBytes(saltLength);
        } catch (error) {
            console.error('[OWASP-A02] Salt generation failed:', error);
            throw new Error('Salt generation failed');
        }
    }

    /**
     * Generate secure session ID
     */
    generateSessionId() {
        try {
            return crypto.randomBytes(this.config.random.sessionIdLength).toString('hex');
        } catch (error) {
            console.error('[OWASP-A02] Session ID generation failed:', error);
            throw new Error('Session ID generation failed');
        }
    }

    /**
     * Generate secure random number
     */
    generateSecureRandom(min = 0, max = Number.MAX_SAFE_INTEGER) {
        try {
            const range = max - min;
            const bytesNeeded = Math.ceil(Math.log2(range) / 8);
            const maxValidValue = Math.floor(256 ** bytesNeeded / range) * range;
            
            let randomValue;
            do {
                const randomBytes = crypto.randomBytes(bytesNeeded);
                randomValue = parseInt(randomBytes.toString('hex'), 16);
            } while (randomValue >= maxValidValue);
            
            return min + (randomValue % range);
            
        } catch (error) {
            console.error('[OWASP-A02] Secure random generation failed:', error);
            throw new Error('Secure random generation failed');
        }
    }

    // ==================== DIGITAL SIGNATURES ====================

    /**
     * Create digital signature
     */
    createSignature(data, privateKey) {
        try {
            const sign = crypto.createSign('SHA256');
            sign.update(data);
            const signature = sign.sign(privateKey, 'hex');
            
            return {
                signature: signature,
                algorithm: 'SHA256',
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('[OWASP-A02] Signature creation failed:', error);
            throw new Error('Digital signature creation failed');
        }
    }

    /**
     * Verify digital signature
     */
    verifySignature(data, signatureData, publicKey) {
        try {
            const verify = crypto.createVerify('SHA256');
            verify.update(data);
            return verify.verify(publicKey, signatureData.signature, 'hex');
            
        } catch (error) {
            console.error('[OWASP-A02] Signature verification failed:', error);
            return false;
        }
    }

    // ==================== KEY MANAGEMENT ====================

    /**
     * Load or generate master key
     */
    async loadOrGenerateMasterKey() {
        try {
            const masterKeyPath = this.config.keyManagement.masterKeyPath;
            
            if (await fs.exists(masterKeyPath)) {
                // Load existing master key
                const encryptedMasterKey = await fs.readFile(masterKeyPath, 'utf8');
                
                // Master key password must be set via environment variable
                const keyPassword = process.env.MASTER_KEY_PASSWORD;
                if (!keyPassword) {
                    throw new Error('MASTER_KEY_PASSWORD environment variable is required for security. Set a strong password.');
                }
                
                try {
                    const masterKeyData = JSON.parse(encryptedMasterKey);
                    this.masterKey = this.decryptWithPassword(masterKeyData, keyPassword);
                    console.log('[OWASP-A02] Master key loaded successfully');
                } catch (decryptError) {
                    console.warn('[OWASP-A02] Failed to decrypt existing master key, generating new one');
                    await this.generateNewMasterKey();
                }
            } else {
                // Generate new master key
                await this.generateNewMasterKey();
            }
            
        } catch (error) {
            console.error('[OWASP-A02] Master key initialization failed:', error);
            throw error;
        }
    }

    /**
     * Generate new master key
     */
    async generateNewMasterKey() {
        try {
            // Generate random master key
            this.masterKey = crypto.randomBytes(this.config.encryption.keyLength).toString('hex');
            
            // Encrypt master key with password
            const keyPassword = process.env.MASTER_KEY_PASSWORD;
            if (!keyPassword) {
                throw new Error('MASTER_KEY_PASSWORD environment variable is required for security. Set a strong password.');
            }
            const encryptedMasterKey = this.encryptWithPassword(this.masterKey, keyPassword);
            
            // Save encrypted master key
            await fs.writeFile(
                this.config.keyManagement.masterKeyPath,
                JSON.stringify(encryptedMasterKey, null, 2)
            );
            
            console.log('[OWASP-A02] New master key generated and saved');
            
            // Log security warning for production
            if (process.env.NODE_ENV === 'production' && keyPassword === 'default-password-change-in-production') {
                console.error('[OWASP-A02] WARNING: Using default master key password in production! Set MASTER_KEY_PASSWORD environment variable.');
            }
            
        } catch (error) {
            console.error('[OWASP-A02] Master key generation failed:', error);
            throw error;
        }
    }

    /**
     * Get or generate data encryption key
     */
    async getDataEncryptionKey(keyId) {
        try {
            // Check if key exists in memory
            if (this.dataEncryptionKeys.has(keyId)) {
                const keyData = this.dataEncryptionKeys.get(keyId);
                
                // Check if key needs rotation
                if (this.shouldRotateKey(keyData)) {
                    return await this.rotateDataEncryptionKey(keyId);
                }
                
                return keyData.key;
            }
            
            // Generate new data encryption key
            const dataKey = crypto.randomBytes(this.config.encryption.keyLength);
            
            // Encrypt data key with master key
            const encryptedDataKey = this.encryptDataKeyWithMaster(dataKey);
            
            const keyData = {
                keyId: keyId,
                key: dataKey,
                encryptedKey: encryptedDataKey,
                createdAt: new Date().toISOString(),
                version: 1
            };
            
            // Store in memory and persist
            this.dataEncryptionKeys.set(keyId, keyData);
            await this.saveKeys();
            
            console.log(`[OWASP-A02] Generated new data encryption key: ${keyId}`);
            
            return dataKey;
            
        } catch (error) {
            console.error('[OWASP-A02] Data encryption key retrieval failed:', error);
            throw error;
        }
    }

    /**
     * Encrypt data key with master key
     */
    encryptDataKeyWithMaster(dataKey) {
        try {
            const iv = crypto.randomBytes(this.config.encryption.ivLength);
            const cipher = crypto.createCipheriv(this.config.encryption.algorithm, this.masterKey, iv);
            
            let encrypted = cipher.update(dataKey, null, 'hex');
            encrypted += cipher.final('hex');
            
            const authTag = cipher.getAuthTag();
            
            return {
                iv: iv.toString('hex'),
                authTag: authTag.toString('hex'),
                encrypted: encrypted
            };
            
        } catch (error) {
            console.error('[OWASP-A02] Data key encryption with master key failed:', error);
            throw error;
        }
    }

    /**
     * Decrypt data key with master key
     */
    decryptDataKeyWithMaster(encryptedDataKey) {
        try {
            const decipher = crypto.createDecipheriv(
                this.config.encryption.algorithm,
                this.masterKey,
                Buffer.from(encryptedDataKey.iv, 'hex')
            );
            
            decipher.setAuthTag(Buffer.from(encryptedDataKey.authTag, 'hex'));
            
            let decrypted = decipher.update(encryptedDataKey.encrypted, 'hex', null);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            
            return decrypted;
            
        } catch (error) {
            console.error('[OWASP-A02] Data key decryption with master key failed:', error);
            throw error;
        }
    }

    /**
     * Check if key should be rotated
     */
    shouldRotateKey(keyData) {
        const keyAge = Date.now() - new Date(keyData.createdAt).getTime();
        return keyAge > this.config.keyManagement.keyRotationInterval;
    }

    /**
     * Rotate data encryption key
     */
    async rotateDataEncryptionKey(keyId) {
        try {
            const oldKeyData = this.dataEncryptionKeys.get(keyId);
            
            // Generate new key
            const newDataKey = crypto.randomBytes(this.config.encryption.keyLength);
            const encryptedDataKey = this.encryptDataKeyWithMaster(newDataKey);
            
            const newKeyData = {
                keyId: keyId,
                key: newDataKey,
                encryptedKey: encryptedDataKey,
                createdAt: new Date().toISOString(),
                version: (oldKeyData.version || 0) + 1,
                previousVersion: oldKeyData.version
            };
            
            // Store new key
            this.dataEncryptionKeys.set(keyId, newKeyData);
            
            // Keep old key for decryption of existing data
            this.keyHistory.push({
                ...oldKeyData,
                rotatedAt: new Date().toISOString()
            });
            
            await this.saveKeys();
            
            console.log(`[OWASP-A02] Rotated data encryption key: ${keyId} (version ${newKeyData.version})`);
            
            return newDataKey;
            
        } catch (error) {
            console.error('[OWASP-A02] Key rotation failed:', error);
            throw error;
        }
    }

    /**
     * Start key rotation schedule
     */
    startKeyRotationSchedule() {
        // Check for key rotation every hour
        setInterval(() => {
            this.performScheduledKeyRotation();
        }, 60 * 60 * 1000);
    }

    /**
     * Perform scheduled key rotation
     */
    async performScheduledKeyRotation() {
        try {
            let rotatedCount = 0;
            
            for (const [keyId, keyData] of this.dataEncryptionKeys.entries()) {
                if (this.shouldRotateKey(keyData)) {
                    await this.rotateDataEncryptionKey(keyId);
                    rotatedCount++;
                }
            }
            
            if (rotatedCount > 0) {
                console.log(`[OWASP-A02] Performed scheduled rotation of ${rotatedCount} keys`);
            }
            
        } catch (error) {
            console.error('[OWASP-A02] Scheduled key rotation failed:', error);
        }
    }

    // ==================== CERTIFICATE VALIDATION ====================

    /**
     * Validate certificate chain
     */
    validateCertificateChain(cert, chain = []) {
        try {
            // This is a simplified implementation
            // In production, use proper certificate validation libraries
            
            if (!this.config.certificates.validateChain) {
                return { valid: true, message: 'Certificate validation disabled' };
            }
            
            // Basic certificate checks
            const certObj = crypto.X509Certificate ? new crypto.X509Certificate(cert) : null;
            
            if (!certObj) {
                return { valid: false, message: 'Invalid certificate format' };
            }
            
            // Check expiration
            const now = new Date();
            const notBefore = new Date(certObj.validFrom);
            const notAfter = new Date(certObj.validTo);
            
            if (now < notBefore || now > notAfter) {
                return { valid: false, message: 'Certificate has expired or is not yet valid' };
            }
            
            // Check if self-signed is allowed
            if (certObj.issuer === certObj.subject && !this.config.certificates.allowSelfSigned) {
                return { valid: false, message: 'Self-signed certificates are not allowed' };
            }
            
            return { valid: true, message: 'Certificate validation passed' };
            
        } catch (error) {
            console.error('[OWASP-A02] Certificate validation failed:', error);
            return { valid: false, message: 'Certificate validation error' };
        }
    }

    // ==================== SECURE COOKIES ====================

    /**
     * Get secure cookie configuration
     */
    getSecureCookieOptions(overrides = {}) {
        return {
            ...this.config.cookies,
            ...overrides
        };
    }

    /**
     * Sign cookie value
     */
    signCookie(value, secret) {
        try {
            const signature = crypto
                .createHmac('sha256', secret)
                .update(value)
                .digest('hex');
            
            return `${value}.${signature}`;
            
        } catch (error) {
            console.error('[OWASP-A02] Cookie signing failed:', error);
            throw error;
        }
    }

    /**
     * Verify signed cookie
     */
    verifyCookie(signedValue, secret) {
        try {
            const [value, signature] = signedValue.split('.');
            
            if (!value || !signature) {
                return null;
            }
            
            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(value)
                .digest('hex');
            
            if (crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'))) {
                return value;
            }
            
            return null;
            
        } catch (error) {
            console.error('[OWASP-A02] Cookie verification failed:', error);
            return null;
        }
    }

    // ==================== DATA PERSISTENCE ====================

    async loadKeys() {
        try {
            if (await fs.exists(this.config.keyManagement.keyStorePath)) {
                const keysData = await fs.readJSON(this.config.keyManagement.keyStorePath);
                
                // Decrypt and load data encryption keys
                for (const [keyId, encryptedKeyData] of Object.entries(keysData.dataKeys || {})) {
                    try {
                        const decryptedKey = this.decryptDataKeyWithMaster(encryptedKeyData.encryptedKey);
                        
                        this.dataEncryptionKeys.set(keyId, {
                            ...encryptedKeyData,
                            key: decryptedKey
                        });
                    } catch (decryptError) {
                        console.warn(`[OWASP-A02] Failed to decrypt key ${keyId}:`, decryptError);
                    }
                }
                
                // Load key history
                this.keyHistory = keysData.keyHistory || [];
                
                console.log(`[OWASP-A02] Loaded ${this.dataEncryptionKeys.size} encryption keys`);
            }
        } catch (error) {
            console.error('[OWASP-A02] Failed to load keys:', error);
        }
    }

    async saveKeys() {
        try {
            const keysData = {
                dataKeys: {},
                keyHistory: this.keyHistory,
                lastUpdated: new Date().toISOString()
            };
            
            // Save data encryption keys (without the actual key data)
            for (const [keyId, keyData] of this.dataEncryptionKeys.entries()) {
                keysData.dataKeys[keyId] = {
                    keyId: keyData.keyId,
                    encryptedKey: keyData.encryptedKey,
                    createdAt: keyData.createdAt,
                    version: keyData.version,
                    previousVersion: keyData.previousVersion
                };
            }
            
            await fs.writeJSON(this.config.keyManagement.keyStorePath, keysData, { spaces: 2 });
            
        } catch (error) {
            console.error('[OWASP-A02] Failed to save keys:', error);
        }
    }

    // ==================== PUBLIC API ====================

    /**
     * Get cryptographic metrics
     */
    getCryptographicMetrics() {
        return {
            totalDataKeys: this.dataEncryptionKeys.size,
            keyHistorySize: this.keyHistory.length,
            masterKeyExists: !!this.masterKey,
            keysNeedingRotation: Array.from(this.dataEncryptionKeys.values())
                .filter(keyData => this.shouldRotateKey(keyData)).length
        };
    }

    /**
     * Get cryptographic configuration (without sensitive data)
     */
    getConfig() {
        const safeConfig = JSON.parse(JSON.stringify(this.config));
        
        // Remove sensitive configuration
        delete safeConfig.hashing.pepper;
        delete safeConfig.keyManagement.masterKeyPath;
        delete safeConfig.keyManagement.keyStorePath;
        
        return safeConfig;
    }

    /**
     * Test cryptographic functions
     */
    async testCryptographicFunctions() {
        try {
            const testData = 'Test data for cryptographic validation';
            
            // Test encryption/decryption
            const encrypted = await this.encrypt(testData);
            const decrypted = await this.decrypt(encrypted);
            
            if (decrypted !== testData) {
                throw new Error('Encryption/decryption test failed');
            }
            
            // Test hashing/verification
            const hashed = await this.hash(testData);
            const verified = await this.verify(testData, hashed);
            
            if (!verified) {
                throw new Error('Hashing/verification test failed');
            }
            
            // Test password hashing
            const passwordHash = await this.hashPassword('testpassword123');
            const passwordVerified = await this.verifyPassword('testpassword123', passwordHash);
            
            if (!passwordVerified) {
                throw new Error('Password hashing test failed');
            }
            
            // Test token generation
            const token = this.generateSecureToken();
            if (!token || token.length !== this.config.random.tokenLength * 2) {
                throw new Error('Token generation test failed');
            }
            
            console.log('[OWASP-A02] All cryptographic function tests passed');
            return true;
            
        } catch (error) {
            console.error('[OWASP-A02] Cryptographic function test failed:', error);
            return false;
        }
    }
}

module.exports = {
    CryptographicManager,
    CRYPTO_CONFIG
};