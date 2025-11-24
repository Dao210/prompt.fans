import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, Copy, Check, Menu, Zap, Filter, Github, Plus, Command } from 'lucide-react';

// --- Types ---
interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string; // The full prompt
  tool: 'ChatGPT' | 'Midjourney' | 'Claude' | 'Stable Diffusion';
  category: 'Coding' | 'Marketing' | 'Writing' | 'Art' | 'Productivity';
  tags: string[];
}

// --- Mock Data (Expanded for realism) ---
const MOCK_PROMPTS: Prompt[] = [
  {
    id: '1',
    title: 'Senior React Engineer Persona',
    description: 'Forces the AI to adopt a strict, best-practice focused coding style.',
    content: 'Act as a Principal Frontend Engineer at a FAANG company. I will provide you with React/TypeScript code snippets. You must review them for: 1. Performance bottlenecks (re-renders), 2. Accessibility (ARIA), 3. Maintainability (SOLID principles). Do not be polite; be concise and technical. Provide refactored code blocks.',
    tool: 'ChatGPT',
    category: 'Coding',
    tags: ['React', 'Engineering', 'Code Review']
  },
  {
    id: '2',
    title: 'Cyberpunk Cityscape V5',
    description: 'High fidelity Midjourney prompt for neon aesthetics.',
    content: 'futuristic tokyo city street level, heavy rain, neon lights, reflection on wet asphalt, cyberpunk aesthetic, blade runner style, volumetric lighting, 8k resolution, photorealistic, cinematic shot --ar 16:9 --v 5.2 --s 750',
    tool: 'Midjourney',
    category: 'Art',
    tags: ['Sci-fi', 'Atmospheric', '3D']
  },
  {
    id: '3',
    title: 'Viral Twitter Thread Hook',
    description: 'Generate hooks that stop the scroll.',
    content: 'Write 5 variations of a Twitter thread hook about [TOPIC]. The hooks should be punchy, controversial, or promise high value. Use the AIDA framework. Keep each hook under 280 characters. Do not use hashtags.',
    tool: 'ChatGPT',
    category: 'Marketing',
    tags: ['Social Media', 'Copywriting']
  },
  {
    id: '4',
    title: 'SQL Query Optimizer',
    description: 'Analyze and fix slow database queries.',
    content: 'Here is a SQL query running on PostgreSQL. Explain the query plan it likely generates, identify why it is slow (e.g., missing indexes, full table scans), and rewrite it for optimal performance.',
    tool: 'ChatGPT',
    category: 'Coding',
    tags: ['Database', 'Backend', 'SQL']
  },
  {
    id: '5',
    title: 'Email Professionalizer',
    description: 'Turn angry thoughts into corporate speak.',
    content: 'Rewrite the following text to be professional, polite, and firm. Use corporate language but avoid excessive jargon. Tone: Collaborative but setting boundaries. Input: "[INPUT TEXT]"',
    tool: 'Claude',
    category: 'Writing',
    tags: ['Business', 'Email', 'Communication']
  },
  {
    id: '6',
    title: 'Analog Film Photography',
    description: 'Simulate Kodak Portra 400 style.',
    content: 'portrait of a woman in a coffee shop, looking out the window, natural window light, shot on Kodak Portra 400, 35mm lens, f/1.8, film grain, vintage feel, candid moment --ar 2:3',
    tool: 'Midjourney',
    category: 'Art',
    tags: ['Photography', 'Vintage', 'Portrait']
  },
  {
    id: '7',
    title: 'UX Case Study Generator',
    description: 'Structure for a portfolio case study.',
    content: 'Create a comprehensive outline for a UX case study about a [APP IDEA]. Structure it with: 1. The Problem, 2. User Research (create 2 personas), 3. The Solution, 4. Usability Testing Results, 5. Lessons Learned.',
    tool: 'Claude',
    category: 'Productivity',
    tags: ['Design', 'UX', 'Job Hunt']
  },
  {
    id: '8',
    title: 'Youtube Script Outline',
    description: 'High retention video structure.',
    content: 'Create a 10-minute YouTube video script outline for a video titled "[TITLE]". Use the following structure: 1. The Hook (0:00-0:45), 2. The Setup, 3. The Meat (3 key points), 4. The Climax, 5. CTA.',
    tool: 'ChatGPT',
    category: 'Marketing',
    tags: ['Video', 'Content Creation']
  },
  {
    id: '9',
    title: 'Stable Diffusion Realistic',
    description: 'Base prompt for realistic human textures.',
    content: 'raw photo, close up portrait, (high detailed skin:1.2), 8k uhd, dslr, soft lighting, high quality, volumetric fog, candice swanepoel, <lora:epi_noiseoffset:1>',
    tool: 'Stable Diffusion',
    category: 'Art',
    tags: ['Realistic', 'Portrait']
  }
];

// --- Components ---

const Toast = ({ message, visible }: { message: string; visible: boolean }) => {
  if (!visible) return null;
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up">
      <div className="bg-brand-black text-white px-6 py-3 rounded-full shadow-hard flex items-center gap-3 font-medium border-2 border-white">
        <div className="bg-brand-yellow text-brand-black rounded-full p-1">
          <Check size={14} strokeWidth={4} />
        </div>
        {message}
      </div>
    </div>
  );
};

