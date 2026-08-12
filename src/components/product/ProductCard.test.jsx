import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { ProductCard } from './ProductCard.jsx';
import { renderWithProviders } from '../../test/utils.jsx';

/**
 * La tarjeta es el componente que más veces se repite en pantalla, así que un
 * dato ausente que deje un hueco desalinea toda la fila. Estos tests fijan qué
 * ocurre con cada campo cuando el API no lo trae.
 */
describe('ProductCard', () => {
  const completeProduct = {
    id: 'abc',
    brand: 'Samsung',
    model: 'Galaxy S9',
    price: '699',
    imgUrl: 'https://example.test/s9.jpg',
  };

  it('muestra imagen, marca, modelo y precio', () => {
    renderWithProviders(<ProductCard product={completeProduct} />);

    expect(screen.getByRole('img', { name: 'Samsung Galaxy S9' })).toBeInTheDocument();
    expect(screen.getByText('Samsung')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Galaxy S9' })).toBeInTheDocument();
    expect(screen.getByText(/699/)).toBeInTheDocument();
  });

  it('omite la marca si no viene, en lugar de dejar su hueco', () => {
    renderWithProviders(<ProductCard product={{ ...completeProduct, brand: '' }} />);

    // El modelo sigue siendo el encabezado y el nombre accesible del enlace.
    expect(screen.getByRole('heading', { name: 'Galaxy S9' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Galaxy S9/ })).toBeInTheDocument();
  });

  it('recurre a la marca si falta el modelo, para no dejar el enlace sin nombre', () => {
    renderWithProviders(<ProductCard product={{ ...completeProduct, model: null }} />);

    expect(screen.getByRole('heading', { name: 'Samsung' })).toBeInTheDocument();
  });

  it('sigue siendo navegable aunque falten marca y modelo', () => {
    renderWithProviders(<ProductCard product={{ ...completeProduct, brand: '', model: '' }} />);

    expect(screen.getByRole('heading', { name: 'Producto sin nombre' })).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/product/abc');
  });

  it('distingue un producto sin precio de uno que cuesta cero', () => {
    renderWithProviders(<ProductCard product={{ ...completeProduct, price: '' }} />);

    expect(screen.getByText('Precio no disponible')).toBeInTheDocument();
    expect(screen.queryByText(/0\s*€/)).not.toBeInTheDocument();
  });

  it('muestra el marcador de imagen cuando no hay URL, sin dejar una imagen rota', () => {
    renderWithProviders(<ProductCard product={{ ...completeProduct, imgUrl: '' }} />);

    // El respaldo conserva el hueco y sigue describiendo el producto.
    expect(
      screen.getByRole('img', { name: 'Samsung Galaxy S9 (imagen no disponible)' })
    ).toBeInTheDocument();
  });
});
