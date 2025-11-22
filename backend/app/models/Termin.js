import mongoose from 'mongoose';

const terminSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Changed from 'Patient' to 'User'
    required: true
  },
  
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  date: {
    type: Date,
    required: true
  },

  startTime: {
    type: String,  // Format: "HH:MM" (e.g., "14:00")
    required: true
  },

  endTime: {
    type: String,  // Format: "HH:MM" (e.g., "14:30")
    required: true
  },
  
  duration: {
    type: Number,
    required: true,
    default: 30, // minutes
    min: 15,
    max: 180
  },
  
  status: {
    type: String,
    required: true,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  
  type: {
    type: String,
    required: true,
    enum: ['consultation', 'emergency'],
    default: 'consultation'
  },
  
  notes: {
    type: String,
    trim: true
  },
  
  cancelReason: {
    type: String,
    trim: true
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  reminderSent: {
    type: Boolean,
    default: false
  },
  
  completedAt: Date,
  cancelledAt: Date
}, {
  timestamps: true,
  collection: 'termins'
});

// Indexes for performance
terminSchema.index({ patientId: 1, date: -1 });
terminSchema.index({ doctorId: 1, date: 1, startTime: 1 });
terminSchema.index({ date: 1, status: 1 });
terminSchema.index({ status: 1 });
terminSchema.index({ createdBy: 1 });

// Prevent double booking (same doctor, same date, overlapping times)
// Note: Unique constraint applies to all appointments, handle cancellations in application logic
terminSchema.index({ 
  doctorId: 1, 
  date: 1, 
  startTime: 1 
}, { 
  unique: true
});

const Termin = mongoose.model('Termin', terminSchema);

export default Termin;