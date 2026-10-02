import { defineConfig } from 'vite';
import { cpSync, existsSync, readdirSync, rmSync } from 'node:fs';

export default defineConfig({
  base:'/MONO-prime/',
  build:{target:'es2022'},
  plugins:[{
    name:'mono-pages',
    closeBundle(){
      if (existsSync('dist/index.html')) cpSync('dist/index.html','index.html');
      if (existsSync('dist/assets')) {
        for (const entry of readdirSync('assets',{withFileTypes:true})) {
          if (entry.isFile() && /^(app|reader)-/.test(entry.name)) rmSync('assets/'+entry.name);
        }
        cpSync('dist/assets','assets',{recursive:true});
      }
      for (const name of ['art','fonts','canon','favicon.svg']) {
        if (existsSync('dist/'+name)) cpSync('dist/'+name,name,{recursive:true});
      }
    }
  }]
});
