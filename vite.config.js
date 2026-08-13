import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

/** Host del API, del que salen tanto los datos como las imágenes del catálogo. */
const apiOrigin = (process.env.VITE_API_BASE_URL || 'https://itx-frontend-test.onrender.com')
  .replace(/\/+$/, '')
  .replace(/^(https?:\/\/[^/]+).*$/, '$1');

/**
 * Política de seguridad de contenidos.
 *
 * Es defensa en profundidad: hoy no hay ningún punto de inyección —no se usa
 * `dangerouslySetInnerHTML` ni `eval`, y React escapa todo el texto—, pero si
 * algún día entrara uno, sin CSP no habría nada que lo contuviese.
 *
 * `style-src` necesita `'unsafe-inline'` porque `ErrorBoundary` lleva sus
 * estilos en el atributo `style`, deliberadamente, para poder pintarse aunque
 * la hoja de estilos no haya llegado a cargar.
 *
 * Lo que no cabe aquí: `frame-ancestors` (clickjacking) y HSTS solo surten
 * efecto como cabecera HTTP real, así que hay que configurarlos en el hosting.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' ${apiOrigin}`,
  `connect-src 'self' ${apiOrigin}`,
  "font-src 'self'",
  // La aplicación no embebe plugins, ni iframes, ni envía formularios fuera.
  "object-src 'none'",
  "frame-src 'none'",
  "form-action 'self'",
  // Impide que una inyección reescriba la base de las URL relativas.
  "base-uri 'self'",
].join('; ');

/**
 * Inyecta la CSP en el HTML del build.
 *
 * Solo en `build`: en desarrollo, Vite sirve el cliente de HMR por WebSocket e
 * inyecta código de React Refresh, que una política así bloquearía.
 *
 * Va al principio del `<head>` para que aplique a todo lo que venga detrás. Eso
 * empuja al `<meta charset>` unos cientos de bytes hacia abajo; sigue holgado
 * dentro del primer kilobyte que exige la especificación, pero conviene tenerlo
 * presente si la política crece mucho.
 */
const cspPlugin = {
  name: 'csp-en-produccion',
  apply: 'build',
  transformIndexHtml() {
    return [
      {
        tag: 'meta',
        attrs: { 'http-equiv': 'Content-Security-Policy', content: contentSecurityPolicy },
        injectTo: 'head-prepend',
      },
      {
        // El criterio de búsqueda viaja en la URL (`?q=`), así que conviene no
        // filtrarlo por `Referer` a los hosts desde los que se cargan imágenes.
        tag: 'meta',
        attrs: { name: 'referrer', content: 'strict-origin-when-cross-origin' },
        injectTo: 'head-prepend',
      },
    ];
  },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cspPlugin],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 4173,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/test/**', 'src/main.jsx', 'src/**/*.test.{js,jsx}'],
    },
  },
});
