import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Check, Zap, X } from 'lucide-react';
export const Toast = ({ visible, message, type }) => {
    if (!visible)
        return null;
    return (_jsx("div", { className: "fixed bottom-6 left-0 right-0 z-[60] flex justify-center pointer-events-none", children: _jsxs("div", { className: `
        pointer-events-auto flex items-center gap-3 px-6 py-3 rounded-full border-2 border-brand-black shadow-neo font-bold animate-bounce-slight
        ${type === 'error' ? 'bg-red-100 text-red-900' : 'bg-brand-black text-white'}
      `, children: [type === 'success' && _jsx(Check, { size: 18, className: "text-brand-yellow" }), type === 'info' && _jsx(Zap, { size: 18, className: "text-brand-yellow" }), type === 'error' && _jsx(X, { size: 18, className: "text-red-500" }), _jsx("span", { children: message })] }) }));
};
