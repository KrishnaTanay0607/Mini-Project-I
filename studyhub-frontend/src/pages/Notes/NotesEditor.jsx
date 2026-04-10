import React from 'react';
const TOOLS = [["**B**","**bold**"],["*I*","*italic*"],["`C`","`code`"],["H1","# Heading\n"],["H2","## Section\n"],["•","- Item\n"],["❝","> Quote\n"]];
const NotesEditor = ({ content, onChange }) => {
  const ins = (txt) => {
    const ta = document.getElementById('notes-editor');
    if (!ta) return;
    const s = ta.selectionStart;
    onChange(content.slice(0,s)+txt+content.slice(ta.selectionEnd));
    setTimeout(()=>{ta.selectionStart=ta.selectionEnd=s+txt.length;ta.focus();},0);
  };
  return (
    <div style={{ display:'flex',flexDirection:'column',borderRight:'1px solid rgba(255,255,255,.06)',overflow:'hidden' }}>
      <div style={{ padding:'9px 13px',borderBottom:'1px solid rgba(255,255,255,.06)',background:'#0d0d12',display:'flex',gap:4,flexWrap:'wrap',alignItems:'center',justifyContent:'space-between' }}>
        <div style={{ display:'flex',gap:4,flexWrap:'wrap' }}>
          {TOOLS.map(([l,t]) => (
            <button key={l} onClick={()=>ins(t)} style={{ padding:'3px 8px',borderRadius:5,border:'1px solid rgba(255,255,255,.07)',background:'transparent',color:'#5a5a72',cursor:'pointer',fontSize:10,fontFamily:"'JetBrains Mono',monospace",transition:'all .15s' }}
              onMouseEnter={e=>{e.target.style.color='#fff';e.target.style.borderColor='rgba(255,255,255,.14)'}}
              onMouseLeave={e=>{e.target.style.color='#5a5a72';e.target.style.borderColor='rgba(255,255,255,.07)'}}>{l}</button>
          ))}
        </div>
        <span style={{ display:'flex',alignItems:'center',gap:5,fontSize:10,color:'#4ade80',fontWeight:700 }}>
          <span style={{ width:5,height:5,borderRadius:'50%',background:'#4ade80',animation:'pulse 2s infinite' }}/>3 live
        </span>
      </div>
      <textarea id="notes-editor" value={content} onChange={e=>onChange(e.target.value)} spellCheck={false}
        style={{ flex:1,padding:'20px 18px',background:'transparent',border:'none',outline:'none',color:'#ccc',fontFamily:"'JetBrains Mono',monospace",fontSize:12.5,lineHeight:1.85,resize:'none' }}/>
    </div>
  );
};
export default NotesEditor;
