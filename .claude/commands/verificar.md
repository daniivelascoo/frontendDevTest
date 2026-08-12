---
description: Ejecuta la verificación completa (lint, formato, tests y build) y resume el resultado
allowed-tools: Bash(npm run check), Bash(npm run lint), Bash(npm test), Bash(npm run build), Bash(npm run format:check), Read, Edit
---

Ejecuta `npm run check`, que encadena lint, comprobación de formato, tests y
build de producción.

Si todo pasa, resume en dos líneas: número de tests y tamaño del bundle.

Si algo falla:

1. Identifica la causa raíz leyendo la salida, sin suponerla.
2. Arréglala.
3. Vuelve a ejecutar `npm run check` hasta que pase.

No relajes una regla de ESLint ni debilites una aserción de un test para que la
verificación pase. Si un fallo revela que la regla o el test estaban mal
planteados, dilo explícitamente antes de tocarlos.
