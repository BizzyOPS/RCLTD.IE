/**
 * OWASP A06: Vulnerable Components Management
 * Robotics & Control Ltd - Enterprise Security Implementation
 * 
 * This module enhances the existing vulnerability scanner with:
 * - Enhanced component inventory and lifecycle management
 * - Automated patching guidance and update scheduling
 * - Supply chain security and integrity verification
 * - License compliance and security policy enforcement
 */

const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// ==================== VULNERABLE COMPONENTS MANAGEMENT CONFIGURATION ====================

const COMPONENT_MANAGEMENT_CONFIG = {
    // Component inventory
    inventory: {
        enableAutomaticDiscovery: true,
        enableLicenseTracking: true,
        enableVersionControl: true,
        scanIntervals: {
            production: 24 * 60 * 60 * 1000,    // Daily
            development: 7 * 24 * 60 * 60 * 1000, // Weekly
            testing: 3 * 24 * 60 * 60 * 1000     // Every 3 days
        }
    },
    
    // Vulnerability management
    vulnerabilities: {
        enableRealTimeAlerts: true,
        enableAutomaticPatching: false, // Keep false for safety
        enablePatchAnalysis: true,
        severityThresholds: {
            critical: 0,    // No critical vulnerabilities allowed
            high: 2,        // Maximum 2 high severity
            medium: 10,     // Maximum 10 medium severity
            low: 50         // Maximum 50 low severity
        },
        maxAge: {
            critical: 1 * 24 * 60 * 60 * 1000,     // 1 day
            high: 7 * 24 * 60 * 60 * 1000,         // 7 days
            medium: 30 * 24 * 60 * 60 * 1000,      // 30 days
            low: 90 * 24 * 60 * 60 * 1000          // 90 days
        }
    },
    
    // Supply chain security
    supplyChain: {
        enableIntegrityChecks: true,
        enableSourceVerification: true,
        enableLicenseCompliance: true,
        trustedSources: [
            'https://registry.npmjs.org/',
            'https://github.com/',
            'https://gitlab.com/'
        ],
        blockedSources: [
            // Add known malicious or untrusted sources
        ],
        verificationMethods: ['checksum', 'signature', 'reputation']
    },
    
    // Update management
    updates: {
        enableUpdateTracking: true,
        enableScheduledUpdates: false, // Manual approval required
        enableRollbackSupport: true,
        updateStrategies: {
            critical: 'immediate',
            high: 'scheduled',
            medium: 'maintenance_window',
            low: 'next_release'
        },
        maintenanceWindows: [
            { day: 'Sunday', time: '02:00', duration: 4 }, // 4 hour window
            { day: 'Wednesday', time: '02:00', duration: 2 } // 2 hour window
        ]
    },
    
    // Compliance and policies
    compliance: {
        enableLicenseChecks: true,
        enableSecurityPolicyEnforcement: true,
        allowedLicenses: [
            'MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause',
            'ISC', 'GPL-3.0', 'LGPL-2.1', 'MPL-2.0'
        ],
        blockedLicenses: [
            'AGPL-3.0', 'GPL-2.0', 'LGPL-3.0', 'CC-BY-SA-4.0'
        ],
        securityPolicies: {
            noHighVulnerabilities: true,
            noCriticalAge: true,
            requireMaintainedPackages: true,
            noDeprecatedPackages: true
        }
    }
};

// ==================== VULNERABLE COMPONENTS MANAGER CLASS ====================

class VulnerableComponentsManager {
    constructor(vulnerabilityScanner, config = COMPONENT_MANAGEMENT_CONFIG) {
        this.config = config;
        this.vulnerabilityScanner = vulnerabilityScanner;
        this.componentInventory = new Map();
        this.updateQueue = new Map();
        this.complianceViolations = [];
        this.supplyChainAlerts = [];
        this.patchingHistory = [];
        
        // Initialize system
        this.initialize();
    }

    /**
     * Initialize vulnerable components management
     */
    async initialize() {
        try {
            // Ensure data directories exist
            await fs.ensureDir('./security-data/components');
            
            // Load existing inventory
            await this.loadComponentInventory();
            
            // Perform initial component discovery
            await this.discoverComponents();
            
            // Check supply chain integrity
            await this.verifySupplyChainIntegrity();
            
            // Validate compliance
            await this.validateCompliance();
            
            // Start monitoring intervals
            this.startComponentMonitoring();
            
            console.log('[OWASP-A06] Vulnerable Components Manager initialized');
            
        } catch (error) {
            console.error('[OWASP-A06] Failed to initialize components manager:', error);
            throw error;
        }
    }

