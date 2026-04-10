import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GROUPS_DATA } from '../../data/groups';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Icons } from '../../utils/icons';
import { parseMarkdown } from '../../utils/markdown';

const PRIMARY   = '#38bdf8';
const isMongoId = id => /^[0-9a-fA-F]{24}$/.test(String(id));
const fmtSize   = b => !b ? '0 B' : b < 1024 ? b + ' B' : b < 1048576 ? (b/1024).toFixed(1)+' KB' : (b/1048576).toFixed(1)+' MB';
const fmtDate   = ts => {
  if (!ts) return 'just now';
  const d = (Date.now() - new Date(ts)) / 1000;
  if (d < 60) return 'just now';
  if (d < 3600) return Math.floor(d/60) + 'm ago';
  if (d < 86400) return Math.floor(d/3600) + 'h ago';
  return Math.floor(d/86400) + 'd ago';
};

const PERSONAL_ID = '__personal__';

// File types that can be rendered as text/markdown inside the preview pane
const TEXT_EXTS = ['MD', 'TXT', 'text/plain', 'text/markdown'];

const extColor = ext => {
  const map = { PDF:'#f87171', IMAGE:'#34d399', VIDEO:'#a78bfa', DOC:'#60a5fa', MD:'#38bdf8', NOTEBOOK:'#fbbf24', ZIP:'#fb923c' };
  return map[ext] || '#7a96b4';
};

