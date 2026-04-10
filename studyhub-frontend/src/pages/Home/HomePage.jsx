import React from 'react';
import { Icons } from '../../utils/icons';

const PRIMARY = '#38bdf8';

const FEATURES = [
  { e:"👥", t:"Smart Study Groups",    d:"Course-specific groups with live sessions, scheduling, and real-time member sync.", c:'#38bdf8' },
  { e:"📝", t:"Collaborative Notes",   d:"Live Markdown editor — type together, see changes instantly across your whole group.", c:'#7dd3fc' },
  { e:"📁", t:"Resource Library",      d:"Upload past papers, PDFs & notebooks. Community upvoting surfaces the best materials.", c:'#fbbf24' },
  { e:"🍅", t:"Focus Timer",           d:"Group-synchronized Pomodoro sessions. Everyone locks in and studies at the same time.", c:'#2dd4bf' },
  { e:"📹", t:"Live Study Sessions",   d:"Share Google Meet or Zoom links — your group goes LIVE so no one misses a session.", c:'#a78bfa' },
  { e:"💬", t:"Group Chat",            d:"Real-time chat inside every study group. Share links, ask questions, stay in sync.", c:'#f472b6' },
];

const STATS = [["2,400+","Students"],["380+","Groups"],["12k+","Resources"],["94%","Grade Lift"]];

const TICKER = [
  "Study Groups","Shared Notes","Past Papers","Pomodoro Timer","Live Sessions",
  "Resource Library","Group Chat","Flashcards","Exam Prep","Peer Learning",
  "Lecture Notes","Practice Problems","Study Plans","Progress Tracking","Collaboration",
];

