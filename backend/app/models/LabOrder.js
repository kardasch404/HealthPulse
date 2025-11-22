import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Test name is required'],
        trim: true
    },
    code: {
        type: String,
        required: [true, 'Test code is required'],
        uppercase: true,
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Test category is required'],
        enum: [
            'Hematology',
            'Chemistry',
            'Endocrinology',
            'Microbiology',
            'Immunology',
            'Molecular',
            'Urinalysis',
            'Toxicology',
            'Pathology',
            'Other'
        ]
    },
    urgency: {
        type: String,
        enum: ['routine', 'urgent', 'stat'],
        default: 'routine',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'cancelled', 'rejected'],
        default: 'pending'
    },
    instructions: {
        type: String,
        trim: true
    },
    expectedTurnaround: {
        type: Number, // in hours
        min: 0
    },
    results: {
        type: mongoose.Schema.Types.Mixed, // Flexible structure for different test results
        default: null
    },
    resultNotes: {
        type: String,
        trim: true
    },
    interpretation: {
        type: String,
        trim: true
    },
    criticalValues: [{
        parameter: String,
        value: String,
        flag: {
            type: String,
            enum: ['high', 'low', 'critical']
        }
    }],
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    performedAt: Date,
    completedAt: Date,
    reportUrl: String
}, { _id: true, timestamps: true });

const labOrderSchema = new mongoose.Schema({
    // Order Identification
    orderNumber: {
        type: String,
        unique: true,
        required: false // Generated in pre-save hook
    },

    // References
    consultationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consultation',
        required: true,
        index: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    laboratoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Laboratory',
        required: true,
        index: true
    },

    // Tests
    tests: {
        type: [testSchema],
        validate: {
            validator: function(tests) {
                return tests && tests.length > 0;
            },
            message: 'At least one test is required'
        }
    },

    // Order Details
    clinicalIndication: {
        type: String,
        required: [true, 'Clinical indication is required'],
        trim: true
    },
    urgency: {
        type: String,
        enum: ['routine', 'urgent', 'stat'],
        default: 'routine',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'sample_collected', 'in_progress', 'partial_results', 'completed', 'cancelled', 'rejected'],
        default: 'pending',
        index: true
    },
    notes: {
        type: String,
        trim: true
    },

    // Patient Instructions
    fastingRequired: {
        type: Boolean,
        default: false
    },
    specialInstructions: {
        type: String,
        trim: true
    },

    // Scheduling
    scheduledDate: Date,
    scheduledTime: String,

    // Sample Collection
    sampleCollectedAt: Date,
    sampleCollectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    sampleType: [{
        type: String,
        enum: ['blood', 'urine', 'stool', 'sputum', 'tissue', 'swab', 'csf', 'other']
    }],
    sampleCondition: {
        type: String,
        enum: ['acceptable', 'hemolyzed', 'clotted', 'insufficient', 'contaminated', 'other']
    },
    sampleNotes: String,

    // Processing
    receivedByLab: Date,
    estimatedCompletionDate: Date,
    actualCompletionDate: Date,

    // Results
    overallResults: {
        summary: String,
        interpretation: String,
        recommendations: String
    },
    reportGeneratedAt: Date,
    reportUrl: String,
    reportApprovedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reportApprovedAt: Date,

    // Cancellation
    cancellationReason: String,
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    cancelledAt: Date,

    // Priority & Flags
    isPriority: {
        type: Boolean,
        default: false
    },
    hasCriticalResults: {
        type: Boolean,
        default: false
    },
    criticalResultsNotifiedAt: Date,

    // Audit Trail
    statusHistory: [{
        status: String,
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        changedAt: {
            type: Date,
            default: Date.now
        },
        reason: String
    }]

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ========================================
// INDEXES
// ========================================
labOrderSchema.index({ orderNumber: 1 });
labOrderSchema.index({ patientId: 1, createdAt: -1 });
labOrderSchema.index({ doctorId: 1, createdAt: -1 });
labOrderSchema.index({ laboratoryId: 1, status: 1 });
labOrderSchema.index({ status: 1, urgency: 1 });
labOrderSchema.index({ scheduledDate: 1 });

// ========================================
// VIRTUAL FIELDS
// ========================================
labOrderSchema.virtual('isCompleted').get(function() {
    return this.status === 'completed';
});

labOrderSchema.virtual('isPending').get(function() {
    return this.status === 'pending';
});

labOrderSchema.virtual('canBeCancelled').get(function() {
    return ['pending', 'sample_collected'].includes(this.status);
});

