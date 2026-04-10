var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
  author:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text:      { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

var ResourceSchema = new mongoose.Schema({
  groupId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  name:      { type: String, required: true, trim: true },
  filename:  { type: String, default: '' },
  mimetype:  { type: String, default: '' },
  size:      { type: Number, default: 0 },
  ext:       { type: String, default: 'FILE' },
  uploader:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  upvotes:   { type: Number, default: 0 },
  votedBy:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments:  [CommentSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resource', ResourceSchema);
