import { createContext, useContext } from 'react';

/**
 * @typedef {object} CartContextValue
 * @property {number} count Items in the cart.
 * @property {(selection: { id: string, colorCode: number, storageCode: number }) => Promise<number>} addItem
 * @property {() => void} reset
 * @property {'idle' | 'adding' | 'error'} status
 * @property {Error | null} error
 */

/** @type {import('react').Context<CartContextValue | null>} */
export const CartContext = createContext(null);

/**
 * Access to the cart.
 *
 * It fails loudly outside the provider: a counter silently stuck at zero would
 * be far harder to diagnose than an error at mount time.
 *
 * @returns {CartContextValue}
 */
export function useCart() {
  const context = useContext(CartContext);

  if (context === null) {
    throw new Error('useCart must be used inside a <CartProvider>.');
  }

  return context;
}
