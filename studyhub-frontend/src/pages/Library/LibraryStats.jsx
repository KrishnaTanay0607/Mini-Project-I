import React from 'react';
const PRIMARY = '#38bdf8';
const LibraryStats = ({ resources }) => {
  const stats = [
    ["📄", resources.length, "Total Files"],
    ["👍", resources.reduce((s,r)=>s+(r.upvotes||0),0), "Total Upvotes"],
    ["🗂️", [...new Set(resources.map(r=>r.ext).filter(Boolean))].length, "File Types"],
    ["🏆", resources.filter(r=>r.voted).length, "Your Votes"],
  ];
  return (
    <div className="fu" style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:11,marginBottom:22 }}>
      {stats.map(([ic,n,l]) => (
        <div key={l} className="card" style={{ padding:'16px 18px' }}>
          <div style={{ fontSize:19,marginBottom:5 }}>{ic}</div>
          <div style={{ fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900,color:PRIMARY }}>{n}</div>
          <div style={{ fontSize:11,color:'#4a6080',fontWeight:600,marginTop:2,fontFamily:"'Manrope',sans-serif" }}>{l}</div>
        </div>
      ))}
    </div>
  );
};
export default LibraryStats;
