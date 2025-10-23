import Joi from 'joi';

class TerminValidator {
  
  static createSchema = Joi.object({
    patientId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid patient ID format',
        'any.required': 'Patient ID is required'
      }),
    
    doctorId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid doctor ID format',
        'any.required': 'Doctor ID is required'
      }),
    
    date: Joi.date()
      .min('now')
      .required()
      .messages({
        'date.min': 'Date must be in the future',
        'any.required': 'Date is required'
      }),

    startTime: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid time format, use HH:MM (24-hour format)',
        'any.required': 'Start time is required'
      }),
    
    type: Joi.string()
      .valid('consultation', 'follow-up', 'emergency', 'routine-checkup', 'surgery', 'other')
      .default('consultation')
      .messages({
        'any.only': 'Type must be one of: consultation, follow-up, emergency, routine-checkup, surgery, other'
      }),
    
    notes: Joi.string()
      .max(500)
      .allow('', null)
      .messages({
        'string.max': 'Notes cannot exceed 500 characters'
      })
  });


  static cancelSchema = Joi.object({
    reason: Joi.string()
      .max(500)
      .required()
      .messages({
        'string.max': 'Reason cannot exceed 500 characters',
        'any.required': 'Cancellation reason is required'
      })
  });

}

export default TerminValidator;