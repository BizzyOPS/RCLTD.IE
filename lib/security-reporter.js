/**
 * Security Reporting and Dashboard System
 * Robotics & Control Ltd - Enterprise Security Monitoring
 * 
 * This module provides comprehensive security reporting, metrics aggregation,
 * and dashboard functionality for security monitoring.
 */

const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const csvWriter = require('fast-csv');

// ==================== SECURITY REPORTER CONFIGURATION ====================

const REPORTER_CONFIG = {
    // Report generation settings
    reports: {
        outputDir: './security-reports/dashboard',
        formats: ['json', 'csv', 'html'],
        retentionDays: 90,
        automaticGeneration: true
    },
    
    // Dashboard settings
    dashboard: {
        refreshInterval: 30000, // 30 seconds
        metricsRetention: 7 * 24 * 60 * 60 * 1000, // 7 days
        alertHistory: 100, // Keep last 100 alerts
        chartDataPoints: 24 // Last 24 hours for charts
    },
    
    // Alerting thresholds for reports
    alertThresholds: {
        criticalVulnerabilities: 1,
        highRiskScore: 80,
        suspiciousActivitySpike: 500, // % increase
        errorRateThreshold: 5 // %
    }
};

// ==================== SECURITY REPORTER CLASS ====================

class SecurityReporter {
    constructor(vulnerabilityScanner, securityMonitor, config = REPORTER_CONFIG) {
        this.config = config;
        this.vulnerabilityScanner = vulnerabilityScanner;
        this.securityMonitor = securityMonitor;
        
        // Initialize dashboard data
        this.dashboardData = {
            lastUpdated: new Date().toISOString(),
            metrics: {},
            charts: {},
            alerts: [],
            reports: []
        };
        
        // Historical data for trending
        this.historicalMetrics = [];
        
        // Initialize system
        this.initialize();
    }

    /**
     * Initialize the security reporter
     */
    async initialize() {
        try {
            // Ensure output directories exist
            await fs.ensureDir(this.config.reports.outputDir);
            
            // Start automated reporting if enabled
            if (this.config.reports.automaticGeneration) {
                this.startAutomaticReporting();
            }
            
            console.log('[SECURITY-REPORTER] Security reporting system initialized');
            
        } catch (error) {
            console.error('[SECURITY-REPORTER] Failed to initialize:', error);
            throw error;
        }
    }

    /**
     * Generate comprehensive security report
     */
    async generateSecurityReport(options = {}) {
        const reportId = uuidv4();
        const timestamp = new Date().toISOString();
        
        console.log(`[SECURITY-REPORTER] Generating security report ${reportId}`);
        
        try {
            // Collect data from all security components
            const vulnerabilityData = this.collectVulnerabilityData();
            const monitoringData = this.collectMonitoringData();
            const complianceData = this.assessCompliance();
            const trendData = this.calculateTrends();
            
            // Create comprehensive report
            const report = {
                id: reportId,
                timestamp: timestamp,
                type: options.type || 'comprehensive',
                period: options.period || 'daily',
                
                // Executive summary
                executiveSummary: this.generateExecutiveSummary(
                    vulnerabilityData, 
                    monitoringData, 
                    complianceData
                ),
                
                // Detailed sections
                vulnerabilities: vulnerabilityData,
                securityMonitoring: monitoringData,
                compliance: complianceData,
                trends: trendData,
                
                // Recommendations
                recommendations: this.generateSecurityRecommendations(
                    vulnerabilityData, 
                    monitoringData
                ),
                
                // Appendices
                rawData: options.includeRawData ? {
                    latestVulnerabilityScan: this.vulnerabilityScanner.getLatestResults(),
                    securityMetrics: this.securityMonitor.getSecurityMetrics(),
                    recentAlerts: this.securityMonitor.getRecentAlerts(50)
                } : null
            };
            
            // Save report in requested formats
            await this.saveReport(report, options.formats || this.config.reports.formats);
            
            // Update dashboard
            this.updateDashboard(report);
            
            console.log(`[SECURITY-REPORTER] Security report ${reportId} generated successfully`);
            return report;
            
        } catch (error) {
            console.error(`[SECURITY-REPORTER] Failed to generate report ${reportId}:`, error);
            throw error;
        }
    }

