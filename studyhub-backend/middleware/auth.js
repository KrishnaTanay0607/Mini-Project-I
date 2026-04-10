var jwt  = require('jsonwebtoken');
var User = require('../models/User');

async function protect(req, res, next) {
  var token;
  var auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    token = auth.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  try {
    var decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user    = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
}

module.exports = { protect: protect };
