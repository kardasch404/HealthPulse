import mongoose from 'mongoose';
import { ROLES } from '../constants/roles.js';

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: Object.values(ROLES),
        unique: true
    },
    description: {
        type: String
    },
    permissions: {
        type: Object,
        default: {}
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

roleSchema.methods.hasPermission = function(resource, action) {
    return this.permissions?.[resource]?.includes(action) || false;
};

const Role = mongoose.model('Role', roleSchema);

export default Role;
