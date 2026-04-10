import React, { useState, useEffect, useCallback } from 'react';
import { GROUPS_DATA } from '../../data/groups';
import { EXT_COLORS, EXT_EMOJIS } from '../../data/resources';
import { Icons } from '../../utils/icons';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import LibraryStats from './LibraryStats';

const PRIMARY  = '#38bdf8';
const BASE_URL = 'http://localhost:5000';

const isMongoId = id => /^[0-9a-fA-F]{24}$/.test(String(id));

const fmtSize = b => {
  if (!b) return '0 B';
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
};

/* ── Single resource row ── */
const ResourceRow = ({ r, currentUser, onVote, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText,  setCommentText]  = useState('');
  const [comments,     setComments]     = useState(r.comments || []);
  const [submitting,   setSubmitting]   = useState(false);
  const [delConfirm,   setDelConfirm]   = useState(false);

  const addComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      if (r.fromDb && isMongoId(r.id)) {
        const data = await api(`/api/resources/${r.id}/comment`, {
          method: 'POST', body: JSON.stringify({ text: commentText }),
        });
        setComments(data.comments || []);
      } else {
        setComments(c => [...c, { _id: Date.now(), author:{ name:'You' }, text: commentText }]);
      }
      setCommentText('');
    } catch {}
    setSubmitting(false);
  };

  const handleDelete = () => {
    if (delConfirm) { onDelete(r.id); }
    else { setDelConfirm(true); setTimeout(() => setDelConfirm(false), 3000); }
  };

  const openFile = () => {
    const url = r.fileUrl || (r.filename ? `${BASE_URL}/uploads/${r.filename}` : null);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ borderBottom:'1px solid rgba(255,255,255,.05)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', transition:'background .15s' }}
        onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,.02)'}
        onMouseLeave={e => e.currentTarget.style.background='transparent'}>

        <div style={{ width:36, height:36, borderRadius:9, background:`${EXT_COLORS[r.ext]||'#888'}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
          {EXT_EMOJIS[r.ext] || '📁'}
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:600, fontSize:13, color:'#e8f0f8', marginBottom:1, fontFamily:"'Manrope',sans-serif", whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {r.name}
          </div>
          <div style={{ fontSize:10, color:'#4a6080', fontFamily:"'Manrope',sans-serif" }}>
            {r.size} · by {r.by} · {r.groupEmoji} {r.groupName}
          </div>
        </div>

        <span style={{ padding:'2px 8px', borderRadius:5, fontSize:9, fontWeight:700, background:`${EXT_COLORS[r.ext]||'#888'}18`, color:EXT_COLORS[r.ext]||'#888', flexShrink:0 }}>
          {r.ext}
        </span>

        {(r.fileUrl || r.filename) && (
          <button onClick={openFile} style={{ padding:'5px 11px', borderRadius:7, border:'1px solid rgba(56,189,248,.25)', background:'rgba(56,189,248,.08)', color:PRIMARY, cursor:'pointer', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
            {Icons.link} Open
          </button>
        )}

        <button onClick={() => onVote(r.id)}
          style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 11px', borderRadius:7, border:`1px solid ${r.voted?PRIMARY:'rgba(255,255,255,.07)'}`, background:r.voted?'rgba(56,189,248,.12)':'transparent', color:r.voted?PRIMARY:'#4a6080', cursor:'pointer', fontSize:12, fontWeight:700, transition:'all .2s', flexShrink:0, minWidth:48 }}>
          {Icons.thumb} {r.upvotes}
        </button>

        <button onClick={() => setShowComments(s=>!s)}
          style={{ padding:'5px 9px', borderRadius:7, border:'1px solid rgba(255,255,255,.07)', background:'transparent', color:'#4a6080', cursor:'pointer', fontSize:11, flexShrink:0 }}>
          💬 {comments.length}
        </button>

        <button onClick={handleDelete}
          style={{ padding:'5px 8px', borderRadius:7, border:`1px solid ${delConfirm?'rgba(248,113,113,.5)':'rgba(248,113,113,.2)'}`, background:delConfirm?'rgba(248,113,113,.15)':'transparent', color:'#f87171', cursor:'pointer', fontSize:11, flexShrink:0, fontWeight:delConfirm?700:400 }}>
          {Icons.trash}{delConfirm?' Sure?':''}
        </button>
      </div>

      {showComments && (
        <div style={{ padding:'0 16px 14px 62px' }}>
          {comments.length === 0 && <div style={{ fontSize:11, color:'#4a6080', marginBottom:8, fontStyle:'italic' }}>No comments yet.</div>}
          {comments.map((c,i) => (
            <div key={c._id||i} style={{ marginBottom:8, padding:'8px 12px', background:'rgba(255,255,255,.02)', borderRadius:8, borderLeft:`2px solid ${PRIMARY}33` }}>
              <span style={{ fontSize:11, fontWeight:700, color:'#7a96b4' }}>{c.author?.name||'User'}: </span>
              <span style={{ fontSize:12, color:'#8a9ab4' }}>{c.text}</span>
            </div>
          ))}
          <div style={{ display:'flex', gap:7, marginTop:8 }}>
            <input value={commentText} onChange={e=>setCommentText(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&addComment()} placeholder="Add a comment..." maxLength={500}
              style={{ flex:1, padding:'7px 11px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:7, color:'#e8f0f8', fontSize:12, outline:'none' }}
              onFocus={e=>e.target.style.borderColor=PRIMARY} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.08)'}/>
            <button onClick={addComment} disabled={!commentText.trim()||submitting}
              style={{ padding:'7px 14px', borderRadius:7, background:commentText.trim()?PRIMARY:'rgba(255,255,255,.05)', color:commentText.trim()?'#040810':'#4a6080', border:'none', cursor:'pointer', fontWeight:700, fontSize:12 }}>
              {submitting?'...':'→'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Upload Modal — only shows real MongoDB groups ── */
const UploadModal = ({ mongoGroups, onUpload, onClose }) => {
  const [file,    setFile]    = useState(null);
  const [label,   setLabel]   = useState('');
  const [groupId, setGroupId] = useState(mongoGroups[0]?._id || mongoGroups[0]?.id || '');
  const [busy,    setBusy]    = useState(false);
  const [prog,    setProg]    = useState(0);
  const [err,     setErr]     = useState('');

  // Keep default in sync if mongoGroups loads after modal opens
  useEffect(() => {
    if (!groupId && mongoGroups.length > 0) {
      setGroupId(mongoGroups[0]._id || mongoGroups[0].id || '');
    }
  }, [mongoGroups]);

  const pick = f => {
    if (!f) return;
    if (f.size > 52428800) { setErr('File too large — max 50 MB'); return; }
    setFile(f); setLabel(f.name.replace(/\.[^.]+$/, '')); setErr('');
  };

  const submit = async () => {
    if (!file)              { setErr('Select a file'); return; }
    if (!groupId)           { setErr('Select a group'); return; }
    if (!isMongoId(groupId)){ setErr('Invalid group selected'); return; }
    setBusy(true); setProg(10); setErr('');
    try { await onUpload(file, label, groupId, setProg); }
    catch (e) { setErr(e.message || 'Upload failed'); setBusy(false); }
  };

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.82)', backdropFilter:'blur(14px)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'#0d1117', border:'1px solid rgba(56,189,248,.18)', borderRadius:18, padding:28, width:'100%', maxWidth:460 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:900, color:'#e8f0f8', marginBottom:20 }}>📤 Upload File</div>

        {mongoGroups.length === 0 && (
          <div style={{ padding:'12px 14px', background:'rgba(251,191,36,.08)', border:'1px solid rgba(251,191,36,.25)', borderRadius:10, fontSize:12, color:'#fbbf24', marginBottom:16 }}>
            ⚠️ You need to join or create a group (not a demo group) to upload files.
          </div>
        )}

        {/* Drop zone */}
        <div onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor=PRIMARY;}}
          onDragLeave={e=>e.currentTarget.style.borderColor='rgba(56,189,248,.2)'}
          onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor='rgba(56,189,248,.2)';pick(e.dataTransfer.files[0]);}}
          onClick={()=>document.getElementById('lib-file-inp').click()}
          style={{ padding:24, border:`2px dashed ${file?PRIMARY:'rgba(56,189,248,.2)'}`, borderRadius:12, textAlign:'center', cursor:'pointer', background:'rgba(56,189,248,.03)', marginBottom:14, transition:'border-color .2s' }}>
          {file ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
              <span style={{ fontSize:24 }}>{EXT_EMOJIS[file.name.split('.').pop().toUpperCase()]||'📄'}</span>
              <div style={{ textAlign:'left' }}>
                <div style={{ fontSize:13, fontWeight:700, color:PRIMARY }}>{file.name}</div>
                <div style={{ fontSize:11, color:'#4a6080' }}>{fmtSize(file.size)}</div>
              </div>
              <button onClick={e=>{e.stopPropagation();setFile(null);setLabel('');}} style={{ background:'none', border:'none', color:'#f87171', cursor:'pointer', fontSize:18, marginLeft:8 }}>×</button>
            </div>
          ) : (
            <>
              <div style={{ fontSize:30, marginBottom:8 }}>📂</div>
              <div style={{ fontSize:13, fontWeight:600, color:'#7a96b4', marginBottom:3 }}>Click to browse or drag & drop</div>
              <div style={{ fontSize:11, color:'#4a6080' }}>PDF, DOCX, MP4, IPYNB, ZIP — max 50 MB</div>
            </>
          )}
          <input id="lib-file-inp" type="file" style={{ display:'none' }} onChange={e=>pick(e.target.files[0])}/>
        </div>

        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, color:'#4a6080', display:'block', marginBottom:5 }}>DISPLAY NAME</label>
          <input className="input" value={label} onChange={e=>setLabel(e.target.value)} placeholder="e.g. Week 3 Lecture Notes"/>
        </div>

        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, color:'#4a6080', display:'block', marginBottom:5 }}>UPLOAD TO GROUP</label>
          {mongoGroups.length === 0 ? (
            <div className="input" style={{ color:'#4a6080', cursor:'not-allowed' }}>No groups available — join or create a group first</div>
          ) : (
            <select value={groupId} onChange={e=>setGroupId(e.target.value)} className="input" style={{ cursor:'pointer' }}>
              <option value="">— Select a group —</option>
              {mongoGroups.map(g => {
                const gid = g._id || g.id;
                return <option key={String(gid)} value={String(gid)}>{g.emoji||'📚'} {g.name}</option>;
              })}
            </select>
          )}
        </div>

        {busy && (
          <div style={{ marginBottom:12 }}>
            <div style={{ height:4, background:'rgba(255,255,255,.07)', borderRadius:2, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${prog}%`, background:PRIMARY, borderRadius:2, transition:'width .3s' }}/>
            </div>
            <div style={{ fontSize:11, color:'#4a6080', marginTop:4, textAlign:'center' }}>Uploading... {prog}%</div>
          </div>
        )}

        {err && (
          <div style={{ marginBottom:12, padding:'9px 12px', background:'rgba(248,113,113,.1)', border:'1px solid rgba(248,113,113,.25)', borderRadius:8, fontSize:12, color:'#f87171' }}>
            ⚠️ {err}
          </div>
        )}

        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-primary" onClick={submit}
            disabled={!file||busy||!groupId||mongoGroups.length===0}
            style={{ flex:1, justifyContent:'center', padding:12, fontSize:13, opacity:(!file||busy||!groupId||mongoGroups.length===0)?0.5:1 }}>
            {busy ? '⏳ Uploading...' : '📤 Upload File'}
          </button>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding:'12px 16px' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

