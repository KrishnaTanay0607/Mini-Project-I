import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../utils/api';
import { Icons } from '../../utils/icons';

const PRIMARY = '#38bdf8';

const Avatar = ({ name, size=40 }) => {
  const initials = name ? name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : '?';
  const bg = `hsl(${(name?.charCodeAt(0)||0)*17%360},55%,40%)`;
  return (
    <div style={{ width:size,height:size,borderRadius:'50%',background:`linear-gradient(135deg,${bg},#1a2a4a)`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:size*.32,color:'#fff',flexShrink:0 }}>
      {initials}
    </div>
  );
};

const FriendsPage = ({ toast }) => {
  const { user }                          = useAuth();
  const { socket }                        = useSocket();
  const [tab, setTab]                     = useState('friends');
  const [friends, setFriends]             = useState([]);
  const [requests, setRequests]           = useState([]);
  const [codeInput, setCodeInput]         = useState('');
  const [loading, setLoading]             = useState(false);
  const [copied, setCopied]               = useState(false);

  const loadFriends  = async () => { try { const d = await api('/api/friends');          setFriends(d.friends||[]);   } catch {} };
  const loadRequests = async () => { try { const d = await api('/api/friends/requests'); setRequests(d.requests||[]); } catch {} };
  useEffect(() => { loadFriends(); loadRequests(); }, []);

  // Live update — when someone sends us a request, refresh the list
  useEffect(() => {
    if (!socket) return;
    const handler = () => { loadRequests(); };
    socket.on('friend_request', handler);
    socket.on('friend_accepted', () => { loadFriends(); });
    return () => { socket.off('friend_request', handler); socket.off('friend_accepted', () => {}); };
  }, [socket]);

  const sendRequest = async () => {
    if (!codeInput.trim()) return;
    setLoading(true);
    try {
      const d = await api('/api/friends/add', { method:'POST', body: JSON.stringify({ friendCode: codeInput.trim() }) });
      toast(d.message || 'Request sent! 📨');
      setCodeInput('');
    } catch (err) { toast(`⚠️ ${err.message}`); }
    finally { setLoading(false); }
  };

  const respond = async (requesterId, action) => {
    try {
      const d = await api('/api/friends/respond', { method:'POST', body: JSON.stringify({ requesterId, action }) });
      toast(d.message);
      loadFriends(); loadRequests();
    } catch (err) { toast(`⚠️ ${err.message}`); }
  };

  const removeFriend = async (id) => {
    try { await api(`/api/friends/${id}`, { method:'DELETE' }); toast('Friend removed'); loadFriends(); }
    catch (err) { toast(`⚠️ ${err.message}`); }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(user?.friendCode || '');
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    toast('Friend code copied! 📋');
  };

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ maxWidth:860, margin:'0 auto' }}>
          <h1 className="fu">Friends</h1>
          <p className="fu d1">Connect with study partners using unique friend codes.</p>
        </div>
      </div>

      <div className="content" style={{ maxWidth:860 }}>
        {/* Friend code card */}
        <div className="fu card" style={{ padding:22,marginBottom:22,background:'linear-gradient(135deg,rgba(56,189,248,.06),rgba(167,139,250,.03))',border:'1px solid rgba(56,189,248,.15)' }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:14 }}>
            <div>
              <div style={{ fontSize:9,fontWeight:700,letterSpacing:2,color:PRIMARY,marginBottom:6 }}>YOUR FRIEND CODE</div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:32,fontWeight:900,color:'#e8f0f8',letterSpacing:6 }}>
                {user?.friendCode || '------'}
              </div>
              <div style={{ fontSize:12,color:'#4a6080',marginTop:4 }}>Share this code with friends so they can add you</div>
            </div>
            <button onClick={copyCode} className="btn btn-primary" style={{ fontSize:13,padding:'10px 20px' }}>
              {Icons.copy} {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex',gap:4,background:'rgba(255,255,255,.04)',borderRadius:10,padding:3,marginBottom:20 }}>
          {[['friends',`👥 Friends (${friends.length})`],['requests',`📨 Requests (${requests.length})`],['add','➕ Add Friend']].map(([v,l]) => (
            <button key={v} onClick={() => setTab(v)}
              style={{ flex:1,padding:'7px 10px',borderRadius:7,border:'none',cursor:'pointer',fontSize:12,fontWeight:700,transition:'all .2s',background:tab===v?PRIMARY:'transparent',color:tab===v?'#040810':'#4a6080' }}>
              {l}
            </button>
          ))}
        </div>

        {/* Friends list */}
        {tab === 'friends' && (
          friends.length === 0 ? (
            <div style={{ textAlign:'center',padding:'50px 20px',color:'#4a6080' }}>
              <div style={{ fontSize:48,marginBottom:12 }}>👋</div>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:'#7a96b4',marginBottom:6 }}>No friends yet</div>
              <p style={{ fontSize:13 }}>Share your code or search for friends using theirs.</p>
            </div>
          ) : (
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:12 }}>
              {friends.map(f => (
                <div key={f._id} className="card" style={{ padding:18,display:'flex',alignItems:'center',gap:12 }}>
                  <Avatar name={f.name}/>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:'#e8f0f8',marginBottom:2 }}>{f.name}</div>
                    <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:PRIMARY,letterSpacing:2 }}>{f.friendCode}</div>
                  </div>
                  <button onClick={() => removeFriend(f._id)}
                    style={{ background:'none',border:'none',color:'#4a6080',cursor:'pointer',fontSize:13,padding:4 }}
                    onMouseEnter={e=>e.currentTarget.style.color='#f87171'}
                    onMouseLeave={e=>e.currentTarget.style.color='#4a6080'}>
                    {Icons.trash}
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        {/* Requests */}
        {tab === 'requests' && (
          requests.length === 0 ? (
            <div style={{ textAlign:'center',padding:'50px 20px',color:'#4a6080' }}>
              <div style={{ fontSize:48,marginBottom:12 }}>📭</div>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:'#7a96b4' }}>No pending requests</div>
            </div>
          ) : (
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              {requests.map(r => (
                <div key={r._id} className="card" style={{ padding:16,display:'flex',alignItems:'center',gap:12 }}>
                  <Avatar name={r.from?.name}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:'#e8f0f8' }}>{r.from?.name}</div>
                    <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:'#4a6080' }}>{r.from?.friendCode}</div>
                  </div>
                  <div style={{ display:'flex',gap:8 }}>
                    <button className="btn btn-primary" style={{ padding:'6px 14px',fontSize:12 }} onClick={() => respond(String(r.from._id),'accept')}>{Icons.check} Accept</button>
                    <button className="btn btn-ghost"   style={{ padding:'6px 12px',fontSize:12 }} onClick={() => respond(String(r.from._id),'decline')}>Decline</button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Add friend */}
        {tab === 'add' && (
          <div className="card" style={{ padding:28,maxWidth:440 }}>
            <div style={{ fontSize:36,marginBottom:16,textAlign:'center' }}>🔍</div>
            <div style={{ fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:900,color:'#e8f0f8',marginBottom:6,textAlign:'center' }}>Add by Friend Code</div>
            <p style={{ fontSize:13,color:'#4a6080',textAlign:'center',marginBottom:22,lineHeight:1.6 }}>Ask your friend for their unique 6-character code and enter it below.</p>
            <label style={{ fontSize:9,fontWeight:700,letterSpacing:1.5,color:'#4a6080',display:'block',marginBottom:6 }}>FRIEND CODE</label>
            <input className="input" value={codeInput} onChange={e=>setCodeInput(e.target.value.toUpperCase().slice(0,6))}
              onKeyDown={e=>e.key==='Enter'&&sendRequest()} placeholder="XK9F2A" maxLength={6}
              style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:20,letterSpacing:6,textAlign:'center',marginBottom:14 }}/>
            <button className="btn btn-primary" onClick={sendRequest} disabled={loading||codeInput.length<6}
              style={{ width:'100%',justifyContent:'center',padding:12,fontSize:14,opacity:(loading||codeInput.length<6)?.5:1 }}>
              {loading ? '⏳ Sending...' : '📨 Send Friend Request'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default FriendsPage;
