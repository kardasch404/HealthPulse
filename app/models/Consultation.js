import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema({
    // Reference to appointment (if consultation is from appointment)
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Termin',
        required: false
    },

    // Patient and Doctor
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Consultation Details
    consultationType: {
        type: String,
        enum: ['in-person', 'telemedicine', 'follow-up', 'emergency', 'routine'],
        default: 'in-person'
    },
    consultationDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
        default: 'scheduled'
    },

    // Chief Complaint
    chiefComplaint: {
        type: String,
        required: true,
        trim: true
    },
    symptoms: [{
        type: String,
        trim: true
    }],
    symptomsDuration: {
        type: String, // e.g., "3 days", "2 weeks"
        trim: true
    },

    // Treatment Plan
    treatmentPlan: {
        type: String,
        trim: true
    },
    recommendations: [{
        type: String,
        trim: true
    }],

    // Vital Signs
    vitalSigns: {
        bloodPressure: { type: String },
        temperature: { type: Number },
        pulse: { type: Number },
        respiratoryRate: { type: Number },
        weight: { type: Number },
        height: { type: Number },
        oxygenSaturation: { type: Number },
        painLevel: { type: Number, min: 0, max: 10 },
        recordedAt: { type: Date, default: Date.now }
    },

    // Diagnosis
    diagnosis: {
        type: String,
        trim: true
    },
    secondaryDiagnosis: [{
        type: String,
        trim: true
    }],
    icdCodes: [{
        type: String,
        trim: true
    }],
    severity: {
        type: String,
        enum: ['Mild', 'Moderate', 'Severe', 'Critical']
    },
    diagnosisNotes: {
        type: String,
        trim: true
    },

    // Lab Tests & Imaging
    labTestsOrdered: [{
        testName: { type: String },
        testType: { type: String },
        priority: { type: String, enum: ['routine', 'urgent', 'stat'] },
        orderedAt: { type: Date, default: Date.now }
    }],
    imagingOrdered: [{
        imagingType: { type: String }, // X-Ray, CT, MRI, etc.
        bodyPart: { type: String },
        priority: { type: String, enum: ['routine', 'urgent', 'stat'] },
        orderedAt: { type: Date, default: Date.now }
    }],

    // Follow-up
    followUpRequired: {
        type: Boolean,
        default: false
    },
    followUpDate: {
        type: Date
    },
    followUpNotes: {
        type: String
    },

    // Notes & Documentation
    doctorNotes: {
        type: String,
        trim: true
    },
    privateNotes: {
        type: String,
        trim: true
    },

    // Attachments
    attachments: [{
        fileName: { type: String },
        fileUrl: { type: String },
        fileType: { type: String },
        uploadedAt: { type: Date, default: Date.now }
    }],

    // Linked Prescription
    prescriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prescription'
    },

    // Timestamps
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    },
    duration: {
        type: Number // minutes
    },

    // Metadata
    isDeleted: {
        type: Boolean,
        default: false
    }
    ,
    // Who created this consultation (could be the doctor, receptionist, etc.)
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
consultationSchema.index({ patientId: 1, consultationDate: -1 });
consultationSchema.index({ doctorId: 1, consultationDate: -1 });
consultationSchema.index({ status: 1 });
consultationSchema.index({ appointmentId: 1 });
consultationSchema.index({ createdBy: 1 });

// Virtual for patient full name
consultationSchema.virtual('patientName').get(function() {
    if (this.patientId && this.patientId.fname && this.patientId.lname) {
        return `${this.patientId.fname} ${this.patientId.lname}`;
    }
    return null;
});

// Virtual for doctor full name
consultationSchema.virtual('doctorName').get(function() {
    if (this.doctorId && this.doctorId.fname && this.doctorId.lname) {
        return `Dr. ${this.doctorId.fname} ${this.doctorId.lname}`;
    }
    return null;
});

// Calculate duration before save
consultationSchema.pre('save', function(next) {
    if (this.startTime && this.endTime) {
        this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60)); // minutes
    }
    next();
});

const Consultation = mongoose.model('Consultation', consultationSchema);

export default Consultation;
