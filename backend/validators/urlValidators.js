const { body } = require('express-validator');

const createUrlValidator = [
  body('originalUrl')
    .trim()
    .notEmpty().withMessage('URL is required')
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Please provide a valid URL starting with http:// or https://'),
  body('customAlias')
    .optional({ nullable: true })
    .trim()
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Alias can only contain letters, numbers, hyphens and underscores')
    .isLength({ min: 3, max: 30 }).withMessage('Alias must be 3-30 characters'),
  body('title')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('expiryDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Invalid expiry date format')
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('Expiry date must be in the future');
      }
      return true;
    }),
];

const updateUrlValidator = [
  body('originalUrl')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Please provide a valid URL'),
  body('title')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('expiryDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Invalid expiry date format'),
];

module.exports = { createUrlValidator, updateUrlValidator };