/* ════════ LIBRARY PAGE ════════ */
const LibraryPage = ({ toast }) => {
  const { user }                          = useAuth();
  const [resources,   setResources]       = useState([]);
  const [groups,      setGroups]          = useState([]);   // for filter tabs (includes seeds)
  const [mongoGroups, setMongoGroups]     = useState([]);   // for upload modal (DB only)
  const [groupFilter, setGroupFilter]     = useState('all');
  const [extFilter,   setExtFilter]       = useState('All');
  const [search,      setSearch]          = useState('');
  const [loading,     setLoading]         = useState(true);
  const [uploadOpen,  setUploadOpen]      = useState(false);

  /* ── Load all resources ── */
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const grpData   = await api('/api/groups');
      const backendGs = grpData.groups || [];

      // All groups user is a member of (strict string comparison)
      const uid = String(user?._id || '');
      const joinedGs = uid
        ? backendGs.filter(g => (g.members||[]).some(m => String(m._id||m) === uid))
        : backendGs;

      // Store MongoDB groups for the upload modal
      setMongoGroups(joinedGs.map(g => ({ ...g, id: g._id })));

      // Build display groups: joined backend + seed groups (for filter tabs)
      const seedGrps = GROUPS_DATA.map(g => ({ ...g, _id: g.id }));
      const allDisplayGs = [
        ...joinedGs.map(g => ({ ...g, id: g._id })),
        ...seedGrps,
      ];
      setGroups(allDisplayGs);

      // Fetch resources from backend for joined groups
      const results = await Promise.allSettled(
        joinedGs.map(g => api(`/api/resources/${g._id}`))
      );

      const dbRes = [];
      results.forEach((res, idx) => {
        if (res.status !== 'fulfilled') return;
        const g = joinedGs[idx];
        (res.value.resources || []).forEach(r => {
          dbRes.push({
            id:         r._id,
            name:       r.name,
            ext:        r.ext,
            size:       r.sizeFormatted || fmtSize(r.size||0),
            upvotes:    r.upvotes || 0,
            by:         r.uploader?.name || 'Unknown',
            voted:      r.voted  || false,
            comments:   r.comments || [],
            fromDb:     true,
            fileUrl:    r.fileUrl || (r.filename ? `${BASE_URL}/uploads/${r.filename}` : null),
            filename:   r.filename,
            uploaderId: String(r.uploader?._id || r.uploader || ''),
            groupName:  g.name,
            groupEmoji: g.emoji || '📚',
            groupColor: g.color || PRIMARY,
            groupId:    g._id,
          });
        });
      });

      // Always include seed resources too
      const seedRes = GROUPS_DATA.flatMap(g =>
        (g.resources||[]).map(r => ({
          id:         String(r.id),
          name:       r.name,
          ext:        r.ext,
          size:       r.size || '—',
          upvotes:    r.upvotes || 0,
          by:         r.by || 'Community',
          voted:      false,
          comments:   [],
          fromDb:     false,
          fileUrl:    null,
          filename:   null,
          uploaderId: null,
          groupName:  g.name,
          groupEmoji: g.emoji,
          groupColor: g.color || PRIMARY,
          groupId:    String(g.id),
        }))
      );

      // DB resources first, then seeds
      setResources([...dbRes.sort((a,b) => b.upvotes-a.upvotes), ...seedRes]);

    } catch {
      // Full offline fallback — show all seed resources
      const seeds = GROUPS_DATA.flatMap(g =>
        (g.resources||[]).map(r => ({
          id: String(r.id), name: r.name, ext: r.ext, size: r.size,
          upvotes: r.upvotes, by: r.by, voted: false, comments: [],
          fromDb: false, fileUrl: null, filename: null, uploaderId: null,
          groupName: g.name, groupEmoji: g.emoji, groupColor: g.color, groupId: String(g.id),
        }))
      );
      setGroups(GROUPS_DATA.map(g => ({ ...g, _id: g.id })));
      setMongoGroups([]);
      setResources(seeds);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* ── Upload ── */
  const handleUpload = async (file, label, groupId, setProgress) => {
    if (!isMongoId(groupId)) throw new Error('Invalid group — please select a real group from the list');
    const token = localStorage.getItem('sh_token');
    if (!token)  throw new Error('You must be logged in to upload files');

    const form = new FormData();
    form.append('file',    file);
    form.append('groupId', groupId);
    form.append('name',    (label || file.name).trim());

    setProgress(30);
    const res  = await fetch(`${BASE_URL}/api/resources/upload`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form,
    });
    setProgress(80);
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { throw new Error('Server returned invalid response'); }
    if (!res.ok) throw new Error(data.message || `Upload failed (${res.status})`);

    setProgress(100);
    const g  = mongoGroups.find(g => String(g._id||g.id) === groupId);
    const nr = {
      id:         data.resource._id,
      name:       data.resource.name,
      ext:        data.resource.ext,
      size:       data.resource.sizeFormatted || fmtSize(data.resource.size||0),
      upvotes:    0,
      by:         data.resource.uploader?.name || user?.name || 'You',
      voted:      false,
      comments:   [],
      fromDb:     true,
      fileUrl:    data.resource.fileUrl || `${BASE_URL}/uploads/${data.resource.filename}`,
      filename:   data.resource.filename,
      uploaderId: String(user?._id || ''),
      groupName:  g?.name  || '',
      groupEmoji: g?.emoji || '📚',
      groupColor: g?.color || PRIMARY,
      groupId,
    };

    setResources(rs => [nr, ...rs]);
    setMongoGroups(gs => gs); // keep unchanged
    setUploadOpen(false);
    toast(`"${nr.name}" uploaded! 📁`);
  };

  /* ── Vote ── */
  const vote = async id => {
    const r = resources.find(x => x.id === id);
    if (!r) return;
    setResources(rs => rs.map(x => x.id===id ? { ...x, voted:!x.voted, upvotes:x.upvotes+(x.voted?-1:1) } : x));
    if (!r.fromDb || !isMongoId(id)) { if (!r.voted) toast('Upvoted! 👍'); return; }
    try {
      const data = await api(`/api/resources/${id}/vote`, { method:'POST' });
      setResources(rs => rs.map(x => x.id===id ? { ...x, voted:data.voted, upvotes:data.upvotes } : x));
      if (data.voted) toast('Upvoted! 👍');
    } catch (err) {
      setResources(rs => rs.map(x => x.id===id ? { ...x, voted:r.voted, upvotes:r.upvotes } : x));
      toast(`⚠️ ${err.message}`);
    }
  };

  /* ── Delete ── */
  const deleteResource = async id => {
    if (isMongoId(id)) {
      try { await api(`/api/resources/${id}`, { method:'DELETE' }); }
      catch (err) { toast(`⚠️ ${err.message}`); return; }
    }
    setResources(rs => rs.filter(x => x.id !== id));
    toast('File deleted 🗑️');
  };

  const extTypes = ['All', ...[...new Set(resources.map(r=>r.ext).filter(Boolean))]];
  const shown = resources.filter(r => {
    if (groupFilter !== 'all' && r.groupName !== groupFilter) return false;
    if (extFilter   !== 'All' && r.ext !== extFilter)         return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return (
    <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:32, animation:'pulse 1s infinite' }}>📁</div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:13 }}>
            <div>
              <h1 className="fu">Resource Library</h1>
              <p className="fu d1">Files from your groups — open, upvote, comment, delete.</p>
            </div>
            <div style={{ display:'flex', gap:9, alignItems:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 11px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', borderRadius:8, minWidth:190 }}>
                <span style={{ color:'#4a6080' }}>{Icons.search}</span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search files..."
                  style={{ background:'none', border:'none', outline:'none', color:'#e8f0f8', fontSize:13, flex:1 }}/>
              </div>
              <button className="btn btn-primary" style={{ fontSize:12, padding:'7px 14px' }} onClick={()=>setUploadOpen(true)}>
                {Icons.upload} Upload
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="content">
        <LibraryStats resources={resources}/>

        {/* Group filter */}
        <div style={{ marginBottom:10 }}>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:2, color:'#4a6080', marginBottom:8 }}>FILTER BY GROUP</div>
          <div className="fu" style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            <button onClick={()=>setGroupFilter('all')} className="tab-btn"
              style={{ background:groupFilter==='all'?PRIMARY:'rgba(255,255,255,.05)', color:groupFilter==='all'?'#040810':'#4a6080' }}>
              All Groups
            </button>
            {groups.map(g => (
              <button key={String(g._id||g.id)} onClick={()=>setGroupFilter(g.name)} className="tab-btn"
                style={{ background:groupFilter===g.name?(g.color||PRIMARY):'rgba(255,255,255,.05)', color:groupFilter===g.name?'#040810':'#4a6080' }}>
                {g.emoji||'📚'} {g.name}
              </button>
            ))}
          </div>
        </div>

        {/* File type filter */}
        <div className="fu d1" style={{ display:'flex', gap:5, marginBottom:16, flexWrap:'wrap' }}>
          {extTypes.map(t => (
            <button key={t} onClick={()=>setExtFilter(t)} className="tab-btn"
              style={{ background:extFilter===t?PRIMARY:'rgba(255,255,255,.05)', color:extFilter===t?'#040810':'#4a6080' }}>
              {t}
            </button>
          ))}
        </div>

        {/* Files list */}
        {shown.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px', color:'#4a6080' }}>
            <div style={{ fontSize:36, marginBottom:10 }}>📭</div>
            <div style={{ fontSize:13 }}>
              {resources.length === 0 ? 'No files yet — upload one!' : 'No files match your filters.'}
            </div>
          </div>
        ) : (
          <div className="fu d2 card" style={{ overflow:'hidden' }}>
            <div style={{ padding:'10px 16px', background:'rgba(255,255,255,.02)', borderBottom:'1px solid rgba(255,255,255,.06)', display:'flex', gap:8 }}>
              {['FILE','TYPE','OPEN','VOTES','💬','DEL'].map(h => (
                <div key={h} style={{ flex:h==='FILE'?4:1, fontSize:9, fontWeight:700, letterSpacing:2, color:'#4a6080' }}>{h}</div>
              ))}
            </div>
            {shown.map(r => (
              <ResourceRow key={String(r.id)} r={r} currentUser={user} onVote={vote} onDelete={deleteResource}/>
            ))}
          </div>
        )}

        {/* Drop zone */}
        <div className="fu d3"
          style={{ marginTop:14, padding:26, background:'rgba(255,255,255,.02)', border:'2px dashed rgba(255,255,255,.08)', borderRadius:13, textAlign:'center', cursor:'pointer', transition:'all .2s' }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=PRIMARY;e.currentTarget.style.background='rgba(56,189,248,.03)';}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,.08)';e.currentTarget.style.background='rgba(255,255,255,.02)';}}
          onClick={()=>setUploadOpen(true)}>
          <div style={{ fontSize:26, marginBottom:8 }}>📤</div>
          <div style={{ fontWeight:700, color:'#7a96b4', marginBottom:3, fontSize:13 }}>Drop files here or click Upload</div>
          <div style={{ fontSize:11, color:'#4a6080' }}>PDF, DOCX, MP4, IPYNB — Max 50MB</div>
        </div>
      </div>

      {uploadOpen && (
        <UploadModal
          mongoGroups={mongoGroups}
          onUpload={handleUpload}
          onClose={() => setUploadOpen(false)}
        />
      )}
    </div>
  );
};

export default LibraryPage;
