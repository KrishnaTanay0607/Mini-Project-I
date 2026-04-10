import React, { useState, useRef } from 'react';
import Modal from '../../components/Modal/Modal';
import { Icons } from '../../utils/icons';

const PRIMARY = '#38bdf8';
const EXT_EMOJIS = { PDF:'📄', NOTEBOOK:'📓', DOC:'📝', MD:'📋', VIDEO:'🎬', IMAGE:'🖼️', ZIP:'📦', FILE:'📁' };

const isMongoId = id => /^[0-9a-fA-F]{24}$/.test(String(id));

const UploadModal = ({ open, onClose, group, onUploaded }) => {
  const [file,      setFile]      = useState(null);
  const [name,      setName]      = useState('');
  const [dragging,  setDragging]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [error,     setError]     = useState('');
  const inputRef = useRef(null);

  const reset = () => { setFile(null); setName(''); setError(''); setProgress(0); };

  const pickFile = (f) => {
    if (!f) return;
    if (f.size > 50*1024*1024) { setError('File too large — max 50 MB'); return; }
    setFile(f);
    setName(f.name.replace(/\.[^.]+$/, ''));
    setError('');
  };

  const upload = async () => {
    if (!file || !group) return;
    const gid = String(group._id || group.id || '');
    if (!isMongoId(gid)) {
      setError('Demo groups cannot store files. Join or create a real group first.');
      return;
    }
    setUploading(true); setProgress(20); setError('');
    try {
      const token = localStorage.getItem('sh_token');
      if (!token) { setError('Please log in first'); setUploading(false); return; }
      const form = new FormData();
      form.append('file', file);
      form.append('groupId', gid);
      form.append('name', name || file.name);
      setProgress(50);
      const res  = await fetch('http://localhost:5000/api/resources/upload', {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error('Server error — check backend is running'); }
      setProgress(100);
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      onUploaded(data.resource);
      reset(); onClose();
    } catch (err) { setError(err.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const ext = file ? (file.name.split('.').pop().toUpperCase()) : null;

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title={`Upload to ${group?.emoji||'📚'} ${group?.name||'Group'}`} width={460}>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files[0]); }}
          onClick={() => !file && inputRef.current?.click()}
          style={{ padding:'28px 20px', border:`2px dashed ${dragging?(group?.color||PRIMARY):file?PRIMARY:'rgba(255,255,255,.1)'}`, borderRadius:12, textAlign:'center', cursor:file?'default':'pointer', background:dragging?`${PRIMARY}08`:file?`${PRIMARY}04`:'transparent', transition:'all .2s' }}>
          {file ? (
            <div style={{ display:'flex', alignItems:'center', gap:12, justifyContent:'center' }}>
              <div style={{ width:44, height:44, borderRadius:11, background:`${PRIMARY}14`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
                {EXT_EMOJIS[ext] || '📄'}
              </div>
              <div style={{ textAlign:'left', flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#e8f0f8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{file.name}</div>
                <div style={{ fontSize:11, color:'#4a6080' }}>{(file.size/1048576).toFixed(2)} MB</div>
              </div>
              <button onClick={e=>{e.stopPropagation();reset();}} style={{ background:'none', border:'none', color:'#f87171', cursor:'pointer', fontSize:20, flexShrink:0 }}>×</button>
            </div>
          ) : (
            <>
              <div style={{ fontSize:36, marginBottom:10 }}>📤</div>
              <div style={{ fontSize:13, fontWeight:700, color:'#7a96b4', marginBottom:4 }}>Drop a file or click to browse</div>
              <div style={{ fontSize:11, color:'#4a6080' }}>PDF, DOCX, MD, MP4, IPYNB, ZIP — max 50 MB</div>
            </>
          )}
          <input ref={inputRef} type="file" style={{ display:'none' }} onChange={e=>pickFile(e.target.files[0])}/>
        </div>

        {/* Name input */}
        {file && (
          <div>
            <label style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, color:'#4a6080', display:'block', marginBottom:5 }}>DISPLAY NAME</label>
            <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Week 3 Lecture Notes"/>
          </div>
        )}

        {/* Progress bar */}
        {uploading && (
          <div>
            <div style={{ height:4, background:'rgba(255,255,255,.07)', borderRadius:2, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${progress}%`, background:PRIMARY, borderRadius:2, transition:'width .4s' }}/>
            </div>
            <div style={{ fontSize:11, color:'#4a6080', marginTop:5, textAlign:'center' }}>Uploading... {progress}%</div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding:'9px 12px', background:'rgba(248,113,113,.1)', border:'1px solid rgba(248,113,113,.22)', borderRadius:8, fontSize:12, color:'#f87171' }}>⚠️ {error}</div>
        )}

        {/* Buttons */}
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-primary" onClick={upload} disabled={!file||uploading}
            style={{ flex:1, justifyContent:'center', padding:11, fontSize:13, opacity:(!file||uploading)?0.5:1 }}>
            {uploading ? '⏳ Uploading...' : <>{Icons.upload} Upload File</>}
          </button>
          <button className="btn btn-ghost" onClick={()=>{reset();onClose();}} style={{ padding:'11px 14px' }}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
};
export default UploadModal;
