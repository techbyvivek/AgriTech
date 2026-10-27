const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  requestedDate: { type: Date, required: true },
  timeSlot: { type: String, maxlength: 100, default: '' },
  location: { type: String, maxlength: 500, default: '' },
  notes: { type: String, maxlength: 1500, default: '' },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['requested', 'accepted', 'rejected', 'cancelled', 'completed'], default: 'requested' }
}, { timestamps: true });
bookingSchema.index({ provider: 1, requestedDate: 1, status: 1 });
module.exports = mongoose.model('Booking', bookingSchema);
