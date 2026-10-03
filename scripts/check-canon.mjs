import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const d=JSON.parse(readFileSync('src/data/canon.json','utf8'));
const ids=new Set(d.records.map(e=>e.id));
const groups=new Set(d.categories.map(g=>g.id));
const art=JSON.parse(readFileSync('src/data/art.json','utf8'));
assert.equal(ids.size,d.records.length,'Duplicate record');
assert.equal(groups.size,d.categories.length,'Duplicate category');
assert(groups.has('powerscaling'),'Missing Powerscaling category');
for(const [id,count] of [['sept-voies',7],['inversions-abyssales',7],['lignees-sillage',6]]){
 const entry=d.records.find(e=>e.id===id);
 assert(entry?.category==='powerscaling'&&entry.sections.length>=count,id+' incomplete powers guide');
}
for(const [group,count] of [['puissances',3],['archanges',7],['revers',7],['lignees',6],['cultes',4]])assert.equal(d.records.filter(r=>r.category===group).length,count,group);
for(const e of d.records){
 assert(groups.has(e.category),e.id+' unknown category');
 assert(e.title&&e.summary&&e.sections.length,e.id+' incomplete');
 for(const s of e.sections)assert(s.title&&s.text,e.id+' incomplete section');
 for(const id of e.links)assert(ids.has(id)||groups.has(id),e.id+' broken reference '+id);
 if(e.art){
  const m=art[e.art];
  assert(m&&m.width>0&&m.height>0&&m.smallWidth>0&&m.mediumWidth>=m.smallWidth&&m.width>=m.mediumWidth,e.id+' invalid image dimensions');
  for(const suffix of ['', '-small', '-medium']){
   const path=`public/art/${e.art}${suffix}.webp`;
   assert(existsSync(path)&&statSync(path).size>0,e.id+' missing or empty art');
   const bytes=readFileSync(path);
   assert(bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP',e.id+' invalid WebP');
  }
 }
}
for(const b of d.books){
 assert(b.chapters.length>0,'Empty book');
 assert(d.records.some(e=>e.art===b.art),'Unknown book art '+b.art);
 assert(new Set(b.chapters.map(c=>c.id)).size===b.chapters.length,'Duplicate chapter');
 for(const c of b.chapters)assert(c.title&&c.paragraphs.length,'Empty chapter');
}
const text=JSON.stringify(d);
for(const phrase of ['Onzième primordial','Dix Primordiaux','seul Archange à avoir quitté','Les 7 étages célestes','Trois dans les Cieux','Trois dans les Abysses'])assert(!text.includes(phrase),'Obsolete canon '+phrase);
assert(d.records.find(e=>e.id==='temoins').summary.includes('Tous les Témoins'));
assert(d.records.find(e=>e.id==='malkiel').category==='archanges');
assert(d.records.find(e=>e.id==='qerath').category==='puissances');
assert(d.records.find(e=>e.id==='eshar').open_questions.length>0);
mkdirSync('public/canon',{recursive:true});
const header=`# MONO — Canon ${d.version}\n\nVersion consolidée le ${d.updated}. Source éditoriale : src/data/canon.json.\n\nLes descriptions visuelles sont des interprétations. Les questions ouvertes sont explicitement distinguées des règles établies.\n\n`;
let lore=header;
for(const g of d.categories){lore+=`# ${g.label}\n\n`;for(const e of d.records.filter(e=>e.category===g.id)){lore+=`## ${e.title}\n\n${e.subtitle}\n\n${e.summary}\n\n`;for(const s of e.sections)lore+=`### ${s.title}\n\n${s.text}\n\n`;if(e.open_questions.length)lore+=`### À développer\n\n${e.open_questions.map(q=>'- '+q).join('\n')}\n\n`;}}
lore+='# Chronologie\n\n'+d.eras.map(e=>`- **${e.date}** — ${e.text} (${e.status})`).join('\n')+'\n';
writeFileSync('public/canon/MONO_CANON_V9.md',lore);
let stories=header;for(const b of d.books){stories+=`# ${b.title}\n\n${b.subtitle}\n\n`;for(const c of b.chapters)stories+=`## ${c.title}\n\n${c.paragraphs.join('\n\n')}\n\n`;}
writeFileSync('public/canon/MONO_RECITS_V9.md',stories.trimEnd()+'\n');
console.log(`Canon ${d.version} validé : ${d.records.length} fiches, ${d.books.reduce((n,b)=>n+b.chapters.length,0)} chapitres, références et illustrations vérifiées.`);
