/* MONO V6 — Codex public à deux espaces (LORE, EXPLORER) : registre de fiches, chronologie et recherche.
   JavaScript natif, aucune dépendance. Les vues sont des chaînes HTML, l'accueil est pré-rendu au build. */
(() => {
'use strict';
const D=window.MONO_CATALOGUE, $=id=>document.getElementById(id);
if(!D||!Array.isArray(D.records)){const main=$('main');if(main)main.innerHTML='<h1>Le Codex ne peut pas être chargé.</h1><p>Rechargez la page pour réessayer.</p>';return;}
const P=D.presentation||{}, records=D.records, byId=new Map(records.map(r=>[r.id,r]));
const eras=(D.eras||[]).slice().sort((a,b)=>a.order-b.order), pillars=D.pillars||[], spaces=D.spaces||{};
const spaceOf=id=>spaces[id]||{label:id,kicker:'',description:'',pillar:'explorer',order:0};
const pillarOf=rec=>rec.pillar||spaceOf(rec.space).pillar||'explorer';
const pillarDef=id=>pillars.find(p=>p.id===id)||{id,title:String(id).toUpperCase(),subtitle:'',description:'',spaces:[]};
const recsOf=space=>records.filter(r=>r.space===space);
const recsOfPillar=pillar=>records.filter(r=>pillarOf(r)===pillar);
const folioIndex=new Map(records.map((r,i)=>[r.id,i+1]));
const folio=rec=>String(folioIndex.get(rec.id)||0).padStart(3,'0');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>String(v??'').replace(/[\u2019\u2018]/g,"'").normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const link=id=>'#/fiche/'+encodeURIComponent(id);
const rel=ids=>(ids||[]).map(id=>byId.get(id)).filter(Boolean);
const isStub=rec=>String(rec.body||'').length<100;
const STATUS={canon:'CANON',proposition:'PROPOSITION',hypothese:'HYPOTHÈSE',legende:'LÉGENDE INTERNE',rumeur:'RUMEUR',obsolete:'OBSOLÈTE'};
const statusKey=rec=>STATUS[rec.status]?rec.status:'canon';
const statusChip=rec=>'<span class="chip chip-status chip-'+statusKey(rec)+'">'+esc(STATUS[rec.status]||rec.status)+'</span>';
const stubTag=rec=>isStub(rec)?'<span class="chip chip-stub">NOTICE BRÈVE</span>':'';
const spaceChip=rec=>'<a class="chip chip-space" href="#/'+pillarOf(rec)+'/'+esc(rec.space)+'">'+esc(spaceOf(rec.space).label)+'</a>';

/* Sigil : monogramme déterministe par fiche — cadre à angles droits, anneau mesuré, marques et glyphe de type. */
function hash(str){let h=2166136261;for(let i=0;i<String(str).length;i++){h^=String(str).charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
const GLYPHS=[[/culte|doctrine/,'diamond'],[/lignee/,'chevron'],[/archange|ordre|entite|personnage/,'spire'],[/ere|evenement|arc|chronique/,'wave'],[/monde|continent|ocean|region|sphere|lieu|cite|etat|dimension|nation/,'square'],[/rite/,'cross'],[/faction/,'claw'],[/fonction|titre|guide/,'pillar'],[/principe|force|structure|cosmologie|mystere|phenomene|archetype|questions/,'ring']];
const GLYPH_PATH={ring:'<circle cx="24" cy="24" r="5.6"/>',diamond:'<path d="M24 17.4 30.6 24 24 30.6 17.4 24Z"/>',chevron:'<path d="M18 19.6 24 28l6-8.4"/>',spire:'<path d="M24 16.6v14.8M18.2 31.4h11.6"/>',wave:'<path d="M16.8 24c2.4-3.5 4.8-3.5 7.2 0s4.8 3.5 7.2 0"/>',square:'<rect x="18.6" y="18.6" width="10.8" height="10.8"/>',cross:'<path d="M24 17.6v12.8M17.6 24h12.8"/>',claw:'<path d="M18.4 30.4c4.2-1.2 8.2-4.4 11.6-12.4M18.4 25c3.6-.6 6.8-2.4 9.4-5.6"/>',pillar:'<path d="M19.8 30.2V18.4h8.4v11.8M17.4 30.2h13.2"/>'};
const glyphOf=type=>{const n=norm(type);for(const [re,glyph] of GLYPHS)if(re.test(n))return glyph;return 'ring';};
function sigil(rec,size){
 const h=hash(rec.id), glyph=glyphOf(rec.type), lore=pillarOf(rec)==='lore';
 const marks=[0,1,2,3,4,5,6,7].map(i=>{const on=(h>>i)&1,a=i*Math.PI/4+Math.PI/8,r1=13.7,r2=13.7+(on?4.6:2.3);return '<line x1="'+(24+Math.cos(a)*r1).toFixed(2)+'" y1="'+(24+Math.sin(a)*r1).toFixed(2)+'" x2="'+(24+Math.cos(a)*r2).toFixed(2)+'" y2="'+(24+Math.sin(a)*r2).toFixed(2)+'"/>';}).join('');
 const nodes=[0,1,2,3,4,5].filter(i=>(h>>(i+8))&1).map(i=>{const a=i*Math.PI/3+(((h>>4)&7)*0.045);return '<circle cx="'+(24+Math.cos(a)*10.5).toFixed(2)+'" cy="'+(24+Math.sin(a)*10.5).toFixed(2)+'" r="1.05"/>';}).join('');
 const rule=lore?'<line x1="9.5" y1="42.6" x2="38.5" y2="42.6"/>':'<line x1="42.6" y1="9.5" x2="42.6" y2="38.5"/>';
 return '<svg class="sigil sigil-'+statusKey(rec)+(lore?' sigil-lore':' sigil-explorer')+'" width="'+size+'" height="'+size+'" viewBox="0 0 48 48" aria-hidden="true" focusable="false">'+
  '<path class="sigil-frame" d="M6.5 6.5h35v35h-35z"/><path class="sigil-corners" d="M2.5 10.5v-8h8M37.5 2.5h8v8M45.5 37.5v8h-8M10.5 45.5h-8v-8"/>'+
  '<circle class="sigil-ring" cx="24" cy="24" r="13.7"'+(((h>>3)&3)===0?' stroke-dasharray="2.3 3.1"':'')+'/>'+
  '<g class="sigil-marks">'+marks+'</g><g class="sigil-nodes">'+nodes+'</g><g class="sigil-rule">'+rule+'</g>'+
  '<g class="sigil-glyph">'+GLYPH_PATH[glyph]+'</g><circle class="sigil-core" cx="24" cy="24" r="2.05"/></svg>';
}
/* Prose : paragraphes, titres ##, gras. Aucun HTML brut interprété. */
const inline=text=>esc(text).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
function prose(text){return String(text||'').split(/\n\s*\n/).filter(Boolean).map(block=>block.startsWith('## ')?'<h2>'+inline(block.slice(3))+'</h2>':'<p>'+inline(block).replace(/\n/g,'<br>')+'</p>').join('');}

/* Registre dense des fiches. */
function ficheRow(rec,opts={}){
 return '<li class="fiche-row"><a class="fiche-link" href="'+link(rec.id)+'">'+
  '<span class="fiche-sigil">'+sigil(rec,opts.large?44:34)+'</span>'+
  '<span class="fiche-folio" aria-hidden="true">n° '+esc(folio(rec))+'</span>'+
  '<span class="fiche-main"><strong>'+esc(rec.title)+'</strong><small>'+esc(rec.summary)+'</small></span>'+
  '<span class="fiche-meta"><span class="chip-min">'+esc(rec.type)+'</span><span class="chip-min">'+esc(rec.domain)+'</span>'+(opts.space?spaceChip(rec):'')+'</span>'+
  '<span class="fiche-flags">'+statusChip(rec)+stubTag(rec)+'</span>'+
  '<span class="fiche-go" aria-hidden="true">↗</span></a></li>';
}
function ficheList(list,opts={}){return '<ul class="register" role="list">'+list.map(rec=>ficheRow(rec,opts)).join('')+'</ul>';}
function ficheCards(list){return '<div class="card-grid">'+list.map(rec=>'<a class="fiche-card" href="'+link(rec.id)+'"><span class="card-sigil">'+sigil(rec,40)+'</span><span class="card-kicker">'+esc(rec.type)+' · '+esc(rec.domain)+'</span><h3>'+esc(rec.title)+'</h3><p>'+esc(rec.summary)+'</p><span class="card-flags">'+statusChip(rec)+stubTag(rec)+'</span></a>').join('')+'</div>';}
function linkChips(ids,label){const list=rel(ids);if(!list.length)return '';return '<div class="renvois">'+(label?'<p class="label">'+esc(label)+'</p>':'')+'<ul>'+list.map(rec=>'<li><a href="'+link(rec.id)+'">'+esc(rec.title)+' <span aria-hidden="true">↗</span></a></li>').join('')+'</ul></div>';}

/* Recherche : index sans accents sur titre, résumé, corps, type, domaine, époque, lignée, espace et tags. */
const hay=new Map(records.map(rec=>[rec.id,norm([rec.title,rec.type,rec.domain,rec.era,rec.lineage,spaceOf(rec.space).label,pillarDef(pillarOf(rec)).title,...(rec.tags||[]),rec.summary,rec.body].join(' · '))]));
function searchRecords(query){
 const needle=norm(query);
 if(!needle)return records.slice();
 const hits=[];
 for(const rec of records){
  const title=norm(rec.title), summary=norm(rec.summary), keys=norm([rec.type,rec.domain,rec.era,rec.lineage,spaceOf(rec.space).label,...(rec.tags||[])].join(' '));
  let score=0;
  if(title===needle)score+=100;else if(title.startsWith(needle))score+=60;else if(title.includes(needle))score+=40;
  if(keys.includes(needle))score+=18;
  if(summary.includes(needle))score+=12;
  if(hay.get(rec.id).includes(needle))score+=5;
  if(score)hits.push([score,rec]);
 }
 return hits.sort((a,b)=>b[0]-a[0]||a[1].title.localeCompare(b[1].title,'fr')).map(hit=>hit[1]);
}
function filterRecords(list,params){
 let out=list;
 const q=params.get('q');if(q)out=searchRecords(q).filter(rec=>out.includes(rec));
 const espace=params.get('espace');if(espace)out=out.filter(rec=>rec.space===espace||pillarOf(rec)===espace);
 const domaine=params.get('domaine');if(domaine)out=out.filter(rec=>rec.domain===domaine);
 const statut=params.get('statut');if(statut)out=out.filter(rec=>rec.status===statut);
 const type=params.get('type');if(type)out=out.filter(rec=>rec.type===type);
 const lignee=params.get('lignee');if(lignee)out=out.filter(rec=>rec.lineage===lignee);
 const tri=params.get('tri');
 if(tri==='titre')out=out.slice().sort((a,b)=>a.title.localeCompare(b.title,'fr'));
 if(tri==='maj')out=out.slice().sort((a,b)=>String(b.last_updated).localeCompare(String(a.last_updated)));
 if(tri==='statut')out=out.slice().sort((a,b)=>String(a.status).localeCompare(String(b.status))||a.title.localeCompare(b.title,'fr'));
 return out;
}
const facet=(list,key)=>[...new Set(list.map(rec=>rec[key]))].sort((a,b)=>String(a).localeCompare(String(b),'fr'));
/* Barre de filtres : l'état vit dans l'URL, donc partageable et rechargeable. */
function filterBar(route,base,params,hidden){
 const hides=hidden?'<input type="hidden" name="espace" value="'+esc(hidden)+'">':'';
 const select=(name,label,values)=>{const current=params.get(name)||'';return '<label class="field"><span>'+esc(label)+'</span><select name="'+name+'"><option value="">Tous</option>'+values.map(v=>{const [value,text]=Array.isArray(v)?v:[v,v];return '<option value="'+esc(value)+'"'+(current===value?' selected':'')+'>'+esc(text)+'</option>';}).join('')+'</select></label>';};
 const order=params.get('tri')||'ordre';
 return '<form class="filter-bar" id="filter-form" action="'+esc(route)+'">'+hides+
  '<label class="field field-q"><span>Motif</span><input type="search" name="q" value="'+esc(params.get('q')||'')+'" placeholder="titre, type, texte…" autocomplete="off"></label>'+
  select('type','Type',facet(base,'type'))+
  select('domaine','Domaine',facet(base,'domain'))+
  select('statut','Statut',facet(base,'status').map(value=>[value,STATUS[value]||value]))+
  select('lignee','Lignée',facet(base,'lineage'))+
  '<label class="field"><span>Ordre</span><select name="tri">'+[['ordre','Canon'],['titre','Titre'],['maj','Mise à jour'],['statut','Statut']].map(([value,text])=>'<option value="'+value+'"'+(order===value?' selected':'')+'>'+text+'</option>').join('')+'</select></label>'+
  '<span class="filter-actions"><button type="submit">Filtrer</button><a class="text-link" href="'+esc(route)+'">Réinitialiser</a></span></form>';
}

/* Chronologie maître : un rail de neuf jalons, chacun relié à sa notice et à ses fiches. */
function timeline(){
 const items=eras.map(era=>{
  const notice=byId.get(era.id), linked=rel(era.links).filter(rec=>rec.id!==era.id);
  return '<li class="jalon" id="jalon-'+esc(era.id)+'">'+
   '<span class="jalon-order" aria-hidden="true">'+String(era.order).padStart(2,'0')+'</span>'+
   '<div class="jalon-body"><p class="jalon-date">'+esc(era.date)+'</p>'+
   '<h3>'+(notice?'<a href="'+link(notice.id)+'">'+esc(era.title)+'</a>':esc(era.title))+'</h3>'+
   '<p class="jalon-summary">'+esc(era.summary)+'</p>'+
   (linked.length?'<ul class="jalon-links">'+linked.map(rec=>'<li><a href="'+link(rec.id)+'">'+esc(rec.title)+'</a></li>').join('')+'</ul>':'')+
   '</div></li>';
 }).join('');
 return '<section class="chronology"><header class="section-head"><p class="label">CHRONOLOGIE MAÎTRE</p><h2>Les neuf âges du Bris</h2>'+
  '<p class="section-note">'+eras.length+' jalons, du Silence originel à l’Éveil des Brisures. Le calendrier du Bris fixe l’an 0 ; chaque jalon ouvre sa notice et les fiches qui le portent.</p></header>'+
  '<ol class="rail">'+items+'</ol></section>';
}
/* Sceau du Nom : plaque gravée (aucune image), quatre marques AZ KA VO TH autour du Bris. */
function orrery(){
 const seals=(P.seals||[]).map((seal,index)=>'<li class="orrery-node orrery-node-'+index+'"><a href="'+link(seal.cult)+'"><b>'+esc(seal.mark)+'</b><span>'+esc(seal.name)+'</span><small>'+esc(seal.meaning)+'</small></a></li>').join('');
 const ticks=Array.from({length:72},(_,i)=>{const angle=i*5*Math.PI/180,r1=104,r2=104+(i%6?4:9);return '<line x1="'+(160+Math.cos(angle)*r1).toFixed(1)+'" y1="'+(160+Math.sin(angle)*r1).toFixed(1)+'" x2="'+(160+Math.cos(angle)*r2).toFixed(1)+'" y2="'+(160+Math.sin(angle)*r2).toFixed(1)+'"/>';}).join('');
 return '<div class="orrery"><svg class="orrery-plate" viewBox="0 0 320 320" aria-hidden="true" focusable="false">'+
  '<g class="orrery-ticks">'+ticks+'</g>'+
  '<circle class="orrery-ring" cx="160" cy="160" r="104"/><circle class="orrery-ring" cx="160" cy="160" r="70"/>'+
  '<path class="orrery-frame" d="M160 26 294 160 160 294 26 160Z"/>'+
  '<text class="orrery-label" x="160" y="152" text-anchor="middle">LE BRIS</text>'+
  '<text class="orrery-zero" x="160" y="192" text-anchor="middle">0</text></svg>'+
  '<ul class="orrery-nodes">'+seals+'</ul><p class="orrery-caption">LES QUATRE SCEAUX DU NOM</p></div>';
}
const lead=rec=>String(rec?.body||'').split(/\n\s*\n/)[0];
function doorPanel(pillar){
 const spaces=pillarDef(pillar.id).spaces.map(id=>({id,...spaceOf(id)}));
 const total=recsOfPillar(pillar.id).length;
 return '<article class="door-panel door-panel-'+esc(pillar.id)+'">'+
  '<a class="door-head" href="#/'+esc(pillar.id)+'"><span class="door-letter" aria-hidden="true">'+esc(String(pillar.title).charAt(0))+'</span>'+
  '<span class="door-headline"><b>'+esc(pillar.title)+'</b><span>'+esc(pillar.subtitle)+'</span></span></a>'+
  '<p class="door-desc">'+esc(pillar.description)+'</p>'+
  '<ul class="door-spaces">'+spaces.map(space=>'<li><a href="#/'+esc(pillar.id)+'/'+esc(space.id)+'"><span class="space-name">'+esc(space.label)+'</span><span class="space-meta">'+recsOf(space.id).length+' fiches · '+esc(space.kicker)+'</span></a></li>').join('')+'</ul>'+
  '<p class="door-total"><span class="chip">'+total+' fiches</span><span class="text-link" aria-hidden="true">Ouvrir '+esc(pillar.title)+' →</span></p></article>';
}
function home(){
 const path=(P.reading||[]).map((id,index)=>{const rec=byId.get(id);if(!rec)return '';return '<li><span class="path-num" aria-hidden="true">'+String(index+1).padStart(2,'0')+'</span><div><h3><a href="'+link(id)+'">'+esc(rec.title)+'</a></h3><p>'+esc(rec.summary)+'</p></div></li>';}).join('');
 const present=byId.get('sceelim');
 return '<section class="opening">'+
  '<div class="opening-copy"><p class="label">ARCHIVES D’UNE CRÉATION BRISÉE</p><h1>MONO</h1><p class="opening-sub">Le Codex du Bris</p>'+
  '<p class="opening-lede">'+esc(P.introduction)+'</p><p class="opening-premise">'+esc(P.premise)+'</p>'+
  '<p class="opening-stat"><span class="chip chip-status chip-canon">CANON '+esc(D.canon_version||'V6')+'</span><span class="chip">'+records.length+' fiches reliées</span><span class="chip">'+eras.length+' jalons</span></p>'+
  '<div class="hero-actions"><a class="button" href="#/lore">Entrer par LORE <span aria-hidden="true">→</span></a><a class="button button-ghost" href="#/explorer">Entrer par EXPLORER <span aria-hidden="true">→</span></a></div></div>'+
  '<div class="opening-plate">'+orrery()+'</div></section>'+
  '<section class="doors-section"><header class="section-head"><p class="label">DEUX ESPACES PUBLICS</p><h2>L’histoire, ou le monde.</h2>'+
  '<p class="section-note">Un même canon, deux entrées : suivre la chronologie et les récits, ou comprendre les principes, les cultures et les lieux. Chaque fiche garde une adresse stable et renvoie aux autres.</p></header>'+
  '<div class="door-grid">'+pillars.map(doorPanel).join('')+'</div></section>'+
  '<section class="entry-path"><header class="section-head"><p class="label">REPÈRES D’ENTRÉE</p><h2>Huit fiches pour tenir le monde</h2>'+
  '<p class="section-note">Le trajet le plus court entre le Bris, la Présence, les mondes et la cité où tout recommence.</p></header>'+
  '<ol class="path-list">'+path+'</ol></section>'+
  (present?'<section class="feature"><div class="feature-mark">'+sigil(present,72)+'</div><article><p class="label">LE PRÉSENT COMMENCE ICI</p>'+
   '<h2><a href="'+link(present.id)+'">'+esc(present.title)+'</a></h2><p class="feature-lede">'+esc(present.summary)+'</p><p class="feature-body">'+esc(lead(present))+'</p>'+
   '<a class="text-link" href="'+link(present.id)+'">Entrer dans la cité ↗</a></article></section>':'');
}
function spaceTabs(pillarId,current){
 const def=pillarDef(pillarId);
 return '<nav class="space-tabs" aria-label="Sections de '+esc(def.title)+'">'+def.spaces.map(id=>'<a href="#/'+esc(pillarId)+'/'+esc(id)+'"'+(id===current?' aria-current="page"':'')+'><span>'+esc(spaceOf(id).label)+'</span><small>'+recsOf(id).length+'</small></a>').join('')+'</nav>';
}
function worldStrip(base,params){
 const current=params.get('domaine')||'';
 const items=['Terra','Cieux','Abysses','Repli','Transversal'].map(name=>({name,count:base.filter(rec=>rec.domain===name).length})).filter(item=>item.count);
 return '<section class="world-strip"><header class="section-head"><p class="label">LES MONDES</p><h2>Choisir un théâtre</h2><p class="section-note">Cieux, Terra et Abysses sont les trois mondes créés ; le Repli est une dimension-cicatrice née des Brisures secondaires.</p></header>'+
  '<ul class="world-list"><li><a href="#/explorer/domaines"'+(current?'':' aria-current="page"')+'><span>Tous les mondes</span><small>'+base.length+' fiches</small></a></li>'+
  items.map(item=>'<li><a href="#/explorer/domaines?domaine='+encodeURIComponent(item.name)+'"'+(current===item.name?' aria-current="page"':'')+'><span>'+esc(item.name)+'</span><small>'+item.count+' fiches</small></a></li>').join('')+'</ul></section>';
}
function shelf(spaceId,preview,limit){
 const space={id:spaceId,...spaceOf(spaceId)}, items=recsOf(spaceId);
 return '<section class="shelf shelf-'+esc(spaceId)+'"><header class="section-head"><p class="label">'+esc(space.kicker)+'</p>'+
  '<h2><a href="#/lore/'+esc(spaceId)+'">'+esc(space.label)+'</a></h2><p class="section-note">'+esc(space.description)+'</p></header>'+
  preview+
  '<p class="more"><a class="text-link" href="#/'+(space.pillar==='lore'?'lore':'explorer')+'/'+esc(spaceId)+'">Voir les '+items.length+' fiches de '+esc(space.label)+' ↗</a></p></section>';
}
function pillarView(pillarId){
 const def=pillarDef(pillarId), list=recsOfPillar(pillarId);
 const head='<header class="space-head"><p class="label">'+esc(def.title)+' · '+list.length+' fiches</p><h1>'+esc(def.subtitle)+'</h1>'+
  '<p class="space-lede">'+esc(def.description)+'</p><p class="space-stat">Deux entrées pour un même canon — aucune fiche n’est dupliquée entre les deux espaces.</p></header>'+
  spaceTabs(pillarId,'');
 if(pillarId==='lore')return head+
  '<section class="shelf shelf-ages"><header class="section-head"><p class="label">'+esc(spaceOf('ages').kicker)+'</p><h2><a href="#/lore/ages">'+esc(spaceOf('ages').label)+'</a></h2><p class="section-note">'+esc(spaceOf('ages').description)+'</p></header>'+timeline()+
  '<p class="more"><a class="text-link" href="#/lore/ages">Voir les '+recsOf('ages').length+' notices d’âge ↗</a></p></section>'+
  shelf('annales',ficheCards(recsOf('annales')));
 return head+
  shelf('fondements',ficheCards(recsOf('fondements').slice(0,6)))+
  shelf('revelations',ficheCards(recsOf('revelations').slice(0,6)))+
  shelf('domaines',worldStrip(recsOf('domaines'),{get:()=>''})+ficheCards(recsOf('domaines').slice(0,6)));
}
function spaceView(spaceId,params){
 const space={id:spaceId,...spaceOf(spaceId)}, pillarId=space.pillar, base=recsOf(spaceId), list=filterRecords(base,params);
 const title=spaceId==='ages'?'Les notices d’âge':spaceId==='domaines'?'Les fiches du monde':spaceId==='annales'?'Les récits et les voix':spaceId==='fondements'?'Les principes et les êtres':spaceId==='revelations'?'Les Sceaux et les doctrines':'Les fiches';
 const head='<nav class="trail" aria-label="Fil d’Ariane"><a href="#/accueil">MONO</a><span aria-hidden="true">/</span><a href="#/'+esc(pillarId)+'">'+esc(pillarDef(pillarId).title)+'</a><span aria-hidden="true">/</span><span aria-current="page">'+esc(space.label)+'</span></nav>'+
  '<header class="space-head"><p class="label">'+esc(pillarDef(pillarId).title)+' · '+esc(space.kicker)+'</p><h1>'+esc(space.label)+'</h1>'+
  '<p class="space-lede">'+esc(space.description)+'</p><p class="space-stat">'+base.length+' fiches publiées dans cet espace.</p></header>'+spaceTabs(pillarId,spaceId);
 const extra=spaceId==='ages'?timeline():spaceId==='domaines'?worldStrip(base,params):'';
 return head+extra+
  '<section class="register-zone"><header class="section-head"><h2>'+esc(title)+'</h2><p class="section-note">'+list.length+' fiche'+(list.length>1?'s':'')+' affichée'+(list.length>1?'s':'')+' sur '+base.length+'. Les filtres restent dans l’adresse : le lien est partageable.</p></header>'+
  filterBar('#/'+pillarId+'/'+spaceId,base,params,null)+
  (list.length?ficheList(list):'<p class="empty">Aucune fiche ne correspond à ces critères. <a class="text-link" href="#/'+esc(pillarId)+'/'+esc(spaceId)+'">Réinitialiser les filtres ↗</a></p>')+
  '</section>';
}
function recordView(rec){
 const pillarId=pillarOf(rec), space=spaceOf(rec.space), siblings=recsOf(rec.space), index=siblings.findIndex(item=>item.id===rec.id);
 const previous=siblings[index-1], next=siblings[index+1], saved=bookmarks().includes(rec.id);
 const backs=records.filter(item=>item.id!==rec.id&&item.links.includes(rec.id));
 return '<article class="folio">'+
  '<nav class="trail" aria-label="Fil d’Ariane"><a href="#/accueil">MONO</a><span aria-hidden="true">/</span><a href="#/'+esc(pillarId)+'">'+esc(pillarDef(pillarId).title)+'</a><span aria-hidden="true">/</span><a href="#/'+esc(pillarId)+'/'+esc(rec.space)+'">'+esc(space.label)+'</a><span aria-hidden="true">/</span><span aria-current="page">'+esc(rec.title)+'</span></nav>'+
  '<header class="folio-head"><div class="folio-sigil">'+sigil(rec,96)+'</div><div class="folio-title"><p class="folio-flags">'+statusChip(rec)+stubTag(rec)+'<span class="chip-min">'+esc(rec.type)+'</span><span class="chip-min">n° '+esc(folio(rec))+'</span></p>'+
  '<h1>'+esc(rec.title)+'</h1><p class="folio-lede">'+esc(rec.summary)+'</p>'+
  '<p class="folio-actions"><button type="button" class="button button-small" data-bookmark="'+esc(rec.id)+'" aria-pressed="'+saved+'">'+(saved?'Retirer des signets':'Ajouter aux signets')+'</button><button type="button" class="button button-small button-ghost" data-share>Copier le lien</button></p></div></header>'+
  '<div class="folio-body"><div class="prose">'+prose(rec.body)+'</div><aside class="marginalia">'+
   '<h2>Repères</h2><dl><dt>Type</dt><dd>'+esc(rec.type)+'</dd><dt>Espace</dt><dd><a href="#/'+esc(pillarId)+'/'+esc(rec.space)+'">'+esc(space.label)+'</a></dd><dt>Domaine</dt><dd>'+esc(rec.domain)+'</dd><dt>Ère</dt><dd>'+esc(rec.era)+'</dd><dt>Lignée</dt><dd>'+esc(rec.lineage)+'</dd><dt>Fiche</dt><dd>n° '+esc(folio(rec))+'</dd><dt>Mise à jour</dt><dd>'+esc(rec.last_updated)+'</dd></dl>'+
   (rec.questions.length?'<h2>Questions ouvertes</h2><ul class="questions">'+rec.questions.map(question=>'<li>'+esc(question)+'</li>').join('')+'</ul>':'')+
   '<h2>Sources</h2><ul class="sources">'+rec.sources.map(source=>'<li><strong>'+esc(String(source.document).replace('.md','').replaceAll('_',' '))+'</strong><span>'+esc(source.section)+'</span></li>').join('')+'</ul>'+
  '</aside></div>'+
  '<footer class="folio-foot">'+linkChips(rec.links,'Renvois')+(backs.length?linkChips(backs.map(item=>item.id),'Cité dans'):'')+
  '<nav class="folio-nav" aria-label="Fiches voisines dans '+esc(space.label)+'">'+(previous?'<a href="'+link(previous.id)+'"><small>Précédent</small><span>'+esc(previous.title)+'</span></a>':'<span></span>')+(next?'<a href="'+link(next.id)+'"><small>Suivant</small><span>'+esc(next.title)+'</span></a>':'<span></span>')+'</nav></footer></article>';
}
function searchView(params){
 const query=params.get('q')||'', list=filterRecords(records,params);
 return '<nav class="trail" aria-label="Fil d’Ariane"><a href="#/accueil">MONO</a><span aria-hidden="true">/</span><span aria-current="page">Registre</span></nav>'+
  '<header class="space-head"><p class="label">RECHERCHE & REGISTRE</p><h1>Chercher dans le Codex</h1>'+
  '<p class="space-lede">Le canon entier en une liste : '+records.length+' fiches, deux espaces, cinq sections. Les filtres restent dans l’adresse, le lien est partageable.</p></header>'+
  filterBar('#/recherche',records,params,null)+
  '<section class="register-zone"><header class="section-head"><h2>'+(query?list.length+' résultat'+(list.length>1?'s':'')+' pour « '+esc(query)+' »':list.length+' fiches')+'</h2>'+
  '<p class="section-note">Recherche sans accents sur le titre, le résumé, le corps, le type, le domaine, l’époque, la lignée et les tags.</p></header>'+
  (list.length?ficheList(list,{space:true}):'<p class="empty">Aucune fiche ne correspond. <a class="text-link" href="#/recherche">Vider les filtres ↗</a></p>')+'</section>';
}
function savedView(){
 const list=rel(bookmarks());
 return '<nav class="trail" aria-label="Fil d’Ariane"><a href="#/accueil">MONO</a><span aria-hidden="true">/</span><span aria-current="page">Mes signets</span></nav>'+
  '<header class="space-head"><p class="label">CARNET</p><h1>Mes signets</h1><p class="space-lede">Vos fiches conservées dans ce navigateur, sur cet appareil. Aucun compte, aucune synchronisation.</p></header>'+
  (list.length?ficheList(list,{space:true}):'<p class="empty">Le carnet est vide. Ouvrez une fiche, puis choisissez « Ajouter aux signets ». <a class="text-link" href="#/explorer">Explorer le monde ↗</a></p>');
}
function notFoundView(id){
 const suggestions=rel((P.reading||[]).slice(0,4));
 return '<nav class="trail" aria-label="Fil d’Ariane"><a href="#/accueil">MONO</a><span aria-hidden="true">/</span><span aria-current="page">Fiche introuvable</span></nav>'+
  '<header class="space-head"><p class="label">ADRESSE INCONNUE</p><h1>Fiche introuvable</h1>'+
  '<p class="space-lede">Aucune fiche du canon ne porte l’identifiant « '+esc(id)+' ». L’adresse a peut-être changé ; le registre complet reste ouvert.</p></header>'+
  (suggestions.length?'<section class="shelf"><header class="section-head"><p class="label">POUR REPRENDRE LE FIL</p><h2>Quatre portes d’entrée</h2></header>'+ficheCards(suggestions)+'</section>':'')+
  '<p class="more"><a class="text-link" href="#/recherche">Chercher dans le registre ↗</a></p>';
}
if(window.MONO_PRERENDER){window.MONO_RENDERED_HOME=home();return;}
/* Stockage local : signets et thème, avec reprise des clés V4.5 si elles existent encore. */
const store={get(key,fallback){try{const value=JSON.parse(localStorage.getItem(key));return value??fallback;}catch{return fallback;}},set(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}};
function bookmarks(){
 const stored=store.get('mono-v6-bookmarks',null);
 const list=Array.isArray(stored)?stored:store.get('mono-v45-bookmarks',[]);
 return (Array.isArray(list)?list:[]).filter(id=>byId.has(id));
}
let currentRoute={pillar:'',space:'',key:''};
/* Chrome permanent : deux portes, puis les sections du pilier courant. */
function chrome(current){
 const pillarId=current.pillar, spaceId=current.space||'';
 $('primary-nav').innerHTML=pillars.map(pillar=>'<a class="door" href="#/'+esc(pillar.id)+'"'+(pillarId===pillar.id?' aria-current="page"':'')+'><b>'+esc(pillar.title)+'</b><span>'+esc(pillar.subtitle)+'</span></a>').join('');
 const ids=pillarId&&pillarDef(pillarId).spaces.length?pillarDef(pillarId).spaces:pillars.flatMap(pillar=>pillar.spaces);
 $('sub-nav').innerHTML=ids.map(id=>'<a href="#/'+esc(spaceOf(id).pillar)+'/'+esc(id)+'"'+(spaceId===id?' aria-current="page"':'')+'><span>'+esc(spaceOf(id).label)+'</span><small>'+recsOf(id).length+'</small></a>').join('')+
  '<a href="#/signets"'+(current.key==='signets'?' aria-current="page"':'')+'><span>Mes signets</span><small>'+bookmarks().length+'</small></a>';
 const colophon=$('colophon-canon');
 if(colophon)colophon.textContent='Canon '+String(D.canon_version||'V6')+' · '+records.length+' fiches · '+eras.length+' jalons';
}
function closeMenu(){document.body.classList.remove('tabs-open');const button=$('menu');if(button)button.setAttribute('aria-expanded','false');}
let toastTimer;
function notify(message){const toast=$('toast');if(!toast)return;toast.textContent=message;clearTimeout(toastTimer);toast.classList.add('show');toastTimer=setTimeout(()=>toast.classList.remove('show'),5200);}
function theme(value){
 document.documentElement.dataset.theme=value;
 const button=$('theme');
 if(button){button.textContent=value==='ink'?'Mode papier':'Mode encre';button.setAttribute('aria-label',value==='ink'?'Activer le mode papier':'Activer le mode encre');}
}
function renderSearch(query){
 if(!$('search-results'))return;
 const raw=String(query||'').trim(), list=searchRecords(raw), shown=list.slice(0,18);
 $('search-count').textContent=raw?(list.length+' résultat'+(list.length>1?'s':'')+(list.length>18?' · 18 premiers affichés':'')):records.length+' fiches indexées — saisissez un motif.';
 $('search-results').innerHTML=shown.length?'<ul class="hit-list" role="list">'+shown.map(rec=>'<li><a class="hit" href="'+link(rec.id)+'"><span class="hit-sigil">'+sigil(rec,28)+'</span><span class="hit-main"><small>'+esc(rec.type)+' · '+esc(spaceOf(rec.space).label)+'</small><b>'+esc(rec.title)+'</b><em>'+esc(rec.summary)+'</em></span>'+statusChip(rec)+'</a></li>').join('')+'</ul>':'<p class="empty">Aucun résultat. <a class="text-link" href="#/recherche">Parcourir le registre complet ↗</a></p>';
 const all=$('search-all');
 if(all)all.href='#/recherche'+(raw?'?q='+encodeURIComponent(raw):'');
}
/* Actions de page : déléguées sur #main, donc disponibles dès le premier rendu. */
function bookmarkFrom(event){
 const button=event.target.closest('[data-bookmark]');
 if(!button)return false;
 const id=button.dataset.bookmark, list=bookmarks();
 const next=list.includes(id)?list.filter(item=>item!==id):[...list,id];
 if(!store.set('mono-v6-bookmarks',next)){notify('Le stockage local est indisponible : utilisez « Copier le lien » pour conserver cette fiche.');return true;}
 const kept=next.includes(id);
 button.setAttribute('aria-pressed',String(kept));
 button.textContent=kept?'Retirer des signets':'Ajouter aux signets';
 chrome(currentRoute);
 notify(kept?'Fiche ajoutée à vos signets.':'Fiche retirée de vos signets.');
 return true;
}
async function shareFrom(event){
 const button=event.target.closest('[data-share]');
 if(!button)return false;
 try{await navigator.clipboard.writeText(location.href);notify('Lien copié : '+location.href);}
 catch{notify('Copiez le lien depuis la barre d’adresse de votre navigateur.');}
 return true;
}
function submitFrom(event){
 const form=event.target.closest('#filter-form');
 if(!form)return false;
 event.preventDefault();
 const params=new URLSearchParams();
 for(const [key,value] of new FormData(form))if(String(value).trim())params.set(key,value);
 const action=String(form.getAttribute('action')||'#/recherche').replace(/^#?\/?/,'');
 location.hash='/'+action+(params.size?'?'+params.toString():'');
 return true;
}
/* Routage : deux espaces, la fiche, le registre et le carnet. Les adresses retirées reviennent à l'accueil. */
const ALIASES={accueil:'accueil',commencer:'accueil',cosmologie:'explorer/fondements',fondements:'explorer/fondements',revelations:'explorer/revelations',domaines:'explorer/domaines',terra:'explorer/domaines',histoire:'lore/ages',ages:'lore/ages',annales:'lore/annales',codex:'recherche',recherche:'recherche',lore:'lore',explorer:'explorer',signets:'signets',favoris:'signets',fiche:'fiche'};
const RETIRED={lacunes:'la liste des sujets à développer',forge:'la Forge locale',atelier:'l’atelier privé'};
const KNOWN=['accueil','lore','explorer','recherche','signets','fiche'];
let initialized=false, opener=null, pendingNotice='';
const decodePart=value=>{try{return decodeURIComponent(value);}catch{return value;}};
function route(){
 const dialog=$('search-dialog'); if(dialog&&dialog.open)dialog.close();
 closeMenu();
 const raw=location.hash.replace(/^#\/?/,''), cut=raw.indexOf('?');
 const path=(cut<0?raw:raw.slice(0,cut)).replace(/\/+$/,'');
 const params=new URLSearchParams(cut<0?'':raw.slice(cut+1));
 const parts=path.split('/').filter(Boolean), head=parts[0]||'accueil';
 const targetFull=ALIASES[head]||head, targetParts=targetFull.split('/'), target=targetParts[0], aliasSpace=targetParts[1]||'';
 if(RETIRED[head]){pendingNotice='Cette adresse a été retirée du Codex public : '+RETIRED[head]+' ne fait plus partie du site.';location.replace('#/accueil');return;}
 if(!KNOWN.includes(target)){pendingNotice='Adresse inconnue : retour à l’accueil du Codex.';location.replace('#/accueil');return;}
 let html='', title='MONO', description=P.premise||'', pillarId='', spaceId='';
 const id=decodePart(parts[1]||'');
 if(target==='accueil'){html=home();title='MONO · Le Codex du Bris';description=P.introduction||'';}
 else if(target==='recherche'){html=searchView(params);title='Chercher dans le Codex';description='Registre complet des '+records.length+' fiches du canon '+String(D.canon_version||'V6')+'.';}
 else if(target==='signets'){html=savedView();title='Mes signets';description='Vos fiches conservées dans ce navigateur.';}
 else if(target==='fiche'){
  const rec=byId.get(id);
  if(rec){html=recordView(rec);title=rec.title;description=rec.summary;pillarId=pillarOf(rec);spaceId=rec.space;}
  else{html=notFoundView(id||'inconnu');title='Fiche introuvable';}
 }
 else{
  pillarId=target;
  const def=pillarDef(pillarId), wanted=parts[1]||aliasSpace;
  if(wanted&&!def.spaces.includes(wanted)){pendingNotice='Cette section n’existe pas dans '+def.title+'.';location.replace('#/'+pillarId);return;}
  if(wanted){html=spaceView(wanted,params);spaceId=wanted;title=spaceOf(wanted).label+' — '+def.title;}
  else{html=pillarView(pillarId);title=def.title+' — '+def.subtitle;description=def.description;}
 }
 currentRoute={pillar:pillarId,space:spaceId,key:target};
 chrome(currentRoute);
 const main=$('main');
 main.innerHTML=html;
 main.dataset.route=target;
 document.documentElement.dataset.pillar=pillarId||'accueil';
 document.documentElement.dataset.space=spaceId||'accueil';
 [...main.children].forEach((element,index)=>element.style.setProperty('--i',String(index)));
 document.title=target==='accueil'?'MONO · Le Codex du Bris':title+' · MONO';
 const meta=document.querySelector('meta[name="description"]');
 if(meta)meta.content=description;
 if(initialized)main.focus({preventScroll:true});
 window.scrollTo(0,0);
 initialized=true;
 if(pendingNotice){notify(pendingNotice);pendingNotice='';}
}
/* Amorçage : thème, recherche, menu, raccourcis et première route. */
let initialTheme='ink';
try{const saved=localStorage.getItem('mono-v6-theme')||localStorage.getItem('mono-v45-theme');if(saved==='paper'||saved==='ink')initialTheme=saved;}catch{}
theme(initialTheme);
$('theme').addEventListener('click',()=>{
 const next=document.documentElement.dataset.theme==='ink'?'paper':'ink';
 theme(next);
 try{localStorage.setItem('mono-v6-theme',next);}catch{notify('Le thème est appliqué pour cette visite seulement.');}
});
$('search-open').addEventListener('click',()=>{
 closeMenu();opener=document.activeElement;
 const dialog=$('search-dialog');
 if(dialog.showModal)dialog.showModal();
 $('search-input').value='';renderSearch('');$('search-input').focus();
});
$('search-close').addEventListener('click',()=>$('search-dialog').close());
$('search-dialog').addEventListener('close',()=>{if(opener&&opener.isConnected)opener.focus();});
$('search-dialog').addEventListener('click',event=>{
 const dialog=$('search-dialog');
 if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}
 if(event.target.closest('a.hit'))dialog.close();
});
$('search-input').addEventListener('input',event=>renderSearch(event.target.value));
$('search-input').addEventListener('keydown',event=>{
 const hits=[...document.querySelectorAll('#search-results .hit')];
 if(!hits.length)return;
 const index=hits.indexOf(document.activeElement);
 if(event.key==='ArrowDown'){event.preventDefault();hits[(index+1+hits.length)%hits.length].focus();}
 if(event.key==='ArrowUp'){event.preventDefault();hits[(index-1+hits.length)%hits.length].focus();}
});
$('menu').addEventListener('click',()=>{const open=document.body.classList.toggle('tabs-open');$('menu').setAttribute('aria-expanded',String(open));});
$('navigation').addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('keydown',event=>{
 const typing=event.target.matches('input,textarea,select')||event.target.isContentEditable;
 if(((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k')||(event.key==='/'&&!typing)){event.preventDefault();if(!$('search-dialog').open)$('search-open').click();return;}
 if(event.key==='Escape'){
  const dialog=$('search-dialog');
  if(dialog&&dialog.open){dialog.close();return;}
  if(document.body.classList.contains('tabs-open')){closeMenu();$('menu').focus();}
 }
});
const skip=document.querySelector('.skip');
if(skip)skip.addEventListener('click',event=>{event.preventDefault();const main=$('main');main.focus();main.scrollIntoView({block:'start'});});
const main=$('main');
main.addEventListener('click',event=>{if(bookmarkFrom(event))return;shareFrom(event);});
main.addEventListener('submit',event=>{submitFrom(event);});
window.addEventListener('hashchange',route);
window.addEventListener('storage',event=>{if(event.key==='mono-v6-bookmarks')route();});
route();
})();









