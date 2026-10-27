const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  password: { type: String, required: true, select: false },
  phone: { type: String, trim: true, maxlength: 30, default: '' },
  role: { type: String, enum: ['farmer', 'customer', 'provider', 'admin'], default: 'farmer', required: true },
  preferredLanguage: { type: String, enum: ['en', 'hi'], default: 'en' },
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' }
}, { timestamps: true });
userSchema.index({ role: 1, status: 1 });
module.exports = mongoose.model('User', userSchema);
