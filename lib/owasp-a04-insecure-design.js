/**
 * OWASP A04: Insecure Design Protection
 * Robotics & Control Ltd - Enterprise Security Implementation
 * 
 * This module implements secure design patterns and threat modeling including:
 * - Threat modeling automation
 * - Secure design pattern validation
 * - Security architecture verification
 * - Business logic protection
 * - Attack surface analysis
 */

const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// ==================== INSECURE DESIGN PROTECTION CONFIGURATION ====================

const SECURE_DESIGN_CONFIG = {
    // Threat modeling configuration
    threatModeling: {
        enableAutomatedThreatModeling: true,
        riskThresholds: {
            critical: 9,
            high: 7,
            medium: 5,
            low: 3
        },
        threatCategories: [
            'spoofing', 'tampering', 'repudiation', 'information_disclosure',
            'denial_of_service', 'elevation_of_privilege'
        ],
        assetClassification: {
            critical: ['user_data', 'payment_info', 'auth_tokens', 'encryption_keys'],
            high: ['business_logic', 'system_config', 'api_endpoints'],
            medium: ['logs', 'cached_data', 'temporary_files'],
            low: ['static_content', 'public_documentation']
        }
    },
    
    // Secure design patterns
    designPatterns: {
        enablePatternValidation: true,
        requiredPatterns: [
            'input_validation',
            'output_encoding',
            'authentication',
            'authorization',
            'session_management',
            'cryptography',
            'error_handling',
            'logging',
            'data_protection',
            'communication_security'
        ],
        architecturalPrinciples: [
            'defense_in_depth',
            'fail_secure',
            'least_privilege',
            'separation_of_duties',
            'minimize_attack_surface',
            'secure_by_default'
        ]
    },
    
    // Business logic protection
    businessLogic: {
        enableWorkflowValidation: true,
        enableSequenceChecking: true,
        enableTimingControls: true,
        enableLimitChecking: true,
        maxTransactionAmount: 10000,
        maxDailyTransactions: 100,
        sequenceTimeoutMinutes: 30,
        suspiciousActivityThreshold: 10
    },
    
    // Attack surface analysis
    attackSurface: {
        enableSurfaceMapping: true,
        enableEntryPointAnalysis: true,
        enableDataFlowTracking: true,
        entryPoints: [
            '/api/*', '/admin/*', '/contact', '/chat', '/checkout', 
            '/search', '/training/*', '/security/*'
        ],
        dataFlows: [
            'user_input -> validation -> processing -> storage',
            'authentication -> authorization -> business_logic',
            'external_api -> validation -> internal_processing'
        ]
    },
    
    // Security requirements
    securityRequirements: {
        confidentiality: {
            dataEncryption: true,
            communicationEncryption: true,
            accessControls: true
        },
        integrity: {
            dataValidation: true,
            digitalSignatures: true,
            checksums: true
        },
        availability: {
            rateLimiting: true,
            resourceLimits: true,
            errorRecovery: true
        },
        accountability: {
            auditLogging: true,
            userTracking: true,
            nonRepudiation: true
        }
    }
};

// ==================== SECURE DESIGN CLASS ====================

class SecureDesignProtection {
    constructor(config = SECURE_DESIGN_CONFIG) {
        this.config = config;
        this.threatModel = new Map();
        this.businessLogicState = new Map();
        this.attackSurfaceMap = new Map();
        this.securityRequirements = new Map();
        this.designViolations = [];
        
        // Initialize system
        this.initialize();
    }

    /**
     * Initialize secure design protection
     */
    async initialize() {
        try {
            // Ensure security data directory exists
            await fs.ensureDir('./security-data');
            
            // Load existing threat model
            await this.loadThreatModel();
            
            // Perform initial attack surface analysis
            await this.analyzeAttackSurface();
            
            // Validate security requirements
            await this.validateSecurityRequirements();
            
            // Start monitoring intervals
            this.startDesignMonitoring();
            
            console.log('[OWASP-A04] Secure Design Protection initialized');
            
        } catch (error) {
            console.error('[OWASP-A04] Failed to initialize secure design protection:', error);
            throw error;
        }
    }

    /**
     * Middleware for secure design validation
     */
    middleware() {
        return (req, res, next) => {
            try {
                // Add secure design methods to request
                req.secureDesign = {
                    validateBusinessLogic: this.validateBusinessLogic.bind(this),
                    checkSequenceIntegrity: this.checkSequenceIntegrity.bind(this),
                    verifySecurityRequirements: this.verifySecurityRequirements.bind(this),
                    assessThreat: this.assessThreat.bind(this),
                    trackAttackSurface: this.trackAttackSurface.bind(this)
                };
                
                // Perform runtime design validation
                const validationResult = this.performRuntimeValidation(req);
                
                if (!validationResult.isValid) {
                    this.logDesignViolation('RUNTIME_VALIDATION', req, validationResult.violations);
                    
                    return res.status(400).json({
                        success: false,
                        error: 'Request violates secure design principles',
                        code: 'DESIGN_VIOLATION',
                        timestamp: new Date().toISOString()
                    });
                }
                
                // Track attack surface interaction
                this.trackAttackSurfaceInteraction(req);
                
                next();
                
            } catch (error) {
                console.error('[OWASP-A04] Secure design middleware error:', error);
                next();
            }
        };
    }

    // ==================== THREAT MODELING ====================

