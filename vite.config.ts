import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'), 
      name: 'IdeaToTaskModule',
      fileName: (format) => `idea-to-task.${format}.js`,
    },
    
    rollupOptions: {
      external: [
        'react', 
        'react-dom', 
        '@xyflow/react',
        're-resizable', 
        'nanoid'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@xyflow/react': 'ReactFlow', 
          're-resizable': 'Resizable',
          nanoid: 'nanoid',
        },
      },
    },
  },
});