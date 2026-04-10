var express = require('express');
var Note    = require('../models/Note');
var Group   = require('../models/Group');
var { protect } = require('../middleware/auth');

var router = express.Router();

var validId = function (id) {
  return /^[0-9a-fA-F]{24}$/.test(String(id));
};

// GET /api/notes/personal  — get the logged-in user's personal (no-group) notes
router.get('/personal', protect, async function (req, res) {
  try {
    var notes = await Note.find({ groupId: null, author: req.user._id })
      .populate('author', 'name')
      .sort({ updatedAt: -1 });
    res.json({ notes: notes });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/notes/personal  — create a personal note (no group)
router.post('/personal', protect, async function (req, res) {
  try {
    var title   = req.body.title;
    var content = req.body.content || '';
    if (!title) return res.status(400).json({ message: 'title required' });
    var note = await Note.create({ groupId: null, title, content, author: req.user._id });
    await note.populate('author', 'name');
    res.status(201).json({ note: note });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/notes/:groupId
router.get('/:groupId', protect, async function (req, res) {
  try {
    if (!validId(req.params.groupId)) return res.json({ notes: [] });
    var notes = await Note.find({ groupId: req.params.groupId })
      .populate('author', 'name')
      .sort({ updatedAt: -1 });
    res.json({ notes: notes });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/notes — create note for a group
router.post('/', protect, async function (req, res) {
  try {
    var groupId = req.body.groupId;
    var title   = req.body.title;
    var content = req.body.content || '';
    if (!groupId || !title) return res.status(400).json({ message: 'groupId and title required' });
    if (!validId(groupId))  return res.status(400).json({ message: 'Invalid groupId' });

    var note = await Note.create({ groupId, title, content, author: req.user._id });
    await note.populate('author', 'name');

    // ── Notify group members ──
    var io = req.app.get('io');
    if (io) {
      var group = await Group.findById(groupId).select('name members');
      if (group) {
        io.emitToGroup(groupId, 'note_added', {
          groupName:  group.name,
          noteTitle:  title,
          authorName: req.user.name,
          groupId:    groupId
        });
      }
    }

    res.status(201).json({ note: note });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/notes/:id — update any note (personal or group), only author can edit
router.put('/:id', protect, async function (req, res) {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid note id' });
    var note = await Note.findOneAndUpdate(
      { _id: req.params.id, author: req.user._id },
      { title: req.body.title, content: req.body.content, updatedAt: new Date() },
      { new: true }
    ).populate('author', 'name');
    if (!note) return res.status(404).json({ message: 'Note not found or not yours' });
    res.json({ note: note });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/notes/:id
router.delete('/:id', protect, async function (req, res) {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid note id' });
    var note = await Note.findOneAndDelete({ _id: req.params.id, author: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found or not yours' });
    res.json({ message: 'Note deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
