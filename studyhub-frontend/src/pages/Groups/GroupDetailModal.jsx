import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import Badge from '../../components/Badge/Badge';
import LiveDot from '../../components/LiveDot/LiveDot';
import MeetLinkSection from './MeetLinkSection';
import GroupChat from './GroupChat';
import UploadModal from './UploadModal';
import ResourceComments from './ResourceComments';
import { Icons } from '../../utils/icons';
import { parseMarkdown } from '../../utils/markdown';
import { EXT_COLORS, EXT_EMOJIS } from '../../data/resources';
import { api } from '../../utils/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const PRIMARY = '#38bdf8';
const isMongo = id => /^[0-9a-fA-F]{24}$/.test(String(id));
const fmtDate = ts => {
  if (!ts) return 'just now';
  const d = (Date.now() - new Date(ts)) / 1000;
  if (d < 60) return 'just now';
  if (d < 3600) return Math.floor(d/60) + 'm ago';
  if (d < 86400) return Math.floor(d/3600) + 'h ago';
  return Math.floor(d/86400) + 'd ago';
};

const NoteViewer = ({ note, onBack }) => (
  <div>
    <button onClick={onBack} style={{ display:'flex',alignItems:'center',gap:6,background:'none',border:'none',color:'#4a6080',cursor:'pointer',fontSize:12,fontWeight:700,marginBottom:16,padding:0 }}>← Back</button>
    <div style={{ fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:900,color:'#e8f0f8',marginBottom:4 }}>{note.title}</div>
    <div style={{ fontSize:11,color:'#4a6080',marginBottom:14 }}>by {note.by||note.author?.name} · {note.when||fmtDate(note.updatedAt)}</div>
    <div style={{ background:'#0a0d12',borderRadius:10,padding:'16px 18px',maxHeight:320,overflowY:'auto',border:'1px solid rgba(255,255,255,.06)' }}
      dangerouslySetInnerHTML={{ __html: parseMarkdown(note.content||'') }}/>
  </div>
);

