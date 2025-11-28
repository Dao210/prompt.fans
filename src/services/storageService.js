import { envAdapter } from './envAdapter';
export const StorageService = {
    getFavorites: async () => {
        return await envAdapter.getStorage('banana_favorites', []);
    },
    toggleFavorite: async (id) => {
        const favs = await StorageService.getFavorites();
        const newFavs = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
        await envAdapter.setStorage('banana_favorites', newFavs);
        return newFavs;
    },
    getApiKey: async () => {
        return await envAdapter.getStorage('banana_api_key', '');
    },
    setApiKey: async (key) => {
        await envAdapter.setStorage('banana_api_key', key);
    },
};
