# CLAUDE.md

Miniaplicación SPA para la compra de dispositivos móviles. Es una prueba técnica
de front-end: el evaluador va a leer el código y el histórico de git, así que
ambas cosas forman parte del entregable.

## Comandos

```bash
npm start                # desarrollo en http://localhost:3000
npm run build            # build de producción
npm test                 # tests (una pasada)
npm run test:watch       # tests en observación
npm run lint             # ESLint
npm run check            # lint + formato + tests + build
npx vitest run src/lib   # tests de una carpeta concreta
```

Los cuatro primeros scripts los exige el enunciado: **no los renombres**.

## Documentación cargable

Antes de trabajar, invoca la skill que corresponda; contienen el detalle que
aquí no se repite.

| Skill                | Cuándo                                                                  |
| -------------------- | ----------------------------------------------------------------------- |
| `spec-itx`           | Qué debe hacer la aplicación: requisitos, contrato del API, sus erratas |
| `convenciones-react` | Cómo se escribe el código: estructura, componentes, CSS, estado         |
| `testing-rtl`        | Cómo se escriben los tests: helpers, fixtures, trampas conocidas        |

Agentes: `auditor-spec` (cumplimiento del enunciado), `revisor-react` (revisión
de código), `autor-tests` (cobertura que falta).

Comandos: `/verificar`, `/hito`, `/componente`, `/auditar`.

## Arquitectura en una pantalla

```
pages/       Una vista del router. Orquestan; no contienen lógica de negocio.
components/  Presentación, agrupada en layout/ · product/ · ui/
hooks/       useProducts, useProduct, useAsyncResource, useDebouncedValue
context/     CartProvider (cesta) · BreadcrumbsProvider (migas)
api/         Único punto que conoce el API: http.js + products.js
lib/         Lógica pura sin React: cache, search, format, productSpecs, storage
```

Las dependencias van siempre en la dirección `pages → components → hooks → lib`.
Un archivo de `lib/` que importe React está en la capa equivocada.

## Decisiones que conviene no deshacer sin motivo

- **La caché es un singleton de módulo** (`appCache` en `lib/cache.js`) y
  `api/products.js` deduplica las peticiones en vuelo. Esto es lo que evita que
  el doble montaje de StrictMode dispare peticiones duplicadas. En los tests hay
  que llamar a `invalidateProductCache()` en el `beforeEach`.
- **El `AbortSignal` del llamante no se propaga a la petición compartida.** Si se
  propagara, desmontar un componente cancelaría la petición que otros están
  esperando. La cancelación se resuelve en `useAsyncResource`, descartando el
  resultado en lugar de abortar la red.
- **El criterio de búsqueda vive en la URL** (`?q=`), no en el estado del
  componente: así sobrevive al volver desde la ficha de un producto.
- **El contador de la cesta usa una clave de storage propia**, fuera del
  namespace de la caché, para que no lo borre ni la expiración ni un reintento.

## Al terminar cualquier cambio

`npm run check` tiene que pasar. El hook de `PostToolUse` ya formatea y analiza
cada archivo que tocas, así que rara vez debería sorprenderte.
