import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../../utils/icons';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import ProfileDropdown from '../../pages/Auth/ProfileDropdown';

const PRIMARY = '#38bdf8';

const NAV = [
  { id:'home',    l:'Home',    ic:Icons.home  },
  { id:'groups',  l:'Groups',  ic:Icons.users },
  { id:'notes',   l:'Notes',   ic:Icons.notes },
  { id:'library', l:'Library', ic:Icons.book  },
  { id:'timer',   l:'Timer',   ic:Icons.timer },
  { id:'friends', l:'Friends', ic:Icons.users },
];

const fmtTime = (d) => {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60)    return 'just now';
  if (s < 3600)  return Math.floor(s/60) + 'm ago';
  if (s < 86400) return Math.floor(s/3600) + 'h ago';
  return Math.floor(s/86400) + 'd ago';
};

const Navbar = ({ page, setPage, onNewGroup, onOpenProfile }) => {
  const { user }                                           = useAuth();
  const { notifications, unreadCount, markAllRead, clearNotif } = useSocket();
  const [showNotifs, setShowNotifs]                        = useState(false);
  const ref                                                = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setShowNotifs(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const toggleNotifs = () => {
    const next = !showNotifs;
    setShowNotifs(next);
    if (next) markAllRead();
  };

  return (
    <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:500,height:58,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 22px',background:'rgba(6,8,10,.95)',backdropFilter:'blur(18px)',borderBottom:'1px solid rgba(56,189,248,.08)' }}>
      {/* Logo */}
      <button onClick={() => setPage('home')} style={{ display:'flex',alignItems:'center',gap:9,background:'none',border:'none',cursor:'pointer' }}>
        <div style={{ width:32,height:32,borderRadius:8,background:PRIMARY,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,animation:'glow 3s ease infinite' }}>📚</div>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:16,color:'#e8f0f8',lineHeight:1.1 }}>StudyHub</div>
          <div style={{ fontSize:8,color:PRIMARY,fontWeight:700,letterSpacing:2 }}>STUDY SMARTER</div>
        </div>
      </button>

      {/* Nav links */}
      <div style={{ display:'flex',gap:2,background:'rgba(255,255,255,.04)',borderRadius:10,padding:3 }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)}
            style={{ display:'flex',alignItems:'center',gap:5,padding:'5px 13px',borderRadius:7,border:'none',cursor:'pointer',fontSize:12,fontWeight:700,fontFamily:"'Manrope',sans-serif",transition:'all .2s',background:page===n.id?PRIMARY:'transparent',color:page===n.id?'#040810':'#4a6080' }}>
            {n.ic}{n.l}
          </button>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display:'flex',gap:8,alignItems:'center' }}>
        {/* Notification bell */}
        <div ref={ref} style={{ position:'relative' }}>
          <button onClick={toggleNotifs} className="btn btn-ghost"
            style={{ padding:'5px 9px',position:'relative' }}>
            {Icons.bell}
            {unreadCount > 0 ? (
              <span style={{ position:'absolute',top:1,right:1,minWidth:16,height:16,borderRadius:8,background:'#f87171',color:'#fff',fontSize:9,fontWeight:900,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 3px',lineHeight:1 }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : (
              <span style={{ position:'absolute',top:3,right:3,width:5,height:5,borderRadius:'50%',background:PRIMARY,animation:'pulse 2s infinite' }}/>
            )}
          </button>

          {showNotifs && (
            <div style={{ position:'fixed',top:64,right:60,background:'#0d1117',border:'1px solid rgba(56,189,248,.15)',borderRadius:14,padding:8,width:320,boxShadow:'0 24px 64px rgba(0,0,0,.85)',zIndex:9999,maxHeight:440,display:'flex',flexDirection:'column' }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'4px 8px 10px',borderBottom:'1px solid rgba(255,255,255,.07)',marginBottom:4,flexShrink:0 }}>
                <span style={{ fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,color:'#e8f0f8' }}>Notifications</span>
                {notifications.length > 0 && (
                  <button onClick={markAllRead} style={{ background:'none',border:'none',color:PRIMARY,fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:"'Manrope',sans-serif" }}>
                    Clear all
                  </button>
                )}
              </div>

              <div style={{ overflowY:'auto',flex:1 }}>
                {notifications.length === 0 ? (
                  <div style={{ padding:'28px 12px',textAlign:'center',color:'#4a6080' }}>
                    <div style={{ fontSize:30,marginBottom:8 }}>🔔</div>
                    <div style={{ fontSize:12,fontFamily:"'Manrope',sans-serif" }}>No notifications yet</div>
                    <div style={{ fontSize:11,color:'#3a5060',marginTop:4 }}>Friend requests, new files & notes appear here</div>
                  </div>
                ) : notifications.map(n => (
                  <div key={n.id}
                    onClick={() => { if (n.action) { setPage(n.action); setShowNotifs(false); } }}
                    style={{ padding:'9px 10px',borderRadius:8,display:'flex',alignItems:'flex-start',gap:10,cursor:n.action?'pointer':'default',transition:'background .15s',background:n.read?'transparent':'rgba(56,189,248,.04)',marginBottom:2 }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(56,189,248,.08)'}
                    onMouseLeave={e => e.currentTarget.style.background=n.read?'transparent':'rgba(56,189,248,.04)'}>
                    <span style={{ fontSize:20,flexShrink:0,lineHeight:1.4 }}>{n.icon}</span>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:12,color:'#c0d0e0',lineHeight:1.4,fontFamily:"'Manrope',sans-serif",fontWeight:n.read?400:600 }}>{n.text}</div>
                      {n.sub && <div style={{ fontSize:10,color:'#4a6080',marginTop:2,fontFamily:"'Manrope',sans-serif" }}>{n.sub}</div>}
                      <div style={{ fontSize:10,color:'#3a5060',marginTop:3,fontFamily:"'Manrope',sans-serif" }}>{fmtTime(n.time)}</div>
                    </div>
                    <div style={{ display:'flex',alignItems:'center',gap:4,flexShrink:0 }}>
                      {!n.read && <span style={{ width:6,height:6,borderRadius:'50%',background:PRIMARY }}/>}
                      <button onClick={e=>{e.stopPropagation();clearNotif(n.id);}}
                        style={{ background:'none',border:'none',color:'#4a6080',cursor:'pointer',fontSize:14,lineHeight:1,padding:'1px 3px' }}
                        onMouseEnter={e=>e.target.style.color='#f87171'}
                        onMouseLeave={e=>e.target.style.color='#4a6080'}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button className="btn btn-primary" onClick={onNewGroup} style={{ fontSize:12,padding:'6px 14px' }}>
          {Icons.plus} New Group
        </button>

        <ProfileDropdown onOpenProfile={onOpenProfile} setPage={setPage}/>
      </div>
    </nav>
  );
};

export default Navbar;
