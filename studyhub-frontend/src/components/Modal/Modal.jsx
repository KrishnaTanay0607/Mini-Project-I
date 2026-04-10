import React from 'react';
import { Icons } from '../../utils/icons';
const Modal = ({ open, onClose, title, children, width=460 }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.8)',backdropFilter:'blur(14px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
      <div onClick={e=>e.stopPropagation()} className="si" style={{ background:'#10101a',border:'1px solid rgba(255,255,255,.1)',borderRadius:18,padding:28,width:'100%',maxWidth:width,maxHeight:'88vh',overflowY:'auto' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22 }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:19,fontWeight:900,color:'#f0f0f4' }}>{title}</h2>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding:'4px 8px' }}>{Icons.close}</button>
        </div>
        {children}
      </div>
    </div>
  );
};
export default Modal;
