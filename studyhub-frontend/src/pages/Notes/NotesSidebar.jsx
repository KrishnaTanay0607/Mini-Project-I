import React, { useState } from 'react';
import { Icons } from '../../utils/icons';

const NotesSidebar = ({ notes, activeId, onSelect, onNew, onDelete, groupColor }) => {
  const [hovered, setHovered]   = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (confirmId === id) {
      onDelete(id);
      setConfirmId(null);
    } else {
      setConfirmId(id);
      setTimeout(() => setConfirmId(null), 2500);
    }
  };

  return (
    <div style={{ background:'#0a0d12',borderRight:'1px solid rgba(255,255,255,.06)',display:'flex',flexDirection:'column',overflow:'hidden' }}>
      <div style={{ padding:'12px 13px 9px',borderBottom:'1px solid rgba(255,255,255,.06)',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0 }}>
        <span style={{ fontSize:9,fontWeight:700,letterSpacing:2,color:'#4a6080',fontFamily:"'Manrope',sans-serif" }}>NOTES ({notes.length})</span>
        <button className="btn btn-primary" style={{ padding:'4px 10px',fontSize:10 }} onClick={onNew}>{Icons.plus} New</button>
      </div>
      <div style={{ flex:1,overflowY:'auto' }}>
        {notes.length === 0 && (
          <div style={{ padding:16,textAlign:'center',color:'#4a6080',fontSize:12,marginTop:20 }}>
            <div style={{ fontSize:28,marginBottom:8 }}>📝</div>
            No notes yet. Create one!
          </div>
        )}
        {notes.map(n => {
          const nid = n.id||n._id;
          const isActive = nid === activeId;
          return (
            <div key={nid}
              onMouseEnter={() => setHovered(nid)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect(n)}
              style={{ padding:'10px 13px',cursor:'pointer',borderBottom:'1px solid rgba(255,255,255,.03)',background:isActive?`${groupColor||'#38bdf8'}10`:'transparent',borderLeft:`3px solid ${isActive?(groupColor||'#38bdf8'):'transparent'}`,transition:'background .15s',display:'flex',alignItems:'center',gap:6 }}>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:12,fontWeight:700,marginBottom:2,color:isActive?'#e8f0f8':'#7a96b4',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',fontFamily:"'Manrope',sans-serif" }}>
                  {n.title}
                </div>
                <div style={{ fontSize:10,color:'#4a6080',fontFamily:"'Manrope',sans-serif" }}>
                  {n.author?.name||n.by||'You'} · {n.when||'just now'}
                </div>
              </div>
              {(hovered === nid || confirmId === nid) && (
                <button
                  onClick={(e) => handleDelete(e, nid)}
                  title={confirmId===nid ? 'Click again to confirm' : 'Delete note'}
                  style={{ padding:'3px 6px',borderRadius:5,border:`1px solid ${confirmId===nid?'rgba(248,113,113,.5)':'rgba(248,113,113,.2)'}`,background:confirmId===nid?'rgba(248,113,113,.2)':'transparent',color:'#f87171',cursor:'pointer',fontSize:10,flexShrink:0,display:'flex',alignItems:'center' }}>
                  {confirmId===nid ? '✓?' : Icons.trash}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default NotesSidebar;
