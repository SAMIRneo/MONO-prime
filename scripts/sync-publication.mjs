import { cpSync, existsSync, lstatSync, realpathSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const managed = new Set(['assets', 'art', 'fonts', 'canon', 'qa']);
export function syncDirectory(root, name) {
  if (!managed.has(name)) throw new Error('Unmanaged publication directory');
  const base = realpathSync(root);
  const source = resolve(base, 'dist', name);
  const target = resolve(base, name);
  if (!existsSync(source)) throw new Error('Missing build directory: ' + name);
  if (dirname(target) !== base || realpathSync(resolve(base, 'dist')) !== resolve(base, 'dist') || lstatSync(source).isSymbolicLink() || (existsSync(target) && lstatSync(target).isSymbolicLink())) throw new Error('Unsafe publication path');
  rmSync(target, { recursive: true, force: true });
  cpSync(source, target, { recursive: true });
}
