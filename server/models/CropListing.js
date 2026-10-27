const mongoose = require('mongoose');
const cropListingSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  cropName: { type: String, required: true, trim: true, maxlength: 100 },
  variety: { type: String, trim: true, default: '' },
  description: { type: String, maxlength: 2500, default: '' },
  availableQuantity: { type: Number, required: true, min: 0 },
  unit: { type: String, trim: true, default: 'kg' },
  pricePerUnit: { type: Number, required: true, min: 0 },
  minimumOrderQuantity: { type: Number, min: 0, default: 1 },
  harvestDate: { type: Date, default: null },
  location: { village: String, district: String, state: String, latitude: Number, longitude: Number },
  images: [{ type: String, maxlength: 1000 }],
  biddingEnabled: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'paused', 'sold_out', 'removed'], default: 'active' }
}, { timestamps: true });
cropListingSchema.index({ status: 1, cropName: 1, createdAt: -1 });
module.exports = mongoose.model('CropListing', cropListingSchema);
