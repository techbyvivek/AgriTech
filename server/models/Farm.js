const mongoose = require('mongoose');
const farmSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  farmName: { type: String, required: true, trim: true, maxlength: 100 },
  location: {
    village: { type: String, trim: true, default: '' },
    district: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: 'Madhya Pradesh' },
    latitude: { type: Number, min: -90, max: 90, default: null },
    longitude: { type: Number, min: -180, max: 180, default: null }
  },
  area: { type: Number, required: true, min: 0.01 },
  areaUnit: { type: String, enum: ['acres', 'hectares'], default: 'acres' },
  soilType: { type: String, trim: true, default: '' },
  irrigationType: { type: String, trim: true, default: '' },
  description: { type: String, maxlength: 1000, default: '' }
}, { timestamps: true });
farmSchema.index({ owner: 1, createdAt: -1 });
module.exports = mongoose.model('Farm', farmSchema);
