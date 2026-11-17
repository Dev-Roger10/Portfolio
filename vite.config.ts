import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // En GitHub Pages el sitio no vive en la raíz del dominio, sino en
  // https://dev-roger10.github.io/Portfolio/, así que en el build los
  // assets tienen que apuntar ahí. En dev lo dejo en "/" para que el
  // servidor local siga funcionando normal.
  base: command === 'build' ? '/Portfolio/' : '/',
}))
