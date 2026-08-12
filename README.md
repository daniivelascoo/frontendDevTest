# Mobile Store — prueba técnica front-end

Miniaplicación SPA para la compra de dispositivos móviles: listado de productos
con búsqueda y ficha de detalle con opciones de compra y añadido a la cesta.

## Requisitos previos

- **Node.js 20.19 o superior** (probado con Node 22)
- npm 10 o superior

## Puesta en marcha

```bash
npm install
npm start
```

La aplicación queda en <http://localhost:3000> y abre el navegador sola.

> **Primera carga lenta.** El API de la prueba está desplegado en un plan
> gratuito de Render que suspende la instancia por inactividad. La primera
> petición tras un rato sin uso puede tardar hasta un minuto; a partir de ahí la
> respuesta es inmediata y, además, queda cacheada durante una hora. El timeout
> del cliente es de 45 s precisamente por esto.

## Scripts

| Script                  | Qué hace                                              |
| ----------------------- | ----------------------------------------------------- |
| `npm start`             | Servidor de desarrollo con recarga en caliente        |
| `npm run build`         | Compilación para producción en `dist/`                |
| `npm test`              | Tests (una pasada)                                    |
| `npm run lint`          | Análisis estático con ESLint                          |
| `npm run test:watch`    | Tests en modo observación                             |
| `npm run test:coverage` | Informe de cobertura                                  |
| `npm run format`        | Formatea el código con Prettier                       |
| `npm run preview`       | Sirve el build de producción en local                 |
| `npm run check`         | Verificación completa: lint + formato + tests + build |

## Configuración

No hace falta ninguna: los valores por defecto apuntan al API de la prueba. Si
quieres cambiarlos, copia `.env.example` a `.env`:

```bash
VITE_API_BASE_URL=https://itx-frontend-test.onrender.com
VITE_CACHE_TTL_MS=3600000
```

## Stack

| Pieza    | Elección                    | Por qué                                                                      |
| -------- | --------------------------- | ---------------------------------------------------------------------------- |
| Build    | Vite 6                      | Arranque instantáneo y build sin configuración                               |
| UI       | React 19                    | Exigido por el enunciado                                                     |
| Enrutado | React Router 7              | SPA con enrutado en cliente, sin SSR                                         |
| Lenguaje | JavaScript (ES6+)           | El enunciado permite ES6; los contratos se documentan con JSDoc              |
| Estilos  | CSS Modules + design tokens | Aislamiento sin dependencias ni runtime                                      |
| Tests    | Vitest + Testing Library    | Comparte configuración con Vite; se prueba comportamiento, no implementación |
| Estado   | Hooks + Context             | Suficiente para dos vistas; cero boilerplate                                 |

Sin dependencias de terceros más allá de React y el router: la caché, el cliente
HTTP y el filtrado son propios, que es justo lo que la prueba evalúa.

## Estructura

```
src/
├── api/         Cliente HTTP y servicios. Única capa que conoce el API.
│   ├── config.js      Dominio, timeout y endpoints
│   ├── http.js        Envoltorio de fetch con timeout y errores tipados
│   └── products.js    Servicios + caché + deduplicación de peticiones
├── lib/         Lógica pura sin React
│   ├── cache.js       Caché con expiración a 1 hora
│   ├── storage.js     Adaptador de localStorage tolerante a fallos
│   ├── search.js      Filtrado por marca y modelo
│   ├── format.js      Precios, pesos y valores de especificación
│   ├── productSpecs.js Traducción del detalle del API a ficha técnica
│   ├── availability.js Si un producto se puede comprar, y por qué no
│   └── listPosition.js Posición del listado al volver desde una ficha
├── hooks/       useProducts · useProduct · useAsyncResource
│                useDebouncedValue · useInfiniteScroll
├── context/     CartProvider (cesta) · BreadcrumbsProvider (migas de pan)
├── components/  layout/ · product/ · ui/
├── pages/       ProductListPage · ProductDetailPage · NotFoundPage
└── test/        setup, fixtures y helpers de render
```

## Decisiones técnicas

### Caché con expiración de una hora

