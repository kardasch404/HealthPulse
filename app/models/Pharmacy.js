import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const pharmacySchema = new Schema({
  // ========================================
  // IDENTIFICATION
  // ========================================
  pharmacyId: {
    type: String,
    required: true,
    unique: true,
    default: () => `PH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },
  
  // ========================================
  // BASIC INFORMATION
  // ========================================
  name: {
    type: String,
    required: [true, 'Pharmacy name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  
  registrationDate: {
    type: Date,
    default: Date.now
  },
  
  // ========================================
  // CONTACT INFORMATION
  // ========================================
  contact: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^(\+212|0)[5-7]\d{8}$/, 'Please provide a valid Moroccan phone number']
    },
    
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    
    fax: String,
    
    website: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please provide a valid URL']
    },
    
    emergencyPhone: String
  },
  
  // ========================================
  // ADDRESS
  // ========================================
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    
    city: {
      type: String,
      required: true,
      trim: true
    },
    
    state: {
      type: String,
      trim: true
    },
    
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    
    country: {
      type: String,
      default: 'Morocco'
    },
    
    // For maps and location-based searches
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180
      }
    },
    
    // Additional location info
    neighborhood: String,
    landmark: String
  },
  
  // ========================================
  // OPERATING HOURS
  // ========================================
  operatingHours: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true
    },
    
    openTime: {
      type: String, // Format: "09:00"
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
    },
    
    closeTime: {
      type: String, // Format: "18:00"
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
    },
    
    isClosed: {
      type: Boolean,
      default: false
    },
    
    // For lunch breaks
    breakTime: {
      start: String,
      end: String
    }
  }],
  
  // ========================================
  // SERVICES OFFERED
  // ========================================
  services: [{
    type: String,
    enum: [
      'prescription_filling',
      'otc_medications',
      'home_delivery',
      '24h_service',
      'night_service',
      'vaccination',
      'health_screening',
      'blood_pressure_check',
      'diabetes_monitoring',
      'covid_testing',
      'medical_equipment',
      'consultation'
    ]
  }],
  
  // Delivery service details
  deliveryService: {
    available: {
      type: Boolean,
      default: false
    },
    
    deliveryRadius: {
      type: Number, // in kilometers
      default: 5
    },
    
    deliveryFee: {
      type: Number,
      default: 0
    },
    
    freeDeliveryMinimum: Number, // Minimum order for free delivery
    
    estimatedTime: String // e.g., "30-45 minutes"
  },
  
  // ========================================
  // PHARMACIST INFORMATION
  // ========================================
  pharmacists: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    
    name: {
      type: String,
      required: true
    },
    
    licenseNumber: {
      type: String,
      required: true
    },
    
    specialization: String,
    
    phone: String,
    
    email: String,
    
    isMainPharmacist: {
      type: Boolean,
      default: false
    },
    
    workSchedule: [{
      day: String,
      startTime: String,
      endTime: String
    }],
    
    joinedDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // ========================================
  // STATUS & VALIDATION
  // ========================================
  status: {
    type: String,
    enum: ['active', 'suspended', 'inactive', 'pending_approval'],
    default: 'pending_approval'
  },
  
  verificationStatus: {
    isVerified: {
      type: Boolean,
      default: false
    },
    
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    
    verifiedAt: Date,
    
    verificationNotes: String
  },
  
  // ========================================
  // PARTNERSHIP DETAILS
  // ========================================
  partnership: {
    partnerSince: {
      type: Date,
      default: Date.now
    },
    
    contractNumber: String,
    
    contractStartDate: Date,
    
    contractEndDate: Date,
    
    commissionRate: {
      type: Number, // Percentage
      default: 0
    },
    
    paymentTerms: String,
    
    notes: String
  },
  
  // ========================================
  // BANKING INFORMATION (for payments)
  // ========================================
  bankingInfo: {
    bankName: String,
    
    accountNumber: {
      type: String,
      select: false // Don't return by default for security
    },
    
    iban: {
      type: String,
      select: false
    },
    
    swift: String,
    
    accountHolderName: String
  },
  
  // ========================================
  // INVENTORY & CAPABILITIES
  // ========================================
  inventory: {
    totalMedications: {
      type: Number,
      default: 0
    },
    
    specializedMedications: [String], // e.g., ["oncology", "pediatric"]
    
    canOrderRareMedications: {
      type: Boolean,
      default: false
    },
    
    averageStockLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  },
  
  // ========================================
  // STATISTICS
  // ========================================
  stats: {
    totalPrescriptionsReceived: {
      type: Number,
      default: 0
    },
    
    totalPrescriptionsCompleted: {
      type: Number,
      default: 0
    },
    
    totalPrescriptionsCancelled: {
      type: Number,
      default: 0
    },
    
    averageProcessingTime: {
      type: Number, // in minutes
      default: 0
    },
    
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    
    totalRatings: {
      type: Number,
      default: 0
    },
    
    lastPrescriptionDate: Date
  },
  
  // ========================================
  // RATINGS & REVIEWS
  // ========================================
  ratings: [{
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    
    prescriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Prescription'
    },
    
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    
    review: String,
    
    ratedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // ========================================
  // NOTES & METADATA
  // ========================================
  notes: String,
  
  internalNotes: {
    type: String,
    select: false // Only visible to admins
  },
  
  tags: [String], // e.g., ["24h", "city-center", "parking"]
  
  // ========================================
  // SOCIAL MEDIA & ONLINE PRESENCE
  // ========================================
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    whatsapp: String
  },
  
  // ========================================
  // COMPLIANCE & CERTIFICATIONS
  // ========================================
  certifications: [{
    name: String,
    issuingBody: String,
    issueDate: Date,
    expiryDate: Date,
    certificateNumber: String
  }],
  
  insuranceAccepted: [String], // e.g., ["CNSS", "CNOPS", "Private"]
  
  // ========================================
  // TIMESTAMPS
  // ========================================
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ========================================
// INDEXES
// ========================================
pharmacySchema.index({ pharmacyId: 1 });
pharmacySchema.index({ licenseNumber: 1 });
pharmacySchema.index({ status: 1 });
pharmacySchema.index({ 'address.city': 1 });
pharmacySchema.index({ 'address.coordinates.latitude': 1, 'address.coordinates.longitude': 1 });
pharmacySchema.index({ name: 'text' });

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);

export default Pharmacy;
