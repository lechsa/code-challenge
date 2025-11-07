# Security Implementation

This document outlines the security measures implemented in the CRUD API to protect against common vulnerabilities.

## Security Layers

### 1. HTTP Security Headers (Helmet)

**Protection:** Various HTTP-based attacks

**Implementation:**
- Content Security Policy (CSP)
- Strict Transport Security (HSTS)
- X-Frame-Options (Clickjacking protection)
- X-Content-Type-Options (MIME sniffing protection)
- X-XSS-Protection

**Location:** `server.ts`

### 2. SQL Injection Prevention

**Protection:** SQL injection attacks

**Implementation:**
- **Parameterized Queries:** All database queries use prepared statements with parameter binding
- **Never concatenate user input into SQL queries**
- Additional validation layer to detect suspicious patterns

**Example:**
```typescript
// ✅ SAFE - Parameterized query
const stmt = this.db.prepare('SELECT * FROM resources WHERE id = ?');
stmt.get(id);

// ❌ DANGEROUS - String concatenation (NOT USED)
// const query = `SELECT * FROM resources WHERE id = ${id}`;
```

**Location:** `services/resource.service.ts`, `utils/security.ts`

### 3. Cross-Site Scripting (XSS) Prevention

**Protection:** XSS attacks

**Implementation:**
- **xss-clean middleware:** Sanitizes user input in request body, query params, and URL params
- **Content Security Policy:** Restricts sources of executable scripts
- **Custom validation:** Detects and blocks XSS patterns in input
- **Input sanitization:** HTML tags and dangerous characters are removed

**Location:** `server.ts`, `middleware/validation.ts`, `utils/security.ts`

### 4. NoSQL Injection Prevention

**Protection:** NoSQL injection attacks

**Implementation:**
- **express-mongo-sanitize:** Removes `$` and `.` from user input to prevent operator injection
- Works even though we use SQLite (defense in depth)

**Location:** `server.ts`

### 5. HTTP Parameter Pollution (HPP)

**Protection:** Parameter pollution attacks

**Implementation:**
- Prevents duplicate parameters from being processed
- Whitelist for allowed duplicate parameters (filters)

**Location:** `server.ts`

### 6. Rate Limiting

**Protection:** Brute force, DoS attacks, API abuse

**Implementation:**
- 100 requests per 15 minutes per IP address
- Applied to all API routes
- Returns 429 status code when limit exceeded

**Configuration:**
```typescript
windowMs: 15 * 60 * 1000, // 15 minutes
max: 100 // 100 requests per window
```

**Location:** `server.ts`

### 7. Input Validation (Joi)

**Protection:** Invalid data, injection attacks, business logic errors

**Implementation:**
- Schema-based validation for all inputs
- Length constraints (min/max)
- Pattern matching for allowed characters
- Custom security validators
- Enum validation for status field
- Unknown field stripping

**Validation Rules:**
- **Name:** 3-100 chars, security check for dangerous patterns
- **Description:** 10-500 chars, security check for dangerous patterns
- **Category:** 3-50 chars, alphanumeric with spaces, hyphens, underscores only
- **Status:** Must be 'active', 'inactive', or 'archived'

**Location:** `middleware/validation.ts`

### 8. CORS Configuration

**Protection:** Unauthorized cross-origin requests

**Implementation:**
- Configurable allowed origins via environment variable
- Specific allowed methods (GET, POST, PUT, DELETE)
- Specific allowed headers
- Credentials support with origin restriction

**Location:** `server.ts`

### 9. Request Size Limits

**Protection:** DoS via large payloads

**Implementation:**
- JSON body limit: 10kb
- URL-encoded body limit: 10kb

**Location:** `server.ts`

### 10. Error Information Leakage Prevention

**Protection:** Information disclosure

**Implementation:**
- Centralized error handling
- Generic error messages for production
- Stack traces only in development mode
- Structured error responses without sensitive details

**Location:** `middleware/errorHandler.ts`

## Security Utilities

The `utils/security.ts` file provides additional security functions:

### Functions:

1. **sanitizeString(input)** - Remove HTML tags and encode special characters
2. **sanitizeSQLLike(input)** - Sanitize LIKE patterns in SQL queries
3. **validateInteger(value, min, max)** - Validate and bound integer inputs
4. **validateEnum(value, allowed)** - Ensure value is in allowed list
5. **validateDate(dateString)** - Validate date format (YYYY-MM-DD)
6. **containsSQLInjection(input)** - Detect SQL injection patterns
7. **containsXSS(input)** - Detect XSS attack patterns
8. **securityCheck(input)** - Combined security validation

