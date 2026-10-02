import { defineConfig } from 'vite';
import { cpSync, existsSync, readdirSync, rmSync } from 'node:fs';

export default defineConfig({
  base:'/MONO-prime/',
  build:{
    target:'es2022',
    rollupOptions:{input:{app:'app.html'}}
  },
  plugins:[{
    name:'mono-pages',
    closeBundle(){
      const built = existsSync('dist/app.html') ? 'dist/app.html' : 'dist/index.html';
      if (existsSync(built)) {
        cpSync(built,'dist/index.html');
        cpSync(built,'index.html');
      }
      if (existsSync('dist/assets')) {
        for (const entry of readdirSync('assets',{withFileTypes:true})) {
          if (entry.isFile() && /^(app|index|reader)-/.test(entry.name)) rmSync('assets/'+entry.name);
        }
        cpSync('dist/assets','assets',{recursive:true});
      }
      for (const name of ['art','fonts','canon','favicon.svg']) {
        if (existsSync('dist/'+name)) cpSync('dist/'+name,name,{recursive:true});
      }
    }
  }]
});
