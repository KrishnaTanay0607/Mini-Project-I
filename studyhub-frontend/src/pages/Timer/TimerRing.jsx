import React from 'react';
const TimerRing = ({ mins, secs, pct, color, mode }) => {
  const R=95,circ=2*Math.PI*R,dash=(pct/100)*circ;
  return (
    <div style={{ position:'relative',width:230,height:230 }}>
      <svg width="230" height="230" viewBox="0 0 230 230" style={{ transform:'rotate(-90deg)' }}>
        <defs><filter id="gf"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
        <circle cx="115" cy="115" r={R} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="10"/>
        {[0,90,180,270].map(a => <line key={a} x1="115" y1="16" x2="115" y2="26" stroke="rgba(255,255,255,.09)" strokeWidth="1.5" transform={`rotate(${a} 115 115)`}/>)}
        <circle cx="115" cy="115" r={R} fill="none" stroke={color} strokeWidth="10" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" filter="url(#gf)" style={{ transition:'stroke-dasharray .7s ease,stroke .5s ease' }}/>
      </svg>
      <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center' }}>
        <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:44,fontWeight:700,color:'#fff',lineHeight:1,letterSpacing:-1 }}>
          {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
        </div>
        <div style={{ fontSize:9,fontWeight:700,letterSpacing:2.5,color:'#5a5a72',marginTop:6 }}>
          {mode==='work'?'FOCUS TIME':mode==='break'?'BREAK TIME':'LONG BREAK'}
        </div>
      </div>
    </div>
  );
};
export default TimerRing;
