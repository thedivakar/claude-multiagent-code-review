---
description: Security-focused code review guidance covering OWASP Top 10, secure coding practices, and common security mistakes
---

# Security Analysis

Use this skill when reviewing code for security vulnerabilities and unsafe practices.

## OWASP Top 10 Areas

Check for common vulnerabilities including:

- Broken access control
- Cryptographic failures
- Injection vulnerabilities
- Insecure design
- Security misconfiguration
- Vulnerable or outdated dependencies
- Authentication and identification failures
- Software and data integrity failures
- Logging and monitoring failures
- Server-side request forgery (SSRF)

## Secure Coding Practices

Look for:

- Proper input validation
- Output encoding where required
- Parameterized database queries
- Safe handling of authentication and authorization
- Secure password handling
- Secure management of secrets and credentials
- Appropriate error handling
- Safe file and path handling
- HTTPS/TLS for sensitive communication
- Principle of least privilege
- Secure dependency usage

## Secrets and Sensitive Data

Flag:

- Hardcoded API keys
- Hardcoded passwords
- Access tokens
- Private keys
- Credentials in source code
- Sensitive information written to logs
- Secrets committed to repositories

Recommend environment variables or secure secret-management mechanisms instead.

## Injection Risks

Check for:

- SQL injection
- Command injection
- Cross-site scripting (XSS)
- LDAP injection
- Template injection
- Unsafe dynamic evaluation
- Untrusted data passed directly to interpreters

## Common Security Mistakes

Look for:

- Missing authorization checks
- Trusting client-side validation
- Excessive permissions
- Insecure defaults
- Exposing sensitive error details
- Unsafe deserialization
- Weak cryptographic algorithms
- Missing rate limiting on sensitive operations
- Insecure CORS configuration
- Missing security headers where applicable

## Review Severity

- **Critical:** Vulnerability can lead to severe compromise, data exposure, or unauthorized access.
- **High:** Significant exploitable security vulnerability.
- **Medium:** Security weakness that should be addressed.
- **Low:** Minor hardening or defense-in-depth improvement.

## Output

For each security issue, provide:

- File and line number
- Severity
- Vulnerability category
- Description
- Security impact
- Recommended remediation