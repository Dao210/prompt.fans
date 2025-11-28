import { envAdapter } from './envAdapter';
import type { BananaPrompt } from '../types';

export const PromptsService = {
  // 获取用户自定义 prompts
  getUserPrompts: async (): Promise<BananaPrompt[]> => {
    return await envAdapter.getStorage('user_prompts', []);
  },

  // 添加新 prompt
  addPrompt: async (prompt: Omit<BananaPrompt, 'id' | 'likes' | 'copyCount' | 'isFavorite' | 'createdAt' | 'isUserCreated'>): Promise<BananaPrompt> => {
    const prompts = await PromptsService.getUserPrompts();
    const newPrompt: BananaPrompt = {
      ...prompt,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      likes: 0,
      copyCount: 0,
      isFavorite: false,
      isUserCreated: true
    };
    await envAdapter.setStorage('user_prompts', [...prompts, newPrompt]);
    return newPrompt;
  },

  // 更新 prompt
  updatePrompt: async (id: string, updates: Partial<BananaPrompt>): Promise<void> => {
    const prompts = await PromptsService.getUserPrompts();
    const updated = prompts.map(p => p.id === id ? { ...p, ...updates } : p);
    await envAdapter.setStorage('user_prompts', updated);
  },

  // 删除 prompt
  deletePrompt: async (id: string): Promise<void> => {
    const prompts = await PromptsService.getUserPrompts();
    await envAdapter.setStorage('user_prompts', prompts.filter(p => p.id !== id));
  },

  // 导出所有用户 prompts（JSON）
  exportPrompts: async (): Promise<string> => {
    const prompts = await PromptsService.getUserPrompts();
    return JSON.stringify(prompts, null, 2);
  },

  // 导入 prompts（JSON）
  importPrompts: async (jsonData: string): Promise<number> => {
    try {
      const imported = JSON.parse(jsonData) as BananaPrompt[];
      if (!Array.isArray(imported)) {
        throw new Error('Invalid format: expected array');
      }
      
      const existing = await PromptsService.getUserPrompts();
      
      // 去重合并（按 ID）
      const merged = [...existing, ...imported].reduce((acc, curr) => {
        if (!acc.find(p => p.id === curr.id)) {
          acc.push({ ...curr, isUserCreated: true });
        }
        return acc;
      }, [] as BananaPrompt[]);
      
      await envAdapter.setStorage('user_prompts', merged);
      return imported.length;
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  },

  // 检查存储容量（Chrome Storage 限制）
  checkStorageQuota: async (): Promise<{ used: number; warning: boolean }> => {
    if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
      return new Promise((resolve) => {
        chrome.storage.sync.getBytesInUse('user_prompts', (bytes: number) => {
          resolve({
            used: bytes,
            warning: bytes > 90000 // 90KB 警告阈值
          });
        });
      });
    }
    return { used: 0, warning: false };
  },

  // 验证 prompt 数据
  validatePrompt: (data: Partial<BananaPrompt>): boolean => {
    return !!(
      data.title?.trim() &&
      data.content?.trim() &&
      data.category &&
      data.tool
    );
  }
};