labOrderSchema.virtual('completedTestsCount').get(function() {
    return this.tests.filter(test => test.status === 'completed').length;
});

labOrderSchema.virtual('pendingTestsCount').get(function() {
    return this.tests.filter(test => test.status === 'pending').length;
});

// ========================================
// PRE-SAVE HOOKS
// ========================================
labOrderSchema.pre('save', async function(next) {
    // Generate order number if not exists
    if (!this.orderNumber && this.isNew) {
        const year = new Date().getFullYear();
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        this.orderNumber = `LAB-${year}-${randomNum}`;
    }

    // Set priority based on urgency
    if (this.urgency === 'stat' || this.urgency === 'urgent') {
        this.isPriority = true;
    }

    // Update overall status based on test statuses
    if (!this.isNew && this.isModified('tests')) {
        const testStatuses = this.tests.map(t => t.status);
        const allCompleted = testStatuses.every(s => s === 'completed');
        const someCompleted = testStatuses.some(s => s === 'completed');
        const allPending = testStatuses.every(s => s === 'pending');
        
        if (allCompleted && this.status !== 'completed') {
            this.status = 'completed';
            this.actualCompletionDate = new Date();
        } else if (someCompleted && !allCompleted && this.status !== 'partial_results') {
            this.status = 'partial_results';
        }
    }

    // Check for critical results
    const hasCritical = this.tests.some(test => 
        test.criticalValues && test.criticalValues.length > 0
    );
    this.hasCriticalResults = hasCritical;

    next();
});

// ========================================
// METHODS
// ========================================
labOrderSchema.methods.addTest = function(testData) {
    if (!['pending', 'sample_collected'].includes(this.status)) {
        throw new Error('Cannot add tests to order with current status');
    }
    
    this.tests.push({
        ...testData,
        status: 'pending'
    });
    
    return this.save();
};

labOrderSchema.methods.updateTestStatus = function(testId, status, resultData = {}) {
    const test = this.tests.id(testId);
    if (!test) {
        throw new Error('Test not found');
    }
    
    test.status = status;
    
    if (status === 'completed') {
        test.completedAt = new Date();
        if (resultData.results) test.results = resultData.results;
        if (resultData.interpretation) test.interpretation = resultData.interpretation;
        if (resultData.criticalValues) test.criticalValues = resultData.criticalValues;
    }
    
    return this.save();
};

labOrderSchema.methods.addStatusHistory = function(status, changedBy, reason = '') {
    this.statusHistory.push({
        status,
        changedBy,
        changedAt: new Date(),
        reason
    });
};

labOrderSchema.methods.cancel = function(reason, cancelledBy) {
    if (!this.canBeCancelled) {
        throw new Error('Order cannot be cancelled at this stage');
    }
    
    this.status = 'cancelled';
    this.cancellationReason = reason;
    this.cancelledBy = cancelledBy;
    this.cancelledAt = new Date();
    
    this.addStatusHistory('cancelled', cancelledBy, reason);
    
    return this.save();
};

// ========================================
// STATIC METHODS
// ========================================
labOrderSchema.statics.findByOrderNumber = function(orderNumber) {
    return this.findOne({ orderNumber })
        .populate('patientId', 'firstName lastName email phone dateOfBirth')
        .populate('doctorId', 'firstName lastName specialization')
        .populate('laboratoryId', 'name address phone email')
        .populate('consultationId');
};

labOrderSchema.statics.findByPatient = function(patientId, filters = {}) {
    const query = { patientId, ...filters };
    return this.find(query)
        .sort({ createdAt: -1 })
        .populate('doctorId', 'firstName lastName specialization')
        .populate('laboratoryId', 'name address phone');
};

labOrderSchema.statics.findByDoctor = function(doctorId, filters = {}) {
    const query = { doctorId, ...filters };
    return this.find(query)
        .sort({ createdAt: -1 })
        .populate('patientId', 'firstName lastName dateOfBirth')
        .populate('laboratoryId', 'name address phone');
};

labOrderSchema.statics.findByLaboratory = function(laboratoryId, filters = {}) {
    const query = { laboratoryId, ...filters };
    return this.find(query)
        .sort({ urgency: -1, createdAt: -1 })
        .populate('patientId', 'firstName lastName dateOfBirth')
        .populate('doctorId', 'firstName lastName specialization');
};

const LabOrder = mongoose.model('LabOrder', labOrderSchema);

export default LabOrder;
