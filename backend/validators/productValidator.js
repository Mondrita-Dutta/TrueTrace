const { body, validationResult } = require('express-validator');

// Middleware to catch and return validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  const extractedErrors = {};
  errors.array().forEach(err => {
    if (!extractedErrors[err.path]) {
      extractedErrors[err.path] = err.msg;
    }
  });

  if (typeof res.error === 'function') {
    return res.error('Validation failed', 400, extractedErrors);
  }
  
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: extractedErrors
  });
};

const productValidationRules = () => {
  return [
    body('productName')
      .trim()
      .notEmpty()
      .withMessage('Product name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Product name must be between 2 and 100 characters'),
      
    body('brandName')
      .trim()
      .notEmpty()
      .withMessage('Brand name is required'),
      
    body('category')
      .trim()
      .notEmpty()
      .withMessage('Category is required'),
      
    body('manufacturerName')
      .trim()
      .notEmpty()
      .withMessage('Manufacturer name is required'),
      
    body('serialNumber')
      .optional() // Might be auto-generated for bulk, but for single create it's required. Let controller handle uniqueness/required if missing.
      .trim(),
      
    body('batchNumber')
      .trim()
      .notEmpty()
      .withMessage('Batch number is required'),
      
    body('manufacturingDate')
      .notEmpty()
      .withMessage('Manufacturing date is required')
      .isISO8601()
      .withMessage('Invalid date format')
      .custom((value) => {
        if (new Date(value) > new Date()) {
          throw new Error('Manufacturing date cannot be in the future');
        }
        return true;
      }),
      
    body('expiryDate')
      .optional({ checkFalsy: true })
      .isISO8601()
      .withMessage('Invalid date format')
      .custom((value, { req }) => {
        if (value && req.body.manufacturingDate && new Date(value) < new Date(req.body.manufacturingDate)) {
          throw new Error('Expiry date cannot be before manufacturing date');
        }
        return true;
      })
  ];
};

module.exports = {
  productValidationRules,
  validate
};
