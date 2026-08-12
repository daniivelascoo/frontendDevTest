import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, CART_STORAGE_KEY } from './CartProvider.jsx';
import { useCart } from './cartContext.js';
import { createTestStorage, mockFetch } from '../test/helpers.js';

/** Componente de prueba que expone el estado de la cesta. */
function CartProbe() {
  const { count, addItem } = useCart();

  return (
    <div>
      <span data-testid="count">{count}</span>
      <button
        type="button"
        onClick={() => addItem({ id: 'abc', colorCode: 1000, storageCode: 2000 }).catch(() => {})}
      >
        Añadir
      </button>
    </div>
  );
}

describe('CartProvider', () => {
  it('arranca a cero cuando no hay nada persistido', () => {
    render(
      <CartProvider storage={createTestStorage()}>
        <CartProbe />
      </CartProvider>
    );

    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('recupera el contador persistido al montarse', () => {
    const storage = createTestStorage();
    storage.setItem(CART_STORAGE_KEY, JSON.stringify(7));

    render(
      <CartProvider storage={storage}>
        <CartProbe />
      </CartProvider>
    );

    expect(screen.getByTestId('count')).toHaveTextContent('7');
  });

  it('adopta como contador el valor que devuelve el API', async () => {
    mockFetch([{ match: '/api/cart', body: { count: 4 } }]);
    const user = userEvent.setup();

    render(
      <CartProvider storage={createTestStorage()}>
        <CartProbe />
      </CartProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Añadir' }));

    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('4'));
  });

  it('persiste el contador para que sobreviva a una recarga', async () => {
    mockFetch([{ match: '/api/cart', body: { count: 4 } }]);
    const storage = createTestStorage();
    const user = userEvent.setup();

    const { unmount } = render(
      <CartProvider storage={storage}>
        <CartProbe />
      </CartProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Añadir' }));
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('4'));

    unmount();

    // Un montaje nuevo equivale a recargar la página.
    render(
      <CartProvider storage={storage}>
        <CartProbe />
      </CartProvider>
    );

    expect(screen.getByTestId('count')).toHaveTextContent('4');
  });

  it('mantiene el contador anterior si el API falla al añadir', async () => {
    mockFetch([{ match: '/api/cart', status: 500 }]);
    const storage = createTestStorage();
    storage.setItem(CART_STORAGE_KEY, JSON.stringify(2));
    const user = userEvent.setup();

    render(
      <CartProvider storage={storage}>
        <CartProbe />
      </CartProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Añadir' }));

    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('2'));
  });

  it('ignora un valor persistido corrupto en lugar de romper el montaje', () => {
    const storage = createTestStorage();
    storage.setItem(CART_STORAGE_KEY, 'no-es-json');

    render(
      <CartProvider storage={storage}>
        <CartProbe />
      </CartProvider>
    );

    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('lanza un error claro si se usa useCart fuera del provider', () => {
    // React registra el error en consola además de propagarlo.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<CartProbe />)).toThrow(/dentro de un <CartProvider>/);

    consoleError.mockRestore();
  });
});