    /**
     * Collect vulnerability assessment data
     */
    collectVulnerabilityData() {
        const latestScan = this.vulnerabilityScanner.getLatestResults();
        const scanHistory = this.vulnerabilityScanner.getScanHistory();
        const securityMetrics = this.vulnerabilityScanner.getSecurityMetrics();
        
        return {
            lastScanDate: latestScan?.timestamp || null,
            scanStatus: latestScan?.status || 'unknown',
            
            // Current state
            totalVulnerabilities: latestScan?.summary?.totalVulnerabilities || 0,
            criticalVulnerabilities: latestScan?.summary?.critical || 0,
            highVulnerabilities: latestScan?.summary?.high || 0,
            moderateVulnerabilities: latestScan?.summary?.moderate || 0,
            lowVulnerabilities: latestScan?.summary?.low || 0,
            
            // Compliance
            complianceScore: latestScan?.compliance?.score || null,
            compliancePassed: latestScan?.compliance?.passed || false,
            
            // Trends
            scanFrequency: this.calculateScanFrequency(scanHistory),
            vulnerabilityTrend: securityMetrics?.trendData || null,
            
            // Risk assessment
            riskLevel: securityMetrics?.riskLevel || 'unknown',
            
            // Top vulnerabilities
            topVulnerabilities: this.extractTopVulnerabilities(latestScan),
            
            // Tool performance
            scannerEffectiveness: this.assessScannerEffectiveness(latestScan)
        };
    }

    /**
     * Collect security monitoring data
     */
    collectMonitoringData() {
        const metrics = this.securityMonitor.getSecurityMetrics();
        const recentAlerts = this.securityMonitor.getRecentAlerts(100);
        const blockedIps = this.securityMonitor.getBlockedIps();
        
        return {
            // Current metrics
            totalRequests: metrics.totalRequests || 0,
            suspiciousRequests: metrics.suspiciousRequests || 0,
            blockedRequests: metrics.blockedRequests || 0,
            uniqueIps: metrics.uniqueIps || 0,
            blockedIpsCount: metrics.blockedIps || 0,
            
            // Performance metrics
            averageResponseTime: metrics.averageResponseTime || 0,
            errorRate: metrics.errorRate || 0,
            
            // Security events
            totalAlerts: recentAlerts.length,
            criticalAlerts: recentAlerts.filter(alert => alert.riskScore > 80).length,
            highAlerts: recentAlerts.filter(alert => alert.riskScore > 60 && alert.riskScore <= 80).length,
            
            // Threat analysis
            threatTypes: metrics.threatTypes || {},
            topThreats: this.getTopThreats(metrics.threatTypes || {}),
            
            // Blocked IPs
            blockedIpsList: blockedIps.slice(0, 20), // Top 20 for report
            
            // Attack patterns
            attackPatterns: this.analyzeAttackPatterns(recentAlerts),
            
            // Geographic analysis (if available)
            geographicDistribution: this.analyzeGeographicDistribution(recentAlerts)
        };
    }

    /**
     * Assess security compliance
     */
    assessCompliance() {
        const vulnerabilityData = this.collectVulnerabilityData();
        const monitoringData = this.collectMonitoringData();
        
        const compliance = {
            overallScore: 0,
            categories: {},
            violations: [],
            recommendations: []
        };
        
        // Vulnerability management compliance
        const vulnScore = this.assessVulnerabilityCompliance(vulnerabilityData);
        compliance.categories.vulnerabilityManagement = vulnScore;
        
        // Security monitoring compliance
        const monitoringScore = this.assessMonitoringCompliance(monitoringData);
        compliance.categories.securityMonitoring = monitoringScore;
        
        // Data protection compliance
        const dataProtectionScore = this.assessDataProtectionCompliance();
        compliance.categories.dataProtection = dataProtectionScore;
        
        // Access control compliance
        const accessControlScore = this.assessAccessControlCompliance();
        compliance.categories.accessControl = accessControlScore;
        
        // Calculate overall score
        const scores = Object.values(compliance.categories);
        compliance.overallScore = scores.reduce((sum, score) => sum + score.score, 0) / scores.length;
        
        // Collect violations
        scores.forEach(category => {
            compliance.violations.push(...(category.violations || []));
            compliance.recommendations.push(...(category.recommendations || []));
        });
        
        return compliance;
    }

