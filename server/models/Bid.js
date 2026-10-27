const mongoose = require('mongoose');
const bidSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'CropListing', required: true, index: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  offeredPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0.01 },
  message: { type: String, maxlength: 1000, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'withdrawn', 'expired'], default: 'pending' },
  expiresAt: { type: Date, default: null },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null }
}, { timestamps: true });
bidSchema.index({ listing: 1, customer: 1, status: 1 });
module.exports = mongoose.model('Bid', bidSchema);
