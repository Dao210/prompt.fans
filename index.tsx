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

// Global type declarations for Chrome Extension API
declare global {
  const chrome: any;
}

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

  const handleSave = () => {
    onSave(key);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md border-2 border-brand-black shadow-neo rounded-2xl overflow-hidden transform transition-all">
        <div className="bg-brand-yellow p-4 border-b-2 border-brand-black flex justify-between items-center">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Settings size={20} /> Settings
          </h2>
          <button onClick={onClose} className="hover:bg-brand-black hover:text-white p-1 rounded transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">
              Gemini API Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="w-full px-3 py-2 border-2 border-brand-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
            <p className="text-xs text-slate-500 mt-1">
              Your API key is stored securely in Chrome storage. Never commit it to version control.
            </p>
          </div>
        </div>
        <div className="p-4 border-t-2 border-brand-black bg-brand-gray flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border-2 border-brand-black bg-white rounded-lg font-bold hover:bg-brand-yellow transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-brand-black text-white rounded-lg font-bold hover:bg-slate-800 transition-all"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App = () => {
  const [prompts, setPrompts] = useState<BananaPrompt[]>(MOCK_PROMPTS);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '', type: 'info' });

  // Load favorites on mount
  useEffect(() => {
    const loadFavorites = async () => {
      const favs = await StorageService.getFavorites();
      setFavorites(favs);

      // Update prompts with favorite status
      setPrompts(prev => prev.map(p => ({
        ...p,
        isFavorite: favs.includes(p.id)
      })));
    };

    const loadApiKey = async () => {
      const key = await StorageService.getApiKey();
      setApiKey(key);
    };

    loadFavorites();
    loadApiKey();
  }, []);

  // Update prompts when favorites change
  useEffect(() => {
    setPrompts(prev => prev.map(p => ({
      ...p,
      isFavorite: favorites.includes(p.id)
    })));
  }, [favorites]);

  const categories = useMemo(() => {
    const cats = [...new Set(MOCK_PROMPTS.map(p => p.category))];
    return ['All', ...cats];
  }, []);

  const filteredPrompts = useMemo(() => {
    let filtered = prompts;

    // Filter by favorites
    if (showFavorites) {
      filtered = filtered.filter(p => p.isFavorite);
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [prompts, selectedCategory, searchTerm, showFavorites]);

  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToastMessage('Copied to clipboard!', 'success');
    } catch (err) {
      showToastMessage('Failed to copy', 'error');
    }
  };

  const handleToggleFavorite = async (id: string) => {
    const newFavorites = await StorageService.toggleFavorite(id);
    setFavorites(newFavorites);
    showToastMessage(
      newFavorites.includes(id) ? 'Added to favorites' : 'Removed from favorites',
      'success'
    );
  };

  const handleInject = (text: string) => {
    EnvAdapter.injectScript(text);
    showToastMessage('Magic Fill activated! Click in a text field.', 'info');
  };

  const handleSaveApiKey = async (key: string) => {
    await StorageService.setApiKey(key);
    setApiKey(key);
    showToastMessage('API key saved successfully', 'success');
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchTerm('');
    setShowFavorites(false);
  };

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-amber-50 border-b-2 border-brand-black">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BananaIcon />
              <h1 className="font-display text-2xl font-bold text-brand-black">Banana Prompts</h1>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg border-2 border-brand-black bg-white hover:bg-brand-yellow transition-all"
              aria-label="Open settings"
            >
              <Settings size={18} />
            </button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search prompts..."
              className="w-full pl-10 pr-10 py-3 rounded-lg border-2 border-brand-black font-medium focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-brand-black"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-bold text-sm whitespace-nowrap transition-all ${
                showFavorites
                  ? 'bg-red-100 text-red-800 border-red-800'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-red-50'
              }`}
            >
              <Heart size={14} className={showFavorites ? 'fill-current' : ''} />
              Favorites
            </button>
            {categories.map(category => (
              <CategoryPill
                key={category}
                label={category}
                active={selectedCategory === category || (category === 'All' && !selectedCategory)}
                onClick={() => setSelectedCategory(category === 'All' ? null : category)}
              />
            ))}
            {(selectedCategory || showFavorites || searchTerm) && (
              <button
                onClick={clearFilters}
                className="ml-auto px-3 py-2 text-xs font-bold text-slate-600 hover:text-brand-black"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6">
        {filteredPrompts.length === 0 ? (
          <div className="text-center py-12">
            <Filter size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">
              {searchTerm ? 'No prompts match your search' : 'No prompts found'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-brand-black font-bold hover:text-slate-700"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="masonry-grid">
            {filteredPrompts.map(prompt => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onCopy={handleCopy}
                onToggleFav={handleToggleFavorite}
                onInject={handleInject}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer stats */}
      <footer className="px-6 py-4 border-t-2 border-brand-black bg-white">
        <div className="flex justify-between text-sm text-slate-600 font-medium">
          <span>{filteredPrompts.length} prompts</span>
          <span>{favorites.length} favorites</span>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSave={handleSaveApiKey}
      />

      {/* Toast */}
      <Toast {...toast} />
    </div>
  );
}

// Banana Icon Component
const BananaIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-brand-yellow">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.19 0 2.34-.21 3.41-.6.3-.11.49-.4.49-.72 0-.43-.35-.78-.78-.78-.17 0-.33.06-.46.11-.83.27-1.69.39-2.66.39-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8c0 .81-.15 1.62-.44 2.39-.09.24.03.51.27.6.24.09.51-.03.6-.27.36-1 .55-2.05.55-3.12 0-5.52-4.48-10-10-10zm-3.5 5c-.83 0-1.5.67-1.5 1.5S7.67 10 8.5 10s1.5-.67 1.5-1.5S9.33 7 8.5 7zm7 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm-3.5 8c-2.33 0-4.31 1.46-5.11 3.5h10.22c-.8-2.04-2.78-3.5-5.11-3.5z"/>
  </svg>
);

// Mount the app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