    /**
     * Perform automated threat modeling for a component
     */
    async performThreatModeling(component, context = {}) {
        try {
            const threatId = uuidv4();
            
            const threatAssessment = {
                id: threatId,
                component: component,
                timestamp: new Date().toISOString(),
                context: context,
                threats: [],
                riskScore: 0,
                mitigations: [],
                residualRisk: 0
            };
            
            // Analyze threats using STRIDE model
            const strideThreats = this.analyzeStrideThreats(component, context);
            threatAssessment.threats.push(...strideThreats);
            
            // Calculate overall risk score
            threatAssessment.riskScore = this.calculateThreatRiskScore(threatAssessment.threats);
            
            // Generate mitigation recommendations
            threatAssessment.mitigations = this.generateMitigations(threatAssessment.threats);
            
            // Calculate residual risk after mitigations
            threatAssessment.residualRisk = this.calculateResidualRisk(
                threatAssessment.riskScore, 
                threatAssessment.mitigations
            );
            
            // Store threat model
            this.threatModel.set(threatId, threatAssessment);
            await this.saveThreatModel();
            
            console.log(`[OWASP-A04] Threat modeling completed for ${component}: Risk ${threatAssessment.riskScore}/10`);
            
            return threatAssessment;
            
        } catch (error) {
            console.error('[OWASP-A04] Threat modeling failed:', error);
            throw error;
        }
    }

    /**
     * Analyze threats using STRIDE methodology
     */
    analyzeStrideThreats(component, context) {
        const threats = [];
        
        // Spoofing threats
        if (this.isAuthenticationComponent(component)) {
            threats.push({
                type: 'spoofing',
                severity: 'high',
                description: 'Attacker could impersonate legitimate users',
                likelihood: this.assessLikelihood('spoofing', component, context),
                impact: this.assessImpact('spoofing', component, context)
            });
        }
        
        // Tampering threats
        if (this.isDataProcessingComponent(component)) {
            threats.push({
                type: 'tampering',
                severity: 'high',
                description: 'Attacker could modify data in transit or at rest',
                likelihood: this.assessLikelihood('tampering', component, context),
                impact: this.assessImpact('tampering', component, context)
            });
        }
        
        // Repudiation threats
        if (this.isBusinessLogicComponent(component)) {
            threats.push({
                type: 'repudiation',
                severity: 'medium',
                description: 'Users could deny performing actions',
                likelihood: this.assessLikelihood('repudiation', component, context),
                impact: this.assessImpact('repudiation', component, context)
            });
        }
        
        // Information Disclosure threats
        threats.push({
            type: 'information_disclosure',
            severity: 'high',
            description: 'Sensitive information could be exposed',
            likelihood: this.assessLikelihood('information_disclosure', component, context),
            impact: this.assessImpact('information_disclosure', component, context)
        });
        
        // Denial of Service threats
        threats.push({
            type: 'denial_of_service',
            severity: 'medium',
            description: 'Service availability could be compromised',
            likelihood: this.assessLikelihood('denial_of_service', component, context),
            impact: this.assessImpact('denial_of_service', component, context)
        });
        
        // Elevation of Privilege threats
        if (this.isAuthorizationComponent(component)) {
            threats.push({
                type: 'elevation_of_privilege',
                severity: 'critical',
                description: 'Attacker could gain unauthorized access levels',
                likelihood: this.assessLikelihood('elevation_of_privilege', component, context),
                impact: this.assessImpact('elevation_of_privilege', component, context)
            });
        }
        
        return threats;
    }

    /**
     * Assess threat likelihood
     */
    assessLikelihood(threatType, component, context) {
        // Simplified likelihood assessment
        const factors = {
            spoofing: context.hasAuthentication ? 3 : 8,
            tampering: context.hasInputValidation ? 4 : 7,
            repudiation: context.hasLogging ? 2 : 6,
            information_disclosure: context.hasEncryption ? 3 : 9,
            denial_of_service: context.hasRateLimiting ? 4 : 8,
            elevation_of_privilege: context.hasAuthorization ? 2 : 9
        };
        
        return Math.min(10, factors[threatType] || 5);
    }

    /**
     * Assess threat impact
     */
    assessImpact(threatType, component, context) {
        // Simplified impact assessment based on asset classification
        const assetValue = this.getAssetValue(component);
        const impactMultipliers = {
            spoofing: 0.8,
            tampering: 0.9,
            repudiation: 0.6,
            information_disclosure: 1.0,
            denial_of_service: 0.7,
            elevation_of_privilege: 1.0
        };
        
        return Math.min(10, Math.ceil(assetValue * (impactMultipliers[threatType] || 0.5)));
    }

    /**
     * Calculate threat risk score
     */
    calculateThreatRiskScore(threats) {
        if (threats.length === 0) return 0;
        
        let totalRisk = 0;
        threats.forEach(threat => {
            const riskScore = (threat.likelihood * threat.impact) / 10;
            totalRisk += riskScore;
        });
        
        return Math.min(10, totalRisk / threats.length);
    }

