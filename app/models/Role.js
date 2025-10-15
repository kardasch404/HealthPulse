import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ["admin", "doctor", "nurse", "reception", "patient"],
        unique: true
    },
    description : {
        type: String,
        required: true
    },
    
    isActive : {
        type: Boolean,
        default: true
    },  
    createdAt: {
    type: Date,
    default: Date.now,
  },
    
});

const Role = mongoose.model('Role', roleSchema);

export default Role;
