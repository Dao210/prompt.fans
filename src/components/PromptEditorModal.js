import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { X, Save, Tag } from 'lucide-react';
export const PromptEditorModal = ({ isOpen, prompt, onSave, onClose }) => {
    const [formData, setFormData] = useState({
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
        }
        else {
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
    const handleSubmit = (e) => {
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
    const handleRemoveTag = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }));
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center bg-brand-black/40 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto", children: _jsxs("div", { className: "bg-white w-full max-w-2xl border-2 border-brand-black shadow-neo rounded-2xl overflow-hidden my-8", children: [_jsxs("div", { className: "bg-brand-yellow p-4 border-b-2 border-brand-black flex justify-between items-center", children: [_jsxs("h2", { className: "font-display text-xl font-bold flex items-center gap-2", children: [_jsx(Save, { size: 20 }), " ", prompt ? 'Edit Prompt' : 'Add New Prompt'] }), _jsx("button", { onClick: onClose, className: "hover:bg-brand-black hover:text-white p-1 rounded transition-colors", children: _jsx(X, { size: 20 }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-4 max-h-[70vh] overflow-y-auto", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-bold mb-2", children: "Title *" }), _jsx("input", { type: "text", value: formData.title, onChange: (e) => setFormData(prev => ({ ...prev, title: e.target.value })), placeholder: "e.g., React Performance Optimizer", className: "w-full px-3 py-2 border-2 border-brand-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-bold mb-2", children: "Description" }), _jsx("input", { type: "text", value: formData.description, onChange: (e) => setFormData(prev => ({ ...prev, description: e.target.value })), placeholder: "Short description (1-2 sentences)", className: "w-full px-3 py-2 border-2 border-brand-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-bold mb-2", children: "Prompt Content *" }), _jsx("textarea", { value: formData.content, onChange: (e) => setFormData(prev => ({ ...prev, content: e.target.value })), placeholder: "Full prompt text...", rows: 6, className: "w-full px-3 py-2 border-2 border-brand-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow font-mono text-sm", required: true }), _jsxs("p", { className: "text-xs text-slate-500 mt-1", children: [formData.content.length, " characters"] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-bold mb-2", children: "Tags" }), _jsxs("div", { className: "flex gap-2 mb-2", children: [_jsx("input", { type: "text", value: tagInput, onChange: (e) => setTagInput(e.target.value), onKeyDown: (e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag()), placeholder: "Add a tag and press Enter", className: "flex-1 px-3 py-2 border-2 border-brand-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow" }), _jsx("button", { type: "button", onClick: handleAddTag, className: "px-4 py-2 bg-brand-black text-white rounded-lg hover:bg-slate-800", children: _jsx(Tag, { size: 16 }) })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: formData.tags.map(tag => (_jsxs("span", { className: "px-2 py-1 bg-brand-yellow rounded border-2 border-brand-black text-sm font-bold flex items-center gap-1", children: [tag, _jsx("button", { type: "button", onClick: () => handleRemoveTag(tag), className: "hover:text-red-600", children: _jsx(X, { size: 12 }) })] }, tag))) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-bold mb-2", children: "Category *" }), _jsxs("select", { value: formData.category, onChange: (e) => setFormData(prev => ({ ...prev, category: e.target.value })), className: "w-full px-3 py-2 border-2 border-brand-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow", required: true, children: [_jsx("option", { value: "Coding", children: "Coding" }), _jsx("option", { value: "Writing", children: "Writing" }), _jsx("option", { value: "Art", children: "Art" }), _jsx("option", { value: "Marketing", children: "Marketing" }), _jsx("option", { value: "Academic", children: "Academic" }), _jsx("option", { value: "Productivity", children: "Productivity" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-bold mb-2", children: "Tool *" }), _jsxs("select", { value: formData.tool, onChange: (e) => setFormData(prev => ({ ...prev, tool: e.target.value })), className: "w-full px-3 py-2 border-2 border-brand-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow", required: true, children: [_jsx("option", { value: "ChatGPT", children: "ChatGPT" }), _jsx("option", { value: "Claude", children: "Claude" }), _jsx("option", { value: "Gemini", children: "Gemini" }), _jsx("option", { value: "Midjourney", children: "Midjourney" }), _jsx("option", { value: "Stable Diffusion", children: "Stable Diffusion" }), _jsx("option", { value: "Any", children: "Any" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-bold mb-2", children: "Difficulty" }), _jsxs("select", { value: formData.difficulty, onChange: (e) => setFormData(prev => ({ ...prev, difficulty: e.target.value })), className: "w-full px-3 py-2 border-2 border-brand-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow", children: [_jsx("option", { value: "Beginner", children: "Beginner" }), _jsx("option", { value: "Intermediate", children: "Intermediate" }), _jsx("option", { value: "Advanced", children: "Advanced" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-bold mb-2", children: "Style" }), _jsxs("select", { value: formData.style, onChange: (e) => setFormData(prev => ({ ...prev, style: e.target.value })), className: "w-full px-3 py-2 border-2 border-brand-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow", children: [_jsx("option", { value: "Professional", children: "Professional" }), _jsx("option", { value: "Creative", children: "Creative" }), _jsx("option", { value: "Realistic", children: "Realistic" }), _jsx("option", { value: "Cinematic", children: "Cinematic" }), _jsx("option", { value: "Abstract", children: "Abstract" }), _jsx("option", { value: "Anime", children: "Anime" }), _jsx("option", { value: "Minimalist", children: "Minimalist" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-bold mb-2", children: "Author (optional)" }), _jsx("input", { type: "text", value: formData.author, onChange: (e) => setFormData(prev => ({ ...prev, author: e.target.value })), placeholder: "Your name or username", className: "w-full px-3 py-2 border-2 border-brand-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow" })] }), _jsx("div", { children: _jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: formData.isPremium, onChange: (e) => setFormData(prev => ({ ...prev, isPremium: e.target.checked })), className: "w-4 h-4 rounded border-2 border-brand-black accent-yellow-400" }), _jsx("span", { className: "text-sm font-bold", children: "Mark as Premium" })] }) })] }), _jsxs("div", { className: "p-4 border-t-2 border-brand-black bg-brand-gray flex gap-2", children: [_jsx("button", { type: "button", onClick: onClose, className: "flex-1 px-4 py-2 border-2 border-brand-black bg-white rounded-lg font-bold hover:bg-brand-yellow transition-all", children: "Cancel" }), _jsxs("button", { onClick: handleSubmit, className: "flex-1 px-4 py-2 bg-brand-black text-white rounded-lg font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2", children: [_jsx(Save, { size: 18 }), prompt ? 'Update' : 'Save', " Prompt"] })] })] }) }));
};