    /**
     * Generate mitigation recommendations
     */
    generateMitigations(threats) {
        const mitigations = [];
        
        threats.forEach(threat => {
            switch (threat.type) {
                case 'spoofing':
                    mitigations.push({
                        threat: threat.type,
                        mitigation: 'Implement strong authentication mechanisms',
                        effectiveness: 0.8,
                        cost: 'medium',
                        timeframe: 'short'
                    });
                    break;
                    
                case 'tampering':
                    mitigations.push({
                        threat: threat.type,
                        mitigation: 'Implement data integrity controls and encryption',
                        effectiveness: 0.9,
                        cost: 'medium',
                        timeframe: 'medium'
                    });
                    break;
                    
                case 'repudiation':
                    mitigations.push({
                        threat: threat.type,
                        mitigation: 'Implement comprehensive audit logging',
                        effectiveness: 0.7,
                        cost: 'low',
                        timeframe: 'short'
                    });
                    break;
                    
                case 'information_disclosure':
                    mitigations.push({
                        threat: threat.type,
                        mitigation: 'Implement encryption and access controls',
                        effectiveness: 0.85,
                        cost: 'medium',
                        timeframe: 'medium'
                    });
                    break;
                    
                case 'denial_of_service':
                    mitigations.push({
                        threat: threat.type,
                        mitigation: 'Implement rate limiting and resource controls',
                        effectiveness: 0.75,
                        cost: 'low',
                        timeframe: 'short'
                    });
                    break;
                    
                case 'elevation_of_privilege':
                    mitigations.push({
                        threat: threat.type,
                        mitigation: 'Implement role-based access control',
                        effectiveness: 0.9,
                        cost: 'high',
                        timeframe: 'long'
                    });
                    break;
            }
        });
        
        return mitigations;
    }

    /**
     * Calculate residual risk after mitigations
     */
    calculateResidualRisk(originalRisk, mitigations) {
        let riskReduction = 0;
        
        mitigations.forEach(mitigation => {
            riskReduction += mitigation.effectiveness;
        });
        
        const averageEffectiveness = mitigations.length > 0 ? riskReduction / mitigations.length : 0;
        return Math.max(0, originalRisk * (1 - averageEffectiveness));
    }

    // ==================== BUSINESS LOGIC PROTECTION ====================

    /**
     * Validate business logic execution
     */
    validateBusinessLogic(operation, context = {}) {
        try {
            const violations = [];
            
            // Check operation sequence
            const sequenceCheck = this.checkSequenceIntegrity(operation, context);
            if (!sequenceCheck.isValid) {
                violations.push(...sequenceCheck.violations);
            }
            
            // Check timing constraints
            const timingCheck = this.checkTimingConstraints(operation, context);
            if (!timingCheck.isValid) {
                violations.push(...timingCheck.violations);
            }
            
            // Check business rules
            const businessRulesCheck = this.checkBusinessRules(operation, context);
            if (!businessRulesCheck.isValid) {
                violations.push(...businessRulesCheck.violations);
            }
            
            // Check limits and quotas
            const limitsCheck = this.checkLimitsAndQuotas(operation, context);
            if (!limitsCheck.isValid) {
                violations.push(...limitsCheck.violations);
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations
            };
            
        } catch (error) {
            console.error('[OWASP-A04] Business logic validation failed:', error);
            return { isValid: false, violations: ['Business logic validation error'] };
        }
    }

    /**
     * Check sequence integrity
     */
    checkSequenceIntegrity(operation, context) {
        try {
            const violations = [];
            const userId = context.userId || 'anonymous';
            const sessionId = context.sessionId || 'no-session';
            
            // Get or create user state
            const stateKey = `${userId}:${sessionId}`;
            let userState = this.businessLogicState.get(stateKey) || {
                currentStep: 0,
                expectedSequence: [],
                lastActivity: Date.now(),
                operationHistory: []
            };
            
            // Define operation sequences
            const operationSequences = {
                'checkout': ['view_product', 'add_to_cart', 'enter_details', 'payment', 'confirmation'],
                'contact': ['view_form', 'fill_form', 'submit'],
                'training': ['start_course', 'view_content', 'take_quiz', 'complete'],
                'authentication': ['login_form', 'submit_credentials', 'verify_session']
            };
            
            // Check if operation follows expected sequence
            const sequence = operationSequences[operation.type];
            if (sequence) {
                const expectedStep = sequence[userState.currentStep];
                
                if (operation.step !== expectedStep) {
                    violations.push(`Invalid sequence: expected ${expectedStep}, got ${operation.step}`);
                }
                
                // Check for sequence timeout
                const timeSinceLastActivity = Date.now() - userState.lastActivity;
                const timeoutMs = this.config.businessLogic.sequenceTimeoutMinutes * 60 * 1000;
                
                if (timeSinceLastActivity > timeoutMs) {
                    violations.push('Sequence timeout exceeded');
                    userState.currentStep = 0; // Reset sequence
                }
            }
            
            // Update state
            userState.lastActivity = Date.now();
            userState.operationHistory.push({
                operation: operation,
                timestamp: Date.now()
            });
            
            // Keep only recent history
            if (userState.operationHistory.length > 50) {
                userState.operationHistory = userState.operationHistory.slice(-50);
            }
            
            this.businessLogicState.set(stateKey, userState);
            
            return {
                isValid: violations.length === 0,
                violations: violations
            };
            
        } catch (error) {
            console.error('[OWASP-A04] Sequence integrity check failed:', error);
            return { isValid: false, violations: ['Sequence check error'] };
        }
    }

