const mongoose = require('mongoose');
const communityPostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  content: { type: String, required: true, maxlength: 6000 },
  images: [{ type: String, maxlength: 1000 }],
  status: { type: String, enum: ['published', 'hidden', 'removed'], default: 'published' }
}, { timestamps: true });
communityPostSchema.index({ status: 1, createdAt: -1 });
module.exports = mongoose.model('CommunityPost', communityPostSchema);
