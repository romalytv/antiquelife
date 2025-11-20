import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
      vue({
          template: {
              compilerOptions: {
                  // Кажемо Vue ігнорувати всі теги, що починаються на "behold-"
                  isCustomElement: (tag) => tag.startsWith('behold-')
              }
          }
      }),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
