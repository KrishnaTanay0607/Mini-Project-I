import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from '../../utils/icons';
import { api } from '../../utils/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import GroupCard from './GroupCard';
import GroupDetailModal from './GroupDetailModal';
import CreateGroupModal from './CreateGroupModal';
import { GROUPS_DATA } from '../../data/groups';

const PRIMARY     = '#38bdf8';
const SEED_COLORS = ['#38bdf8','#2dd4bf','#a78bfa','#fbbf24','#f472b6','#4ade80','#60a5fa'];
const isMongoId   = id => /^[0-9a-fA-F]{24}$/.test(String(id));

/* Normalise a backend group into consistent shape */
const normalise = g => ({
  ...g,
  id:        String(g._id || g.id),
  members:   Array.isArray(g.members) ? g.members.length : (g.members || 0),
  notes:     g.notes     || [],
  resources: g.resources || [],
  meetLinks: g.meetLinks || [],
  tags:      g.tags      || [],
  isSeed:    false,
});

const GroupsPage = ({ toast }) => {
  const { socket }                  = useSocket();
  const { user }                    = useAuth();
  const [groups,      setGroups]    = useState([]);
  const [joinedIds,   setJoinedIds] = useState(new Set());
  const [filter,      setFilter]    = useState('all');
  const [search,      setSearch]    = useState('');
  const [selected,    setSelected]  = useState(null);
  const [createOpen,  setCreateOpen]= useState(false);
  const [form,        setForm]      = useState({ name:'', course:'', emoji:'📚', desc:'' });
  const [loading,     setLoading]   = useState(true);

  /* ── Load: backend groups + seed groups always shown ── */
  const loadGroups = useCallback(async () => {
    try {
      const data          = await api('/api/groups');
      const backendGroups = (data.groups || []).map(normalise);

      // Seed groups always shown as recommendations
      const seedGroups = GROUPS_DATA.map(g => ({ ...g, id: String(g.id), isSeed: true }));

      // Merge: backend first, then seeds
      const merged = [...backendGroups, ...seedGroups];
      setGroups(merged);

      // Figure out which backend groups user has joined
      // Compare string IDs to be safe
      const uid = String(user?._id || '');
      const joinedSet = new Set();

      if (uid) {
        data.groups.forEach(bg => {
          const memberIds = (bg.members || []).map(m => String(m._id || m));
          if (memberIds.includes(uid)) {
            joinedSet.add(String(bg._id));
          }
        });
      }

      // Seed groups 1 and 3 always shown as joined for demo
      joinedSet.add('1');
      joinedSet.add('3');
      setJoinedIds(joinedSet);

    } catch {
      // Offline — show seed groups only
      setGroups(GROUPS_DATA.map(g => ({ ...g, id: String(g.id), isSeed: true })));
      setJoinedIds(new Set(['1', '3']));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadGroups(); }, [loadGroups]);

  /* ── Sync helper ── */
  const syncGroup = (id, updater) => {
    const sid = String(id);
    setGroups(gs  => gs.map(g  => String(g.id) === sid ? updater(g)  : g));
    setSelected(s => s && String(s.id) === sid ? updater(s) : s);
  };

  /* ── Join / Leave ── */
  const toggleJoin = async (id) => {
    const sid = String(id);
    const was = joinedIds.has(sid);

    // Optimistic update
    setJoinedIds(prev => {
      const next = new Set(prev);
      was ? next.delete(sid) : next.add(sid);
      return next;
    });

    if (isMongoId(sid)) {
      try {
        await api(`/api/groups/${sid}/join`, { method: 'PUT' });
        toast(was ? 'Left group 👋' : 'Joined! 🎉');
      } catch (err) {
        // Revert
        setJoinedIds(prev => {
          const next = new Set(prev);
          was ? next.add(sid) : next.delete(sid);
          return next;
        });
        toast(`⚠️ ${err.message}`);
        return;
      }
    } else {
      toast(was ? 'Left group 👋' : 'Joined! Access notes, files and chat 🎉');
    }
    syncGroup(id, g => ({ ...g }));
  };

  /* ── Create group — save to DB, prepend to list (seeds stay) ── */
  const handleCreate = async () => {
    if (!form.name || !form.course) { toast('Fill name & course ⚠️'); return; }
    const color = SEED_COLORS[Math.floor(Math.random() * SEED_COLORS.length)];

    try {
      const data = await api('/api/groups', {
        method: 'POST',
        body:   JSON.stringify({ ...form, color }),
      });
      const newGroup = normalise(data.group);
      // PREPEND to list — seeds remain untouched
      setGroups(gs => [newGroup, ...gs]);
      setJoinedIds(prev => new Set([...prev, newGroup.id]));
      toast(`"${newGroup.name}" created! 🚀`);
    } catch (err) {
      // Offline fallback
      const newGroup = {
        id: String(Date.now()), ...form, color,
        members: 1, tags: [], next: 'TBD',
        meetLinks: [], notes: [], resources: [], isSeed: false,
        desc: form.desc || 'A new study group.',
      };
      setGroups(gs => [newGroup, ...gs]);
      setJoinedIds(prev => new Set([...prev, newGroup.id]));
      toast(`"${newGroup.name}" created (offline mode) 🚀`);
    }

    setCreateOpen(false);
    setForm({ name:'', course:'', emoji:'📚', desc:'' });
  };

  /* ── Delete group ── */
  const deleteGroup = async (id) => {
    if (isMongoId(String(id))) {
      try {
        await api(`/api/groups/${id}`, { method: 'DELETE' });
      } catch (err) {
        toast(`⚠️ ${err.message}`);
        return;
      }
    }
    setGroups(gs => gs.filter(g => String(g.id) !== String(id)));
    setSelected(null);
    toast('Group deleted');
  };

  /* ── Meet links ── */
  const addLink = (groupId, link) => {
    syncGroup(groupId, g => ({ ...g, meetLinks: [...(g.meetLinks||[]), link] }));
    if (socket) socket.emit('meet_link_added', groupId);
    toast('Meeting link shared! Group is LIVE 🔴');
  };

  const deleteLink = (groupId, linkId) => {
    syncGroup(groupId, g => {
      const remaining = (g.meetLinks||[]).filter(l => String(l.id||l._id) !== String(linkId));
      if (remaining.length === 0 && socket) socket.emit('meet_link_removed', groupId);
      return { ...g, meetLinks: remaining };
    });
    toast('Link removed');
  };

  /* ── Filter ── */
  const filtered = groups.filter(g => {
    const sid = String(g.id);
    if (filter === 'joined' && !joinedIds.has(sid)) return false;
    if (filter === 'live'   && (g.meetLinks?.length||0) === 0) return false;
    const q = search.toLowerCase();
    return !q || g.name.toLowerCase().includes(q) || (g.course||'').toLowerCase().includes(q);
  });

  if (loading) return (
    <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontSize:32, animation:'pulse 1s infinite' }}>📚</div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:13 }}>
            <div>
              <h1 className="fu">Study Groups</h1>
              <p className="fu d1">Join a group to access its notes, files, chat and meeting links.</p>
            </div>
            <div className="fu d2" style={{ display:'flex', gap:9, alignItems:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 11px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', borderRadius:8, minWidth:200 }}>
                <span style={{ color:'#4a6080' }}>{Icons.search}</span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search groups..."
                  style={{ background:'none', border:'none', outline:'none', color:'#e8f0f8', fontSize:13, flex:1, fontFamily:"'Manrope',sans-serif" }}/>
              </div>
              <button className="btn btn-primary" onClick={()=>setCreateOpen(true)} style={{ fontSize:12, padding:'7px 14px' }}>
                {Icons.plus} New Group
              </button>
            </div>
          </div>
          <div className="fu d3" style={{ display:'flex', gap:5, marginTop:18 }}>
            {[['all','All Groups'],['joined','My Groups'],['live','Live Now 🔴']].map(([v,l]) => (
              <button key={v} onClick={()=>setFilter(v)} className="tab-btn"
                style={{ background:filter===v?PRIMARY:'rgba(255,255,255,.05)', color:filter===v?'#040810':'#4a6080' }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="content">
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px', color:'#4a6080' }}>
            <div style={{ fontSize:48, marginBottom:14 }}>🔍</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:'#7a96b4' }}>No groups found</div>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(295px,1fr))', gap:15 }}>
            {filtered.map((g, i) => (
              <GroupCard
                key={String(g.id)}
                group={{ ...g, id: String(g.id) }}
                isJoined={joinedIds.has(String(g.id))}
                onSelect={setSelected}
                onToggleJoin={toggleJoin}
                animClass={`fu d${Math.min(i+1,4)}`}
              />
            ))}
          </div>
        )}
      </div>

      <GroupDetailModal
        group={selected}
        isJoined={selected ? joinedIds.has(String(selected.id)) : false}
        onClose={() => setSelected(null)}
        onToggleJoin={toggleJoin}
        onAddLink={addLink}
        onDeleteLink={deleteLink}
        onDeleteGroup={deleteGroup}
      />
      <CreateGroupModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        form={form}
        setForm={setForm}
      />
    </div>
  );
};

export default GroupsPage;
