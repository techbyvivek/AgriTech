const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 150 },
  category: { type: String, enum: ['seeds', 'fertilizers', 'pesticides', 'equipment', 'other'], default: 'other' },
  description: { type: String, maxlength: 3000, default: '' },
  price: { type: Number, required: true, min: 0 },
  unit: { type: String, trim: true, default: 'unit' },
  stock: { type: Number, required: true, min: 0, default: 0 },
  images: [{ type: String, maxlength: 1000 }],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });
productSchema.index({ active: 1, category: 1, name: 1 });
module.exports = mongoose.model('Product', productSchema);
