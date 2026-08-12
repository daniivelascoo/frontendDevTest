import { createContext, useContext } from 'react';

/**
 * @typedef {object} CartContextValue
 * @property {number} count Artículos en la cesta.
 * @property {(selection: { id: string, colorCode: number, storageCode: number }) => Promise<number>} addItem
 * @property {() => void} reset
 * @property {'idle' | 'adding' | 'error'} status
 * @property {Error | null} error
 */

/** @type {import('react').Context<CartContextValue | null>} */
export const CartContext = createContext(null);

/**
 * Acceso a la cesta.
 *
 * Falla de forma explícita fuera del provider: un contador silenciosamente a
 * cero sería mucho más difícil de diagnosticar que un error en el montaje.
 *
 * @returns {CartContextValue}
 */
export function useCart() {
  const context = useContext(CartContext);

  if (context === null) {
    throw new Error('useCart debe usarse dentro de un <CartProvider>.');
  }

  return context;
}
