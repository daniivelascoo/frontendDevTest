/**
 * Configuración del cliente de API.
 *
 * Los valores se leen de variables de entorno de Vite pero tienen valores por
 * defecto razonables, de modo que `npm start` funcione sin crear un `.env`.
 */

const env = import.meta.env ?? {};

/** Dominio base del API, sin barra final. */
export const API_BASE_URL = (env.VITE_API_BASE_URL || 'https://itx-frontend-test.onrender.com')
  .toString()
  .replace(/\/+$/, '');

/**
 * Timeout por petición.
 *
 * El API de la prueba está desplegado en un plan gratuito de Render que
 * suspende la instancia por inactividad: el primer arranque en frío puede
 * tardar decenas de segundos, así que el margen es deliberadamente amplio.
 */
export const REQUEST_TIMEOUT_MS = 45_000;

export const ENDPOINTS = {
  products: '/api/product',
  product: (id) => `/api/product/${encodeURIComponent(id)}`,
  cart: '/api/cart',
};
