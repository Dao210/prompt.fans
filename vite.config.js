import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        {
            name: 'copy-extension-files',
            closeBundle() {
                // Copy manifest.json
                copyFileSync('manifest.json', 'dist/manifest.json');
                // Copy icons directory
                if (!existsSync('dist/icons')) {
                    mkdirSync('dist/icons', { recursive: true });
                }
                const iconSizes = [16, 32, 48, 128];
                iconSizes.forEach(size => {
                    const iconFile = `icons/icon-${size}.png`;
                    if (existsSync(iconFile)) {
                        copyFileSync(iconFile, `dist/icons/icon-${size}.png`);
                    }
                });
                console.log('✅ Copied manifest and icons to dist/');
            }
        }
    ],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                // The entry point for the side panel UI
                index: resolve(__dirname, 'index.html'),
                // The background script (Service Worker)
                background: resolve(__dirname, 'background.js'),
            },
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: 'assets/[name].[hash].js',
                assetFileNames: 'assets/[name].[hash].[ext]'
            }
        }
    }
});