    /**
     * Middleware for component security validation
     */
    middleware() {
        return (req, res, next) => {
            try {
                // Add component security methods to request
                req.componentSecurity = {
                    checkComponentVulnerabilities: this.checkComponentVulnerabilities.bind(this),
                    validateSupplyChain: this.validateSupplyChain.bind(this),
                    enforceCompliancePolicy: this.enforceCompliancePolicy.bind(this),
                    getComponentRisk: this.getComponentRisk.bind(this)
                };
                
                // Perform runtime component validation
                const validationResult = this.performRuntimeValidation(req);
                
                if (!validationResult.isValid) {
                    this.logComponentViolation('RUNTIME_VALIDATION', req, validationResult.violations);
                }
                
                // Note: Don't block requests for component issues, just log them
                // Component vulnerabilities should be handled through maintenance, not runtime blocking
                
                next();
                
            } catch (error) {
                console.error('[OWASP-A06] Component security middleware error:', error);
                next();
            }
        };
    }

    // ==================== COMPONENT DISCOVERY ====================

    /**
     * Discover all components in the application
     */
    async discoverComponents() {
        try {
            console.log('[OWASP-A06] Starting component discovery...');
            
            // Discover Node.js packages
            const nodeComponents = await this.discoverNodePackages();
            
            // Discover system dependencies
            const systemComponents = await this.discoverSystemDependencies();
            
            // Discover custom components
            const customComponents = await this.discoverCustomComponents();
            
            // Merge all components
            const allComponents = [...nodeComponents, ...systemComponents, ...customComponents];
            
            // Update inventory
            for (const component of allComponents) {
                this.componentInventory.set(component.id, {
                    ...component,
                    discoveredAt: new Date().toISOString(),
                    lastUpdated: new Date().toISOString()
                });
            }
            
            // Save inventory
            await this.saveComponentInventory();
            
            console.log(`[OWASP-A06] Discovered ${allComponents.length} components`);
            
            return allComponents;
            
        } catch (error) {
            console.error('[OWASP-A06] Component discovery failed:', error);
            throw error;
        }
    }

    /**
     * Discover Node.js packages
     */
    async discoverNodePackages() {
        try {
            const components = [];
            
            // Read package.json
            if (await fs.exists('./package.json')) {
                const packageJson = await fs.readJSON('./package.json');
                
                // Process dependencies
                const dependencies = {
                    ...packageJson.dependencies,
                    ...packageJson.devDependencies,
                    ...packageJson.peerDependencies,
                    ...packageJson.optionalDependencies
                };
                
                for (const [name, version] of Object.entries(dependencies)) {
                    const componentId = `npm:${name}@${version}`;
                    
                    components.push({
                        id: componentId,
                        name: name,
                        version: version,
                        type: 'npm',
                        source: 'package.json',
                        ecosystem: 'nodejs',
                        license: await this.getLicense(name, version),
                        metadata: await this.getPackageMetadata(name, version),
                        riskScore: 0,
                        vulnerabilities: [],
                        lastCheck: null
                    });
                }
                
                // Read package-lock.json for exact versions
                if (await fs.exists('./package-lock.json')) {
                    const packageLock = await fs.readJSON('./package-lock.json');
                    await this.enrichWithLockfileData(components, packageLock);
                }
            }
            
            return components;
            
        } catch (error) {
            console.error('[OWASP-A06] Node.js package discovery failed:', error);
            return [];
        }
    }

