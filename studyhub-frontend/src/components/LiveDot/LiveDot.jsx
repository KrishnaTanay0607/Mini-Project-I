import React from 'react';
const LiveDot = () => (
  <span style={{ display:'inline-flex',alignItems:'center',gap:5,padding:'3px 9px',borderRadius:20,background:'rgba(56,189,248,.12)',color:'#38bdf8',fontSize:10,fontWeight:700 }}>
    <span style={{ width:5,height:5,borderRadius:'50%',background:'#38bdf8',animation:'pulse 1.5s infinite' }}/>LIVE
  </span>
);
export default LiveDot;
