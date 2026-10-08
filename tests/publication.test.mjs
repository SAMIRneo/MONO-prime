import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { syncDirectory } from '../scripts/sync-publication.mjs';

test('publication removes stale files and refuses unmanaged destinations', () => {
  const root = mkdtempSync(join(tmpdir(), 'mono-publication-'));
  try {
    mkdirSync(join(root,'dist','art'),{recursive:true});
    mkdirSync(join(root,'art'));
    writeFileSync(join(root,'art','obsolete.webp'),'old');
    writeFileSync(join(root,'dist','art','current.webp'),'current');
    assert.throws(() => syncDirectory(root,'../outside'), /Unmanaged/);
    assert.throws(() => syncDirectory(root,'fonts'), /Missing/);
    syncDirectory(root,'art');
    assert.deepEqual(readdirSync(join(root,'art')),['current.webp']);
  } finally {
    if (root.startsWith(join(tmpdir(),'mono-publication-'))) rmSync(root,{recursive:true,force:true});
  }
});
