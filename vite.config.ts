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
      tsconfigPath: './tsconfig.app.json',
      rollupTypes: true,
      include: ['src'],
      insertTypesEntry: true 
    })
  ],
  build: {
    sourcemap: true,
    emptyOutDir: true,
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
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'style.css';
          }
          return assetInfo.name as string;
        },
      },
    },
  },
});