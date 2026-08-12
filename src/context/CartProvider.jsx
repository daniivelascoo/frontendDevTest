import { useCallback, useEffect, useMemo, useState } from 'react';
import { addToCart } from '../api/products.js';
import { resolveStorage } from '../lib/storage.js';
import { CartContext } from './cartContext.js';

/**
 * Clave de persistencia del contador de la cesta.
 *
 * Vive fuera del namespace de la caché de datos (`itx-cache:`) a propósito: la
 * caché caduca a la hora y se vacía al reintentar, mientras que la cesta del
 * usuario debe sobrevivir a ambas cosas.
 */
export const CART_STORAGE_KEY = 'itx-cart-count';

/**
 * Lee el contador persistido.
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
 * Provee el estado de la cesta a toda la aplicación.
 *
 * El enunciado exige que el número de artículos se muestre en la cabecera en
 * cualquier vista y que el dato persista, de modo que la fuente de verdad es
 * la respuesta del `POST /api/cart` y el espejo local es `localStorage`.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 * @param {Storage} [props.storage] Inyectable en tests.
 */
export function CartProvider({ children, storage }) {
  const resolvedStorage = useMemo(() => resolveStorage(storage), [storage]);

  const [count, setCount] = useState(() => readPersistedCount(resolvedStorage));
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  // Espeja el contador en el storage en cuanto cambia.
  useEffect(() => {
    try {
      resolvedStorage.setItem(CART_STORAGE_KEY, JSON.stringify(count));
    } catch {
      /* la cesta sigue siendo usable en memoria durante esta sesión */
    }
  }, [count, resolvedStorage]);

  // Mantiene el contador sincronizado entre pestañas abiertas.
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
   * Añade un producto a la cesta y adopta como contador el valor que devuelve
   * el API, que es la única fuente autorizada.
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
