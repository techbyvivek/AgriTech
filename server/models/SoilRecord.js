const mongoose = require('mongoose');
const soilRecordSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop', default: null },
  measuredAt: { type: Date, default: Date.now },
  ph: { type: Number, min: 0, max: 14, default: null },
  moisture: { type: Number, min: 0, max: 100, default: null },
  nitrogen: { type: Number, min: 0, default: null },
  phosphorus: { type: Number, min: 0, default: null },
  potassium: { type: Number, min: 0, default: null },
  source: { type: String, enum: ['manual', 'sensor', 'lab'], default: 'manual' },
  notes: { type: String, maxlength: 1500, default: '' }
}, { timestamps: true });
soilRecordSchema.index({ farm: 1, measuredAt: -1 });
module.exports = mongoose.model('SoilRecord', soilRecordSchema);
