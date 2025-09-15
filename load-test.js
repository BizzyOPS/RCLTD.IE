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
    
    // Test endpoints
    endpoints: [
        { path: '/', method: 'GET', weight: 0.4 },
        { path: '/services.html', method: 'GET', weight: 0.2 },
        { path: '/contact.html', method: 'GET', weight: 0.2 },
        { path: '/api/health', method: 'GET', weight: 0.1 },
        { path: '/api/metrics', method: 'GET', weight: 0.1 }
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
                errorRate: 0
            },
            errors: []
        };
        
        this.activeRequests = 0;
        this.testStartTime = null;
        this.testEndTime = null;
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
        
        // Reset results
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
                errorRate: 0
            },
            errors: []
        };

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
        while (this.activeRequests > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
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
        
        // Performance assessment
        console.log('\n🎯 Performance Assessment:');
        if (metrics.averageResponseTime < 100) {
            console.log('   ✅ Excellent response times (<100ms average)');
        } else if (metrics.averageResponseTime < 500) {
            console.log('   ✅ Good response times (<500ms average)');
        } else if (metrics.averageResponseTime < 1000) {
            console.log('   ⚠️  Acceptable response times (<1s average)');
        } else {
            console.log('   ❌ Poor response times (>1s average)');
        }
        
        if (metrics.errorRate < 1) {
            console.log('   ✅ Excellent error rate (<1%)');
        } else if (metrics.errorRate < 5) {
            console.log('   ⚠️  Acceptable error rate (<5%)');
        } else {
            console.log('   ❌ High error rate (>5%)');
        }
    }

    /**
     * Run all test scenarios
     */
    async runAllScenarios() {
        const results = {};
        
        for (const [scenarioName, scenario] of Object.entries(this.config.scenarios)) {
            try {
                results[scenarioName] = await this.runScenario(scenarioName);
                
                // Wait between scenarios
                if (Object.keys(results).length < Object.keys(this.config.scenarios).length) {
                    console.log('\n⏸️  Waiting 10 seconds before next test...');
                    await new Promise(resolve => setTimeout(resolve, 10000));
                }
            } catch (error) {
                console.error(`❌ Failed to run scenario ${scenarioName}:`, error);
                results[scenarioName] = { error: error.message };
            }
        }
        
        return results;
    }
}

// ==================== CLI INTERFACE ====================

async function main() {
    const args = process.argv.slice(2);
    const scenarioName = args[0] || 'all';
    
    console.log('🔧 Load Testing Utility for Security System');
    console.log('==========================================');
    
    const loadTester = new LoadTester();
    
    try {
        if (scenarioName === 'all') {
            await loadTester.runAllScenarios();
        } else if (LOAD_TEST_CONFIG.scenarios[scenarioName]) {
            await loadTester.runScenario(scenarioName);
        } else {
            console.error(`❌ Unknown scenario: ${scenarioName}`);
            console.log('\nAvailable scenarios:');
            Object.keys(LOAD_TEST_CONFIG.scenarios).forEach(name => {
                console.log(`  - ${name}`);
            });
            console.log('  - all (run all scenarios)');
            process.exit(1);
        }
        
        console.log('\n✅ Load testing completed successfully!');
        
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