import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, CART_STORAGE_KEY } from './CartProvider.jsx';
import { useCart } from './cartContext.js';
import { createTestStorage, mockFetch } from '../test/helpers.js';

/**
 * Probe component exposing the cart state.
 *
 * Its button label is in English, unlike the application's: this component is
 * part of the test, not of the product.
 */
function CartProbe() {
  const { count, addItem } = useCart();

  return (
    <div>
      <span data-testid="count">{count}</span>
      <button
        type="button"
        onClick={() => addItem({ id: 'abc', colorCode: 1000, storageCode: 2000 }).catch(() => {})}
      >
        Add
      </button>
    </div>
  );
}

describe('CartProvider', () => {
  it('starts at zero when nothing is persisted', () => {
    render(
      <CartProvider storage={createTestStorage()}>
        <CartProbe />
      </CartProvider>
    );

    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('recovers the persisted counter on mount', () => {
    const storage = createTestStorage();
    storage.setItem(CART_STORAGE_KEY, JSON.stringify(7));

    render(
      <CartProvider storage={storage}>
        <CartProbe />
      </CartProvider>
    );

    expect(screen.getByTestId('count')).toHaveTextContent('7');
  });

  it('adopts the count returned by the API', async () => {
    mockFetch([{ match: '/api/cart', body: { count: 4 } }]);
    const user = userEvent.setup();

    render(
      <CartProvider storage={createTestStorage()}>
        <CartProbe />
      </CartProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('4'));
  });

  it('persists the counter so it survives a reload', async () => {
    mockFetch([{ match: '/api/cart', body: { count: 4 } }]);
    const storage = createTestStorage();
    const user = userEvent.setup();

    const { unmount } = render(
      <CartProvider storage={storage}>
        <CartProbe />
      </CartProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Add' }));
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('4'));

    unmount();

    // A fresh mount is equivalent to reloading the page.
    render(
      <CartProvider storage={storage}>
        <CartProbe />
      </CartProvider>
    );

    expect(screen.getByTestId('count')).toHaveTextContent('4');
  });

  it('keeps the previous counter if the API fails while adding', async () => {
    mockFetch([{ match: '/api/cart', status: 500 }]);
    const storage = createTestStorage();
    storage.setItem(CART_STORAGE_KEY, JSON.stringify(2));
    const user = userEvent.setup();

    render(
      <CartProvider storage={storage}>
        <CartProbe />
      </CartProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('2'));
  });

  it('ignores a corrupt persisted value instead of breaking the mount', () => {
    const storage = createTestStorage();
    storage.setItem(CART_STORAGE_KEY, 'no-es-json');

    render(
      <CartProvider storage={storage}>
        <CartProbe />
      </CartProvider>
    );

    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('throws a clear error if useCart is used outside the provider', () => {
    // React logs the error to the console as well as propagating it.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<CartProbe />)).toThrow(/inside a <CartProvider>/);

    consoleError.mockRestore();
  });
});
