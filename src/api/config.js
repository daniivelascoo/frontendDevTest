/**
 * API client configuration.
 *
 * The values are read from Vite environment variables but have sensible
 * defaults, so that `npm start` works without creating a `.env`.
 */

const env = import.meta.env ?? {};

/** Base domain of the API, without a trailing slash. */
export const API_BASE_URL = (env.VITE_API_BASE_URL || 'https://itx-frontend-test.onrender.com')
  .toString()
  .replace(/\/+$/, '');

/**
 * Per-request timeout.
 *
 * The test API is deployed on a free Render plan that suspends the instance
 * when idle: the first cold start can take tens of seconds, so the margin is
 * deliberately generous.
 */
export const REQUEST_TIMEOUT_MS = 45_000;

export const ENDPOINTS = {
  products: '/api/product',
  product: (id) => `/api/product/${encodeURIComponent(id)}`,
  cart: '/api/cart',
};
