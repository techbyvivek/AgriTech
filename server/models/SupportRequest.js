const mongoose = require('mongoose');
const supportRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  name: { type: String, required: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
  subject: { type: String, required: true, maxlength: 160 },
  message: { type: String, required: true, maxlength: 5000 },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' }
}, { timestamps: true });
module.exports = mongoose.model('SupportRequest', supportRequestSchema);
