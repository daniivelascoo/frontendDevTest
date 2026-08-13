import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { ProductCard } from './ProductCard.jsx';
import { renderWithProviders } from '../../test/utils.jsx';

/**
 * The card is the component repeated most often on screen, so a missing value
 * that leaves a gap misaligns the whole row. These tests pin down what happens
 * to each field when the API does not provide it.
 */
describe('ProductCard', () => {
  const completeProduct = {
    id: 'abc',
    brand: 'Samsung',
    model: 'Galaxy S9',
    price: '699',
    imgUrl: 'https://example.test/s9.jpg',
  };

  it('shows image, brand, model and price', () => {
    renderWithProviders(<ProductCard product={completeProduct} />);

    expect(screen.getByRole('img', { name: 'Samsung Galaxy S9' })).toBeInTheDocument();
    expect(screen.getByText('Samsung')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Galaxy S9' })).toBeInTheDocument();
    expect(screen.getByText(/699/)).toBeInTheDocument();
  });

  it('omits the brand when missing, instead of leaving its gap', () => {
    renderWithProviders(<ProductCard product={{ ...completeProduct, brand: '' }} />);

    // The model is still the heading and the link's accessible name.
    expect(screen.getByRole('heading', { name: 'Galaxy S9' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Galaxy S9/ })).toBeInTheDocument();
  });

  it('falls back to the brand when the model is missing, so the link keeps a name', () => {
    renderWithProviders(<ProductCard product={{ ...completeProduct, model: null }} />);

    expect(screen.getByRole('heading', { name: 'Samsung' })).toBeInTheDocument();
  });

  it('stays navigable even when brand and model are both missing', () => {
    renderWithProviders(<ProductCard product={{ ...completeProduct, brand: '', model: '' }} />);

    expect(screen.getByRole('heading', { name: 'Producto sin nombre' })).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/product/abc');
  });

  it('distinguishes a product without a price from one costing zero', () => {
    renderWithProviders(<ProductCard product={{ ...completeProduct, price: '' }} />);

    expect(screen.getByText('Precio no disponible')).toBeInTheDocument();
    expect(screen.queryByText(/0\s*€/)).not.toBeInTheDocument();
  });

  it('shows the image placeholder when there is no URL, leaving no broken image', () => {
    renderWithProviders(<ProductCard product={{ ...completeProduct, imgUrl: '' }} />);

    // The fallback keeps the space and still describes the product.
    expect(
      screen.getByRole('img', { name: 'Samsung Galaxy S9 (imagen no disponible)' })
    ).toBeInTheDocument();
  });

  it('treats a whitespace-only URL as a missing image', () => {
    // `Boolean(" ")` is true: without trimming, the browser would request the
    // page itself as an image before ending up showing the fallback anyway.
    renderWithProviders(<ProductCard product={{ ...completeProduct, imgUrl: '   ' }} />);

    expect(
      screen.getByRole('img', { name: 'Samsung Galaxy S9 (imagen no disponible)' })
    ).toBeInTheDocument();
    expect(document.querySelector('img')).toBeNull();
  });

  it('does not show "0 €" when the price arrives as whitespace', () => {
    renderWithProviders(<ProductCard product={{ ...completeProduct, price: '  ' }} />);

    expect(screen.getByText('Precio no disponible')).toBeInTheDocument();
    expect(screen.queryByText(/0\s*€/)).not.toBeInTheDocument();
  });
});
