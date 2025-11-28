// Hybrid Adapter: Handles both Browser (Dev) and Chrome Extension (Prod) environments
export const envAdapter = {
    isExtension: () => typeof chrome !== 'undefined' && !!chrome.storage,
    getStorage: async (key, defaultVal) => {
        if (envAdapter.isExtension()) {
            return new Promise((resolve) => {
                chrome.storage.sync.get([key], (result) => {
                    resolve(result[key] !== undefined ? result[key] : defaultVal);
                });
            });
        }
        else {
            // LocalStorage fallback
            const val = localStorage.getItem(key);
            return Promise.resolve(val ? JSON.parse(val) : defaultVal);
        }
    },
    setStorage: async (key, value) => {
        if (envAdapter.isExtension()) {
            return new Promise((resolve) => {
                chrome.storage.sync.set({ [key]: value }, () => resolve());
            });
        }
        else {
            localStorage.setItem(key, JSON.stringify(value));
            return Promise.resolve();
        }
    },
    injectScript: async (text) => {
        if (envAdapter.isExtension()) {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab.id) {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: (code) => {
                        // Try to find the active element or specific textareas
                        const el = document.activeElement;
                        if (el && (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT')) {
                            const start = el.selectionStart;
                            const end = el.selectionEnd;
                            const text = el.value;
                            const before = text.substring(0, start || 0);
                            const after = text.substring(end || 0);
                            el.value = before + code + after;
                            el.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                        else {
                            alert('NanoBanana: Please click inside a text input field first!');
                        }
                    },
                    args: [text]
                });
            }
        }
        else {
            console.log("Mock Injection:", text);
            alert(`[Dev Mode] Would inject: "${text.substring(0, 30)}..."`);
        }
    }
};
