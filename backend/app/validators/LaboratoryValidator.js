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
    
    // Contact information - flat structure that will be transformed
    phone: Joi.string()
      .pattern(/^(\+212|0)[5-7]\d{8}$/)
      .required()
      .messages({
        'string.pattern.base': 'Phone number must be a valid Moroccan phone number (e.g., 0522123456)',
        'any.required': 'Phone number is required'
      }),
    
    email: Joi.string()
      .email()
      .lowercase()
      .trim()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),

    emergencyPhone: Joi.string()
      .pattern(/^(\+212|0)[5-7]\d{8}$/)
      .allow('', null)
      .messages({
        'string.pattern.base': 'Emergency phone must be a valid Moroccan phone number'
      }),

    website: Joi.string()
      .uri()
      .allow('', null)
      .messages({
        'string.uri': 'Website must be a valid URL'
      }),

    // Additional fields
    accreditation: Joi.string()
      .trim()
      .max(100)
      .allow('', null),

    certifications: Joi.array()
      .items(Joi.string().max(100))
      .default([]),

    services: Joi.array()
      .items(Joi.string().max(100))
      .default([]),

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
      .default('active'),

    // Available tests
    availableTests: Joi.array()
      .items(Joi.object({
        testCode: Joi.string().required(),
        testName: Joi.string().required(),
        category: Joi.string().valid('hematology', 'biochemistry', 'microbiology', 'immunology', 'molecular_biology', 'pathology', 'imaging', 'other').required(),
        specimen: Joi.string().valid('blood', 'urine', 'stool', 'sputum', 'tissue', 'swab', 'csf', 'other').optional(),
        turnaroundTime: Joi.number().required(),
        price: Joi.number().required(),
        preparationInstructions: Joi.string().optional()
      }))
      .default([]),

    // Equipment
    equipment: Joi.array()
      .items(Joi.object({
        name: Joi.string().required(),
        manufacturer: Joi.string().optional(),
        model: Joi.string().optional(),
        status: Joi.string().valid('operational', 'maintenance', 'out_of_order').default('operational')
      }))
      .default([]),

    // Coordinates
    coordinates: Joi.object({
      latitude: Joi.number().min(-90).max(90).optional(),
      longitude: Joi.number().min(-180).max(180).optional()
    }).optional(),

    // Turnaround time
    turnaroundTime: Joi.object({
      routine: Joi.string().optional(),
      urgent: Joi.string().optional(),
      stat: Joi.string().optional()
    }).optional()
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
      .pattern(/^(\+212|0)[5-7]\d{8}$/)
      .messages({
        'string.pattern.base': 'Phone number must be a valid Moroccan phone number (e.g., 0522123456)'
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
      .pattern(/^(\+212|0)[5-7]\d{8}$/)
      .allow('', null)
      .messages({
        'string.pattern.base': 'Emergency phone must be a valid Moroccan phone number'
      }),

    services: Joi.array()
      .items(Joi.string().max(100))
      .messages({
        'array.base': 'Services must be an array'
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
