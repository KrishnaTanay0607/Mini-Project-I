import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

/* ══ LIVE NOTIFICATION TOAST ════════════════════════════════════════
   Renders a rich popup in the bottom-right corner.
   Friend requests show Accept / Decline buttons.
   Automatically dismisses after 6 seconds.
═══════════════════════════════════════════════════════════════════ */
const ACCENT = '#38bdf8';

const typeStyle = {
  note:           { border: 'rgba(56,189,248,.25)',  bg: 'rgba(56,189,248,.07)'  },
  file:           { border: 'rgba(56,189,248,.25)',  bg: 'rgba(56,189,248,.07)'  },
  friend_request: { border: 'rgba(167,139,250,.3)',  bg: 'rgba(167,139,250,.07)' },
  friend_accepted:{ border: 'rgba(74,222,128,.25)',  bg: 'rgba(74,222,128,.07)'  },
  group_invite:   { border: 'rgba(251,191,36,.25)',  bg: 'rgba(251,191,36,.07)'  },
  member:         { border: 'rgba(74,222,128,.25)',  bg: 'rgba(74,222,128,.07)'  },
};

const LiveToast = ({ notif, onDismiss, onAcceptFriend, onDeclineFriend }) => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Slide in
    const t1 = setTimeout(() => setVisible(true), 30);
    // Auto-dismiss after 6s (friend requests stay 10s)
    const delay = notif.type === 'friend_request' ? 10000 : 6000;
    const t2 = setTimeout(() => dismiss(), delay);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);                                              // eslint-disable-line

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => onDismiss(notif.id), 380);
  };

  const ts    = typeStyle[notif.type] || typeStyle.note;
  const style = {
    transition:   'all .38s cubic-bezier(.34,1.56,.64,1)',
    transform:    visible && !leaving ? 'translateX(0)' : 'translateX(420px)',
    opacity:      visible && !leaving ? 1 : 0,
    marginBottom: 10,
    background:   '#0d1117',
    border:       `1px solid ${ts.border}`,
    borderLeft:   `4px solid ${ts.border.replace('rgba','rgb').replace(/,[^,)]+\)/, ')')}`,
    borderRadius: 13,
    padding:      '13px 14px',
    width:        360,
    boxShadow:    '0 18px 50px rgba(0,0,0,.8)',
    display:      'flex',
    gap:          12,
    alignItems:   'flex-start',
    position:     'relative',
  };

  return (
    <div style={style}>
      {/* Icon */}
      <span style={{ fontSize: 22, lineHeight: 1.3, flexShrink: 0 }}>{notif.icon}</span>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#e8f0f8', lineHeight: 1.4, fontFamily: "'Manrope',sans-serif" }}>
          {notif.text}
        </div>
        {notif.sub && (
          <div style={{ fontSize: 11, color: '#4a6080', marginTop: 3, fontFamily: "'Manrope',sans-serif", lineHeight: 1.4 }}>
            {notif.sub}
          </div>
        )}

        {/* Friend request action buttons */}
        {notif.type === 'friend_request' && notif.senderId && (
          <div style={{ display: 'flex', gap: 7, marginTop: 10 }}>
            <button
              onClick={() => { onAcceptFriend(notif.senderId); dismiss(); }}
              style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: '1px solid rgba(74,222,128,.3)', background: 'rgba(74,222,128,.1)', color: '#4ade80', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: "'Manrope',sans-serif" }}>
              ✅ Accept
            </button>
            <button
              onClick={() => { onDeclineFriend(notif.senderId); dismiss(); }}
              style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: '1px solid rgba(248,113,113,.3)', background: 'rgba(248,113,113,.1)', color: '#f87171', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: "'Manrope',sans-serif" }}>
              ❌ Decline
            </button>
          </div>
        )}

        {/* Group invite — show a Go to Groups hint */}
        {notif.type === 'group_invite' && (
          <div style={{ marginTop: 6, fontSize: 10, color: '#fbbf24', fontWeight: 600, fontFamily: "'Manrope',sans-serif" }}>
            Open Groups page to join 👆
          </div>
        )}
      </div>

      {/* Dismiss ✕ */}
      <button onClick={dismiss}
        style={{ background: 'none', border: 'none', color: '#4a6080', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 2px', flexShrink: 0 }}
        onMouseEnter={e => e.target.style.color = '#f87171'}
        onMouseLeave={e => e.target.style.color = '#4a6080'}>
        ×
      </button>

      {/* Auto-dismiss progress bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, borderRadius: '0 0 13px 13px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          background: `linear-gradient(90deg, ${ACCENT}, #a78bfa)`,
          animation: `shrink ${notif.type === 'friend_request' ? 10 : 6}s linear forwards`,
        }}/>
      </div>
      <style>{`@keyframes shrink { from { width:100%; } to { width:0%; } }`}</style>
    </div>
  );
};

/* ══ SOCKET PROVIDER ════════════════════════════════════════════ */
export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const socketRef  = useRef(null);
  const [liveGroups,    setLiveGroups]    = useState(new Set());
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [liveToasts,    setLiveToasts]    = useState([]);   // queue of popup toasts

  /* ── helpers ── */
  const addNotif = useCallback((notif) => {
    const item = { ...notif, id: Date.now() + Math.random(), time: new Date(), read: false };
    setNotifications(prev => [item, ...prev].slice(0, 50));
    setUnreadCount(c => c + 1);
    // Also show live popup (max 3 stacked)
    setLiveToasts(prev => [...prev, item].slice(-3));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotif = useCallback((id) => {
    setNotifications(prev => {
      const notif = prev.find(n => n.id === id);
      if (notif && !notif.read) setUnreadCount(c => Math.max(0, c - 1));
      return prev.filter(n => n.id !== id);
    });
  }, []);

  const dismissToast = useCallback((id) => {
    setLiveToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  /* ── Accept / Decline friend request directly from toast ── */
  const respondFriend = useCallback(async (requesterId, action) => {
    try {
      const token = localStorage.getItem('sh_token');
      await fetch('http://localhost:5000/api/friends/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ requesterId, action }),
      });
    } catch { /* silent */ }
  }, []);

  /* ── Socket setup ── */
  useEffect(() => {
    if (!token) return;
    const socket = io('http://localhost:5000', {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });
    socketRef.current = socket;

    socket.on('connect',       () => console.log('🔌 Socket connected'));
    socket.on('connect_error', e  => console.warn('⚠️ Socket error:', e.message));

    // Group live status
    socket.on('group_is_live',  ({ groupId }) => setLiveGroups(p => new Set([...p, String(groupId)])));
    socket.on('group_not_live', ({ groupId }) => setLiveGroups(p => { const n = new Set(p); n.delete(String(groupId)); return n; }));

    // Friend request — includes senderId for inline Accept/Decline
    socket.on('friend_request', ({ from, friendCode, senderId }) => {
      addNotif({
        icon: '👥', type: 'friend_request',
        text: `${from} sent you a friend request`,
        sub: `Friend code: ${friendCode}`,
        action: 'friends',
        senderId,
      });
    });

    // Friend accepted
    socket.on('friend_accepted', ({ name }) => {
      addNotif({ icon: '🤝', type: 'friend_accepted', text: `${name} accepted your friend request!`, action: 'friends' });
    });

    // Group invite
    socket.on('group_invite', ({ groupName, groupEmoji, inviterName }) => {
      addNotif({
        icon: groupEmoji || '📚', type: 'group_invite',
        text: `${inviterName} invited you to ${groupName}`,
        sub: 'Go to Groups to join',
        action: 'groups',
      });
    });

    // New note in group
    socket.on('note_added', ({ groupName, noteTitle, authorName }) => {
      addNotif({
        icon: '📝', type: 'note',
        text: `New note in ${groupName}`,
        sub: `"${noteTitle}" by ${authorName}`,
        action: 'notes',
      });
    });

    // New file uploaded to group
    socket.on('file_added', ({ groupName, fileName, uploaderName }) => {
      addNotif({
        icon: '📁', type: 'file',
        text: `New file in ${groupName}`,
        sub: `"${fileName}" by ${uploaderName}`,
        action: 'library',
      });
    });

    // Member joined
    socket.on('member_joined', ({ groupName, memberName }) => {
      addNotif({ icon: '🎉', type: 'member', text: `${memberName} joined ${groupName}`, action: 'groups' });
    });

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [token, addNotif]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, liveGroups, notifications, unreadCount, markAllRead, clearNotif, addNotif }}>
      {children}

      {/* ── Live popup toasts ── */}
      {liveToasts.length > 0 && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 99999, display: 'flex', flexDirection: 'column-reverse', alignItems: 'flex-end' }}>
          {liveToasts.map(t => (
            <LiveToast
              key={t.id}
              notif={t}
              onDismiss={dismissToast}
              onAcceptFriend={(sid) => respondFriend(sid, 'accept')}
              onDeclineFriend={(sid) => respondFriend(sid, 'decline')}
            />
          ))}
        </div>
      )}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
