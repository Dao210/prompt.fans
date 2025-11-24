import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Search, Copy, Check, Zap, Filter, 
  Heart, Settings, Sparkles, Send, 
  Loader2, Play, Menu, X, Code, PenTool,
  Image as ImageIcon, BookOpen, Rocket
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import './style.css';

// --- Data Models ---

interface BananaPrompt {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  author?: string;
  likes: number;
  isFavorite: boolean;
  category: 'Coding' | 'Writing' | 'Art' | 'Marketing' | 'Academic' | 'Productivity';
  tool: 'ChatGPT' | 'Midjourney' | 'Claude' | 'Gemini' | 'Stable Diffusion';
}

interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

// --- Mock Data ---

const MOCK_PROMPTS: BananaPrompt[] = [
  {
    id: '1',
    title: 'React Senior Architect',
    description: 'Code review like a FAANG principal engineer.',
    content: 'Act as a Principal Frontend Engineer. Review the following React code for: 1. Performance bottlenecks (re-renders), 2. Accessibility (ARIA compliance), 3. Maintainability (SOLID principles). Be concise, technical, and provide refactored code snippets.',
    tags: ['React', 'Clean Code', 'Refactoring'],
    author: 'dan_abramov_fan',
    likes: 1205,
    isFavorite: false,
    category: 'Coding',
    tool: 'ChatGPT'
  },
  {
    id: '2',
    title: 'Cyberpunk Noir V6',
    description: 'High contrast neon aesthetics for MJ v6.',
    content: 'cinematic shot, cyberpunk noir, rainy streets of neo-tokyo at night, neon reflections in puddles, steam rising from vents, solitude, blade runner vibe, 35mm lens, f/1.8, highly detailed, 8k --ar 16:9 --v 6.0',
    tags: ['Photography', 'Sci-Fi', 'Atmospheric'],
    author: 'neon_dreamer',
    likes: 892,
    isFavorite: true,
    category: 'Art',
    tool: 'Midjourney'
  },
  {
    id: '3',
    title: 'Cold Email that Converts',
    description: 'AIDA framework for B2B sales.',
    content: 'Write a cold email to a [JOB TITLE] at a [INDUSTRY] company. Use the AIDA framework (Attention, Interest, Desire, Action). Keep it under 150 words. The goal is to book a 15-minute demo call. My value proposition is: [VALUE PROP].',
    tags: ['Sales', 'Copywriting', 'Growth'],
    author: 'growth_hacker',
    likes: 450,
    isFavorite: false,
    category: 'Marketing',
    tool: 'Claude'
  },
  {
    id: '4',
    title: 'Python Data Cleaning',
    description: 'Pandas pipeline for messy datasets.',
    content: 'You are a Senior Data Analyst. I have a CSV file with the following columns: [COLUMNS]. Write a Python script using Pandas to: 1. Detect and handle missing values, 2. Normalize text columns, 3. Remove duplicates, 4. Generate a correlation matrix heatmap using Seaborn.',
    tags: ['Python', 'Data Science', 'Pandas'],
    author: 'data_wiz',
    likes: 670,
    isFavorite: false,
    category: 'Coding',
    tool: 'Gemini'
  },
  {
    id: '5',
    title: 'Academic Abstract Polisher',
    description: 'Refine research papers for publication.',
    content: 'Rewrite the following research abstract to meet the standards of top-tier journals (e.g., Nature, IEEE). Improve flow, clarity, and academic tone. Ensure the problem, method, results, and implications are clearly articulated.',
    tags: ['Research', 'Writing', 'PhD'],
    author: 'prof_ai',
    likes: 320,
    isFavorite: false,
    category: 'Academic',
    tool: 'Claude'
  },
  {
    id: '6',
    title: 'SaaS Landing Page Copy',
    description: 'Hero section conversion optimization.',
    content: 'Write 5 variations of a Hero Section headline and subheadline for a SaaS product that helps [TARGET AUDIENCE] achieve [BENEFIT]. Focus on pain points and immediate value. Tone: Professional yet urgent.',
    tags: ['UX Writing', 'Web Design'],
    author: 'saas_founder',
    likes: 210,
    isFavorite: false,
    category: 'Marketing',
    tool: 'ChatGPT'
  }
];

