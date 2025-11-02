import Joi from 'joi';

class ConsultationValidator {
  
  /**
   * Schema for creating a consultation
   */
  static createSchema = Joi.object({
    terminId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid appointment ID format',
        'any.required': 'Appointment ID is required'
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
    
    chiefComplaint: Joi.string()
      .max(500)
      .required()
      .messages({
        'string.max': 'Chief complaint cannot exceed 500 characters',
        'any.required': 'Chief complaint is required'
      }),
    
    symptoms: Joi.array()
      .items(Joi.string().max(100))
      .default([])
      .messages({
        'array.base': 'Symptoms must be an array'
      }),
    
    diagnosis: Joi.string()
      .max(1000)
      .allow('', null)
      .messages({
        'string.max': 'Diagnosis cannot exceed 1000 characters'
      }),
    
    treatmentPlan: Joi.string()
      .max(2000)
      .allow('', null)
      .messages({
        'string.max': 'Treatment plan cannot exceed 2000 characters'
      }),
    
    vitalSigns: Joi.object({
      bloodPressure: Joi.string().allow('', null),
      temperature: Joi.number().min(35).max(45).allow(null),
      pulse: Joi.number().min(40).max(200).allow(null),
      respiratoryRate: Joi.number().min(10).max(60).allow(null),
      weight: Joi.number().min(0).max(500).allow(null),
      height: Joi.number().min(0).max(300).allow(null)
    }).optional(),
    
    notes: Joi.string()
      .max(2000)
      .allow('', null)
      .messages({
        'string.max': 'Notes cannot exceed 2000 characters'
      }),

    followUpDate: Joi.date()
      .min('now')
      .allow(null)
      .messages({
        'date.min': 'Follow-up date must be in the future'
      }),

    status: Joi.string()
      .valid('in-progress', 'completed', 'cancelled')
      .default('in-progress')
  });


  /**
   * Schema for updating a consultation
   */
  static updateSchema = Joi.object({
    chiefComplaint: Joi.string()
      .max(500)
      .messages({
        'string.max': 'Chief complaint cannot exceed 500 characters'
      }),
    
    symptoms: Joi.array()
      .items(Joi.string().max(100))
      .messages({
        'array.base': 'Symptoms must be an array'
      }),
    
    diagnosis: Joi.string()
      .max(1000)
      .allow('', null)
      .messages({
        'string.max': 'Diagnosis cannot exceed 1000 characters'
      }),
    
    treatmentPlan: Joi.string()
      .max(2000)
      .allow('', null)
      .messages({
        'string.max': 'Treatment plan cannot exceed 2000 characters'
      }),
    
    vitalSigns: Joi.object({
      bloodPressure: Joi.string().allow('', null),
      temperature: Joi.number().min(35).max(45).allow(null),
      pulse: Joi.number().min(40).max(200).allow(null),
      respiratoryRate: Joi.number().min(10).max(60).allow(null),
      weight: Joi.number().min(0).max(500).allow(null),
      height: Joi.number().min(0).max(300).allow(null)
    }).optional(),
    
    notes: Joi.string()
      .max(2000)
      .allow('', null)
      .messages({
        'string.max': 'Notes cannot exceed 2000 characters'
      }),

    followUpDate: Joi.date()
      .min('now')
      .allow(null)
      .messages({
        'date.min': 'Follow-up date must be in the future'
      }),

    status: Joi.string()
      .valid('in-progress', 'completed', 'cancelled')
  }).min(1);


  /**
   * Validate consultation creation
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
   * Validate consultation update
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
}

export default ConsultationValidator;
