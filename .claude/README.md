# Toolkit de Claude Code

Configuración de [Claude Code](https://claude.com/claude-code) para desarrollar y
mantener este proyecto. Todo lo de esta carpeta es **opcional**: la aplicación se
instala, se ejecuta y se prueba sin ella. Si no usas Claude Code, ignórala.

## Qué hay aquí

```
.claude/
├── settings.json      Permisos y hooks del proyecto
├── skills/            Documentación que Claude carga bajo demanda
├── agents/            Subagentes especializados
├── commands/          Comandos de barra (/verificar, /hito, …)
└── hooks/             Scripts que se ejecutan en momentos concretos
```

`CLAUDE.md` **no** está aquí sino en la raíz del repositorio, que es donde Claude
Code lo carga automáticamente al iniciar cada sesión. Es el índice: resume la
arquitectura, los comandos y las decisiones que no conviene deshacer, y remite a
las skills para el detalle.

## Skills

Son documentos que Claude carga cuando la tarea lo pide, en lugar de ocupar
contexto en todas las sesiones. La descripción del *frontmatter* es lo que decide
si se activan, así que si añades una, descríbela por **cuándo** usarla y no solo
por qué contiene.

| Skill | Contenido | Se activa cuando |
|-------|-----------|------------------|
| `spec-itx` | Requisitos del enunciado con identificador y evidencia, contrato del API y sus erratas | Se implementa o modifica una vista, o se comprueba el cumplimiento |
| `convenciones-react` | Estructura de carpetas, estilo de componentes, CSS Modules, accesibilidad | Se crea o refactoriza cualquier archivo de `src/` |
| `testing-rtl` | Helpers, fixtures, qué probar y trampas conocidas | Se escribe o arregla un test |

La división es deliberada: `spec-itx` responde **qué** debe hacer la aplicación y
`convenciones-react` **cómo** se escribe. Cuando ambas aplican, manda la primera.

## Agentes

Se ejecutan en su propio contexto y devuelven un informe, de modo que una
auditoría larga no llena la conversación principal.

| Agente | Para qué | Puede escribir |
|--------|----------|----------------|
| `auditor-spec` | Contrasta el proyecto con el enunciado y devuelve una tabla de cumplimiento con evidencias | No |
| `revisor-react` | Revisa bugs reales, accesibilidad y contrato del API en los cambios sin confirmar | No |
| `autor-tests` | Escribe los tests que faltan siguiendo los helpers del proyecto | Solo `*.test.js(x)` y fixtures |

`auditor-spec` y `revisor-react` son deliberadamente de solo lectura: un agente
que audita y a la vez arregla tiende a maquillar lo que encuentra.

## Comandos

| Comando | Qué hace |
|---------|----------|
| `/verificar` | Ejecuta `npm run check` y arregla lo que falle, sin relajar reglas ni aserciones |
| `/hito <descripción>` | Verifica y crea el commit de un hito, siguiendo la convención de mensajes |
| `/componente <Nombre> [carpeta]` | Crea componente, CSS Module y test siguiendo las convenciones |
| `/auditar` | Lanza `auditor-spec` y traslada su informe |

`/hito` existe porque el enunciado pide entrega evolutiva: el histórico de git
forma parte de lo que se evalúa, así que cerrar hitos es una tarea recurrente que
merece su propio comando.

## Hooks

| Hook | Evento | Qué hace |
|------|--------|----------|
| `format-and-lint.mjs` | `PostToolUse` en `Write`/`Edit` | Aplica Prettier al archivo tocado y le pasa ESLint. Si hay errores, sale con código 2 para que Claude los corrija en el acto |
| `session-context.mjs` | `SessionStart` | Inyecta rama, cambios sin confirmar, últimos hitos y si faltan dependencias |

Ambos están escritos en Node (`.mjs`) y no en shell, para que funcionen igual en
Windows, macOS y Linux. Reciben el payload del evento por stdin en JSON.

Dos decisiones que conviene conocer si los modificas:

- `format-and-lint.mjs` analiza **solo el archivo tocado**, no el proyecto
  entero. Así tarda décimas de segundo y no penaliza cada edición; la
  verificación global es cosa de `npm run check`.
- Si el propio hook falla, sale con código 0. Un hook roto nunca debe bloquear el
  trabajo.

Para desactivarlos temporalmente, comenta la sección `hooks` de `settings.json`.

## Permisos

`settings.json` preautoriza los comandos de rutina (`npm run lint`, `npm test`,
`git status`, `git diff`…) para no interrumpir con confirmaciones a cada paso.

Lo que toca el repositorio remoto o destruye trabajo sigue pidiendo permiso
(`git push`, `git reset --hard`), y la lectura de archivos `.env` está denegada.

## Añadir algo nuevo

- **Skill**: `.claude/skills/<nombre>/SKILL.md` con `name` y `description` en el
  frontmatter. Descríbela por cuándo debe usarse.
- **Agente**: `.claude/agents/<nombre>.md` con `name`, `description`, `tools` y
  `model`. Dale las herramientas mínimas que necesite.
- **Comando**: `.claude/commands/<nombre>.md` con `description` y, si procede,
  `argument-hint` y `allowed-tools`. Se invoca como `/<nombre>`.
