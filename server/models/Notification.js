const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, maxlength: 160 },
  message: { type: String, required: true, maxlength: 1000 },
  type: { type: String, enum: ['system', 'order', 'booking', 'weather', 'pest', 'community'], default: 'system' },
  readAt: { type: Date, default: null },
  link: { type: String, maxlength: 500, default: '' }
}, { timestamps: true });
notificationSchema.index({ recipient: 1, createdAt: -1 });
module.exports = mongoose.model('Notification', notificationSchema);
