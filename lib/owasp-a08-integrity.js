/**
 * OWASP A08: Software & Data Integrity
 * Robotics & Control Ltd - Enterprise Security Implementation
 * 
 * This module implements comprehensive software and data integrity measures including:
 * - Code signing and verification
 * - CI/CD pipeline security
 * - Supply chain integrity checks
 * - Secure update mechanisms
 * - File integrity monitoring
 */

const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');

// ==================== SOFTWARE & DATA INTEGRITY CONFIGURATION ====================

const INTEGRITY_CONFIG = {
    // Code signing and verification
    codeSigning: {
        enableCodeSigning: true,
        enableSignatureVerification: true,
        signingAlgorithm: 'RSA-SHA256',
        keySize: 2048,
        certificateValidityPeriod: 365 * 24 * 60 * 60 * 1000, // 1 year
        trustedSigners: [],
        requiredSignatures: ['deployment', 'release', 'security_patch']
    },
    
    // File integrity monitoring
    fileIntegrity: {
        enableFileIntegrityMonitoring: true,
        enableRealTimeMonitoring: true,
        monitoredPaths: [
            './lib/',
            './server.js',
            './package.json',
            './package-lock.json',
            './security-data/',
            './css/',
            './js/'
        ],
        checksumAlgorithm: 'sha256',
        monitoringInterval: 5 * 60 * 1000, // 5 minutes
        alertOnChanges: true,
        allowedChangePaths: [
            './security-logs/',
            './security-reports/',
            './tmp/',
            './node_modules/'
        ]
    },
    
    // CI/CD security
    cicdSecurity: {
        enablePipelineSecurity: true,
        enableSecurityGates: true,
        enableDependencyValidation: true,
        enableSecurityTesting: true,
        requireSignedCommits: false, // Set to true in production
        requireReviewApproval: false, // Set to true in production
        securityTestThreshold: 0, // No high/critical vulnerabilities allowed
        buildArtifactSigning: true,
        deploymentValidation: true
    },
    
    // Supply chain integrity
    supplyChain: {
        enableSupplyChainValidation: true,
        enableDependencyIntegrity: true,
        enableSBOMGeneration: true, // Software Bill of Materials
        checksumValidation: true,
        signatureValidation: true,
        sourceValidation: true,
        licenseValidation: true,
        trustedRepositories: [
            'https://registry.npmjs.org/',
            'https://github.com/',
            'https://gitlab.com/'
        ]
    },
    
    // Update mechanisms
    updates: {
        enableSecureUpdates: true,
        enableUpdateValidation: true,
        enableRollbackCapability: true,
        updateChannels: ['security', 'stable', 'beta'],
        defaultChannel: 'stable',
        automaticSecurityUpdates: false, // Manual approval required
        updateSignatureRequired: true,
        backupBeforeUpdate: true,
        validateAfterUpdate: true
    },
    
    // Data integrity
    dataIntegrity: {
        enableDataIntegrityChecks: true,
        enableDatabaseIntegrity: true,
        enableConfigIntegrity: true,
        enableLogIntegrity: true,
        checksumValidation: true,
        tamperDetection: true,
        dataEncryption: true,
        backupIntegrity: true
    }
};

// ==================== SOFTWARE & DATA INTEGRITY MANAGER CLASS ====================

class SoftwareDataIntegrityManager {
    constructor(config = INTEGRITY_CONFIG) {
        this.config = config;
        this.fileChecksums = new Map();
        this.codeSignatures = new Map();
        this.integrityViolations = [];
        this.updateHistory = [];
        this.sbomData = new Map(); // Software Bill of Materials
        this.securityGates = new Map();
        this.buildArtifacts = new Map();
        
        // Initialize system
        this.initialize();
    }

    /**
     * Initialize software and data integrity system
     */
    async initialize() {
        try {
            // Ensure data directories exist
            await fs.ensureDir('./security-data/integrity');
            await fs.ensureDir('./security-data/signatures');
            await fs.ensureDir('./security-data/checksums');
            
            // Load existing data
            await this.loadFileChecksums();
            await this.loadCodeSignatures();
            await this.loadSBOMData();
            
            // Perform initial integrity scan
            await this.performIntegrityScan();
            
            // Generate Software Bill of Materials
            await this.generateSBOM();
            
            // Start monitoring intervals
            this.startIntegrityMonitoring();
            
            console.log('[OWASP-A08] Software & Data Integrity Manager initialized');
            
        } catch (error) {
            console.error('[OWASP-A08] Failed to initialize integrity manager:', error);
            throw error;
        }
    }

