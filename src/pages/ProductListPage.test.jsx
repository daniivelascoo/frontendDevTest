import { beforeEach, describe, expect, it } from 'vitest';
import { act, screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
import { ProductListPage } from './ProductListPage.jsx';
import { invalidateProductCache } from '../api/products.js';
import { buildProductListFixture, productListFixture } from '../test/fixtures.js';
import { mockFetch, triggerIntersection } from '../test/helpers.js';
import { saveListPosition } from '../lib/listPosition.js';
import { renderWithProviders } from '../test/utils.jsx';

/** Espera a que desaparezca el esqueleto de carga. */
async function waitForCatalogue() {
  await waitForElementToBeRemoved(() => screen.queryByLabelText('Cargando productos'));
}

describe('ProductListPage', () => {
  beforeEach(() => {
    invalidateProductCache();
  });

  it('muestra el catálogo que devuelve el API', async () => {
    mockFetch([{ match: '/api/product', body: productListFixture }]);

    renderWithProviders(<ProductListPage />);
    await waitForCatalogue();

    expect(screen.getByRole('heading', { name: 'Iconia Talk S' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Galaxy S9' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(productListFixture.length);
  });

  it('muestra imagen, marca, modelo y precio de cada producto', async () => {
    mockFetch([{ match: '/api/product', body: productListFixture }]);

    renderWithProviders(<ProductListPage />);
    await waitForCatalogue();

    const card = screen.getByRole('heading', { name: 'Galaxy S9' }).closest('article');

    expect(within(card).getByRole('img', { name: 'Samsung Galaxy S9' })).toBeInTheDocument();
    expect(within(card).getByText('Samsung')).toBeInTheDocument();
    expect(within(card).getByText(/699/)).toBeInTheDocument();
  });

  it('indica cuándo un producto no tiene precio', async () => {
    mockFetch([{ match: '/api/product', body: productListFixture }]);

    renderWithProviders(<ProductListPage />);
    await waitForCatalogue();

    const card = screen.getByRole('heading', { name: 'iPhone 11 Pro' }).closest('article');

    expect(within(card).getByText('Precio no disponible')).toBeInTheDocument();
  });

  it('enlaza cada producto con su ficha de detalle', async () => {
    mockFetch([{ match: '/api/product', body: productListFixture }]);

    renderWithProviders(<ProductListPage />);
    await waitForCatalogue();

    const link = screen.getByRole('heading', { name: 'Galaxy S9' }).closest('a');

    expect(link).toHaveAttribute('href', '/product/sBnkNCTsVLTjXCYFtqB0f');
  });

  it('filtra por marca a medida que el usuario escribe', async () => {
    mockFetch([{ match: '/api/product', body: productListFixture }]);

    const { user } = renderWithProviders(<ProductListPage />);
    await waitForCatalogue();

    await user.type(screen.getByRole('searchbox'), 'samsung');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Galaxy S9' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Iconia Talk S' })).not.toBeInTheDocument();
    });
  });

  it('filtra por modelo', async () => {
    mockFetch([{ match: '/api/product', body: productListFixture }]);

    const { user } = renderWithProviders(<ProductListPage />);
    await waitForCatalogue();

    await user.type(screen.getByRole('searchbox'), 'redmi');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Redmi Note 7' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Galaxy S9' })).not.toBeInTheDocument();
    });
  });

  it('filtra sin volver a pedir los datos al API', async () => {
    const fetchMock = mockFetch([{ match: '/api/product', body: productListFixture }]);

    const { user } = renderWithProviders(<ProductListPage />);
    await waitForCatalogue();

    await user.type(screen.getByRole('searchbox'), 'samsung');
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Iconia Talk S' })).not.toBeInTheDocument()
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('informa cuando la búsqueda no devuelve resultados', async () => {
    mockFetch([{ match: '/api/product', body: productListFixture }]);

    const { user } = renderWithProviders(<ProductListPage />);
    await waitForCatalogue();

    await user.type(screen.getByRole('searchbox'), 'nokia');

    expect(await screen.findByText(/Sin resultados para «nokia»/)).toBeInTheDocument();
  });

  it('permite borrar la búsqueda y recuperar el catálogo completo', async () => {
    mockFetch([{ match: '/api/product', body: productListFixture }]);

    const { user } = renderWithProviders(<ProductListPage />);
    await waitForCatalogue();

    await user.type(screen.getByRole('searchbox'), 'samsung');
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Iconia Talk S' })).not.toBeInTheDocument()
    );

    await user.click(screen.getByRole('button', { name: 'Borrar la búsqueda' }));

    expect(await screen.findByRole('heading', { name: 'Iconia Talk S' })).toBeInTheDocument();
  });

  it('conserva la búsqueda que llega en la URL', async () => {
    mockFetch([{ match: '/api/product', body: productListFixture }]);

    renderWithProviders(<ProductListPage />, { route: '/?q=xiaomi' });
    await waitForCatalogue();

    expect(screen.getByRole('searchbox')).toHaveValue('xiaomi');
    expect(await screen.findByRole('heading', { name: 'Redmi Note 7' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Galaxy S9' })).not.toBeInTheDocument();
  });

  describe('scroll infinito', () => {
    /** Catálogo de 30 productos: dos tandas completas y media. */
    const catalogoGrande = buildProductListFixture(30);

    /** Cuenta las tarjetas de producto que hay pintadas. */
    const tarjetas = () => screen.getAllByRole('heading', { level: 2 });

    it('muestra solo la primera tanda de doce productos', async () => {
      mockFetch([{ match: '/api/product', body: catalogoGrande }]);

      renderWithProviders(<ProductListPage />);
      await waitForCatalogue();

      expect(tarjetas()).toHaveLength(12);
      expect(screen.getByText('Mostrando 12 de 30 productos')).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Modelo 13' })).not.toBeInTheDocument();
    });

    /** Pide otra tanda y espera a que termine la pausa de carga. */
    async function cargarMas(user) {
      await user.click(screen.getByRole('button', { name: 'Cargar más productos' }));
      await waitForElementToBeRemoved(() => screen.queryByLabelText('Cargando más productos'), {
        // Margen holgado sobre la pausa de carga, para que el test no dependa
        // de su duración exacta.
        timeout: 4000,
      });
    }

    it('amplía la lista al pulsar «Cargar más»', async () => {
      mockFetch([{ match: '/api/product', body: catalogoGrande }]);

      const { user } = renderWithProviders(<ProductListPage />);
      await waitForCatalogue();

      await cargarMas(user);

      expect(tarjetas()).toHaveLength(24);
      expect(screen.getByRole('heading', { name: 'Modelo 13' })).toBeInTheDocument();
    });

    it('amplía la lista cuando el centinela entra en pantalla', async () => {
      mockFetch([{ match: '/api/product', body: catalogoGrande }]);

      renderWithProviders(<ProductListPage />);
      await waitForCatalogue();

      expect(tarjetas()).toHaveLength(12);

      act(() => triggerIntersection());

      await waitFor(() => expect(tarjetas()).toHaveLength(24), { timeout: 4000 });
    });

    describe('pausa de carga', () => {
      it('avisa de que hay más productos en camino antes de mostrarlos', async () => {
        mockFetch([{ match: '/api/product', body: catalogoGrande }]);

        const { user } = renderWithProviders(<ProductListPage />);
        await waitForCatalogue();

        await user.click(screen.getByRole('button', { name: 'Cargar más productos' }));

        // Durante la pausa: indicador visible y lista todavía sin ampliar.
        expect(screen.getByLabelText('Cargando más productos')).toBeInTheDocument();
        expect(tarjetas()).toHaveLength(12);

        await waitForElementToBeRemoved(() => screen.queryByLabelText('Cargando más productos'), {
          // Margen holgado sobre la pausa de carga, para que el test no dependa
          // de su duración exacta.
          timeout: 4000,
        });

        expect(tarjetas()).toHaveLength(24);
      });

      it('mantiene el botón montado durante la pausa, para no perder el foco', async () => {
        mockFetch([{ match: '/api/product', body: catalogoGrande }]);

        const { user } = renderWithProviders(<ProductListPage />);
        await waitForCatalogue();

        await user.click(screen.getByRole('button', { name: 'Cargar más productos' }));

        const boton = screen.getByRole('button', { name: /Cargando/ });
        expect(boton).toBeDisabled();
        expect(boton).toHaveAttribute('aria-busy', 'true');

        await waitForElementToBeRemoved(() => screen.queryByLabelText('Cargando más productos'), {
          // Margen holgado sobre la pausa de carga, para que el test no dependa
          // de su duración exacta.
          timeout: 4000,
        });
      });

      it('no encadena varias tandas si el centinela se dispara repetidamente', async () => {
        mockFetch([{ match: '/api/product', body: catalogoGrande }]);

        renderWithProviders(<ProductListPage />);
        await waitForCatalogue();

        // El observador puede dispararse varias veces durante la pausa.
        act(() => {
          triggerIntersection();
          triggerIntersection();
          triggerIntersection();
        });

        await waitForElementToBeRemoved(() => screen.queryByLabelText('Cargando más productos'), {
          // Margen holgado sobre la pausa de carga, para que el test no dependa
          // de su duración exacta.
          timeout: 4000,
        });

        // Una sola tanda, no tres.
        expect(tarjetas()).toHaveLength(24);
      });

      it('descarta la tanda en curso si cambia la búsqueda', async () => {
        mockFetch([{ match: '/api/product', body: catalogoGrande }]);

        const { user } = renderWithProviders(<ProductListPage />);
        await waitForCatalogue();

        await user.click(screen.getByRole('button', { name: 'Cargar más productos' }));
        // Sin esperar a que termine, se cambia el criterio de búsqueda.
        await user.type(screen.getByRole('searchbox'), 'marca');

        await waitFor(() => expect(tarjetas()).toHaveLength(12), { timeout: 4000 });

        // La tanda pendiente pertenecía a la lista anterior: no debe aplicarse.
        expect(screen.queryByLabelText('Cargando más productos')).not.toBeInTheDocument();
      });
    });

    it('deja de ofrecer más cuando ya se ven todos', async () => {
      mockFetch([{ match: '/api/product', body: catalogoGrande }]);

      const { user } = renderWithProviders(<ProductListPage />);
      await waitForCatalogue();

      await cargarMas(user);
      await cargarMas(user);

      expect(tarjetas()).toHaveLength(30);
      expect(
        screen.queryByRole('button', { name: 'Cargar más productos' })
      ).not.toBeInTheDocument();
      expect(screen.getByText('Has llegado al final del catálogo.')).toBeInTheDocument();
    });

    it('no ofrece cargar más si el catálogo cabe en una tanda', async () => {
      mockFetch([{ match: '/api/product', body: productListFixture }]);

      renderWithProviders(<ProductListPage />);
      await waitForCatalogue();

      expect(
        screen.queryByRole('button', { name: 'Cargar más productos' })
      ).not.toBeInTheDocument();
      expect(screen.getByText('Mostrando 4 de 4 productos')).toBeInTheDocument();
    });

    it('vuelve a la primera tanda al cambiar la búsqueda', async () => {
      mockFetch([{ match: '/api/product', body: catalogoGrande }]);

      const { user } = renderWithProviders(<ProductListPage />);
      await waitForCatalogue();

      await cargarMas(user);
      expect(tarjetas()).toHaveLength(24);

      // Todos los productos comparten marca, así que siguen siendo 30.
      await user.type(screen.getByRole('searchbox'), 'marca');

      await waitFor(() => expect(tarjetas()).toHaveLength(12));
    });

    it('restaura la posición al volver desde la ficha de un producto', async () => {
      mockFetch([{ match: '/api/product', body: catalogoGrande }]);

      // Es lo que la página deja guardado antes de navegar al detalle.
      saveListPosition('', 24);

      renderWithProviders(<ProductListPage />);
      await waitForCatalogue();

      expect(tarjetas()).toHaveLength(24);
    });

    it('ignora la posición guardada si la búsqueda es otra', async () => {
      mockFetch([{ match: '/api/product', body: catalogoGrande }]);

      // La posición pertenece a otra lista: restaurarla mostraría un número
      // arbitrario de resultados de una búsqueda distinta.
      saveListPosition('otra-cosa', 24);

      renderWithProviders(<ProductListPage />);
      await waitForCatalogue();

      expect(tarjetas()).toHaveLength(12);
    });
  });

  it('muestra un error con opción de reintentar si falla la carga', async () => {
    mockFetch([{ match: '/api/product', status: 500 }]);

    renderWithProviders(<ProductListPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se ha podido cargar el catálogo'
    );
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });

  it('vuelve a cargar el catálogo al pulsar reintentar', async () => {
    const fetchMock = mockFetch([{ match: '/api/product', status: 500 }]);

    const { user } = renderWithProviders(<ProductListPage />);
    await screen.findByRole('alert');

    // A partir de aquí el API responde correctamente.
    fetchMock.mockImplementation(async () => ({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(productListFixture),
    }));

    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByRole('heading', { name: 'Galaxy S9' })).toBeInTheDocument();
  });
});
