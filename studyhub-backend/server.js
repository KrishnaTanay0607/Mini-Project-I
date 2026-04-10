require('dotenv').config();

// Force Google DNS before anything else — fixes laptop querySrv errors
var dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

var express  = require('express');
var http     = require('http');
var Server   = require('socket.io').Server;
var mongoose = require('mongoose');
var cors     = require('cors');
var path     = require('path');
var fs       = require('fs');
var jwt      = require('jsonwebtoken');
var User     = require('./models/User');
var Message  = require('./models/Message');

var app    = express();
var server = http.createServer(app);
var io     = new Server(server, {
  cors: { origin: 'http://localhost:3000', methods: ['GET','POST','DELETE'], credentials: true }
});

// Make io accessible to routes (for emitting notifications)
app.set('io', io);

var uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/groups',    require('./routes/groups'));
app.use('/api/notes',     require('./routes/notes'));
app.use('/api/friends',   require('./routes/friends'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/chat',      require('./routes/chat'));
app.get('/', function (req, res) { res.json({ status: 'ok', message: 'StudyHub API running' }); });

// ── Socket.io ─────────────────────────────────────────────────────
// Track connected users: userId -> socketId
var userSockets = {};
var groupRooms  = {};

io.use(async function (socket, next) {
  try {
    var token   = socket.handshake.auth.token;
    if (!token) return next(new Error('No token'));
    var decoded = jwt.verify(token, process.env.JWT_SECRET);
    var user    = await User.findById(decoded.id).select('name friendCode');
    if (!user)  return next(new Error('User not found'));
    socket.user = user;
    next();
  } catch (e) { next(new Error('Auth failed')); }
});

io.on('connection', function (socket) {
  var uid = socket.user._id.toString();
  userSockets[uid] = socket.id;
  console.log('Connected: ' + socket.user.name);

  socket.on('join_group', function (groupId) {
    var gid = String(groupId);
    socket.join('group:' + gid);
    if (!groupRooms[gid]) groupRooms[gid] = new Set();
    groupRooms[gid].add(socket.id);
    io.to('group:' + gid).emit('live_count', { groupId: gid, count: groupRooms[gid].size });
  });

  socket.on('leave_group', function (groupId) {
    var gid = String(groupId);
    socket.leave('group:' + gid);
    if (groupRooms[gid]) {
      groupRooms[gid].delete(socket.id);
      io.to('group:' + gid).emit('live_count', { groupId: gid, count: groupRooms[gid].size });
    }
  });

  socket.on('send_message', async function (data) {
    try {
      if (!data || !String(data.text || '').trim()) return;
      var msg = await Message.create({
        groupId: data.groupId,
        sender:  socket.user._id,
        text:    String(data.text).trim()
      });
      await msg.populate('sender', 'name friendCode');
      io.to('group:' + data.groupId).emit('new_message', {
        _id: msg._id, groupId: msg.groupId, text: msg.text,
        sender: { name: msg.sender.name, friendCode: msg.sender.friendCode },
        createdAt: msg.createdAt
      });
    } catch (e) { console.error('msg error:', e.message); }
  });

  socket.on('meet_link_added',   function (gId) { io.emit('group_is_live',  { groupId: gId }); });
  socket.on('meet_link_removed', function (gId) { io.emit('group_not_live', { groupId: gId }); });

  socket.on('disconnect', function () {
    delete userSockets[uid];
    Object.keys(groupRooms).forEach(function (gid) {
      if (groupRooms[gid]) {
        groupRooms[gid].delete(socket.id);
        io.to('group:' + gid).emit('live_count', { groupId: gid, count: groupRooms[gid].size });
      }
    });
    console.log('Disconnected: ' + socket.user.name);
  });
});

// Helper: emit to specific user by their userId
io.emitToUser = function (userId, event, data) {
  var sid = userSockets[String(userId)];
  if (sid) io.to(sid).emit(event, data);
};

// Helper: emit to all members of a group room
io.emitToGroup = function (groupId, event, data) {
  io.to('group:' + String(groupId)).emit(event, data);
};

// ── MongoDB ────────────────────────────────────────────────────────
var PORT      = process.env.PORT || 5000;
var MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) { console.error('ERROR: MONGO_URI missing from .env'); process.exit(1); }

var OPTS = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS:          60000,
  connectTimeoutMS:         30000,
  family: 4,
  maxPoolSize: 10
};

var serverStarted = false;
function startHTTP() {
  if (serverStarted) return;
  serverStarted = true;
  server.listen(PORT, function () {
    console.log('\n🚀  StudyHub API → http://localhost:' + PORT + '\n');
  });
}

function connectDB(attempt) {
  attempt = attempt || 1;
  console.log('Connecting to MongoDB Atlas (attempt ' + attempt + '/5)...');
  mongoose.connect(MONGO_URI, OPTS)
    .then(function () {
      console.log('✅  MongoDB Atlas connected!\n');
      startHTTP();
    })
    .catch(function (err) {
      var msg = String(err.message || '');
      console.error('❌  ' + msg);
      if (attempt < 5) {
        setTimeout(function () { connectDB(attempt + 1); }, 4000);
      } else {
        console.log('\n⚠️  Starting server without DB. Run: node test-connection.js for help\n');
        startHTTP();
      }
    });
}

connectDB();
