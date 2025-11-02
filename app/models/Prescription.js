import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
    medicationName: {
        type: String,
        required: true,
        trim: true
    },
    genericName: {
        type: String,
        trim: true
    },
    dosage: {
        type: String,
        required: true,
        trim: true // e.g., "500mg", "10ml"
    },
    dosageForm: {
        type: String,
        enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler', 'patch', 'powder', 'other'],
        required: true
    },
    frequency: {
        type: String,
        required: true,
        trim: true // e.g., "twice daily", "every 6 hours", "3 times a day"
    },
    route: {
        type: String,
        enum: ['oral', 'topical', 'intravenous', 'intramuscular', 'subcutaneous', 'inhalation', 'rectal', 'other'],
        default: 'oral'
    },
    duration: {
        value: { type: Number, required: true },
        unit: { type: String, enum: ['days', 'weeks', 'months'], default: 'days' }
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    instructions: {
        type: String,
        trim: true // e.g., "Take with food", "Before bedtime"
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

const prescriptionSchema = new mongoose.Schema({
    // References
    prescriptionNumber: {
        type: String,
        unique: true,
        required: false // Will be generated in pre-save hook
    },
    consultationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consultation',
        required: false
    },
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

    // Prescription Details
    prescriptionDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'dispensed', 'partially-dispensed', 'expired', 'cancelled'],
        default: 'draft'
    },

    // Medications
    medications: {
        type: [medicationSchema],
        validate: {
            validator: function(medications) {
                return medications && medications.length > 0;
            },
            message: 'At least one medication is required'
        }
    },

    // Pharmacy Assignment
    assignedPharmacyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmacy'
    },
    assignedAt: {
        type: Date
    },
    dispensedBy: {
        pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy' },
        pharmacistName: { type: String },
        dispensedAt: { type: Date },
        notes: { type: String }
    },

    // Digital Signature
    isSigned: {
        type: Boolean,
        default: false
    },
    signedAt: {
        type: Date
    },
    digitalSignature: {
        type: String // Hash or signature data
    },
    signedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Notes
    doctorNotes: {
        type: String,
        trim: true
    },
    pharmacistNotes: {
        type: String,
        trim: true
    },

    // Cancellation
    cancelledAt: {
        type: Date
    },
    cancellationReason: {
        type: String
    },
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Metadata
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
prescriptionSchema.index({ prescriptionNumber: 1 });
prescriptionSchema.index({ patientId: 1, prescriptionDate: -1 });
prescriptionSchema.index({ doctorId: 1, prescriptionDate: -1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ assignedPharmacyId: 1 });
prescriptionSchema.index({ consultationId: 1 });

// Virtual for total medications count
prescriptionSchema.virtual('medicationsCount').get(function() {
    return this.medications ? this.medications.length : 0;
});

// Virtual to check if expired
prescriptionSchema.virtual('isExpired').get(function() {
    return this.validUntil < new Date();
});

// Generate prescription number before save
prescriptionSchema.pre('save', async function(next) {
    // Generate prescription number for new documents
    if (this.isNew && !this.prescriptionNumber) {
        const year = new Date().getFullYear();
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.prescriptionNumber = `RX${year}${timestamp}${random}`;
    }

    // Auto-set validUntil if not provided (default 90 days)
    if (!this.validUntil) {
        const validityDate = new Date();
        validityDate.setDate(validityDate.getDate() + 90);
        this.validUntil = validityDate;
    }

    next();
});

// Method to add medication
prescriptionSchema.methods.addMedication = function(medication) {
    this.medications.push(medication);
    return this.save();
};

// Method to sign prescription
prescriptionSchema.methods.signPrescription = async function(doctorId) {
    this.isSigned = true;
    this.signedAt = new Date();
    this.signedBy = doctorId;
    this.status = 'active';
    // In a real app, generate actual digital signature here
    this.digitalSignature = `SIG_${this.prescriptionNumber}_${Date.now()}`;
    return this.save();
};

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;
