import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Search, Copy, Check, Zap, Filter, 
  Heart, Settings, Sparkles, Send, 
  Loader2, Play, Menu, X, Code, PenTool,
  Image as ImageIcon, BookOpen, Rocket, RefreshCw
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

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

const StorageService = {
  getFavorites: (): string[] => {
    try {
      return JSON.parse(localStorage.getItem('banana_favorites') || '[]');
    } catch { return []; }
  },
  toggleFavorite: (id: string): string[] => {
    const favs = StorageService.getFavorites();
    const newFavs = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
    localStorage.setItem('banana_favorites', JSON.stringify(newFavs));
    return newFavs;
  },
  getApiKey: (): string => localStorage.getItem('banana_api_key') || '',
  setApiKey: (key: string) => localStorage.setItem('banana_api_key', key),
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
          </button>
        </div>
        <div className="p-6">
          <label className="block text-sm font-bold mb-2">Gemini API Key</label>
          <input 
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full p-3 bg-slate-50 border-2 border-brand-black rounded-lg font-mono text-sm focus:outline-none focus:ring-4 focus:ring-brand-yellow/50 transition-all"
          />
          <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed">
            Required for the <strong>Banana Peeler</strong> (Prompt Optimizer). 
            <br/>Your key is stored locally in your browser and never sent to our servers.
          </p>
          <button 
            onClick={() => { onSave(key); onClose(); }}
            className="w-full py-3 bg-brand-black text-white font-bold rounded-lg shadow-neo-sm hover:shadow-neo hover:-translate-y-0.5 active:shadow-none active:translate-y-[2px] transition-all"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Banana Peeler Component ---

const BananaPeeler = ({ onPeel, loading }: { onPeel: (input: string) => void, loading: boolean }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) onPeel(input);
  };

  return (
    <div className="mb-8 relative z-10">
      <div className="bg-brand-black p-1.5 rounded-2xl shadow-neo">
        <div className="bg-white rounded-xl p-1 flex items-center border-2 border-transparent">
          <div className="pl-3 pr-2 text-brand-yellow">
            <Sparkles size={24} className="fill-brand-yellow text-brand-black" />
          </div>
          <form onSubmit={handleSubmit} className="flex-1 flex">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Magic Input: 'Write a python script to scrape twitter'..."
              className="w-full py-3 px-2 text-sm font-medium focus:outline-none placeholder:text-slate-400"
              disabled={loading}
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="m-1 px-4 bg-brand-yellow border-2 border-brand-black rounded-lg font-bold text-sm hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-brand-black"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><span className="hidden sm:inline">Peel It</span><Send size={14} /></>}
            </button>
          </form>
        </div>
      </div>
      <div className="mt-2 flex justify-between px-2 items-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
          <Zap size={10} className="fill-slate-400" />
          Powered by Gemini 2.5 Flash
        </span>
      </div>
    </div>
  );
};

// --- Main App ---

