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
    }
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
      enum: ['hematology', 'biochemistry', 'microbiology'],
      required: true
    },
    
    isActive: {
      type: Boolean,
      default: true
    }
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
      enum: ['lab_technician'],
      required: true
    },
    
    phone: String,
    
    email: String,
    
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
    enum: ['routine_testing', 'urgent_testing']
  }],
  
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
