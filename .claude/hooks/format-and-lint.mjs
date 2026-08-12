#!/usr/bin/env node
/**
 * Hook PostToolUse: formatea y analiza el archivo que se acaba de escribir.
 *
 * Se ejecuta tras cada Write/Edit sobre código del proyecto y hace dos cosas:
 *
 *   1. Aplica Prettier al archivo, de modo que el estilo nunca sea materia de
 *      discusión ni genere ruido en los diffs.
 *   2. Pasa ESLint solo a ese archivo. Si hay errores, sale con código 2 para
 *      que Claude los reciba por stderr y los corrija en el acto, en lugar de
 *      descubrirlos al final en la verificación completa.
 *
 * Se analiza únicamente el archivo tocado y no el proyecto entero: así el
 * hook tarda décimas de segundo y no penaliza cada edición.
 */

import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/** Extensiones sobre las que tiene sentido actuar. */
const HANDLED_EXTENSIONS = ['.js', '.jsx', '.css', '.json', '.md'];

/** Solo se analiza el código fuente; no la configuración ni lo generado. */
const LINTABLE_PREFIXES = ['src', '.claude/hooks'];

/** Lee el payload JSON que Claude Code envía por stdin. */
async function readHookInput() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  } catch {
    return {};
  }
}

/** Ejecuta un binario local de node_modules/.bin. */
async function runLocalBin(name, args, cwd) {
  const binary = process.platform === 'win32' ? `${name}.cmd` : name;
  const binaryPath = resolve(cwd, 'node_modules', '.bin', binary);

  if (!existsSync(binaryPath)) {
    return { skipped: true, stdout: '', stderr: '', code: 0 };
  }

  try {
    const { stdout, stderr } = await execFileAsync(binaryPath, args, {
      cwd,
      shell: process.platform === 'win32',
    });
    return { skipped: false, stdout, stderr, code: 0 };
  } catch (error) {
    return {
      skipped: false,
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? String(error.message ?? error),
      code: error.code ?? 1,
    };
  }
}

async function main() {
  const input = await readHookInput();

  const filePath = input?.tool_input?.file_path;
  if (!filePath) process.exit(0);

  const cwd = input.cwd ?? process.cwd();
  const relativePath = relative(cwd, filePath).replaceAll('\\', '/');

  // Fuera del proyecto, o en una ruta que no nos incumbe.
  if (relativePath.startsWith('..')) process.exit(0);
  if (relativePath.startsWith('node_modules/') || relativePath.startsWith('dist/')) process.exit(0);
  if (!HANDLED_EXTENSIONS.some((extension) => relativePath.endsWith(extension))) process.exit(0);

  await runLocalBin('prettier', ['--write', relativePath], cwd);

  const isLintable =
    LINTABLE_PREFIXES.some((prefix) => relativePath.startsWith(`${prefix}/`)) &&
    (relativePath.endsWith('.js') ||
      relativePath.endsWith('.jsx') ||
      relativePath.endsWith('.mjs'));

  if (!isLintable) process.exit(0);

  const lint = await runLocalBin('eslint', ['--format', 'stylish', relativePath], cwd);

  if (lint.code !== 0 && lint.stdout.trim()) {
    // Código 2: Claude Code entrega stderr al modelo para que lo resuelva.
    process.stderr.write(
      `ESLint ha encontrado problemas en ${relativePath} que debes corregir:\n\n${lint.stdout}\n`
    );
    process.exit(2);
  }

  process.exit(0);
}

main().catch((error) => {
  // Un fallo del propio hook nunca debe bloquear el trabajo.
  process.stderr.write(`[format-and-lint] El hook ha fallado: ${error?.message ?? error}\n`);
  process.exit(0);
});
