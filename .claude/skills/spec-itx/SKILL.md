---
name: spec-itx
description: Requisitos verificables de la prueba técnica front-end (PLP, PDP, cabecera, buscador, acciones de compra, contrato del API y caché de 1 hora). Úsala antes de implementar o modificar cualquier vista o componente de producto, y siempre que haya que comprobar si el proyecto sigue cumpliendo el enunciado.
---

# Requisitos de la prueba

Esta skill es la traducción del enunciado (`Prueba frontend ITX.pdf`) a criterios
que se pueden comprobar uno a uno. Ante una duda sobre qué debe hacer la
aplicación, manda este documento; ante una duda sobre cómo escribirlo, manda
`convenciones-react`.

Marca un requisito como cumplido solo si existe un test que lo demuestre o lo has
verificado en la aplicación en ejecución.

## Restricciones globales

- **SPA con enrutado en cliente.** Nada de MPA ni SSR. El enrutado es
  `react-router-dom` sobre `BrowserRouter`.
- **React con ES6.** El proyecto es JavaScript, no TypeScript. Los contratos se
  documentan con JSDoc.
- **Cuatro scripts obligatorios**, que no se deben renombrar:
  `start` (desarrollo), `build` (producción), `test` (tests), `lint` (análisis).
- **Entrega evolutiva.** El histórico de git debe leerse como una sucesión de
  hitos con sentido propio, no como un único volcado de código.

## Vista PLP — listado de productos

| # | Requisito | Dónde vive |
|---|-----------|-----------|
| PLP-1 | Muestra todos los elementos que devuelve `GET /api/product` | `pages/ProductListPage.jsx` |
| PLP-2 | Filtra por el criterio que introduce el usuario | `lib/search.js` |
| PLP-3 | Al seleccionar un producto navega a su detalle | `components/product/ProductCard.jsx` |
| PLP-4 | Máximo cuatro elementos por fila, adaptativo | `components/product/ProductGrid.module.css` |

El máximo de cuatro columnas es un techo, no un número fijo: por debajo de
`64rem` la rejilla baja a tres, dos o las que quepan. Si tocas ese CSS, comprueba
que en pantallas anchas nunca aparece una quinta columna.

## Vista PDP — detalle de producto

| # | Requisito | Dónde vive |
|---|-----------|-----------|
| PDP-1 | Dos columnas: imagen a la izquierda, detalles y acciones a la derecha | `pages/ProductDetailPage.module.css` |
| PDP-2 | Enlace de vuelta al listado | `pages/ProductDetailPage.jsx` |

## Cabecera

| # | Requisito | Dónde vive |
|---|-----------|-----------|
| HEAD-1 | El título o icono enlaza a la vista principal | `components/layout/Header.jsx` |
| HEAD-2 | Breadcrumbs con la página actual y enlace de navegación | `components/layout/Breadcrumbs.jsx` |
| HEAD-3 | Número de artículos de la cesta, a la derecha y en todas las vistas | `components/layout/CartIndicator.jsx` |

Las migas las publica cada página con `useSetBreadcrumbs`; la cabecera solo las
pinta. Si añades una vista, publica su rastro o la cabecera se quedará sin migas.

## Buscador

| # | Requisito |
|---|-----------|
| SEARCH-1 | Input de texto libre |
| SEARCH-2 | Compara el texto con la **marca** y el **modelo** |
| SEARCH-3 | Filtrado en tiempo real: se relanza en cada cambio del criterio |

El *debounce* de 250 ms de `useDebouncedValue` no incumple SEARCH-3: el input se
actualiza en cada pulsación y lo único que se difiere es el recálculo de la
lista. No lo conviertas en una búsqueda con botón de enviar.

## Tarjeta de producto (ITEM)

Debe mostrar imagen, marca, modelo y precio. Ni más ni menos: la tarjeta no es el
sitio para especificaciones técnicas.

## Descripción del producto (DESCRIPTION)

Los once atributos obligatorios, en este orden, los produce
`lib/productSpecs.js` → `getRequiredSpecs()`:

marca, modelo, precio, CPU, RAM, sistema operativo, resolución de pantalla,
batería, cámaras, dimensiones, peso.

### Tratamiento de los datos ausentes

El API omite datos de tres formas distintas —cadena vacía, solo espacios,
`null`, campo inexistente o array vacío— y hay **dos reglas opuestas** según la
importancia del dato:

| Tipo de dato | Regla | Dónde |
|---|---|---|
| Obligatorio (los once de arriba) | La fila se mantiene y el valor es `-` | `getRequiredSpecs` |
| Secundario (dentro de «Ver especificaciones completas») | La fila desaparece entera, etiqueta incluida | `getAdditionalSpecGroups` |

