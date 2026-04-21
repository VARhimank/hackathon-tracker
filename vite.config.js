import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Force NODE_ENV=development so Rolldown's dep optimizer picks React's dev builds
const forceDevEnv = {
  name: 'force-dev-env',
  config() {
    process.env.NODE_ENV = 'development'
  },
}

export default defineConfig({
  plugins: [forceDevEnv, react(), tailwindcss()],
})
