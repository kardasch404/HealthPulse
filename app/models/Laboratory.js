import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const laboratorySchema = new Schema({
  // ========================================
  // IDENTIFICATION
  // ========================================
  laboratoryId: {
    type: String,
    required: true,
    unique: true,
    default: () => `LAB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },
  
  // ========================================
  // BASIC INFORMATION
  // ========================================
  name: {
    type: String,
    required: [true, 'Laboratory name is required'],
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
  
  accreditationNumber: {
    type: String,
    trim: true
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
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    
    fax: String,
    
    website: String,
    
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
    
    state: String,
    
    zipCode: {
      type: String,
      required: true
    },
    
    country: {
      type: String,
      default: 'Morocco'
    },
    
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
    
    floor: String,
    buildingName: String,
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
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
    },
    
    closeTime: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
    },
    
    isClosed: {
      type: Boolean,
      default: false
    },
    
    sampleCollectionHours: {
      start: String,
      end: String
    }
  }],
  
  // ========================================
  // LAB CAPABILITIES & DEPARTMENTS
  // ========================================
  departments: [{
    name: {
      type: String,
      enum: [
        'hematology',
        'biochemistry',
        'microbiology',
        'immunology',
        'molecular_biology',
        'pathology',
        'cytology',
        'toxicology',
        'serology',
        'parasitology',
        'virology',
        'genetics',
        'histopathology'
      ],
      required: true
    },
    
    isActive: {
      type: Boolean,
      default: true
    },
    
    headTechnician: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    
    equipmentList: [String],
    
    certifications: [String]
  }],
  
  // ========================================
  // TEST CATALOG
  // ========================================
  availableTests: [{
    testCode: {
      type: String,
      required: true,
      uppercase: true
    },
    
    testName: {
      type: String,
      required: true
    },
    
    category: {
      type: String,
      enum: [
        'hematology',
        'biochemistry',
        'microbiology',
        'immunology',
        'molecular_biology',
        'pathology',
        'imaging',
        'other'
      ],
      required: true
    },
    
    department: String,
    
    specimen: {
      type: String,
      enum: ['blood', 'urine', 'stool', 'sputum', 'tissue', 'swab', 'csf', 'other']
    },
    
    specimenVolume: String, // e.g., "5ml"
    
    specimenContainer: String, // e.g., "EDTA tube"
    
    turnaroundTime: {
      type: Number, // in hours
      required: true
    },
    
    price: {
      type: Number,
      required: true
    },
    
    preparationInstructions: String, // e.g., "Fasting required"
    
    referenceRanges: [{
      ageGroup: String, // e.g., "Adult", "Child"
      gender: {
        type: String,
        enum: ['male', 'female', 'both']
      },
      unit: String,
      normalMin: Number,
      normalMax: Number,
      criticalMin: Number,
      criticalMax: Number
    }],
    
    methodology: String, // e.g., "Spectrophotometry"
    
    isActive: {
      type: Boolean,
      default: true
    },
    
    requiresApproval: {
      type: Boolean,
      default: false
    }
  }],
  
  // ========================================
  // LAB STAFF
  // ========================================
  staff: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    
    name: {
      type: String,
      required: true
    },
    
    role: {
      type: String,
      enum: [
        'director',
        'pathologist',
        'medical_technologist',
        'lab_technician',
        'phlebotomist',
        'lab_assistant',
        'quality_officer'
      ],
      required: true
    },
    
    licenseNumber: String,
    
    specialization: String,
    
    phone: String,
    
    email: String,
    
    workSchedule: [{
      day: String,
      startTime: String,
      endTime: String
    }],
    
    joinedDate: {
      type: Date,
      default: Date.now
    },
    
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // ========================================
  // SERVICES OFFERED
  // ========================================
  services: [{
    type: String,
    enum: [
      'routine_testing',
      'urgent_testing',
      'home_sample_collection',
      'corporate_packages',
      'health_checkup_packages',
      'covid_testing',
      'genetic_testing',
      'prenatal_screening',
      'cancer_screening',
      'allergy_testing',
      'hormone_testing',
      'drug_testing',
      'food_intolerance',
      'pathology_consultation'
    ]
  }],
  
  // Home collection service
  homeCollection: {
    available: {
      type: Boolean,
      default: false
    },
    
    serviceRadius: {
      type: Number, // in kilometers
      default: 10
    },
    
    fee: Number,
    
    freeCollectionMinimum: Number,
    
    availableSlots: [{
      day: String,
      timeSlots: [String] // e.g., ["08:00-10:00", "10:00-12:00"]
    }]
  },
  
  // ========================================
  // EQUIPMENT & TECHNOLOGY
  // ========================================
  equipment: [{
    name: String,
    manufacturer: String,
    model: String,
    serialNumber: String,
    purchaseDate: Date,
    lastMaintenanceDate: Date,
    nextMaintenanceDate: Date,
    calibrationDueDate: Date,
    status: {
      type: String,
      enum: ['operational', 'maintenance', 'out_of_service'],
      default: 'operational'
    }
  }],
  
  // ========================================
  // QUALITY & ACCREDITATION
  // ========================================
  qualityControl: {
    internalQC: {
      frequency: String, // e.g., "daily", "weekly"
      lastQCDate: Date,
      nextQCDate: Date
    },
    
    externalQC: {
      provider: String,
      frequency: String,
      lastAssessmentDate: Date,
      nextAssessmentDate: Date,
      score: Number
    },
    
    proficiencyTesting: [{
      testName: String,
      provider: String,
      lastParticipationDate: Date,
      result: String // e.g., "satisfactory", "needs improvement"
    }]
  },
  
  accreditations: [{
    body: String, // e.g., "ISO 15189", "CAP"
    certificateNumber: String,
    issueDate: Date,
    expiryDate: Date,
    scope: String,
    status: {
      type: String,
      enum: ['active', 'expired', 'suspended'],
      default: 'active'
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
    
    commissionRate: Number,
    
    paymentTerms: String,
    
    notes: String
  },
  
  // ========================================
  // BANKING INFORMATION
  // ========================================
  bankingInfo: {
    bankName: String,
    
    accountNumber: {
      type: String,
      select: false
    },
    
    iban: {
      type: String,
      select: false
    },
    
    swift: String,
    
    accountHolderName: String
  },
  
  // ========================================
  // STATISTICS
  // ========================================
  stats: {
    totalOrdersReceived: {
      type: Number,
      default: 0
    },
    
    totalOrdersCompleted: {
      type: Number,
      default: 0
    },
    
    totalOrdersCancelled: {
      type: Number,
      default: 0
    },
    
    averageTurnaroundTime: {
      type: Number, // in hours
      default: 0
    },
    
    onTimeDeliveryRate: {
      type: Number, // percentage
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
    
    lastOrderDate: Date,
    
    // Monthly statistics
    monthlyOrders: [{
      month: String, // e.g., "2025-01"
      totalOrders: Number,
      completedOrders: Number,
      revenue: Number
    }]
  },
  
  // ========================================
  // RATINGS & REVIEWS
  // ========================================
  ratings: [{
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    
    labOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'LabOrder'
    },
    
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    
    aspects: {
      accuracy: Number,
      turnaroundTime: Number,
      staff: Number,
      cleanliness: Number
    },
    
    review: String,
    
    ratedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // ========================================
  // PACKAGE DEALS
  // ========================================
  packages: [{
    packageId: String,
    
    name: String, // e.g., "Basic Health Checkup"
    
    description: String,
    
    testsIncluded: [{
      testCode: String,
      testName: String
    }],
    
    price: {
      type: Number,
      required: true
    },
    
    discountPercentage: Number,
    
    validFrom: Date,
    validUntil: Date,
    
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // ========================================
  // INSURANCE & BILLING
  // ========================================
  insuranceAccepted: [{
    insuranceName: String,
    insuranceCode: String,
    discountRate: Number,
    directBilling: {
      type: Boolean,
      default: false
    }
  }],
  
  // ========================================
  // NOTES & METADATA
  // ========================================
  notes: String,
  
  internalNotes: {
    type: String,
    select: false
  },
  
  tags: [String],
  
  // ========================================
  // SOCIAL MEDIA
  // ========================================
  socialMedia: {
    facebook: String,
    instagram: String,
    linkedin: String,
    twitter: String
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ========================================
// INDEXES
// ========================================
laboratorySchema.index({ laboratoryId: 1 });
laboratorySchema.index({ licenseNumber: 1 });
laboratorySchema.index({ status: 1 });
laboratorySchema.index({ 'address.city': 1 });
laboratorySchema.index({ 'availableTests.testCode': 1 });
laboratorySchema.index({ name: 'text' });


const Laboratory = mongoose.model('Laboratory', laboratorySchema);

export default Laboratory;
