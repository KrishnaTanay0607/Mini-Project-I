import React from 'react';
const Toast = ({ msg, show }) => (
  <div style={{ position:'fixed',bottom:20,right:20,zIndex:9999,background:'#1a1a26',border:'1px solid rgba(200,241,53,.25)',borderRadius:12,padding:'12px 18px',display:'flex',alignItems:'center',gap:10,fontSize:13,fontWeight:600,transform:show?'translateY(0)':'translateY(90px)',opacity:show?1:0,transition:'all .38s cubic-bezier(.34,1.56,.64,1)',boxShadow:'0 14px 44px rgba(0,0,0,.65)',pointerEvents:'none' }}>
    <span style={{ fontSize:18 }}>✅</span>{msg}
  </div>
);
export default Toast;
