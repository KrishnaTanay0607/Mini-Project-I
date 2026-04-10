import React from 'react';
import { EXT_COLORS, EXT_EMOJIS } from '../../data/resources';
import { Icons } from '../../utils/icons';

const ResourceTable = ({ resources, onVote }) => (
  <div className="fu d2 card" style={{ overflow:'hidden' }}>
    <table style={{ width:'100%', borderCollapse:'collapse' }}>
      <thead>
        <tr style={{ background:'rgba(255,255,255,.02)' }}>
          {['File','Type','Group','Author','Votes'].map(h => (
            <th key={h} style={{ padding:'10px 15px', textAlign:'left', fontSize:9, fontWeight:700, letterSpacing:2, color:'#5a5a72', borderBottom:'1px solid rgba(255,255,255,.06)' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {resources.map(r => (
          <tr key={`${r.id}-${r.groupName}`} style={{ borderBottom:'1px solid rgba(255,255,255,.03)', transition:'background .15s' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,.02)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
            <td style={{ padding:'12px 15px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:`${EXT_COLORS[r.ext]||'#888'}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>
                  {EXT_EMOJIS[r.ext]||'📁'}
                </div>
                <div>
                  <div style={{ fontWeight:600, fontSize:13, color:'#f0f0f4' }}>{r.name}</div>
                  <div style={{ fontSize:10, color:'#5a5a72', marginTop:1 }}>{r.size} · {r.ago} ago</div>
                </div>
              </div>
            </td>
            <td style={{ padding:'12px 15px' }}>
              <span style={{ padding:'2px 7px', borderRadius:5, fontSize:9, fontWeight:700, background:`${EXT_COLORS[r.ext]||'#888'}18`, color:EXT_COLORS[r.ext]||'#888' }}>{r.ext}</span>
            </td>
            <td style={{ padding:'12px 15px' }}>
              <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#9090a8' }}>
                <span>{r.groupEmoji}</span>
                <span style={{ fontSize:11 }}>{r.groupName}</span>
              </span>
            </td>
            <td style={{ padding:'12px 15px', fontSize:12, color:'#5a5a72' }}>{r.by}</td>
            <td style={{ padding:'12px 15px' }}>
              <button onClick={() => onVote(r.id)}
                style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 11px', borderRadius:7, border:`1px solid ${r.voted?'#38bdf8':'rgba(255,255,255,.07)'}`, background:r.voted?'rgba(200,241,53,.1)':'transparent', color:r.voted?'#38bdf8':'#5a5a72', cursor:'pointer', fontSize:12, fontWeight:700, transition:'all .2s' }}>
                {Icons.thumb} {r.upvotes}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ResourceTable;
