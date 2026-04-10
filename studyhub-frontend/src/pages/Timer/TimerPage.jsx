import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icons } from '../../utils/icons';
import TimerRing from './TimerRing';
import TimerSidebar from './TimerSidebar';
const MODES = { work:{label:'🎯 Focus',mins:25,color:'#38bdf8'}, break:{label:'☕ Break',mins:5,color:'#2dd4bf'}, long:{label:'🌙 Long',mins:15,color:'#a78bfa'} };
const TimerPage = ({ toast }) => {
  const [mode,setMode]   = useState('work');
  const [mins,setMins]   = useState(25);
  const [secs,setSecs]   = useState(0);
  const [run,setRun]     = useState(false);
  const [cycles,setCycles] = useState(0);
  const [synced,setSynced] = useState(false);
  const ref = useRef(null);
  const total=MODES[mode].mins*60, pct=((total-(mins*60+secs))/total)*100, mc=MODES[mode].color;
  const tick = useCallback(()=>{
    setSecs(s=>{
      if(s===0){ setMins(m=>{ if(m===0){ clearInterval(ref.current);ref.current=null;setRun(false); if(mode==='work'){setCycles(c=>c+1);setMode('break');setMins(5);setSecs(0);toast('Break time! ☕');} else{setMode('work');setMins(25);setSecs(0);toast('Focus time! 🎯');} return 0; } return m-1; }); return 59; } return s-1;
    });
  },[mode,toast]);
  useEffect(()=>{ if(run){ref.current=setInterval(tick,1000);} else{clearInterval(ref.current);} return()=>clearInterval(ref.current); },[run,tick]);
  const sw=(k)=>{clearInterval(ref.current);ref.current=null;setRun(false);setMode(k);setMins(MODES[k].mins);setSecs(0);};
  const reset=()=>{clearInterval(ref.current);ref.current=null;setRun(false);setMins(MODES[mode].mins);setSecs(0);};
  return (
    <div className="page">
      <div className="page-header" style={{ background:`linear-gradient(180deg,${mc}09,transparent)` }}>
        <div style={{ maxWidth:1060,margin:'0 auto' }}><h1 className="fu">Focus Timer</h1><p className="fu d1">Synchronized Pomodoro sessions for your whole group.</p></div>
      </div>
      <div className="content" style={{ display:'grid',gridTemplateColumns:'1fr 290px',gap:22,alignItems:'start' }}>
        <div>
          <div className="fu card" style={{ padding:'40px 32px',display:'flex',flexDirection:'column',alignItems:'center',gap:24 }}>
            <div style={{ display:'flex',gap:4,background:'rgba(255,255,255,.04)',borderRadius:30,padding:3 }}>
              {Object.entries(MODES).map(([k,v]) => <button key={k} onClick={()=>sw(k)} className="tab-btn" style={{ padding:'6px 16px',background:mode===k?mc:'transparent',color:mode===k?'#08080a':'#5a5a72' }}>{v.label}</button>)}
            </div>
            <TimerRing mins={mins} secs={secs} pct={pct} color={mc} mode={mode}/>
            <div style={{ display:'flex',gap:13,alignItems:'center' }}>
              <button onClick={reset} style={{ width:42,height:42,borderRadius:'50%',border:'1px solid rgba(255,255,255,.07)',background:'rgba(255,255,255,.04)',color:'#5a5a72',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s' }} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='#5a5a72'}>{Icons.reset}</button>
              <button onClick={()=>setRun(r=>!r)} style={{ width:62,height:62,borderRadius:'50%',border:'none',background:mc,color:'#08080a',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 0 26px ${mc}55`,transition:'all .2s' }} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.07)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>{run?Icons.pause:Icons.play}</button>
              <button onClick={()=>{setSynced(s=>!s);toast(synced?'Sync off':'Group synced! 🔗');}} style={{ width:42,height:42,borderRadius:'50%',border:`1px solid ${synced?mc:'rgba(255,255,255,.07)'}`,background:synced?`${mc}14`:'rgba(255,255,255,.04)',color:synced?mc:'#5a5a72',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s',fontSize:16 }}>👥</button>
            </div>
            <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:7 }}>
              <div style={{ display:'flex',gap:6 }}>{[0,1,2,3].map(i=><div key={i} style={{ width:9,height:9,borderRadius:'50%',background:i<(cycles%4)?mc:'rgba(255,255,255,.08)',transition:'background .3s',boxShadow:i<(cycles%4)?`0 0 6px ${mc}99`:'none' }}/>)}</div>
              <span style={{ fontSize:11,color:'#5a5a72' }}>Cycle {cycles+1} of 4</span>
            </div>
            {synced && <div style={{ padding:'9px 16px',background:'rgba(200,241,53,.07)',border:'1px solid rgba(200,241,53,.2)',borderRadius:8,fontSize:12,color:'#38bdf8',display:'flex',gap:6,alignItems:'center' }}><span style={{ animation:'pulse 2s infinite' }}>●</span>Synced with 7 members</div>}
          </div>
          <div className="fu d2 card" style={{ padding:22,marginTop:14 }}>
            <div style={{ fontSize:9,fontWeight:700,letterSpacing:2,color:'#5a5a72',marginBottom:14 }}>THE POMODORO TECHNIQUE</div>
            {[['#38bdf8','1','Focus 25 min without distraction.'],['#2dd4bf','2','Take a 5-minute break.'],['#a78bfa','3','After 4 cycles, take a 15-min long break.'],['#f472b6','4','Sync with your group so everyone locks in.']].map(([c,n,t]) => (
              <div key={n} style={{ display:'flex',gap:11,alignItems:'flex-start',marginBottom:11 }}>
                <div style={{ width:25,height:25,borderRadius:6,background:`${c}14`,color:c,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:11,flexShrink:0,fontFamily:"'Syne',sans-serif" }}>{n}</div>
                <p style={{ fontSize:12,color:'#9090a8',lineHeight:1.6,paddingTop:3 }}>{t}</p>
              </div>
            ))}
          </div>
        </div>
        <TimerSidebar/>
      </div>
    </div>
  );
};
export default TimerPage;
