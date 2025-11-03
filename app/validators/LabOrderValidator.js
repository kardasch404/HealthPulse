import Joi from 'joi';

class LabOrderValidator {
    /**
     * Schema for creating a lab order
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

        laboratoryId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid laboratory ID format',
                'any.required': 'Laboratory ID is required'
            }),

        tests: Joi.array()
            .items(Joi.object({
                name: Joi.string().max(200).required().messages({
                    'string.max': 'Test name cannot exceed 200 characters',
                    'any.required': 'Test name is required'
                }),
                code: Joi.string().max(50).uppercase().required().messages({
                    'string.max': 'Test code cannot exceed 50 characters',
                    'any.required': 'Test code is required'
                }),
                category: Joi.string()
                    .valid('Hematology', 'Chemistry', 'Endocrinology', 'Microbiology', 'Immunology', 'Molecular', 'Urinalysis', 'Toxicology', 'Pathology', 'Other')
                    .required()
                    .messages({
                        'any.only': 'Invalid test category',
                        'any.required': 'Test category is required'
                    }),
                urgency: Joi.string()
                    .valid('routine', 'urgent', 'stat')
                    .default('routine')
                    .messages({
                        'any.only': 'Urgency must be routine, urgent, or stat'
                    }),
                instructions: Joi.string().max(500).allow('', null),
                expectedTurnaround: Joi.number().min(0).allow(null)
            }))
            .min(1)
            .required()
            .messages({
                'array.min': 'At least one test is required',
                'any.required': 'Tests array is required'
            }),

        clinicalIndication: Joi.string()
            .max(1000)
            .required()
            .messages({
                'string.max': 'Clinical indication cannot exceed 1000 characters',
                'any.required': 'Clinical indication is required'
            }),

        urgency: Joi.string()
            .valid('routine', 'urgent', 'stat')
            .default('routine')
            .messages({
                'any.only': 'Overall urgency must be routine, urgent, or stat'
            }),

        notes: Joi.string().max(1000).allow('', null),

        fastingRequired: Joi.boolean().default(false),

        scheduledDate: Joi.date().iso().allow(null),

        scheduledTime: Joi.string()
            .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .allow('', null)
            .messages({
                'string.pattern.base': 'Invalid time format. Use HH:mm format'
            }),

        specialInstructions: Joi.string().max(1000).allow('', null)
    });

    /**
     * Schema for adding a single test
     */
    static addTestSchema = Joi.object({
        name: Joi.string()
            .max(200)
            .required()
            .messages({
                'string.max': 'Test name cannot exceed 200 characters',
                'any.required': 'Test name is required'
            }),

        code: Joi.string()
            .max(50)
            .uppercase()
            .required()
            .messages({
                'string.max': 'Test code cannot exceed 50 characters',
                'any.required': 'Test code is required'
            }),

        category: Joi.string()
            .valid('Hematology', 'Chemistry', 'Endocrinology', 'Microbiology', 'Immunology', 'Molecular', 'Urinalysis', 'Toxicology', 'Pathology', 'Other')
            .required()
            .messages({
                'any.only': 'Invalid test category',
                'any.required': 'Test category is required'
            }),

        urgency: Joi.string()
            .valid('routine', 'urgent', 'stat')
            .default('routine')
            .messages({
                'any.only': 'Urgency must be routine, urgent, or stat'
            }),

        instructions: Joi.string().max(500).allow('', null),

        expectedTurnaround: Joi.number().min(0).allow(null)
    });

    /**
     * Schema for updating lab order status
     */
    static updateStatusSchema = Joi.object({
        status: Joi.string()
            .valid('pending', 'sample_collected', 'in_progress', 'partial_results', 'completed', 'cancelled', 'rejected')
            .required()
            .messages({
                'any.only': 'Invalid status value',
                'any.required': 'Status is required'
            }),

        reason: Joi.string().max(500).allow('', null)
    });

    /**
     * Schema for updating test status
     */
    static updateTestStatusSchema = Joi.object({
        status: Joi.string()
            .valid('pending', 'in_progress', 'completed', 'cancelled', 'rejected')
            .required()
            .messages({
                'any.only': 'Invalid test status value',
                'any.required': 'Test status is required'
            }),

        results: Joi.any().allow(null),

        interpretation: Joi.string().max(2000).allow('', null),

        resultNotes: Joi.string().max(1000).allow('', null),

        criticalValues: Joi.array().items(
            Joi.object({
                parameter: Joi.string().required(),
                value: Joi.string().required(),
                flag: Joi.string().valid('high', 'low', 'critical').required()
            })
        ).allow(null)
    });

    /**
     * Schema for adding test results
     */
    static addResultsSchema = Joi.object({
        results: Joi.any().required().messages({
            'any.required': 'Test results are required'
        }),

        interpretation: Joi.string().max(2000).allow('', null),

        notes: Joi.string().max(1000).allow('', null),

        criticalValues: Joi.array().items(
            Joi.object({
                parameter: Joi.string().required(),
                value: Joi.string().required(),
                flag: Joi.string().valid('high', 'low', 'critical').required()
            })
        ).allow(null)
    });

    /**
     * Schema for cancelling lab order
     */
    static cancelSchema = Joi.object({
        reason: Joi.string()
            .max(500)
            .required()
            .messages({
                'string.max': 'Cancellation reason cannot exceed 500 characters',
                'any.required': 'Cancellation reason is required'
            }),

        notifyLaboratory: Joi.boolean().default(true)
    });

    /**
     * Validate create lab order
     */
    static validateCreate(data) {
        const { error, value } = this.createSchema.validate(data, {
            abortEarly: false,
            stripUnknown: true
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

        return { valid: true, data: value };
    }

    /**
     * Validate add test
     */
    static validateAddTest(data) {
        const { error, value } = this.addTestSchema.validate(data, {
            abortEarly: false,
            stripUnknown: true
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

        return { valid: true, data: value };
    }

    /**
     * Validate update status
     */
    static validateUpdateStatus(data) {
        const { error, value } = this.updateStatusSchema.validate(data, {
            abortEarly: false,
            stripUnknown: true
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

        return { valid: true, data: value };
    }

    /**
     * Validate update test status
     */
    static validateUpdateTestStatus(data) {
        const { error, value } = this.updateTestStatusSchema.validate(data, {
            abortEarly: false,
            stripUnknown: true
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

        return { valid: true, data: value };
    }

    /**
     * Validate add results
     */
    static validateAddResults(data) {
        const { error, value } = this.addResultsSchema.validate(data, {
            abortEarly: false,
            stripUnknown: true
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

        return { valid: true, data: value };
    }

    /**
     * Validate cancel
     */
    static validateCancel(data) {
        const { error, value } = this.cancelSchema.validate(data, {
            abortEarly: false,
            stripUnknown: true
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

        return { valid: true, data: value };
    }
}

export default LabOrderValidator;
