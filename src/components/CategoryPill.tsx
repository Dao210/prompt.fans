import React from 'react';
import { CategoryPillProps } from '../types';

export const CategoryPill: React.FC<CategoryPillProps> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-bold text-sm whitespace-nowrap transition-all duration-150
      ${active
        ? 'bg-brand-black text-brand-yellow border-brand-black shadow-none translate-x-[2px] translate-y-[2px]'
        : 'bg-white text-brand-black border-brand-black shadow-neo-sm hover:-translate-y-0.5 hover:bg-brand-yellow/20'}
    `}
  >
    {label}
  </button>
);
