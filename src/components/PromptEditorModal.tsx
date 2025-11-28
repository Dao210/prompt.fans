import React, { useState, useEffect } from 'react';
import { X, Save, Tag } from 'lucide-react';
import type { BananaPrompt } from '../types';

interface PromptEditorModalProps {
  isOpen: boolean;
  prompt?: BananaPrompt | null;
  onSave: (prompt: Omit<BananaPrompt, 'id' | 'likes' | 'copyCount' | 'isFavorite' | 'createdAt' | 'isUserCreated'>) => void;
  onClose: () => void;
}

export const PromptEditorModal: React.FC<PromptEditorModalProps> = ({ isOpen, prompt, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    tags: [] as string[],
    category: 'Coding' as BananaPrompt['category'],
    tool: 'ChatGPT' as BananaPrompt['tool'],
    difficulty: 'Beginner' as BananaPrompt['difficulty'],
    style: 'Professional' as BananaPrompt['style'],
    mood: undefined as BananaPrompt['mood'],
    author: '',
    isPremium: false
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (prompt) {
      setFormData({
        title: prompt.title,
        description: prompt.description,
        content: prompt.content,
        tags: prompt.tags || [],
        category: prompt.category,
        tool: prompt.tool,
        difficulty: prompt.difficulty || 'Beginner',
        style: prompt.style || 'Professional',
        mood: prompt.mood,
        author: prompt.author || '',
        isPremium: prompt.isPremium || false
      });
    } else {
      // Reset form
      setFormData({
        title: '',
        description: '',
        content: '',
        tags: [],
        category: 'Coding',
        tool: 'ChatGPT',
        difficulty: 'Beginner',
        style: 'Professional',
        mood: undefined,
        author: '',
        isPremium: false
      });
    }
  }, [prompt, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Title and content are required');
      return;
    }
    onSave(formData);
    onClose();
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-black/40 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-2xl border-2 border-brand-black shadow-neo rounded-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-brand-yellow p-4 border-b-2 border-brand-black flex justify-between items-center">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Save size={20} /> {prompt ? 'Edit Prompt' : 'Add New Prompt'}
          </h2>
          <button onClick={onClose} className="hover:bg-brand-black hover:text-white p-1 rounded transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., React Performance Optimizer"
              className="w-full px-3 py-2 border-2 border-brand-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold mb-2">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Short description (1-2 sentences)"
              className="w-full px-3 py-2 border-2 border-brand-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-bold mb-2">Prompt Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Full prompt text..."
              rows={6}
              className="w-full px-3 py-2 border-2 border-brand-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow font-mono text-sm"
              required
            />
            <p className="text-xs text-slate-500 mt-1">{formData.content.length} characters</p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-bold mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add a tag and press Enter"
                className="flex-1 px-3 py-2 border-2 border-brand-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-brand-black text-white rounded-lg hover:bg-slate-800"
              >
                <Tag size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-brand-yellow rounded border-2 border-brand-black text-sm font-bold flex items-center gap-1">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-red-600">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Two columns for selects */}
          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-bold mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                className="w-full px-3 py-2 border-2 border-brand-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                required
              >
                <option value="Coding">Coding</option>
                <option value="Writing">Writing</option>
                <option value="Art">Art</option>
                <option value="Marketing">Marketing</option>
                <option value="Academic">Academic</option>
                <option value="Productivity">Productivity</option>
              </select>
            </div>

            {/* Tool */}
            <div>
              <label className="block text-sm font-bold mb-2">Tool *</label>
              <select
                value={formData.tool}
                onChange={(e) => setFormData(prev => ({ ...prev, tool: e.target.value as any }))}
                className="w-full px-3 py-2 border-2 border-brand-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                required
              >
                <option value="ChatGPT">ChatGPT</option>
                <option value="Claude">Claude</option>
                <option value="Gemini">Gemini</option>
                <option value="Midjourney">Midjourney</option>
                <option value="Stable Diffusion">Stable Diffusion</option>
                <option value="Any">Any</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-bold mb-2">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                className="w-full px-3 py-2 border-2 border-brand-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Style */}
            <div>
              <label className="block text-sm font-bold mb-2">Style</label>
              <select
                value={formData.style}
                onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value as any }))}
                className="w-full px-3 py-2 border-2 border-brand-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              >
                <option value="Professional">Professional</option>
                <option value="Creative">Creative</option>
                <option value="Realistic">Realistic</option>
                <option value="Cinematic">Cinematic</option>
                <option value="Abstract">Abstract</option>
                <option value="Anime">Anime</option>
                <option value="Minimalist">Minimalist</option>
              </select>
            </div>
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-bold mb-2">Author (optional)</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              placeholder="Your name or username"
              className="w-full px-3 py-2 border-2 border-brand-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>

          {/* Premium checkbox */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPremium}
                onChange={(e) => setFormData(prev => ({ ...prev, isPremium: e.target.checked }))}
                className="w-4 h-4 rounded border-2 border-brand-black accent-yellow-400"
              />
              <span className="text-sm font-bold">Mark as Premium</span>
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t-2 border-brand-black bg-brand-gray flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border-2 border-brand-black bg-white rounded-lg font-bold hover:bg-brand-yellow transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-brand-black text-white rounded-lg font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            <Save size={18} />
            {prompt ? 'Update' : 'Save'} Prompt
          </button>
        </div>
      </div>
    </div>
  );
};