## Testing Security

### SQL Injection Tests

```bash
# Attempt SQL injection in query parameter
curl "http://localhost:3400/api/resources?name='; DROP TABLE resources; --"

# Attempt SQL injection in search
curl "http://localhost:3400/api/resources?search=1' OR '1'='1"
```

**Expected:** Query is safely handled via parameterized statements

### XSS Tests

```bash
# Attempt XSS in resource creation
curl -X POST http://localhost:3400/api/resources \
  -H "Content-Type: application/json" \
  -d '{"name":"<script>alert(\"XSS\")</script>","description":"XSS test content","category":"test"}'

# Attempt XSS in query parameter
curl "http://localhost:3400/api/resources?search=<script>alert('xss')</script>"
```

**Expected:** Input is sanitized or rejected

### Rate Limiting Test

```bash
# Make 101 requests quickly
for i in {1..101}; do
  curl http://localhost:3400/api/resources
done
```

**Expected:** 101st request returns 429 Too Many Requests

## Security Best Practices Followed

1. ✅ **Principle of Least Privilege** - Only necessary permissions
2. ✅ **Defense in Depth** - Multiple layers of security
3. ✅ **Input Validation** - Never trust user input
4. ✅ **Output Encoding** - Encode data for safe display
5. ✅ **Parameterized Queries** - Prevent SQL injection
6. ✅ **Security Headers** - Protect against common attacks
7. ✅ **Rate Limiting** - Prevent abuse
8. ✅ **Error Handling** - Don't leak sensitive information
9. ✅ **Dependency Security** - Use maintained packages
10. ✅ **HTTPS Ready** - HSTS headers configured

## Environment Variables for Security

Create a `.env` file:

```env
# Server configuration
PORT=3400
NODE_ENV=production

# CORS configuration
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Database
DATABASE_PATH=./database.sqlite
```

## Production Deployment Checklist

- [ ] Enable HTTPS/TLS
- [ ] Set `NODE_ENV=production`
- [ ] Configure `ALLOWED_ORIGINS` with actual domain(s)
- [ ] Use strong authentication (JWT/OAuth) if needed
- [ ] Enable database backups
- [ ] Set up monitoring and logging
- [ ] Regular security updates for dependencies
- [ ] Implement audit logging for sensitive operations
- [ ] Consider adding authentication middleware
- [ ] Consider adding request signing for API calls
- [ ] Set up WAF (Web Application Firewall) if available
- [ ] Regular security audits

## OWASP Top 10 Coverage

| Risk | Protected | Implementation |
|------|-----------|----------------|
| A01:2021 - Broken Access Control | ⚠️ Partial | Rate limiting, validation (add auth for full protection) |
| A02:2021 - Cryptographic Failures | ✅ Yes | HSTS, secure headers |
| A03:2021 - Injection | ✅ Yes | Parameterized queries, input validation, sanitization |
| A04:2021 - Insecure Design | ✅ Yes | Secure architecture, validation, error handling |
| A05:2021 - Security Misconfiguration | ✅ Yes | Security headers, CORS, proper error handling |
| A06:2021 - Vulnerable Components | ✅ Yes | Regular updates, no known vulnerabilities |
| A07:2021 - Authentication Failures | ⚠️ N/A | No authentication required (add if needed) |
| A08:2021 - Software & Data Integrity | ✅ Yes | Input validation, Joi schemas |
| A09:2021 - Logging Failures | ⚠️ Partial | Basic logging (enhance for production) |
| A10:2021 - SSRF | ✅ Yes | No external requests from user input |

## Additional Recommendations

### For Production:

1. **Add Authentication:** Implement JWT or session-based auth
2. **Add Authorization:** Role-based access control (RBAC)
3. **API Keys:** For programmatic access
4. **Audit Logging:** Log all mutations (create, update, delete)
5. **Database Encryption:** Encrypt sensitive data at rest
6. **Secrets Management:** Use environment variables or secret managers
7. **HTTPS Only:** Enforce TLS in production
8. **Security Monitoring:** Set up alerts for suspicious activity
9. **Regular Audits:** Run `npm audit` and update dependencies
10. **Penetration Testing:** Regular security assessments

### Monitoring Commands:

```bash
# Check for vulnerabilities in dependencies
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Update dependencies
npm update

# Check outdated packages
npm outdated
```

## Incident Response

If a security issue is discovered:

1. Assess the impact and severity
2. Patch the vulnerability immediately
3. Review logs for exploitation attempts
4. Notify affected users if data was compromised
5. Update security documentation
6. Conduct post-mortem analysis

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
