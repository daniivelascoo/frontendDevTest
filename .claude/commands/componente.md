---
description: Crea un componente nuevo con su CSS Module y su test, siguiendo las convenciones del proyecto
argument-hint: <Nombre> [carpeta: layout|product|ui] [qué debe hacer]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(npm test), Bash(npx vitest run:*)
---

Crea un componente nuevo: $ARGUMENTS

Antes de escribir, lee `.claude/skills/convenciones-react/SKILL.md` y abre un
componente ya existente de la misma carpeta para imitar su estructura y su tono.

Genera tres archivos en `src/components/<carpeta>/`:

1. **`<Nombre>.jsx`** — exportación nombrada, bloque JSDoc encima del componente
   describiendo qué resuelve y sus props. Sin `export default` y sin PropTypes.
2. **`<Nombre>.module.css`** — clases en `camelCase`, todos los valores tomados
   de los tokens de `styles/tokens.css`. Si necesitas un valor que no existe,
   añádelo como token en vez de escribirlo a pelo.
3. **`<Nombre>.test.jsx`** — tests del comportamiento observable, con
   `renderWithProviders` si el componente necesita router o contexto.

Requisitos que no son negociables:

- Elige el elemento HTML por su semántica antes de recurrir a ARIA.
- Todo control interactivo lleva nombre accesible.
- Si el componente carga datos, cubre los cuatro estados: cargando, error, vacío
  y con datos.

Al terminar, ejecuta los tests del componente y enseña el resultado.
