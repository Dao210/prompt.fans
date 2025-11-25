import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Settings, X } from 'lucide-react';
export const SettingsModal = ({ isOpen, onClose, apiKey, onSave }) => {
    const [key, setKey] = useState(apiKey);
    if (!isOpen)
        return null;
    const handleSave = () => {
        onSave(key);
        onClose();
    };
    return (_jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center bg-brand-black/40 backdrop-blur-sm p-4 animate-fade-in", children: _jsxs("div", { className: "bg-white w-full max-w-md border-2 border-brand-black shadow-neo rounded-2xl overflow-hidden transform transition-all", children: [_jsxs("div", { className: "bg-brand-yellow p-4 border-b-2 border-brand-black flex justify-between items-center", children: [_jsxs("h2", { className: "font-display text-xl font-bold flex items-center gap-2", children: [_jsx(Settings, { size: 20 }), " Settings"] }), _jsx("button", { onClick: onClose, className: "hover:bg-brand-black hover:text-white p-1 rounded transition-colors", children: _jsx(X, { size: 20 }) })] }), _jsx("div", { className: "p-6 space-y-4", children: _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-bold mb-2", children: "Gemini API Key" }), _jsx("input", { type: "password", value: key, onChange: (e) => setKey(e.target.value), placeholder: "Enter your Gemini API key", className: "w-full px-3 py-2 border-2 border-brand-black rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow" }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: "Your API key is stored securely in Chrome storage. Never commit it to version control." })] }) }), _jsxs("div", { className: "p-4 border-t-2 border-brand-black bg-brand-gray flex gap-2", children: [_jsx("button", { onClick: onClose, className: "flex-1 px-4 py-2 border-2 border-brand-black bg-white rounded-lg font-bold hover:bg-brand-yellow transition-all", children: "Cancel" }), _jsx("button", { onClick: handleSave, className: "flex-1 px-4 py-2 bg-brand-black text-white rounded-lg font-bold hover:bg-slate-800 transition-all", children: "Save" })] })] }) }));
};
