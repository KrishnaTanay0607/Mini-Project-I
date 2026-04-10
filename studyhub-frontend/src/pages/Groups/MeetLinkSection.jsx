import React, { useState } from 'react';
import { Icons } from '../../utils/icons';
import { api } from '../../utils/api';

const PLATFORM = {
  'meet.google.com':    { name:'Google Meet', color:'#4ade80', emoji:'📹' },
  'zoom.us':            { name:'Zoom',        color:'#60a5fa', emoji:'🟦' },
  'teams.microsoft.com':{ name:'MS Teams',    color:'#a78bfa', emoji:'💜' },
  'discord.gg':         { name:'Discord',     color:'#818cf8', emoji:'🎮' },
  'whereby.com':        { name:'Whereby',     color:'#f472b6', emoji:'🟣' },
};

const detectPlatform = (url) => {
  try {
    const host = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.','');
    return PLATFORM[host] || { name:'Meeting Link', color:'#38bdf8', emoji:'🔗' };
  } catch {
    return { name:'Meeting Link', color:'#38bdf8', emoji:'🔗' };
  }
};

/* ── MeetLinkSection ──────────────────────────────────────────────────────── */
const MeetLinkSection = ({ groupId, meetLinks, onAddLink, onDeleteLink, isJoined }) => {
  const [input, setInput]   = useState('');
  const [label, setLabel]   = useState('');
  const [adding, setAdding] = useState(false);
  const [copied, setCopied] = useState(null);

  if (!isJoined) return null;

  const handleAdd = () => {
    if (!input.trim()) return;
    const url      = input.startsWith('http') ? input.trim() : `https://${input.trim()}`;
    const platform = detectPlatform(url);
    const link     = { id: Date.now(), url, label: label.trim() || platform.name, platform };
    onAddLink(groupId, link);       // parent updates group state + emits socket
    setInput(''); setLabel(''); setAdding(false);
  };

  const handleDelete = (linkId) => {
    onDeleteLink(groupId, linkId);  // parent updates group state + handles live status
  };

  const copyLink = (id, url) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{ marginTop:20, borderTop:'1px solid rgba(255,255,255,.07)', paddingTop:18 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:'rgba(56,189,248,.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>📹</div>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:800, color:'#e8f0f8' }}>Meeting Links</div>
            <div style={{ fontSize:10, color:'#4a6080' }}>
              {meetLinks.length === 0 ? 'No links yet' : `${meetLinks.length} link${meetLinks.length!==1?'s':''} — group is LIVE`}
            </div>
          </div>
        </div>
        <button onClick={() => setAdding(a => !a)} className="btn btn-teal" style={{ padding:'5px 12px', fontSize:11 }}>
          {adding ? <>✕ Cancel</> : <>{Icons.plus} Share Link</>}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="si" style={{ background:'rgba(56,189,248,.04)', border:'1px solid rgba(56,189,248,.15)', borderRadius:10, padding:14, marginBottom:12 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
            <div>
              <label style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, color:'#4a6080', display:'block', marginBottom:5 }}>MEETING URL *</label>
              <input className="input" value={input} onChange={e => setInput(e.target.value)}
                placeholder="https://meet.google.com/abc-xyz or zoom.us/j/123"
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                style={{ borderColor:'rgba(56,189,248,.3)' }}/>
            </div>
            <div>
              <label style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, color:'#4a6080', display:'block', marginBottom:5 }}>LABEL (optional)</label>
              <input className="input" value={label} onChange={e => setLabel(e.target.value)}
                placeholder="e.g. Tonight's Session — 6PM"
                onKeyDown={e => e.key === 'Enter' && handleAdd()}/>
            </div>
            <button className="btn btn-teal" onClick={handleAdd} style={{ justifyContent:'center', padding:9, fontSize:13 }}>
              {Icons.video} Share with Group
            </button>
          </div>
        </div>
      )}

      {/* Links list */}
      {meetLinks.length === 0 ? (
        <div style={{ padding:16, background:'rgba(255,255,255,.02)', borderRadius:10, border:'1px dashed rgba(255,255,255,.08)', textAlign:'center' }}>
          <div style={{ fontSize:22, marginBottom:6 }}>📭</div>
          <div style={{ fontSize:12, color:'#4a6080' }}>No meeting links yet. Add one to make this group go LIVE!</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {meetLinks.map(link => (
            <div key={link.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', background:'rgba(255,255,255,.03)', borderRadius:10, border:`1px solid ${link.platform.color}22` }}>
              <div style={{ width:32, height:32, borderRadius:8, background:`${link.platform.color}14`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                {link.platform.emoji}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#e8f0f8', marginBottom:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{link.label}</div>
                <div style={{ fontSize:10, color:'#4a6080', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{link.url}</div>
              </div>
              <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                <button onClick={() => copyLink(link.id, link.url)}
                  style={{ padding:'5px 10px', borderRadius:7, border:`1px solid ${link.platform.color}33`, background:`${link.platform.color}10`, color:link.platform.color, cursor:'pointer', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:4 }}>
                  {copied === link.id ? <>✓ Copied</> : <>{Icons.copy} Copy</>}
                </button>
                <a href={link.url} target="_blank" rel="noopener noreferrer"
                  style={{ padding:'5px 12px', borderRadius:7, background:link.platform.color, color:'#040810', fontSize:11, fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
                  {Icons.video} Join
                </a>
                {/* Delete — triggers live status update in parent */}
                <button onClick={() => handleDelete(link.id)}
                  style={{ padding:'5px 8px', borderRadius:7, border:'1px solid rgba(248,113,113,.2)', background:'transparent', color:'#f87171', cursor:'pointer', fontSize:11, display:'flex', alignItems:'center' }}>
                  {Icons.trash}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeetLinkSection;
