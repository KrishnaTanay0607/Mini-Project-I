import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

const PRIMARY = '#38bdf8';

const ProfileModal = ({ open, onClose, initialTab = 'profile' }) => {
  const { user, login, token } = useAuth();
  const [tab, setTab] = useState(initialTab || 'profile'); // 'profile' | 'settings' | 'notifications'
  const [name, setName]       = useState(user?.name || '');
  const [bio, setBio]         = useState(user?.bio || '');
  const [oldPw, setOldPw]     = useState('');
  const [newPw, setNewPw]     = useState('');
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState({ text:'', type:'' });

  const initials    = user?.name ? user.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : 'YO';
  const avatarColor = `hsl(${(user?.name?.charCodeAt(0)||65)*17%360},55%,40%)`;

  // Sync tab when dropdown opens to a specific section
  useEffect(() => { if (open) setTab(initialTab || 'profile'); }, [open, initialTab]);

  const STATS = [
    { icon:'📚', label:'Groups Joined', value:'4' },
    { icon:'📝', label:'Notes Created', value:'12' },
    { icon:'👍', label:'Files Upvoted', value:'31' },
    { icon:'🍅', label:'Pomodoros Done', value:'47' },
  ];

  const NOTIF_SETTINGS = [
    { key:'friend_req',    label:'Friend Requests',      sub:'When someone sends you a friend request', on:true },
    { key:'group_msg',     label:'Group Chat Messages',  sub:'New messages in groups you joined',        on:true },
    { key:'group_live',    label:'Group Goes Live',       sub:'When a meet link is added to your group', on:true },
    { key:'file_upload',   label:'New File Uploaded',     sub:'When someone uploads to your group',      on:false },
    { key:'note_edit',     label:'Note Edits',            sub:'When someone edits a shared note',        on:false },
  ];
  const [notifSettings, setNotifSettings] = useState(NOTIF_SETTINGS);

  const saveProfile = async () => {
    if (!name.trim()) { setMsg({ text:'Name cannot be empty', type:'error' }); return; }
    setSaving(true);
    try {
      const data = await api('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: name.trim(), bio: bio.trim() }),
      });
      login(data.user, token);
      setMsg({ text:'Profile updated! ✅', type:'success' });
    } catch (err) {
      setMsg({ text: err.message, type:'error' });
    } finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (!oldPw || !newPw) { setMsg({ text:'Fill both password fields', type:'error' }); return; }
    if (newPw.length < 6) { setMsg({ text:'New password must be 6+ characters', type:'error' }); return; }
    setSaving(true);
    try {
      await api('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw }),
      });
      setMsg({ text:'Password changed! ✅', type:'success' });
      setOldPw(''); setNewPw('');
    } catch (err) {
      setMsg({ text: err.message, type:'error' });
    } finally { setSaving(false); }
  };

  const TABS = [
    ['profile', '👤 Profile'],
    ['settings', '⚙️ Settings'],
    ['notifications', '🔔 Notifications'],
  ];

  return (
    <Modal open={open} onClose={() => { setMsg({text:'',type:''}); onClose(); }} title="My Account" width={500}>
      {/* Tab switcher */}
      <div style={{ display:'flex',gap:3,background:'rgba(255,255,255,.04)',borderRadius:10,padding:3,marginBottom:20 }}>
        {TABS.map(([v,l]) => (
          <button key={v} onClick={() => { setTab(v); setMsg({text:'',type:''}); }}
            style={{ flex:1,padding:'7px 8px',borderRadius:7,border:'none',cursor:'pointer',fontSize:11,fontWeight:700,fontFamily:"'Manrope',sans-serif",transition:'all .2s',background:tab===v?PRIMARY:'transparent',color:tab===v?'#040810':'#4a6080' }}>
            {l}
          </button>
        ))}
      </div>

      {/* ── PROFILE TAB ── */}
      {tab === 'profile' && (
        <div>
          {/* Avatar row */}
          <div style={{ display:'flex',alignItems:'center',gap:16,marginBottom:22,padding:'14px 16px',background:'rgba(56,189,248,.04)',borderRadius:12,border:'1px solid rgba(56,189,248,.1)' }}>
            <div style={{ width:56,height:56,borderRadius:'50%',background:`linear-gradient(135deg,${avatarColor},#1a2a4a)`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:18,color:'#fff',flexShrink:0 }}>{initials}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:900,color:'#e8f0f8' }}>{user?.name}</div>
              <div style={{ fontSize:11,color:'#4a6080',marginTop:1 }}>{user?.email}</div>
              {user?.friendCode && (
                <div style={{ display:'inline-flex',alignItems:'center',gap:5,marginTop:5,padding:'2px 8px',borderRadius:12,background:'rgba(56,189,248,.1)',color:PRIMARY,fontSize:10,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",letterSpacing:1 }}>
                  🔑 {user.friendCode}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:22 }}>
            {STATS.map(s => (
              <div key={s.label} style={{ background:'#0a0d12',borderRadius:9,padding:'12px 14px' }}>
                <div style={{ fontSize:17,marginBottom:4 }}>{s.icon}</div>
                <div style={{ fontFamily:"'Syne',sans-serif",fontSize:19,fontWeight:900,color:PRIMARY }}>{s.value}</div>
                <div style={{ fontSize:10,color:'#4a6080',fontWeight:600,marginTop:1,fontFamily:"'Manrope',sans-serif" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ padding:'10px 14px',background:'rgba(255,255,255,.03)',borderRadius:8,border:'1px solid rgba(255,255,255,.06)',fontSize:12,color:'#4a6080',display:'flex',justifyContent:'space-between',fontFamily:"'Manrope',sans-serif" }}>
            <span>Member since</span>
            <span style={{ color:'#7a96b4',fontWeight:600 }}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US',{month:'long',year:'numeric'}) : 'March 2026'}
            </span>
          </div>
        </div>
      )}

      {/* ── SETTINGS TAB ── */}
      {tab === 'settings' && (
        <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
          <div>
            <label style={{ fontSize:9,fontWeight:700,letterSpacing:1.5,color:'#4a6080',display:'block',marginBottom:6,fontFamily:"'Manrope',sans-serif" }}>DISPLAY NAME</label>
            <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/>
          </div>
          <div>
            <label style={{ fontSize:9,fontWeight:700,letterSpacing:1.5,color:'#4a6080',display:'block',marginBottom:6,fontFamily:"'Manrope',sans-serif" }}>BIO</label>
            <textarea className="input" value={bio} onChange={e=>setBio(e.target.value)} placeholder="Tell others about yourself..." rows={3} style={{ resize:'vertical' }}/>
          </div>
          <button className="btn btn-primary" onClick={saveProfile} disabled={saving}
            style={{ justifyContent:'center',padding:11,fontSize:13,opacity:saving?.6:1 }}>
            {saving ? '⏳ Saving...' : '💾 Save Changes'}
          </button>

          <div style={{ height:1,background:'rgba(255,255,255,.07)',margin:'4px 0' }}/>

          <div style={{ fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:'#e8f0f8',marginBottom:-4 }}>Change Password</div>
          <div>
            <label style={{ fontSize:9,fontWeight:700,letterSpacing:1.5,color:'#4a6080',display:'block',marginBottom:6,fontFamily:"'Manrope',sans-serif" }}>CURRENT PASSWORD</label>
            <input className="input" type="password" value={oldPw} onChange={e=>setOldPw(e.target.value)} placeholder="••••••••"/>
          </div>
          <div>
            <label style={{ fontSize:9,fontWeight:700,letterSpacing:1.5,color:'#4a6080',display:'block',marginBottom:6,fontFamily:"'Manrope',sans-serif" }}>NEW PASSWORD</label>
            <input className="input" type="password" value={newPw} onChange={e=>setNewPw(e.target.value)} placeholder="Min 6 characters"/>
          </div>
          <button className="btn btn-ghost" onClick={changePassword} disabled={saving}
            style={{ justifyContent:'center',padding:11,fontSize:13 }}>
            🔑 Change Password
          </button>

          {msg.text && (
            <div style={{ padding:'10px 14px',borderRadius:8,fontSize:12,fontFamily:"'Manrope',sans-serif",background:msg.type==='success'?'rgba(74,222,128,.1)':'rgba(248,113,113,.1)',border:`1px solid ${msg.type==='success'?'rgba(74,222,128,.25)':'rgba(248,113,113,.25)'}`,color:msg.type==='success'?'#4ade80':'#f87171' }}>
              {msg.text}
            </div>
          )}
        </div>
      )}

      {/* ── NOTIFICATIONS TAB ── */}
      {tab === 'notifications' && (
        <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
          <p style={{ fontSize:12,color:'#4a6080',marginBottom:12,fontFamily:"'Manrope',sans-serif" }}>
            Choose what you want to be notified about.
          </p>
          {notifSettings.map((n,i) => (
            <div key={n.key} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'13px 14px',borderRadius:10,background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',marginBottom:6 }}>
              <div>
                <div style={{ fontSize:13,fontWeight:700,color:'#e8f0f8',fontFamily:"'Manrope',sans-serif",marginBottom:2 }}>{n.label}</div>
                <div style={{ fontSize:11,color:'#4a6080',fontFamily:"'Manrope',sans-serif" }}>{n.sub}</div>
              </div>
              {/* Toggle */}
              <div
                onClick={() => setNotifSettings(ns => ns.map((x,j) => j===i ? {...x, on:!x.on} : x))}
                style={{ width:42,height:24,borderRadius:12,background:n.on?PRIMARY:'rgba(255,255,255,.1)',cursor:'pointer',position:'relative',transition:'background .2s',flexShrink:0 }}>
                <div style={{ position:'absolute',top:3,left:n.on?20:3,width:18,height:18,borderRadius:'50%',background:'#fff',transition:'left .2s',boxShadow:'0 1px 4px rgba(0,0,0,.3)' }}/>
              </div>
            </div>
          ))}
          <button className="btn btn-primary" style={{ marginTop:8,justifyContent:'center',padding:11,fontSize:13 }}
            onClick={() => setMsg({ text:'Notification settings saved! ✅', type:'success' })}>
            💾 Save Preferences
          </button>
          {msg.text && (
            <div style={{ padding:'10px 14px',borderRadius:8,fontSize:12,fontFamily:"'Manrope',sans-serif",background:'rgba(74,222,128,.1)',border:'1px solid rgba(74,222,128,.25)',color:'#4ade80' }}>
              {msg.text}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
export default ProfileModal;