const Header = () => (
  <header className="sticky top-0 z-40 bg-brand-yellow border-b-2 border-brand-black px-4 py-3">
    <div className="max-w-6xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-2 group cursor-pointer">
        <div className="bg-white border-2 border-brand-black p-1.5 rounded-lg shadow-hard-sm group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-none transition-all">
          <Zap size={20} className="text-brand-black fill-brand-yellow" />
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-brand-black">
          prompt.fans
        </h1>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border-2 border-brand-black rounded-lg font-bold text-sm shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
          <Plus size={16} />
          <span>Submit</span>
        </button>
        <button className="p-2 bg-brand-black text-white rounded-lg hover:bg-slate-800 transition-colors">
          <Menu size={20} />
        </button>
      </div>
    </div>
  </header>
);

const TagPill = ({ text, type = 'default' }: { text: string, type?: 'tool' | 'default' }) => {
  const styles = type === 'tool' 
    ? 'bg-blue-100 text-blue-800 border-blue-200'
    : 'bg-slate-100 text-slate-600 border-slate-200';
    
  return (
    <span className={`text-[10px] font-bold px-2 py-1 rounded-md border uppercase tracking-wider ${styles}`}>
      {text}
    </span>
  );
};

const CategoryFilter = ({ 
  selected, 
  onSelect 
}: { 
  selected: string; 
  onSelect: (c: string) => void 
}) => {
  const categories = ['All', 'Coding', 'Art', 'Writing', 'Marketing', 'Productivity'];
  
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 pt-2 no-scrollbar mask-gradient">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`
            px-5 py-2 rounded-full text-sm font-bold border-2 transition-all whitespace-nowrap
            ${selected === cat 
              ? 'bg-brand-black text-brand-yellow border-brand-black shadow-hard-sm' 
              : 'bg-white text-brand-black border-brand-black hover:bg-yellow-50'}
          `}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

interface PromptCardProps {
  prompt: Prompt;
  onCopy: (content: string) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, onCopy }) => {
  return (
    <div className="break-inside-avoid mb-4">
      <div className="group relative flex flex-col bg-white border-2 border-brand-black rounded-xl p-0 transition-all hover:-translate-y-1 hover:shadow-hard">
        
        {/* Card Body */}
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <TagPill text={prompt.tool} type="tool" />
            <div className="flex gap-1">
               {prompt.tags.slice(0, 1).map(t => <TagPill key={t} text={t} />)}
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl font-bold text-brand-black leading-tight mb-1">
              {prompt.title}
            </h3>
            <p className="text-sm text-slate-500 font-medium leading-snug">
              {prompt.description}
            </p>
          </div>

          {/* Prompt Preview Area */}
          <div className="relative mt-2 bg-slate-50 rounded-lg border-2 border-slate-100 p-3 group-hover:border-brand-yellow transition-colors">
            <code className="block font-mono text-xs text-slate-700 line-clamp-4 leading-relaxed">
              {prompt.content}
            </code>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50/90 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Card Footer / Action */}
        <div className="border-t-2 border-brand-black p-3 bg-brand-yellow/10 rounded-b-lg flex justify-between items-center group-hover:bg-brand-yellow transition-colors">
          <span className="text-xs font-bold text-brand-black opacity-60 group-hover:opacity-100 uppercase tracking-wide">
            {prompt.category}
          </span>
          <button
            onClick={() => onCopy(prompt.content)}
            className="flex items-center gap-1.5 bg-white border-2 border-brand-black px-3 py-1.5 rounded-lg text-xs font-bold shadow-[2px_2px_0px_0px_#0F172A] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
          >
            <Copy size={14} />
            Copy Prompt
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: '' });

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setToast({ show: true, msg: 'Copied to clipboard!' });
    setTimeout(() => setToast({ show: false, msg: '' }), 2500);
  };

  const filteredPrompts = useMemo(() => {
    return MOCK_PROMPTS.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch = 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.tool.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col text-brand-black font-sans selection:bg-brand-yellow selection:text-brand-black">
      <Header />
      
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-6">
        
        {/* Search & Intro */}
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Find the best prompts <br/> for your workflow.
          </h2>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-brand-black/50">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search prompts (e.g., 'React', 'Midjourney', 'SEO')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-brand-black rounded-xl text-lg font-medium shadow-hard focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all placeholder:text-slate-400"
            />
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <div className="hidden sm:flex items-center gap-1 bg-slate-100 px-2 py-1 rounded border border-slate-300">
                    <Command size={12} className="text-slate-500" />
                    <span className="text-xs font-bold text-slate-500">K</span>
                </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6 sticky top-[72px] z-30 bg-[#FFFBEB]/95 backdrop-blur-sm py-2 -mx-4 px-4 border-b border-brand-black/10 md:static md:bg-transparent md:border-none md:p-0">
          <CategoryFilter selected={activeCategory} onSelect={setActiveCategory} />
        </div>

        {/* Masonry Grid */}
        {filteredPrompts.length > 0 ? (
          <div className="masonry-grid pb-20">
            {filteredPrompts.map(prompt => (
              <PromptCard 
                key={prompt.id} 
                prompt={prompt} 
                onCopy={handleCopy}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="bg-white border-2 border-slate-200 p-6 rounded-2xl mb-4 rotate-3">
              <Search size={48} className="text-brand-yellow" />
            </div>
            <p className="font-display font-bold text-xl text-brand-black">No prompts found.</p>
            <p className="text-sm">Try adjusting your search filters.</p>
          </div>
        )}
      </main>

      <Toast message={toast.msg} visible={toast.show} />
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);