import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ProductImage } from './ProductImage.jsx';

/**
 * `renderWithProviders` is not used: this component consumes neither the router
 * nor any context, so mounting it bare makes its dependencies obvious.
 */
describe('ProductImage', () => {
  it('paints the product image with its alternative text', () => {
    render(<ProductImage src="https://ejemplo.test/galaxy.jpg" alt="Samsung Galaxy S9" />);

    const img = screen.getByRole('img', { name: 'Samsung Galaxy S9' });
    expect(img).toHaveAttribute('src', 'https://ejemplo.test/galaxy.jpg');
  });

  it('shows the placeholder when the image fails to load', () => {
    render(<ProductImage src="https://ejemplo.test/rota.jpg" alt="Samsung Galaxy S9" />);

    fireEvent.error(screen.getByRole('img', { name: 'Samsung Galaxy S9' }));

    expect(
      screen.getByRole('img', { name: 'Samsung Galaxy S9 (imagen no disponible)' })
    ).toBeInTheDocument();
  });

  it('shows the placeholder if the product carries no image', () => {
    render(<ProductImage src="" alt="Producto sin imagen" />);

    expect(
      screen.getByRole('img', { name: 'Producto sin imagen (imagen no disponible)' })
    ).toBeInTheDocument();
  });

  it('does not paint a whitespace-only URL, which the browser would request anyway', () => {
    render(<ProductImage src="   " alt="Producto sin imagen" />);

    expect(
      screen.getByRole('img', { name: 'Producto sin imagen (imagen no disponible)' })
    ).toBeInTheDocument();
  });

  it('discards a src whose scheme is not a legitimate image', () => {
    render(<ProductImage src="javascript:alert(1)" alt="Producto hostil" />);

    // Neither the `<img>` is painted nor does the URL reach the DOM: only the
    // fallback remains.
    expect(screen.queryByRole('img', { name: 'Producto hostil' })).not.toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Producto hostil (imagen no disponible)' })
    ).toBeInTheDocument();
  });

  it('marks the image as loaded once it finishes loading', () => {
    const { container } = render(
      <ProductImage src="https://ejemplo.test/galaxy.jpg" alt="Samsung Galaxy S9" />
    );

    expect(container.firstChild).toHaveAttribute('data-state', 'loading');

    fireEvent.load(screen.getByRole('img', { name: 'Samsung Galaxy S9' }));

    expect(container.firstChild).toHaveAttribute('data-state', 'loaded');
  });

  it('resets its state when the image changes, without carrying over the previous one', () => {
    const { container, rerender } = render(
      <ProductImage src="https://ejemplo.test/rota.jpg" alt="Producto A" />
    );

    // The first image fails and settles on the fallback.
    fireEvent.error(screen.getByRole('img', { name: 'Producto A' }));
    expect(container.firstChild).toHaveAttribute('data-state', 'error');

    // When another image arrives it must try again, not inherit the error.
    rerender(<ProductImage src="https://ejemplo.test/buena.jpg" alt="Producto B" />);

    expect(container.firstChild).toHaveAttribute('data-state', 'loading');
    expect(screen.getByRole('img', { name: 'Producto B' })).toHaveAttribute(
      'src',
      'https://ejemplo.test/buena.jpg'
    );
  });
});