/* ══ SIDEBAR ══════════════════════════════════════════════════════ */
const NotesSidebar = ({ notes, uploads, activeId, onSelect, onNew, onDelete, groupColor, isDbGroup }) => {
  const [hovered,   setHovered]   = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const handleDelete = (e, nid) => {
    e.stopPropagation();
    if (confirmId === nid) { onDelete(nid); setConfirmId(null); }
    else { setConfirmId(nid); setTimeout(() => setConfirmId(c => c===nid?null:c), 3000); }
  };

  const NoteRow = ({ n, isUpload }) => {
    const nid = String(n.id || n._id);
    const isActive = nid === String(activeId);
    return (
      <div onMouseEnter={()=>setHovered(nid)} onMouseLeave={()=>setHovered(null)}
        onClick={() => onSelect(n)}
        style={{ padding:'10px 12px', cursor:'pointer', borderBottom:'1px solid rgba(255,255,255,.03)', background:isActive?`${groupColor||PRIMARY}12`:'transparent', borderLeft:`3px solid ${isActive?(groupColor||PRIMARY):'transparent'}`, display:'flex', alignItems:'center', gap:6 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:12, fontWeight:700, color:isActive?'#e8f0f8':'#7a96b4', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', display:'flex', alignItems:'center', gap:5 }}>
            {isUpload && <span style={{ fontSize:9, padding:'1px 5px', borderRadius:4, background:`${extColor(n.ext)}20`, color:extColor(n.ext), fontWeight:800, flexShrink:0 }}>{n.ext||'FILE'}</span>}
            {n.title || n.name || 'Untitled'}
          </div>
          <div style={{ fontSize:10, color:'#4a6080' }}>{n.author?.name||n.uploader?.name||n.by||'You'} · {n.when||fmtDate(n.createdAt)||'just now'}</div>
        </div>
        {!isUpload && (hovered===nid || confirmId===nid) && (
          <button onClick={e=>handleDelete(e,nid)}
            style={{ padding:'3px 7px', borderRadius:6, border:`1px solid ${confirmId===nid?'rgba(248,113,113,.55)':'rgba(248,113,113,.22)'}`, background:confirmId===nid?'rgba(248,113,113,.2)':'transparent', color:'#f87171', cursor:'pointer', fontSize:10, flexShrink:0 }}>
            {confirmId===nid ? '✓?' : Icons.trash}
          </button>
        )}
      </div>
    );
  };

  return (
    <div style={{ background:'#0a0d12', borderRight:'1px solid rgba(255,255,255,.06)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ padding:'12px 13px 9px', borderBottom:'1px solid rgba(255,255,255,.06)', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
        <span style={{ fontSize:9, fontWeight:700, letterSpacing:2, color:'#4a6080' }}>NOTES ({notes.length})</span>
        <button className="btn btn-primary" style={{ padding:'4px 10px', fontSize:10 }} onClick={onNew}>{Icons.plus} New</button>
      </div>
      <div style={{ flex:1, overflowY:'auto' }}>
        {notes.length === 0 && uploads.length === 0 && (
          <div style={{ padding:20, textAlign:'center', color:'#4a6080', fontSize:12 }}>
            <div style={{ fontSize:28, marginBottom:8 }}>📝</div>No notes yet!
          </div>
        )}
        {notes.map(n => <NoteRow key={String(n.id||n._id)} n={n} isUpload={false}/>)}

        {/* Uploaded files section */}
        {uploads.length > 0 && (
          <>
            <div style={{ padding:'8px 12px 4px', fontSize:9, fontWeight:700, letterSpacing:2, color:'#4a6080', borderTop:'1px solid rgba(255,255,255,.06)', marginTop:4 }}>
              UPLOADS ({uploads.length})
            </div>
            {uploads.map(r => <NoteRow key={'r-'+String(r._id||r.id)} n={{ ...r, id:'r-'+String(r._id||r.id) }} isUpload={true}/>)}
          </>
        )}
      </div>
    </div>
  );
};

/* ══ ATTACH BAR ══════════════════════════════════════════════════ */
const AttachBar = ({ attachments, onAttach, onRemove }) => {
  const ref = useRef();
  return (
    <div style={{ padding:'8px 14px', borderTop:'1px solid rgba(255,255,255,.05)', background:'#0a0d12', display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', flexShrink:0 }}>
      <button onClick={()=>ref.current?.click()}
        style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 11px', borderRadius:7, border:'1px solid rgba(56,189,248,.22)', background:'rgba(56,189,248,.06)', color:PRIMARY, cursor:'pointer', fontSize:11, fontWeight:700 }}>
        {Icons.upload} Attach File
      </button>
      <input ref={ref} type="file" style={{ display:'none' }} onChange={e=>onAttach(e.target.files[0])}/>
      {attachments.map((a,i) => (
        <span key={i} style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:20, background:'rgba(56,189,248,.08)', border:'1px solid rgba(56,189,248,.15)', fontSize:10, color:PRIMARY }}>
          📎 {a.name} <span style={{ color:'#4a6080' }}>({a.size})</span>
          <button onClick={()=>onRemove(i)} style={{ background:'none', border:'none', color:'#f87171', cursor:'pointer', fontSize:12, padding:0 }}>×</button>
        </span>
      ))}
    </div>
  );
};

/* ══ AUTO-SAVE STATUS BAR ════════════════════════════════════════ */
const SaveBar = ({ saving, saveOk, isDb, lastSaved }) => {
  const color  = saveOk ? '#4ade80' : saving ? '#fbbf24' : isDb ? PRIMARY : '#4a6080';
  const label  = saveOk ? 'Saved to database' : saving ? 'Saving…' : isDb ? (lastSaved ? `Last saved ${lastSaved}` : 'Auto-save enabled') : 'Local only';
  const dot    = saving ? '⏳' : saveOk ? '✅' : isDb ? '💾' : '📍';
  return (
    <div style={{ padding:'5px 16px', background:'#080b10', borderTop:'1px solid rgba(255,255,255,.04)', display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
      <span style={{ fontSize:11 }}>{dot}</span>
      <span style={{ fontSize:10, color, fontWeight:600, transition:'color .3s' }}>{label}</span>
      {saving && (
        <span style={{ marginLeft:'auto', display:'flex', gap:3 }}>
          {[0,1,2].map(i => (
            <span key={i} style={{ width:4, height:4, borderRadius:'50%', background:'#fbbf24', animation:`pulse 1s ${i*0.2}s infinite`, display:'inline-block' }}/>
          ))}
        </span>
      )}
      <style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
    </div>
  );
};

/* ══ UPLOAD FILE PREVIEW CARD ════════════════════════════════════ */
const UploadPreview = ({ resource }) => {
  const [textContent, setTextContent] = useState(null);
  const [loading, setLoading]         = useState(false);
  const isText = resource.ext === 'MD' || resource.mimetype === 'text/markdown' || resource.mimetype === 'text/plain' || resource.ext === 'TXT';

  useEffect(() => {
    if (!isText || !resource.fileUrl) return;
    setLoading(true);
    fetch(resource.fileUrl)
      .then(r => r.text())
      .then(t => setTextContent(t))
      .catch(() => setTextContent(null))
      .finally(() => setLoading(false));
  }, [resource.fileUrl, isText]);

  const color = extColor(resource.ext);

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* File header card */}
      <div style={{ margin:'20px 18px 0', padding:'16px 18px', borderRadius:12, border:`1px solid ${color}25`, background:`${color}08`, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:10, background:`${color}18`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
            {resource.ext==='PDF'?'📄':resource.ext==='IMAGE'?'🖼️':resource.ext==='VIDEO'?'🎬':resource.ext==='MD'?'📝':resource.ext==='NOTEBOOK'?'📓':'📁'}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#e8f0f8', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{resource.name}</div>
            <div style={{ fontSize:10, color:'#4a6080', marginTop:2 }}>
              {resource.uploader?.name||'Unknown'} · {fmtDate(resource.createdAt)} · {fmtSize(resource.size)}
            </div>
          </div>
          <span style={{ padding:'3px 10px', borderRadius:6, background:`${color}20`, color, fontSize:10, fontWeight:800, flexShrink:0 }}>{resource.ext||'FILE'}</span>
        </div>
        <a href={resource.fileUrl} download={resource.name} target="_blank" rel="noopener noreferrer"
          style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:12, padding:'8px', borderRadius:8, background:`${color}15`, border:`1px solid ${color}30`, color, textDecoration:'none', fontSize:12, fontWeight:700 }}>
          ⬇️ Download {resource.name}
        </a>
      </div>

      {/* Text/MD content render */}
      {isText && (
        <div style={{ flex:1, overflowY:'auto', padding:'16px 18px' }}>
          {loading ? (
            <div style={{ color:'#4a6080', fontSize:12, textAlign:'center', paddingTop:20 }}>Loading preview…</div>
          ) : textContent !== null ? (
            <div dangerouslySetInnerHTML={{ __html: parseMarkdown(textContent) }}/>
          ) : (
            <div style={{ color:'#4a6080', fontSize:12, textAlign:'center', paddingTop:20 }}>Preview not available</div>
          )}
        </div>
      )}

      {/* Image preview */}
      {resource.ext === 'IMAGE' && resource.fileUrl && (
        <div style={{ flex:1, overflow:'auto', padding:'16px 18px', display:'flex', alignItems:'flex-start', justifyContent:'center' }}>
          <img src={resource.fileUrl} alt={resource.name} style={{ maxWidth:'100%', borderRadius:8, border:'1px solid rgba(255,255,255,.06)' }}/>
        </div>
      )}

      {/* Video preview */}
      {resource.ext === 'VIDEO' && resource.fileUrl && (
        <div style={{ flex:1, overflow:'auto', padding:'16px 18px' }}>
          <video controls src={resource.fileUrl} style={{ width:'100%', borderRadius:8 }}/>
        </div>
      )}
    </div>
  );
};

const TOOLS = [["**B**","**bold**"],["*I*","*italic*"],["`C`","`code`"],["H1","# Heading\n"],["H2","## Section\n"],["• ","- Item\n"],["❝","> Quote\n"]];

/* ══ NOTES PAGE ════════════════════════════════════════════════════ */
const NotesPage = ({ toast }) => {
  const { user }   = useAuth();
  const { socket } = useSocket();

  const [groups,        setGroups]        = useState([]);
  const [selGroupId,    setSelGroupId]    = useState(null);
  const [notes,         setNotes]         = useState([]);
  const [uploads,       setUploads]       = useState([]);   // resources from group library
  const [activeId,      setActiveId]      = useState(null);
  const [activeUpload,  setActiveUpload]  = useState(null); // resource object if an upload is selected
  const [title,         setTitle]         = useState('');
  const [content,       setContent]       = useState('');
  const [saving,        setSaving]        = useState(false);
  const [saveOk,        setSaveOk]        = useState(false);
  const [lastSaved,     setLastSaved]     = useState(null);
  const [loadingNotes,  setLoadingNotes]  = useState(false);
  const [attachments,   setAttachments]   = useState([]);
  const [confirmDelId,  setConfirmDelId]  = useState(null);

  const activeIdRef = useRef(null);
  const titleRef    = useRef('');
  const contentRef  = useRef('');
  const saveTimer   = useRef(null);

  const isDbGroup = selGroupId && selGroupId !== PERSONAL_ID && isMongoId(selGroupId);

  /* ── Load joined groups ── */
  useEffect(() => {
    const personal = { id: PERSONAL_ID, _id: PERSONAL_ID, emoji: '📝', name: 'My Notes', color: '#a78bfa' };
    const load = async () => {
      try {
        const data   = await api('/api/groups');
        const all    = data.groups || [];
        const uid    = String(user?._id || '');
        const joined = uid ? all.filter(g => (g.members||[]).some(m => String(m._id||m) === uid)) : all;
        const seeds  = GROUPS_DATA.map(g => ({ ...g, id: g.id, color: g.color || PRIMARY }));
        if (joined.length > 0) {
          const mapped = joined.map(g => ({ ...g, id: g._id, color: g.color || PRIMARY }));
          setGroups([personal, ...mapped, ...seeds]);
        } else {
          setGroups([personal, ...seeds]);
        }
      } catch {
        const seeds = GROUPS_DATA.filter(g => [1,3].includes(g.id));
        setGroups([personal, ...seeds]);
      }
      setSelGroupId(PERSONAL_ID);
    };
    load();
  }, [user]);

  /* ── Load notes + uploads when tab changes ── */
  useEffect(() => {
    if (!selGroupId) return;
    setLoadingNotes(true);
    setNotes([]); setUploads([]); setActiveId(null); setActiveUpload(null);
    setTitle(''); setContent('');
    activeIdRef.current = null; titleRef.current = ''; contentRef.current = '';
    clearTimeout(saveTimer.current);

    if (selGroupId === PERSONAL_ID) {
      api('/api/notes/personal')
        .then(d => {
          const mapped = (d.notes || []).map(n => ({
            ...n, id: String(n._id), by: n.author?.name || 'You', when: fmtDate(n.updatedAt)
          }));
          setNotes(mapped);
          if (mapped.length > 0) pickNote(mapped[0]);
        })
        .catch(() => setNotes([]))
        .finally(() => setLoadingNotes(false));
      return;
    }

    if (!isMongoId(selGroupId)) {
      const grp   = GROUPS_DATA.find(g => String(g.id) === String(selGroupId));
      const seeds = (grp?.notes || []).map(n => ({ ...n, id: String(n.id), _id: String(n.id) }));
      setNotes(seeds);
      if (seeds.length > 0) pickNote(seeds[0]);
      setLoadingNotes(false);
      return;
    }

    // Real DB group — load notes AND resources in parallel
    Promise.all([
      api(`/api/notes/${selGroupId}`),
      api(`/api/resources/${selGroupId}`).catch(() => ({ resources: [] }))
    ]).then(([notesData, resData]) => {
      const mappedNotes = (notesData.notes || []).map(n => ({
        ...n, id: String(n._id), by: n.author?.name || 'You', when: fmtDate(n.updatedAt)
      }));
      const mappedUploads = (resData.resources || []).map(r => ({
        ...r, id: String(r._id), when: fmtDate(r.createdAt)
      }));
      setNotes(mappedNotes);
      setUploads(mappedUploads);
      if (mappedNotes.length > 0) pickNote(mappedNotes[0]);
      else if (mappedUploads.length > 0) pickUpload(mappedUploads[0]);
    }).catch(() => {
      setNotes([]); setUploads([]);
    }).finally(() => setLoadingNotes(false));
  }, [selGroupId]);

  // Realtime: reload when another member adds a note or file
  useEffect(() => {
    if (!socket || !isDbGroup) return;

    const reloadNotes = () => {
      api(`/api/notes/${selGroupId}`).then(d => {
        setNotes((d.notes || []).map(n => ({ ...n, id: String(n._id), by: n.author?.name || 'You', when: fmtDate(n.updatedAt) })));
      }).catch(() => {});
    };

    const reloadUploads = () => {
      api(`/api/resources/${selGroupId}`).then(d => {
        setUploads((d.resources || []).map(r => ({ ...r, id: String(r._id), when: fmtDate(r.createdAt) })));
      }).catch(() => {});
    };

    socket.on('note_added',  reloadNotes);
    socket.on('file_added',  reloadUploads);
    return () => {
      socket.off('note_added',  reloadNotes);
      socket.off('file_added',  reloadUploads);
    };
  }, [socket, selGroupId, isDbGroup]);

  /* ── Pick a regular note ── */
  const pickNote = (n) => {
    const nid = String(n.id || n._id);
    setActiveId(nid);
    setActiveUpload(null);
    setTitle(n.title || '');
    setContent(n.content || '');
    activeIdRef.current = nid;
    titleRef.current    = n.title || '';
    contentRef.current  = n.content || '';
    setAttachments([]);
    setConfirmDelId(null);
    setSaveOk(false);
    setLastSaved(null);
    setSaving(false);
  };

  /* ── Pick an uploaded resource ── */
  const pickUpload = (r) => {
    const uid = 'r-' + String(r._id || r.id);
    setActiveId(uid);
    setActiveUpload(r);
    setTitle(r.name || '');
    setContent('');
    activeIdRef.current = uid;
    titleRef.current    = r.name || '';
    contentRef.current  = '';
    setAttachments([]);
    setConfirmDelId(null);
    setSaving(false);
    setSaveOk(false);
  };

  /* ── Unified select from sidebar ── */
  const handleSelect = (item) => {
    const itemId = String(item.id || item._id);
    if (itemId.startsWith('r-')) {
      // It's an upload row — find the original resource
      const realId = itemId.replace(/^r-/, '');
      const res = uploads.find(r => String(r._id||r.id) === realId);
      if (res) pickUpload(res);
    } else {
      pickNote(item);
    }
  };

  /* ── Debounced auto-save ── */
  const scheduleSave = useCallback(() => {
    const nid = activeIdRef.current;
    if (!nid || !isMongoId(nid)) return; // uploads or seed notes don't auto-save
    clearTimeout(saveTimer.current);
    setSaving(true); setSaveOk(false);
    saveTimer.current = setTimeout(async () => {
      try {
        await api(`/api/notes/${nid}`, {
          method: 'PUT',
          body: JSON.stringify({ title: titleRef.current, content: contentRef.current })
        });
        setSaveOk(true);
        setLastSaved(new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }));
        setTimeout(() => setSaveOk(false), 2500);
      } catch { /* silent */ }
      finally { setSaving(false); }
    }, 1200);
  }, []);

  const updateContent = (val) => {
    setContent(val);
    contentRef.current = val;
    setNotes(ns => ns.map(n => String(n.id||n._id)===String(activeId) ? { ...n, content:val } : n));
    scheduleSave();
  };

  const updateTitle = (val) => {
    setTitle(val);
    titleRef.current = val;
    setNotes(ns => ns.map(n => String(n.id||n._id)===String(activeId) ? { ...n, title:val } : n));
    scheduleSave();
  };

  const insertText = (txt) => {
    const ta = document.getElementById('notes-editor');
    if (!ta) return;
    const s   = ta.selectionStart;
    const val = content.slice(0,s) + txt + content.slice(ta.selectionEnd);
    updateContent(val);
    setTimeout(() => { ta.selectionStart = ta.selectionEnd = s + txt.length; ta.focus(); }, 0);
  };

  /* ── Create note ── */
  const newNote = async () => {
    if (selGroupId === PERSONAL_ID) {
      try {
        const data = await api('/api/notes/personal', {
          method: 'POST',
          body: JSON.stringify({ title: 'Untitled Note', content: '# New Note\n\nStart writing…' })
        });
        const n = { ...data.note, id: String(data.note._id), by: data.note.author?.name||'You', when: 'just now' };
        setNotes(ns => [n, ...ns]);
        pickNote(n);
        toast('Note saved to database ✅');
      } catch (err) { toast('⚠️ ' + err.message); }
      return;
    }

    if (!isMongoId(selGroupId)) {
      const n = { id: String(Date.now()), title:'Untitled Note', by:'You', when:'just now', content:'# New Note\n\nStart writing…' };
      setNotes(ns => [n, ...ns]);
      pickNote(n);
      toast('Demo only — join this group to save notes');
      return;
    }

    try {
      const data = await api('/api/notes', {
        method: 'POST',
        body: JSON.stringify({ groupId: selGroupId, title: 'Untitled Note', content: '# New Note\n\nStart writing…' })
      });
      const n = { ...data.note, id: String(data.note._id), by: data.note.author?.name||'You', when: 'just now' };
      setNotes(ns => [n, ...ns]);
      pickNote(n);
      toast('Note saved to database ✅');
    } catch (err) { toast('⚠️ ' + err.message); }
  };

  /* ── Delete note ── */
  const deleteNote = useCallback(async (noteId) => {
    const nid = String(noteId);
    // Don't allow deleting upload rows from here
    if (nid.startsWith('r-')) return;
    if (confirmDelId !== nid) {
      setConfirmDelId(nid);
      setTimeout(() => setConfirmDelId(c => c===nid?null:c), 3000);
      return;
    }
    setConfirmDelId(null);
    if (isMongoId(nid)) {
      try { await api(`/api/notes/${nid}`, { method:'DELETE' }); }
      catch (err) { toast('⚠️ ' + err.message); return; }
    }
    const remaining = notes.filter(n => String(n.id||n._id) !== nid);
    setNotes(remaining);
    if (String(activeId) === nid) {
      if (remaining.length > 0) pickNote(remaining[0]);
      else if (uploads.length > 0) pickUpload(uploads[0]);
      else { setActiveId(null); setActiveUpload(null); setTitle(''); setContent(''); activeIdRef.current=null; }
    }
    toast('Note deleted 🗑️');
  }, [confirmDelId, notes, activeId, uploads, toast]);

  const addAttachment = (f) => {
    if (!f) return;
    setAttachments(a => [...a, { name:f.name, url:URL.createObjectURL(f), size:fmtSize(f.size) }]);
    toast('Attached: ' + f.name + ' 📎');
  };

  const currentGroup = groups.find(g => String(g.id||g._id) === String(selGroupId));
  const groupColor   = currentGroup?.color || PRIMARY;
  const isNoteActive = activeId && !activeId.toString().startsWith('r-') && isMongoId(activeId);

  return (
    <div style={{ paddingTop:58, height:'100vh', display:'flex', flexDirection:'column', background:'#06080a' }}>

      {/* Tab bar */}
      <div style={{ background:'#0a0d12', borderBottom:'1px solid rgba(255,255,255,.06)', padding:'8px 16px', display:'flex', alignItems:'center', gap:8, overflowX:'auto', flexShrink:0 }}>
        <span style={{ fontSize:9, fontWeight:700, letterSpacing:2, color:'#4a6080', whiteSpace:'nowrap', marginRight:4 }}>NOTES</span>
        {groups.length === 0 ? (
          <span style={{ fontSize:12, color:'#4a6080' }}>Loading…</span>
        ) : groups.map(g => {
          const gid   = String(g.id || g._id);
          const isSel = String(selGroupId) === gid;
          const isPersonalTab = gid === PERSONAL_ID;
          return (
            <button key={gid} onClick={() => setSelGroupId(gid)}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:8, border:`1px solid ${isSel?(g.color||PRIMARY):'rgba(255,255,255,.07)'}`, background:isSel?`${g.color||PRIMARY}14`:'transparent', color:isSel?(g.color||PRIMARY):'#4a6080', cursor:'pointer', fontSize:11, fontWeight:700, whiteSpace:'nowrap', transition:'all .2s' }}>
              {g.emoji||'📚'} {g.name}
              {isPersonalTab && (
                <span style={{ fontSize:8, padding:'1px 5px', borderRadius:4, background:'rgba(167,139,250,.15)', color:'#a78bfa', marginLeft:2 }}>DB</span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3-panel layout */}
      <div style={{ flex:1, display:'grid', gridTemplateColumns:'220px 1fr 1fr', overflow:'hidden', minHeight:0 }}>

        {/* Sidebar */}
        <NotesSidebar
          notes={notes} uploads={uploads}
          activeId={activeId}
          onSelect={handleSelect} onNew={newNote} onDelete={deleteNote}
          groupColor={groupColor} isDbGroup={isDbGroup}
        />

        {/* Editor / Upload view */}
        {activeId ? (
          activeUpload ? (
            /* ── Upload selected — show read-only info + preview ── */
            <div style={{ display:'flex', flexDirection:'column', borderRight:'1px solid rgba(255,255,255,.06)', overflow:'hidden', background:'#0a0d12' }}>
              <div style={{ padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,.06)', background:'#0a0d12', display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                <span style={{ flex:1, color:'#e8f0f8', fontSize:14, fontWeight:700, fontFamily:"'Syne',sans-serif", whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {activeUpload.name}
                </span>
                <span style={{ fontSize:10, color:'#4a6080', fontWeight:600 }}>📎 Uploaded file</span>
              </div>
              <UploadPreview resource={activeUpload}/>
            </div>
          ) : (
            /* ── Regular note editor ── */
            <div style={{ display:'flex', flexDirection:'column', borderRight:'1px solid rgba(255,255,255,.06)', overflow:'hidden' }}>
              <div style={{ padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,.06)', background:'#0a0d12', display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                <input value={title} onChange={e=>updateTitle(e.target.value)} placeholder="Note title…"
                  style={{ flex:1, background:'none', border:'none', outline:'none', color:'#e8f0f8', fontSize:14, fontWeight:700, fontFamily:"'Syne',sans-serif" }}/>
                <button onClick={()=>deleteNote(activeId)}
                  style={{ padding:'4px 10px', borderRadius:7, border:`1px solid ${confirmDelId===String(activeId)?'rgba(248,113,113,.6)':'rgba(248,113,113,.22)'}`, background:confirmDelId===String(activeId)?'rgba(248,113,113,.2)':'transparent', color:'#f87171', cursor:'pointer', fontSize:11, display:'flex', alignItems:'center', gap:4, fontWeight:confirmDelId===String(activeId)?700:400, flexShrink:0 }}>
                  {Icons.trash} {confirmDelId===String(activeId) ? 'Confirm?' : 'Delete'}
                </button>
              </div>

              <div style={{ padding:'8px 12px', borderBottom:'1px solid rgba(255,255,255,.06)', background:'#0a0d12', display:'flex', gap:4, flexWrap:'wrap', alignItems:'center', flexShrink:0 }}>
                {TOOLS.map(([l,t]) => (
                  <button key={l} onClick={()=>insertText(t)}
                    style={{ padding:'3px 8px', borderRadius:5, border:'1px solid rgba(255,255,255,.07)', background:'transparent', color:'#4a6080', cursor:'pointer', fontSize:10, fontFamily:"'JetBrains Mono',monospace", transition:'all .15s' }}
                    onMouseEnter={e=>{e.target.style.color='#e8f0f8';e.target.style.borderColor='rgba(56,189,248,.3)';}}
                    onMouseLeave={e=>{e.target.style.color='#4a6080';e.target.style.borderColor='rgba(255,255,255,.07)';}}>{l}</button>
                ))}
              </div>

              <textarea id="notes-editor" value={content} onChange={e=>updateContent(e.target.value)} spellCheck={false}
                style={{ flex:1, padding:'20px 18px', background:'transparent', border:'none', outline:'none', color:'#c0d0e0', fontFamily:"'JetBrains Mono',monospace", fontSize:12.5, lineHeight:1.85, resize:'none' }}/>

              {/* Auto-save status bar */}
              <SaveBar saving={saving} saveOk={saveOk} isDb={isNoteActive} lastSaved={lastSaved}/>

              <AttachBar attachments={attachments} onAttach={addAttachment} onRemove={i=>setAttachments(a=>a.filter((_,j)=>j!==i))}/>
            </div>
          )
        ) : (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:14, color:'#4a6080', background:'#0a0d12', borderRight:'1px solid rgba(255,255,255,.06)' }}>
            <div style={{ fontSize:42 }}>📝</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, color:'#7a96b4' }}>
              {loadingNotes ? 'Loading…' : (notes.length+uploads.length)===0 ? 'No notes yet' : 'Select a note'}
            </div>
            {!loadingNotes && (
              <button className="btn btn-primary" onClick={newNote} style={{ fontSize:13 }}>{Icons.plus} Create First Note</button>
            )}
          </div>
        )}

        {/* Preview */}
        <div style={{ display:'flex', flexDirection:'column', overflow:'hidden', background:'#0a0d12' }}>
          <div style={{ padding:'12px 18px', borderBottom:'1px solid rgba(255,255,255,.06)', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
            <span style={{ fontSize:9, fontWeight:700, letterSpacing:2, color:'#4a6080' }}>PREVIEW</span>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:PRIMARY }}>
              {activeUpload ? activeUpload.ext||'FILE' : 'Markdown'}
            </span>
          </div>

          {activeUpload ? (
            /* Upload preview in the right panel */
            <UploadPreview resource={activeUpload}/>
          ) : (
            <>
              <div style={{ flex:1, overflowY:'auto', padding:'20px 18px' }}
                dangerouslySetInnerHTML={{ __html: parseMarkdown(content || '') }}/>
              {attachments.length > 0 && (
                <div style={{ padding:'10px 18px', borderTop:'1px solid rgba(255,255,255,.05)', flexShrink:0 }}>
                  <div style={{ fontSize:9, fontWeight:700, letterSpacing:2, color:'#4a6080', marginBottom:7 }}>ATTACHMENTS</div>
                  {attachments.map((a,i) => (
                    <a key={i} href={a.url} download={a.name} target="_blank" rel="noopener noreferrer"
                      style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 0', fontSize:11, color:PRIMARY, textDecoration:'none' }}>
                      📎 {a.name} <span style={{ color:'#4a6080' }}>({a.size})</span>
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesPage;
