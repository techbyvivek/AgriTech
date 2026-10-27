const mongoose = require('mongoose');
const itemSchema = new mongoose.Schema({
  listingType: { type: String, enum: ['product', 'crop'], required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nameSnapshot: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0.01 },
  unit: { type: String, default: 'unit' },
  unitPrice: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 }
}, { _id: false });
const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: { type: [itemSchema], validate: v => Array.isArray(v) && v.length > 0 },
  deliveryAddress: { name: String, phone: String, addressLine: String, village: String, district: String, state: String, postalCode: String },
  deliveryCharge: { type: Number, min: 0, default: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, enum: ['COD'], default: 'COD' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  status: { type: String, enum: ['placed', 'confirmed', 'dispatched', 'delivered', 'cancelled'], default: 'placed' }
}, { timestamps: true });
orderSchema.index({ customer: 1, createdAt: -1 });
module.exports = mongoose.model('Order', orderSchema);
