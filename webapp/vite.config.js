import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/', // Use '/' for Vercel, '/finance-tracker/' for GitHub Pages
})
// Trigger Vercel rebuild