`lib/cache.js` implementa una caché sobre `localStorage` donde cada entrada
guarda su instante de expiración. Al leer, una entrada caducada se elimina y se
trata como ausente, lo que fuerza la revalidación contra el API.

Se guarda el instante de expiración y no el de creación para que una entrada
escrita con un TTL concreto lo conserve aunque la configuración global cambie
después. Si `localStorage` no está disponible —modo privado, cookies
bloqueadas, cuota agotada—, degrada a memoria en lugar de romper: la caché es una
optimización, nunca un requisito para que la aplicación funcione.

Las mutaciones (`POST /api/cart`) no se cachean nunca.

### Deduplicación de peticiones

`api/products.js` mantiene un registro de peticiones en vuelo por clave. Sin él,
el doble montaje de React en StrictMode —o dos componentes pidiendo el mismo
producto— dispararían peticiones duplicadas antes de que la primera escribiese en
caché.

La señal de cancelación del llamante no se propaga a esa petición compartida a
propósito: si lo hiciera, desmontar un componente cancelaría la petición que
otros consumidores están esperando. La cancelación se gestiona en
`useAsyncResource`, que descarta el resultado obsoleto en lugar de abortar la
red.

### Búsqueda

El filtrado ocurre en cliente sobre la lista completa: son 100 productos y un
único endpoint sin parámetros de búsqueda, así que filtrar en memoria es
instantáneo y no genera tráfico.

El criterio vive en la query string (`?q=`), no en el estado del componente. Eso
hace que una búsqueda sea compartible, sobreviva a una recarga y —lo que más se
nota al usarlo— siga ahí al volver desde la ficha de un producto.

Sobre el mínimo que pide el enunciado (comparar con marca y modelo), la búsqueda
ignora mayúsculas y acentos y acepta los términos en cualquier orden: «s9 samsung»
encuentra el Samsung Galaxy S9.

Hay un _debounce_ de 250 ms. **El filtrado sigue siendo en tiempo real**: el
input responde en cada pulsación y lo único que se difiere es el recálculo de la
lista.

### Estados de carga y error

Todo dato remoto pasa por `useAsyncResource`, que expone una máquina de estados
explícita (`idle` / `loading` / `success` / `error`) en lugar de booleanos
sueltos, lo que elimina los estados imposibles del tipo «cargando y con error a
la vez».

Las cuatro situaciones están cubiertas en ambas vistas: esqueleto de carga en el
listado, error con botón de reintentar, resultado vacío con opción de limpiar la
búsqueda, y un 404 que se distingue de un error de servidor (reintentar un 404
solo repetiría el mismo error, así que en ese caso no se ofrece el botón).

### Scroll infinito

El listado muestra los productos en tandas de 12 y amplía la lista al acercarse
el usuario al final, mediante un `IntersectionObserver` sobre un centinela.

**No es paginación de servidor.** El API entrega los 100 productos de una vez y
no admite parámetros de paginado, así que aquí no se pide nada nuevo: solo se
decide cuántos de los que ya están en memoria se renderizan. Eso evita montar
100 tarjetas —y sus 100 imágenes— en la primera pintura.

Esto sigue cumpliendo el requisito de mostrar todos los elementos que devuelve
el API: están todos disponibles y se alcanzan sin filtrar nada; lo único que
cambia es que aparecen progresivamente.

**La carga de cada tanda tiene una pausa deliberada.** Los productos ya están en
memoria, así que técnicamente podrían aparecer al instante; el problema es que
entonces surgen de golpe y nada indica que haya ocurrido una carga. Durante la
pausa se muestran tarjetas fantasma que ocupan el sitio de los productos que
llegan, de modo que el crecimiento de la lista se anticipa en vez de dar un
salto. El botón no se sustituye por un indicador: se mantiene montado en estado
ocupado, porque si desapareciese, quien lo acabase de pulsar con el teclado
perdería el foco.

Una tanda en curso se cancela si el usuario cambia la búsqueda —pertenecía a
otra lista— y el disparo repetido del observador no encadena varias tandas.

El scroll infinito tiene dos problemas conocidos más, y ambos están resueltos:

