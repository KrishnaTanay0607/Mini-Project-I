import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const PRIMARY = '#38bdf8';
const API = 'http://localhost:5000/api/auth';

const AuthPage = ({ onSuccess }) => {
  const { login }           = useAuth();
  const [mode, setMode]     = useState('login');
  const [form, setForm]     = useState({ name:'', email:'', password:'' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(f => ({ ...f, [k]:v }));

  const submit = async () => {
    setError('');
    if (!form.email || !form.password) { setError('Please fill all fields.'); return; }
    if (mode === 'register' && !form.name) { setError('Name is required.'); return; }
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? `${API}/login` : `${API}/register`;
      const body     = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };
      const res  = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Something went wrong.'); return; }
      login(data.user, data.token);
      onSuccess();
    } catch { setError('Cannot connect to server. Make sure backend is running on port 5000.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position:'fixed',inset:0,background:'#06080a',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000,padding:16 }}>
      <div style={{ position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none' }}>
        <div style={{ position:'absolute',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(56,189,248,.05) 0%,transparent 65%)',top:-100,left:'50%',transform:'translateX(-50%)',animation:'orbDrift 14s ease-in-out infinite' }}/>
      </div>
      <div className="si" style={{ background:'#0d1117',border:'1px solid rgba(56,189,248,.12)',borderRadius:20,padding:'36px 32px',width:'100%',maxWidth:420,position:'relative' }}>
        <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:30 }}>
          <div style={{ width:36,height:36,borderRadius:9,background:PRIMARY,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18 }}>📚</div>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:18,color:'#e8f0f8',lineHeight:1.1 }}>StudyHub</div>
            <div style={{ fontSize:9,color:PRIMARY,fontWeight:700,letterSpacing:2 }}>MERN PLATFORM</div>
          </div>
        </div>
        <h2 style={{ fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:900,marginBottom:6,color:'#e8f0f8',letterSpacing:-1 }}>
          {mode === 'login' ? 'Welcome back 👋' : 'Create account 🚀'}
        </h2>
        <p style={{ fontSize:13,color:'#4a6080',marginBottom:26 }}>
          {mode === 'login' ? 'Sign in to your StudyHub account.' : 'Join 2,400+ students studying smarter.'}
        </p>
        <div style={{ display:'flex',flexDirection:'column',gap:13 }}>
          {mode === 'register' && (
            <div>
              <label style={{ fontSize:10,fontWeight:700,letterSpacing:1.5,color:'#4a6080',display:'block',marginBottom:6 }}>FULL NAME</label>
              <input className="input" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Your Name" onKeyDown={e=>e.key==='Enter'&&submit()}/>
            </div>
          )}
          <div>
            <label style={{ fontSize:10,fontWeight:700,letterSpacing:1.5,color:'#4a6080',display:'block',marginBottom:6 }}>EMAIL</label>
            <input className="input" type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@college.edu" onKeyDown={e=>e.key==='Enter'&&submit()}/>
          </div>
          <div>
            <label style={{ fontSize:10,fontWeight:700,letterSpacing:1.5,color:'#4a6080',display:'block',marginBottom:6 }}>PASSWORD</label>
            <input className="input" type="password" value={form.password} onChange={e=>set('password',e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==='Enter'&&submit()}/>
          </div>
        </div>
        {error && <div style={{ marginTop:14,padding:'10px 14px',background:'rgba(248,113,113,.1)',border:'1px solid rgba(248,113,113,.25)',borderRadius:8,fontSize:12,color:'#f87171' }}>⚠️ {error}</div>}
        <button className="btn btn-primary" onClick={submit} disabled={loading}
          style={{ width:'100%',justifyContent:'center',padding:13,fontSize:14,marginTop:18,opacity:loading?.6:1 }}>
          {loading ? '⏳ Please wait...' : mode==='login' ? 'Sign In →' : 'Create Account →'}
        </button>
        <div style={{ display:'flex',alignItems:'center',gap:12,margin:'20px 0' }}>
          <div style={{ flex:1,height:1,background:'rgba(255,255,255,.07)' }}/><span style={{ fontSize:11,color:'#4a6080' }}>or</span><div style={{ flex:1,height:1,background:'rgba(255,255,255,.07)' }}/>
        </div>
        <p style={{ textAlign:'center',fontSize:13,color:'#4a6080' }}>
          {mode==='login'?"Don't have an account? ":"Already have an account? "}
          <button onClick={()=>{setMode(m=>m==='login'?'register':'login');setError('');}}
            style={{ background:'none',border:'none',color:PRIMARY,fontWeight:700,cursor:'pointer',fontSize:13 }}>
            {mode==='login'?'Sign up':'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};
export default AuthPage;