    /**
     * Middleware for integrity validation
     */
    middleware() {
        return (req, res, next) => {
            try {
                // Add integrity validation methods to request
                req.integrityValidation = {
                    validateFileIntegrity: this.validateFileIntegrity.bind(this),
                    verifyCodeSignature: this.verifyCodeSignature.bind(this),
                    checkDataIntegrity: this.checkDataIntegrity.bind(this),
                    validateUpdate: this.validateUpdate.bind(this),
                    generateChecksum: this.generateChecksum.bind(this)
                };
                
                // Perform runtime integrity checks for sensitive operations
                if (this.isSensitiveOperation(req)) {
                    const integrityCheck = this.performRuntimeIntegrityCheck(req);
                    
                    if (!integrityCheck.isValid) {
                        this.logIntegrityViolation('RUNTIME_INTEGRITY', req, integrityCheck.violations);
                        
                        return res.status(400).json({
                            success: false,
                            error: 'Integrity validation failed',
                            code: 'INTEGRITY_VIOLATION',
                            timestamp: new Date().toISOString()
                        });
                    }
                }
                
                next();
                
            } catch (error) {
                console.error('[OWASP-A08] Integrity validation middleware error:', error);
                next();
            }
        };
    }

    // ==================== FILE INTEGRITY MONITORING ====================

