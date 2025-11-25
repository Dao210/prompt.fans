import React from 'react';
import { Copy, Heart, Play } from 'lucide-react';
import { BananaPrompt, PromptCardProps } from '../types';

export const PromptCard: React.FC<PromptCardProps> = ({ prompt, onCopy, onToggleFav, onInject }) => {
  const toolColors: Record<string, string> = {
    'ChatGPT': 'bg-green-100 text-green-800 border-green-800',
    'Midjourney': 'bg-purple-100 text-purple-800 border-purple-800',
    'Claude': 'bg-orange-100 text-orange-800 border-orange-800',
    'Gemini': 'bg-blue-100 text-blue-800 border-blue-800',
    'Stable Diffusion': 'bg-indigo-100 text-indigo-800 border-indigo-800',
  };

  return (
    <div className="break-inside-avoid mb-6 group">
      <div className="bg-white border-2 border-brand-black rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-neo">

        {/* Card Header */}
        <div className="p-4 pb-0 flex justify-between items-start">
          <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${toolColors[prompt.tool] || 'bg-gray-100'}`}>
            {prompt.tool}
          </span>
          <button
            onClick={() => onToggleFav(prompt.id)}
            className="text-slate-300 hover:text-red-500 transition-colors active:scale-90"
            title={prompt.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart size={20} className={prompt.isFavorite ? 'fill-red-500 text-red-500' : 'fill-transparent'} strokeWidth={2.5} />
          </button>
        </div>

        {/* Card Content */}
        <div className="p-4">
          <h3 className="font-display text-lg font-bold leading-tight mb-2 text-brand-black">
            {prompt.title}
          </h3>
          <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-3">
            {prompt.description}
          </p>

          {/* Code/Prompt Block */}
          <div
            onClick={() => onCopy(prompt.content)}
            className="relative group/code bg-brand-gray border-2 border-slate-200 rounded-lg p-3 cursor-pointer hover:border-brand-black transition-colors"
          >
            <code className="block font-mono text-xs text-slate-700 line-clamp-4 leading-relaxed selection:bg-brand-yellow">
              {prompt.content}
            </code>
            <div className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity bg-brand-black text-white p-1 rounded shadow-sm">
              <Copy size={12} />
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-3">
            {prompt.tags.map(tag => (
              <span key={tag} className="text-[10px] font-bold text-slate-400">#{tag}</span>
            ))}
          </div>
        </div>

        {/* Card Actions */}
        <div className="border-t-2 border-brand-black p-2 bg-brand-gray flex gap-2">
          <button
            onClick={() => onInject(prompt.content)}
            className="flex-1 bg-brand-black text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-800 active:translate-y-0.5 transition-all"
          >
            <Play size={12} className="fill-current" />
            Magic Fill
          </button>
          <button
            onClick={() => onCopy(prompt.content)}
            className="px-3 py-2 bg-white border-2 border-brand-black rounded-lg text-brand-black hover:bg-brand-yellow active:translate-y-0.5 transition-all"
            aria-label="Copy to clipboard"
          >
            <Copy size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
