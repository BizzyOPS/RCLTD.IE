# Security Policy

## Supported Versions

We are committed to maintaining the security of our website. The following versions are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability within this project, please report it responsibly.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report security issues by emailing:

**Email:** info@rcltd.ie

Please include the following information in your report:

- Type of vulnerability
- Full path of the source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability, including how an attacker might exploit it

### What to Expect

- **Acknowledgment:** We will acknowledge receipt of your vulnerability report within 48 hours.
- **Assessment:** We will investigate and assess the severity of the reported vulnerability.
- **Updates:** We will keep you informed of our progress as we work on a fix.
- **Resolution:** Once resolved, we will notify you and publicly disclose the vulnerability (with credit to you, if desired).

## Security Considerations

This is a static website project with the following security measures in place:

### Input Validation & Sanitization
- All form inputs are validated both client-side and server-side
- XSS prevention through input sanitization
- CSRF protection on form submissions

### Data Protection
- No sensitive user data is stored client-side
- Secure handling of contact form submissions
- Email communications encrypted in transit

### Dependencies
- Regular security audits of npm packages
- Automated vulnerability scanning
- Timely updates of third-party libraries

### Best Practices
- Content Security Policy (CSP) headers recommended for deployment
- HTTPS enforcement recommended for production
- Regular security reviews and updates

## Disclosure Policy

- Security vulnerabilities will be disclosed publicly only after a fix has been released
- Credit will be given to security researchers who responsibly disclose vulnerabilities (unless anonymity is requested)
- We aim to release security patches within 30 days of confirmed vulnerability reports

## Contact

For general security questions or concerns:

**Email:** info@rcltd.ie  
**Website:** [Contact Form](https://www.rcltd.ie/contact.html)

---

**Robotics & Control Ltd**  
Professional Automation & Control Solutions  
Ireland