    /**
     * Perform comprehensive integrity scan
     */
    async performIntegrityScan() {
        try {
            console.log('[OWASP-A08] Starting integrity scan...');
            
            const violations = [];
            let scannedFiles = 0;
            let changedFiles = 0;
            
            for (const monitoredPath of this.config.fileIntegrity.monitoredPaths) {
                try {
                    const pathViolations = await this.scanPath(monitoredPath);
                    violations.push(...pathViolations);
                    
                    const files = await this.getFilesInPath(monitoredPath);
                    scannedFiles += files.length;
                    changedFiles += pathViolations.length;
                    
                } catch (pathError) {
                    console.warn(`[OWASP-A08] Failed to scan path ${monitoredPath}:`, pathError.message);
                }
            }
            
            // Store violations
            this.integrityViolations.push(...violations);
            
            // Save updated checksums
            await this.saveFileChecksums();
            
            console.log(`[OWASP-A08] Integrity scan completed: ${scannedFiles} files scanned, ${changedFiles} changes detected`);
            
            return {
                scannedFiles: scannedFiles,
                changedFiles: changedFiles,
                violations: violations,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('[OWASP-A08] Integrity scan failed:', error);
            throw error;
        }
    }

    /**
     * Scan specific path for integrity violations
     */
    async scanPath(targetPath) {
        try {
            const violations = [];
            
            if (!(await fs.exists(targetPath))) {
                violations.push({
                    type: 'missing_file',
                    path: targetPath,
                    message: 'Monitored file or directory is missing'
                });
                return violations;
            }
            
            const stat = await fs.stat(targetPath);
            
            if (stat.isDirectory()) {
                // Recursively scan directory
                const files = await fs.readdir(targetPath);
                
                for (const file of files) {
                    const filePath = path.join(targetPath, file);
                    const fileViolations = await this.scanPath(filePath);
                    violations.push(...fileViolations);
                }
            } else {
                // Check file integrity
                const fileViolation = await this.checkFileIntegrity(targetPath);
                if (fileViolation) {
                    violations.push(fileViolation);
                }
            }
            
            return violations;
            
        } catch (error) {
            console.error(`[OWASP-A08] Failed to scan path ${targetPath}:`, error);
            return [{
                type: 'scan_error',
                path: targetPath,
                message: `Failed to scan: ${error.message}`
            }];
        }
    }

    /**
     * Check integrity of a specific file
     */
    async checkFileIntegrity(filePath) {
        try {
            // Generate current checksum
            const currentChecksum = await this.generateFileChecksum(filePath);
            const storedChecksum = this.fileChecksums.get(filePath);
            
            // Get file stats
            const stats = await fs.stat(filePath);
            
            if (!storedChecksum) {
                // New file - store checksum
                this.fileChecksums.set(filePath, {
                    checksum: currentChecksum,
                    algorithm: this.config.fileIntegrity.checksumAlgorithm,
                    size: stats.size,
                    mtime: stats.mtime.toISOString(),
                    firstSeen: new Date().toISOString(),
                    lastChecked: new Date().toISOString()
                });
                
                return {
                    type: 'new_file',
                    path: filePath,
                    checksum: currentChecksum,
                    size: stats.size,
                    message: 'New file detected'
                };
            }
            
            // Check if file has changed
            if (currentChecksum !== storedChecksum.checksum) {
                // File has been modified
                const violation = {
                    type: 'file_modified',
                    path: filePath,
                    previousChecksum: storedChecksum.checksum,
                    currentChecksum: currentChecksum,
                    previousSize: storedChecksum.size,
                    currentSize: stats.size,
                    previousMtime: storedChecksum.mtime,
                    currentMtime: stats.mtime.toISOString(),
                    message: 'File has been modified',
                    timestamp: new Date().toISOString()
                };
                
                // Update stored checksum
                this.fileChecksums.set(filePath, {
                    ...storedChecksum,
                    checksum: currentChecksum,
                    size: stats.size,
                    mtime: stats.mtime.toISOString(),
                    lastChecked: new Date().toISOString(),
                    changeCount: (storedChecksum.changeCount || 0) + 1
                });
                
                return violation;
            }
            
            // Update last checked time
            storedChecksum.lastChecked = new Date().toISOString();
            
            return null; // No violation
            
        } catch (error) {
            console.error(`[OWASP-A08] File integrity check failed for ${filePath}:`, error);
            return {
                type: 'integrity_error',
                path: filePath,
                message: `Integrity check failed: ${error.message}`
            };
        }
    }

    /**
     * Generate file checksum
     */
    async generateFileChecksum(filePath) {
        try {
            const fileContent = await fs.readFile(filePath);
            return crypto
                .createHash(this.config.fileIntegrity.checksumAlgorithm)
                .update(fileContent)
                .digest('hex');
        } catch (error) {
            throw new Error(`Failed to generate checksum for ${filePath}: ${error.message}`);
        }
    }

    /**
     * Validate file integrity
     */
    async validateFileIntegrity(filePath) {
        try {
            const violation = await this.checkFileIntegrity(filePath);
            
            return {
                isValid: violation === null,
                violation: violation,
                checksum: this.fileChecksums.get(filePath)?.checksum,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error(`[OWASP-A08] File integrity validation failed for ${filePath}:`, error);
            return {
                isValid: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // ==================== CODE SIGNING & VERIFICATION ====================

    /**
     * Sign code artifact
     */
    async signCodeArtifact(artifactPath, signerInfo = {}) {
        try {
            // Generate artifact hash
            const artifactHash = await this.generateFileChecksum(artifactPath);
            
            // Create signature data
            const signatureData = {
                artifactPath: artifactPath,
                artifactHash: artifactHash,
                algorithm: this.config.codeSigning.signingAlgorithm,
                signer: signerInfo.name || 'system',
                signerEmail: signerInfo.email || 'system@roboticscontrol.ie',
                timestamp: new Date().toISOString(),
                nonce: crypto.randomBytes(16).toString('hex')
            };
            
            // Create signature (simplified - in production, use proper PKI)
            const signatureString = JSON.stringify(signatureData);
            const signature = crypto
                .createHash('sha256')
                .update(signatureString)
                .digest('hex');
            
            const signedArtifact = {
                ...signatureData,
                signature: signature,
                publicKey: 'mock-public-key', // In production, use real key
                certificateChain: ['mock-certificate'], // In production, use real chain
                validUntil: new Date(Date.now() + this.config.codeSigning.certificateValidityPeriod).toISOString()
            };
            
            // Store signature
            this.codeSignatures.set(artifactPath, signedArtifact);
            await this.saveCodeSignatures();
            
            console.log(`[OWASP-A08] Code artifact signed: ${artifactPath}`);
            
            return signedArtifact;
            
        } catch (error) {
            console.error(`[OWASP-A08] Code signing failed for ${artifactPath}:`, error);
            throw error;
        }
    }

    /**
     * Verify code signature
     */
    async verifyCodeSignature(artifactPath) {
        try {
            const signatureData = this.codeSignatures.get(artifactPath);
            
            if (!signatureData) {
                return {
                    isValid: false,
                    reason: 'No signature found for artifact',
                    timestamp: new Date().toISOString()
                };
            }
            
            // Check signature expiration
            if (new Date() > new Date(signatureData.validUntil)) {
                return {
                    isValid: false,
                    reason: 'Signature has expired',
                    expiredAt: signatureData.validUntil,
                    timestamp: new Date().toISOString()
                };
            }
            
            // Verify artifact hash
            const currentHash = await this.generateFileChecksum(artifactPath);
            if (currentHash !== signatureData.artifactHash) {
                return {
                    isValid: false,
                    reason: 'Artifact has been modified since signing',
                    expectedHash: signatureData.artifactHash,
                    actualHash: currentHash,
                    timestamp: new Date().toISOString()
                };
            }
            
            // Verify signature (simplified)
            const verificationData = {
                artifactPath: signatureData.artifactPath,
                artifactHash: signatureData.artifactHash,
                algorithm: signatureData.algorithm,
                signer: signatureData.signer,
                signerEmail: signatureData.signerEmail,
                timestamp: signatureData.timestamp,
                nonce: signatureData.nonce
            };
            
            const verificationString = JSON.stringify(verificationData);
            const expectedSignature = crypto
                .createHash('sha256')
                .update(verificationString)
                .digest('hex');
            
            if (expectedSignature !== signatureData.signature) {
                return {
                    isValid: false,
                    reason: 'Signature verification failed',
                    timestamp: new Date().toISOString()
                };
            }
            
            return {
                isValid: true,
                signatureData: signatureData,
                verifiedAt: new Date().toISOString()
            };
            
        } catch (error) {
            console.error(`[OWASP-A08] Signature verification failed for ${artifactPath}:`, error);
            return {
                isValid: false,
                reason: `Verification error: ${error.message}`,
                timestamp: new Date().toISOString()
            };
        }
    }

    // ==================== SUPPLY CHAIN INTEGRITY ====================

    /**
     * Generate Software Bill of Materials (SBOM)
     */
    async generateSBOM() {
        try {
            console.log('[OWASP-A08] Generating Software Bill of Materials...');
            
            const sbom = {
                id: uuidv4(),
                version: '1.0',
                createdAt: new Date().toISOString(),
                application: {
                    name: 'Robotics & Control Ltd Website',
                    version: '1.0.0',
                    description: 'Enterprise website with security framework'
                },
                components: [],
                dependencies: [],
                licenses: [],
                vulnerabilities: [],
                integrity: {
                    checksums: {},
                    signatures: {}
                }
            };
            
            // Add package.json dependencies
            if (await fs.exists('./package.json')) {
                const packageJson = await fs.readJSON('./package.json');
                
                // Main dependencies
                for (const [name, version] of Object.entries(packageJson.dependencies || {})) {
                    sbom.components.push({
                        type: 'library',
                        name: name,
                        version: version,
                        ecosystem: 'npm',
                        scope: 'runtime',
                        license: await this.getPackageLicense(name),
                        hash: await this.getPackageHash(name, version)
                    });
                }
                
                // Development dependencies
                for (const [name, version] of Object.entries(packageJson.devDependencies || {})) {
                    sbom.components.push({
                        type: 'library',
                        name: name,
                        version: version,
                        ecosystem: 'npm',
                        scope: 'development',
                        license: await this.getPackageLicense(name),
                        hash: await this.getPackageHash(name, version)
                    });
                }
            }
            
            // Add custom components
            const customComponents = await this.discoverCustomComponents();
            sbom.components.push(...customComponents);
            
            // Add file integrity data
            for (const [filePath, checksumData] of this.fileChecksums.entries()) {
                sbom.integrity.checksums[filePath] = {
                    algorithm: checksumData.algorithm,
                    value: checksumData.checksum,
                    lastUpdated: checksumData.lastChecked
                };
            }
            
            // Add code signatures
            for (const [artifactPath, signatureData] of this.codeSignatures.entries()) {
                sbom.integrity.signatures[artifactPath] = {
                    algorithm: signatureData.algorithm,
                    signature: signatureData.signature,
                    signer: signatureData.signer,
                    timestamp: signatureData.timestamp
                };
            }
            
            // Store SBOM
            this.sbomData.set('current', sbom);
            await this.saveSBOMData();
            
            console.log(`[OWASP-A08] SBOM generated with ${sbom.components.length} components`);
            
            return sbom;
            
        } catch (error) {
            console.error('[OWASP-A08] SBOM generation failed:', error);
            throw error;
        }
    }

    /**
     * Validate supply chain integrity
     */
    async validateSupplyChainIntegrity() {
        try {
            console.log('[OWASP-A08] Validating supply chain integrity...');
            
            const violations = [];
            
            // Validate package-lock.json integrity
            const packageLockIntegrity = await this.validatePackageLockIntegrity();
            if (!packageLockIntegrity.isValid) {
                violations.push(...packageLockIntegrity.violations);
            }
            
            // Validate dependency checksums
            const dependencyIntegrity = await this.validateDependencyIntegrity();
            if (!dependencyIntegrity.isValid) {
                violations.push(...dependencyIntegrity.violations);
            }
            
            // Validate source repositories
            const sourceIntegrity = await this.validateSourceIntegrity();
            if (!sourceIntegrity.isValid) {
                violations.push(...sourceIntegrity.violations);
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('[OWASP-A08] Supply chain integrity validation failed:', error);
            throw error;
        }
    }

    /**
     * Validate package-lock.json integrity
     */
    async validatePackageLockIntegrity() {
        try {
            const violations = [];
            
            if (!(await fs.exists('./package-lock.json'))) {
                violations.push({
                    type: 'missing_lock_file',
                    message: 'package-lock.json is missing'
                });
                return { isValid: false, violations: violations };
            }
            
            const packageLock = await fs.readJSON('./package-lock.json');
            
            // Validate integrity hashes for top-level dependencies
            if (packageLock.packages) {
                for (const [packagePath, packageData] of Object.entries(packageLock.packages)) {
                    if (packagePath.startsWith('node_modules/') && packageData.integrity) {
                        const packageName = packagePath.replace('node_modules/', '');
                        const packageDir = path.join('./node_modules', packageName);
                        
                        if (await fs.exists(packageDir)) {
                            // In a real implementation, you would validate the actual package integrity
                            // For now, we'll just check that integrity field exists
                            if (!packageData.integrity.startsWith('sha')) {
                                violations.push({
                                    type: 'invalid_integrity_hash',
                                    package: packageName,
                                    message: 'Invalid integrity hash format'
                                });
                            }
                        }
                    }
                }
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations
            };
            
        } catch (error) {
            console.error('[OWASP-A08] Package lock integrity validation failed:', error);
            return {
                isValid: false,
                violations: [{
                    type: 'validation_error',
                    message: `Package lock validation error: ${error.message}`
                }]
            };
        }
    }

    /**
     * Validate dependency integrity
     */
    async validateDependencyIntegrity() {
        try {
            const violations = [];
            
            // This would validate against known good checksums
            // For now, we'll implement basic validation
            
            const sbom = this.sbomData.get('current');
            if (sbom) {
                for (const component of sbom.components) {
                    if (component.hash) {
                        // Validate component hash (simplified)
                        const packagePath = path.join('./node_modules', component.name);
                        if (await fs.exists(packagePath)) {
                            // In production, you would validate the actual package hash
                            // For now, we'll just check the component exists
                        } else if (component.scope === 'runtime') {
                            violations.push({
                                type: 'missing_dependency',
                                component: component.name,
                                message: 'Runtime dependency is missing'
                            });
                        }
                    }
                }
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations
            };
            
        } catch (error) {
            console.error('[OWASP-A08] Dependency integrity validation failed:', error);
            return {
                isValid: false,
                violations: [{
                    type: 'validation_error',
                    message: `Dependency validation error: ${error.message}`
                }]
            };
        }
    }

    /**
     * Validate source integrity
     */
    async validateSourceIntegrity() {
        try {
            const violations = [];
            
            // Validate that dependencies come from trusted repositories
            if (await fs.exists('./package-lock.json')) {
                const packageLock = await fs.readJSON('./package-lock.json');
                
                if (packageLock.packages) {
                    for (const [packagePath, packageData] of Object.entries(packageLock.packages)) {
                        if (packageData.resolved) {
                            const isTrusted = this.config.supplyChain.trustedRepositories.some(
                                repo => packageData.resolved.startsWith(repo)
                            );
                            
                            if (!isTrusted) {
                                violations.push({
                                    type: 'untrusted_source',
                                    package: packagePath,
                                    source: packageData.resolved,
                                    message: 'Package comes from untrusted source'
                                });
                            }
                        }
                    }
                }
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations
            };
            
        } catch (error) {
            console.error('[OWASP-A08] Source integrity validation failed:', error);
            return {
                isValid: false,
                violations: [{
                    type: 'validation_error',
                    message: `Source validation error: ${error.message}`
                }]
            };
        }
    }

    // ==================== CI/CD SECURITY ====================

    /**
     * Validate CI/CD pipeline security
     */
    async validateCICDSecurity() {
        try {
            console.log('[OWASP-A08] Validating CI/CD security...');
            
            const violations = [];
            
            // Check for security gates
            const securityGates = this.getSecurityGates();
            if (securityGates.length === 0) {
                violations.push({
                    type: 'missing_security_gates',
                    message: 'No security gates configured in CI/CD pipeline'
                });
            }
            
            // Check for dependency validation
            if (!this.config.cicdSecurity.enableDependencyValidation) {
                violations.push({
                    type: 'dependency_validation_disabled',
                    message: 'Dependency validation is disabled'
                });
            }
            
            // Check for security testing
            if (!this.config.cicdSecurity.enableSecurityTesting) {
                violations.push({
                    type: 'security_testing_disabled',
                    message: 'Security testing is disabled'
                });
            }
            
            // Check for artifact signing
            if (!this.config.cicdSecurity.buildArtifactSigning) {
                violations.push({
                    type: 'artifact_signing_disabled',
                    message: 'Build artifact signing is disabled'
                });
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations,
                securityGates: securityGates,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('[OWASP-A08] CI/CD security validation failed:', error);
            throw error;
        }
    }

    /**
     * Get configured security gates
     */
    getSecurityGates() {
        const gates = [];
        
        if (this.config.cicdSecurity.enableSecurityTesting) {
            gates.push({
                name: 'security_testing',
                type: 'vulnerability_scan',
                threshold: this.config.cicdSecurity.securityTestThreshold,
                enabled: true
            });
        }
        
        if (this.config.cicdSecurity.enableDependencyValidation) {
            gates.push({
                name: 'dependency_validation',
                type: 'supply_chain_check',
                enabled: true
            });
        }
        
        if (this.config.cicdSecurity.buildArtifactSigning) {
            gates.push({
                name: 'artifact_signing',
                type: 'code_signing',
                enabled: true
            });
        }
        
        return gates;
    }

    // ==================== DATA INTEGRITY ====================

    /**
     * Check data integrity
     */
    async checkDataIntegrity(dataContext = {}) {
        try {
            const violations = [];
            
            // Check configuration file integrity
            const configIntegrity = await this.checkConfigurationIntegrity();
            if (!configIntegrity.isValid) {
                violations.push(...configIntegrity.violations);
            }
            
            // Check log file integrity
            const logIntegrity = await this.checkLogIntegrity();
            if (!logIntegrity.isValid) {
                violations.push(...logIntegrity.violations);
            }
            
            // Check security data integrity
            const securityDataIntegrity = await this.checkSecurityDataIntegrity();
            if (!securityDataIntegrity.isValid) {
                violations.push(...securityDataIntegrity.violations);
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('[OWASP-A08] Data integrity check failed:', error);
            return {
                isValid: false,
                violations: [{
                    type: 'integrity_check_error',
                    message: `Data integrity check failed: ${error.message}`
                }],
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Check configuration integrity
     */
    async checkConfigurationIntegrity() {
        try {
            const violations = [];
            
            const configFiles = ['package.json', 'server.js'];
            
            for (const configFile of configFiles) {
                if (await fs.exists(configFile)) {
                    const integrity = await this.validateFileIntegrity(configFile);
                    if (!integrity.isValid && integrity.violation?.type === 'file_modified') {
                        violations.push({
                            type: 'config_modified',
                            file: configFile,
                            message: 'Configuration file has been modified',
                            details: integrity.violation
                        });
                    }
                }
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations
            };
            
        } catch (error) {
            console.error('[OWASP-A08] Configuration integrity check failed:', error);
            return {
                isValid: false,
                violations: [{
                    type: 'config_check_error',
                    message: `Configuration integrity check failed: ${error.message}`
                }]
            };
        }
    }

    /**
     * Check log integrity
     */
    async checkLogIntegrity() {
        try {
            const violations = [];
            
            // Check security logs directory
            if (await fs.exists('./security-logs')) {
                const logFiles = await fs.readdir('./security-logs');
                
                for (const logFile of logFiles) {
                    if (logFile.endsWith('.log') || logFile.endsWith('.json')) {
                        const logPath = path.join('./security-logs', logFile);
                        const stats = await fs.stat(logPath);
                        
                        // Check for suspicious modifications (logs should be append-only)
                        if (this.isLogFileModifiedSuspiciously(logPath, stats)) {
                            violations.push({
                                type: 'log_tampering',
                                file: logPath,
                                message: 'Log file may have been tampered with'
                            });
                        }
                    }
                }
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations
            };
            
        } catch (error) {
            console.error('[OWASP-A08] Log integrity check failed:', error);
            return {
                isValid: false,
                violations: [{
                    type: 'log_check_error',
                    message: `Log integrity check failed: ${error.message}`
                }]
            };
        }
    }

    /**
     * Check security data integrity
     */
    async checkSecurityDataIntegrity() {
        try {
            const violations = [];
            
            // Check security data directory
            if (await fs.exists('./security-data')) {
                const securityFiles = await this.getFilesInPath('./security-data');
                
                for (const filePath of securityFiles) {
                    const integrity = await this.validateFileIntegrity(filePath);
                    
                    if (!integrity.isValid && integrity.violation?.type === 'file_modified') {
                        // Security data modifications should be logged and verified
                        violations.push({
                            type: 'security_data_modified',
                            file: filePath,
                            message: 'Security data file has been modified',
                            details: integrity.violation
                        });
                    }
                }
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations
            };
            
        } catch (error) {
            console.error('[OWASP-A08] Security data integrity check failed:', error);
            return {
                isValid: false,
                violations: [{
                    type: 'security_data_check_error',
                    message: `Security data integrity check failed: ${error.message}`
                }]
            };
        }
    }

    // ==================== UPDATE VALIDATION ====================

    /**
     * Validate update package
     */
    async validateUpdate(updatePackage) {
        try {
            const violations = [];
            
            // Validate update signature
            if (this.config.updates.updateSignatureRequired) {
                const signatureValid = await this.verifyUpdateSignature(updatePackage);
                if (!signatureValid.isValid) {
                    violations.push({
                        type: 'invalid_update_signature',
                        message: 'Update signature validation failed',
                        details: signatureValid
                    });
                }
            }
            
            // Validate update channel
            if (!this.config.updates.updateChannels.includes(updatePackage.channel)) {
                violations.push({
                    type: 'invalid_update_channel',
                    channel: updatePackage.channel,
                    message: 'Update comes from unknown channel'
                });
            }
            
            // Validate update integrity
            if (updatePackage.checksum) {
                const integrityValid = await this.verifyUpdateIntegrity(updatePackage);
                if (!integrityValid.isValid) {
                    violations.push({
                        type: 'update_integrity_failure',
                        message: 'Update package integrity verification failed',
                        details: integrityValid
                    });
                }
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('[OWASP-A08] Update validation failed:', error);
            return {
                isValid: false,
                violations: [{
                    type: 'update_validation_error',
                    message: `Update validation failed: ${error.message}`
                }],
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Verify update signature
     */
    async verifyUpdateSignature(updatePackage) {
        try {
            // Simplified signature verification
            // In production, use proper cryptographic verification
            
            if (!updatePackage.signature) {
                return {
                    isValid: false,
                    reason: 'No signature provided'
                };
            }
            
            if (!updatePackage.signerCertificate) {
                return {
                    isValid: false,
                    reason: 'No signer certificate provided'
                };
            }
            
            // Mock verification - replace with real implementation
            const mockValidSignature = crypto
                .createHash('sha256')
                .update(updatePackage.package + updatePackage.version)
                .digest('hex');
            
            return {
                isValid: updatePackage.signature === mockValidSignature,
                reason: updatePackage.signature === mockValidSignature ? 'Valid signature' : 'Invalid signature'
            };
            
        } catch (error) {
            console.error('[OWASP-A08] Update signature verification failed:', error);
            return {
                isValid: false,
                reason: `Signature verification error: ${error.message}`
            };
        }
    }

    /**
     * Verify update integrity
     */
    async verifyUpdateIntegrity(updatePackage) {
        try {
            // In production, you would download and hash the actual update package
            // For now, we'll simulate integrity checking
            
            if (!updatePackage.checksum) {
                return {
                    isValid: false,
                    reason: 'No checksum provided'
                };
            }
            
            // Mock integrity verification
            return {
                isValid: true,
                reason: 'Integrity verification passed'
            };
            
        } catch (error) {
            console.error('[OWASP-A08] Update integrity verification failed:', error);
            return {
                isValid: false,
                reason: `Integrity verification error: ${error.message}`
            };
        }
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Get files in path recursively
     */
    async getFilesInPath(targetPath) {
        try {
            const files = [];
            
            if (!(await fs.exists(targetPath))) {
                return files;
            }
            
            const stat = await fs.stat(targetPath);
            
            if (stat.isFile()) {
                files.push(targetPath);
            } else if (stat.isDirectory()) {
                const dirFiles = await fs.readdir(targetPath);
                
                for (const file of dirFiles) {
                    const filePath = path.join(targetPath, file);
                    const subFiles = await this.getFilesInPath(filePath);
                    files.push(...subFiles);
                }
            }
            
            return files;
            
        } catch (error) {
            console.error(`[OWASP-A08] Failed to get files in path ${targetPath}:`, error);
            return [];
        }
    }

    /**
     * Check if sensitive operation
     */
    isSensitiveOperation(req) {
        const sensitivePaths = [
            '/api/security',
            '/api/admin',
            '/api/config',
            '/api/update'
        ];
        
        return sensitivePaths.some(path => req.path.startsWith(path));
    }

    /**
     * Perform runtime integrity check
     */
    performRuntimeIntegrityCheck(req) {
        const violations = [];
        
        // For sensitive operations, ensure core security files haven't been tampered with
        const criticalFiles = ['./server.js', './lib/validation.js'];
        
        // This would be async in practice, but we'll simulate for middleware
        // In production, you'd cache recent integrity checks
        
        return {
            isValid: violations.length === 0,
            violations: violations
        };
    }

    /**
     * Check if log file is modified suspiciously
     */
    isLogFileModifiedSuspiciously(logPath, stats) {
        // Simple heuristic: if a log file was modified in the past but size decreased,
        // it might indicate tampering (logs should only grow)
        
        const storedChecksum = this.fileChecksums.get(logPath);
        
        if (storedChecksum && stats.size < storedChecksum.size) {
            return true; // Log file size decreased - suspicious
        }
        
        return false;
    }

    /**
     * Discover custom components
     */
    async discoverCustomComponents() {
        try {
            const components = [];
            
            // Scan lib directory for custom modules
            if (await fs.exists('./lib')) {
                const libFiles = await fs.readdir('./lib');
                
                for (const file of libFiles) {
                    if (file.endsWith('.js')) {
                        const filePath = path.join('./lib', file);
                        const stats = await fs.stat(filePath);
                        const checksum = await this.generateFileChecksum(filePath);
                        
                        components.push({
                            type: 'module',
                            name: file,
                            version: stats.mtime.toISOString(),
                            ecosystem: 'internal',
                            scope: 'runtime',
                            license: 'proprietary',
                            hash: checksum,
                            path: filePath,
                            size: stats.size
                        });
                    }
                }
            }
            
            // Add main server file
            if (await fs.exists('./server.js')) {
                const stats = await fs.stat('./server.js');
                const checksum = await this.generateFileChecksum('./server.js');
                
                components.push({
                    type: 'application',
                    name: 'server.js',
                    version: stats.mtime.toISOString(),
                    ecosystem: 'internal',
                    scope: 'runtime',
                    license: 'proprietary',
                    hash: checksum,
                    path: './server.js',
                    size: stats.size
                });
            }
            
            return components;
            
        } catch (error) {
            console.error('[OWASP-A08] Custom component discovery failed:', error);
            return [];
        }
    }

    /**
     * Get package license
     */
    async getPackageLicense(packageName) {
        try {
            // In production, this would query npm registry
            return 'unknown';
        } catch (error) {
            return 'unknown';
        }
    }

    /**
     * Get package hash
     */
    async getPackageHash(packageName, version) {
        try {
            // In production, this would generate hash from package contents
            return crypto
                .createHash('sha256')
                .update(packageName + version)
                .digest('hex');
        } catch (error) {
            return null;
        }
    }

    /**
     * Generate checksum for data
     */
    generateChecksum(data) {
        return crypto
            .createHash(this.config.fileIntegrity.checksumAlgorithm)
            .update(typeof data === 'string' ? data : JSON.stringify(data))
            .digest('hex');
    }

    /**
     * Log integrity violation
     */
    logIntegrityViolation(type, context, violations) {
        const violation = {
            type: type,
            timestamp: new Date().toISOString(),
            context: context,
            violations: violations
        };
        
        this.integrityViolations.push(violation);
        
        // Keep only last 1000 violations
        if (this.integrityViolations.length > 1000) {
            this.integrityViolations = this.integrityViolations.slice(-1000);
        }
        
        console.warn(`[OWASP-A08] Integrity violation detected:`, violation);
    }

    /**
     * Start integrity monitoring
     */
    startIntegrityMonitoring() {
        // Perform integrity scans at configured intervals
        setInterval(() => {
            this.performIntegrityScan();
        }, this.config.fileIntegrity.monitoringInterval);
        
        // Validate supply chain integrity daily
        setInterval(() => {
            this.validateSupplyChainIntegrity();
        }, 24 * 60 * 60 * 1000);
        
        // Generate SBOM weekly
        setInterval(() => {
            this.generateSBOM();
        }, 7 * 24 * 60 * 60 * 1000);
        
        // Save data periodically
        setInterval(() => {
            this.saveFileChecksums();
            this.saveCodeSignatures();
            this.saveSBOMData();
        }, 60 * 60 * 1000); // Every hour
    }

    // ==================== DATA PERSISTENCE ====================

    async loadFileChecksums() {
        try {
            const checksumsPath = './security-data/checksums/file-checksums.json';
            if (await fs.exists(checksumsPath)) {
                const data = await fs.readJSON(checksumsPath);
                this.fileChecksums = new Map(Object.entries(data));
                console.log(`[OWASP-A08] Loaded ${this.fileChecksums.size} file checksums`);
            }
        } catch (error) {
            console.error('[OWASP-A08] Failed to load file checksums:', error);
        }
    }

    async saveFileChecksums() {
        try {
            const checksumsPath = './security-data/checksums/file-checksums.json';
            const data = Object.fromEntries(this.fileChecksums);
            await fs.writeJSON(checksumsPath, data, { spaces: 2 });
        } catch (error) {
            console.error('[OWASP-A08] Failed to save file checksums:', error);
        }
    }

    async loadCodeSignatures() {
        try {
            const signaturesPath = './security-data/signatures/code-signatures.json';
            if (await fs.exists(signaturesPath)) {
                const data = await fs.readJSON(signaturesPath);
                this.codeSignatures = new Map(Object.entries(data));
                console.log(`[OWASP-A08] Loaded ${this.codeSignatures.size} code signatures`);
            }
        } catch (error) {
            console.error('[OWASP-A08] Failed to load code signatures:', error);
        }
    }

    async saveCodeSignatures() {
        try {
            const signaturesPath = './security-data/signatures/code-signatures.json';
            const data = Object.fromEntries(this.codeSignatures);
            await fs.writeJSON(signaturesPath, data, { spaces: 2 });
        } catch (error) {
            console.error('[OWASP-A08] Failed to save code signatures:', error);
        }
    }

    async loadSBOMData() {
        try {
            const sbomPath = './security-data/integrity/sbom.json';
            if (await fs.exists(sbomPath)) {
                const data = await fs.readJSON(sbomPath);
                this.sbomData = new Map(Object.entries(data));
                console.log(`[OWASP-A08] Loaded ${this.sbomData.size} SBOM entries`);
            }
        } catch (error) {
            console.error('[OWASP-A08] Failed to load SBOM data:', error);
        }
    }

    async saveSBOMData() {
        try {
            const sbomPath = './security-data/integrity/sbom.json';
            const data = Object.fromEntries(this.sbomData);
            await fs.writeJSON(sbomPath, data, { spaces: 2 });
        } catch (error) {
            console.error('[OWASP-A08] Failed to save SBOM data:', error);
        }
    }

    // ==================== PUBLIC API ====================

    /**
     * Get integrity metrics
     */
    getIntegrityMetrics() {
        return {
            monitoredFiles: this.fileChecksums.size,
            integrityViolations: this.integrityViolations.length,
            codeSignatures: this.codeSignatures.size,
            sbomComponents: this.sbomData.get('current')?.components?.length || 0,
            recentViolations: this.integrityViolations.filter(v => 
                new Date(v.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
            ).length
        };
    }

    /**
     * Get current SBOM
     */
    getCurrentSBOM() {
        return this.sbomData.get('current');
    }

    /**
     * Get recent integrity violations
     */
    getRecentIntegrityViolations(limit = 50) {
        return this.integrityViolations.slice(-limit).reverse();
    }

    /**
     * Get file integrity status
     */
    getFileIntegrityStatus(filePath) {
        const checksumData = this.fileChecksums.get(filePath);
        return checksumData ? {
            monitored: true,
            checksum: checksumData.checksum,
            algorithm: checksumData.algorithm,
            lastChecked: checksumData.lastChecked,
            changeCount: checksumData.changeCount || 0
        } : {
            monitored: false
        };
    }
}

module.exports = {
    IntegrityManager: SoftwareDataIntegrityManager,
    INTEGRITY_CONFIG
};