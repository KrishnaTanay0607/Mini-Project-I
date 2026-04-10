var mongoose = require('mongoose');

var NoteSchema = new mongoose.Schema({
  groupId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null }, // null = personal note
  title:     { type: String, required: true, trim: true },
  content:   { type: String, default: '' },
  author:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', NoteSchema);
