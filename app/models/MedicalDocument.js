import mongoose from 'mongoose';

const medicalDocumentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    documentType: {
        type: String,
        required: true,
        enum: [
            'lab_report',
            'prescription',
            'consultation_note',
            'imaging_scan',
            'discharge_summary',
            'medical_certificate',
            'referral_letter',
            'insurance_claim',
            'consent_form',
            'other'
        ]
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    fileName: {
        type: String,
        required: true
    },
    originalFileName: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number, // in bytes
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    fileExtension: {
        type: String,
        required: true
    },
    minioPath: {
        type: String,
        required: true,
        unique: true
    },
    documentDate: {
        type: Date,
        default: Date.now
    },
    // Related entities
    consultationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consultation'
    },
    labOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabOrder'
    },
    prescriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prescription'
    },
    // Document metadata
    tags: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        enum: ['diagnostic', 'treatment', 'administrative', 'legal', 'clinical', 'radiology', 'laboratory', 'pharmacy', 'other'],
        default: 'other'
    },
    confidentialityLevel: {
        type: String,
        enum: ['normal', 'confidential', 'highly_confidential'],
        default: 'normal'
    },
    // Access control
    accessibleBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: String,
        grantedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Version control
    version: {
        type: Number,
        default: 1
    },
    previousVersions: [{
        versionNumber: Number,
        minioPath: String,
        updatedAt: Date,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    // Status
    status: {
        type: String,
        enum: ['active', 'archived', 'deleted'],
        default: 'active'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: Date,
    // Audit trail
    viewHistory: [{
        viewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        viewedAt: {
            type: Date,
            default: Date.now
        },
        ipAddress: String
    }],
    downloadHistory: [{
        downloadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        downloadedAt: {
            type: Date,
            default: Date.now
        },
        ipAddress: String
    }],
    // Soft delete
    deletedAt: Date,
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deletionReason: String
}, {
    timestamps: true
});

// Indexes
medicalDocumentSchema.index({ patientId: 1, documentType: 1 });
medicalDocumentSchema.index({ uploadedBy: 1, createdAt: -1 });
medicalDocumentSchema.index({ status: 1, createdAt: -1 });
medicalDocumentSchema.index({ consultationId: 1 });
medicalDocumentSchema.index({ labOrderId: 1 });
medicalDocumentSchema.index({ prescriptionId: 1 });

// Virtual for file URL (if needed)
medicalDocumentSchema.virtual('fileUrl').get(function() {
    return `/api/v1/documents/${this._id}/download`;
});

// Instance methods
medicalDocumentSchema.methods.recordView = function(userId, ipAddress) {
    this.viewHistory.push({
        viewedBy: userId,
        viewedAt: new Date(),
        ipAddress
    });
    return this.save();
};

medicalDocumentSchema.methods.recordDownload = function(userId, ipAddress) {
    this.downloadHistory.push({
        downloadedBy: userId,
        downloadedAt: new Date(),
        ipAddress
    });
    return this.save();
};

medicalDocumentSchema.methods.verify = function(userId) {
    this.isVerified = true;
    this.verifiedBy = userId;
    this.verifiedAt = new Date();
    return this.save();
};

medicalDocumentSchema.methods.archive = function() {
    this.status = 'archived';
    return this.save();
};

medicalDocumentSchema.methods.softDelete = function(userId, reason) {
    this.status = 'deleted';
    this.deletedAt = new Date();
    this.deletedBy = userId;
    this.deletionReason = reason;
    return this.save();
};

// Static methods
medicalDocumentSchema.statics.findByPatient = function(patientId, options = {}) {
    const query = { patientId, status: { $ne: 'deleted' } };
    
    if (options.documentType) {
        query.documentType = options.documentType;
    }
    if (options.category) {
        query.category = options.category;
    }
    
    return this.find(query)
        .populate('uploadedBy', 'fname lname email role')
        .populate('consultationId', 'chiefComplaint consultationDate')
        .populate('labOrderId', 'orderNumber status')
        .populate('prescriptionId', 'orderNumber status')
        .sort({ createdAt: -1 });
};

medicalDocumentSchema.statics.findByUploader = function(uploaderId) {
    return this.find({ uploadedBy: uploaderId, status: { $ne: 'deleted' } })
        .populate('patientId', 'fname lname email')
        .sort({ createdAt: -1 });
};

medicalDocumentSchema.statics.findByConsultation = function(consultationId) {
    return this.find({ consultationId, status: { $ne: 'deleted' } })
        .populate('uploadedBy', 'fname lname role')
        .sort({ createdAt: -1 });
};

medicalDocumentSchema.statics.findByLabOrder = function(labOrderId) {
    return this.find({ labOrderId, status: { $ne: 'deleted' } })
        .populate('uploadedBy', 'fname lname role')
        .sort({ createdAt: -1 });
};

const MedicalDocument = mongoose.model('MedicalDocument', medicalDocumentSchema);

export default MedicalDocument;
