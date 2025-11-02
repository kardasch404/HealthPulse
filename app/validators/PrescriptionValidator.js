import Joi from 'joi';

class PrescriptionValidator {
  
  /**
   * Schema for creating a prescription
   */
  static createSchema = Joi.object({
    consultationId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid consultation ID format',
        'any.required': 'Consultation ID is required'
      }),
    
    patientId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid patient ID format',
        'any.required': 'Patient ID is required'
      }),
    
    doctorId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Invalid doctor ID format'
      }),
    
    medications: Joi.array()
      .items(Joi.object({
        name: Joi.string().max(200).required(),
        dosage: Joi.string().max(100).required(),
        frequency: Joi.string().max(100).required(),
        duration: Joi.string().max(100).required(),
        instructions: Joi.string().max(500).allow('', null)
      }))
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one medication is required',
        'any.required': 'Medications are required'
      }),
    
    notes: Joi.string()
      .max(1000)
      .allow('', null)
      .messages({
        'string.max': 'Notes cannot exceed 1000 characters'
      }),

    pharmacyId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .allow(null)
      .messages({
        'string.pattern.base': 'Invalid pharmacy ID format'
      }),

    status: Joi.string()
      .valid('draft', 'signed', 'dispensed', 'completed', 'cancelled')
      .default('draft')
  });


  /**
   * Schema for adding medication
   */
  static medicationSchema = Joi.object({
    name: Joi.string()
      .max(200)
      .required()
      .messages({
        'string.max': 'Medication name cannot exceed 200 characters',
        'any.required': 'Medication name is required'
      }),
    
    dosage: Joi.string()
      .max(100)
      .required()
      .messages({
        'string.max': 'Dosage cannot exceed 100 characters',
        'any.required': 'Dosage is required'
      }),
    
    frequency: Joi.string()
      .max(100)
      .required()
      .messages({
        'string.max': 'Frequency cannot exceed 100 characters',
        'any.required': 'Frequency is required'
      }),
    
    duration: Joi.string()
      .max(100)
      .required()
      .messages({
        'string.max': 'Duration cannot exceed 100 characters',
        'any.required': 'Duration is required'
      }),
    
    instructions: Joi.string()
      .max(500)
      .allow('', null)
      .messages({
        'string.max': 'Instructions cannot exceed 500 characters'
      })
  });


  /**
   * Schema for updating prescription
   */
  static updateSchema = Joi.object({
    medications: Joi.array()
      .items(Joi.object({
        name: Joi.string().max(200).required(),
        dosage: Joi.string().max(100).required(),
        frequency: Joi.string().max(100).required(),
        duration: Joi.string().max(100).required(),
        instructions: Joi.string().max(500).allow('', null)
      }))
      .min(1),
    
    notes: Joi.string()
      .max(1000)
      .allow('', null),

    pharmacyId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .allow(null),

    status: Joi.string()
      .valid('draft', 'signed', 'dispensed', 'completed', 'cancelled')
  }).min(1);


  /**
   * Schema for pharmacy assignment
   */
  static pharmacyAssignmentSchema = Joi.object({
    pharmacyId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid pharmacy ID format',
        'any.required': 'Pharmacy ID is required'
      })
  });


  /**
   * Schema for status update
   */
  static statusUpdateSchema = Joi.object({
    status: Joi.string()
      .valid('signed', 'dispensed', 'completed', 'cancelled')
      .required()
      .messages({
        'any.only': 'Invalid status value',
        'any.required': 'Status is required'
      })
  });


  /**
   * Validate prescription creation
   */
  static validateCreate(data) {
    const { error, value } = this.createSchema.validate(data, {
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
   * Validate medication data
   */
  static validateMedication(data) {
    const { error, value } = this.medicationSchema.validate(data, {
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
   * Validate prescription update
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
   * Validate pharmacy assignment
   */
  static validatePharmacyAssignment(data) {
    const { error, value } = this.pharmacyAssignmentSchema.validate(data, {
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
   * Validate status update
   */
  static validateStatusUpdate(data) {
    const { error, value } = this.statusUpdateSchema.validate(data, {
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

export default PrescriptionValidator;
