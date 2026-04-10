import { useState, useRef } from 'react';
export const useToast = () => {
  const [toast, setToast] = useState({ msg:'', show:false });
  const ref = useRef(null);
  const showToast = (msg) => {
    clearTimeout(ref.current);
    setToast({ msg, show:true });
    ref.current = setTimeout(() => setToast(t => ({ ...t, show:false })), 3000);
  };
  return { toast, showToast };
};
