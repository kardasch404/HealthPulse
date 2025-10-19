import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    isRevoked: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

refreshTokenSchema.methods.isExpired = function() {
    return Date.now() >= this.expiresAt;
};

refreshTokenSchema.methods.revoke = function() {
    this.isRevoked = true;
    return this.save();
};

refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ token: 1 });
refreshTokenSchema.index({ expiresAt: 1 });

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

export default RefreshToken;