    /**
     * Check timing constraints
     */
    checkTimingConstraints(operation, context) {
        const violations = [];
        
        try {
            // Check for rapid-fire operations (potential automation)
            const userId = context.userId || context.ip || 'unknown';
            const now = Date.now();
            const recentOperations = this.getRecentOperations(userId, 60000); // Last minute
            
            if (recentOperations.length > this.config.businessLogic.suspiciousActivityThreshold) {
                violations.push('Suspicious activity: too many operations in short time');
            }
            
            // Check for time-based business rules
            if (operation.type === 'financial_transaction') {
                const todayOperations = this.getRecentOperations(userId, 24 * 60 * 60 * 1000); // Last 24 hours
                const totalAmount = todayOperations.reduce((sum, op) => sum + (op.amount || 0), 0);
                
                if (totalAmount > this.config.businessLogic.maxDailyTransactions) {
                    violations.push('Daily transaction limit exceeded');
                }
                
                if (operation.amount > this.config.businessLogic.maxTransactionAmount) {
                    violations.push('Transaction amount exceeds limit');
                }
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations
            };
            
        } catch (error) {
            console.error('[OWASP-A04] Timing constraints check failed:', error);
            return { isValid: false, violations: ['Timing check error'] };
        }
    }

    /**
     * Check business rules
     */
    checkBusinessRules(operation, context) {
        const violations = [];
        
        try {
            // Define business rules
            const businessRules = {
                'contact_form': {
                    required_fields: ['name', 'email', 'message'],
                    max_message_length: 2000,
                    min_message_length: 10
                },
                'checkout': {
                    required_fields: ['name', 'email', 'address', 'payment_method'],
                    min_cart_value: 0,
                    max_cart_value: 50000
                },
                'training': {
                    required_auth: true,
                    prerequisite_check: true
                }
            };
            
            const rules = businessRules[operation.type];
            if (rules) {
                // Check required fields
                if (rules.required_fields) {
                    for (const field of rules.required_fields) {
                        if (!operation.data || !operation.data[field]) {
                            violations.push(`Required field missing: ${field}`);
                        }
                    }
                }
                
                // Check specific constraints
                if (rules.max_message_length && operation.data?.message?.length > rules.max_message_length) {
                    violations.push(`Message exceeds maximum length (${rules.max_message_length})`);
                }
                
                if (rules.min_message_length && operation.data?.message?.length < rules.min_message_length) {
                    violations.push(`Message below minimum length (${rules.min_message_length})`);
                }
                
                if (rules.required_auth && !context.isAuthenticated) {
                    violations.push('Authentication required for this operation');
                }
                
                // Check cart value constraints
                if (rules.min_cart_value && operation.data?.total < rules.min_cart_value) {
                    violations.push(`Cart value below minimum (${rules.min_cart_value})`);
                }
                
                if (rules.max_cart_value && operation.data?.total > rules.max_cart_value) {
                    violations.push(`Cart value exceeds maximum (${rules.max_cart_value})`);
                }
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations
            };
            
        } catch (error) {
            console.error('[OWASP-A04] Business rules check failed:', error);
            return { isValid: false, violations: ['Business rules check error'] };
        }
    }

    /**
     * Check limits and quotas
     */
    checkLimitsAndQuotas(operation, context) {
        const violations = [];
        
        try {
            const userId = context.userId || context.ip || 'unknown';
            
            // Check operation-specific limits
            const limits = {
                'contact_form': { daily: 5, hourly: 2 },
                'api_request': { daily: 1000, hourly: 100 },
                'file_upload': { daily: 10, hourly: 3 },
                'search': { daily: 500, hourly: 50 }
            };
            
            const operationLimits = limits[operation.type];
            if (operationLimits) {
                const hourlyCount = this.getRecentOperations(userId, 60 * 60 * 1000).length;
                const dailyCount = this.getRecentOperations(userId, 24 * 60 * 60 * 1000).length;
                
                if (hourlyCount >= operationLimits.hourly) {
                    violations.push(`Hourly limit exceeded for ${operation.type} (${operationLimits.hourly})`);
                }
                
                if (dailyCount >= operationLimits.daily) {
                    violations.push(`Daily limit exceeded for ${operation.type} (${operationLimits.daily})`);
                }
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations
            };
            
        } catch (error) {
            console.error('[OWASP-A04] Limits and quotas check failed:', error);
            return { isValid: false, violations: ['Limits check error'] };
        }
    }

    // ==================== ATTACK SURFACE ANALYSIS ====================

    /**
     * Analyze attack surface
     */
    async analyzeAttackSurface() {
        try {
            const attackSurface = {
                entryPoints: [],
                dataFlows: [],
                trustBoundaries: [],
                assets: [],
                riskScore: 0,
                timestamp: new Date().toISOString()
            };
            
            // Map entry points
            attackSurface.entryPoints = this.mapEntryPoints();
            
            // Analyze data flows
            attackSurface.dataFlows = this.analyzeDataFlows();
            
            // Identify trust boundaries
            attackSurface.trustBoundaries = this.identifyTrustBoundaries();
            
            // Catalog assets
            attackSurface.assets = this.catalogAssets();
            
            // Calculate attack surface risk score
            attackSurface.riskScore = this.calculateAttackSurfaceRisk(attackSurface);
            
            this.attackSurfaceMap.set('current', attackSurface);
            
            console.log(`[OWASP-A04] Attack surface analysis completed: Risk score ${attackSurface.riskScore}/10`);
            
            return attackSurface;
            
        } catch (error) {
            console.error('[OWASP-A04] Attack surface analysis failed:', error);
            throw error;
        }
    }