const App = () => {
  const [prompts, setPrompts] = useState<BananaPrompt[]>(MOCK_PROMPTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '', type: 'info' });
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [viewMode, setViewMode] = useState<'market' | 'favorites'>('market');

  // Load initial data
  useEffect(() => {
    const key = StorageService.getApiKey();
    setApiKey(key);
    const favs = StorageService.getFavorites();
    setPrompts(prev => prev.map(p => ({ ...p, isFavorite: favs.includes(p.id) })));
  }, []);

  const showToast = (message: string, type: ToastState['type'] = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const handleToggleFav = (id: string) => {
    const newFavs = StorageService.toggleFavorite(id);
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, isFavorite: newFavs.includes(id) } : p));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  };

  const handleInject = (text: string) => {
    // In a real extension, we would use:
    // chrome.tabs.query({active: true, currentWindow: true}, (tabs) => { ... })
    // chrome.scripting.executeScript(...)
    console.log("Injecting:", text);
    showToast('✨ Magic Filled to active tab!', 'success');
  };

  const handleBananaPeel = async (input: string) => {
    if (!apiKey) {
      setShowSettings(true);
      showToast('Please set your Gemini API Key first.', 'info');
      return;
    }

    setIsOptimizing(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: input,
        config: {
          systemInstruction: "你是一位提示词工程专家（Prompt Engineer）。你的任务是将用户模糊、简单的指令转化为结构清晰、包含上下文、任务目标、约束条件的专业 Prompt。请直接输出优化后的 Prompt，不要包含解释。",
        }
      });
      
      const optimizedText = response.text;
      
      if (optimizedText) {
        const newPrompt: BananaPrompt = {
          id: Date.now().toString(),
          title: `Optimized: ${input.substring(0, 15)}...`,
          description: 'Freshly peeled by Gemini 🍌',
          content: optimizedText.trim(),
          tags: ['Gemini', 'Optimized'],
          category: 'Productivity',
          tool: 'Gemini',
          author: 'You',
          likes: 0,
          isFavorite: false
        };
        
        setPrompts(prev => [newPrompt, ...prev]);
        showToast('Prompt optimized successfully!', 'success');
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.message?.includes('API key') ? 'Invalid API Key' : 'Optimization failed';
      showToast(msg, 'error');
    } finally {
      setIsOptimizing(false);
    }
  };

  const filteredPrompts = useMemo(() => {
    let data = prompts;
    
    if (viewMode === 'favorites') {
      data = data.filter(p => p.isFavorite);
    } else {
      // Marketplace logic
      if (activeCategory !== 'All') {
        data = data.filter(p => p.category === activeCategory);
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.content.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return data;
  }, [prompts, viewMode, activeCategory, searchQuery]);

  const categories = [
    { id: 'All', icon: Rocket },
    { id: 'Coding', icon: Code },
    { id: 'Writing', icon: PenTool },
    { id: 'Art', icon: ImageIcon },
    { id: 'Academic', icon: BookOpen },
    { id: 'Marketing', icon: Zap },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-yellow selection:text-brand-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-brand-yellow border-b-2 border-brand-black shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => { setViewMode('market'); setActiveCategory('All'); }}>
            <div className="bg-brand-black p-1.5 rounded-lg border-2 border-brand-black shadow-none group-hover:rotate-6 transition-transform">
              <span className="text-xl leading-none">🍌</span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-brand-black">
              prompt.fans
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setViewMode(viewMode === 'market' ? 'favorites' : 'market'); setActiveCategory('All'); }}
              className={`p-2 rounded-lg border-2 border-brand-black transition-all active:translate-y-[2px] active:shadow-none ${viewMode === 'favorites' ? 'bg-brand-black text-brand-yellow shadow-inner' : 'bg-white hover:bg-white shadow-neo-sm'}`}
              title="My Favorites"
            >
              <Heart size={20} className={viewMode === 'favorites' ? 'fill-brand-yellow' : ''} />
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg border-2 border-brand-black bg-white hover:bg-white shadow-neo-sm active:translate-y-[2px] active:shadow-none transition-all"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow px-4 py-6 max-w-5xl mx-auto w-full">
        
        {viewMode === 'market' && (
          <>
            {/* Hero / Peeler Section */}
            <section className="max-w-2xl mx-auto text-center mb-8">
              <h2 className="font-display text-3xl font-black mb-2 text-brand-black">Stop staring at a blank cursor.</h2>
              <p className="text-slate-600 font-medium mb-6">Peel a fresh prompt or explore the marketplace.</p>
              <BananaPeeler onPeel={handleBananaPeel} loading={isOptimizing} />
            </section>

            {/* Filter Bar */}
            <section className="mb-6 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
              <div className="flex gap-3 min-w-max">
                {categories.map(cat => (
                  <CategoryPill 
                    key={cat.id} 
                    label={cat.id} 
                    icon={cat.icon}
                    active={activeCategory === cat.id} 
                    onClick={() => setActiveCategory(cat.id)} 
                  />
                ))}
              </div>
            </section>
          </>
        )}

        {viewMode === 'favorites' && (
           <div className="mb-8 flex items-center gap-4 border-b-2 border-brand-black pb-4">
             <div className="bg-red-500 text-white p-3 rounded-xl border-2 border-brand-black shadow-neo">
               <Heart size={28} className="fill-white" />
             </div>
             <div>
               <h2 className="font-display text-3xl font-black">Your Stash</h2>
               <p className="text-sm font-medium text-slate-600">You have saved {filteredPrompts.length} prompts.</p>
             </div>
           </div>
        )}

        {/* Search Bar (Always Visible) */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={20} className="text-slate-400" />
          </div>
          <input 
            type="text"
            placeholder={viewMode === 'favorites' ? "Search within favorites..." : "Search for 'Code Review', 'SEO', 'Midjourney'..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-brand-black rounded-xl shadow-neo font-bold text-lg focus:outline-none focus:shadow-neo-lg focus:-translate-y-0.5 transition-all placeholder:font-normal placeholder:text-slate-300"
          />
        </div>

        {/* Content Grid */}
        {filteredPrompts.length > 0 ? (
          <div className="masonry-grid pb-12">
            {filteredPrompts.map(prompt => (
              <PromptCard 
                key={prompt.id} 
                prompt={prompt} 
                onCopy={handleCopy} 
                onToggleFav={handleToggleFav}
                onInject={handleInject}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 opacity-80">
            <Filter size={64} className="mb-4 text-slate-300" />
            <p className="font-display text-xl font-bold text-brand-black">No prompts found.</p>
            <p className="font-medium">Try adjusting your search or filters.</p>
            {viewMode === 'favorites' && (
              <button onClick={() => setViewMode('market')} className="mt-6 px-6 py-2 bg-brand-yellow border-2 border-brand-black rounded-lg font-bold text-brand-black shadow-neo-sm hover:-translate-y-0.5 transition-all">
                Go to Marketplace
              </button>
            )}
          </div>
        )}
      </main>

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        apiKey={apiKey}
        onSave={(k: string) => { StorageService.setApiKey(k); setApiKey(k); showToast('API Key saved locally', 'success'); }}
      />
      
      <Toast {...toast} />
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);