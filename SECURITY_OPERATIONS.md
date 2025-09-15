# Security Operations Guide
## Robotics & Control Ltd - Production Security Monitoring

### Overview

This document provides comprehensive guidance for operating and maintaining the security monitoring system in production. The system includes automated vulnerability scanning, real-time threat monitoring, performance tracking, and comprehensive reporting.

## System Architecture

### Core Components

1. **Vulnerability Scanner (`lib/vulnerability-scanner.js`)**
   - Automated dependency vulnerability scanning
   - Multiple scanning tools integration (npm audit, better-npm-audit, audit-ci)
   - Scheduled daily scans at 2:00 AM Irish time
   - Configurable severity thresholds and reporting

2. **Security Monitor (`lib/security-monitor.js`)**
   - Real-time request monitoring and threat detection
   - IP-based attack pattern recognition
   - Rate limiting and suspicious activity tracking
   - Automated alerting and response capabilities

3. **Security Reporter (`lib/security-reporter.js`)**
   - Weekly comprehensive security reports
   - Performance metrics aggregation
   - Dashboard generation and maintenance
   - Historical data tracking and analysis

4. **Job Tracking System**
   - Enhanced cron job monitoring with unique job IDs
   - Performance metrics collection
   - Job execution verification and reporting
   - Historical job execution tracking

## Production Configuration

### Environment Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=5000

# Security Configuration
SECURITY_EMAIL_ALERTS=admin@roboticscontrol.ie
SLACK_WEBHOOK_URL=https://hooks.slack.com/...

# Database Configuration
DATABASE_URL=postgresql://...
PGPORT=5432
PGUSER=...
PGPASSWORD=...
PGDATABASE=...
PGHOST=...
```

### Critical Configuration Files

1. **audit-ci.json** - CI/CD vulnerability gating
   - Critical vulnerabilities: 0 allowed (builds fail)
   - High vulnerabilities: 2 maximum allowed
   - Moderate vulnerabilities: 5 maximum allowed
   - Low vulnerabilities: 20 maximum allowed

2. **package.json** - Security scripts and automation
   - `npm run security:ci:gate` - CI/CD build gating
   - `npm run security:scan` - Local development scanning
   - `npm run security:test:performance` - Performance validation

## Scheduled Operations

### Automated Tasks

1. **Daily Vulnerability Scan (2:00 AM Irish Time)**
   - Full dependency vulnerability assessment
   - Multi-tool scanning approach for comprehensive coverage
   - Automatic report generation and alerting
   - Job tracking with unique IDs for monitoring

2. **Weekly Security Report (Sunday 3:00 AM Irish Time)**
   - Comprehensive security posture assessment
   - Performance metrics analysis
   - Trend analysis and recommendations
   - Dashboard update and distribution

3. **Daily Log Cleanup (1:00 AM Irish Time)**
   - Automated cleanup of old security logs (30-day retention)
   - Memory and disk space management
   - Historical data archival

4. **Hourly Health Checks**
   - Job execution status monitoring
   - Performance metrics collection
   - Stuck job detection and alerting
   - System health assessment

### Manual Operations

#### Security Endpoint Management

**Job Status Monitoring:**
```bash
curl -s http://localhost:5000/api/security/jobs/status | json_pp
```

**IP Address Blocking:**
```bash
# Block an IP address
curl -X POST http://localhost:5000/api/security/ip/block \
  -H "Content-Type: application/json" \
  -d '{"ip":"192.168.1.100","action":"block","reason":"Malicious activity detected"}'

# Unblock an IP address
curl -X POST http://localhost:5000/api/security/ip/block \
  -H "Content-Type: application/json" \
  -d '{"ip":"192.168.1.100","action":"unblock"}'
