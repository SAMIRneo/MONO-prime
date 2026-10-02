import { defineConfig } from 'vite';
import { cpSync, readdirSync, rmSync } from 'node:fs';
export default defineConfig({
 base:'/MONO-prime/',
 build:{target:'es2022',rollupOptions:{input:'app.html'}},
 plugins:[{
  name:'mono-pages',
  configureServer(server){server.middlewares.use((req,_res,next)=>{if(req.url&&/^\/(?:MONO-prime\/)?(?:index\.html)?(?:\?|$)/.test(req.url))req.url=req.url.replace(/^(\/(?:MONO-prime\/)?)(?:index\.html)?/,'$1app.html');next();});},
  closeBundle(){
   cpSync('dist/app.html','dist/index.html');
   rmSync('dist/app.html');
   cpSync('dist/index.html','index.html');
   for(const entry of readdirSync('assets',{withFileTypes:true}))if(entry.isFile()&&/^(app|reader)-/.test(entry.name))rmSync('assets/'+entry.name);
   cpSync('dist/assets','assets',{recursive:true});
   for(const name of ['art','fonts','canon','favicon.svg'])cpSync('dist/'+name,name,{recursive:true});
  }
 }]
});
