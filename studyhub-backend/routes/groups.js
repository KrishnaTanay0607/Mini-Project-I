var express = require('express');
var Group   = require('../models/Group');
var User    = require('../models/User');
var { protect } = require('../middleware/auth');

var router = express.Router();
var COLORS = ['#38bdf8','#2dd4bf','#a78bfa','#fbbf24','#f472b6','#4ade80','#60a5fa'];

// GET /api/groups
router.get('/', protect, async function (req, res) {
  try {
    var groups = await Group.find()
      .populate('creator', 'name')
      .populate('members', '_id name')
      .sort({ createdAt: -1 });
    res.json({ groups: groups });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/groups
router.post('/', protect, async function (req, res) {
  try {
    var name = req.body.name;
    var course = req.body.course;
    if (!name || !course) return res.status(400).json({ message: 'Name and course required' });
    var color = req.body.color || COLORS[Math.floor(Math.random() * COLORS.length)];
    var group = await Group.create({
      name:    name,
      course:  course,
      emoji:   req.body.emoji  || '📚',
      color:   color,
      desc:    req.body.desc   || '',
      creator: req.user._id,
      members: [req.user._id]
    });
    await group.populate('creator', 'name');
    res.status(201).json({ group: group });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/groups/:id/join  (join or leave)
router.put('/:id/join', protect, async function (req, res) {
  try {
    var group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    var uid = req.user._id.toString();
    var ids = group.members.map(function (m) { return m.toString(); });
    var joining = !ids.includes(uid);
    if (joining) {
      group.members.push(req.user._id);
    } else {
      group.members = group.members.filter(function (m) { return m.toString() !== uid; });
    }
    await group.save();
    // Notify existing members when someone joins
    if (joining) {
      var io = req.app.get('io');
      if (io) {
        io.emitToGroup(req.params.id, 'member_joined', {
          groupName:  group.name,
          memberName: req.user.name,
          groupId:    req.params.id
        });
      }
    }
    res.json({ joined: joining, memberCount: group.members.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/groups/:id/invite  — invite a friend by friendCode
router.post('/:id/invite', protect, async function (req, res) {
  try {
    var group = await Group.findById(req.params.id).populate('members', '_id');
    if (!group) return res.status(404).json({ message: 'Group not found' });

    var friendCode = String(req.body.friendCode || '').trim().toUpperCase();
    if (!friendCode) return res.status(400).json({ message: 'Friend code required' });

    var target = await User.findOne({ friendCode: friendCode });
    if (!target) return res.status(404).json({ message: 'No user with that friend code' });

    var alreadyMember = group.members.some(function (m) { return m._id.toString() === target._id.toString(); });
    if (alreadyMember) return res.status(400).json({ message: target.name + ' is already in this group' });

    // Notify the invited user via socket
    var io = req.app.get('io');
    if (io) {
      io.emitToUser(target._id, 'group_invite', {
        groupId:    group._id,
        groupName:  group.name,
        groupEmoji: group.emoji,
        inviterName: req.user.name
      });
    }
    res.json({ message: 'Invite sent to ' + target.name + '!' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/groups/:id/members  — list members
router.get('/:id/members', protect, async function (req, res) {
  try {
    var group = await Group.findById(req.params.id).populate('members', 'name email friendCode');
    if (!group) return res.status(404).json({ message: 'Not found' });
    res.json({ members: group.members });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/groups/:id
router.delete('/:id', protect, async function (req, res) {
  try {
    var group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.creator.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the creator can delete this group' });
    await group.deleteOne();
    res.json({ message: 'Group deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/groups/:id/meetlink
router.post('/:id/meetlink', protect, async function (req, res) {
  try {
    var group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Not found' });
    group.meetLinks.push({ url: req.body.url, label: req.body.label || 'Meeting Link', platform: req.body.platform || {}, addedBy: req.user._id });
    await group.save();
    res.json({ meetLinks: group.meetLinks });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/groups/:id/meetlink/:linkId
router.delete('/:id/meetlink/:linkId', protect, async function (req, res) {
  try {
    var group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Not found' });
    group.meetLinks = group.meetLinks.filter(function (l) { return l._id.toString() !== req.params.linkId; });
    await group.save();
    res.json({ meetLinks: group.meetLinks });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
