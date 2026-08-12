---
description: Cierra un hito del proyecto verificando y creando un commit con mensaje descriptivo
argument-hint: [descripción breve del hito]
allowed-tools: Bash(npm run check), Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(git log:*), Read
---

El enunciado pide una entrega **evolutiva**: el histórico debe leerse como una
sucesión de hitos con sentido propio. Este comando cierra uno.

Hito a cerrar: $ARGUMENTS

Pasos:

1. Ejecuta `npm run check`. Si falla, **no** hagas el commit: arregla primero lo
   que esté roto.
2. Revisa `git status` y `git diff` para saber exactamente qué vas a confirmar.
   Comprueba que no se cuela nada que no deba: `.env`, `dist/`, `node_modules/`,
   archivos temporales.
3. Añade los archivos que pertenecen al hito. Si el árbol contiene cambios de
   dos temas distintos, dilo y pregunta antes de mezclarlos en un commit.
4. Crea el commit siguiendo el formato de los anteriores (`git log --oneline`).
   Convención del proyecto: `tipo: descripción en imperativo`, con los tipos
   `feat`, `fix`, `test`, `docs`, `chore`, `refactor`, `style`.

El cuerpo del mensaje explica **qué aporta el hito y por qué**, no la lista de
archivos tocados —eso ya está en el diff—. En castellano, como el resto del
proyecto.

No hagas `push` salvo que te lo pidan explícitamente.
