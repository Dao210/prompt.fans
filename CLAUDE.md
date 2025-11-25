# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

prompt.fans is a Chrome extension that serves as an AI prompt manager for ChatGPT, Claude, and Gemini. Built with React 19, TypeScript, and Vite, it provides a side-panel interface for managing and injecting prompts into AI tools.



## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production (TypeScript compilation + Vite build)
npm run build

# Preview built extension
npm run preview
```

## Architecture
### important 
this is chrome extension。采用chrome插件最佳架构和技术方案。

### Chrome Extension Structure
- **Manifest V3** with side panel API
- **Background Service Worker**: `background.js` (Chrome extension entry point)
- **Side Panel UI**: `index.html` → `index.tsx` (React application)
- **Permissions**: `sidePanel`, `storage`, `activeTab`, `scripting`, `<all_urls>`

### Key Components
- **BananaPrompt**: Core data model for prompts with categories (Coding, Writing, Art, Marketing, Academic, Productivity) and tools (ChatGPT, Midjourney, Claude, Gemini, Stable Diffusion)
- **EnvAdapter**: Hybrid environment handler supporting both Chrome extension (chrome.storage) and browser development (localStorage)
- **StorageService**: Manages favorites and API key storage
- **PromptCard**: Individual prompt display with copy and "Magic Fill" injection
- **SettingsModal**: API key configuration interface

### Environment Configuration
- **Development**: Uses localStorage fallback when Chrome APIs unavailable
- **Production**: Uses chrome.storage.sync for cross-device synchronization
- **API Key**: Requires `GEMINI_API_KEY` in `.env.local` file

### Critical Development Notes
1. **Main App Component**: The index.tsx file appears incomplete - missing React root rendering code
2. **No Testing Framework**: Project lacks Jest, Vitest, or any testing setup
3. **Content Script Injection**: "Magic Fill" feature injects prompts into active text areas on web pages
4. **Hybrid Environment**: Code must handle both extension and browser contexts gracefully

### Code Style Requirements
- **TypeScript**: Strict mode enabled, target ES2022
- **React**: Version 19 with modern JSX transform
- **Styling**: Tailwind CSS with custom brand colors and neomorphic design
- **Naming**: Follow existing patterns - interfaces use PascalCase, functions use camelCase

## Extension Development Workflow

1. **Setup**: Ensure Chrome extension development environment
2. **Load Extension**: Load unpacked extension from `dist/` folder after build
3. **Test Features**: Verify side panel opens, prompts load, and injection works
4. **Debug**: Use Chrome DevTools for extension debugging
5. **Storage**: Test both chrome.storage and localStorage fallback

## Key Dependencies
- React 19 & React DOM
- Google GenAI SDK
- Lucide React icons
- Vite with React plugin
- Tailwind CSS with PostCSS