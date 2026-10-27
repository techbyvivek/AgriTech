const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityPost', required: true, index: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 2000 },
  status: { type: String, enum: ['published', 'hidden', 'removed'], default: 'published' }
}, { timestamps: true });
module.exports = mongoose.model('Comment', commentSchema);