    /**
     * Calculate security trends
     */
    calculateTrends() {
        const trends = {
            vulnerabilityTrends: this.calculateVulnerabilityTrends(),
            securityEventTrends: this.calculateSecurityEventTrends(),
            performanceTrends: this.calculatePerformanceTrends(),
            complianceTrends: this.calculateComplianceTrends()
        };
        
        return trends;
    }

    /**
     * Generate executive summary
     */
    generateExecutiveSummary(vulnData, monitoringData, complianceData) {
        const summary = {
            overallRiskLevel: this.calculateOverallRisk(vulnData, monitoringData),
            keyFindings: [],
            criticalIssues: [],
            positiveIndicators: [],
            immediateActions: []
        };
        
        // Critical vulnerabilities
        if (vulnData.criticalVulnerabilities > 0) {
            summary.criticalIssues.push(`${vulnData.criticalVulnerabilities} critical vulnerabilities require immediate attention`);
            summary.immediateActions.push('Patch critical vulnerabilities within 24 hours');
        }
        
        // High-risk security events
        if (monitoringData.criticalAlerts > 10) {
            summary.criticalIssues.push(`${monitoringData.criticalAlerts} critical security alerts in recent period`);
            summary.immediateActions.push('Investigate and respond to critical security alerts');
        }
        
        // Compliance issues
        if (complianceData.overallScore < 80) {
            summary.criticalIssues.push(`Compliance score of ${complianceData.overallScore.toFixed(1)}% below recommended threshold`);
            summary.immediateActions.push('Address compliance violations to improve security posture');
        }
        
        // Positive indicators
        if (vulnData.criticalVulnerabilities === 0) {
            summary.positiveIndicators.push('No critical vulnerabilities detected');
        }
        
        if (monitoringData.errorRate < 2) {
            summary.positiveIndicators.push('Low error rate indicates stable security controls');
        }
        
        // Key findings
        summary.keyFindings.push(`${vulnData.totalVulnerabilities} total vulnerabilities identified`);
        summary.keyFindings.push(`${monitoringData.totalAlerts} security events monitored`);
        summary.keyFindings.push(`${monitoringData.blockedIpsCount} IPs currently blocked`);
        
        return summary;
    }