    /**
     * Discover system dependencies
     */
    async discoverSystemDependencies() {
        try {
            const components = [];
            
            // Get Node.js version
            const nodeVersion = process.version;
            components.push({
                id: `system:nodejs@${nodeVersion}`,
                name: 'nodejs',
                version: nodeVersion,
                type: 'runtime',
                source: 'system',
                ecosystem: 'system',
                license: 'MIT',
                metadata: {
                    critical: true,
                    maintainer: 'Node.js Foundation'
                },
                riskScore: 0,
                vulnerabilities: [],
                lastCheck: null
            });
            
            // Get npm version
            try {
                const npmVersion = await this.executeCommand('npm --version');
                components.push({
                    id: `system:npm@${npmVersion.trim()}`,
                    name: 'npm',
                    version: npmVersion.trim(),
                    type: 'package_manager',
                    source: 'system',
                    ecosystem: 'system',
                    license: 'Artistic-2.0',
                    metadata: {
                        critical: true,
                        maintainer: 'npm, Inc.'
                    },
                    riskScore: 0,
                    vulnerabilities: [],
                    lastCheck: null
                });
            } catch (npmError) {
                console.warn('[OWASP-A06] Could not determine npm version:', npmError.message);
            }
            
            return components;
            
        } catch (error) {
            console.error('[OWASP-A06] System dependencies discovery failed:', error);
            return [];
        }
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
                        
                        components.push({
                            id: `custom:${file}`,
                            name: file,
                            version: stats.mtime.toISOString(),
                            type: 'custom',
                            source: 'local',
                            ecosystem: 'internal',
                            license: 'proprietary',
                            metadata: {
                                path: filePath,
                                size: stats.size,
                                lastModified: stats.mtime.toISOString()
                            },
                            riskScore: 0,
                            vulnerabilities: [],
                            lastCheck: null
                        });
                    }
                }
            }
            
            return components;
            
        } catch (error) {
            console.error('[OWASP-A06] Custom components discovery failed:', error);
            return [];
        }
    }

    // ==================== VULNERABILITY MANAGEMENT ====================

    /**
     * Check vulnerabilities for all components
     */
    async checkAllComponentVulnerabilities() {
        try {
            console.log('[OWASP-A06] Checking vulnerabilities for all components...');
            
            let totalVulnerabilities = 0;
            const componentUpdates = [];
            
            for (const [componentId, component] of this.componentInventory.entries()) {
                try {
                    const vulnerabilities = await this.checkComponentVulnerabilities(component);
                    
                    if (vulnerabilities.length > 0) {
                        totalVulnerabilities += vulnerabilities.length;
                        
                        // Update component with vulnerabilities
                        component.vulnerabilities = vulnerabilities;
                        component.riskScore = this.calculateComponentRiskScore(vulnerabilities);
                        component.lastCheck = new Date().toISOString();
                        
                        componentUpdates.push(component);
                        
                        // Generate patching recommendations
                        const patchingRec = await this.generatePatchingRecommendations(component);
                        if (patchingRec.shouldUpdate) {
                            this.updateQueue.set(componentId, patchingRec);
                        }
                    }
                } catch (componentError) {
                    console.warn(`[OWASP-A06] Failed to check vulnerabilities for ${componentId}:`, componentError.message);
                }
            }
            
            // Save updated inventory
            await this.saveComponentInventory();
            
            console.log(`[OWASP-A06] Found ${totalVulnerabilities} vulnerabilities across ${componentUpdates.length} components`);
            
            return {
                totalVulnerabilities: totalVulnerabilities,
                affectedComponents: componentUpdates.length,
                recommendations: Array.from(this.updateQueue.values())
            };
            
        } catch (error) {
            console.error('[OWASP-A06] Component vulnerability check failed:', error);
            throw error;
        }
    }

    /**
     * Check vulnerabilities for a specific component
     */
    async checkComponentVulnerabilities(component) {
        try {
            const vulnerabilities = [];
            
            if (component.type === 'npm') {
                // Use npm audit for npm packages
                const npmVulns = await this.checkNpmVulnerabilities(component);
                vulnerabilities.push(...npmVulns);
            } else if (component.type === 'runtime' || component.type === 'package_manager') {
                // Check system component vulnerabilities
                const systemVulns = await this.checkSystemVulnerabilities(component);
                vulnerabilities.push(...systemVulns);
            }
            
            // Enrich vulnerabilities with additional data
            for (const vuln of vulnerabilities) {
                vuln.discoveredAt = new Date().toISOString();
                vuln.age = this.calculateVulnerabilityAge(vuln);
                vuln.isExpired = this.isVulnerabilityExpired(vuln);
            }
            
            return vulnerabilities;
            
        } catch (error) {
            console.error(`[OWASP-A06] Failed to check vulnerabilities for ${component.name}:`, error);
            return [];
        }
    }

    /**
     * Check npm package vulnerabilities
     */
    async checkNpmVulnerabilities(component) {
        try {
            // This would integrate with the existing vulnerability scanner
            const scanResults = this.vulnerabilityScanner.getLatestResults();
            
            if (!scanResults || !scanResults.tools.npmAudit) {
                return [];
            }
            
            const npmVulns = scanResults.tools.npmAudit.vulnerabilities || [];
            
            // Filter vulnerabilities for this specific component
            return npmVulns.filter(vuln => 
                vuln.packageName === component.name ||
                vuln.id.includes(component.name)
            );
            
        } catch (error) {
            console.error(`[OWASP-A06] NPM vulnerability check failed for ${component.name}:`, error);
            return [];
        }
    }

    /**
     * Check system component vulnerabilities
     */
    async checkSystemVulnerabilities(component) {
        try {
            const vulnerabilities = [];
            
            // Check known vulnerabilities for Node.js versions
            if (component.name === 'nodejs') {
                const nodeVulns = await this.checkNodejsVulnerabilities(component.version);
                vulnerabilities.push(...nodeVulns);
            }
            
            return vulnerabilities;
            
        } catch (error) {
            console.error(`[OWASP-A06] System vulnerability check failed for ${component.name}:`, error);
            return [];
        }
    }

    /**
     * Check Node.js specific vulnerabilities
     */
    async checkNodejsVulnerabilities(version) {
        try {
            // Simplified Node.js vulnerability check
            // In production, this would query security databases
            
            const knownVulnerabilities = [
                {
                    id: 'CVE-2023-30581',
                    title: 'mainModule.__proto__ Bypass',
                    severity: 'high',
                    affectedVersions: ['< 18.16.1', '< 20.3.1'],
                    description: 'A vulnerability in Node.js allows bypassing mainModule.__proto__ restrictions'
                },
                {
                    id: 'CVE-2023-30589',
                    title: 'WASI: Path traversal via llhttp',
                    severity: 'medium',
                    affectedVersions: ['< 18.16.1', '< 20.3.1'],
                    description: 'Path traversal vulnerability in WASI implementation'
                }
            ];
            
            const vulnerabilities = [];
            const currentVersion = version.replace('v', '');
            
            for (const vuln of knownVulnerabilities) {
                if (this.isVersionAffected(currentVersion, vuln.affectedVersions)) {
                    vulnerabilities.push({
                        ...vuln,
                        component: 'nodejs',
                        componentVersion: version,
                        source: 'nodejs_security_db'
                    });
                }
            }
            
            return vulnerabilities;
            
        } catch (error) {
            console.error('[OWASP-A06] Node.js vulnerability check failed:', error);
            return [];
        }
    }

    /**
     * Generate patching recommendations
     */
    async generatePatchingRecommendations(component) {
        try {
            const recommendation = {
                componentId: component.id,
                component: component.name,
                currentVersion: component.version,
                shouldUpdate: false,
                updatePriority: 'low',
                availableUpdates: [],
                patchingStrategy: 'maintenance_window',
                estimatedRisk: 'low',
                rollbackPlan: null
            };
            
            if (component.vulnerabilities.length === 0) {
                return recommendation;
            }
            
            // Determine update priority based on vulnerability severity
            const criticalVulns = component.vulnerabilities.filter(v => v.severity === 'critical');
            const highVulns = component.vulnerabilities.filter(v => v.severity === 'high');
            
            if (criticalVulns.length > 0) {
                recommendation.shouldUpdate = true;
                recommendation.updatePriority = 'critical';
                recommendation.patchingStrategy = 'immediate';
                recommendation.estimatedRisk = 'critical';
            } else if (highVulns.length > 0) {
                recommendation.shouldUpdate = true;
                recommendation.updatePriority = 'high';
                recommendation.patchingStrategy = 'scheduled';
                recommendation.estimatedRisk = 'high';
            } else {
                recommendation.shouldUpdate = true;
                recommendation.updatePriority = 'medium';
                recommendation.patchingStrategy = 'maintenance_window';
                recommendation.estimatedRisk = 'medium';
            }
            
            // Get available updates
            if (component.type === 'npm') {
                recommendation.availableUpdates = await this.getAvailableNpmUpdates(component);
            }
            
            // Create rollback plan
            recommendation.rollbackPlan = this.createRollbackPlan(component);
            
            return recommendation;
            
        } catch (error) {
            console.error(`[OWASP-A06] Failed to generate patching recommendations for ${component.name}:`, error);
            return {
                componentId: component.id,
                shouldUpdate: false,
                error: error.message
            };
        }
    }

    /**
     * Get available npm updates
     */
    async getAvailableNpmUpdates(component) {
        try {
            const updates = [];
            
            // This would query npm registry for available versions
            // For now, we'll simulate with basic logic
            
            const currentVersionParts = component.version.replace(/[^\d\.]/g, '').split('.');
            const major = parseInt(currentVersionParts[0] || '0');
            const minor = parseInt(currentVersionParts[1] || '0');
            const patch = parseInt(currentVersionParts[2] || '0');
            
            // Suggest patch update
            updates.push({
                version: `${major}.${minor}.${patch + 1}`,
                type: 'patch',
                risk: 'low',
                description: 'Patch version update - bug fixes and security patches'
            });
            
            // Suggest minor update
            updates.push({
                version: `${major}.${minor + 1}.0`,
                type: 'minor',
                risk: 'medium',
                description: 'Minor version update - new features, backward compatible'
            });
            
            return updates;
            
        } catch (error) {
            console.error(`[OWASP-A06] Failed to get npm updates for ${component.name}:`, error);
            return [];
        }
    }

    /**
     * Create rollback plan
     */
    createRollbackPlan(component) {
        return {
            backupLocation: `./backups/components/${component.name}`,
            rollbackSteps: [
                'Stop application services',
                'Restore previous package.json version',
                'Run npm install to restore dependencies',
                'Verify application functionality',
                'Restart application services'
            ],
            validationChecks: [
                'Application starts successfully',
                'Critical endpoints respond',
                'No errors in application logs',
                'Database connectivity verified'
            ],
            estimatedTime: '15 minutes',
            requiredApprovals: ['security_team', 'operations_team']
        };
    }

    // ==================== SUPPLY CHAIN SECURITY ====================

    /**
     * Verify supply chain integrity
     */
    async verifySupplyChainIntegrity() {
        try {
            console.log('[OWASP-A06] Verifying supply chain integrity...');
            
            const alerts = [];
            
            for (const [componentId, component] of this.componentInventory.entries()) {
                try {
                    const integrityCheck = await this.checkComponentIntegrity(component);
                    
                    if (!integrityCheck.isValid) {
                        alerts.push({
                            componentId: componentId,
                            component: component.name,
                            issues: integrityCheck.issues,
                            severity: integrityCheck.severity,
                            timestamp: new Date().toISOString()
                        });
                    }
                } catch (integrityError) {
                    console.warn(`[OWASP-A06] Integrity check failed for ${componentId}:`, integrityError.message);
                }
            }
            
            this.supplyChainAlerts = alerts;
            
            if (alerts.length > 0) {
                console.warn(`[OWASP-A06] Found ${alerts.length} supply chain integrity issues`);
            } else {
                console.log('[OWASP-A06] Supply chain integrity verification passed');
            }
            
            return {
                isValid: alerts.length === 0,
                alerts: alerts
            };
            
        } catch (error) {
            console.error('[OWASP-A06] Supply chain integrity verification failed:', error);
            throw error;
        }
    }

    /**
     * Check component integrity
     */
    async checkComponentIntegrity(component) {
        try {
            const issues = [];
            let severity = 'low';
            
            // Check source reputation
            if (component.type === 'npm') {
                const sourceCheck = this.checkSourceReputation(component);
                if (!sourceCheck.isValid) {
                    issues.push(...sourceCheck.issues);
                    severity = Math.max(severity, sourceCheck.severity);
                }
                
                // Check package metadata integrity
                const metadataCheck = await this.checkPackageMetadataIntegrity(component);
                if (!metadataCheck.isValid) {
                    issues.push(...metadataCheck.issues);
                    severity = Math.max(severity, metadataCheck.severity);
                }
                
                // Check for package squatting
                const squattingCheck = this.checkPackageSquatting(component);
                if (!squattingCheck.isValid) {
                    issues.push(...squattingCheck.issues);
                    severity = 'high';
                }
            }
            
            return {
                isValid: issues.length === 0,
                issues: issues,
                severity: severity
            };
            
        } catch (error) {
            console.error(`[OWASP-A06] Component integrity check failed for ${component.name}:`, error);
            return { isValid: false, issues: ['Integrity check error'], severity: 'medium' };
        }
    }

    /**
     * Check source reputation
     */
    checkSourceReputation(component) {
        const issues = [];
        
        // Check if source is in trusted list
        const packageSource = `https://registry.npmjs.org/`;
        if (!this.config.supplyChain.trustedSources.includes(packageSource)) {
            issues.push(`Package source not in trusted list: ${packageSource}`);
        }
        
        // Check if source is blocked
        if (this.config.supplyChain.blockedSources.some(blocked => packageSource.includes(blocked))) {
            issues.push(`Package source is blocked: ${packageSource}`);
        }
        
        // Check package popularity and maintenance
        if (component.metadata) {
            if (component.metadata.downloads && component.metadata.downloads < 1000) {
                issues.push('Package has low download count, may indicate low adoption');
            }
            
            if (component.metadata.lastUpdate) {
                const lastUpdate = new Date(component.metadata.lastUpdate);
                const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
                
                if (lastUpdate < oneYearAgo) {
                    issues.push('Package has not been updated in over a year');
                }
            }
        }
        
        return {
            isValid: issues.length === 0,
            issues: issues,
            severity: issues.length > 0 ? 'medium' : 'low'
        };
    }

    /**
     * Check package metadata integrity
     */
    async checkPackageMetadataIntegrity(component) {
        try {
            const issues = [];
            
            // Check for suspicious package names
            if (this.isSuspiciousPackageName(component.name)) {
                issues.push('Package name appears to be typosquatting or suspicious');
            }
            
            // Check version consistency
            if (component.version && !this.isValidVersionFormat(component.version)) {
                issues.push('Package version format is invalid or suspicious');
            }
            
            return {
                isValid: issues.length === 0,
                issues: issues,
                severity: issues.length > 0 ? 'high' : 'low'
            };
            
        } catch (error) {
            console.error(`[OWASP-A06] Package metadata check failed for ${component.name}:`, error);
            return { isValid: false, issues: ['Metadata check error'], severity: 'medium' };
        }
    }

    /**
     * Check for package squatting
     */
    checkPackageSquatting(component) {
        const issues = [];
        
        // Check for typosquatting patterns
        const commonPackages = [
            'express', 'lodash', 'react', 'angular', 'vue', 'webpack',
            'babel', 'eslint', 'jest', 'mocha', 'chai', 'sinon'
        ];
        
        const packageName = component.name.toLowerCase();
        
        for (const commonPkg of commonPackages) {
            if (this.isTyposquatting(packageName, commonPkg)) {
                issues.push(`Package name may be typosquatting popular package: ${commonPkg}`);
            }
        }
        
        return {
            isValid: issues.length === 0,
            issues: issues,
            severity: issues.length > 0 ? 'high' : 'low'
        };
    }

    // ==================== COMPLIANCE VALIDATION ====================

    /**
     * Validate compliance for all components
     */
    async validateCompliance() {
        try {
            console.log('[OWASP-A06] Validating component compliance...');
            
            const violations = [];
            
            for (const [componentId, component] of this.componentInventory.entries()) {
                try {
                    const complianceCheck = await this.validateComponentCompliance(component);
                    
                    if (!complianceCheck.isValid) {
                        violations.push({
                            componentId: componentId,
                            component: component.name,
                            violations: complianceCheck.violations,
                            severity: complianceCheck.severity,
                            timestamp: new Date().toISOString()
                        });
                    }
                } catch (complianceError) {
                    console.warn(`[OWASP-A06] Compliance check failed for ${componentId}:`, complianceError.message);
                }
            }
            
            this.complianceViolations = violations;
            
            if (violations.length > 0) {
                console.warn(`[OWASP-A06] Found ${violations.length} compliance violations`);
            } else {
                console.log('[OWASP-A06] Component compliance validation passed');
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations
            };
            
        } catch (error) {
            console.error('[OWASP-A06] Compliance validation failed:', error);
            throw error;
        }
    }

    /**
     * Validate component compliance
     */
    async validateComponentCompliance(component) {
        try {
            const violations = [];
            let severity = 'low';
            
            // Check license compliance
            const licenseCheck = this.checkLicenseCompliance(component);
            if (!licenseCheck.isValid) {
                violations.push(...licenseCheck.violations);
                severity = Math.max(severity, licenseCheck.severity);
            }
            
            // Check security policy compliance
            const policyCheck = this.checkSecurityPolicyCompliance(component);
            if (!policyCheck.isValid) {
                violations.push(...policyCheck.violations);
                severity = Math.max(severity, policyCheck.severity);
            }
            
            // Check maintenance compliance
            const maintenanceCheck = this.checkMaintenanceCompliance(component);
            if (!maintenanceCheck.isValid) {
                violations.push(...maintenanceCheck.violations);
                severity = Math.max(severity, maintenanceCheck.severity);
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations,
                severity: severity
            };
            
        } catch (error) {
            console.error(`[OWASP-A06] Component compliance check failed for ${component.name}:`, error);
            return { isValid: false, violations: ['Compliance check error'], severity: 'medium' };
        }
    }

    /**
     * Check license compliance
     */
    checkLicenseCompliance(component) {
        const violations = [];
        
        if (!component.license) {
            violations.push('Component has no license information');
            return { isValid: false, violations: violations, severity: 'medium' };
        }
        
        // Check if license is blocked
        if (this.config.compliance.blockedLicenses.includes(component.license)) {
            violations.push(`Component uses blocked license: ${component.license}`);
            return { isValid: false, violations: violations, severity: 'high' };
        }
        
        // Check if license is allowed
        if (!this.config.compliance.allowedLicenses.includes(component.license)) {
            violations.push(`Component uses non-approved license: ${component.license}`);
            return { isValid: false, violations: violations, severity: 'medium' };
        }
        
        return {
            isValid: violations.length === 0,
            violations: violations,
            severity: 'low'
        };
    }

    /**
     * Check security policy compliance
     */
    checkSecurityPolicyCompliance(component) {
        const violations = [];
        const policies = this.config.compliance.securityPolicies;
        
        // Check for high vulnerabilities
        if (policies.noHighVulnerabilities) {
            const highVulns = component.vulnerabilities.filter(v => 
                v.severity === 'high' || v.severity === 'critical'
            );
            if (highVulns.length > 0) {
                violations.push(`Component has ${highVulns.length} high/critical vulnerabilities`);
            }
        }
        
        // Check vulnerability age
        if (policies.noCriticalAge) {
            const expiredVulns = component.vulnerabilities.filter(v => v.isExpired);
            if (expiredVulns.length > 0) {
                violations.push(`Component has ${expiredVulns.length} expired vulnerabilities`);
            }
        }
        
        return {
            isValid: violations.length === 0,
            violations: violations,
            severity: violations.length > 0 ? 'high' : 'low'
        };
    }

    /**
     * Check maintenance compliance
     */
    checkMaintenanceCompliance(component) {
        const violations = [];
        const policies = this.config.compliance.securityPolicies;
        
        // Check if package is maintained
        if (policies.requireMaintainedPackages && component.metadata) {
            if (component.metadata.deprecated) {
                violations.push('Component is marked as deprecated');
            }
            
            if (component.metadata.lastUpdate) {
                const lastUpdate = new Date(component.metadata.lastUpdate);
                const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000);
                
                if (lastUpdate < twoYearsAgo) {
                    violations.push('Component has not been updated in over 2 years');
                }
            }
        }
        
        return {
            isValid: violations.length === 0,
            violations: violations,
            severity: violations.length > 0 ? 'medium' : 'low'
        };
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Calculate component risk score
     */
    calculateComponentRiskScore(vulnerabilities) {
        let riskScore = 0;
        
        vulnerabilities.forEach(vuln => {
            switch (vuln.severity) {
                case 'critical':
                    riskScore += 10;
                    break;
                case 'high':
                    riskScore += 7;
                    break;
                case 'medium':
                    riskScore += 4;
                    break;
                case 'low':
                    riskScore += 1;
                    break;
            }
            
            // Add age penalty
            if (vuln.age > 30) {
                riskScore += 2;
            }
        });
        
        return Math.min(100, riskScore);
    }

    /**
     * Calculate vulnerability age in days
     */
    calculateVulnerabilityAge(vulnerability) {
        if (!vulnerability.publishedDate) return 0;
        
        const published = new Date(vulnerability.publishedDate);
        const now = new Date();
        
        return Math.floor((now - published) / (1000 * 60 * 60 * 24));
    }

    /**
     * Check if vulnerability is expired
     */
    isVulnerabilityExpired(vulnerability) {
        const maxAge = this.config.vulnerabilities.maxAge[vulnerability.severity];
        return vulnerability.age > (maxAge / (1000 * 60 * 60 * 24));
    }

    /**
     * Check if version is affected by vulnerability
     */
    isVersionAffected(version, affectedVersions) {
        // Simplified version comparison
        return affectedVersions.some(range => {
            if (range.startsWith('<')) {
                const maxVersion = range.replace('< ', '');
                return this.compareVersions(version, maxVersion) < 0;
            }
            return false;
        });
    }

    /**
     * Compare semantic versions
     */
    compareVersions(a, b) {
        const aParts = a.split('.').map(Number);
        const bParts = b.split('.').map(Number);
        
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
            const aPart = aParts[i] || 0;
            const bPart = bParts[i] || 0;
            
            if (aPart < bPart) return -1;
            if (aPart > bPart) return 1;
        }
        
        return 0;
    }

    /**
     * Check if package name is suspicious
     */
    isSuspiciousPackageName(name) {
        // Check for common typosquatting patterns
        const suspiciousPatterns = [
            /^[0-9]+$/,                    // All numbers
            /^[a-z]{1,2}$/,               // Very short names
            /.*[0-9]$/,                   // Ending with numbers
            /.*-[a-z]{1,2}$/,             // Ending with short suffix
            /.*\.(js|exe|bat|sh)$/        // Executable-like extensions
        ];
        
        return suspiciousPatterns.some(pattern => pattern.test(name));
    }

    /**
     * Check if version format is valid
     */
    isValidVersionFormat(version) {
        // Basic semantic version check
        return /^(\d+\.)?(\d+\.)?(\*|\d+)$/.test(version.replace(/[^\d\.]/g, ''));
    }

    /**
     * Check for typosquatting
     */
    isTyposquatting(packageName, popularPackage) {
        if (packageName === popularPackage) return false;
        
        // Check Levenshtein distance
        const distance = this.levenshteinDistance(packageName, popularPackage);
        return distance <= 2 && distance > 0;
    }

    /**
     * Calculate Levenshtein distance
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    /**
     * Execute shell command
     */
    async executeCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout);
                }
            });
        });
    }

    /**
     * Get package license
     */
    async getLicense(packageName, version) {
        try {
            // This would query npm registry for package info
            // For now, return a default
            return 'MIT';
        } catch (error) {
            return 'unknown';
        }
    }

    /**
     * Get package metadata
     */
    async getPackageMetadata(packageName, version) {
        try {
            // This would fetch metadata from npm registry
            return {
                downloads: 1000,
                lastUpdate: new Date().toISOString(),
                maintainers: 1,
                deprecated: false
            };
        } catch (error) {
            return {};
        }
    }

    /**
     * Enrich components with lockfile data
     */
    async enrichWithLockfileData(components, packageLock) {
        try {
            if (packageLock.packages) {
                for (const component of components) {
                    const lockEntry = packageLock.packages[`node_modules/${component.name}`];
                    if (lockEntry) {
                        component.resolvedVersion = lockEntry.version;
                        component.integrity = lockEntry.integrity;
                        component.resolved = lockEntry.resolved;
                    }
                }
            }
        } catch (error) {
            console.warn('[OWASP-A06] Failed to enrich with lockfile data:', error);
        }
    }

    /**
     * Perform runtime validation
     */
    performRuntimeValidation(req) {
        // For now, just return valid since component issues
        // should be handled through maintenance, not runtime blocking
        return {
            isValid: true,
            violations: []
        };
    }

    /**
     * Log component violation
     */
    logComponentViolation(type, req, violations) {
        const violation = {
            type: type,
            timestamp: new Date().toISOString(),
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            url: req.url,
            method: req.method,
            violations: violations
        };
        
        console.warn(`[OWASP-A06] Component violation detected:`, violation);
    }

    /**
     * Start component monitoring
     */
    startComponentMonitoring() {
        const environment = process.env.NODE_ENV || 'development';
        const scanInterval = this.config.inventory.scanIntervals[environment] || 
                           this.config.inventory.scanIntervals.development;
        
        // Periodic vulnerability scanning
        setInterval(() => {
            this.checkAllComponentVulnerabilities();
        }, scanInterval);
        
        // Daily supply chain verification
        setInterval(() => {
            this.verifySupplyChainIntegrity();
        }, 24 * 60 * 60 * 1000);
        
        // Daily compliance validation
        setInterval(() => {
            this.validateCompliance();
        }, 24 * 60 * 60 * 1000);
    }

    // ==================== DATA PERSISTENCE ====================

    async loadComponentInventory() {
        try {
            const inventoryPath = './security-data/components/inventory.json';
            if (await fs.exists(inventoryPath)) {
                const data = await fs.readJSON(inventoryPath);
                this.componentInventory = new Map(Object.entries(data));
                console.log(`[OWASP-A06] Loaded ${this.componentInventory.size} components from inventory`);
            }
        } catch (error) {
            console.error('[OWASP-A06] Failed to load component inventory:', error);
        }
    }

    async saveComponentInventory() {
        try {
            const inventoryPath = './security-data/components/inventory.json';
            const data = Object.fromEntries(this.componentInventory);
            await fs.writeJSON(inventoryPath, data, { spaces: 2 });
        } catch (error) {
            console.error('[OWASP-A06] Failed to save component inventory:', error);
        }
    }

    // ==================== PUBLIC API ====================

    /**
     * Get component security metrics
     */
    getComponentMetrics() {
        const totalComponents = this.componentInventory.size;
        const vulnerableComponents = Array.from(this.componentInventory.values())
            .filter(comp => comp.vulnerabilities && comp.vulnerabilities.length > 0).length;
        
        return {
            totalComponents: totalComponents,
            vulnerableComponents: vulnerableComponents,
            complianceViolations: this.complianceViolations.length,
            supplyChainAlerts: this.supplyChainAlerts.length,
            updateQueueSize: this.updateQueue.size,
            averageRiskScore: this.calculateAverageRiskScore()
        };
    }

    /**
     * Get component inventory
     */
    getComponentInventory() {
        return Array.from(this.componentInventory.values());
    }

    /**
     * Get update recommendations
     */
    getUpdateRecommendations() {
        return Array.from(this.updateQueue.values());
    }

    /**
     * Get compliance violations
     */
    getComplianceViolations() {
        return this.complianceViolations;
    }

    /**
     * Get supply chain alerts
     */
    getSupplyChainAlerts() {
        return this.supplyChainAlerts;
    }

    /**
     * Calculate average risk score
     */
    calculateAverageRiskScore() {
        const components = Array.from(this.componentInventory.values());
        if (components.length === 0) return 0;
        
        const totalRisk = components.reduce((sum, comp) => sum + (comp.riskScore || 0), 0);
        return totalRisk / components.length;
    }

    /**
     * Get component risk assessment
     */
    getComponentRisk(componentName) {
        for (const [id, component] of this.componentInventory.entries()) {
            if (component.name === componentName) {
                return {
                    componentId: id,
                    riskScore: component.riskScore || 0,
                    vulnerabilities: component.vulnerabilities || [],
                    complianceStatus: this.complianceViolations.find(v => v.componentId === id) ? 'violation' : 'compliant',
                    lastCheck: component.lastCheck
                };
            }
        }
        return null;
    }

    /**
     * Validate supply chain for specific component
     */
    validateSupplyChain(componentName) {
        const component = Array.from(this.componentInventory.values())
            .find(comp => comp.name === componentName);
        
        if (!component) {
            return { isValid: false, reason: 'Component not found' };
        }
        
        return this.checkComponentIntegrity(component);
    }

    /**
     * Enforce compliance policy for component
     */
    enforceCompliancePolicy(componentName) {
        const component = Array.from(this.componentInventory.values())
            .find(comp => comp.name === componentName);
        
        if (!component) {
            return { isCompliant: false, reason: 'Component not found' };
        }
        
        const compliance = this.validateComponentCompliance(component);
        return {
            isCompliant: compliance.isValid,
            violations: compliance.violations || [],
            severity: compliance.severity || 'low'
        };
    }
}

module.exports = {
    VulnerableComponentsManager,
    COMPONENT_MANAGEMENT_CONFIG
};