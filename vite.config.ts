
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'build',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-dropdown-menu', 
            '@radix-ui/react-tooltip', 
            '@radix-ui/react-select', 
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-popover',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-tabs',
            '@radix-ui/react-switch',
            '@radix-ui/react-separator',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-slider',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-slot',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-menubar',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-aspect-ratio'
          ],
          charts: ['recharts'],
          forms: ['react-hook-form', 'react-day-picker'],
          supabase: ['@supabase/supabase-js'],
          icons: ['lucide-react'],
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority'],
          components: ['cmdk', 'embla-carousel-react', 'vaul', 'sonner', 'input-otp', 'next-themes', 'react-resizable-panels'],
        },
      },
    },
    minify: 'esbuild',
  },
  server: {
    port: 3000,
    open: true,
  },
});