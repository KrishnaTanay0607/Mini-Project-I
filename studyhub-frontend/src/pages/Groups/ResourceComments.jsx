import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { Icons } from '../../utils/icons';

const ResourceComments = ({ resourceId, comments: initComments, groupColor }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState(initComments || []);
  const [input, setInput]       = useState('');
  const [open, setOpen]         = useState(false);
  const [loading, setLoading]   = useState(false);

  const submit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const data = await api(`/api/resources/${resourceId}/comment`, {
        method:'POST', body: JSON.stringify({ text: input.trim() }),
      });
      setComments(data.comments);
      setInput('');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const remove = async (commentId) => {
    try {
      await api(`/api/resources/${resourceId}/comment/${commentId}`, { method:'DELETE' });
      setComments(c => c.filter(x => String(x._id) !== commentId));
    } catch (err) { console.error(err); }
  };

  const formatTime = ts => new Date(ts).toLocaleDateString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });

  return (
    <div style={{ marginTop:8 }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ background:'none', border:'none', color:'#5a5a72', cursor:'pointer', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:4 }}>
        💬 {comments.length} comment{comments.length !== 1 ? 's' : ''} {open ? '▲' : '▼'}
      </button>
      {open && (
        <div style={{ marginTop:8, paddingLeft:12, borderLeft:`2px solid ${groupColor}33` }}>
          {comments.map(c => (
            <div key={c._id} style={{ marginBottom:8, display:'flex', alignItems:'flex-start', gap:8 }}>
              <div style={{ width:24, height:24, borderRadius:'50%', background:`${groupColor}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:900, color:groupColor, flexShrink:0 }}>
                {c.author?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:'#d0d0e0' }}>{c.author?.name}</span>
                  <span style={{ fontSize:9, color:'#5a5a72' }}>{formatTime(c.createdAt)}</span>
                  {user?.name === c.author?.name && (
                    <button onClick={() => remove(String(c._id))} style={{ background:'none', border:'none', color:'#f87171', cursor:'pointer', fontSize:10, marginLeft:'auto' }}>{Icons.trash}</button>
                  )}
                </div>
                <div style={{ fontSize:12, color:'#9090a8', lineHeight:1.5 }}>{c.text}</div>
              </div>
            </div>
          ))}
          <div style={{ display:'flex', gap:6, marginTop:8 }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="Add a comment..." maxLength={500}
              style={{ flex:1, padding:'6px 10px', background:'rgba(255,255,255,.04)', border:`1px solid rgba(255,255,255,.08)`, borderRadius:7, color:'#f0f0f4', fontSize:12, outline:'none', fontFamily:"'Manrope',sans-serif" }}/>
            <button onClick={submit} disabled={!input.trim() || loading}
              style={{ padding:'6px 12px', borderRadius:7, background:input.trim()?groupColor:'rgba(255,255,255,.05)', color:input.trim()?'#08080a':'#5a5a72', border:'none', cursor:'pointer', fontWeight:700, fontSize:12 }}>
              {loading ? '...' : '→'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default ResourceComments;
