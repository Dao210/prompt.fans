import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, Copy, Check, Heart, Menu, Code, PenTool, TrendingUp, Zap, BookOpen, Hash } from 'lucide-react';

// --- Types ---
interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  category: 'Coding' | 'Writing' | 'Marketing' | 'Art' | 'Productivity';
  tags: string[];
  likes: number;
}

// --- Mock Data ---
const MOCK_PROMPTS: Prompt[] = [
  {
    id: '1',
    title: 'React Component Generator',
    description: 'Create clean, functional React components with Tailwind CSS.',
    content: 'Act as a senior frontend engineer. Create a [Component Name] using React and Tailwind CSS. Ensure it is responsive, accessible (ARIA), and handles props for [Props List].',
    category: 'Coding',
    tags: ['React', 'Frontend', 'Tailwind'],
    likes: 1240
  },
  {
    id: '2',
    title: 'Professional Email Polisher',
    description: 'Turn rough notes into professional business emails.',
    content: 'Rewrite the following draft email to be more professional, concise, and polite. Maintain a confident tone. Draft: "[Insert Draft]"',
    category: 'Writing',
    tags: ['Business', 'Email', 'Communication'],
    likes: 890
  },
  {
    id: '3',
    title: 'SEO Blog Post Outliner',
    description: 'Generate structured outlines for SEO-optimized articles.',
    content: 'Create a comprehensive blog post outline for the keyword "[Keyword]". Include H2 and H3 headings, bullet points for key arguments, and suggest a meta description.',
    category: 'Marketing',
    tags: ['SEO', 'Content', 'Blogging'],
    likes: 650
  },
  {
    id: '4',
    title: 'Code Refactoring Expert',
    description: 'Optimize your code for performance and readability.',
    content: 'Review the following code snippet. Identify performance bottlenecks, potential bugs, and readability issues. Suggest a refactored version with comments explaining changes. Code: [Insert Code]',
    category: 'Coding',
    tags: ['Refactoring', 'Clean Code'],
    likes: 1100
  },
  {
    id: '5',
    title: 'Midjourney Photorealistic',
    description: 'Create stunning photorealistic prompts for image generation.',
    content: 'Generate a Midjourney prompt for a photorealistic image of [Subject]. Include details about lighting (e.g., golden hour, softbox), camera lens (e.g., 85mm, f/1.8), and texture. Aspect ratio --ar 16:9.',
    category: 'Art',
    tags: ['Midjourney', 'AI Art', 'Photography'],
    likes: 2300
  },
  {
    id: '6',
    title: 'Meeting Summarizer',
    description: 'Extract action items and key decisions from transcripts.',
    content: 'Analyze the following meeting transcript. Summarize the key discussion points, list all action items assigned to specific people, and highlight any deadlines.',
    category: 'Productivity',
    tags: ['Meeting', 'Summary', 'Work'],
    likes: 780
  },
  {
    id: '7',
    title: 'Instagram Caption Creator',
    description: 'Engaging captions with emojis and hashtags.',
    content: 'Write 3 variations of an Instagram caption for a photo about [Topic]. Style: Fun and engaging. Include relevant emojis and a set of 15 niche hashtags.',
    category: 'Marketing',
    tags: ['Social Media', 'Instagram'],
    likes: 540
  },
  {
    id: '8',
    title: 'Complex Concept Explainer',
    description: 'Explain difficult topics like I am 5 years old.',
    content: 'Explain the concept of [Topic] to a 5-year-old using simple analogies, short sentences, and avoiding jargon.',
    category: 'Writing',
    tags: ['Education', 'Learning'],
    likes: 920
  }
];

const CATEGORIES = ['All', 'Coding', 'Writing', 'Marketing', 'Art', 'Productivity'];

// --- Components ---

const Toast = ({ message, visible }: { message: string; visible: boolean }) => {
  if (!visible) return null;
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-50 text-sm font-medium animate-fade-in-up">
      <Check size={16} className="text-yellow-400" />
      {message}
    </div>
  );
};

const Header = () => (
  <div className="sticky top-0 z-40 bg-yellow-400 border-b-2 border-slate-900 px-4 py-3 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 select-none">
        <div className="bg-slate-900 text-yellow-400 p-1.5 rounded-lg transform -rotate-6">
          <Zap size={20} fill="currentColor" />
        </div>
        <h1 className="text-xl font-black tracking-tight text-slate-900">
          prompt.fans
        </h1>
      </div>
      <button className="p-2 hover:bg-yellow-500 rounded-full transition-colors text-slate-900">
        <Menu size={20} />
      </button>
    </div>
  </div>
);

