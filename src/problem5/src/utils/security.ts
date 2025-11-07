/**
 * Security utility functions for input sanitization and validation
 */

/**
 * Sanitize string input to prevent XSS attacks
 * This is an additional layer on top of xss-clean middleware
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Encode special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized.trim();
};

/**
 * Validate and sanitize SQL LIKE pattern input
 * Prevents SQL injection in LIKE queries
 */
export const sanitizeSQLLike = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // Remove SQL wildcards and special characters that could be dangerous
  // Allow alphanumeric, spaces, hyphens, underscores
  return input.replace(/[^a-zA-Z0-9\s\-_]/g, '').trim();
};

/**
 * Validate integer input
 */
export const validateInteger = (value: any, min?: number, max?: number): number | null => {
  const parsed = parseInt(value, 10);
  
  if (isNaN(parsed)) return null;
  if (min !== undefined && parsed < min) return null;
  if (max !== undefined && parsed > max) return null;
  
  return parsed;
};

/**
 * Validate enum value
 */
export const validateEnum = <T extends string>(value: any, allowedValues: T[]): T | null => {
  if (typeof value !== 'string') return null;
  if (!allowedValues.includes(value as T)) return null;
  return value as T;
};

/**
 * Validate date format (YYYY-MM-DD)
 */
export const validateDate = (dateString: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Remove potentially dangerous characters from object keys
 */
export const sanitizeObjectKeys = (obj: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Only allow alphanumeric keys with underscores
    const cleanKey = key.replace(/[^a-zA-Z0-9_]/g, '');
    if (cleanKey) {
      sanitized[cleanKey] = value;
    }
  }
  
  return sanitized;
};

/**
 * Check for common SQL injection patterns
 * This is a defense-in-depth measure; parameterized queries are the primary defense
 */
export const containsSQLInjection = (input: string): boolean => {
  if (typeof input !== 'string') return false;
  
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
    /(--|\#|\/\*|\*\/)/g, // SQL comments
    /('|"|;|\\)/g, // Quotes and semicolons
    /(\bOR\b|\bAND\b).*?=.*?/gi, // OR/AND with equals
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
};

/**
 * Check for common XSS patterns
 */
export const containsXSS = (input: string): boolean => {
  if (typeof input !== 'string') return false;
  
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
};

/**
 * Security check for user input
 * Returns an array of security issues found
 */
export const securityCheck = (input: string): string[] => {
  const issues: string[] = [];
  
  if (containsSQLInjection(input)) {
    issues.push('Potential SQL injection detected');
  }
  
  if (containsXSS(input)) {
    issues.push('Potential XSS attack detected');
  }
  
  return issues;
};
