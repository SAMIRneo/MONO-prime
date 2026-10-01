import { defineConfig } from 'vite';
import { cpSync, readdirSync, writeFileSync } from 'node:fs';
export default defineConfig({
 base:'/MONO-prime/',
 build:{target:'es2022',rollupOptions:{input:'app.html'}},
 plugins:[{
  name:'mono-pages',
  configureServer(server){server.middlewares.use((req,_res,next)=>{if(req.url&&/^\/(?:MONO-prime\/)?(?:index\.html)?(?:\?|$)/.test(req.url))req.url=req.url.replace(/^(\/(?:MONO-prime\/)?)(?:index\.html)?/,'$1app.html');next();});},
  closeBundle(){
   cpSync('assets/hub/art','dist/assets/hub/art',{recursive:true});
   cpSync('assets/hub/portraits','dist/assets/hub/portraits',{recursive:true});
   cpSync('dist/app.html','dist/index.html');
   // Support Pages both from the workflow artifact and from the main branch.
   cpSync('dist/index.html','index.html');
   for(const entry of readdirSync('dist/assets',{withFileTypes:true}))if(entry.isFile())cpSync('dist/assets/'+entry.name,'assets/'+entry.name);
   writeFileSync('.nojekyll','');
  }
 }]
});
