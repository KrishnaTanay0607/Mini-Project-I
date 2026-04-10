import React from 'react';
import { parseMarkdown } from '../../utils/markdown';
const NotesPreview = ({ content }) => (
  <div style={{ display:'flex',flexDirection:'column',overflow:'hidden',background:'#0d0d12' }}>
    <div style={{ padding:'12px 18px',borderBottom:'1px solid rgba(255,255,255,.06)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
      <span style={{ fontSize:9,fontWeight:700,letterSpacing:2,color:'#5a5a72' }}>PREVIEW</span>
      <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'#38bdf8' }}>Markdown</span>
    </div>
    <div style={{ flex:1,overflowY:'auto',padding:'20px 18px' }} dangerouslySetInnerHTML={{ __html:parseMarkdown(content) }}/>
  </div>
);
export default NotesPreview;
