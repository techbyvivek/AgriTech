const mongoose = require('mongoose');
const serviceSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 150 },
  category: { type: String, trim: true, default: 'other' },
  description: { type: String, maxlength: 3000, default: '' },
  price: { type: Number, required: true, min: 0 },
  pricingUnit: { type: String, default: 'booking' },
  serviceArea: { village: String, district: String, state: String },
  active: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model('Service', serviceSchema);
