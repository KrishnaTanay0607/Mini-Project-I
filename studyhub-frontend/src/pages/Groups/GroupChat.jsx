import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

const PRIMARY = '#38bdf8';

const GroupChat = ({ group, socket }) => {
  const { user }                        = useAuth();
  const [messages,  setMessages]        = useState([]);
  const [input,     setInput]           = useState('');
  const [loading,   setLoading]         = useState(true);
  const [liveCount, setLiveCount]       = useState(0);
  const bottomRef                       = useRef(null);
  const inputRef                        = useRef(null);
  const joinedRef                       = useRef(false);

  // Always compare as strings — MongoDB ObjectId vs number mismatch was breaking chat
  const gid = group ? String(group._id || group.id) : null;
  const gc  = group?.color || PRIMARY;

  // Load history whenever group changes
  useEffect(() => {
    if (!gid || !gid.match(/^[0-9a-fA-F]{24}$/)) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setMessages([]);
    api(`/api/chat/${gid}`)
      .then(d => setMessages(d.messages || []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [gid]);

  // Socket events
  useEffect(() => {
    if (!socket || !gid) return;
    if (!joinedRef.current) {
      socket.emit('join_group', gid);
      joinedRef.current = true;
    }

    const handleMsg = (msg) => {
      if (String(msg.groupId) !== gid) return;
      setMessages(prev => {
        if (prev.some(m => String(m._id) === String(msg._id))) return prev;
        return [...prev, msg];
      });
    };

    const handleCount = ({ groupId, count }) => {
      if (String(groupId) === gid) setLiveCount(Number(count) || 0);
    };

    socket.on('new_message', handleMsg);
    socket.on('live_count',  handleCount);

    return () => {
      socket.off('new_message', handleMsg);
      socket.off('live_count',  handleCount);
    };
  }, [socket, gid]);

  // Leave group when component unmounts or group changes
  useEffect(() => {
    return () => {
      if (socket && gid && joinedRef.current) {
        socket.emit('leave_group', gid);
        joinedRef.current = false;
      }
    };
  }, [socket, gid]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    const txt = input.trim();
    if (!txt || !socket || !gid) return;
    socket.emit('send_message', { groupId: gid, text: txt });
    setInput('');
    inputRef.current?.focus();
  };

  const fmt = ts => ts ? new Date(ts).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : '';

  // Seed group — no chat
  if (gid && !gid.match(/^[0-9a-fA-F]{24}$/)) {
    return (
      <div style={{ display:'flex', flexDirection:'column', height:'100%', alignItems:'center', justifyContent:'center', gap:10, color:'#4a6080' }}>
        <div style={{ fontSize:32 }}>💬</div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:'#7a96b4' }}>Chat unavailable for demo groups</div>
        <div style={{ fontSize:12 }}>Join or create a real group to use chat.</div>
      </div>
    );
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', minHeight:0 }}>

      {/* Header */}
      <div style={{ padding:'10px 14px', borderBottom:'1px solid rgba(255,255,255,.07)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, background:'rgba(255,255,255,.02)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <span style={{ fontSize:16 }}>💬</span>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:800, color:'#e8f0f8' }}>Group Chat</div>
            <div style={{ fontSize:10, color:'#4a6080' }}>{group?.name}</div>
          </div>
        </div>
        {liveCount > 0 && (
          <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'#4ade80', fontWeight:700 }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:'#4ade80', animation:'pulse 1.5s infinite' }}/>{liveCount} online
          </span>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
        {loading ? (
          <div style={{ textAlign:'center', color:'#4a6080', fontSize:12, padding:'30px 0' }}>
            <div style={{ fontSize:24, marginBottom:8, animation:'pulse 1s infinite' }}>💬</div>Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign:'center', color:'#4a6080', fontSize:12, padding:'30px 0' }}>
            <div style={{ fontSize:32, marginBottom:8 }}>👋</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:'#7a96b4', marginBottom:4 }}>No messages yet</div>
            Be the first to say something!
          </div>
        ) : messages.map((msg, i) => {
          const isMe = msg.sender?.name === user?.name;
          return (
            <div key={String(msg._id || i)} style={{ display:'flex', flexDirection:'column', alignItems:isMe?'flex-end':'flex-start' }}>
              {!isMe && (
                <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:3 }}>
                  <div style={{ width:18, height:18, borderRadius:'50%', background:gc+'33', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:900, color:gc }}>
                    {(msg.sender?.name||'?')[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize:10, color:'#7a96b4', fontWeight:600 }}>{msg.sender?.name}</span>
                </div>
              )}
              <div style={{ maxWidth:'78%', padding:'9px 13px', borderRadius:isMe?'14px 14px 4px 14px':'14px 14px 14px 4px', background:isMe?gc+'20':'rgba(255,255,255,.06)', border:`1px solid ${isMe?gc+'40':'rgba(255,255,255,.09)'}`, fontSize:13, color:'#e8f0f8', lineHeight:1.55, wordBreak:'break-word' }}>
                {msg.text}
              </div>
              <span style={{ fontSize:9, color:'#4a6080', marginTop:2 }}>{fmt(msg.createdAt)}</span>
            </div>
          );
        })}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{ padding:'10px 14px', borderTop:'1px solid rgba(255,255,255,.07)', display:'flex', gap:8, flexShrink:0, background:'rgba(255,255,255,.02)' }}>
        <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e => e.key==='Enter' && !e.shiftKey && (e.preventDefault(), send())}
          placeholder="Type a message... (Enter to send)" maxLength={1000}
          style={{ flex:1, padding:'9px 13px', background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.09)', borderRadius:9, color:'#e8f0f8', fontSize:13, outline:'none', transition:'border-color .2s' }}
          onFocus={e=>e.target.style.borderColor=gc}
          onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.09)'}/>
        <button onClick={send} disabled={!input.trim()}
          style={{ padding:'9px 16px', borderRadius:9, background:input.trim()?gc:'rgba(255,255,255,.05)', color:input.trim()?'#05080c':'#4a6080', border:'none', cursor:input.trim()?'pointer':'default', fontWeight:700, fontSize:14, transition:'all .2s', flexShrink:0 }}>
          ➤
        </button>
      </div>
    </div>
  );
};

export default GroupChat;
