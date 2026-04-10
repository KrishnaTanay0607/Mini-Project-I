var express  = require('express');
var multer   = require('multer');
var path     = require('path');
var fs       = require('fs');
var Resource = require('../models/Resource');
var Group    = require('../models/Group');
var { protect } = require('../middleware/auth');

var router  = express.Router();
var UPLOADS = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS)) fs.mkdirSync(UPLOADS, { recursive: true });

var validId = function (id) { return /^[0-9a-fA-F]{24}$/.test(String(id)); };

var sizeStr = function (b) {
  if (!b) return '0 B';
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
};

var getExt = function (mime, name) {
  if (mime === 'application/pdf') return 'PDF';
  if (mime.startsWith('image/'))  return 'IMAGE';
  if (mime.startsWith('video/'))  return 'VIDEO';
  if (mime.includes('wordprocessingml')) return 'DOC';
  if (mime === 'text/markdown' || mime === 'text/plain') return 'MD';
  if (mime.includes('ipynb') || String(name).endsWith('.ipynb')) return 'NOTEBOOK';
  if (mime.includes('zip')) return 'ZIP';
  return String(name || '').split('.').pop().toUpperCase() || 'FILE';
};

var storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, UPLOADS); },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_'));
  }
});
var upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });

// GET /api/resources/:groupId
router.get('/:groupId', protect, async function (req, res) {
  try {
    if (!validId(req.params.groupId)) return res.json({ resources: [] });
    var uid  = req.user._id.toString();
    var list = await Resource.find({ groupId: req.params.groupId })
      .populate('uploader', 'name').populate('comments.author', 'name').sort({ createdAt: -1 });
    res.json({ resources: list.map(function (r) {
      return Object.assign({}, r.toObject(), {
        sizeFormatted: sizeStr(r.size || 0),
        voted:   r.votedBy.map(function (v) { return v.toString(); }).includes(uid),
        fileUrl: r.filename ? 'http://localhost:5000/uploads/' + r.filename : null
      });
    })});
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/resources/upload
router.post('/upload', protect, upload.single('file'), async function (req, res) {
  try {
    if (!req.file)           return res.status(400).json({ message: 'No file uploaded' });
    if (!req.body.groupId)   return res.status(400).json({ message: 'groupId required' });
    if (!validId(req.body.groupId)) return res.status(400).json({ message: 'Invalid groupId' });

    var doc = await Resource.create({
      groupId:  req.body.groupId,
      name:     String(req.body.name || req.file.originalname).trim(),
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size:     req.file.size,
      ext:      getExt(req.file.mimetype, req.file.originalname),
      uploader: req.user._id
    });
    await doc.populate('uploader', 'name');

    // Notify group members via socket
    var io = req.app.get('io');
    if (io) {
      try {
        var group = await Group.findById(req.body.groupId).select('name');
        if (group) {
          io.emitToGroup(req.body.groupId, 'file_added', {
            groupName: group.name, fileName: doc.name,
            uploaderName: req.user.name, groupId: req.body.groupId
          });
        }
      } catch (e) { /* non-fatal */ }
    }

    res.status(201).json({ resource: Object.assign({}, doc.toObject(), {
      sizeFormatted: sizeStr(doc.size),
      fileUrl: 'http://localhost:5000/uploads/' + doc.filename,
      voted: false
    })});
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/resources/:id/vote
router.post('/:id/vote', protect, async function (req, res) {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid id' });
    var doc = await Resource.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    var uid   = req.user._id.toString();
    var voted = doc.votedBy.map(function (v) { return v.toString(); }).includes(uid);
    if (voted) { doc.votedBy = doc.votedBy.filter(function (v) { return v.toString() !== uid; }); doc.upvotes = Math.max(0, doc.upvotes - 1); }
    else       { doc.votedBy.push(req.user._id); doc.upvotes += 1; }
    await doc.save();
    res.json({ upvotes: doc.upvotes, voted: !voted });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/resources/:id/comment
router.post('/:id/comment', protect, async function (req, res) {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid id' });
    if (!req.body.text || !req.body.text.trim()) return res.status(400).json({ message: 'Text required' });
    var doc = await Resource.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    doc.comments.push({ author: req.user._id, text: req.body.text.trim() });
    await doc.save();
    await doc.populate('comments.author', 'name');
    res.json({ comments: doc.comments });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/resources/:id/comment/:cid
router.delete('/:id/comment/:cid', protect, async function (req, res) {
  try {
    var doc = await Resource.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    doc.comments = doc.comments.filter(function (c) { return c._id.toString() !== req.params.cid; });
    await doc.save();
    res.json({ message: 'Comment deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/resources/:id
router.delete('/:id', protect, async function (req, res) {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid id' });
    var doc = await Resource.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    if (String(doc.uploader) !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    if (doc.filename) { var fp = path.join(UPLOADS, doc.filename); if (fs.existsSync(fp)) fs.unlinkSync(fp); }
    await doc.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
