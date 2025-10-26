const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  fame: {
    type: String,
    required: [true],
    trim: true
  },
   
  
  lname: {
    type: String,
    required: [true],
    trim: true
  },
  
  email: {
    type: String,
    required: [true],
  },
  
  phone: {
    type: String,
    required: [true],

  },
  
  birthDate: {
    type: Date,
    required: [true]
  },
  
  gender: {
    type: String,
    required: [true],
    enum: ['male', 'female']
  },
  
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Morocco'
    }
  },
  
  medicalInfo: {
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    allergies: [{
      type: String,
      trim: true
    }],
    chronicDiseases: [{
      type: String,
      trim: true
    }],
    medications: [{
      name: String,
      dosage: String,
      frequency: String
    }],
    notes: String
  },
  
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    expiryDate: Date
  },
  
  emergencyContact: {
    name: {
      type: String,
      required: [true]
    },
    relationship: String,
    phone: {
      type: String,
      required: [true]
    }
  },
  
  assignedDoctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'patients'
});

// Indexes
patientSchema.index({ firstName: 1, lastName: 1 });
patientSchema.index({ email: 1 });
patientSchema.index({ phone: 1 });
patientSchema.index({ assignedDoctorId: 1 });
patientSchema.index({ createdBy: 1 });
patientSchema.index({ createdAt: -1 });


const Patient = mongoose.model('Patient', patientSchema);

export default Patient;