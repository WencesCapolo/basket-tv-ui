// @vitest-environment node
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const raiz = fileURLToPath(new URL('..', import.meta.url));

// A plain Node server (facturación) imports dist/ with no bundler: every
// relative import there must carry its extension.
describe('dist', () => {
  it('loads in plain Node ESM', () => {
    const salida = execFileSync(
      process.execPath,
      ['--input-type=module', '-e', "const m = await import('./dist/index.js'); console.log(m.urlDeSolicitud('https://p', 'x'));"],
      { cwd: raiz, encoding: 'utf8' },
    );

    expect(salida.trim()).toBe('https://p/no-access?app=x');
  });
});
