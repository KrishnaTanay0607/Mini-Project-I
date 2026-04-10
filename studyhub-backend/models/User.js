var mongoose = require('mongoose');
var bcrypt   = require('bcryptjs');

var UserSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:   { type: String, required: true, minlength: 6 },
  avatar:     { type: String, default: '' },
  bio:        { type: String, default: '' },
  friendCode: { type: String, unique: true, sparse: true },
  friends:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{
    from:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending','accepted','declined'], default: 'pending' },
    sentAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

function makeCode() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var code  = '';
  for (var i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

UserSchema.pre('save', async function (next) {
  if (!this.friendCode) {
    var code, tries = 0;
    do {
      code = makeCode();
      tries++;
      if (tries > 20) break;
    } while (await mongoose.model('User').findOne({ friendCode: code }).lean());
    this.friendCode = code;
  }
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

UserSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', UserSchema);
