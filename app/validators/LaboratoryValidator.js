import Joi from 'joi';

class LaboratoryValidator {
  
  /**
   * Schema for laboratory registration
   */
  static registerSchema = Joi.object({
    name: Joi.string()
      .trim()
      .min(3)
      .max(200)
      .required()
      .messages({
        'string.min': 'Laboratory name must be at least 3 characters',
        'string.max': 'Laboratory name cannot exceed 200 characters',
        'any.required': 'Laboratory name is required'
      }),
    
    licenseNumber: Joi.string()
      .trim()
      .min(5)
      .max(100)
      .required()
      .messages({
        'string.min': 'License number must be at least 5 characters',
        'string.max': 'License number cannot exceed 100 characters',
        'any.required': 'License number is required'
      }),
    
    address: Joi.string()
      .trim()
      .min(10)
      .max(500)
      .required()
      .messages({
        'string.min': 'Address must be at least 10 characters',
        'string.max': 'Address cannot exceed 500 characters',
        'any.required': 'Address is required'
      }),
    
    phone: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required()
      .messages({
        'string.pattern.base': 'Phone number must be 10 digits',
        'any.required': 'Phone number is required'
      }),
    
    email: Joi.string()
      .email()
      .lowercase()
      .trim()
      .allow('', null)
      .messages({
        'string.email': 'Please provide a valid email address'
      }),

    emergencyPhone: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .allow('', null)
      .messages({
        'string.pattern.base': 'Emergency phone must be 10 digits'
      }),

    specializations: Joi.array()
      .items(Joi.string().max(100))
      .default([])
      .messages({
        'array.base': 'Specializations must be an array'
      }),

    workingHours: Joi.object({
      monday: Joi.object({
        open: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        close: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        isClosed: Joi.boolean().default(false)
      }),
      tuesday: Joi.object({
        open: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        close: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        isClosed: Joi.boolean().default(false)
      }),
      wednesday: Joi.object({
        open: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        close: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        isClosed: Joi.boolean().default(false)
      }),
      thursday: Joi.object({
        open: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        close: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        isClosed: Joi.boolean().default(false)
      }),
      friday: Joi.object({
        open: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        close: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        isClosed: Joi.boolean().default(false)
      }),
      saturday: Joi.object({
        open: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        close: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        isClosed: Joi.boolean().default(false)
      }),
      sunday: Joi.object({
        open: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        close: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        isClosed: Joi.boolean().default(false)
      })
    }).optional(),

    is24Hours: Joi.boolean()
      .default(false),

    status: Joi.string()
      .valid('active', 'suspended', 'inactive')
      .default('active')
  });


  /**
   * Schema for laboratory update
   */
  static updateSchema = Joi.object({
    name: Joi.string()
      .trim()
      .min(3)
      .max(200)
      .messages({
        'string.min': 'Laboratory name must be at least 3 characters',
        'string.max': 'Laboratory name cannot exceed 200 characters'
      }),
    
    address: Joi.string()
      .trim()
      .min(10)
      .max(500)
      .messages({
        'string.min': 'Address must be at least 10 characters',
        'string.max': 'Address cannot exceed 500 characters'
      }),
    
    phone: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .messages({
        'string.pattern.base': 'Phone number must be 10 digits'
      }),
    
    email: Joi.string()
      .email()
      .lowercase()
      .trim()
      .allow('', null)
      .messages({
        'string.email': 'Please provide a valid email address'
      }),

    emergencyPhone: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .allow('', null)
      .messages({
        'string.pattern.base': 'Emergency phone must be 10 digits'
      }),

    specializations: Joi.array()
      .items(Joi.string().max(100))
      .messages({
        'array.base': 'Specializations must be an array'
      }),

    workingHours: Joi.object({
      monday: Joi.object({
        open: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        close: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        isClosed: Joi.boolean()
      }),
      tuesday: Joi.object({
        open: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        close: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        isClosed: Joi.boolean()
      }),
      wednesday: Joi.object({
        open: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        close: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        isClosed: Joi.boolean()
      }),
      thursday: Joi.object({
        open: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        close: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        isClosed: Joi.boolean()
      }),
      friday: Joi.object({
        open: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        close: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        isClosed: Joi.boolean()
      }),
      saturday: Joi.object({
        open: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        close: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        isClosed: Joi.boolean()
      }),
      sunday: Joi.object({
        open: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        close: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        isClosed: Joi.boolean()
      })
    }),

    is24Hours: Joi.boolean(),

    status: Joi.string()
      .valid('active', 'suspended', 'inactive')
  }).min(1);


  /**
   * Schema for suspension
   */
  static suspensionSchema = Joi.object({
    reason: Joi.string()
      .max(500)
      .required()
      .messages({
        'string.max': 'Reason cannot exceed 500 characters',
        'any.required': 'Suspension reason is required'
      })
  });


  /**
   * Validate laboratory registration
   */
  static validateRegister(data) {
    const { error, value } = this.registerSchema.validate(data, {
      abortEarly: false
    });
    
    if (error) {
      return { 
        valid: false, 
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      };
    }
    
    return { valid: true, errors: [], data: value };
  }


  /**
   * Validate laboratory update
   */
  static validateUpdate(data) {
    const { error, value } = this.updateSchema.validate(data, {
      abortEarly: false
    });
    
    if (error) {
      return { 
        valid: false, 
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      };
    }
    
    return { valid: true, errors: [], data: value };
  }


  /**
   * Validate suspension reason
   */
  static validateSuspension(data) {
    const { error, value } = this.suspensionSchema.validate(data, {
      abortEarly: false
    });
    
    if (error) {
      return { 
        valid: false, 
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      };
    }
    
    return { valid: true, errors: [], data: value };
  }
}

export default LaboratoryValidator;
