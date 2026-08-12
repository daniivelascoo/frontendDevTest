#!/usr/bin/env node
/**
 * Hook SessionStart: inyecta el estado real del proyecto al abrir la sesión.
 *
 * Evita el arranque a ciegas —y las suposiciones equivocadas sobre en qué
 * punto quedó el trabajo— resumiendo rama, cambios sin confirmar, últimos
 * hitos y si las dependencias están instaladas.
 *
 * Lo que escriba en stdout se añade al contexto de Claude.
 */

import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const cwd = process.cwd();

/** Ejecuta git y devuelve stdout limpio, o null si el comando falla. */
async function git(args) {
  try {
    const { stdout } = await execFileAsync('git', args, { cwd });
    return stdout.trim();
  } catch {
    return null;
  }
}

async function main() {
  const lines = [];

  const branch = await git(['rev-parse', '--abbrev-ref', 'HEAD']);
  if (branch) lines.push(`Rama actual: ${branch}`);

  const changes = await git(['status', '--porcelain']);
  if (changes !== null) {
    const changed = changes.split('\n').filter(Boolean);
    lines.push(
      changed.length === 0
        ? 'Árbol de trabajo limpio.'
        : `Cambios sin confirmar (${changed.length}):\n${changed.slice(0, 15).join('\n')}`
    );
  }

  const log = await git(['log', '--oneline', '-5']);
  if (log) lines.push(`Últimos hitos:\n${log}`);

  if (!existsSync(resolve(cwd, 'node_modules'))) {
    lines.push('AVISO: node_modules no existe. Hay que ejecutar `npm install` antes de nada.');
  }

  if (lines.length > 0) {
    process.stdout.write(`Estado del proyecto al iniciar la sesión:\n\n${lines.join('\n\n')}\n`);
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
