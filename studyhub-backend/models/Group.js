var mongoose = require('mongoose');

var MeetLinkSchema = new mongoose.Schema({
  url:       { type: String, required: true },
  label:     { type: String, default: 'Meeting Link' },
  platform:  { name: String, color: String, emoji: String },
  addedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

var GroupSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  course:    { type: String, required: true, trim: true },
  emoji:     { type: String, default: '📚' },
  color:     { type: String, default: '#38bdf8' },
  desc:      { type: String, default: '' },
  tags:      [String],
  creator:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  meetLinks: [MeetLinkSchema],
  next:      { type: String, default: 'TBD' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', GroupSchema);
