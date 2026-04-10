var mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
  groupId:   { type: String, required: true },
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:      { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
