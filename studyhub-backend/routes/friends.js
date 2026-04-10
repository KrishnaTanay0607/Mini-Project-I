var express = require('express');
var User    = require('../models/User');
var { protect } = require('../middleware/auth');

var router = express.Router();

// GET /api/friends
router.get('/', protect, async function (req, res) {
  try {
    var me = await User.findById(req.user._id).populate('friends', 'name email friendCode');
    res.json({ friends: me.friends || [] });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/friends/requests
router.get('/requests', protect, async function (req, res) {
  try {
    var me = await User.findById(req.user._id).populate('friendRequests.from', 'name email friendCode');
    var pending = (me.friendRequests || []).filter(function (r) { return r.status === 'pending'; });
    res.json({ requests: pending });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/friends/add
router.post('/add', protect, async function (req, res) {
  try {
    var code = String(req.body.friendCode || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ message: 'Friend code required' });

    var target = await User.findOne({ friendCode: code });
    if (!target) return res.status(404).json({ message: 'No user found with that code' });
    if (target._id.toString() === req.user._id.toString())
      return res.status(400).json({ message: 'You cannot add yourself' });

    var already = (target.friends || []).map(function (f) { return f.toString(); }).includes(req.user._id.toString());
    if (already) return res.status(400).json({ message: 'Already friends' });

    var existing = (target.friendRequests || []).find(function (r) {
      return r.from.toString() === req.user._id.toString() && r.status === 'pending';
    });
    if (existing) return res.status(400).json({ message: 'Request already sent' });

    target.friendRequests.push({ from: req.user._id, status: 'pending' });
    await target.save();

    // ── Notify target user via socket ──
    var io = req.app.get('io');
    if (io) {
      io.emitToUser(target._id, 'friend_request', {
        from:       req.user.name,
        friendCode: req.user.friendCode,
        senderId:   req.user._id
      });
    }

    res.json({ message: 'Friend request sent to ' + target.name + '!' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/friends/respond
router.post('/respond', protect, async function (req, res) {
  try {
    var requesterId = req.body.requesterId;
    var action      = req.body.action;

    var me = await User.findById(req.user._id);
    var pending = me.friendRequests.find(function (r) {
      return r.from.toString() === requesterId && r.status === 'pending';
    });
    if (!pending) return res.status(404).json({ message: 'Request not found' });

    pending.status = action === 'accept' ? 'accepted' : 'declined';

    if (action === 'accept') {
      me.friends.push(requesterId);
      await User.findByIdAndUpdate(requesterId, { $addToSet: { friends: req.user._id } });

      // ── Notify the requester ──
      var io = req.app.get('io');
      if (io) {
        io.emitToUser(requesterId, 'friend_accepted', { name: req.user.name });
      }
    }

    await me.save();
    res.json({ message: action === 'accept' ? 'Friend added!' : 'Request declined' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/friends/:id
router.delete('/:id', protect, async function (req, res) {
  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { friends: req.params.id } });
    await User.findByIdAndUpdate(req.params.id, { $pull: { friends: req.user._id } });
    res.json({ message: 'Friend removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
