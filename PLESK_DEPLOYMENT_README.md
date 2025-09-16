# Robotics & Control Ltd - Plesk Deployment Guide

## 🔒 Security Status: DEPLOYMENT READY
All sensitive files have been removed for secure production deployment.

## 📁 Deployment File Structure

### Files to Upload to Plesk:
```
/public_html/
├── css/
│   ├── style.css
│   ├── variables.css
│   └── validation.css
├── images/
│   ├── favicon.png
│   ├── logo.png
│   ├── hero-*.png (5 files)
│   └── *.png (other images)
├── js/
│   ├── app.js
│   ├── chatbot.js
│   ├── checkout.js
│   ├── store.js
│   ├── tooltips.js
│   ├── training.js
│   └── validation-client.js
├── videos/
│   ├── loading-animation.mp4
│   ├── robot-automation.mp4
│   └── robotics-machine.mp4
├── *.html (17 pages)
├── contact-form.php
└── package.json (optional, for future maintenance)
```

### Files NOT to Upload (Security Sensitive):
- ❌ security-data/ (REMOVED)
- ❌ security-logs/ (REMOVED) 
- ❌ security-reports/ (REMOVED)
- ❌ lib/ security modules (REMOVED)
- ❌ attached_assets/ development files (REMOVED)
- ❌ *.md security documentation (REMOVED)
- ❌ server.js development server (REMOVED)

## 📧 Email Configuration for Plesk

### 1. Email Account Setup
In Plesk Control Panel:
1. Go to **Mail** → **Email Addresses**
2. Create/verify: `info@rcltd.ie`
3. Set a strong password
4. Enable **Authentication required for SMTP**

### 2. SMTP Settings
Default Plesk SMTP configuration:
- **Host**: `localhost` (or your domain)
- **Port**: `587` (TLS) or `465` (SSL)
- **Security**: `STARTTLS` or `SSL/TLS`
- **Username**: `info@rcltd.ie`
- **Password**: [Set in email account]

### 3. PHP Mail Configuration
The `contact-form.php` file uses PHP's built-in `mail()` function, which works automatically with Plesk's mail server.

**No additional configuration needed** - Plesk handles SMTP authentication internally.

### 4. Email Testing
Test the contact form by:
1. Submitting a test message
2. Check email delivery to `info@rcltd.ie`
3. Verify mail logs in Plesk if issues occur

## 🛡️ Security Features Implemented

### Contact Form Security:
- ✅ Input sanitization and validation
- ✅ Rate limiting (1 submission per minute per IP)
- ✅ CSRF protection headers
- ✅ XSS protection headers
- ✅ Email validation
- ✅ Required field validation

### File Security:
- ✅ All sensitive data files removed
- ✅ No exposed configuration files
- ✅ No development/testing files in production
- ✅ Clean directory structure

## 🚀 Deployment Steps

### 1. Upload Files
Upload only the approved files listed above to your Plesk file manager.

### 2. Set Permissions
Ensure proper file permissions:
- HTML/CSS/JS files: `644`
- PHP files: `644`
- Directories: `755`

### 3. Test Email Functionality
1. Submit test contact form
2. Verify email delivery
3. Check Plesk mail logs if needed

### 4. DNS/SSL Setup
- Ensure SSL certificate is installed
- Verify domain DNS points to Plesk server
- Enable HTTPS redirects in Plesk

## 📞 Support Information

**Company**: Robotics & Control Ltd  
**Email**: info@rcltd.ie  
**Phone**: +353 (0) 52 7443258  
**Address**: Unit 2 Cahir Business Park, Cahir, Co. Tipperary, Ireland, E21 C564

## 🔧 Troubleshooting

### Email Not Working:
1. Check Plesk mail logs: **Tools & Settings** → **Logs** → **Mail Log**
2. Verify SMTP authentication is enabled
3. Check firewall settings for SMTP ports
4. Test with Plesk webmail

### Contact Form Issues:
1. Check PHP error logs in Plesk
2. Verify file permissions on `contact-form.php`
3. Test PHP mail() function with simple script

### Performance:
- Enable Gzip compression in Plesk
- Use Plesk caching features
- Optimize images if needed