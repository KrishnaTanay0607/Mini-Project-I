import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const PRIMARY = '#38bdf8';

const ProfileDropdown = ({ onOpenProfile, setPage }) => {
  const { user, logout } = useAuth();
  const [open, setOpen]  = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (!user) {
    return (
      <button onClick={() => onOpenProfile?.()}
        style={{ width:32,height:32,borderRadius:'50%',background:'#1a2a4a',border:'1px solid rgba(56,189,248,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:11,color:PRIMARY,cursor:'pointer' }}>
        ?
      </button>
    );
  }

  const initials    = user.name ? user.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : 'YO';
  const avatarColor = `hsl(${(user.name?.charCodeAt(0)||65)*17%360},55%,40%)`;

  const items = [
    { icon:'👤', label:'View Profile',   action:() => { onOpenProfile?.('profile');       setOpen(false); } },
    { icon:'⚙️', label:'Settings',        action:() => { onOpenProfile?.('settings');      setOpen(false); } },
    { icon:'🔔', label:'Notifications',   action:() => { onOpenProfile?.('notifications'); setOpen(false); } },
    { icon:'👥', label:'Friends',         action:() => { setPage?.('friends');             setOpen(false); } },
  ];

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width:32,height:32,borderRadius:'50%',background:`linear-gradient(135deg,${avatarColor},#1a2a4a)`,border:`2px solid ${open?PRIMARY:'rgba(56,189,248,.2)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:11,color:'#fff',cursor:'pointer',transition:'border-color .2s' }}>
        {initials}
      </button>

      {open && (
        <div style={{ position:'fixed',top:64,right:16,background:'#0d1117',border:'1px solid rgba(56,189,248,.18)',borderRadius:14,padding:6,minWidth:240,boxShadow:'0 24px 64px rgba(0,0,0,.85)',zIndex:9999 }}>
          {/* User info header */}
          <div style={{ padding:'12px 14px',borderBottom:'1px solid rgba(255,255,255,.07)',marginBottom:4 }}>
            <div style={{ display:'flex',alignItems:'center',gap:10 }}>
              <div style={{ width:40,height:40,borderRadius:'50%',background:`linear-gradient(135deg,${avatarColor},#1a2a4a)`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:14,color:'#fff',flexShrink:0 }}>{initials}</div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontWeight:700,fontSize:13,color:'#e8f0f8',fontFamily:"'Syne',sans-serif",overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{user.name}</div>
                <div style={{ fontSize:11,color:'#4a6080',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{user.email}</div>
                {user.friendCode && (
                  <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:PRIMARY,fontWeight:700,marginTop:2,letterSpacing:1 }}>
                    🔑 {user.friendCode}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Menu items */}
          {items.map(item => (
            <button key={item.label} onClick={item.action}
              style={{ width:'100%',padding:'9px 14px',background:'transparent',border:'none',borderRadius:8,display:'flex',alignItems:'center',gap:10,cursor:'pointer',transition:'background .15s',textAlign:'left',color:'#7a96b4',fontSize:13 }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(56,189,248,.07)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              <span style={{ fontSize:15 }}>{item.icon}</span>
              <span style={{ fontWeight:600,fontFamily:"'Manrope',sans-serif" }}>{item.label}</span>
            </button>
          ))}

          <div style={{ height:1,background:'rgba(255,255,255,.07)',margin:'4px 0' }}/>

          <button onClick={() => { logout(); setOpen(false); }}
            style={{ width:'100%',padding:'9px 14px',background:'transparent',border:'none',borderRadius:8,display:'flex',alignItems:'center',gap:10,cursor:'pointer',color:'#f87171',fontSize:13,transition:'background .15s' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(248,113,113,.08)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
            <span style={{ fontSize:15 }}>🚪</span>
            <span style={{ fontWeight:700,fontFamily:"'Manrope',sans-serif" }}>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};
export default ProfileDropdown;
