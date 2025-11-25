import { EnvAdapter } from './envAdapter';

export const StorageService = {
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

  setApiKey: async (key: string): Promise<void> => {
    await EnvAdapter.setStorage('banana_api_key', key);
  },
};
