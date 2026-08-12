---
description: Audita el proyecto contra los requisitos del enunciado y devuelve un informe de cumplimiento
allowed-tools: Task, Read, Grep, Glob, Bash(npm test)
---

Lanza el agente `auditor-spec` para contrastar el estado actual del proyecto con
los requisitos del enunciado de la prueba técnica.

$ARGUMENTS

Cuando el agente termine, traslada su informe íntegro: la tabla de requisitos con
su estado y evidencia, y las listas de bloqueantes y mejoras. El informe del
agente no lo ve el usuario, así que resúmelo tú sin omitir ningún ❌ ni ⚠️.

Después, propón el siguiente paso concreto —qué arreglarías primero y por qué—,
pero no empieces a implementarlo sin que te lo confirmen.