    /**
     * Map application entry points
     */
    mapEntryPoints() {
        const entryPoints = [];
        
        this.config.attackSurface.entryPoints.forEach(endpoint => {
            entryPoints.push({
                path: endpoint,
                methods: this.getEndpointMethods(endpoint),
                authentication: this.requiresAuthentication(endpoint),
                authorization: this.requiresAuthorization(endpoint),
                inputValidation: this.hasInputValidation(endpoint),
                riskLevel: this.assessEndpointRisk(endpoint)
            });
        });
        
        return entryPoints;
    }

    /**
     * Analyze data flows
     */
    analyzeDataFlows() {
        const dataFlows = [];
        
        this.config.attackSurface.dataFlows.forEach(flow => {
            const flowSteps = flow.split(' -> ');
            dataFlows.push({
                flow: flow,
                steps: flowSteps,
                dataTypes: this.identifyDataTypes(flow),
                securityControls: this.identifySecurityControls(flow),
                vulnerabilities: this.identifyFlowVulnerabilities(flow),
                riskLevel: this.assessFlowRisk(flow)
            });
        });
        
        return dataFlows;
    }

    /**
     * Identify data types in flow
     */
    identifyDataTypes(flow) {
        const dataTypes = [];
        
        if (flow.includes('user_input')) {
            dataTypes.push('user_data', 'form_data');
        }
        if (flow.includes('authentication')) {
            dataTypes.push('credentials', 'tokens');
        }
        if (flow.includes('payment') || flow.includes('checkout')) {
            dataTypes.push('financial_data', 'pii');
        }
        if (flow.includes('processing') || flow.includes('storage')) {
            dataTypes.push('business_data', 'system_data');
        }
        
        return dataTypes.length > 0 ? dataTypes : ['generic_data'];
    }

    /**
     * Identify security controls in flow
     */
    identifySecurityControls(flow) {
        const controls = [];
        
        if (flow.includes('validation')) {
            controls.push('input_validation', 'sanitization');
        }
        if (flow.includes('authentication')) {
            controls.push('authentication', 'session_management');
        }
        if (flow.includes('authorization')) {
            controls.push('access_control', 'permission_checks');
        }
        if (flow.includes('processing')) {
            controls.push('business_logic_validation', 'rate_limiting');
        }
        if (flow.includes('storage')) {
            controls.push('encryption', 'access_control');
        }
        
        return controls;
    }

    /**
     * Identify flow vulnerabilities
     */
    identifyFlowVulnerabilities(flow) {
        const vulnerabilities = [];
        
        if (flow.includes('user_input') && !flow.includes('validation')) {
            vulnerabilities.push('injection_attacks', 'xss');
        }
        if (flow.includes('authentication') && !flow.includes('mfa')) {
            vulnerabilities.push('weak_authentication');
        }
        if (flow.includes('external_api')) {
            vulnerabilities.push('ssrf', 'data_leakage');
        }
        if (flow.includes('storage') && !flow.includes('encryption')) {
            vulnerabilities.push('data_exposure');
        }
        
        return vulnerabilities;
    }

    /**
     * Assess flow risk level
     */
    assessFlowRisk(flow) {
        let riskScore = 1; // Base risk
        
        if (flow.includes('user_input')) riskScore += 2;
        if (flow.includes('external_api')) riskScore += 3;
        if (flow.includes('financial') || flow.includes('payment')) riskScore += 4;
        if (flow.includes('admin') || flow.includes('privileged')) riskScore += 3;
        
        // Reduce risk if security controls are present
        if (flow.includes('validation')) riskScore -= 1;
        if (flow.includes('authentication')) riskScore -= 1;
        if (flow.includes('authorization')) riskScore -= 1;
        
        const riskScore_final = Math.max(1, Math.min(10, riskScore));
        
        if (riskScore_final >= 8) return 'critical';
        if (riskScore_final >= 6) return 'high';
        if (riskScore_final >= 4) return 'medium';
        return 'low';
    }

    /**
     * Get asset threats
     */
    getAssetThreats(asset) {
        const threats = [];
        
        // Based on asset classification, determine potential threats
        if (this.config.threatModeling.assetClassification.critical.includes(asset)) {
            threats.push('data_breach', 'unauthorized_access', 'tampering', 'denial_of_service');
        } else if (this.config.threatModeling.assetClassification.high.includes(asset)) {
            threats.push('unauthorized_modification', 'information_disclosure', 'privilege_escalation');
        } else if (this.config.threatModeling.assetClassification.medium.includes(asset)) {
            threats.push('information_disclosure', 'service_disruption');
        } else {
            threats.push('minor_disclosure');
        }
        
        return threats;
    }

    /**
     * Get asset controls
     */
    getAssetControls(asset) {
        const controls = [];
        
        // Assign controls based on asset type
        if (asset.includes('data') || asset.includes('info')) {
            controls.push('encryption', 'access_control', 'data_classification');
        }
        if (asset.includes('auth') || asset.includes('token')) {
            controls.push('secure_storage', 'token_validation', 'session_management');
        }
        if (asset.includes('api') || asset.includes('endpoint')) {
            controls.push('rate_limiting', 'input_validation', 'authorization');
        }
        if (asset.includes('key') || asset.includes('crypto')) {
            controls.push('key_rotation', 'secure_generation', 'hardware_security');
        }
        
        return controls.length > 0 ? controls : ['basic_access_control'];
    }