- **Deja fuera a quien no hace scroll.** Sin un control real que enfocar, quien
  navega con teclado no tiene forma de pedir la siguiente tanda. Por eso, junto
  al centinela hay un botón «Cargar más productos» que hace lo mismo de forma
  explícita, y el progreso se anuncia con `aria-live` en cada tanda.
- **Pierde la posición al volver atrás.** Entrar en una ficha y volver
  devolvería al usuario a los 12 primeros productos, obligándole a repetir todo
  el scroll. La posición se guarda en `sessionStorage` asociada al criterio de
  búsqueda —si vuelve con otra búsqueda, se ignora— y `ScrollToTop` no salta
  arriba en las navegaciones `POP`, de modo que el navegador restaure el scroll.

Al cambiar el criterio de búsqueda se vuelve a la primera tanda: seguir en la
tercera de una lista que ahora tiene dos resultados no tendría sentido.

### Rejilla adaptativa

El enunciado fija un máximo de cuatro elementos por fila. La rejilla usa
`auto-fill` para reducir columnas al estrecharse la ventana y fija cuatro
columnas exactas a partir de `64rem`, de modo que en pantallas anchas nunca
aparece una quinta.

### Accesibilidad

No es un añadido cosmético: `eslint-plugin-jsx-a11y` se ejecuta en cada `lint`.

- Los selectores de compra son `fieldset` + `input[type=radio]` reales, no
  botones con ARIA: se obtiene gratis la semántica de grupo y la navegación con
  flechas.
- La ficha técnica usa listas de definición, que es exactamente lo que son unos
  pares etiqueta-valor.
- El número de resultados de la búsqueda y la confirmación de añadido a la cesta
  se anuncian con `aria-live`.
- Enlace de salto al contenido, foco visible en todos los controles y respeto por
  `prefers-reduced-motion`.

### Peculiaridades del API

Detectadas contra el servidor real y respetadas en el código y en los fixtures:

- `dimentions` y `secondaryCmera` están mal escritos en el origen.
- `displayResolution` contiene las **pulgadas** y `displaySize` los **píxeles**:
  están intercambiados respecto a su nombre. La «resolución de pantalla» que pide
  el enunciado sale por tanto de `displaySize`.
- `price` llega como cadena y puede venir vacía, lo que significa «no está a la
  venta» y no «cuesta 0 €». La UI lo muestra como «Precio no disponible».

### Datos ausentes

El API omite datos de varias formas —cadena vacía, solo espacios, `null`, campo
inexistente o array vacío— y la ficha aplica **dos reglas opuestas** según la
importancia del atributo:

- **Atributos obligatorios** (los once que exige el enunciado): la fila se
  mantiene siempre y el valor se muestra como `-`, atenuado. Conservarla permite
  comparar dos fichas línea a línea y deja claro que el dato se ha consultado y
  el API no lo aporta, que no es lo mismo que omitirlo sin más. Para lectores de
  pantalla se añade un texto «Dato no disponible», ya que un guion suelto se
  leería como «menos».
- **Atributos secundarios** (dentro de «Ver especificaciones completas»): la fila
  desaparece por completo, etiqueta incluida. Si el API no trae la GPU, no
  aparece ni la etiqueta «GPU». Veinte filas con guion convertirían la ficha en
  una lista de ausencias. Un grupo que se queda sin ninguna fila también
  desaparece, para no dejar un título huérfano.

La misma idea se aplica fuera de la ficha: una tarjeta sin marca no deja el hueco
vacío, un producto sin nombre conserva un encabezado legible para que el enlace
tenga nombre accesible, y una imagen que falta o falla muestra un marcador en vez
del icono de imagen rota.

### Productos que no se pueden comprar

Un producto solo es comprable si cumple las tres condiciones: tiene **precio**,
al menos una opción de **almacenamiento** y al menos una de **color**. Sin
precio no hay nada que vender, y sin opciones no existen el `colorCode` ni el
`storageCode` que exige el `POST /api/cart`: la petición no se podría ni
construir.

Cuando falla alguna, el botón de añadir se deshabilita y aparece un aviso que
nombra **todos** los motivos:

> Este producto no está disponible para la compra porque no tiene precio,
> opciones de almacenamiento ni opciones de color.

