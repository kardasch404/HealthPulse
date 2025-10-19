import mongoose from 'mongoose';

const terminSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dateTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        default: 30
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    type: {
        type: String,
        required: true
    },
    notes: {
        type: String
    },
    cancelReason: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reminderSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

terminSchema.index({ patientId: 1 });
terminSchema.index({ doctorId: 1 });
terminSchema.index({ dateTime: 1 });
terminSchema.index({ status: 1 });

terminSchema.pre('save', async function(next) {
    const conflict = await mongoose.model('Termin').findOne({
        doctorId: this.doctorId,
        dateTime: this.dateTime,
        status: { $ne: 'cancelled' },
        _id: { $ne: this._id }
    });
    
    if (conflict) {
        throw new Error('Appointment conflict: Doctor already has an appointment at this time');
    }
    next();
});

const Termin = mongoose.model('Termin', terminSchema);

export default Termin;
