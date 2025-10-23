import Joi from 'joi';

class PatientValidator {
  
  static createSchema = Joi.object({
    firstName: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .required(),
    
    lastName: Joi.string()
      .min(2)
      .max(50)
      .required(),

    email: Joi.string()
      .email()
      .allow('', null),
    
    phone: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required(),
    
    dateOfBirth: Joi.date()
      .max('now')
      .required(),

    gender: Joi.string()
      .valid('male', 'female')
      .required(),
    
    allergies: Joi.array()
      .items(Joi.string().trim().max(100))
      .default([]),
    
    chronicDiseases: Joi.array()
      .items(Joi.string().trim().max(100))
      .default([]),
    
    bloodType: Joi.string()
      .valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
      .allow('', null),

    emergencyContactName: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .required(),

    emergencyContactPhone: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required(),

    assignedDoctorId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .allow('', null),

    notes: Joi.string()
      .max(1000)
      .allow('', null)
  });


  static updateSchema = Joi.object({
    firstName: Joi.string()
      .trim()
      .min(2)
      .max(50),
    
    lastName: Joi.string()
      .trim()
      .min(2)
      .max(50),
    
    email: Joi.string()
      .email()
      .lowercase()
      .trim()
      .allow('', null),
    
    phone: Joi.string()
      .pattern(/^[0-9]{10}$/),
    
    dateOfBirth: Joi.date()
      .max('now'),
    
    gender: Joi.string()
      .valid('male', 'female'),

    allergies: Joi.array()
      .items(Joi.string().trim().max(100)),
    
    chronicDiseases: Joi.array()
      .items(Joi.string().trim().max(100)),
    
    bloodType: Joi.string()
      .valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
      .allow('', null),
    
    emergencyContactName: Joi.string()
      .trim()
      .min(2)
      .max(100),
    
    emergencyContactPhone: Joi.string()
      .pattern(/^[0-9]{10}$/),
    
    assignedDoctorId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .allow('', null),

    notes: Joi.string()
      .max(1000)
      .allow('', null),
    
    isActive: Joi.boolean()
  });


  static validateCreate(data) {
    const { error, value } = this.createSchema.validate(data, {
      abortEarly: false,
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

export default PatientValidator;