Se enumeran todos y no solo el primero porque una explicación que va cambiando
—«falta el precio»; y luego «faltan los colores»— parece que busca excusas. El
aviso se enlaza al botón con `aria-describedby`, de modo que un lector de
pantalla lo anuncie al llegar a él: un botón deshabilitado y mudo deja al
usuario adivinando.

Los selectores se siguen mostrando aunque el producto no sea comprable, para que
el usuario vea qué opciones existen. Y un precio de `0` cuenta como precio
válido: significa gratis, no inexistente.

Una opción solo se considera elegible si tiene **código y nombre**. El código lo
exige el `POST`, y el nombre es lo que el usuario lee para decidir. No es un
matiz teórico: en el catálogo real, Acer DX650 y Acer M900 devuelven
`storages: [{ code: 2000, name: " " }]`. Aceptar esa opción por tener código
pintaba una pastilla con un guion —que nadie puede elegir a conciencia— y dejaba
el producto como comprable.

Ejecutada la lógica sobre los 100 productos del catálogo real, quedan 8
bloqueados: 6 sin precio y 2 sin un almacenamiento utilizable.

La lógica vive en `lib/availability.js`, fuera del componente, para poder probar
las combinaciones sin montar React.

## Tests

171 tests con Vitest y Testing Library:

| Archivo                                   | Qué cubre                                                                               |
| ----------------------------------------- | --------------------------------------------------------------------------------------- |
| `lib/cache.test.js`                       | Expiración a la hora, entradas corruptas, degradación a memoria                         |
| `lib/search.test.js`                      | Filtrado por marca y modelo, acentos, orden de términos                                 |
| `lib/format.test.js`                      | Precios ausentes, arrays de especificación, unidades                                    |
| `lib/availability.test.js`                | Cuándo un producto no se puede comprar y cómo se explica el motivo                      |
| `lib/productSpecs.test.js`                | Los once atributos obligatorios, las erratas del API y las dos reglas de datos ausentes |
| `api/products.test.js`                    | Caché, deduplicación, errores de red y contrato del POST                                |
| `context/CartProvider.test.jsx`           | Persistencia del contador y fallo del API                                               |
| `components/product/ProductCard.test.jsx` | Tarjeta con marca, modelo, precio o imagen ausentes                                     |
| `pages/ProductListPage.test.jsx`          | Listado, búsqueda, scroll infinito, estados vacío y de error                            |
| `pages/ProductDetailPage.test.jsx`        | Ficha, selectores, preselección, añadido y datos ausentes                               |

Se simula el `fetch` global, no los módulos de servicios: así los tests ejercitan
el cliente HTTP y la caché reales, que es donde está la lógica que importa. Los
fixtures son respuestas copiadas del API real, con sus erratas incluidas.

```bash
npm test
npm run test:coverage
```

## Cumplimiento del enunciado

| Requisito                                                     | Estado |
| ------------------------------------------------------------- | ------ |
| SPA con enrutado en cliente, sin SSR ni MPA                   | ✅     |
| Scripts `start`, `build`, `test`, `lint`                      | ✅     |
| PLP con todos los productos del API                           | ✅     |
| Búsqueda en tiempo real por marca y modelo                    | ✅     |
| Navegación al detalle desde el listado                        | ✅     |
| Máximo cuatro elementos por fila, adaptativo                  | ✅     |
| PDP a dos columnas: imagen · detalles y acciones              | ✅     |
| Enlace de vuelta al listado                                   | ✅     |
| Cabecera: logo enlazado, breadcrumbs y contador de cesta      | ✅     |
| Los once atributos obligatorios de la descripción             | ✅     |
| Selectores de almacenamiento y color, preseleccionados        | ✅     |
| POST a la cesta con `id`, `colorCode` y `storageCode`         | ✅     |
| Contador de la cesta persistido y visible en todas las vistas | ✅     |
| Caché de cliente con expiración de una hora                   | ✅     |

Sobre el mínimo exigido, se añade el bloqueo de compra en productos incompletos:
sin precio, sin almacenamiento o sin color, el botón se deshabilita y se explica
el motivo.

## Licencia

Proyecto de evaluación técnica, sin licencia de distribución.
