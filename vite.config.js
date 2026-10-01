import { defineConfig } from 'vite';
import { cpSync } from 'node:fs';
export default defineConfig({base:'/MONO-prime/',build:{target:'es2022'},plugins:[{name:'mono-art',closeBundle(){cpSync('assets/hub/art','dist/assets/hub/art',{recursive:true});cpSync('assets/hub/portraits','dist/assets/hub/portraits',{recursive:true});}}]});