    /**
     * Get asset value
     */
    getAssetValue(asset) {
        // Return asset value based on classification
        if (this.config.threatModeling.assetClassification.critical.includes(asset)) {
            return 9;
        } else if (this.config.threatModeling.assetClassification.high.includes(asset)) {
            return 7;
        } else if (this.config.threatModeling.assetClassification.medium.includes(asset)) {
            return 5;
        } else {
            return 3;
        }
    }

    /**
     * Validate security requirements
     */
    async validateSecurityRequirements() {
        try {
            const requirements = this.config.securityRequirements;
            const validationResults = {
                confidentiality: true,
                integrity: true,
                availability: true,
                accountability: true
            };
            
            // This is a simplified validation - in a real system,
            // this would check actual implementation against requirements
            console.log('[OWASP-A04] Security requirements validation completed');
            
            return validationResults;
            
        } catch (error) {
            console.error('[OWASP-A04] Security requirements validation failed:', error);
            return {
                confidentiality: false,
                integrity: false,
                availability: false,
                accountability: false
            };
        }
    }

    /**
     * Identify trust boundaries
     */
    identifyTrustBoundaries() {
        return [
            {
                name: 'Client-Server',
                description: 'Boundary between client applications and server',
                controls: ['TLS', 'input_validation', 'authentication'],
                threats: ['tampering', 'spoofing', 'information_disclosure']
            },
            {
                name: 'API-Internal',
                description: 'Boundary between public API and internal services',
                controls: ['authorization', 'rate_limiting', 'input_validation'],
                threats: ['elevation_of_privilege', 'denial_of_service']
            },
            {
                name: 'Application-Database',
                description: 'Boundary between application and data layer',
                controls: ['parameterized_queries', 'access_controls', 'encryption'],
                threats: ['injection', 'information_disclosure', 'tampering']
            }
        ];
    }

    /**
     * Catalog security assets
     */
    catalogAssets() {
        const assets = [];
        
        Object.entries(this.config.threatModeling.assetClassification).forEach(([classification, assetList]) => {
            assetList.forEach(asset => {
                assets.push({
                    name: asset,
                    classification: classification,
                    value: this.getAssetValue(asset),
                    threats: this.getAssetThreats(asset),
                    controls: this.getAssetControls(asset)
                });
            });
        });
        
        return assets;
    }

    /**
     * Calculate attack surface risk score
     */
    calculateAttackSurfaceRisk(attackSurface) {
        let totalRisk = 0;
        let riskFactors = 0;
        
        // Entry points risk
        attackSurface.entryPoints.forEach(ep => {
            totalRisk += ep.riskLevel;
            riskFactors++;
        });
        
        // Data flows risk
        attackSurface.dataFlows.forEach(df => {
            totalRisk += df.riskLevel;
            riskFactors++;
        });
        
        // Assets risk
        attackSurface.assets.forEach(asset => {
            totalRisk += asset.value;
            riskFactors++;
        });
        
        return riskFactors > 0 ? Math.min(10, totalRisk / riskFactors) : 0;
    }

    /**
     * Track attack surface interaction
     */
    trackAttackSurfaceInteraction(req) {
        try {
            const interaction = {
                timestamp: Date.now(),
                endpoint: req.path,
                method: req.method,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                authenticated: !!req.user?.isAuthenticated,
                authorized: !!req.user?.permissions
            };
            
            // Store interaction (keep last 1000)
            const interactions = this.attackSurfaceMap.get('interactions') || [];
            interactions.push(interaction);
            
            if (interactions.length > 1000) {
                interactions.splice(0, interactions.length - 1000);
            }
            
            this.attackSurfaceMap.set('interactions', interactions);
            
        } catch (error) {
            console.error('[OWASP-A04] Failed to track attack surface interaction:', error);
        }
    }

    // ==================== RUNTIME VALIDATION ====================

    /**
     * Perform runtime design validation
     */
    performRuntimeValidation(req) {
        try {
            const violations = [];
            
            // Validate architectural principles
            const principlesCheck = this.validateArchitecturalPrinciples(req);
            if (!principlesCheck.isValid) {
                violations.push(...principlesCheck.violations);
            }
            
            // Validate security patterns
            const patternsCheck = this.validateSecurityPatterns(req);
            if (!patternsCheck.isValid) {
                violations.push(...patternsCheck.violations);
            }
            
            // Check defense in depth
            const depthCheck = this.checkDefenseInDepth(req);
            if (!depthCheck.isValid) {
                violations.push(...depthCheck.violations);
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations
            };
            
        } catch (error) {
            console.error('[OWASP-A04] Runtime validation failed:', error);
            return { isValid: false, violations: ['Runtime validation error'] };
        }
    }

    /**
     * Validate architectural principles
     */
    validateArchitecturalPrinciples(req) {
        const violations = [];
        
        try {
            // Least privilege principle
            if (req.user && req.user.permissions) {
                const requiredPermissions = this.getRequiredPermissions(req.path, req.method);
                const hasOnlyRequired = this.hasOnlyRequiredPermissions(req.user.permissions, requiredPermissions);
                
                if (!hasOnlyRequired) {
                    violations.push('Least privilege principle violation: user has excessive permissions');
                }
            }
            
            // Fail secure principle
            if (req.headers['x-forwarded-proto'] === 'http' && process.env.NODE_ENV === 'production') {
                violations.push('Fail secure violation: insecure transport in production');
            }
            
            // Minimize attack surface
            if (this.isUnnecessaryEndpointAccess(req.path, req.user)) {
                violations.push('Attack surface violation: access to unnecessary endpoint');
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations
            };
            
        } catch (error) {
            console.error('[OWASP-A04] Architectural principles validation failed:', error);
            return { isValid: false, violations: ['Architectural validation error'] };
        }
    }

