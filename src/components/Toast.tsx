import React from 'react';
import { Check, Zap, X } from 'lucide-react';
import { ToastState } from '../types';

export const Toast: React.FC<ToastState> = ({ visible, message, type }) => {
  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-[60] flex justify-center pointer-events-none">
      <div className={`
        pointer-events-auto flex items-center gap-3 px-6 py-3 rounded-full border-2 border-brand-black shadow-neo font-bold animate-bounce-slight
        ${type === 'error' ? 'bg-red-100 text-red-900' : 'bg-brand-black text-white'}
      `}>
        {type === 'success' && <Check size={18} className="text-brand-yellow" />}
        {type === 'info' && <Zap size={18} className="text-brand-yellow" />}
        {type === 'error' && <X size={18} className="text-red-500" />}
        <span>{message}</span>
      </div>
    </div>
  );
};