const CategoryFilter = ({ 
  selected, 
  onSelect 
}: { 
  selected: string; 
  onSelect: (c: string) => void 
}) => {
  const getIcon = (cat: string) => {
    switch (cat) {
      case 'Coding': return <Code size={14} />;
      case 'Writing': return <PenTool size={14} />;
      case 'Marketing': return <TrendingUp size={14} />;
      case 'Art': return <BookOpen size={14} />; // Placeholder
      case 'Productivity': return <Zap size={14} />;
      default: return <Hash size={14} />;
    }
  };

  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar bg-slate-50 border-b border-slate-200">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`
            flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2
            ${selected === cat 
              ? 'bg-slate-900 text-white border-slate-900' 
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900'}
          `}
        >
          {cat !== 'All' && getIcon(cat)}
          {cat}
        </button>
      ))}
    </div>
  );
};

interface PromptCardProps {
  prompt: Prompt;
  onCopy: (content: string) => void;
  onToggleFav: (id: string) => void;
  isFav: boolean;
}

const PromptCard: React.FC<PromptCardProps> = ({ 
  prompt, 
  onCopy, 
  onToggleFav, 
  isFav 
}) => {
  return (
    <div className="group bg-white rounded-xl border-2 border-slate-100 hover:border-slate-900 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all duration-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-800 uppercase tracking-wider">
            {prompt.category}
          </span>
          <button 
            onClick={() => onToggleFav(prompt.id)}
            className={`p-1 rounded-full transition-transform active:scale-90 ${isFav ? 'text-red-500' : 'text-slate-300 hover:text-slate-500'}`}
          >
            <Heart size={18} fill={isFav ? "currentColor" : "none"} />
          </button>
        </div>
        
        <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight group-hover:text-blue-600 transition-colors">
          {prompt.title}
        </h3>
        
        <p className="text-slate-500 text-sm mb-4 line-clamp-2">
          {prompt.description}
        </p>

        <div className="mt-auto">
          <div className="bg-slate-50 rounded-lg p-2 mb-3 border border-slate-100 group-hover:border-slate-200 transition-colors">
            <code className="text-xs text-slate-600 font-mono line-clamp-3 leading-relaxed">
              {prompt.content}
            </code>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-1 flex-wrap">
              {prompt.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-[10px] text-slate-400 font-medium">#{tag}</span>
              ))}
            </div>
            <button
              onClick={() => onCopy(prompt.content)}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
            >
              <Copy size={14} />
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: '' });

  // Load favorites from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('prompt.fans-favs');
    if (stored) {
      setFavorites(new Set(JSON.parse(stored)));
    }
  }, []);

  const toggleFavorite = (id: string) => {
    const next = new Set(favorites);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setFavorites(next);
    localStorage.setItem('prompt.fans-favs', JSON.stringify(Array.from(next)));
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setToast({ show: true, msg: 'Copied to clipboard!' });
    setTimeout(() => setToast({ show: false, msg: '' }), 2000);
  };

  const filteredPrompts = useMemo(() => {
    return MOCK_PROMPTS.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col text-slate-900 pb-8">
      <Header />
      
      {/* Search Area */}
      <div className="px-4 pt-4 pb-2 bg-white">
        <div className="relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-yellow-500 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search for prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:border-yellow-400 focus:bg-white transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <CategoryFilter selected={activeCategory} onSelect={setActiveCategory} />

      {/* Content Area */}
      <main className="px-4 py-4 flex-grow">
        {filteredPrompts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrompts.map(prompt => (
              <PromptCard 
                key={prompt.id} 
                prompt={prompt} 
                onCopy={handleCopy}
                onToggleFav={toggleFavorite}
                isFav={favorites.has(prompt.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
              <Search size={32} />
            </div>
            <p className="font-medium">No prompts found.</p>
            <p className="text-sm">Try a different category or search term.</p>
          </div>
        )}
      </main>

      {/* Extension Footer style */}
      <footer className="text-center py-4 text-xs text-slate-400 border-t border-slate-100">
        <p>© 2024 prompt.fans • Chrome Extension</p>
      </footer>

      <Toast message={toast.msg} visible={toast.show} />
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);