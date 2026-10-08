import { defineConfig } from 'vite';
import { cpSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { syncDirectory } from './scripts/sync-publication.mjs';
const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  base:'/MONO-prime/',
  build:{
    target:'es2022',
    rollupOptions:{input:{app:'app.html'}}
  },
  plugins:[{
    name:'mono-pages',
    closeBundle(){
      cpSync(resolve(root,'dist/app.html'),resolve(root,'dist/index.html'));
      cpSync(resolve(root,'dist/index.html'),resolve(root,'index.html'));
      for (const name of ['assets','art','fonts','canon','qa']) syncDirectory(root,name);
      for (const name of ['favicon.svg','mono-mark.svg','mono-weave.svg']) cpSync(resolve(root,'dist',name),resolve(root,name));
    }
  }]
});