```

#### Performance Testing

**Run Comprehensive Load Testing:**
```bash
npm run security:test:load
```

**Run Specific Scenario:**
```bash
node load-test.js light
node load-test.js moderate
node load-test.js heavy
```

**Test Security Endpoints:**
```bash
node load-test.js security
```

## Monitoring and Alerting

### Key Metrics to Monitor

1. **System Performance**
   - Average response time: ≤ 100ms
   - 95th percentile response time: ≤ 250ms
   - 99th percentile response time: ≤ 500ms
   - Error rate: ≤ 1%
   - Memory usage increase: ≤ 50MB during load

2. **Security Metrics**
   - Vulnerability scan results (critical/high priority)
   - Suspicious IP activity patterns
   - Rate limiting trigger frequency
   - Failed authentication attempts

3. **Job Execution**
   - Scheduled job completion status
   - Job execution duration trends
   - Failed job frequency and causes
   - Report generation success rates

### Alert Thresholds

**Critical Alerts (Immediate Response Required):**
- Any critical vulnerabilities detected
- System response time > 1 second sustained
- Error rate > 5%
- Scheduled jobs failing consistently
- Memory leaks or excessive resource usage

**Warning Alerts (Review Within 24 Hours):**
- High vulnerability count > threshold
- Performance degradation trends
- Unusual traffic patterns
- Disk space approaching limits

### Alert Channels

1. **Console Logging** (Always Active)
   - All security events logged with timestamps
   - Job execution status and performance metrics
   - Error details and stack traces (development only)

2. **File-based Logging**
   - Security events: `./security-logs/security-YYYY-MM-DD.log`
   - Alert history: `./security-logs/alerts/alerts-YYYY-MM-DD.json`
   - Metrics data: `./security-logs/metrics/`

3. **External Alerting** (Configure as needed)
   - Slack webhook integration
   - Email notifications for critical events
   - Third-party monitoring service integration

## Troubleshooting Guide

### Common Issues and Solutions

1. **Scheduled Jobs Not Running**
   - Check server uptime and cron configuration
   - Verify timezone settings (Europe/Dublin)
   - Check job status endpoint: `/api/security/jobs/status`
   - Review console logs for job execution messages

2. **High Memory Usage**
   - Monitor performance metrics collection frequency
   - Check for stuck jobs in job status
   - Review log retention settings and cleanup schedules
   - Consider reducing monitoring sampling rates

3. **Performance Degradation**
   - Run load testing: `npm run security:test:load`
   - Check database connection performance
   - Review security middleware overhead
   - Monitor concurrent request patterns

4. **CI/CD Build Failures**
   - Review vulnerability scan results: `npm run security:scan`
   - Check audit-ci configuration in `audit-ci.json`
   - Verify dependency update requirements
   - Consider threshold adjustments for non-critical issues

### Log Analysis

**View Recent Security Events:**
```bash
tail -f security-logs/security-$(date +%Y-%m-%d).log
```

**Search for Specific Issues:**
```bash
grep "ERROR\|WARN\|ALERT" security-logs/*.log
grep "JOB FAILED" security-logs/*.log
grep "STUCK JOB" security-logs/*.log
```

**Performance Analysis:**
```bash
grep "PERFORMANCE" security-logs/*.log | tail -20
```

## Maintenance Procedures

### Regular Maintenance (Weekly)

1. **Review Security Reports**
   - Check weekly security report dashboard
   - Review vulnerability trends and patterns
   - Assess performance metrics and degradation
   - Update security thresholds if needed

2. **System Health Check**
   - Verify all scheduled jobs are completing successfully
   - Check disk space usage and log retention
   - Review error logs for recurring issues
   - Test alert mechanisms and notifications

3. **Performance Optimization**
   - Run comprehensive load testing
   - Review and tune performance thresholds
   - Monitor memory usage patterns
   - Optimize monitoring configuration for production load

### Monthly Maintenance

1. **Dependency Updates**
   - Review and apply security updates
   - Run full vulnerability scan after updates
   - Test CI/CD pipeline with updated dependencies
   - Update vulnerability thresholds if needed

2. **Configuration Review**
   - Review and update security monitoring thresholds
   - Assess rate limiting configuration effectiveness
   - Update IP blocklists and security patterns
   - Review and rotate any security keys or tokens

3. **Capacity Planning**
   - Analyze resource usage trends
   - Review log storage requirements
   - Assess monitoring data retention needs
   - Plan for scaling security infrastructure

## Security Best Practices

### Operational Security

1. **Access Control**
   - Limit access to security endpoints
   - Use strong authentication for administrative functions
   - Regularly review and rotate access credentials
   - Monitor administrative activity logs

2. **Data Protection**
   - Encrypt sensitive security data at rest
   - Use secure channels for alert notifications
   - Implement proper log rotation and archival
   - Ensure compliance with data retention policies

3. **Incident Response**
   - Maintain incident response procedures
   - Document security event escalation paths
   - Test incident response processes regularly
   - Keep security contact information current

### Performance Optimization

1. **Monitoring Efficiency**
   - Configure appropriate sampling rates for production
   - Use efficient data structures for metrics collection
   - Implement proper memory management for long-running processes
   - Balance monitoring detail with system performance

2. **Resource Management**
   - Monitor and limit log file sizes
   - Implement efficient data cleanup procedures
   - Use connection pooling for database operations
   - Optimize cron job scheduling to avoid resource conflicts

## Emergency Procedures

### Security Incident Response

1. **Immediate Response (0-15 minutes)**
   - Identify and assess the security incident
   - Block malicious IP addresses if identified
   - Check for ongoing attacks or suspicious patterns
   - Document initial findings and timestamp

2. **Containment (15-60 minutes)**
   - Implement temporary security measures
   - Increase monitoring sensitivity if needed
   - Notify security team and stakeholders
   - Begin detailed incident investigation

3. **Recovery (1-24 hours)**
   - Implement permanent security fixes
   - Update security configurations as needed
   - Conduct post-incident analysis
   - Update security procedures based on learnings

### System Recovery

1. **Service Restoration**
   - Restart security monitoring services
   - Verify all scheduled jobs are running
   - Check database connectivity and performance
   - Validate all security endpoints are responsive

2. **Data Recovery**
   - Restore security logs from backups if needed
   - Verify integrity of security monitoring data
   - Reconstruct missing metrics if possible
   - Update alerting systems with recovery status

## Contact Information

**Security Team:**
- Primary Contact: security@roboticscontrol.ie
- Emergency Contact: +353 XXX XXXX XXXX
- Incident Response: incident@roboticscontrol.ie

**System Administration:**
- Technical Support: support@roboticscontrol.ie
- System Monitoring: monitoring@roboticscontrol.ie

## Appendix

### Configuration File Locations
- Main server configuration: `server.js`
- Vulnerability scanner: `lib/vulnerability-scanner.js`
- Security monitor: `lib/security-monitor.js`
- Security reporter: `lib/security-reporter.js`
- Load testing: `load-test.js`
- CI configuration: `audit-ci.json`
- Package scripts: `package.json`

### Log File Locations
- Security logs: `./security-logs/security-YYYY-MM-DD.log`
- Alert logs: `./security-logs/alerts/alerts-YYYY-MM-DD.json`
- Metrics data: `./security-logs/metrics/`
- Reports: `./security-reports/`
- Performance reports: `./security-reports/performance-test-*.json`

### API Endpoints
- Job status: `GET /api/security/jobs/status`
- IP management: `POST /api/security/ip/block`
- Health check: `GET /api/health` (if implemented)
- Metrics: `GET /api/security/metrics` (if implemented)

### Useful Commands
```bash
# Start server
npm start

# Development mode
npm run dev

# Production mode
npm run prod

# Run security scan
npm run security:scan

# CI/CD gate check
npm run security:ci:gate

# Performance test
npm run security:test:load

# System status
npm run security:status
```

---

*Last Updated: September 15, 2025*  
*Version: 1.0*  
*Document Owner: Security Operations Team*