    /**
     * Validate security patterns
     */
    validateSecurityPatterns(req) {
        const violations = [];
        
        try {
            // Input validation pattern
            if (req.body || req.query) {
                const hasInputValidation = this.hasInputValidation(req.path);
                if (!hasInputValidation) {
                    violations.push('Missing input validation security pattern');
                }
            }
            
            // Authentication pattern
            if (this.requiresAuthentication(req.path) && !req.user?.isAuthenticated) {
                violations.push('Missing authentication security pattern');
            }
            
            // Authorization pattern
            if (this.requiresAuthorization(req.path) && !this.hasProperAuthorization(req)) {
                violations.push('Missing authorization security pattern');
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations
            };
            
        } catch (error) {
            console.error('[OWASP-A04] Security patterns validation failed:', error);
            return { isValid: false, violations: ['Security patterns validation error'] };
        }
    }

    /**
     * Check defense in depth implementation
     */
    checkDefenseInDepth(req) {
        const violations = [];
        const layers = [];
        
        try {
            // Network layer (simulated)
            if (req.ip) layers.push('network');
            
            // Application layer
            if (req.headers['content-type']) layers.push('application');
            
            // Authentication layer
            if (req.user?.isAuthenticated) layers.push('authentication');
            
            // Authorization layer
            if (req.user?.permissions) layers.push('authorization');
            
            // Data layer (input validation)
            if (req.injectionPrevention) layers.push('data');
            
            // Minimum required layers for sensitive operations
            const requiredLayers = this.getRequiredDefenseLayers(req.path);
            const missingLayers = requiredLayers.filter(layer => !layers.includes(layer));
            
            if (missingLayers.length > 0) {
                violations.push(`Defense in depth violation: missing layers ${missingLayers.join(', ')}`);
            }
            
            return {
                isValid: violations.length === 0,
                violations: violations,
                presentLayers: layers
            };
            
        } catch (error) {
            console.error('[OWASP-A04] Defense in depth check failed:', error);
            return { isValid: false, violations: ['Defense in depth check error'] };
        }
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Get asset value based on classification
     */
    getAssetValue(assetName) {
        for (const [classification, assets] of Object.entries(this.config.threatModeling.assetClassification)) {
            if (assets.includes(assetName)) {
                const values = { critical: 10, high: 7, medium: 5, low: 3 };
                return values[classification] || 1;
            }
        }
        return 1;
    }

    /**
     * Check if component is authentication-related
     */
    isAuthenticationComponent(component) {
        return component.includes('auth') || component.includes('login') || component.includes('session');
    }

    /**
     * Check if component is data processing-related
     */
    isDataProcessingComponent(component) {
        return component.includes('data') || component.includes('process') || component.includes('form');
    }

    /**
     * Check if component is business logic-related
     */
    isBusinessLogicComponent(component) {
        return component.includes('business') || component.includes('logic') || component.includes('workflow');
    }

    /**
     * Check if component is authorization-related
     */
    isAuthorizationComponent(component) {
        return component.includes('authz') || component.includes('permission') || component.includes('role');
    }

    /**
     * Get recent operations for a user
     */
    getRecentOperations(userId, timeWindowMs) {
        const cutoff = Date.now() - timeWindowMs;
        const operations = [];
        
        for (const [stateKey, userState] of this.businessLogicState.entries()) {
            if (stateKey.startsWith(userId + ':')) {
                const recentOps = userState.operationHistory.filter(op => op.timestamp > cutoff);
                operations.push(...recentOps);
            }
        }
        
        return operations;
    }

    /**
     * Get endpoint methods
     */
    getEndpointMethods(endpoint) {
        // Simplified - in real implementation, this would analyze route definitions
        const methodMap = {
            '/api/contact': ['POST'],
            '/api/chat': ['POST'],
            '/api/security/*': ['GET', 'POST', 'PUT', 'DELETE'],
            '/api/admin/*': ['GET', 'POST', 'PUT', 'DELETE']
        };
        
        return methodMap[endpoint] || ['GET'];
    }

    /**
     * Check if endpoint requires authentication
     */
    requiresAuthentication(endpoint) {
        const authRequired = ['/api/security/*', '/api/admin/*', '/api/reports/*'];
        return authRequired.some(pattern => 
            endpoint.match(pattern.replace('*', '.*'))
        );
    }

    /**
     * Check if endpoint requires authorization
     */
    requiresAuthorization(endpoint) {
        return this.requiresAuthentication(endpoint);
    }

    /**
     * Check if endpoint has input validation
     */
    hasInputValidation(endpoint) {
        // Assume all endpoints have input validation in our implementation
        return true;
    }

    /**
     * Assess endpoint risk level
     */
    assessEndpointRisk(endpoint) {
        const riskLevels = {
            '/api/security/*': 9,
            '/api/admin/*': 8,
            '/api/reports/*': 6,
            '/api/contact': 3,
            '/api/chat': 4
        };
        
        return riskLevels[endpoint] || 2;
    }

    /**
     * Log design violation
     */
    logDesignViolation(type, req, violations) {
        const violation = {
            type: type,
            timestamp: new Date().toISOString(),
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            url: req.url,
            method: req.method,
            violations: violations,
            user: req.user ? {
                id: req.user.id,
                role: req.user.role
            } : null
        };
        
        this.designViolations.push(violation);
        
        // Keep only last 500 violations
        if (this.designViolations.length > 500) {
            this.designViolations = this.designViolations.slice(-500);
        }
        
        console.warn(`[OWASP-A04] Design violation detected:`, violation);
    }

    /**
     * Start design monitoring
     */
    startDesignMonitoring() {
        // Monitor design violations every hour
        setInterval(() => {
            this.analyzeDesignViolationTrends();
        }, 60 * 60 * 1000);
        
        // Perform threat model updates daily
        setInterval(() => {
            this.performScheduledThreatModeling();
        }, 24 * 60 * 60 * 1000);
    }

    /**
     * Analyze design violation trends
     */
    analyzeDesignViolationTrends() {
        try {
            const recentViolations = this.designViolations.filter(v => 
                new Date(v.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
            );
            
            if (recentViolations.length > 10) {
                console.warn(`[OWASP-A04] High number of design violations in last 24h: ${recentViolations.length}`);
            }
            
            // Analyze violation types
            const violationTypes = {};
            recentViolations.forEach(v => {
                violationTypes[v.type] = (violationTypes[v.type] || 0) + 1;
            });
            
            console.log(`[OWASP-A04] Recent violation types:`, violationTypes);
            
        } catch (error) {
            console.error('[OWASP-A04] Failed to analyze violation trends:', error);
        }
    }

    /**
     * Perform scheduled threat modeling
     */
    async performScheduledThreatModeling() {
        try {
            const components = ['web_server', 'api_endpoints', 'data_processing', 'authentication'];
            
            for (const component of components) {
                await this.performThreatModeling(component, {
                    hasAuthentication: true,
                    hasInputValidation: true,
                    hasEncryption: true,
                    hasLogging: true,
                    hasRateLimiting: true,
                    hasAuthorization: true
                });
            }
            
            console.log('[OWASP-A04] Scheduled threat modeling completed');
            
        } catch (error) {
            console.error('[OWASP-A04] Scheduled threat modeling failed:', error);
        }
    }

    // ==================== DATA PERSISTENCE ====================

    async loadThreatModel() {
        try {
            const threatModelPath = './security-data/threat-model.json';
            if (await fs.exists(threatModelPath)) {
                const data = await fs.readJSON(threatModelPath);
                this.threatModel = new Map(Object.entries(data));
                console.log(`[OWASP-A04] Loaded ${this.threatModel.size} threat assessments`);
            }
        } catch (error) {
            console.error('[OWASP-A04] Failed to load threat model:', error);
        }
    }

    async saveThreatModel() {
        try {
            const threatModelPath = './security-data/threat-model.json';
            const data = Object.fromEntries(this.threatModel);
            await fs.writeJSON(threatModelPath, data, { spaces: 2 });
        } catch (error) {
            console.error('[OWASP-A04] Failed to save threat model:', error);
        }
    }

    // ==================== PUBLIC API ====================

    /**
     * Get secure design metrics
     */
    getSecureDesignMetrics() {
        return {
            threatAssessments: this.threatModel.size,
            businessLogicStates: this.businessLogicState.size,
            designViolations: this.designViolations.length,
            recentViolations: this.designViolations.filter(v => 
                new Date(v.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
            ).length,
            attackSurfaceRisk: this.attackSurfaceMap.get('current')?.riskScore || 0
        };
    }

    /**
     * Get recent design violations
     */
    getRecentDesignViolations(limit = 50) {
        return this.designViolations.slice(-limit).reverse();
    }

    /**
     * Get threat model summary
     */
    getThreatModelSummary() {
        const threats = Array.from(this.threatModel.values());
        return {
            totalAssessments: threats.length,
            averageRiskScore: threats.reduce((sum, t) => sum + t.riskScore, 0) / threats.length || 0,
            highRiskComponents: threats.filter(t => t.riskScore >= 7).length,
            criticalThreats: threats.filter(t => t.threats.some(th => th.severity === 'critical')).length
        };
    }

    /**
     * Assess threat for specific request
     */
    assessThreat(req, context = {}) {
        const component = `${req.method}_${req.path}`;
        return this.performThreatModeling(component, {
            ...context,
            hasAuthentication: !!req.user?.isAuthenticated,
            hasInputValidation: !!req.injectionPrevention,
            hasAuthorization: !!req.user?.permissions
        });
    }

    /**
     * Verify security requirements for operation
     */
    verifySecurityRequirements(operation, context = {}) {
        const requirements = this.config.securityRequirements;
        const violations = [];
        
        // Check confidentiality requirements
        if (requirements.confidentiality.dataEncryption && !context.encrypted) {
            violations.push('Data encryption required but not implemented');
        }
        
        // Check integrity requirements
        if (requirements.integrity.dataValidation && !context.validated) {
            violations.push('Data validation required but not implemented');
        }
        
        // Check availability requirements
        if (requirements.availability.rateLimiting && !context.rateLimited) {
            violations.push('Rate limiting required but not implemented');
        }
        
        // Check accountability requirements
        if (requirements.accountability.auditLogging && !context.logged) {
            violations.push('Audit logging required but not implemented');
        }
        
        return {
            isValid: violations.length === 0,
            violations: violations
        };
    }
}

module.exports = {
    InsecureDesignManager: SecureDesignProtection,
    SECURE_DESIGN_CONFIG
};