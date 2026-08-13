import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { CartIndicator } from './CartIndicator.jsx';
import { CART_STORAGE_KEY } from '../../context/CartProvider.jsx';
import { createTestStorage } from '../../test/helpers.js';
import { renderWithProviders } from '../../test/utils.jsx';

/**
 * The counter is driven through the storage `CartProvider` consumes, rather
 * than by faking the context: that way the test exercises the real rehydration.
 *
 * @param {number} [count]
 */
function renderWithCount(count) {
  const storage = createTestStorage();
  if (count !== undefined) storage.setItem(CART_STORAGE_KEY, JSON.stringify(count));

  return renderWithProviders(<CartIndicator />, { storage });
}

describe('CartIndicator', () => {
  it('starts at zero when nothing is stored', () => {
    renderWithCount();

    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
  });

  it('shows the persisted number of items', () => {
    renderWithCount(3);

    expect(screen.getByTestId('cart-count')).toHaveTextContent('3');
  });

  it('describes the cart in the singular when there is only one item', () => {
    renderWithCount(1);

    expect(screen.getByText('Cesta de la compra: 1 artículo')).toBeInTheDocument();
  });

  it('describes the cart in the plural when there are several', () => {
    renderWithCount(2);

    expect(screen.getByText('Cesta de la compra: 2 artículos')).toBeInTheDocument();
  });

  it('ignores a corrupt counter in storage instead of breaking', () => {
    const storage = createTestStorage();
    storage.setItem(CART_STORAGE_KEY, 'no-es-un-numero');

    renderWithProviders(<CartIndicator />, { storage });

    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
  });

  it('announces its changes without moving the focus', () => {
    const { container } = renderWithCount(1);

    // The counter changes far from where the user clicked, so without a live
    // region a screen reader would never mention it.
    expect(container.firstChild).toHaveAttribute('aria-live', 'polite');
  });
});