El motivo de la asimetría: en el bloque obligatorio, conservar la fila permite
comparar dos fichas línea a línea y deja claro que el atributo se ha consultado.
En el bloque secundario, veinte filas con guion convertirían la ficha en una
lista de ausencias. Si el API no trae la GPU, no aparece ni la etiqueta «GPU»; y
un grupo que se queda sin ninguna fila desaparece también, para no dejar un
título huérfano.

El marcador es la constante `MISSING_VALUE` de `lib/format.js`. No escribas `-`
a mano: la UI lo compara con esa constante para atenuar el valor y añadirle un
texto «Dato no disponible» para lectores de pantalla, que de otro modo leerían
solo «menos».

**Excepción del precio.** `formatPrice` devuelve por defecto «Precio no
disponible», porque el precio también se muestra suelto en la tarjeta y en el
bloque de compra, donde un guion no diría nada. En la ficha técnica, donde la
fila ya está etiquetada, se le pasa `{ fallback: MISSING_VALUE }`. Un `price`
vacío nunca debe acabar mostrándose como «0 €».

## Acciones de compra (ACTIONS)

| # | Requisito |
|---|-----------|
| ACT-1 | Selector de almacenamiento y selector de color |
| ACT-2 | Con una única opción, el selector se muestra igualmente y viene preseleccionado |
| ACT-3 | Botón de añadir a la cesta |
| ACT-4 | El POST envía identificador, código de color y código de almacenamiento |
| ACT-5 | El contador que devuelve el API se muestra en la cabecera y persiste |

ACT-2 es un caso fácil de romper sin darse cuenta: hay tests dedicados en
`pages/ProductDetailPage.test.jsx` con el fixture `singleOptionProductFixture`.

### Productos que no se pueden comprar

Añadido sobre el mínimo del enunciado. Un producto solo es comprable si cumple
las **tres** condiciones: tiene precio, al menos una opción de almacenamiento y
al menos una de color. Si falla alguna, el botón se deshabilita y se muestra una
explicación que **nombra todos** los motivos, no solo el primero.

La lógica está en `lib/availability.js` (`getPurchaseAvailability`), fuera del
componente para poder probar las combinaciones sin montar React. Devuelve
`{ isAvailable, reasons, message }`.

Tres detalles que conviene no romper:

- **Un precio de `0` es válido**: significa gratis, no inexistente. La regla la
  decide `hasPrice` en `lib/format.js`, que comparten `formatPrice` y la
  comprobación de disponibilidad — no la dupliques.
- **Una opción solo cuenta si tiene código y nombre.** `getPurchaseOptions`
  descarta las que no cumplan ambas cosas. En el catálogo real, Acer DX650 y
  Acer M900 devuelven `storages: [{ code: 2000, name: " " }]`; aceptarla por
  tener código pintaba una pastilla con un guion y daba el producto por
  comprable. Hay tests de regresión con `blankOptionNameProductFixture`.
- **Los selectores se siguen mostrando** aunque el producto no sea comprable:
  el usuario debe poder ver qué opciones existen.
- El aviso se enlaza al botón con `aria-describedby`, para que un lector de
  pantalla anuncie el motivo al llegar a él. Un botón deshabilitado y mudo deja
  al usuario adivinando.

## Contrato del API

Dominio: `https://itx-frontend-test.onrender.com`

```
GET  /api/product         → ProductSummary[]
GET  /api/product/:id     → ProductDetail
POST /api/cart            → { count: number }
     body: { id, colorCode, storageCode }
```

Peculiaridades reales del API que hay que respetar y **no** «corregir» en los
fixtures:

- `dimentions` y `secondaryCmera` están mal escritos en el origen.
- `displayResolution` contiene las **pulgadas** y `displaySize` los **píxeles**:
  están intercambiados respecto a su nombre. La resolución de pantalla que pide
  el enunciado sale de `displaySize`.
- `price` llega como cadena y puede venir vacía, lo que significa «no está a la
  venta», no «cuesta 0 €».
- El API está desplegado en un plan gratuito que suspende la instancia: la
  primera petición tras un rato de inactividad puede tardar decenas de segundos.
  Por eso el timeout es de 45 s.

## Persistencia

| # | Requisito |
|---|-----------|
| CACHE-1 | Se almacena la información cada vez que se pide al API |
| CACHE-2 | Expira a la hora y entonces se revalida |
| CACHE-3 | El almacenamiento es siempre de cliente |

Implementado en `lib/cache.js` (`createCache`, `ONE_HOUR_MS`) y consumido desde
`api/products.js`. Las mutaciones (`POST /api/cart`) **nunca** se cachean.
