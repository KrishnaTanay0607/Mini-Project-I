import React from 'react';
import LiveDot from '../../components/LiveDot/LiveDot';
import { Icons } from '../../utils/icons';

const PRIMARY = '#38bdf8';
const AV = [PRIMARY,'#7dd3fc','#2dd4bf','#f472b6','#a78bfa','#fbbf24'];

const GroupCard = ({ group, isJoined, onSelect, onToggleJoin, animClass }) => {
  const id     = group.id || group._id;
  const isLive = (group.meetLinks?.length ?? 0) > 0;
  const memberCount = typeof group.members === 'number' ? group.members : (group.members?.length ?? 0);

  return (
    <div className={`card lift ${animClass}`}
      style={{ padding:22,cursor:'pointer',position:'relative',overflow:'hidden' }}
      onClick={() => onSelect({ ...group, id })}>
      <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${group.color||PRIMARY},transparent)`,opacity:.7 }}/>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12 }}>
        <span style={{ fontSize:32,lineHeight:1 }}>{group.emoji||'📚'}</span>
        {isLive
          ? <LiveDot/>
          : <span style={{ padding:'3px 9px',borderRadius:20,fontSize:10,fontWeight:700,background:'rgba(255,255,255,.05)',color:'#4a6080',fontFamily:"'Manrope',sans-serif" }}>Open</span>
        }
      </div>
      <div style={{ fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,marginBottom:3,color:'#e8f0f8',lineHeight:1.2 }}>{group.name}</div>
      <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:group.color||PRIMARY,fontWeight:700,marginBottom:11,letterSpacing:.5 }}>{group.course}</div>
      <div style={{ display:'flex',flexWrap:'wrap',gap:4,marginBottom:14 }}>
        {(group.tags||[]).map(t => (
          <span key={t} style={{ padding:'2px 8px',borderRadius:20,fontSize:9,fontWeight:700,background:'rgba(255,255,255,.05)',color:'#7a96b4',fontFamily:"'Manrope',sans-serif" }}>{t}</span>
        ))}
      </div>
      <div style={{ display:'flex',gap:6,marginBottom:14 }}>
        <span style={{ display:'flex',alignItems:'center',gap:4,padding:'3px 8px',borderRadius:6,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.06)',fontSize:10,color:isJoined?PRIMARY:'#4a6080',fontWeight:700,fontFamily:"'Manrope',sans-serif" }}>
          📝 {group.notes?.length||0}
        </span>
        <span style={{ display:'flex',alignItems:'center',gap:4,padding:'3px 8px',borderRadius:6,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.06)',fontSize:10,color:isJoined?'#7dd3fc':'#4a6080',fontWeight:700,fontFamily:"'Manrope',sans-serif" }}>
          📁 {group.resources?.length||0}
        </span>
        {isJoined && isLive && (
          <span style={{ display:'flex',alignItems:'center',gap:4,padding:'3px 8px',borderRadius:6,background:'rgba(45,212,191,.08)',border:'1px solid rgba(45,212,191,.2)',fontSize:10,color:'#2dd4bf',fontWeight:700,fontFamily:"'Manrope',sans-serif" }}>
            📹 {group.meetLinks.length}
          </span>
        )}
      </div>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:12,borderTop:'1px solid rgba(255,255,255,.06)' }}>
        <div style={{ display:'flex',alignItems:'center',gap:5 }}>
          {AV.slice(0,Math.min(memberCount,4)).map((bg,j) => (
            <div key={j} style={{ width:20,height:20,borderRadius:'50%',background:bg,border:'2px solid #10141c',marginLeft:j?-5:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,fontWeight:900,color:'#04080f' }}>
              {String.fromCharCode(65+j)}
            </div>
          ))}
          <span style={{ fontSize:10,color:'#4a6080',marginLeft:4,fontFamily:"'Manrope',sans-serif" }}>{memberCount}</span>
        </div>
        <button className={`btn ${isJoined?'btn-ghost':'btn-primary'}`} style={{ padding:'4px 12px',fontSize:11 }}
          onClick={e => { e.stopPropagation(); onToggleJoin(id); }}>
          {isJoined ? <>{Icons.check} Joined</> : <>{Icons.plus} Join</>}
        </button>
      </div>
      <div style={{ marginTop:10,fontSize:10,color:'#4a6080',display:'flex',gap:4,alignItems:'center',fontFamily:"'Manrope',sans-serif" }}>
        {Icons.timer} Next: {group.next||'TBD'}
        {!isJoined && <span style={{ marginLeft:'auto',color:'#2a3a4a',fontSize:9 }}>🔒 Join to access</span>}
      </div>
    </div>
  );
};
export default GroupCard;
