#!/usr/bin/env node

/**
 * Load Testing Utility for Robotics & Control Ltd Security System
 * 
 * This script performs load testing to measure the performance impact
 * of security middleware and monitoring systems.
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

// ==================== LOAD TEST CONFIGURATION ====================

const LOAD_TEST_CONFIG = {
    // Test parameters
    baseUrl: process.env.TEST_URL || 'http://localhost:5000',
    
    // Test scenarios
    scenarios: {
        light: {
            name: 'Light Load Test',
            concurrency: 10,
            duration: 30000, // 30 seconds
            requestsPerSecond: 50
        },
        moderate: {
            name: 'Moderate Load Test',
            concurrency: 50,
            duration: 60000, // 1 minute
            requestsPerSecond: 200
        },
        heavy: {
            name: 'Heavy Load Test',
            concurrency: 100,
            duration: 120000, // 2 minutes
            requestsPerSecond: 500
        }
    },
    
    // Performance thresholds for validation
    thresholds: {
        averageResponseTime: 100, // ms
        p95ResponseTime: 250, // ms
        p99ResponseTime: 500, // ms
        errorRate: 0.01, // 1%
        memoryIncreaseMB: 50, // Max memory increase during test
        throughputRPS: 100 // Minimum requests per second
    },
    
    // Test endpoints with realistic weights
    endpoints: [
        { path: '/', method: 'GET', weight: 0.25 },
        { path: '/services.html', method: 'GET', weight: 0.15 },
        { path: '/about.html', method: 'GET', weight: 0.15 },
        { path: '/contact.html', method: 'GET', weight: 0.10 },
        { path: '/css/style.css', method: 'GET', weight: 0.10 },
        { path: '/js/script.js', method: 'GET', weight: 0.10 },
        { path: '/api/security/jobs/status', method: 'GET', weight: 0.10 },
        { path: '/images/logo.png', method: 'GET', weight: 0.05 }
    ],
    
    // Security endpoint tests
    securityEndpoints: [
        { path: '/api/security/jobs/status', method: 'GET', expectAuth: false },
        { path: '/api/security/metrics', method: 'GET', expectAuth: false },
        { path: '/api/security/ip/block', method: 'POST', expectAuth: true }
    ]
};

// ==================== LOAD TESTER CLASS ====================

class LoadTester {
    constructor(config = LOAD_TEST_CONFIG) {
        this.config = config;
        this.results = {
            requests: [],
            metrics: {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                averageResponseTime: 0,
                minResponseTime: Infinity,
                maxResponseTime: 0,
                percentiles: {},
                requestsPerSecond: 0,
                errorRate: 0,
                memoryUsage: {
                    initial: null,
                    peak: null,
                    final: null,
                    samples: []
                },
                cpuUsage: []
            },
            errors: [],
            securityTests: []
        };
        
        this.activeRequests = 0;
        this.testStartTime = null;
        this.testEndTime = null;
        this.performanceMonitor = null;
    }
    
    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        const initialMemory = process.memoryUsage();
        this.results.metrics.memoryUsage.initial = {
            timestamp: Date.now(),
            heapUsed: Math.round(initialMemory.heapUsed / 1024 / 1024),
            heapTotal: Math.round(initialMemory.heapTotal / 1024 / 1024),
            external: Math.round(initialMemory.external / 1024 / 1024),
            rss: Math.round(initialMemory.rss / 1024 / 1024)
        };
        
        // Monitor memory and CPU every second
        this.performanceMonitor = setInterval(() => {
            const memory = process.memoryUsage();
            const cpu = process.cpuUsage();
            
            const memoryData = {
                timestamp: Date.now(),
                heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
                heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
                external: Math.round(memory.external / 1024 / 1024),
                rss: Math.round(memory.rss / 1024 / 1024)
            };
            
            this.results.metrics.memoryUsage.samples.push(memoryData);
            
            // Track peak memory usage
            if (!this.results.metrics.memoryUsage.peak || 
                memoryData.heapUsed > this.results.metrics.memoryUsage.peak.heapUsed) {
                this.results.metrics.memoryUsage.peak = memoryData;
            }
            
            this.results.metrics.cpuUsage.push({
                timestamp: Date.now(),
                user: cpu.user,
                system: cpu.system
            });
            
        }, 1000);
    }
    
    /**
     * Stop performance monitoring
     */
    stopPerformanceMonitoring() {
        if (this.performanceMonitor) {
            clearInterval(this.performanceMonitor);
        }
        
        const finalMemory = process.memoryUsage();
        this.results.metrics.memoryUsage.final = {
            timestamp: Date.now(),
            heapUsed: Math.round(finalMemory.heapUsed / 1024 / 1024),
            heapTotal: Math.round(finalMemory.heapTotal / 1024 / 1024),
            external: Math.round(finalMemory.external / 1024 / 1024),
            rss: Math.round(finalMemory.rss / 1024 / 1024)
        };
    }
    
    /**
     * Test security endpoints specifically
     */
    async testSecurityEndpoints() {
        console.log('\n🔐 Testing security endpoints...');
        
        for (const endpoint of this.config.securityEndpoints) {
            try {
                const startTime = Date.now();
                const response = await this.makeSecurityRequest(endpoint);
                const responseTime = Date.now() - startTime;
                
                const testResult = {
                    endpoint: endpoint.path,
                    method: endpoint.method,
                    expectedAuth: endpoint.expectAuth,
                    statusCode: response.statusCode,
                    responseTime: responseTime,
                    success: this.validateSecurityResponse(endpoint, response),
                    timestamp: startTime
                };
                
                this.results.securityTests.push(testResult);
                
                const status = testResult.success ? '✅' : '❌';
                console.log(`   ${status} ${endpoint.method} ${endpoint.path} - ${response.statusCode} (${responseTime}ms)`);
                
            } catch (error) {
                this.results.securityTests.push({
                    endpoint: endpoint.path,
                    method: endpoint.method,
                    error: error.message,
                    success: false,
                    timestamp: Date.now()
                });
                
                console.log(`   ❌ ${endpoint.method} ${endpoint.path} - Error: ${error.message}`);
            }
        }
    }
    
    /**
     * Make request to security endpoint
     */
    async makeSecurityRequest(endpoint) {
        const url = new URL(endpoint.path, this.config.baseUrl);
        const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname + url.search,
            method: endpoint.method,
            headers: {
                'User-Agent': 'SecurityTester/1.0',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            timeout: 10000
        };
        
        return new Promise((resolve, reject) => {
            const client = url.protocol === 'https:' ? https : http;
            
            const req = client.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: data
                    });
                });
            });
            
            req.on('error', reject);
            req.on('timeout', () => reject(new Error('Request timeout')));
            
            if (endpoint.method === 'POST' && endpoint.expectAuth) {
                // Test data for POST requests
                const testData = JSON.stringify({ ip: '192.168.1.100', action: 'block', reason: 'test' });
                req.write(testData);
            }
            
            req.end();
        });
    }
    
    /**
     * Validate security endpoint response
     */
    validateSecurityResponse(endpoint, response) {
        // For endpoints that expect authentication, 401/403 is expected without auth
        if (endpoint.expectAuth) {
            return response.statusCode === 401 || response.statusCode === 403;
        }
        
        // For public endpoints, 200 is expected
        return response.statusCode >= 200 && response.statusCode < 400;
    }
    
    /**
     * Run comprehensive performance suite
     */
    async runPerformanceSuite() {
        console.log('\n🚀 Running Comprehensive Performance Test Suite');
        console.log('===============================================');
        
        const results = {};
        
        // Test security endpoints first
        await this.testSecurityEndpoints();
        
        // Run load test scenarios
        for (const [scenarioName, scenario] of Object.entries(this.config.scenarios)) {
            console.log(`\n📊 Running ${scenario.name}...`);
            results[scenarioName] = await this.runScenario(scenarioName);
            
            // Validate against thresholds
            const validation = this.validatePerformance(results[scenarioName]);
            results[scenarioName].validation = validation;
            
            const status = validation.overall ? '✅' : '⚠️';
            console.log(`${status} ${scenario.name} completed - ${validation.passed}/${validation.total} checks passed`);
            
            if (scenarioName !== Object.keys(this.config.scenarios).slice(-1)[0]) {
                console.log('⏳ Cooling down...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
        
        // Generate performance report
        await this.generatePerformanceReport(results);
        
        return results;
    }
    
    /**
     * Validate performance against thresholds
     */
    validatePerformance(results) {
        const metrics = results.metrics;
        const thresholds = this.config.thresholds;
        
        const checks = {
            averageResponseTime: metrics.averageResponseTime <= thresholds.averageResponseTime,
            p95ResponseTime: metrics.percentiles.p95 <= thresholds.p95ResponseTime,
            p99ResponseTime: metrics.percentiles.p99 <= thresholds.p99ResponseTime,
            errorRate: metrics.errorRate <= (thresholds.errorRate * 100),
            throughput: metrics.requestsPerSecond >= thresholds.throughputRPS
        };
        
        // Check memory usage if available
        if (metrics.memoryUsage.initial && metrics.memoryUsage.final) {
            const memoryIncrease = metrics.memoryUsage.final.heapUsed - metrics.memoryUsage.initial.heapUsed;
            checks.memoryIncrease = memoryIncrease <= thresholds.memoryIncreaseMB;
        }
        
        const passed = Object.values(checks).filter(Boolean).length;
        const total = Object.keys(checks).length;
        
        return {
            checks: checks,
            passed: passed,
            total: total,
            overall: passed === total
        };
    }
    
    /**
     * Generate comprehensive performance report
     */
    async generatePerformanceReport(results) {
        const fs = require('fs-extra');
        const path = require('path');
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportDir = './security-reports';
        const reportPath = path.join(reportDir, `load-test-report-${timestamp}.json`);
        
        await fs.ensureDir(reportDir);
        
        const report = {
            timestamp: new Date().toISOString(),
            server: this.config.baseUrl,
            thresholds: this.config.thresholds,
            scenarios: results,
            securityTests: this.results.securityTests,
            summary: this.generateSummary(results)
        };
        
        await fs.writeJSON(reportPath, report, { spaces: 2 });
        
        console.log(`\n📊 Performance report saved: ${reportPath}`);
        
        return reportPath;
    }
    
    /**
     * Generate test summary
     */
    generateSummary(results) {
        const scenarios = Object.keys(results);
        const passedScenarios = scenarios.filter(s => results[s].validation?.overall).length;
        const securityTestsPassed = this.results.securityTests.filter(t => t.success).length;
        
        return {
            totalScenarios: scenarios.length,
            passedScenarios: passedScenarios,
            failedScenarios: scenarios.length - passedScenarios,
            securityTestsPassed: securityTestsPassed,
            securityTestsTotal: this.results.securityTests.length,
            overallResult: passedScenarios === scenarios.length && 
                          securityTestsPassed === this.results.securityTests.length ? 'PASS' : 'FAIL'
        };
    }

    /**
     * Run a specific load test scenario
     */
    async runScenario(scenarioName) {
        const scenario = this.config.scenarios[scenarioName];
        if (!scenario) {
            throw new Error(`Unknown scenario: ${scenarioName}`);
        }

        console.log(`\n🚀 Starting ${scenario.name}`);
        console.log(`📊 Parameters: ${scenario.concurrency} concurrent users, ${scenario.duration}ms duration`);
        console.log(`🎯 Target: ${scenario.requestsPerSecond} requests/second`);
        console.log(`🌐 Base URL: ${this.config.baseUrl}`);
        
        this.testStartTime = Date.now();
        
        // Reset results for this scenario
        this.results = {
            requests: [],
            metrics: {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                averageResponseTime: 0,
                minResponseTime: Infinity,
                maxResponseTime: 0,
                percentiles: {},
                requestsPerSecond: 0,
                errorRate: 0,
                memoryUsage: {
                    initial: null,
                    peak: null,
                    final: null,
                    samples: []
                },
                cpuUsage: []
            },
            errors: []
        };

        // Start performance monitoring
        this.startPerformanceMonitoring();

        // Start concurrent workers
        const workers = [];
        for (let i = 0; i < scenario.concurrency; i++) {
            workers.push(this.startWorker(scenario));
        }

        // Run for specified duration
        await new Promise(resolve => setTimeout(resolve, scenario.duration));
        
        this.testEndTime = Date.now();
        
        // Wait for any remaining requests to complete
        console.log('\n⏳ Waiting for remaining requests to complete...');
        let waitTime = 0;
        while (this.activeRequests > 0 && waitTime < 30000) { // Max 30 second wait
            await new Promise(resolve => setTimeout(resolve, 100));
            waitTime += 100;
        }
        
        // Stop performance monitoring
        this.stopPerformanceMonitoring();
        
        // Calculate final metrics
        this.calculateMetrics();
        
        // Display results
        this.displayResults(scenario);
        
        return this.results;
    }

    /**
     * Start a worker that makes continuous requests
     */
    async startWorker(scenario) {
        const startTime = this.testStartTime;
        const endTime = startTime + scenario.duration;
        const interval = 1000 / (scenario.requestsPerSecond / scenario.concurrency);
        
        while (Date.now() < endTime) {
            const endpoint = this.selectRandomEndpoint();
            await this.makeRequest(endpoint);
            
            // Wait before next request
            await new Promise(resolve => setTimeout(resolve, Math.random() * interval));
        }
    }

    /**
     * Select a random endpoint based on weights
     */
    selectRandomEndpoint() {
        const random = Math.random();
        let weightSum = 0;
        
        for (const endpoint of this.config.endpoints) {
            weightSum += endpoint.weight;
            if (random <= weightSum) {
                return endpoint;
            }
        }
        
        // Fallback to first endpoint
        return this.config.endpoints[0];
    }

    /**
     * Make a single HTTP request
     */
    async makeRequest(endpoint) {
        return new Promise((resolve) => {
            this.activeRequests++;
            const requestStart = Date.now();
            
            const url = new URL(endpoint.path, this.config.baseUrl);
            const options = {
                hostname: url.hostname,
                port: url.port || (url.protocol === 'https:' ? 443 : 80),
                path: url.pathname + url.search,
                method: endpoint.method,
                headers: {
                    'User-Agent': 'LoadTester/1.0 (Security Monitoring Test)',
                    'Accept': 'text/html,application/json,*/*',
                    'Connection': 'close'
                },
                timeout: 30000 // 30 second timeout
            };

            const client = url.protocol === 'https:' ? https : http;
            
            const req = client.request(options, (res) => {
                let data = '';
                
                res.on('data', chunk => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    const responseTime = Date.now() - requestStart;
                    
                    this.results.requests.push({
                        timestamp: requestStart,
                        method: endpoint.method,
                        path: endpoint.path,
                        statusCode: res.statusCode,
                        responseTime: responseTime,
                        success: res.statusCode >= 200 && res.statusCode < 400
                    });
                    
                    this.activeRequests--;
                    resolve();
                });
            });

            req.on('error', (error) => {
                const responseTime = Date.now() - requestStart;
                
                this.results.requests.push({
                    timestamp: requestStart,
                    method: endpoint.method,
                    path: endpoint.path,
                    statusCode: 0,
                    responseTime: responseTime,
                    success: false,
                    error: error.message
                });
                
                this.results.errors.push({
                    timestamp: requestStart,
                    endpoint: endpoint.path,
                    error: error.message
                });
                
                this.activeRequests--;
                resolve();
            });

            req.on('timeout', () => {
                req.destroy();
                const responseTime = Date.now() - requestStart;
                
                this.results.requests.push({
                    timestamp: requestStart,
                    method: endpoint.method,
                    path: endpoint.path,
                    statusCode: 0,
                    responseTime: responseTime,
                    success: false,
                    error: 'Timeout'
                });
                
                this.activeRequests--;
                resolve();
            });

            req.end();
        });
    }

    /**
     * Calculate performance metrics
     */
    calculateMetrics() {
        const requests = this.results.requests;
        const testDuration = this.testEndTime - this.testStartTime;
        
        this.results.metrics.totalRequests = requests.length;
        this.results.metrics.successfulRequests = requests.filter(r => r.success).length;
        this.results.metrics.failedRequests = requests.filter(r => !r.success).length;
        this.results.metrics.errorRate = (this.results.metrics.failedRequests / this.results.metrics.totalRequests) * 100;
        this.results.metrics.requestsPerSecond = (this.results.metrics.totalRequests / testDuration) * 1000;
        
        // Response time metrics
        const responseTimes = requests.map(r => r.responseTime).sort((a, b) => a - b);
        
        if (responseTimes.length > 0) {
            this.results.metrics.minResponseTime = responseTimes[0];
            this.results.metrics.maxResponseTime = responseTimes[responseTimes.length - 1];
            this.results.metrics.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
            
            // Calculate percentiles
            this.results.metrics.percentiles = {
                p50: this.calculatePercentile(responseTimes, 50),
                p75: this.calculatePercentile(responseTimes, 75),
                p90: this.calculatePercentile(responseTimes, 90),
                p95: this.calculatePercentile(responseTimes, 95),
                p99: this.calculatePercentile(responseTimes, 99)
            };
        }
    }

    /**
     * Calculate percentile value
     */
    calculatePercentile(sortedArray, percentile) {
        const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
        return sortedArray[index] || 0;
    }

    /**
     * Display test results
     */
    displayResults(scenario) {
        const metrics = this.results.metrics;
        
        console.log(`\n📈 ${scenario.name} Results:`);
        console.log('═'.repeat(50));
        console.log(`📊 Total Requests: ${metrics.totalRequests}`);
        console.log(`✅ Successful: ${metrics.successfulRequests} (${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)}%)`);
        console.log(`❌ Failed: ${metrics.failedRequests} (${metrics.errorRate.toFixed(2)}%)`);
        console.log(`🚀 Requests/sec: ${metrics.requestsPerSecond.toFixed(2)}`);
        
        // Memory usage metrics
        if (metrics.memoryUsage.initial && metrics.memoryUsage.final) {
            const memoryIncrease = metrics.memoryUsage.final.heapUsed - metrics.memoryUsage.initial.heapUsed;
            const peakMemory = metrics.memoryUsage.peak ? metrics.memoryUsage.peak.heapUsed : 0;
            console.log('');
            console.log('💾 Memory Usage:');
            console.log(`   Initial: ${metrics.memoryUsage.initial.heapUsed}MB`);
            console.log(`   Peak: ${peakMemory}MB`);
            console.log(`   Final: ${metrics.memoryUsage.final.heapUsed}MB`);
            console.log(`   Increase: ${memoryIncrease}MB`);
        }
        
        console.log('');
        console.log('⏱️  Response Time Metrics:');
        console.log(`   Average: ${metrics.averageResponseTime.toFixed(2)}ms`);
        console.log(`   Min: ${metrics.minResponseTime}ms`);
        console.log(`   Max: ${metrics.maxResponseTime}ms`);
        console.log(`   50th percentile: ${metrics.percentiles.p50}ms`);
        console.log(`   75th percentile: ${metrics.percentiles.p75}ms`);
        console.log(`   90th percentile: ${metrics.percentiles.p90}ms`);
        console.log(`   95th percentile: ${metrics.percentiles.p95}ms`);
        console.log(`   99th percentile: ${metrics.percentiles.p99}ms`);
        
        if (this.results.errors.length > 0) {
            console.log('\n🚨 Recent Errors:');
            this.results.errors.slice(-5).forEach(error => {
                console.log(`   ${error.endpoint}: ${error.error}`);
            });
        }
        
        // Performance assessment against thresholds
        console.log('\n🎯 Performance Assessment:');
        const thresholds = this.config.thresholds;
        
        // Response time assessment
        if (metrics.averageResponseTime <= thresholds.averageResponseTime) {
            console.log(`   ✅ Average response time: ${metrics.averageResponseTime.toFixed(2)}ms (≤ ${thresholds.averageResponseTime}ms)`);
        } else {
            console.log(`   ❌ Average response time: ${metrics.averageResponseTime.toFixed(2)}ms (> ${thresholds.averageResponseTime}ms)`);
        }
        
        if (metrics.percentiles.p95 <= thresholds.p95ResponseTime) {
            console.log(`   ✅ 95th percentile: ${metrics.percentiles.p95}ms (≤ ${thresholds.p95ResponseTime}ms)`);
        } else {
            console.log(`   ❌ 95th percentile: ${metrics.percentiles.p95}ms (> ${thresholds.p95ResponseTime}ms)`);
        }
        
        // Error rate assessment
        if (metrics.errorRate <= (thresholds.errorRate * 100)) {
            console.log(`   ✅ Error rate: ${metrics.errorRate.toFixed(2)}% (≤ ${(thresholds.errorRate * 100).toFixed(1)}%)`);
        } else {
            console.log(`   ❌ Error rate: ${metrics.errorRate.toFixed(2)}% (> ${(thresholds.errorRate * 100).toFixed(1)}%)`);
        }
        
        // Throughput assessment
        if (metrics.requestsPerSecond >= thresholds.throughputRPS) {
            console.log(`   ✅ Throughput: ${metrics.requestsPerSecond.toFixed(2)} RPS (≥ ${thresholds.throughputRPS} RPS)`);
        } else {
            console.log(`   ⚠️  Throughput: ${metrics.requestsPerSecond.toFixed(2)} RPS (< ${thresholds.throughputRPS} RPS)`);
        }
        
        // Memory assessment
        if (metrics.memoryUsage.initial && metrics.memoryUsage.final) {
            const memoryIncrease = metrics.memoryUsage.final.heapUsed - metrics.memoryUsage.initial.heapUsed;
            if (memoryIncrease <= thresholds.memoryIncreaseMB) {
                console.log(`   ✅ Memory increase: ${memoryIncrease}MB (≤ ${thresholds.memoryIncreaseMB}MB)`);
            } else {
                console.log(`   ❌ Memory increase: ${memoryIncrease}MB (> ${thresholds.memoryIncreaseMB}MB)`);
            }
        }
    }

    /**
     * Run all test scenarios
     */
    async runAllScenarios() {
        return await this.runPerformanceSuite();
    }
}

// ==================== CLI INTERFACE ====================

async function main() {
    const args = process.argv.slice(2);
    const scenarioName = args[0] || 'all';
    
    console.log('🔧 Enhanced Load Testing Utility for Security System');
    console.log('===================================================');
    console.log(`🎯 Testing: ${LOAD_TEST_CONFIG.baseUrl}`);
    console.log(`📊 Performance Thresholds:`);
    console.log(`   - Avg Response Time: ≤ ${LOAD_TEST_CONFIG.thresholds.averageResponseTime}ms`);
    console.log(`   - 95th Percentile: ≤ ${LOAD_TEST_CONFIG.thresholds.p95ResponseTime}ms`);
    console.log(`   - Error Rate: ≤ ${(LOAD_TEST_CONFIG.thresholds.errorRate * 100).toFixed(1)}%`);
    console.log(`   - Min Throughput: ≥ ${LOAD_TEST_CONFIG.thresholds.throughputRPS} RPS`);
    console.log(`   - Max Memory Increase: ≤ ${LOAD_TEST_CONFIG.thresholds.memoryIncreaseMB}MB\n`);
    
    const loadTester = new LoadTester();
    
    try {
        let results;
        
        if (scenarioName === 'all') {
            results = await loadTester.runPerformanceSuite();
        } else if (scenarioName === 'security') {
            console.log('🔐 Running security endpoint tests only...');
            await loadTester.testSecurityEndpoints();
            return;
        } else if (LOAD_TEST_CONFIG.scenarios[scenarioName]) {
            console.log(`🚀 Running single scenario: ${scenarioName}`);
            results = await loadTester.runScenario(scenarioName);
            const validation = loadTester.validatePerformance(results);
            console.log(`\n📊 Validation: ${validation.passed}/${validation.total} checks passed`);
        } else {
            console.error(`❌ Unknown scenario: ${scenarioName}`);
            console.log('\nAvailable scenarios:');
            Object.keys(LOAD_TEST_CONFIG.scenarios).forEach(name => {
                console.log(`  - ${name}`);
            });
            console.log('  - all (run comprehensive performance suite)');
            console.log('  - security (run security endpoint tests only)');
            process.exit(1);
        }
        
        console.log('\n✅ Load testing completed successfully!');
        
        // Exit with error code if performance validation fails
        if (results && typeof results === 'object') {
            const overallSuccess = Object.values(results)
                .filter(r => r.validation)
                .every(r => r.validation.overall);
            
            if (!overallSuccess) {
                console.log('⚠️  Some performance thresholds were not met.');
                process.exit(1);
            }
        }
        
    } catch (error) {
        console.error('❌ Load testing failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { LoadTester, LOAD_TEST_CONFIG };