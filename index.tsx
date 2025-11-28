import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Search, Copy, Check, Zap, Filter, 
  Heart, Settings, Sparkles, Send, 
  Loader2, Play, Menu, X, Code, PenTool,
  Image as ImageIcon, BookOpen, Rocket, Plus, Edit2, Trash2, Shield
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { PromptEditorModal } from './src/components/PromptEditorModal';
import { PromptsService } from './src/services/promptsService';
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
    copyCount: 342,
    isFavorite: false,
    difficulty: 'Advanced',
    style: 'Professional',
    category: 'Coding',
    tool: 'ChatGPT',
    createdAt: '2025-01-15'
  },
  {
    id: '2',
    title: 'Cyberpunk Noir V6',
    description: 'High contrast neon aesthetics for MJ v6.',
    content: 'cinematic shot, cyberpunk noir, rainy streets of neo-tokyo at night, neon reflections in puddles, steam rising from vents, solitude, blade runner vibe, 35mm lens, f/1.8, highly detailed, 8k --ar 16:9 --v 6.0',
    tags: ['Photography', 'Sci-Fi', 'Atmospheric'],
    author: 'neon_dreamer',
    likes: 892,
    copyCount: 567,
    isFavorite: true,
    isPremium: true,
    difficulty: 'Intermediate',
    style: 'Cinematic',
    mood: 'Dark',
    category: 'Art',
    tool: 'Midjourney',
    createdAt: '2025-01-18'
  },
  {
    id: '3',
    title: 'Cold Email that Converts',
    description: 'AIDA framework for B2B sales.',
    content: 'Write a cold email to a [JOB TITLE] at a [INDUSTRY] company. Use the AIDA framework (Attention, Interest, Desire, Action). Keep it under 150 words. The goal is to book a 15-minute demo call. My value proposition is: [VALUE PROP].',
    tags: ['Sales', 'Copywriting', 'Growth'],
    author: 'growth_hacker',
    likes: 450,
    copyCount: 234,
    isFavorite: false,
    difficulty: 'Beginner',
    style: 'Professional',
    category: 'Marketing',
    tool: 'Claude',
    createdAt: '2025-01-20'
  },
  {
    id: '4',
    title: 'Python Data Cleaning',
    description: 'Pandas pipeline for messy datasets.',
    content: 'You are a Senior Data Analyst. I have a CSV file with the following columns: [COLUMNS]. Write a Python script using Pandas to: 1. Detect and handle missing values, 2. Normalize text columns, 3. Remove duplicates, 4. Generate a correlation matrix heatmap using Seaborn.',
    tags: ['Python', 'Data Science', 'Pandas'],
    author: 'data_wiz',
    likes: 670,
    copyCount: 445,
    isFavorite: false,
    difficulty: 'Intermediate',
    style: 'Professional',
    category: 'Coding',
    tool: 'Gemini',
    createdAt: '2025-01-22'
  },
  {
    id: '5',
    title: 'Academic Abstract Polisher',
    description: 'Refine research papers for publication.',
    content: 'Rewrite the following research abstract to meet the standards of top-tier journals (e.g., Nature, IEEE). Improve flow, clarity, and academic tone. Ensure the problem, method, results, and implications are clearly articulated.',
    tags: ['Research', 'Writing', 'PhD'],
    author: 'prof_ai',
    likes: 320,
    copyCount: 156,
    isFavorite: false,
    difficulty: 'Advanced',
    style: 'Professional',
    category: 'Academic',
    tool: 'Claude',
    createdAt: '2025-01-25'
  },
  {
    id: '6',
    title: 'SaaS Landing Page Copy',
    description: 'Hero section conversion optimization.',
    content: 'Write 5 variations of a Hero Section headline and subheadline for a SaaS product that helps [TARGET AUDIENCE] achieve [BENEFIT]. Focus on pain points and immediate value. Tone: Professional yet urgent.',
    tags: ['UX Writing', 'Web Design'],
    author: 'saas_founder',
    likes: 210,
    copyCount: 98,
    isFavorite: false,
    difficulty: 'Beginner',
    style: 'Professional',
    category: 'Marketing',
    tool: 'ChatGPT',
    createdAt: '2025-02-01'
  },
  // New Art/Photography Prompts
  {
    id: '7',
    title: 'Urban Portrait Photography',
    description: 'Dramatic city portraits with cinematic lighting.',
    content: 'Create a dramatic, ultra-realistic close-up portrait in black and white with high-contrast cinematic lighting from the side, highlighting facial contours and expressions. Urban background with bokeh lights, professional studio quality, shot with 85mm f/1.4 lens, 8k resolution --ar 2:3 --style raw',
    tags: ['Portrait', 'Urban', 'Black & White', 'Cinematic'],
    author: 'urban_lens',
    likes: 765,
    copyCount: 423,
    isFavorite: false,
    isPremium: true,
    difficulty: 'Intermediate',
    style: 'Realistic',
    mood: 'Dark',
    category: 'Art',
    tool: 'Midjourney',
    createdAt: '2025-02-03'
  },
  {
    id: '8',
    title: 'Watercolor Illustration Master',
    description: 'Vintage watercolor painting style generator.',
    content: 'vintage watercolor painting style, [SUBJECT], soft brush strokes, pastel color palette, aged paper texture, artistic splashes and bleeds, hand-painted aesthetic, gentle shadows, dreamy atmosphere, traditional art medium, high resolution scan quality --ar 4:5 --v 6.0',
    tags: ['Watercolor', 'Vintage', 'Traditional Art'],
    author: 'watercolor_artist',
    likes: 241,
    copyCount: 189,
    isFavorite: false,
    isPremium: true,
    difficulty: 'Beginner',
    style: 'Abstract',
    mood: 'Elegant',
    category: 'Art',
    tool: 'Midjourney',
    createdAt: '2025-02-05'
  },
  {
    id: '9',
    title: '3D Character Design Pro',
    description: '3D rendered characters with Pixar quality.',
    content: 'Create a 3D rendered character design of [CHARACTER DESCRIPTION], Pixar/Disney animation style, highly detailed textures, expressive facial features, dynamic pose, colorful and vibrant, professional 3D modeling quality, soft ambient lighting, clean background, character sheet style --ar 16:9 --v 6.0',
    tags: ['3D', 'Character Design', 'Animation'],
    author: '3d_wizard',
    likes: 528,
    copyCount: 312,
    isFavorite: false,
    difficulty: 'Advanced',
    style: 'Anime',
    mood: 'Vibrant',
    category: 'Art',
    tool: 'Midjourney',
    createdAt: '2025-02-07'
  },
  {
    id: '10',
    title: 'Editorial Fashion Photography',
    description: 'High-end fashion magazine aesthetic.',
    content: 'Editorial fashion photography, [MODEL/OUTFIT DESCRIPTION], Vogue magazine style, dramatic lighting with rim light, minimalist background, high-fashion pose, ultra-sharp focus, shot with Hasselblad, professional color grading, 8k resolution, luxury aesthetic --ar 2:3 --style raw',
    tags: ['Fashion', 'Editorial', 'Professional'],
    author: 'fashion_pro',
    likes: 445,
    copyCount: 267,
    isFavorite: false,
    isPremium: true,
    difficulty: 'Intermediate',
    style: 'Professional',
    mood: 'Elegant',
    category: 'Art',
    tool: 'Midjourney',
    createdAt: '2025-02-09'
  },
  {
    id: '11',
    title: 'Product Photography Studio',
    description: 'Commercial product shots with perfect lighting.',
    content: 'Professional product photography of [PRODUCT], white studio background, three-point lighting setup, sharp focus on product details, subtle shadows, commercial advertising quality, shot with macro lens, high resolution, clean and minimal composition, e-commerce ready --ar 1:1 --style raw',
    tags: ['Product', 'Commercial', 'Studio'],
    author: 'product_shooter',
    likes: 334,
    copyCount: 445,
    isFavorite: false,
    difficulty: 'Beginner',
    style: 'Professional',
    category: 'Art',
    tool: 'Midjourney',
    createdAt: '2025-02-11'
  },
  {
    id: '12',
    title: 'Architectural Visualization',
    description: 'Photorealistic architectural renders.',
    content: 'Photorealistic architectural visualization of [BUILDING/SPACE], modern design, natural daylight streaming through windows, high-end interior/exterior materials, professional rendering quality, sharp details, depth of field, cinematic composition, Unreal Engine quality --ar 16:9 --v 6.0',
    tags: ['Architecture', 'Visualization', '3D Render'],
    author: 'arch_viz_pro',
    likes: 298,
    copyCount: 178,
    isFavorite: false,
    difficulty: 'Advanced',
    style: 'Realistic',
    mood: 'Professional',
    category: 'Art',
    tool: 'Stable Diffusion',
    createdAt: '2025-02-13'
  },
  {
    id: '13',
    title: 'Abstract Art Generator',
    description: 'Modern abstract compositions with bold colors.',
    content: 'Abstract modern art, [THEME/CONCEPT], bold geometric shapes, vibrant color palette with gradients, dynamic composition, contemporary gallery style, textured canvas appearance, professional art print quality, expressive brush strokes, balanced chaos --ar 4:5 --v 6.0',
    tags: ['Abstract', 'Modern Art', 'Contemporary'],
    author: 'abstract_mind',
    likes: 267,
    copyCount: 134,
    isFavorite: false,
    difficulty: 'Intermediate',
    style: 'Abstract',
    mood: 'Vibrant',
    category: 'Art',
    tool: 'Midjourney',
    createdAt: '2025-02-15'
  },
  {
    id: '14',
    title: 'Vintage Film Aesthetic',
    description: 'Retro film photography with authentic grain.',
    content: 'Vintage film photography aesthetic, [SUBJECT], shot on 35mm Kodak film, natural grain texture, warm color tones with slight fading, soft focus, nostalgic 1970s-90s vibe, analog camera imperfections, authentic retro look, high scan quality --ar 3:2 --style raw',
    tags: ['Vintage', 'Film', 'Retro', 'Analog'],
    author: 'film_nostalgia',
    likes: 389,
    copyCount: 245,
    isFavorite: false,
    difficulty: 'Beginner',
    style: 'Cinematic',
    mood: 'Elegant',
    category: 'Art',
    tool: 'Midjourney',
    createdAt: '2025-02-17'
  },
  // New Coding Prompts
  {
    id: '15',
    title: 'TypeScript Type Wizard',
    description: 'Master complex TypeScript type systems.',
    content: 'You are a TypeScript expert specializing in advanced type systems. Help me create type-safe code for [SCENARIO]. Provide: 1. Utility types and generics that solve the problem, 2. Type guards for runtime safety, 3. Branded types where appropriate, 4. Clear inline comments explaining the type logic. Focus on maintainability and compile-time safety.',
    tags: ['TypeScript', 'Types', 'Advanced'],
    author: 'ts_master',
    likes: 678,
    copyCount: 423,
    isFavorite: false,
    difficulty: 'Advanced',
    style: 'Professional',
    category: 'Coding',
    tool: 'ChatGPT',
    createdAt: '2025-02-19'
  },
  {
    id: '16',
    title: 'API Design Reviewer',
    description: 'RESTful API design best practices review.',
    content: 'Act as a Senior Backend Architect. Review this API design for [ENDPOINT/RESOURCE]. Evaluate: 1. RESTful principles compliance, 2. HTTP status codes usage, 3. Versioning strategy, 4. Authentication/authorization approach, 5. Error response format, 6. Pagination and filtering. Suggest improvements with OpenAPI 3.0 spec examples.',
    tags: ['API', 'REST', 'Backend', 'Architecture'],
    author: 'api_architect',
    likes: 512,
    copyCount: 289,
    isFavorite: false,
    difficulty: 'Intermediate',
    style: 'Professional',
    category: 'Coding',
    tool: 'Claude',
    createdAt: '2025-02-21'
  },
  {
    id: '17',
    title: 'Database Schema Optimizer',
    description: 'SQL database design and optimization expert.',
    content: 'You are a Database Architect. Analyze this schema/query for [DATABASE]. Provide: 1. Normalization recommendations (up to 3NF), 2. Index strategy for performance, 3. Query optimization suggestions, 4. Potential N+1 query issues, 5. Partitioning strategy for scale. Include both PostgreSQL and MySQL specific optimizations.',
    tags: ['SQL', 'Database', 'Performance', 'PostgreSQL'],
    author: 'db_guru',
    likes: 445,
    copyCount: 267,
    isFavorite: false,
    difficulty: 'Advanced',
    style: 'Professional',
    category: 'Coding',
    tool: 'Gemini',
    createdAt: '2025-02-23'
  },
  {
    id: '18',
    title: 'Security Audit Assistant',
    description: 'Code security vulnerabilities scanner.',
    content: 'Act as a Security Engineer. Audit the following code for vulnerabilities: 1. SQL injection risks, 2. XSS vulnerabilities, 3. CSRF protection, 4. Authentication flaws, 5. Sensitive data exposure, 6. Dependency vulnerabilities. Reference OWASP Top 10. Provide secure code alternatives with explanations.',
    tags: ['Security', 'OWASP', 'Vulnerabilities'],
    author: 'sec_expert',
    likes: 723,
    copyCount: 512,
    isFavorite: false,
    isPremium: true,
    difficulty: 'Advanced',
    style: 'Professional',
    category: 'Coding',
    tool: 'ChatGPT',
    createdAt: '2025-02-25'
  },
  {
    id: '19',
    title: 'Git Workflow Expert',
    description: 'Git branching strategies and conflict resolution.',
    content: 'You are a Git expert. Help with [GIT SCENARIO]. Provide: 1. Appropriate git commands with explanations, 2. Branching strategy recommendations (GitFlow, trunk-based, etc.), 3. Merge vs rebase guidance, 4. Conflict resolution steps, 5. Commit message best practices. Include rollback strategies.',
    tags: ['Git', 'Version Control', 'DevOps'],
    author: 'git_master',
    likes: 389,
    copyCount: 234,
    isFavorite: false,
    difficulty: 'Intermediate',
    style: 'Professional',
    category: 'Coding',
    tool: 'Claude',
    createdAt: '2025-02-27'
  },
  {
    id: '20',
    title: 'Chrome Extension Debugger',
    description: 'Debug Chrome extensions like a pro.',
    content: 'You are a Chrome Extension specialist. Debug this issue: [PROBLEM]. Cover: 1. Manifest V3 specific issues, 2. Service worker debugging, 3. Content script injection problems, 4. Message passing between components, 5. Storage API issues, 6. Permission troubleshooting. Provide working code fixes.',
    tags: ['Chrome Extension', 'Debugging', 'JavaScript'],
    author: 'extension_dev',
    likes: 295,
    copyCount: 167,
    isFavorite: false,
    difficulty: 'Intermediate',
    style: 'Professional',
    category: 'Coding',
    tool: 'ChatGPT',
    createdAt: '2025-03-01'
  },
  {
    id: '21',
    title: 'Tailwind CSS Pro',
    description: 'Advanced Tailwind CSS patterns and optimization.',
    content: 'You are a Tailwind CSS expert. Optimize this component styling: [CODE]. Provide: 1. Utility class optimization, 2. Custom plugin suggestions, 3. Responsive design improvements, 4. Dark mode implementation, 5. Animation with Tailwind, 6. Bundle size optimization with PurgeCSS config.',
    tags: ['Tailwind', 'CSS', 'Frontend', 'Styling'],
    author: 'tailwind_ninja',
    likes: 467,
    copyCount: 356,
    isFavorite: false,
    difficulty: 'Intermediate',
    style: 'Professional',
    category: 'Coding',
    tool: 'Claude',
    createdAt: '2025-03-03'
  },
  {
    id: '22',
    title: 'Performance Profiler',
    description: 'Web performance optimization specialist.',
    content: 'Act as a Web Performance Engineer. Analyze [WEBSITE/APP] performance. Provide: 1. Core Web Vitals improvement strategies (LCP, FID, CLS), 2. Bundle size optimization, 3. Code splitting recommendations, 4. Image optimization techniques, 5. Caching strategies, 6. CDN configuration. Include Lighthouse score improvements.',
    tags: ['Performance', 'Optimization', 'Web Vitals'],
    author: 'perf_optimizer',
    likes: 589,
    copyCount: 412,
    isFavorite: false,
    isPremium: true,
    difficulty: 'Advanced',
    style: 'Professional',
    category: 'Coding',
    tool: 'Gemini',
    createdAt: '2025-03-05'
  },
  // New Writing Prompts
  {
    id: '23',
    title: 'LinkedIn Post Viral Formula',
    description: 'Engagement-optimized LinkedIn content.',
    content: 'Write a LinkedIn post about [TOPIC] using these engagement tactics: 1. Hook in first line (pattern interrupt), 2. Personal story or data point, 3. Break into short paragraphs (mobile-friendly), 4. Include 3-5 key takeaways, 5. End with engaging question or CTA. Tone: Professional but conversational. Aim for 1300 characters max.',
    tags: ['LinkedIn', 'Social Media', 'Engagement'],
    author: 'linkedin_growth',
    likes: 534,
    copyCount: 789,
    isFavorite: false,
    difficulty: 'Beginner',
    style: 'Professional',
    category: 'Writing',
    tool: 'ChatGPT',
    createdAt: '2025-03-07'
  },
  {
    id: '24',
    title: 'Technical Documentation Writer',
    description: 'Clear, comprehensive technical docs.',
    content: 'Create technical documentation for [FEATURE/API]. Structure: 1. Overview and use cases, 2. Prerequisites and setup, 3. Step-by-step guide with code examples, 4. API reference with parameters, 5. Common errors and troubleshooting, 6. Best practices. Use Markdown format. Audience: developers with intermediate knowledge.',
    tags: ['Documentation', 'Technical Writing', 'Developer Tools'],
    author: 'docs_writer',
    likes: 412,
    copyCount: 234,
    isFavorite: false,
    difficulty: 'Intermediate',
    style: 'Professional',
    category: 'Writing',
    tool: 'Claude',
    createdAt: '2025-03-09'
  },
  {
    id: '25',
    title: 'Product Description Master',
    description: 'E-commerce product descriptions that convert.',
    content: 'Write a compelling product description for [PRODUCT]. Include: 1. Attention-grabbing headline, 2. Key benefits (not just features), 3. Emotional appeal and pain point solution, 4. Social proof elements, 5. Urgency/scarcity if applicable, 6. SEO-optimized keywords naturally. Length: 150-200 words. Tone: [TARGET AUDIENCE appropriate].',
    tags: ['E-commerce', 'Copywriting', 'Conversion'],
    author: 'ecom_copywriter',
    likes: 367,
    copyCount: 456,
    isFavorite: false,
    difficulty: 'Beginner',
    style: 'Professional',
    category: 'Writing',
    tool: 'ChatGPT',
    createdAt: '2025-03-11'
  },
  {
    id: '26',
    title: 'Email Subject Line Generator',
    description: 'High open-rate email subject lines.',
    content: 'Generate 10 email subject line variations for [CAMPAIGN/TOPIC]. Mix these proven formulas: 1. Curiosity gaps, 2. Personalization, 3. Numbers and lists, 4. Questions, 5. Urgency, 6. Benefit-focused. Keep under 50 characters for mobile. Include A/B test recommendations and predicted open rate indicators.',
    tags: ['Email Marketing', 'Copywriting', 'A/B Testing'],
    author: 'email_expert',
    likes: 445,
    copyCount: 612,
    isFavorite: false,
    difficulty: 'Beginner',
    style: 'Creative',
    category: 'Writing',
    tool: 'Claude',
    createdAt: '2025-03-13'
  },
  {
    id: '27',
    title: 'Content Repurposing Expert',
    description: 'Turn one content piece into multiple formats.',
    content: 'Repurpose this content: [SOURCE CONTENT] into: 1. Twitter thread (8-10 tweets), 2. LinkedIn carousel post (5-7 slides outline), 3. Email newsletter section, 4. Instagram caption with hashtags, 5. YouTube video script outline. Maintain core message while adapting tone and format for each platform.',
    tags: ['Content Strategy', 'Social Media', 'Repurposing'],
    author: 'content_strategist',
    likes: 389,
    copyCount: 267,
    isFavorite: false,
    difficulty: 'Intermediate',
    style: 'Creative',
    category: 'Writing',
    tool: 'ChatGPT',
    createdAt: '2025-03-15'
  },
  {
    id: '28',
    title: 'Storytelling Framework',
    description: 'Compelling brand and personal stories.',
    content: 'Craft a story for [BRAND/PERSONAL TOPIC] using the Hero\'s Journey framework: 1. Ordinary World (relatable starting point), 2. Call to Adventure (problem/opportunity), 3. Challenges and obstacles, 4. Transformation moment, 5. Return with wisdom (lesson/solution). Length: 500-700 words. Make it emotionally resonant and authentic.',
    tags: ['Storytelling', 'Brand', 'Content'],
    author: 'story_crafter',
    likes: 478,
    copyCount: 312,
    isFavorite: false,
    isPremium: true,
    difficulty: 'Intermediate',
    style: 'Creative',
    category: 'Writing',
    tool: 'Claude',
    createdAt: '2025-03-17'
  },
  // New Marketing Prompts
  {
    id: '29',
    title: 'Social Media Caption Creator',
    description: 'Platform-specific engaging captions.',
    content: 'Create social media captions for [CONTENT/IMAGE] for these platforms: 1. Instagram (include 15-20 relevant hashtags), 2. Facebook (longer format with story), 3. Twitter (concise, engaging), 4. TikTok (trend-aware with hooks). Each should match platform tone and include appropriate emojis and CTAs.',
    tags: ['Social Media', 'Captions', 'Content Creation'],
    author: 'social_guru',
    likes: 523,
    copyCount: 678,
    isFavorite: false,
    difficulty: 'Beginner',
    style: 'Creative',
    category: 'Marketing',
    tool: 'ChatGPT',
    createdAt: '2025-03-19'
  },
  {
    id: '30',
    title: 'Ad Copy A/B Test Generator',
    description: 'Multiple ad variations for split testing.',
    content: 'Generate 5 ad copy variations for [PRODUCT/SERVICE] to A/B test. Each variation should test different angles: 1. Feature-focused, 2. Benefit-driven, 3. Problem-solution, 4. Social proof, 5. Urgency-based. Include headline, body (25-50 words), and CTA for each. Specify testing hypothesis for each version.',
    tags: ['Advertising', 'A/B Testing', 'Conversion'],
    author: 'ad_optimizer',
    likes: 456,
    copyCount: 534,
    isFavorite: false,
    difficulty: 'Intermediate',
    style: 'Professional',
    category: 'Marketing',
    tool: 'Claude',
    createdAt: '2025-03-21'
  },
  {
    id: '31',
    title: 'Brand Voice Analyzer',
    description: 'Define and maintain consistent brand voice.',
    content: 'Analyze [BRAND/COMPANY] communication and define their brand voice: 1. Tone attributes (4-5 key adjectives), 2. Vocabulary preferences (words to use/avoid), 3. Sentence structure patterns, 4. Humor level and type, 5. Example phrases in brand voice, 6. Do\'s and don\'ts guide. Create a 1-page brand voice chart.',
    tags: ['Branding', 'Content Strategy', 'Voice & Tone'],
    author: 'brand_strategist',
    likes: 389,
    copyCount: 245,
    isFavorite: false,
    difficulty: 'Advanced',
    style: 'Professional',
    category: 'Marketing',
    tool: 'ChatGPT',
    createdAt: '2025-03-23'
  },
  {
    id: '32',
    title: 'Customer Journey Mapper',
    description: 'Map touchpoints and optimize conversion paths.',
    content: 'Create a customer journey map for [PRODUCT/SERVICE] from awareness to advocacy. For each stage (Awareness, Consideration, Decision, Retention, Advocacy), identify: 1. Customer goals and pain points, 2. Touchpoints and channels, 3. Content needs, 4. Emotions, 5. Opportunities for improvement. Format as a detailed stage-by-stage breakdown.',
    tags: ['Customer Journey', 'CX', 'Strategy'],
    author: 'cx_designer',
    likes: 412,
    copyCount: 198,
    isFavorite: false,
    isPremium: true,
    difficulty: 'Advanced',
    style: 'Professional',
    category: 'Marketing',
    tool: 'Claude',
    createdAt: '2025-03-25'
  },
  // New Productivity Prompts
  {
    id: '33',
    title: 'Meeting Notes Summarizer',
    description: 'Transform messy notes into action items.',
    content: 'Summarize these meeting notes: [NOTES]. Provide: 1. Key discussion points (3-5 bullets), 2. Decisions made, 3. Action items with owners and deadlines, 4. Parking lot items for future discussion, 5. Next meeting agenda suggestions. Format for easy distribution to team. Highlight urgent items.',
    tags: ['Meetings', 'Productivity', 'Team Collaboration'],
    author: 'productivity_pro',
    likes: 567,
    copyCount: 891,
    isFavorite: false,
    difficulty: 'Beginner',
    style: 'Professional',
    category: 'Productivity',
    tool: 'ChatGPT',
    createdAt: '2025-03-27'
  },
  {
    id: '34',
    title: 'Task Priority Matrix',
    description: 'Eisenhower Matrix for task prioritization.',
    content: 'Organize these tasks using the Eisenhower Matrix: [TASK LIST]. Categorize into: 1. Urgent & Important (do first), 2. Important not Urgent (schedule), 3. Urgent not Important (delegate), 4. Neither (eliminate). For each category, explain reasoning and provide time allocation recommendations. Include quick-win opportunities.',
    tags: ['Prioritization', 'Time Management', 'Productivity'],
    author: 'time_master',
    likes: 489,
    copyCount: 623,
    isFavorite: false,
    difficulty: 'Beginner',
    style: 'Professional',
    category: 'Productivity',
    tool: 'Claude',
    createdAt: '2025-03-29'
  },
  {
    id: '35',
    title: 'Email Template Library',
    description: 'Professional email templates for every situation.',
    content: 'Create an email template for [SCENARIO: e.g., follow-up, introduction, request, etc.]. Include: 1. Subject line options, 2. Greeting variations (formal/casual), 3. Body with [PLACEHOLDERS], 4. Clear call-to-action, 5. Professional signature. Tone: [specify]. Provide 2-3 variations from brief to detailed.',
    tags: ['Email', 'Templates', 'Communication'],
    author: 'email_efficiency',
    likes: 434,
    copyCount: 756,
    isFavorite: false,
    difficulty: 'Beginner',
    style: 'Professional',
    category: 'Productivity',
    tool: 'ChatGPT',
    createdAt: '2025-03-31'
  },
  {
    id: '36',
    title: 'Daily Standup Generator',
    description: 'Structure daily standup updates effectively.',
    content: 'Create a daily standup update for [YOUR ROLE/TEAM]. Cover: 1. What I completed yesterday (specific outcomes, not tasks), 2. What I\'m working on today (priorities), 3. Blockers and needs (be specific about help needed), 4. Progress on sprint goals (if applicable). Keep under 2 minutes speaking time. Be concise and actionable.',
    tags: ['Agile', 'Standup', 'Team Communication'],
    author: 'agile_coach',
    likes: 378,
    copyCount: 445,
    isFavorite: false,
    difficulty: 'Beginner',
    style: 'Professional',
    category: 'Productivity',
    tool: 'Claude',
    createdAt: '2025-04-02'
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
              alert('NanoBanana: Please click inside a text input field first!');
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
  onEdit?: (prompt: BananaPrompt) => void;
  onDelete?: (id: string) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, onCopy, onToggleFav, onInject, onEdit, onDelete }) => {
  const toolColors: Record<string, string> = {
    ChatGPT: 'bg-green-100 text-green-800 border-green-800',
    Midjourney: 'bg-purple-100 text-purple-800 border-purple-800',
    Claude: 'bg-orange-100 text-orange-800 border-orange-800',
    Gemini: 'bg-blue-100 text-blue-800 border-blue-800',
    'Stable Diffusion': 'bg-indigo-100 text-indigo-800 border-indigo-800',
    Any: 'bg-gray-100 text-gray-800 border-gray-800',
  };

  const getDifficultyLevel = (difficulty?: string) => {
    if (difficulty === 'Beginner') return 1;
    if (difficulty === 'Intermediate') return 2;
    if (difficulty === 'Advanced') return 3;
    return 0;
  };

  return (
    <div className="break-inside-avoid mb-6 group">
      <div className="bg-white border-2 border-brand-black rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-neo">
        
        {/* Card Header */}
        <div className="p-4 pb-0 flex justify-between items-start">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${toolColors[prompt.tool] || 'bg-gray-100'}`}>
              {prompt.tool}
            </span>
            {prompt.isPremium && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-yellow-400 text-yellow-900 border border-yellow-600 flex items-center gap-1">
                <Sparkles size={10} className="fill-current" />
                PREMIUM
              </span>
            )}
            {!prompt.isUserCreated && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-600 flex items-center gap-1">
                <Shield size={10} />
                OFFICIAL
              </span>
            )}
          </div>
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
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-display text-lg font-bold leading-tight text-brand-black flex-1">
              {prompt.title}
            </h3>
            {prompt.difficulty && (
              <div className="flex gap-1 ml-2" title={`Difficulty: ${prompt.difficulty}`}>
                {[1, 2, 3].map(i => (
                  <div key={i} className={`w-2 h-2 rounded-full ${
                    i <= getDifficultyLevel(prompt.difficulty) ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                ))}
              </div>
            )}
          </div>
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
          
          {/* Edit/Delete buttons for user-created prompts */}
          {prompt.isUserCreated && onEdit && onDelete && (
            <>
              <button 
                onClick={() => onEdit(prompt)}
                className="px-3 py-2 bg-white border-2 border-brand-black rounded-lg text-brand-black hover:bg-blue-100 active:translate-y-0.5 transition-all"
                aria-label="Edit prompt"
                title="Edit"
              >
                <Edit2 size={14} strokeWidth={2.5} />
              </button>
              <button 
                onClick={() => onDelete(prompt.id)}
                className="px-3 py-2 bg-white border-2 border-brand-black rounded-lg text-red-600 hover:bg-red-50 active:translate-y-0.5 transition-all"
                aria-label="Delete prompt"
                title="Delete"
              >
                <Trash2 size={14} strokeWidth={2.5} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const SettingsModal = ({ isOpen, onClose, apiKey, onSave, userPromptsCount, onExport, onImport }: any) => {
  const [key, setKey] = useState(apiKey);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(key);
    onClose();
  };

  const handleExportClick = async () => {
    try {
      const jsonData = await onExport();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nanobanana_prompts_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export prompts');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const count = await onImport(text);
      alert(`Successfully imported ${count} prompts!`);
    } catch (error) {
      alert('Failed to import prompts. Please check the file format.');
    }
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
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
        <div className="p-6 space-y-6">
          {/* API Key Section */}
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
              Your API key is stored securely in Chrome storage.
            </p>
          </div>

          {/* Prompts Management Section */}
          <div className="border-t-2 border-slate-200 pt-4">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Shield size={16} /> Manage Your Prompts
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-brand-gray rounded-lg border-2 border-slate-200">
                <div>
                  <p className="text-sm font-bold">{userPromptsCount} Custom Prompts</p>
                  <p className="text-xs text-slate-500">Saved in Chrome Storage</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleExportClick}
                  className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-brand-black bg-white rounded-lg font-bold text-sm hover:bg-brand-yellow transition-all"
                >
                  <Send size={14} />
                  Export
                </button>
                <button
                  onClick={handleImportClick}
                  className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-brand-black bg-white rounded-lg font-bold text-sm hover:bg-brand-yellow transition-all"
                >
                  <Plus size={14} />
                  Import
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />

              <p className="text-xs text-slate-500">
                Export your custom prompts as JSON for backup or sharing. Import to restore or add prompts from a file.
              </p>
            </div>
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
  const [builtInPrompts] = useState<BananaPrompt[]>(MOCK_PROMPTS);
  const [userPrompts, setUserPrompts] = useState<BananaPrompt[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [promptSourceFilter, setPromptSourceFilter] = useState<'all' | 'official' | 'custom'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'latest' | 'alphabetical'>('popular');
  const [showFavorites, setShowFavorites] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPromptEditorOpen, setIsPromptEditorOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<BananaPrompt | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '', type: 'info' });

  // Merge built-in and user prompts
  const allPrompts = useMemo(() => {
    return [...builtInPrompts, ...userPrompts];
  }, [builtInPrompts, userPrompts]);

  // Load favorites and user prompts on mount
  useEffect(() => {
    const loadData = async () => {
      const favs = await StorageService.getFavorites();
      setFavorites(favs);

      const loaded = await PromptsService.getUserPrompts();
      setUserPrompts(loaded);
    };

    const loadApiKey = async () => {
      const key = await StorageService.getApiKey();
      setApiKey(key);
    };

    loadData();
    loadApiKey();
  }, []);

  const categories = useMemo(() => {
    const cats = [...new Set(MOCK_PROMPTS.map(p => p.category))];
    return ['All', ...cats];
  }, []);

  const filteredPrompts = useMemo(() => {
    let filtered = allPrompts;

    // Filter by favorites
    if (showFavorites) {
      filtered = filtered.filter(p => p.isFavorite);
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by difficulty
    if (selectedDifficulty) {
      filtered = filtered.filter(p => p.difficulty === selectedDifficulty);
    }

    // Filter by style
    if (selectedStyle) {
      filtered = filtered.filter(p => p.style === selectedStyle);
    }

    // Filter by premium
    if (showPremiumOnly) {
      filtered = filtered.filter(p => p.isPremium === true);
    }

    // Filter by prompt source
    if (promptSourceFilter === 'official') {
      filtered = filtered.filter(p => !p.isUserCreated);
    } else if (promptSourceFilter === 'custom') {
      filtered = filtered.filter(p => p.isUserCreated === true);
    }

    // Filter by search term (now includes tags)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.content.toLowerCase().includes(term) ||
        p.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Sort filtered results
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'popular') {
        return (b.likes || 0) - (a.likes || 0);
      } else if (sortBy === 'latest') {
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      } else if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return filtered;
  }, [allPrompts, selectedCategory, selectedDifficulty, selectedStyle, showPremiumOnly, promptSourceFilter, searchTerm, showFavorites, sortBy]);

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

  const handleAddPrompt = async (prompt: Omit<BananaPrompt, 'id' | 'likes' | 'copyCount' | 'isFavorite' | 'createdAt' | 'isUserCreated'>) => {
    try {
      const newPrompt = await PromptsService.addPrompt(prompt);
      setUserPrompts(prev => [...prev, newPrompt]);
      showToastMessage('Prompt added successfully!', 'success');
    } catch (error) {
      showToastMessage('Failed to add prompt', 'error');
    }
  };

  const handleUpdatePrompt = async (id: string, updates: Partial<BananaPrompt>) => {
    try {
      await PromptsService.updatePrompt(id, updates);
      setUserPrompts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      showToastMessage('Prompt updated!', 'success');
    } catch (error) {
      showToastMessage('Failed to update prompt', 'error');
    }
  };

  const handleDeletePrompt = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;
    try {
      await PromptsService.deletePrompt(id);
      setUserPrompts(prev => prev.filter(p => p.id !== id));
      showToastMessage('Prompt deleted', 'info');
    } catch (error) {
      showToastMessage('Failed to delete prompt', 'error');
    }
  };

  const handleEditPrompt = (prompt: BananaPrompt) => {
    setEditingPrompt(prompt);
    setIsPromptEditorOpen(true);
  };

  const handleSavePrompt = async (promptData: Omit<BananaPrompt, 'id' | 'likes' | 'copyCount' | 'isFavorite' | 'createdAt' | 'isUserCreated'>) => {
    if (editingPrompt) {
      await handleUpdatePrompt(editingPrompt.id, promptData);
      setEditingPrompt(null);
    } else {
      await handleAddPrompt(promptData);
    }
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedDifficulty(null);
    setSelectedStyle(null);
    setShowPremiumOnly(false);
    setPromptSourceFilter('all');
    setSearchTerm('');
    setShowFavorites(false);
    setSortBy('popular');
  };

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-amber-50 border-b-2 border-brand-black">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BananaIcon />
              <h1 className="font-display text-2xl font-bold text-brand-black">NanoBanana</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setEditingPrompt(null); setIsPromptEditorOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-brand-black text-white rounded-lg hover:bg-slate-800 transition-all font-bold text-sm"
                title="Add Custom Prompt"
              >
                <Plus size={16} />
                Add Prompt
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-lg border-2 border-brand-black bg-white hover:bg-brand-yellow transition-all"
                aria-label="Open settings"
              >
                <Settings size={18} />
              </button>
            </div>
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

          {/* Category Filters */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 mb-3">
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
          </div>

          {/* Advanced Filters */}
          <div className="flex items-center gap-3 flex-wrap pb-2">
            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty || ''}
              onChange={(e) => setSelectedDifficulty(e.target.value || null)}
              className="px-3 py-2 rounded-lg border-2 border-brand-black text-sm font-bold bg-white hover:bg-brand-yellow/20 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            >
              <option value="">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            {/* Style Filter */}
            <select
              value={selectedStyle || ''}
              onChange={(e) => setSelectedStyle(e.target.value || null)}
              className="px-3 py-2 rounded-lg border-2 border-brand-black text-sm font-bold bg-white hover:bg-brand-yellow/20 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            >
              <option value="">All Styles</option>
              <option value="Professional">Professional</option>
              <option value="Creative">Creative</option>
              <option value="Realistic">Realistic</option>
              <option value="Cinematic">Cinematic</option>
              <option value="Abstract">Abstract</option>
              <option value="Anime">Anime</option>
              <option value="Minimalist">Minimalist</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-lg border-2 border-brand-black text-sm font-bold bg-white hover:bg-brand-yellow/20 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            >
              <option value="popular">Most Popular</option>
              <option value="latest">Latest</option>
              <option value="alphabetical">A-Z</option>
            </select>

            {/* Source Filter */}
            <select
              value={promptSourceFilter}
              onChange={(e) => setPromptSourceFilter(e.target.value as any)}
              className="px-3 py-2 rounded-lg border-2 border-brand-black text-sm font-bold bg-white hover:bg-brand-yellow/20 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            >
              <option value="all">All Prompts</option>
              <option value="official">Official Only</option>
              <option value="custom">My Custom</option>
            </select>

            {/* Premium Only */}
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-brand-black text-sm font-bold bg-white hover:bg-brand-yellow/20 transition-all cursor-pointer">
              <input
                type="checkbox"
                checked={showPremiumOnly}
                onChange={(e) => setShowPremiumOnly(e.target.checked)}
                className="w-4 h-4 rounded border-2 border-brand-black accent-yellow-400"
              />
              <Sparkles size={14} className="text-yellow-600" />
              Premium Only
            </label>

            {/* Clear Filters Button */}
            {(selectedCategory || selectedDifficulty || selectedStyle || showPremiumOnly || promptSourceFilter !== 'all' || showFavorites || searchTerm) && (
              <button
                onClick={clearFilters}
                className="ml-auto px-3 py-2 text-xs font-bold text-slate-600 hover:text-brand-black border-2 border-slate-300 rounded-lg hover:border-brand-black transition-all"
              >
                <X size={14} className="inline mr-1" />
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
                onEdit={handleEditPrompt}
                onDelete={handleDeletePrompt}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer stats */}
      <footer className="px-6 py-4 border-t-2 border-brand-black bg-white sticky bottom-0">
        <div className="flex justify-between items-center text-sm text-slate-600 font-medium flex-wrap gap-3">
          <span className="flex items-center gap-2">
            <span className="font-bold text-brand-black">{filteredPrompts.length}</span> 
            / {allPrompts.length} prompts
          </span>
          <span className="flex items-center gap-2">
            <Shield size={14} className="text-blue-600" />
            <span className="font-bold text-brand-black">{builtInPrompts.length}</span> official
          </span>
          <span className="flex items-center gap-2">
            <Plus size={14} className="text-green-600" />
            <span className="font-bold text-brand-black">{userPrompts.length}</span> custom
          </span>
          <span className="flex items-center gap-2">
            <Heart size={14} className="text-red-500" />
            <span className="font-bold text-brand-black">{favorites.length}</span> favorites
          </span>
          {showPremiumOnly && (
            <span className="flex items-center gap-1 text-yellow-700">
              <Sparkles size={14} />
              Premium filter active
            </span>
          )}
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSave={handleSaveApiKey}
        userPromptsCount={userPrompts.length}
        onExport={PromptsService.exportPrompts}
        onImport={async (jsonData: string) => {
          const count = await PromptsService.importPrompts(jsonData);
          const loaded = await PromptsService.getUserPrompts();
          setUserPrompts(loaded);
          return count;
        }}
      />

      {/* Prompt Editor Modal */}
      <PromptEditorModal
        isOpen={isPromptEditorOpen}
        prompt={editingPrompt}
        onSave={handleSavePrompt}
        onClose={() => {
          setIsPromptEditorOpen(false);
          setEditingPrompt(null);
        }}
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