const HomePage = ({ setPage, onNewGroup }) => (
  <div className="page">
    {/* Background orbs */}
    <div style={{ position:'fixed',inset:0,pointerEvents:'none',overflow:'hidden',zIndex:0 }}>
      <div style={{ position:'absolute',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(56,189,248,.055) 0%,transparent 65%)',top:-160,left:'50%',transform:'translateX(-50%)',animation:'orbDrift 14s ease-in-out infinite' }}/>
      <div style={{ position:'absolute',width:320,height:320,borderRadius:'50%',background:'radial-gradient(circle,rgba(125,211,252,.04) 0%,transparent 70%)',bottom:-70,left:'6%',animation:'orbDrift 18s ease-in-out infinite reverse' }}/>
      <div style={{ position:'absolute',width:260,height:260,borderRadius:'50%',background:'radial-gradient(circle,rgba(167,139,250,.04) 0%,transparent 70%)',top:90,right:'4%',animation:'orbDrift 16s ease-in-out infinite 4s' }}/>
    </div>

    <div style={{ position:'relative',zIndex:1 }}>
      {/* Hero */}
      <section style={{ textAlign:'center',padding:'76px 20px 58px',maxWidth:820,margin:'0 auto' }}>
        <div className="fu" style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'5px 14px',background:'rgba(56,189,248,.08)',border:'1px solid rgba(56,189,248,.2)',borderRadius:20,fontSize:11,fontWeight:700,color:PRIMARY,letterSpacing:.4,marginBottom:26 }}>
          <span style={{ width:5,height:5,borderRadius:'50%',background:PRIMARY,animation:'pulse 2s infinite' }}/>
          Notes · Groups · Resources · Chat · Timer
        </div>
        <h1 className="fu d1" style={{ fontFamily:"'Syne',sans-serif",fontSize:'clamp(42px,7vw,80px)',fontWeight:900,lineHeight:1.0,letterSpacing:'-2.5px',marginBottom:20,color:'#e8f0f8' }}>
          Study Smarter.<br/><span style={{ color:PRIMARY }}>Together.</span>
        </h1>
        <p className="fu d2" style={{ fontSize:15,color:'#4a6080',maxWidth:440,margin:'0 auto 38px',lineHeight:1.75 }}>
          Form study groups, share resources, co-write notes, and lock in with synchronized focus timers.
        </p>
        <div className="fu d3" style={{ display:'flex',gap:11,justifyContent:'center',flexWrap:'wrap',marginBottom:50 }}>
          <button className="btn btn-primary" onClick={() => setPage('groups')} style={{ fontSize:14,padding:'11px 26px' }}>Browse Groups {Icons.arrow}</button>
          <button className="btn btn-ghost"   onClick={onNewGroup}             style={{ fontSize:14,padding:'11px 26px' }}>Create a Group</button>
        </div>
        {/* Stats */}
        <div className="fu d4" style={{ display:'flex',background:'#10141c',border:'1px solid rgba(255,255,255,.07)',borderRadius:13,overflow:'hidden' }}>
          {STATS.map(([n,l],i) => (
            <div key={i} style={{ flex:1,padding:'18px 14px',textAlign:'center',borderRight:i<3?'1px solid rgba(255,255,255,.07)':'none' }}>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:900,color:PRIMARY }}>{n}</div>
              <div style={{ fontSize:11,color:'#4a6080',fontWeight:600,marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Ticker — study topics, not tech stack */}
      <div style={{ overflow:'hidden',borderTop:'1px solid rgba(255,255,255,.06)',borderBottom:'1px solid rgba(255,255,255,.06)',padding:'10px 0',marginBottom:64,background:'#0a0d12' }}>
        <div style={{ display:'flex',animation:'ticker 28s linear infinite',whiteSpace:'nowrap' }}>
          {[0,1].map(x => (
            <span key={x} style={{ display:'inline-flex',gap:26,paddingRight:26 }}>
              {TICKER.map(t => (
                <span key={t} style={{ display:'inline-flex',alignItems:'center',gap:6,fontSize:12,fontWeight:600,color:'#4a6080' }}>
                  <span style={{ color:PRIMARY,fontSize:9 }}>◆</span>{t}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section style={{ maxWidth:1060,margin:'0 auto',padding:'0 20px 72px' }}>
        <div style={{ textAlign:'center',marginBottom:46 }}>
          <div className="fu" style={{ fontSize:9,fontWeight:700,letterSpacing:3,color:PRIMARY,marginBottom:10 }}>FEATURES</div>
          <h2 className="fu d1" style={{ fontFamily:"'Syne',sans-serif",fontSize:'clamp(24px,4vw,42px)',fontWeight:900,letterSpacing:-1.5,color:'#e8f0f8' }}>Everything to ace your courses</h2>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:15 }}>
          {FEATURES.map((f,i) => (
            <div key={i} className={`card lift fu d${Math.min(i+1,4)}`} style={{ padding:24,position:'relative',overflow:'hidden' }}>
              <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${f.c},transparent)`,opacity:.6 }}/>
              <div style={{ width:44,height:44,borderRadius:11,background:`${f.c}14`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:21,marginBottom:14 }}>{f.e}</div>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,marginBottom:7,color:'#e8f0f8' }}>{f.t}</div>
              <p style={{ fontSize:12,color:'#4a6080',lineHeight:1.65 }}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div style={{ maxWidth:1060,margin:'0 auto 72px',padding:'0 20px' }}>
        <div style={{ background:'linear-gradient(135deg,rgba(56,189,248,.06),rgba(167,139,250,.03))',border:'1px solid rgba(56,189,248,.12)',borderRadius:18,padding:'52px 38px',textAlign:'center',position:'relative',overflow:'hidden' }}>
          <div style={{ position:'absolute',inset:0,background:'radial-gradient(circle at 50% 0%,rgba(56,189,248,.06),transparent 60%)',pointerEvents:'none' }}/>
          <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:'clamp(22px,4vw,40px)',fontWeight:900,letterSpacing:-1.5,marginBottom:13,color:'#e8f0f8' }}>
            Start studying smarter from <span style={{ color:PRIMARY }}>day one.</span>
          </h2>
          <p style={{ color:'#4a6080',fontSize:14,marginBottom:30 }}>Join 2,400+ students already levelling up together.</p>
          <div style={{ display:'flex',gap:11,justifyContent:'center',flexWrap:'wrap' }}>
            <button className="btn btn-primary" onClick={() => setPage('groups')} style={{ fontSize:14,padding:'11px 28px' }}>Find My Groups {Icons.arrow}</button>
            <button className="btn btn-ghost"   onClick={() => setPage('timer')}  style={{ fontSize:14,padding:'11px 28px' }}>Open Timer</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
export default HomePage;
