import React from 'react';
const Badge = ({ children, color='#38bdf8' }) => (
  <span style={{ padding:'2px 9px',borderRadius:20,fontSize:10,fontWeight:700,background:`${color}18`,color }}>{children}</span>
);
export default Badge;
