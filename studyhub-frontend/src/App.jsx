import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar/Navbar';
import Toast from './components/Toast/Toast';
import Modal from './components/Modal/Modal';
import AuthPage from './pages/Auth/AuthPage';
import ProfileModal from './pages/Auth/ProfileModal';
import HomePage from './pages/Home/HomePage';
import GroupsPage from './pages/Groups/GroupsPage';
import NotesPage from './pages/Notes/NotesPage';
import LibraryPage from './pages/Library/LibraryPage';
import TimerPage from './pages/Timer/TimerPage';
import FriendsPage from './pages/Friends/FriendsPage';
import { useToast } from './hooks/useToast';
import { Icons } from './utils/icons';

const AppInner = () => {
  const { user, loading }              = useAuth();
  const [page, setPage]                = useState('home');
  const [showAuth, setShowAuth]        = useState(false);
  const [profileTab, setProfileTab]    = useState('profile'); // which tab to open
  const [showProfile, setShowProfile]  = useState(false);
  const [createOpen, setCreateOpen]    = useState(false);
  const { toast, showToast }           = useToast();

  if (loading) return (
    <div style={{ height:'100vh',background:'#06080a',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:12 }}>
      <div style={{ fontSize:36,animation:'pulse 1s infinite' }}>📚</div>
      <div style={{ fontFamily:"'Manrope',sans-serif",fontSize:13,color:'#4a6080' }}>Loading StudyHub...</div>
    </div>
  );

  if (showAuth && !user) return (
    <AuthPage onSuccess={() => { setShowAuth(false); setPage('home'); }}/>
  );

  const go = (p) => {
    if (!user && ['notes','library','timer','friends'].includes(p)) { setShowAuth(true); return; }
    setPage(p);
  };

  // Opens profile modal at a specific tab ('profile' | 'settings' | 'notifications')
  const openProfile = (tab = 'profile') => {
    if (!user) { setShowAuth(true); return; }
    setProfileTab(tab);
    setShowProfile(true);
  };

  return (
    <div style={{ minHeight:'100vh', background:'#06080a' }}>
      <Navbar
        page={page}
        setPage={go}
        onNewGroup={() => { if (!user) { setShowAuth(true); return; } setCreateOpen(true); }}
        onOpenProfile={openProfile}
      />

      {page === 'home'    && <HomePage    setPage={go} onNewGroup={() => { if (!user) { setShowAuth(true); return; } setCreateOpen(true); }}/>}
      {page === 'groups'  && <GroupsPage  toast={showToast}/>}
      {page === 'notes'   && <NotesPage   toast={showToast}/>}
      {page === 'library' && <LibraryPage toast={showToast}/>}
      {page === 'timer'   && <TimerPage   toast={showToast}/>}
      {page === 'friends' && <FriendsPage toast={showToast}/>}

      <Toast msg={toast.msg} show={toast.show}/>

      {/* Profile modal — opens to specified tab */}
      <ProfileModal
        open={showProfile}
        initialTab={profileTab}
        onClose={() => setShowProfile(false)}
      />

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Study Group">
        <p style={{ color:'#4a6080',marginBottom:14,fontSize:13,fontFamily:"'Manrope',sans-serif" }}>Head to the Groups page to use the full creator.</p>
        <button className="btn btn-primary" onClick={() => { setCreateOpen(false); setPage('groups'); }}
          style={{ width:'100%',justifyContent:'center',padding:11,fontSize:14 }}>
          Go to Groups {Icons.arrow}
        </button>
      </Modal>

      {!user && (
        <div style={{ position:'fixed',bottom:20,left:'50%',transform:'translateX(-50%)',background:'#0d1117',border:'1px solid rgba(56,189,248,.2)',borderRadius:40,padding:'10px 20px',display:'flex',alignItems:'center',gap:12,boxShadow:'0 12px 40px rgba(0,0,0,.6)',zIndex:400,whiteSpace:'nowrap' }}>
          <span style={{ fontSize:13,color:'#7a96b4',fontFamily:"'Manrope',sans-serif" }}>Sign in to unlock all features</span>
          <button className="btn btn-primary" style={{ padding:'6px 16px',fontSize:12 }} onClick={() => setShowAuth(true)}>Sign In →</button>
        </div>
      )}
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <SocketProvider>
      <AppInner/>
    </SocketProvider>
  </AuthProvider>
);
export default App;
