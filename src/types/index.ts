// Global type declarations for Chrome Extension API
declare global {
  const chrome: any;
}

export interface BananaPrompt {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  author?: string;
  likes: number;
  copyCount?: number;
  isFavorite: boolean;
  isPremium?: boolean;
  isUserCreated?: boolean;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  style?: 'Realistic' | 'Cinematic' | 'Anime' | 'Abstract' | 'Minimalist' | 'Professional' | 'Creative';
  mood?: 'Vibrant' | 'Dark' | 'Elegant' | 'Professional' | 'Energetic';
  category: 'Coding' | 'Writing' | 'Art' | 'Marketing' | 'Academic' | 'Productivity';
  tool: 'ChatGPT' | 'Midjourney' | 'Claude' | 'Gemini' | 'Stable Diffusion' | 'Any';
  createdAt?: string;
}

export interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface EnvAdapter {
  isExtension: () => boolean;
  getStorage: (key: string, defaultVal: any) => Promise<any>;
  setStorage: (key: string, value: any) => Promise<void>;
  injectScript: (text: string) => Promise<void>;
}

export interface CategoryPillProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  icon?: any;
}

export interface PromptCardProps {
  prompt: BananaPrompt;
  onCopy: (text: string) => void;
  onToggleFav: (id: string) => void;
  onInject: (text: string) => void;
}

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSave: (key: string) => void;
}
