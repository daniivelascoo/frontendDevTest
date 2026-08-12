---
name: convenciones-react
description: Convenciones de este proyecto para escribir componentes, hooks, CSS Modules y capa de datos en React con JavaScript. Úsala antes de crear o refactorizar cualquier archivo de src/, para que el código nuevo no desentone del existente.
---

# Cómo se escribe código en este proyecto

Reglas concretas, no principios generales. Si una regla te estorba para resolver
bien un problema, sáltatela y explica por qué en un comentario.

## Estructura de carpetas

```
src/
├── api/         Cliente HTTP y servicios. Es la única capa que conoce el API.
├── lib/         Lógica pura sin React: caché, formato, filtrado, specs.
├── hooks/       Hooks reutilizables.
├── context/     Estado compartido (cesta, migas de pan).
├── components/  Componentes de presentación, agrupados por dominio.
│   ├── layout/  Cabecera, migas, contador, estructura de página.
│   ├── product/ Todo lo específico de productos.
│   └── ui/      Piezas genéricas sin conocimiento del dominio.
└── pages/       Una carpeta por vista del router.
```

La dirección de las dependencias es siempre `pages → components → hooks → lib`.
Un archivo de `lib/` que importe React es señal de que está en la capa
equivocada.

## Componentes

- **Exportación nombrada**, nunca `export default`. Facilita renombrar y evita
  que dos archivos importen el mismo componente con nombres distintos.
- Un componente por archivo, con el mismo nombre que el archivo.
- Sin `PropTypes`: los contratos se documentan con un bloque **JSDoc** encima del
  componente y se verifican con tests.
- Nada de `React.FC` ni de tipos: esto es JavaScript.
- Las extensiones se escriben en los imports (`./Button.jsx`), porque el proyecto
  usa ESM nativo.

```jsx
/**
 * Descripción de qué resuelve el componente y, si hay algo no evidente,
 * por qué se resolvió así.
 *
 * @param {object} props
 * @param {string} props.label
 */
export function MiComponente({ label }) { /* … */ }
```

## Estilos

- Un `Componente.module.css` junto a su `Componente.jsx`.
- **Todos** los valores salen de los tokens de `styles/tokens.css`. Si necesitas
  un color o un espaciado que no existe, añádelo como token; no lo escribas a
  pelo en el módulo.
- Nombres de clase en `camelCase`, porque así se consumen desde JS.
- Los media queries van en `rem`, y el diseño se piensa primero en móvil.
- Nada de estilos en línea salvo en `ErrorBoundary`, que debe funcionar aunque
  el CSS no haya llegado a cargar.

## Estado y datos

- Peticiones al API **solo** desde `api/`. Un componente nunca llama a `fetch`.
- Todo dato remoto pasa por `useAsyncResource`, que expone un `status`
  (`idle` / `loading` / `success` / `error`) en lugar de booleanos sueltos.
- Al pintar, cubre siempre los cuatro estados: cargando, error, vacío y con
  datos. Un estado vacío sin mensaje es un bug.
- Estado local con `useState`; compartido con Context. No hace falta nada más
  para una aplicación de dos vistas.
- Si un valor es reconstruible a partir de otro, no lo guardes en estado:
  derívalo con `useMemo`.

## Accesibilidad

No es un extra opcional; `eslint-plugin-jsx-a11y` corre en cada commit.

- Elige el elemento HTML por su semántica antes de recurrir a ARIA: `fieldset` y
  `radio` para los selectores, `dl` para pares etiqueta-valor, `ul`/`li` para las
  listas.
- Todo control interactivo necesita nombre accesible: texto visible,
  `aria-label` o un `<label>` asociado.
- Los estados que solo se perciben visualmente (número de resultados, producto
  añadido) se anuncian con `aria-live`.
- Las imágenes decorativas llevan `aria-hidden="true"`; las informativas, un
  `alt` que describa el producto.

## Comentarios

Comenta el **porqué**, nunca el qué. Un comentario que parafrasea la línea
siguiente es ruido que además envejece mal.

Merecen comentario: las peculiaridades del API, las decisiones que parecen
raras sin contexto (por qué no se propaga el `AbortSignal`, por qué el estado se
ajusta durante el render) y las concesiones deliberadas.

## Antes de dar algo por terminado

```bash
npm run check   # lint + formato + tests + build
```

El hook de `PostToolUse` ya formatea y analiza cada archivo que tocas, así que
`check` no debería sorprenderte casi nunca.
