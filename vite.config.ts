// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import tailwindcss from '@tailwindcss/vite';
import dts from 'vite-plugin-dts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({ 
      insertTypesEntry: true,
      include: ['src'],
      exclude: ['src/**/*.test.tsx', 'src/**/*.stories.tsx'] 
    })
  ],
  build: {
    sourcemap: true,
    emptyOutDir: true,
    // Принудительно разделяем CSS (иногда помогает избежать инлайна)
    cssCodeSplit: true, 
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'IdeaToTaskModule',
      fileName: (format) => `idea-to-task.${format}.js`,
      formats: ['es', 'umd'] 
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'reactflow', 
        'react/jsx-runtime'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          reactflow: 'ReactFlow',
        },
        // ИСПРАВЛЕННАЯ ЛОГИКА ИМЕН:
        assetFileNames: (assetInfo) => {
          // Если файл заканчивается на .css, называем его style.css
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'style.css';
          }
          return assetInfo.name as string;
        },
      },
    },
  },
});