/* ══ MEMBERS TAB — invite from friend list ════════════════════════ */
const MembersTab = ({ group }) => {
  const [members,      setMembers]      = useState([]);
  const [friends,      setFriends]      = useState([]);
  const [inviting,     setInviting]     = useState(null);  // friendId being invited
  const [invited,      setInvited]      = useState({});    // friendId -> 'ok'|'err'
  const [msg,          setMsg]          = useState('');
  const [msgType,      setMsgType]      = useState('');
  const [loadFriends,  setLoadFriends]  = useState(false);
  const gc = group?.color || PRIMARY;

  const gid = String(group?._id || group?.id || '');
  const isRealGroup = isMongo(gid);

  useEffect(() => {
    if (!isRealGroup) {
      setMembers([{ _id:'seed', name:'Community', friendCode:'DEMO00' }]);
      return;
    }
    api(`/api/groups/${gid}/members`)
      .then(d => setMembers(d.members || []))
      .catch(() => {});
  }, [gid, isRealGroup]);

  useEffect(() => {
    if (!isRealGroup) return;
    setLoadFriends(true);
    api('/api/friends')
      .then(d => setFriends(d.friends || []))
      .catch(() => {})
      .finally(() => setLoadFriends(false));
  }, [isRealGroup]);

  const memberIds = new Set(members.map(m => String(m._id)));
  const friendsNotInGroup = friends.filter(f => !memberIds.has(String(f._id)));

  const sendInvite = async (friendCode, friendName, friendId) => {
    if (!isRealGroup) { setMsg('Create or join a real group to invite members'); setMsgType('warn'); return; }
    setInviting(friendId); setMsg('');
    try {
      const d = await api(`/api/groups/${gid}/invite`, { method:'POST', body: JSON.stringify({ friendCode }) });
      setMsg(d.message || `Invite sent to ${friendName}!`); setMsgType('ok');
      setInvited(prev => ({ ...prev, [friendId]: 'ok' }));
    } catch (err) {
      setMsg(err.message || 'Failed'); setMsgType('err');
      setInvited(prev => ({ ...prev, [friendId]: 'err' }));
    } finally { setInviting(null); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {msg && (
        <div style={{ padding:'9px 12px', borderRadius:9, background: msgType==='ok'?'rgba(74,222,128,.08)':msgType==='err'?'rgba(248,113,113,.08)':'rgba(251,191,36,.08)', border:`1px solid ${msgType==='ok'?'rgba(74,222,128,.2)':msgType==='err'?'rgba(248,113,113,.2)':'rgba(251,191,36,.2)'}`, fontSize:12, color: msgType==='ok'?'#4ade80':msgType==='err'?'#f87171':'#fbbf24', fontFamily:"'Manrope',sans-serif" }}>
          {msgType==='ok'?'✅':msgType==='err'?'❌':'⚠️'} {msg}
        </div>
      )}

      {/* Friend list — invite from here */}
      {isRealGroup && (
        <div style={{ padding:'14px 16px', background:`${gc}08`, border:`1px solid ${gc}22`, borderRadius:12 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:800, color:'#e8f0f8', marginBottom:10 }}>
            Invite from Friends
          </div>
          {loadFriends ? (
            <div style={{ fontSize:12, color:'#4a6080', textAlign:'center', padding:'10px 0' }}>Loading friends…</div>
          ) : friendsNotInGroup.length === 0 ? (
            <div style={{ fontSize:12, color:'#4a6080', textAlign:'center', padding:'8px 0' }}>
              {friends.length === 0 ? 'You have no friends yet — add some from the Friends page!' : 'All your friends are already in this group 🎉'}
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:7, maxHeight:200, overflowY:'auto' }}>
              {friendsNotInGroup.map(f => {
                const initials  = f.name ? f.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : '?';
                const avatarBg  = `hsl(${(f.name?.charCodeAt(0)||65)*17%360},50%,38%)`;
                const wasInvited = invited[String(f._id)];
                return (
                  <div key={f._id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 11px', background:'rgba(255,255,255,.03)', borderRadius:9, border:'1px solid rgba(255,255,255,.06)' }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:`linear-gradient(135deg,${avatarBg},#1a2a4a)`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:11, color:'#fff', flexShrink:0 }}>{initials}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:'#e8f0f8', fontFamily:"'Manrope',sans-serif" }}>{f.name}</div>
                      {f.friendCode && <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:PRIMARY, letterSpacing:1.5 }}>{f.friendCode}</div>}
                    </div>
                    <button
                      onClick={() => sendInvite(f.friendCode, f.name, String(f._id))}
                      disabled={!!wasInvited || inviting === String(f._id)}
                      style={{ padding:'4px 12px', borderRadius:7, border:`1px solid ${wasInvited==='ok'?'rgba(74,222,128,.3)':wasInvited==='err'?'rgba(248,113,113,.3)':`${gc}44`}`, background: wasInvited==='ok'?'rgba(74,222,128,.1)':wasInvited==='err'?'rgba(248,113,113,.1)':`${gc}14`, color: wasInvited==='ok'?'#4ade80':wasInvited==='err'?'#f87171':gc, cursor: wasInvited?'default':'pointer', fontSize:11, fontWeight:700, fontFamily:"'Manrope',sans-serif", transition:'all .2s', opacity: inviting===String(f._id)?0.6:1, flexShrink:0 }}>
                      {inviting===String(f._id) ? '⏳' : wasInvited==='ok' ? '✅ Sent' : wasInvited==='err' ? '❌ Failed' : '📨 Invite'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ fontSize:10, color:'#4a6080', marginTop:8, fontFamily:"'Manrope',sans-serif" }}>
            They'll get a notification when invited.
          </div>
        </div>
      )}

      {/* Current members list */}
      <div>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:2, color:'#4a6080', marginBottom:9, fontFamily:"'Manrope',sans-serif" }}>
          MEMBERS ({members.length})
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:7, maxHeight:240, overflowY:'auto' }}>
          {members.map((m,i) => {
            const initials = m.name ? m.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : '?';
            const avatarBg = `hsl(${(m.name?.charCodeAt(0)||65)*17%360},50%,38%)`;
            return (
              <div key={m._id||i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'rgba(255,255,255,.03)', borderRadius:10, border:'1px solid rgba(255,255,255,.06)' }}>
                <div style={{ width:34, height:34, borderRadius:'50%', background:`linear-gradient(135deg,${avatarBg},#1a2a4a)`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:12, color:'#fff', flexShrink:0 }}>{initials}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#e8f0f8', fontFamily:"'Manrope',sans-serif" }}>{m.name}</div>
                  {m.friendCode && <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:PRIMARY, letterSpacing:1.5 }}>{m.friendCode}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ══ GROUP DETAIL MODAL ══════════════════════════════════════════ */
const GroupDetailModal = ({ group, isJoined, onClose, onToggleJoin, onAddLink, onDeleteLink, onDeleteGroup }) => {
  const { socket }                    = useSocket();
  const { user }                      = useAuth();
  const [tab, setTab]                 = useState('info');
  const [activeNote, setActiveNote]   = useState(null);
  const [dbNotes,    setDbNotes]      = useState(null);   // null = not loaded yet
  const [dbResources, setDbResources] = useState(null);
  const [uploadOpen,  setUploadOpen]  = useState(false);
  const [confirmDel,  setConfirmDel]  = useState(false);

  const isLive    = (group?.meetLinks?.length ?? 0) > 0;
  const gc        = group?.color || PRIMARY;
  const gid       = group ? String(group._id || group.id) : null;
  const isRealDb  = gid && isMongo(gid);
  const isCreator = user && group && String(group.creator?._id || group.creator) === String(user._id);

  /* ── Load DB notes when Notes tab is opened ── */
  useEffect(() => {
    if (tab !== 'notes' || !isJoined || !isRealDb) return;
    api(`/api/notes/${gid}`)
      .then(d => {
        setDbNotes((d.notes || []).map(n => ({
          ...n, id: String(n._id), by: n.author?.name || 'You', when: fmtDate(n.updatedAt)
        })));
      })
      .catch(() => setDbNotes([]));
  }, [tab, isJoined, gid, isRealDb]);

  /* ── Realtime: refresh notes when a new one is added ── */
  useEffect(() => {
    if (!socket || !isRealDb) return;
    const handler = () => {
      api(`/api/notes/${gid}`)
        .then(d => setDbNotes((d.notes || []).map(n => ({ ...n, id: String(n._id), by: n.author?.name || 'You', when: fmtDate(n.updatedAt) }))))
        .catch(() => {});
    };
    socket.on('note_added', handler);
    return () => socket.off('note_added', handler);
  }, [socket, gid, isRealDb]);

  /* ── Load resources when Files tab is opened ── */
  useEffect(() => {
    if (tab !== 'files' || !isJoined || dbResources !== null || !isRealDb) return;
    api(`/api/resources/${gid}`)
      .then(d => setDbResources(d.resources || []))
      .catch(() => setDbResources([]));
  }, [tab, isJoined, gid, isRealDb]);

  const handleClose = () => {
    setTab('info'); setActiveNote(null); setDbResources(null); setDbNotes(null); setConfirmDel(false); onClose();
  };

  const handleDeleteGroup = () => {
    if (confirmDel) { onDeleteGroup(group.id || group._id); handleClose(); }
    else { setConfirmDel(true); setTimeout(() => setConfirmDel(false), 4000); }
  };

  const allResources = [
    ...(dbResources || []).map(r => ({
      id: r._id, name: r.name, ext: r.ext,
      size: r.sizeFormatted || `${((r.size||0)/1048576).toFixed(1)} MB`,
      upvotes: r.upvotes, by: r.uploader?.name || 'You',
      fileUrl: r.fileUrl, filename: r.filename,
      comments: r.comments || [], fromDb: true,
    })),
    ...(group?.resources || []),
  ];

  // Notes to show: DB notes if real group (and loaded), else seed notes
  const displayNotes = isRealDb ? (dbNotes || []) : (group?.notes || []);
  const notesCount   = isRealDb ? (dbNotes?.length ?? group?.notes?.length ?? 0) : (group?.notes?.length ?? 0);

  const TABS = [
    ['info',    '📋 Info'],
    ['notes',   `📝 Notes (${notesCount})`],
    ['files',   `📁 Files (${allResources.length})`],
    ['members', `👥 Members`],
    ['chat',    '💬 Chat'],
  ];

  const locked = (label) => (
    <div style={{ textAlign:'center', padding:'32px 0' }}>
      <div style={{ fontSize:36, marginBottom:12 }}>🔒</div>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, color:'#7a96b4', marginBottom:8 }}>Members Only</div>
      <p style={{ fontSize:13, color:'#4a6080', marginBottom:20 }}>Join to access {label}.</p>
      <button className="btn btn-primary" onClick={() => onToggleJoin(group.id||group._id)} style={{ justifyContent:'center' }}>{Icons.plus} Join</button>
    </div>
  );

  if (!group) return null;

  return (
    <>
      <Modal open={!!group} onClose={handleClose} title={`${group.emoji||'📚'} ${group.name}`} width={580}>
        <div>
          {/* Header badges */}
          <div style={{ display:'flex', gap:7, marginBottom:14, alignItems:'center', flexWrap:'wrap' }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:gc, background:`${gc}14`, padding:'3px 9px', borderRadius:5, fontWeight:700 }}>{group.course}</span>
            {isLive && <LiveDot/>}
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', gap:2, background:'rgba(255,255,255,.04)', borderRadius:10, padding:3, marginBottom:18, overflowX:'auto' }}>
            {TABS.map(([v,l]) => (
              <button key={v} onClick={() => { setTab(v); setActiveNote(null); }}
                style={{ flex:1, padding:'6px 6px', borderRadius:7, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, fontFamily:"'Manrope',sans-serif", transition:'all .2s', background:tab===v?gc:'transparent', color:tab===v?'#040810':'#4a6080', whiteSpace:'nowrap', minWidth:0 }}>
                {l}
              </button>
            ))}
          </div>

          {/* ── INFO ── */}
          {tab === 'info' && (
            <div>
              <p style={{ color:'#7a96b4', fontSize:13, lineHeight:1.7, marginBottom:18, fontFamily:"'Manrope',sans-serif" }}>{group.desc}</p>
              <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:18 }}>
                {(group.tags||[]).map(t => <Badge key={t} color={gc}>{t}</Badge>)}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9, marginBottom:18 }}>
                {[['Next Session',group.next||'TBD'],['Members',String(typeof group.members==='number'?group.members:group.members?.length||0)],['Notes',String(notesCount)],['Files',String(allResources.length)]].map(([k,v]) => (
                  <div key={k} style={{ background:'#0a0d12', borderRadius:8, padding:'11px 14px' }}>
                    <div style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, color:'#4a6080', marginBottom:3, fontFamily:"'Manrope',sans-serif" }}>{k.toUpperCase()}</div>
                    <div style={{ fontWeight:600, fontSize:13, color:'#e8f0f8', fontFamily:"'Manrope',sans-serif" }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                <button className={`btn ${isJoined?'btn-ghost':'btn-primary'}`} style={{ flex:1, justifyContent:'center', padding:11, fontSize:13, color:isJoined?'#f87171':undefined, borderColor:isJoined?'rgba(248,113,113,.25)':undefined }}
                  onClick={() => onToggleJoin(group.id||group._id)}>
                  {isJoined ? '🚪 Exit Group' : <>{Icons.plus} Join Group</>}
                </button>
                {isCreator && (
                  <button onClick={handleDeleteGroup}
                    style={{ padding:'11px 14px', borderRadius:9, border:`1px solid ${confirmDel?'rgba(248,113,113,.5)':'rgba(248,113,113,.2)'}`, background:confirmDel?'rgba(248,113,113,.15)':'transparent', color:'#f87171', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:"'Manrope',sans-serif", transition:'all .2s', whiteSpace:'nowrap' }}>
                    {confirmDel ? '⚠️ Confirm?' : '🗑️ Delete'}
                  </button>
                )}
              </div>
              <MeetLinkSection
                groupId={gid} meetLinks={group.meetLinks||[]}
                onAddLink={(gId, link) => { onAddLink(gId, link); if (socket) socket.emit('meet_link_added', gId); }}
                onDeleteLink={onDeleteLink}
                isJoined={isJoined}
              />
              {!isJoined && (
                <div style={{ marginTop:14, padding:'11px 14px', background:'rgba(56,189,248,.04)', border:'1px solid rgba(56,189,248,.12)', borderRadius:10, fontSize:12, color:'#4a6080', textAlign:'center', fontFamily:"'Manrope',sans-serif" }}>
                  🔒 Join to access notes, files, chat and meeting links
                </div>
              )}
            </div>
          )}

          {/* ── NOTES ── */}
          {tab === 'notes' && (
            !isJoined ? locked('notes') :
            activeNote ? <NoteViewer note={activeNote} onBack={() => setActiveNote(null)}/> :
            dbNotes === null && isRealDb ? (
              <div style={{ textAlign:'center', padding:'28px 0', color:'#4a6080' }}>
                <div style={{ fontSize:28, marginBottom:8 }}>⏳</div>
                <div style={{ fontSize:13, fontFamily:"'Manrope',sans-serif" }}>Loading notes…</div>
              </div>
            ) :
            displayNotes.length === 0 ? (
              <div style={{ textAlign:'center', padding:'28px 0', color:'#4a6080' }}>
                <div style={{ fontSize:36, marginBottom:10 }}>📭</div>
                <div style={{ fontSize:13, fontFamily:"'Manrope',sans-serif", marginBottom:14 }}>No notes yet — go to the Notes page to create some!</div>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:380, overflowY:'auto' }}>
                {displayNotes.map(note => (
                  <button key={note.id||note._id} onClick={() => setActiveNote(note)}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'rgba(255,255,255,.03)', borderRadius:10, border:'1px solid rgba(255,255,255,.06)', cursor:'pointer', textAlign:'left', width:'100%', transition:'all .2s' }}
                    onMouseEnter={e=>{e.currentTarget.style.background=`${gc}08`;e.currentTarget.style.borderColor=`${gc}44`;}}
                    onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,.03)';e.currentTarget.style.borderColor='rgba(255,255,255,.06)';}}>
                    <div style={{ width:36, height:36, borderRadius:9, background:`${gc}14`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>📝</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:13, color:'#e8f0f8', marginBottom:2, fontFamily:"'Manrope',sans-serif" }}>{note.title}</div>
                      <div style={{ fontSize:10, color:'#4a6080', fontFamily:"'Manrope',sans-serif" }}>by {note.by||note.author?.name} · {note.when||fmtDate(note.updatedAt)}</div>
                    </div>
                    <span style={{ color:'#4a6080', fontSize:12 }}>→</span>
                  </button>
                ))}
              </div>
            )
          )}

          {/* ── FILES ── */}
          {tab === 'files' && (
            !isJoined ? locked('files') : (
              <div>
                <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:12 }}>
                  <button className="btn btn-primary" style={{ fontSize:12, padding:'6px 14px' }} onClick={() => setUploadOpen(true)}>
                    {Icons.upload} Upload File
                  </button>
                </div>
                {dbResources === null ? (
                  <div style={{ textAlign:'center', padding:24, color:'#4a6080', fontSize:12 }}>Loading files...</div>
                ) : allResources.length === 0 ? (
                  <div style={{ textAlign:'center', padding:24, color:'#4a6080' }}>
                    <div style={{ fontSize:32, marginBottom:8 }}>📭</div>
                    <div style={{ fontSize:12 }}>No files yet — upload one!</div>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:10, maxHeight:340, overflowY:'auto' }}>
                    {allResources.map((r,i) => (
                      <div key={r.id||i} style={{ background:'rgba(255,255,255,.03)', borderRadius:10, border:'1px solid rgba(255,255,255,.06)', padding:'12px 14px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:34, height:34, borderRadius:9, background:`${EXT_COLORS[r.ext]||'#888'}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>{EXT_EMOJIS[r.ext]||'📁'}</div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontWeight:600, fontSize:13, color:'#e8f0f8', marginBottom:1, fontFamily:"'Manrope',sans-serif" }}>{r.name}</div>
                            <div style={{ fontSize:10, color:'#4a6080', fontFamily:"'Manrope',sans-serif" }}>by {r.by} · {r.size}</div>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            {(r.fileUrl||r.filename) && (
                              <a href={r.fileUrl||`http://localhost:5000/uploads/${r.filename}`} target="_blank" rel="noopener noreferrer"
                                style={{ padding:'4px 10px', borderRadius:7, background:'rgba(56,189,248,.1)', border:'1px solid rgba(56,189,248,.25)', color:PRIMARY, fontSize:11, fontWeight:700, textDecoration:'none', fontFamily:"'Manrope',sans-serif" }}>
                                Open
                              </a>
                            )}
                            <span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:5, background:`${EXT_COLORS[r.ext]||'#888'}18`, color:EXT_COLORS[r.ext]||'#888' }}>{r.ext}</span>
                            <span style={{ fontSize:11, color:'#4a6080', fontWeight:700, display:'flex', alignItems:'center', gap:3 }}>{Icons.thumb} {r.upvotes}</span>
                          </div>
                        </div>
                        {r.fromDb && <ResourceComments resourceId={r.id} comments={r.comments} groupColor={gc}/>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          )}

          {/* ── MEMBERS ── */}
          {tab === 'members' && (
            !isJoined ? locked('members') : <MembersTab group={group}/>
          )}

          {/* ── CHAT ── */}
          {tab === 'chat' && (
            !isJoined ? locked('chat') : (
              <div style={{ height:400 }}>
                <GroupChat group={group} socket={socket}/>
              </div>
            )
          )}
        </div>
      </Modal>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        group={group}
        onUploaded={res => {
          const nr = {
            id: res._id||res.id, name: res.name, ext: res.ext,
            size: res.sizeFormatted||'?', upvotes: res.upvotes||0,
            by: res.uploader?.name||'You', comments: [], fromDb: true,
            fileUrl: res.fileUrl, filename: res.filename,
          };
          setDbResources(prev => [nr, ...(prev||[])]);
        }}
      />
    </>
  );
};
export default GroupDetailModal;
