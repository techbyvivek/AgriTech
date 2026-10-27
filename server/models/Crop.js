const mongoose = require('mongoose');
const cropSchema = new mongoose.Schema({
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  cropName: { type: String, required: true, trim: true, maxlength: 100 },
  variety: { type: String, trim: true, maxlength: 100, default: '' },
  sowingDate: { type: Date, default: null },
  expectedHarvestDate: { type: Date, default: null },
  growthStage: { type: String, enum: ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturing', 'Harvested'], default: 'Seedling' },
  status: { type: String, enum: ['Growing', 'Harvested', 'Failed'], default: 'Growing' },
  notes: { type: String, maxlength: 2000, default: '' }
}, { timestamps: true });
cropSchema.index({ owner: 1, createdAt: -1 });
module.exports = mongoose.model('Crop', cropSchema);
