import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { securityCheck } from '../utils/security';

// Custom Joi validator for security checks
const secureString = (value: string, helpers: Joi.CustomHelpers) => {
  const issues = securityCheck(value);
  
  if (issues.length > 0) {
    return helpers.error('string.security', { issues });
  }
  
  return value;
};

// Validation schemas with security checks
export const createResourceSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .custom(secureString)
    .required()
    .messages({
      'string.min': 'Name must be at least 3 characters long',
      'string.max': 'Name must not exceed 100 characters',
      'any.required': 'Name is required',
      'string.security': 'Name contains potentially dangerous content'
    }),
  description: Joi.string()
    .min(10)
    .max(500)
    .custom(secureString)
    .required()
    .messages({
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description must not exceed 500 characters',
      'any.required': 'Description is required',
      'string.security': 'Description contains potentially dangerous content'
    }),
  category: Joi.string()
    .min(3)
    .max(50)
    .pattern(/^[a-zA-Z0-9\s\-_]+$/)
    .required()
    .messages({
      'string.min': 'Category must be at least 3 characters long',
      'string.max': 'Category must not exceed 50 characters',
      'string.pattern.base': 'Category can only contain letters, numbers, spaces, hyphens and underscores',
      'any.required': 'Category is required'
    }),
  status: Joi.string()
    .valid('active', 'inactive', 'archived')
    .default('active')
    .messages({
      'any.only': 'Status must be one of: active, inactive, archived'
    })
});

export const updateResourceSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .custom(secureString)
    .optional()
    .messages({
      'string.min': 'Name must be at least 3 characters long',
      'string.max': 'Name must not exceed 100 characters',
      'string.security': 'Name contains potentially dangerous content'
    }),
  description: Joi.string()
    .min(10)
    .max(500)
    .custom(secureString)
    .optional()
    .messages({
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description must not exceed 500 characters',
      'string.security': 'Description contains potentially dangerous content'
    }),
  category: Joi.string()
    .min(3)
    .max(50)
    .pattern(/^[a-zA-Z0-9\s\-_]+$/)
    .optional()
    .messages({
      'string.min': 'Category must be at least 3 characters long',
      'string.max': 'Category must not exceed 50 characters',
      'string.pattern.base': 'Category can only contain letters, numbers, spaces, hyphens and underscores'
    }),
  status: Joi.string()
    .valid('active', 'inactive', 'archived')
    .optional()
    .messages({
      'any.only': 'Status must be one of: active, inactive, archived'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Validation middleware factory
export const validate = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
      return;
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};
