---
name: testing-rtl
description: Cómo escribir tests en este proyecto con Vitest y Testing Library — helpers disponibles, simulación del API, fixtures y qué merece la pena probar. Úsala al añadir o arreglar cualquier archivo .test.js/.test.jsx.
---

# Tests

Vitest + Testing Library sobre jsdom. `globals: true`, así que `describe`, `it`,
`expect` y `vi` están disponibles sin importarlos.

## Qué probar

Prueba **comportamiento observable por el usuario**, no detalles de
implementación. Un test que se rompe al renombrar un estado interno, sin que la
aplicación haya cambiado de comportamiento, es un test mal planteado.

Prioridad en este proyecto:

1. Los requisitos del enunciado (ver la skill `spec-itx`). Cada uno debería tener
   un test que se lea como el requisito.
2. La caché y su expiración a la hora.
3. El filtrado del buscador.
4. Los estados de error y de lista vacía, que son los que se olvidan y los que el
   evaluador va a probar a mano.

No persigas el 100 % de cobertura. Un test por rama de un `formatSpecValue` no
aporta nada; uno que compruebe que un producto sin precio no muestra «0 €», sí.

## Helpers disponibles

Están repartidos en dos archivos según si necesitan React o no. Importa del que
corresponda: un test de lógica pura no debería cargar Testing Library.

**`src/test/helpers.js`** — sin React:

- `mockFetch(routes)` — sustituye el `fetch` global. Cada ruta es
  `{ match, status?, body?, delayMs? }`, donde `match` es un fragmento de URL o
  una expresión regular. **Gana la primera coincidencia**, así que pon las rutas
  más específicas primero (`/api/cart` antes que `/api/product`).
- `createTestStorage()` — `Storage` en memoria, aislado por test.

**`src/test/utils.jsx`** — con React:

- `renderWithProviders(ui, { route, path, storage })` — monta con `MemoryRouter`,
  `CartProvider` y `BreadcrumbsProvider`, y devuelve un `user` de
  `userEvent` ya inicializado. Usa `path` cuando el componente lea `useParams`.

Si añades un helper, colócalo en el archivo que le toque. Meter algo que importe
React en `helpers.js` deshace la separación en silencio.

`src/test/fixtures.js` contiene respuestas copiadas del API real, con sus erratas
incluidas. No las «arregles»: un fixture idealizado hace pasar tests que fallarían
contra el servidor de verdad.

## Reglas de escritura

- Simula `fetch`, no los módulos de `api/`. Así los tests ejercitan el cliente
  HTTP y la caché reales, que es donde está la lógica que importa.
- Llama a `invalidateProductCache()` en el `beforeEach` de cualquier test que
  toque productos: la caché es un singleton de módulo y se filtraría entre tests.
- Busca por rol y nombre accesible (`getByRole('radio', { name: '32 GB' })`).
  Recurre a `data-testid` solo cuando no exista rol razonable.
- Usa `findBy*` o `waitFor` para lo asíncrono; nunca esperas con temporizador.
- Un `it` describe un comportamiento, en castellano y en tercera persona:
  «preselecciona la primera opción de cada grupo».

## Trampas conocidas

- **El buscador lleva un debounce de 250 ms.** Tras `user.type` hay que esperar
  con `waitFor` o `findBy*`; una aserción inmediata verá la lista sin filtrar.
- **`isNotFound` e `isRetryable` son getters del prototipo de `ApiError`**, así
  que `toMatchObject` no los ve. Captura el error y compruébalos directamente.
- **StrictMode monta dos veces.** Si un test cuenta llamadas a `fetch`, ten
  presente que `api/products.js` deduplica las peticiones en vuelo: dos montajes
  simultáneos producen **una** petición, no dos.
- `renderWithProviders` no incluye la cabecera: monta `<App />` si necesitas
  probar las migas de pan o el contador de la cesta.

## Comandos

```bash
npm test                 # una pasada
npm run test:watch       # en observación durante el desarrollo
npm run test:coverage    # informe de cobertura
npx vitest run src/lib   # solo una carpeta
```
