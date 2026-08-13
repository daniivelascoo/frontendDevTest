import { useCallback, useEffect, useMemo, useState } from 'react';
import { addToCart } from '../api/products.js';
import { resolveStorage } from '../lib/storage.js';
import { CartContext } from './cartContext.js';

/**
 * Persistence key for the cart counter.
 *
 * It deliberately lives outside the data cache namespace (`itx-cache:`): the
 * cache expires after an hour and is emptied on retry, whereas the user's cart
 * must survive both.
 */
export const CART_STORAGE_KEY = 'itx-cart-count';

/**
 * Reads the persisted counter.
 *
 * @param {Storage} storage
 * @returns {number}
 */
function readPersistedCount(storage) {
  try {
    const raw = storage.getItem(CART_STORAGE_KEY);
    if (raw === null) return 0;

    const parsed = Number(JSON.parse(raw));
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

/**
 * Provides the cart state to the whole application.
 *
 * The brief requires the item count to be shown in the header on every view and
 * the value to persist, so the source of truth is the `POST /api/cart` response
 * and `localStorage` is the local mirror.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 * @param {Storage} [props.storage] Injectable in tests.
 */
export function CartProvider({ children, storage }) {
  const resolvedStorage = useMemo(() => resolveStorage(storage), [storage]);

  const [count, setCount] = useState(() => readPersistedCount(resolvedStorage));
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  // Mirrors the counter into storage as soon as it changes.
  useEffect(() => {
    try {
      resolvedStorage.setItem(CART_STORAGE_KEY, JSON.stringify(count));
    } catch {
      /* the cart stays usable in memory for this session */
    }
  }, [count, resolvedStorage]);

  // Keeps the counter in sync across open tabs.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleStorage = (event) => {
      if (event.key !== CART_STORAGE_KEY) return;
      setCount(readPersistedCount(resolvedStorage));
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [resolvedStorage]);

  /**
   * Adds a product to the cart and adopts the count returned by the API, which
   * is the only authoritative source.
   */
  const addItem = useCallback(async (selection) => {
    setStatus('adding');
    setError(null);

    try {
      const { count: serverCount } = await addToCart(selection);
      setCount(serverCount);
      setStatus('idle');
      return serverCount;
    } catch (addError) {
      setStatus('error');
      setError(addError);
      throw addError;
    }
  }, []);

  const reset = useCallback(() => {
    setCount(0);
    setStatus('idle');
    setError(null);
  }, []);

  const value = useMemo(
    () => ({ count, addItem, reset, status, error }),
    [count, addItem, reset, status, error]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
