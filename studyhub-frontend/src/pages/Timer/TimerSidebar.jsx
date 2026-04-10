import React from 'react';
import LiveDot from '../../components/LiveDot/LiveDot';
import Badge from '../../components/Badge/Badge';
const TimerSidebar = () => (
  <div style={{ display:'flex',flexDirection:'column',gap:13 }}>
    <div className="fu card" style={{ padding:20 }}>
      <div style={{ fontSize:9,fontWeight:700,letterSpacing:2,color:'#5a5a72',marginBottom:14 }}>THIS WEEK</div>
      {[['Focus Hours','6.5/10',65,'#38bdf8'],['Pomodoros','13/20',65,'#2dd4bf'],['Streak','5 days 🔥',71,'#a78bfa']].map(([l,v,p,c]) => (
        <div key={l} style={{ marginBottom:13 }}>
          <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:5 }}>
            <span style={{ color:'#9090a8' }}>{l}</span><span style={{ color:c,fontWeight:700 }}>{v}</span>
          </div>
          <div style={{ height:4,background:'rgba(255,255,255,.06)',borderRadius:2,overflow:'hidden' }}>
            <div style={{ height:'100%',width:`${p}%`,background:c,borderRadius:2,boxShadow:`0 0 8px ${c}55`,transition:'width .6s ease' }}/>
          </div>
        </div>
      ))}
    </div>
    <div className="fu d1 card" style={{ padding:20 }}>
      <div style={{ fontSize:9,fontWeight:700,letterSpacing:2,color:'#5a5a72',marginBottom:12 }}>TODAY'S SESSIONS</div>
      {[{n:'⚡ Algorithms',t:'Today 6PM',s:'live'},{n:'📐 Linear Algebra',t:'Today 8PM',s:'soon'},{n:'⚛️ Quantum',t:'Tomorrow 2PM',s:'sched'}].map((s,i) => (
        <div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 11px',background:'rgba(255,255,255,.03)',borderRadius:8,marginBottom:6,border:'1px solid rgba(255,255,255,.06)' }}>
          <div><div style={{ fontSize:12,fontWeight:600,marginBottom:2,color:'#f0f0f4' }}>{s.n}</div><div style={{ fontSize:10,color:'#5a5a72' }}>{s.t}</div></div>
          {s.s==='live'?<LiveDot/>:s.s==='soon'?<Badge color="#fbbf24">Soon</Badge>:<Badge color="#5a5a72">Sched</Badge>}
        </div>
      ))}
    </div>
    <div className="fu d2 card" style={{ padding:20,textAlign:'center' }}>
      <div style={{ fontSize:34,marginBottom:9 }}>🎯</div>
      <div style={{ fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,marginBottom:4,color:'#f0f0f4' }}>Daily Goal</div>
      <div style={{ fontSize:11,color:'#5a5a72',marginBottom:12 }}>Complete 8 Pomodoros</div>
      <div style={{ height:4,background:'rgba(255,255,255,.06)',borderRadius:2,overflow:'hidden',marginBottom:6 }}>
        <div style={{ height:'100%',width:'37.5%',background:'linear-gradient(90deg,#38bdf8,#2dd4bf)',borderRadius:2 }}/>
      </div>
      <div style={{ fontSize:11,color:'#5a5a72' }}>3 / 8 done</div>
    </div>
  </div>
);
export default TimerSidebar;
