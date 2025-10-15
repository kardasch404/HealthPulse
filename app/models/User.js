import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  phone: { type: String, sparse: true, unique: true },
  cni: { type: String, sparse: true, unique: true },
  password: { type: String, required: true },
  birthDate: { type: Date },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: Date,
  lastLogout: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },

});

const User = mongoose.model('User', userSchema);

export default User;


