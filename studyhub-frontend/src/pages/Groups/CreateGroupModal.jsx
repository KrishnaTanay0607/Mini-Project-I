import React from 'react';
import Modal from '../../components/Modal/Modal';
const EMOJIS = ["⚡","🧪","📐","🤖","🎨","🔥","🌊","🧠","📡","🔬","⚛️","📊"];
const CreateGroupModal = ({ open, onClose, onSubmit, form, setForm }) => (
  <Modal open={open} onClose={onClose} title="Create Study Group">
    <div style={{ display:'flex',flexDirection:'column',gap:15 }}>
      <div>
        <label style={{ fontSize:9,fontWeight:700,letterSpacing:1.5,color:'#5a5a72',display:'block',marginBottom:8 }}>CHOOSE EMOJI</label>
        <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
          {EMOJIS.map(e => (
            <button key={e} onClick={()=>setForm(f=>({...f,emoji:e}))} style={{ width:36,height:36,borderRadius:8,border:`2px solid ${form.emoji===e?'#38bdf8':'rgba(255,255,255,.07)'}`,background:form.emoji===e?'rgba(200,241,53,.12)':'rgba(255,255,255,.03)',cursor:'pointer',fontSize:17,transition:'all .15s' }}>{e}</button>
          ))}
        </div>
      </div>
      {[['GROUP NAME','name','e.g. Algorithm Wizards'],['COURSE CODE','course','e.g. CS301'],['DESCRIPTION','desc','What will you study?']].map(([l,k,ph]) => (
        <div key={k}>
          <label style={{ fontSize:9,fontWeight:700,letterSpacing:1.5,color:'#5a5a72',display:'block',marginBottom:5 }}>{l}</label>
          <input className="input" value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={ph}/>
        </div>
      ))}
      <button className="btn btn-lime" onClick={onSubmit} style={{ justifyContent:'center',padding:12,fontSize:14,marginTop:2 }}>Create Group 🚀</button>
    </div>
  </Modal>
);
export default CreateGroupModal;