    /**
     * Generate security recommendations
     */
    generateSecurityRecommendations(vulnData, monitoringData) {
        const recommendations = [];
        
        // Vulnerability-based recommendations
        if (vulnData.criticalVulnerabilities > 0) {
            recommendations.push({
                priority: 'CRITICAL',
                category: 'Vulnerability Management',
                title: 'Address Critical Vulnerabilities',
                description: `${vulnData.criticalVulnerabilities} critical vulnerabilities require immediate patching`,
                actions: [
                    'Prioritize critical vulnerability patches',
                    'Implement emergency change procedures if necessary',
                    'Verify patches in development environment first',
                    'Schedule maintenance windows for production updates'
                ],
                timeframe: '24 hours'
            });
        }
        
        // Security monitoring recommendations
        if (monitoringData.suspiciousRequests > monitoringData.totalRequests * 0.1) {
            recommendations.push({
                priority: 'HIGH',
                category: 'Security Monitoring',
                title: 'High Suspicious Activity Rate',
                description: 'Elevated levels of suspicious requests detected',
                actions: [
                    'Review and tune security detection rules',
                    'Investigate patterns in suspicious activity',
                    'Consider implementing additional rate limiting',
                    'Review blocked IP list for accuracy'
                ],
                timeframe: '3 days'
            });
        }
        
        // Performance recommendations
        if (monitoringData.averageResponseTime > 1000) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Performance',
                title: 'Security Impact on Performance',
                description: 'Security controls may be impacting response times',
                actions: [
                    'Review security middleware performance',
                    'Optimize security logging processes',
                    'Consider caching for security checks',
                    'Monitor resource utilization'
                ],
                timeframe: '1 week'
            });
        }
        
        // General best practices
        recommendations.push({
            priority: 'LOW',
            category: 'Best Practices',
            title: 'Ongoing Security Improvements',
            description: 'Continuous security posture improvement',
            actions: [
                'Schedule regular vulnerability scans',
                'Review and update security policies',
                'Conduct security awareness training',
                'Implement security metrics dashboards'
            ],
            timeframe: 'Ongoing'
        });
        
        return recommendations;
    }

    /**
     * Save report in multiple formats
     */
    async saveReport(report, formats) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const baseFileName = `security-report-${report.id}-${timestamp}`;
        
        for (const format of formats) {
            try {
                switch (format.toLowerCase()) {
                    case 'json':
                        await this.saveReportAsJSON(report, baseFileName);
                        break;
                    case 'csv':
                        await this.saveReportAsCSV(report, baseFileName);
                        break;
                    case 'html':
                        await this.saveReportAsHTML(report, baseFileName);
                        break;
                    default:
                        console.warn(`[SECURITY-REPORTER] Unknown format: ${format}`);
                }
            } catch (error) {
                console.error(`[SECURITY-REPORTER] Failed to save report as ${format}:`, error);
            }
        }
    }

    /**
     * Save report as JSON
     */
    async saveReportAsJSON(report, baseFileName) {
        const filePath = path.join(this.config.reports.outputDir, `${baseFileName}.json`);
        await fs.writeJSON(filePath, report, { spaces: 2 });
        console.log(`[SECURITY-REPORTER] JSON report saved: ${filePath}`);
    }

    /**
     * Save report as CSV
     */
    async saveReportAsCSV(report, baseFileName) {
        const filePath = path.join(this.config.reports.outputDir, `${baseFileName}.csv`);
        
        // Create summary CSV data
        const csvData = [
            // Summary row
            {
                category: 'Summary',
                metric: 'Total Vulnerabilities',
                value: report.vulnerabilities.totalVulnerabilities,
                timestamp: report.timestamp
            },
            {
                category: 'Summary',
                metric: 'Critical Vulnerabilities',
                value: report.vulnerabilities.criticalVulnerabilities,
                timestamp: report.timestamp
            },
            {
                category: 'Summary',
                metric: 'Compliance Score',
                value: report.compliance.overallScore,
                timestamp: report.timestamp
            },
            // Add monitoring data
            {
                category: 'Monitoring',
                metric: 'Total Requests',
                value: report.securityMonitoring.totalRequests,
                timestamp: report.timestamp
            },
            {
                category: 'Monitoring',
                metric: 'Suspicious Requests',
                value: report.securityMonitoring.suspiciousRequests,
                timestamp: report.timestamp
            },
            {
                category: 'Monitoring',
                metric: 'Blocked IPs',
                value: report.securityMonitoring.blockedIpsCount,
                timestamp: report.timestamp
            }
        ];
        
        await new Promise((resolve, reject) => {
            csvWriter.writeToPath(filePath, csvData, { headers: true })
                .on('error', reject)
                .on('finish', resolve);
        });
        
        console.log(`[SECURITY-REPORTER] CSV report saved: ${filePath}`);
    }

    /**
     * Save report as HTML
     */
    async saveReportAsHTML(report, baseFileName) {
        const filePath = path.join(this.config.reports.outputDir, `${baseFileName}.html`);
        const html = this.generateHTMLDashboard(report);
        await fs.writeFile(filePath, html);
        console.log(`[SECURITY-REPORTER] HTML report saved: ${filePath}`);
    }

    /**
     * Generate HTML dashboard
     */
    generateHTMLDashboard(report) {
        const { executiveSummary, vulnerabilities, securityMonitoring, compliance } = report;
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Dashboard - Robotics & Control Ltd</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; background: #f8f9fa; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0891b2, #06b6d4); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
        .header h1 { margin: 0 0 10px 0; font-size: 2.5em; }
        .header p { margin: 0; opacity: 0.9; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .metric-card { text-align: center; }
        .metric-value { font-size: 3em; font-weight: bold; margin: 10px 0; }
        .metric-label { color: #6b7280; font-size: 0.9em; }
        .critical { color: #dc2626; }
        .high { color: #ea580c; }
        .medium { color: #d97706; }
        .low { color: #059669; }
        .good { color: #059669; }
        .status-indicator { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; }
        .status-critical { background: #dc2626; }
        .status-warning { background: #f59e0b; }
        .status-good { background: #10b981; }
        .recommendations { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .compliance-score { font-size: 2em; font-weight: bold; }
        .compliance-good { color: #059669; }
        .compliance-warning { color: #d97706; }
        .compliance-poor { color: #dc2626; }
        .alert-list { max-height: 300px; overflow-y: auto; }
        .alert-item { padding: 10px; border-left: 4px solid #6b7280; margin: 8px 0; background: #f9fafb; border-radius: 4px; }
        .alert-critical { border-left-color: #dc2626; }
        .alert-high { border-left-color: #ea580c; }
        .threat-chart { display: flex; flex-wrap: wrap; gap: 10px; }
        .threat-item { background: #f3f4f6; padding: 8px 12px; border-radius: 20px; font-size: 0.85em; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f9fafb; font-weight: 600; }
        .trend-indicator { font-size: 0.8em; }
        .trend-up { color: #dc2626; }
        .trend-down { color: #059669; }
        .trend-stable { color: #6b7280; }
        @media (max-width: 768px) {
            .grid { grid-template-columns: 1fr; }
            .header h1 { font-size: 2em; }
            .metric-value { font-size: 2em; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Security Dashboard</h1>
            <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
            <p>Report ID: ${report.id}</p>
        </div>
        
        <!-- Executive Summary -->
        <div class="card">
            <h2>Executive Summary</h2>
            <p><strong>Overall Risk Level:</strong> 
                <span class="status-indicator status-${executiveSummary.overallRiskLevel.toLowerCase()}"></span>
                ${executiveSummary.overallRiskLevel}
            </p>
            
            ${executiveSummary.criticalIssues.length > 0 ? `
                <div class="recommendations">
                    <h3>Critical Issues</h3>
                    <ul>
                        ${executiveSummary.criticalIssues.map(issue => `<li>${issue}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${executiveSummary.immediateActions.length > 0 ? `
                <div>
                    <h3>Immediate Actions Required</h3>
                    <ul>
                        ${executiveSummary.immediateActions.map(action => `<li>${action}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
        
        <!-- Key Metrics -->
        <div class="grid">
            <div class="card metric-card">
                <div class="metric-value critical">${vulnerabilities.criticalVulnerabilities}</div>
                <div class="metric-label">Critical Vulnerabilities</div>
            </div>
            <div class="card metric-card">
                <div class="metric-value high">${vulnerabilities.highVulnerabilities}</div>
                <div class="metric-label">High Vulnerabilities</div>
            </div>
            <div class="card metric-card">
                <div class="metric-value ${compliance.overallScore >= 80 ? 'good' : compliance.overallScore >= 60 ? 'medium' : 'critical'}">${compliance.overallScore.toFixed(1)}%</div>
                <div class="metric-label">Compliance Score</div>
            </div>
            <div class="card metric-card">
                <div class="metric-value medium">${securityMonitoring.totalAlerts}</div>
                <div class="metric-label">Security Alerts</div>
            </div>
        </div>
        
        <!-- Vulnerability Details -->
        <div class="grid">
            <div class="card">
                <h3>Vulnerability Assessment</h3>
                <table>
                    <tr><th>Severity</th><th>Count</th><th>Trend</th></tr>
                    <tr><td>Critical</td><td class="critical">${vulnerabilities.criticalVulnerabilities}</td><td class="trend-indicator">-</td></tr>
                    <tr><td>High</td><td class="high">${vulnerabilities.highVulnerabilities}</td><td class="trend-indicator">-</td></tr>
                    <tr><td>Moderate</td><td class="medium">${vulnerabilities.moderateVulnerabilities}</td><td class="trend-indicator">-</td></tr>
                    <tr><td>Low</td><td class="low">${vulnerabilities.lowVulnerabilities}</td><td class="trend-indicator">-</td></tr>
                </table>
                <p><strong>Risk Level:</strong> ${vulnerabilities.riskLevel}</p>
                <p><strong>Last Scan:</strong> ${vulnerabilities.lastScanDate ? new Date(vulnerabilities.lastScanDate).toLocaleString() : 'Never'}</p>
            </div>
            
            <div class="card">
                <h3>Security Monitoring</h3>
                <table>
                    <tr><th>Metric</th><th>Value</th></tr>
                    <tr><td>Total Requests</td><td>${securityMonitoring.totalRequests.toLocaleString()}</td></tr>
                    <tr><td>Suspicious Requests</td><td class="high">${securityMonitoring.suspiciousRequests.toLocaleString()}</td></tr>
                    <tr><td>Blocked IPs</td><td>${securityMonitoring.blockedIpsCount}</td></tr>
                    <tr><td>Error Rate</td><td>${securityMonitoring.errorRate.toFixed(2)}%</td></tr>
                    <tr><td>Avg Response Time</td><td>${securityMonitoring.averageResponseTime.toFixed(0)}ms</td></tr>
                </table>
            </div>
        </div>
        
        <!-- Threat Analysis -->
        <div class="card">
            <h3>Threat Analysis</h3>
            <div class="threat-chart">
                ${Object.entries(securityMonitoring.threatTypes).map(([threat, count]) => 
                    `<div class="threat-item">${threat}: ${count}</div>`
                ).join('')}
            </div>
        </div>
        
        <!-- Compliance Status -->
        <div class="card">
            <h3>Compliance Status</h3>
            <div class="grid">
                ${Object.entries(compliance.categories).map(([category, data]) => `
                    <div>
                        <h4>${category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
                        <div class="compliance-score ${data.score >= 80 ? 'compliance-good' : data.score >= 60 ? 'compliance-warning' : 'compliance-poor'}">
                            ${data.score.toFixed(1)}%
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <!-- Recommendations -->
        <div class="card">
            <h3>Security Recommendations</h3>
            ${report.recommendations.slice(0, 5).map(rec => `
                <div class="recommendations">
                    <h4>${rec.priority}: ${rec.title}</h4>
                    <p>${rec.description}</p>
                    <p><strong>Timeframe:</strong> ${rec.timeframe}</p>
                    <ul>
                        ${rec.actions.slice(0, 3).map(action => `<li>${action}</li>`).join('')}
                    </ul>
                </div>
            `).join('')}
        </div>
        
        <div class="card">
            <p style="text-align: center; color: #6b7280; margin: 0;">
                Generated by Robotics & Control Ltd Security Monitoring System<br>
                Report ID: ${report.id} | ${new Date(report.timestamp).toLocaleString()}
            </p>
        </div>
    </div>
</body>
</html>`;
    }

    /**
     * Update dashboard with latest data
     */
    updateDashboard(report) {
        this.dashboardData = {
            lastUpdated: new Date().toISOString(),
            report: report,
            quickStats: {
                criticalVulnerabilities: report.vulnerabilities.criticalVulnerabilities,
                complianceScore: report.compliance.overallScore,
                totalAlerts: report.securityMonitoring.totalAlerts,
                riskLevel: report.executiveSummary.overallRiskLevel
            }
        };
        
        // Store historical data for trending
        this.historicalMetrics.push({
            timestamp: report.timestamp,
            vulnerabilities: report.vulnerabilities.totalVulnerabilities,
            compliance: report.compliance.overallScore,
            alerts: report.securityMonitoring.totalAlerts
        });
        
        // Keep only recent history
        const maxHistory = this.config.dashboard.chartDataPoints;
        if (this.historicalMetrics.length > maxHistory) {
            this.historicalMetrics = this.historicalMetrics.slice(-maxHistory);
        }
    }

    /**
     * Get dashboard data
     */
    getDashboardData() {
        return this.dashboardData;
    }

    /**
     * Start automatic reporting
     */
    startAutomaticReporting() {
        // Generate daily report at 6 AM
        const dailyReportInterval = setInterval(async () => {
            try {
                await this.generateSecurityReport({ type: 'daily', period: 'daily' });
            } catch (error) {
                console.error('[SECURITY-REPORTER] Failed to generate daily report:', error);
            }
        }, 24 * 60 * 60 * 1000); // 24 hours
        
        // Generate weekly report on Sundays
        const weeklyReportInterval = setInterval(async () => {
            const now = new Date();
            if (now.getDay() === 0) { // Sunday
                try {
                    await this.generateSecurityReport({ type: 'weekly', period: 'weekly' });
                } catch (error) {
                    console.error('[SECURITY-REPORTER] Failed to generate weekly report:', error);
                }
            }
        }, 24 * 60 * 60 * 1000); // Check daily
        
        console.log('[SECURITY-REPORTER] Automatic reporting scheduled');
    }

    // ==================== HELPER METHODS ====================

    /**
     * Extract top vulnerabilities from scan results
     */
    extractTopVulnerabilities(scanResults) {
        if (!scanResults || !scanResults.tools) return [];
        
        const allVulnerabilities = [];
        Object.values(scanResults.tools).forEach(tool => {
            if (tool.vulnerabilities) {
                allVulnerabilities.push(...tool.vulnerabilities);
            }
        });
        
        // Sort by severity and return top 10
        const severityOrder = { critical: 4, high: 3, moderate: 2, low: 1 };
        return allVulnerabilities
            .sort((a, b) => (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0))
            .slice(0, 10);
    }

    /**
     * Calculate scan frequency
     */
    calculateScanFrequency(scanHistory) {
        if (!scanHistory || scanHistory.length < 2) return 'insufficient_data';
        
        const recent = scanHistory.slice(-5);
        const intervals = [];
        
        for (let i = 1; i < recent.length; i++) {
            const prev = new Date(recent[i-1].timestamp);
            const curr = new Date(recent[i].timestamp);
            intervals.push(curr - prev);
        }
        
        const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        const days = avgInterval / (1000 * 60 * 60 * 24);
        
        if (days <= 1) return 'daily';
        if (days <= 7) return 'weekly';
        if (days <= 30) return 'monthly';
        return 'irregular';
    }

    /**
     * Get top threats from threat types
     */
    getTopThreats(threatTypes) {
        return Object.entries(threatTypes)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([threat, count]) => ({ threat, count }));
    }

    /**
     * Calculate overall risk level
     */
    calculateOverallRisk(vulnData, monitoringData) {
        if (vulnData.criticalVulnerabilities > 0) return 'CRITICAL';
        if (vulnData.highVulnerabilities > 5 || monitoringData.criticalAlerts > 20) return 'HIGH';
        if (vulnData.moderateVulnerabilities > 10 || monitoringData.highAlerts > 10) return 'MEDIUM';
        return 'LOW';
    }

    /**
     * Assess vulnerability compliance
     */
    assessVulnerabilityCompliance(vulnData) {
        let score = 100;
        const violations = [];
        const recommendations = [];
        
        if (vulnData.criticalVulnerabilities > 0) {
            score -= 50;
            violations.push('Critical vulnerabilities present');
            recommendations.push('Immediately patch critical vulnerabilities');
        }
        
        if (vulnData.highVulnerabilities > 5) {
            score -= 20;
            violations.push('Excessive high-severity vulnerabilities');
            recommendations.push('Reduce high-severity vulnerability count below 5');
        }
        
        if (!vulnData.lastScanDate || new Date() - new Date(vulnData.lastScanDate) > 7 * 24 * 60 * 60 * 1000) {
            score -= 15;
            violations.push('Vulnerability scans not performed regularly');
            recommendations.push('Implement weekly vulnerability scanning');
        }
        
        return { score: Math.max(0, score), violations, recommendations };
    }

    /**
     * Assess monitoring compliance
     */
    assessMonitoringCompliance(monitoringData) {
        let score = 100;
        const violations = [];
        const recommendations = [];
        
        if (monitoringData.errorRate > 5) {
            score -= 20;
            violations.push('High error rate indicates security control issues');
            recommendations.push('Investigate and reduce error rates');
        }
        
        if (monitoringData.averageResponseTime > 2000) {
            score -= 10;
            violations.push('Security controls impacting performance');
            recommendations.push('Optimize security middleware performance');
        }
        
        return { score: Math.max(0, score), violations, recommendations };
    }

    /**
     * Assess data protection compliance
     */
    assessDataProtectionCompliance() {
        // This would be enhanced with actual data protection checks
        return {
            score: 85,
            violations: [],
            recommendations: ['Implement data encryption at rest', 'Review data retention policies']
        };
    }

    /**
     * Assess access control compliance
     */
    assessAccessControlCompliance() {
        // This would be enhanced with actual access control checks
        return {
            score: 90,
            violations: [],
            recommendations: ['Review user access permissions', 'Implement multi-factor authentication']
        };
    }

    /**
     * Calculate vulnerability trends
     */
    calculateVulnerabilityTrends() {
        return this.historicalMetrics.length >= 2 ? {
            trend: this.calculateTrend(this.historicalMetrics.map(m => m.vulnerabilities)),
            data: this.historicalMetrics.slice(-7) // Last 7 data points
        } : { trend: 'insufficient_data', data: [] };
    }

    /**
     * Calculate security event trends
     */
    calculateSecurityEventTrends() {
        return this.historicalMetrics.length >= 2 ? {
            trend: this.calculateTrend(this.historicalMetrics.map(m => m.alerts)),
            data: this.historicalMetrics.slice(-7)
        } : { trend: 'insufficient_data', data: [] };
    }

    /**
     * Calculate performance trends
     */
    calculatePerformanceTrends() {
        // This would include response time, error rate trends
        return { trend: 'stable', data: [] };
    }

    /**
     * Calculate compliance trends
     */
    calculateComplianceTrends() {
        return this.historicalMetrics.length >= 2 ? {
            trend: this.calculateTrend(this.historicalMetrics.map(m => m.compliance)),
            data: this.historicalMetrics.slice(-7)
        } : { trend: 'insufficient_data', data: [] };
    }

    /**
     * Calculate trend direction
     */
    calculateTrend(values) {
        if (values.length < 2) return 'insufficient_data';
        
        const recent = values.slice(-3);
        const older = values.slice(-6, -3);
        
        if (older.length === 0) return 'insufficient_data';
        
        const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
        const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
        
        if (recentAvg > olderAvg * 1.1) return 'increasing';
        if (recentAvg < olderAvg * 0.9) return 'decreasing';
        return 'stable';
    }

    /**
     * Analyze attack patterns
     */
    analyzeAttackPatterns(alerts) {
        const patterns = {};
        
        alerts.forEach(alert => {
            alert.threats.forEach(threat => {
                if (!patterns[threat]) {
                    patterns[threat] = { count: 0, ips: new Set(), times: [] };
                }
                patterns[threat].count++;
                patterns[threat].ips.add(alert.ip);
                patterns[threat].times.push(new Date(alert.timestamp));
            });
        });
        
        return Object.entries(patterns).map(([threat, data]) => ({
            threat,
            count: data.count,
            uniqueIps: data.ips.size,
            frequency: this.calculateFrequency(data.times)
        }));
    }

    /**
     * Analyze geographic distribution
     */
    analyzeGeographicDistribution(alerts) {
        // This would require IP geolocation service
        const ipCounts = {};
        
        alerts.forEach(alert => {
            ipCounts[alert.ip] = (ipCounts[alert.ip] || 0) + 1;
        });
        
        return Object.entries(ipCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([ip, count]) => ({ ip, count, country: 'Unknown' }));
    }

    /**
     * Calculate frequency of events
     */
    calculateFrequency(times) {
        if (times.length < 2) return 'low';
        
        const sorted = times.sort((a, b) => a - b);
        const intervals = [];
        
        for (let i = 1; i < sorted.length; i++) {
            intervals.push(sorted[i] - sorted[i-1]);
        }
        
        const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        const minutes = avgInterval / (1000 * 60);
        
        if (minutes < 5) return 'very_high';
        if (minutes < 30) return 'high';
        if (minutes < 120) return 'medium';
        return 'low';
    }
}

// ==================== EXPORTS ====================

module.exports = {
    SecurityReporter,
    REPORTER_CONFIG
};