// --- Services ---

// Hybrid Adapter: Handles both Browser (Dev) and Chrome Extension (Prod) environments
const EnvAdapter = {
  isExtension: () => typeof chrome !== 'undefined' && !!chrome.storage,
  
  getStorage: async (key: string, defaultVal: any) => {
    if (EnvAdapter.isExtension()) {
      return new Promise((resolve) => {
        chrome.storage.sync.get([key], (result) => {
          resolve(result[key] !== undefined ? result[key] : defaultVal);
        });
      });
    } else {
      // LocalStorage fallback
      const val = localStorage.getItem(key);
      return Promise.resolve(val ? JSON.parse(val) : defaultVal);
    }
  },

  setStorage: async (key: string, value: any) => {
    if (EnvAdapter.isExtension()) {
      return new Promise<void>((resolve) => {
        chrome.storage.sync.set({ [key]: value }, () => resolve());
      });
    } else {
      localStorage.setItem(key, JSON.stringify(value));
      return Promise.resolve();
    }
  },

  injectScript: async (text: string) => {
    if (EnvAdapter.isExtension()) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (code) => {
            // Try to find the active element or specific textareas
            const el = document.activeElement as HTMLTextAreaElement | HTMLInputElement;
            if (el && (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT')) {
              const start = el.selectionStart;
              const end = el.selectionEnd;
              const text = el.value;
              const before = text.substring(0, start || 0);
              const after = text.substring(end || 0);
              el.value = before + code + after;
              el.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
              alert('Banana Prompts: Please click inside a text input field first!');
            }
          },
          args: [text]
        });
      }
    } else {
      console.log("Mock Injection:", text);
      alert(`[Dev Mode] Would inject: "${text.substring(0, 30)}..."`);
    }
  }
};

const StorageService = {
  getFavorites: async (): Promise<string[]> => {
    return await EnvAdapter.getStorage('banana_favorites', []);
  },
  toggleFavorite: async (id: string): Promise<string[]> => {
    const favs = await StorageService.getFavorites();
    const newFavs = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
    await EnvAdapter.setStorage('banana_favorites', newFavs);
    return newFavs;
  },
  getApiKey: async (): Promise<string> => {
    return await EnvAdapter.getStorage('banana_api_key', '');
  },
  setApiKey: async (key: string) => {
    await EnvAdapter.setStorage('banana_api_key', key);
  },
};

// --- Components ---

const Toast = ({ visible, message, type }: ToastState) => {
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

const CategoryPill = ({ label, active, onClick, icon: Icon }: any) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-bold text-sm whitespace-nowrap transition-all duration-150
      ${active 
        ? 'bg-brand-black text-brand-yellow border-brand-black shadow-none translate-x-[2px] translate-y-[2px]' 
        : 'bg-white text-brand-black border-brand-black shadow-neo-sm hover:-translate-y-0.5 hover:bg-brand-yellow/20'}
    `}
  >
    {Icon && <Icon size={14} />}
    {label}
  </button>
);

interface PromptCardProps {
  prompt: BananaPrompt;
  onCopy: (text: string) => void;
  onToggleFav: (id: string) => void;
  onInject: (text: string) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, onCopy, onToggleFav, onInject }) => {
  const toolColors: Record<string, string> = {
    ChatGPT: 'bg-green-100 text-green-800 border-green-800',
    Midjourney: 'bg-purple-100 text-purple-800 border-purple-800',
    Claude: 'bg-orange-100 text-orange-800 border-orange-800',
    Gemini: 'bg-blue-100 text-blue-800 border-blue-800',
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

const SettingsModal = ({ isOpen, onClose, apiKey, onSave }: any) => {
  const [key, setKey] = useState(apiKey);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md border-2 border-brand-black shadow-neo rounded-2xl overflow-hidden transform transition-all">
        <div className="bg-brand-yellow p-4 border-b-2 border-brand-black flex justify-between items-center">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Settings size={20} /> Settings
          </h2>
          <button onClick={onClose} className="hover:bg-brand-black hover:text-white p-1 rounded transition-colors">
            <X size={20} />
          