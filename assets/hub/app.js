/* MONO V8.1 — Codex public à deux espaces (LORE, EXPLORER) : registre de fiches, chronologie et recherche.
   Moteur de vues historique, intégré au build Vite avec composants React progressifs. */
(() => {
'use strict';
const D=window.MONO_CATALOGUE, $=id=>document.getElementById(id);
if(!D||!Array.isArray(D.records)){const main=$('main');if(main)main.innerHTML='<h1>Le Codex ne peut pas être chargé.</h1><p>Rechargez la page pour réessayer.</p>';return;}

const ICONS={search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',moon:'<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',menu:'<path d="M4 7h16M4 12h12M4 17h16"/>',home:'<path d="m3 10 9-7 9 7M6 8v12h12V8M10 20v-6h4v6"/>',book:'<path d="M12 5v15M3 5c4-1 6-1 9 1 3-2 5-2 9-1v14c-4-1-6-1-9 1-3-2-5-2-9-1Z"/>',compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6Z"/>',bookmark:'<path d="M6 3h12v18l-6-4-6 4Z"/>',arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',check:'<path d="m5 12 4 4L19 6"/>'};
function icon(name){return '<svg class="ui-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(ICONS[name]||ICONS.compass)+'</svg>';}
function wordmark(){return '<svg class="mono-wordmark" viewBox="0 0 296 80" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width="8" stroke-linecap="square" stroke-linejoin="miter"><path d="M8 66V14l27 32 27-32v52M164 66V14l46 52V14"/><ellipse cx="111" cy="40" rx="27" ry="27"/><ellipse cx="258" cy="40" rx="27" ry="27"/></g><path d="m111 31 9 9-9 9-9-9Zm147 0 9 9-9 9-9-9Z" fill="currentColor"/></svg>';}
function brandSeal(){return '<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="m32 3 29 29-29 29L3 32Z" stroke="currentColor"/><path d="M17 44V20l15 17 15-17v24" stroke="currentColor" stroke-width="3"/><circle cx="32" cy="32" r="24" stroke="currentColor" stroke-dasharray="1 5"/></svg>';}

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
const STATUS={canon:'ÉTABLI',mystere:'MYSTÈRE ASSUMÉ',developper:'À DÉVELOPPER',proposition:'PROPOSITION',hypothese:'HYPOTHÈSE',legende:'LÉGENDE INTERNE',rumeur:'RUMEUR',obsolete:'OBSOLÈTE'};
const statusKey=rec=>STATUS[rec.status]?rec.status:'canon';
const statusChip=rec=>rec.status==='canon'?'':'<span class="chip chip-status chip-'+statusKey(rec)+'">'+esc(STATUS[rec.status]||rec.status)+'</span>';
const stubTag=rec=>'';
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
const inline=text=>esc(text).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>').replace(/\x60([^\x60]+)\x60/g,'<code>$1</code>');
function prose(text){
 const lines=String(text||'').split('\n'),out=[];let i=0,heading=0;
 const special=l=>/^(?:#{1,6} |\|\s*|[-] |\d+\. |---+$)/.test(l);
 while(i<lines.length){const line=lines[i].trim();if(!line){i++;continue;}
  const h=line.match(/^(#{1,6}) (.+)/);if(h){const level=Math.max(2,Math.min(4,h[1].length));out.push('<h'+level+' id="chapitre-'+(++heading)+'">'+inline(h[2])+'</h'+level+'>');i++;continue;}
  if(/^---+$/.test(line)){out.push('<hr>');i++;continue;}
  if(line.startsWith('|')){const rows=[];while(i<lines.length&&lines[i].trim().startsWith('|')){const row=lines[i++].trim();if(!/^\|[ :|-]+\|$/.test(row))rows.push(row.split('|').slice(1,-1).map(c=>inline(c.trim())));}
   out.push('<div class="table-scroll" tabindex="0" role="region" aria-label="Tableau : '+esc(rows[0]?.map(c=>c.replace(/<[^>]*>/g,'')).join(', ')||'repères')+'"><table><thead><tr>'+rows[0].map(c=>'<th scope="col">'+c+'</th>').join('')+'</tr></thead><tbody>'+rows.slice(1).map(row=>'<tr>'+row.map((c,j)=>'<td data-label="'+esc(rows[0][j]?.replace(/<[^>]*>/g,'')||'')+'">'+c+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>');continue;}
  if(/^(?:- |\d+\. )/.test(line)){const ordered=/^\d/.test(line),tag=ordered?'ol':'ul',re=ordered?/^\d+\. /:/^- /,items=[];while(i<lines.length&&re.test(lines[i].trim()))items.push('<li>'+inline(lines[i++].trim().replace(re,''))+'</li>');out.push('<'+tag+'>'+items.join('')+'</'+tag+'>');continue;}
  const para=[line];i++;while(i<lines.length&&lines[i].trim()&&!special(lines[i].trim()))para.push(lines[i++].trim());out.push('<p>'+inline(para.join('\n')).replace(/\n/g,'<br>')+'</p>');
 }
 return out.join('');
}
function chapterMenu(rec){const headings=[...rec.body.matchAll(/^#{2,4} (.+)$/gm)];return headings.length>1?'<details class="article-contents"><summary>Dans cette page</summary><ol>'+headings.map((m,i)=>'<li><button type="button" data-chapter="chapitre-'+(i+1)+'">'+inline(m[1])+'</button></li>').join('')+'</ol></details>':'';}
function minuteCount(text){return Math.max(1,Math.ceil(text.split(/\s+/).length/200));}
function bookHref(rec,chapter=1){return link(rec.id)+'?chapitre='+chapter;}
function bookCards(){const art=['origines','batisseur','lignees','mortels'];return '<ol class="book-shelf">'+records.filter(r=>r.type==='Livre').map((r,i)=>'<li><a class="book-cover book-cover-'+art[i]+'" href="'+bookHref(r)+'"><div class="book-art" aria-hidden="true"><img src="assets/hub/art/'+art[i]+'.svg" alt="" loading="lazy" width="800" height="500"><span class="book-art-ordinal">'+['I','II','III','IV'][i]+'</span></div><div class="book-copy"><span class="label">LIVRE '+['I','II','III','IV'][i]+'</span><h2>'+esc(r.title.replace(/^Livre [IVX]+ — /,''))+'</h2><p>'+esc(r.summary)+'</p><span class="book-meta">'+r.chapters.length+' chapitres · environ '+minuteCount(r.body)+' min</span><span class="book-enter">'+(i?'Ouvrir le livre':'Commencer la lecture')+' <span aria-hidden="true">↗</span></span></div></a></li>').join('')+'</ol>';}

function storyLibrary(){return '<section class="story-library"><div id="story-resume" class="reading-resume" hidden></div><header class="space-head"><p class="label">LA BIBLIOTHÈQUE DES ORIGINES</p><h1>Avant le monde,<br>il y avait le Nom.</h1><p class="space-lede">Quatre livres à lire dans l’ordre. Commencez par le premier ; votre dernière lecture restera accessible ici.</p></header>'+bookCards()+'<aside class="reading-help"><h2>Un nom vous échappe ?</h2><p>Les repères du passage vous accompagnent dans le lecteur. Vous pouvez aussi revenir à la découverte de l’univers.</p><a class="text-link" href="'+link('decouvrir')+'">Les quatre repères →</a><a class="text-link" href="#/lore/ages">La chronologie →</a></aside></section>';}

function topicCards(){return '<div class="topic-grid">'+P.topics.map((t,i)=>'<article class="topic-card"><div class="topic-emblem" aria-hidden="true">'+sigil(byId.get(t.ids[0]),64)+'</div><span class="label">0'+(i+1)+' / '+esc(spaceOf(t.space).label)+'</span><h2>'+esc(t.title)+'</h2><p>'+esc(t.description)+'</p><ul>'+rel(t.ids).map(r=>'<li><a href="'+link(r.id)+'">'+esc(r.title)+' <span aria-hidden="true">→</span></a></li>').join('')+'</ul><a class="text-link" href="#/explorer/'+t.space+'">Tout explorer →</a></article>').join('')+'</div>';}
function guideStep(index){const item=P.intro[index];return '<div class="guide-illustration" aria-hidden="true"><img src="assets/hub/art/'+['origines','terra','mortels','lignees'][index]+'.svg" width="800" height="500" alt=""></div><div class="guide-copy"><p class="label">REPÈRE '+(index+1)+' / '+P.intro.length+'</p><h2>'+esc(item.title)+'</h2><p>'+esc(item.body)+'</p><a class="text-link" href="'+link(item.target)+'">'+esc(item.label)+' →</a><div class="guide-actions"><button type="button" data-guide-step="'+(index-1)+'"'+(index===0?' disabled':'')+'>← Précédent</button>'+(index<P.intro.length-1?'<button type="button" class="button" data-guide-step="'+(index+1)+'">Le repère suivant →</button>':'<a class="button" href="'+bookHref(byId.get('livre-1'))+'">Commencer l’histoire →</a>')+'</div></div>';}
function guideView(){return '<header class="space-head guide-header"><p class="label">VOTRE PREMIÈRE VISITE</p><h1>Bienvenue dans MONO.</h1><p class="space-lede">Quatre repères, un à la fois. Avancez dans l’ordre ou choisissez ce qui vous intrigue.</p></header><section class="guide-browser"><nav class="guide-stops" aria-label="Les quatre repères">'+P.intro.map((item,i)=>'<button type="button" data-guide-step="'+i+'" aria-pressed="'+(i===0)+'" aria-controls="guide-detail"><span>0'+(i+1)+'</span><span>'+esc(item.title)+'</span></button>').join('')+'</nav><div id="guide-detail" class="guide-detail" aria-live="polite">'+guideStep(0)+'</div></section><aside id="discovery-widget" class="discovery-widget" aria-label="Votre parcours de découverte"></aside><p class="guide-alternative">Envie de commencer directement ? <a href="'+bookHref(byId.get('livre-1'))+'">Ouvrir le premier récit →</a></p>';}



function ficheRow(rec,opts={}){
 return '<li class="fiche-row"><a class="fiche-link" href="'+link(rec.id)+'">'+
  '<span class="fiche-sigil">'+sigil(rec,opts.large?44:34)+'</span>'+
  '<span class="fiche-folio" aria-hidden="true">n° '+esc(folio(rec))+'</span>'+
  '<span class="fiche-main"><strong>'+esc(rec.title)+'</strong><small>'+esc(rec.summary)+'</small></span>'+
  '<span class="fiche-meta"><span class="chip-min">'+esc(rec.type)+'</span><span class="chip-min">'+esc(rec.domain)+'</span>'+(opts.space?spaceChip(rec):'')+'</span>'+
  '<span class="fiche-flags">'+statusChip(rec)+stubTag(rec)+'</span>'+
  '<span class="fiche-go" aria-hidden="true">↗</span></a></li>';
}
function ficheList(list,opts={}){return '<div class="register-tools"><span>'+list.length+' fiches</span><div role="group" aria-label="Affichage des fiches"><button type="button" data-layout="list" aria-pressed="true">Liste</button><button type="button" data-layout="grid" aria-pressed="false">Galerie</button></div></div><ul class="register" role="list">'+list.map(rec=>ficheRow(rec,opts)).join('')+'</ul>';}
function ficheCards(list){return '<div class="card-grid">'+list.map(rec=>'<a class="fiche-card" href="'+link(rec.id)+'"><span class="card-sigil">'+sigil(rec,40)+'</span><span class="card-kicker">'+esc(spaceOf(rec.space).label)+'</span><h3>'+esc(rec.title)+'</h3><p>'+esc(rec.summary)+'</p><span class="text-link">Découvrir →</span></a>').join('')+'</div>';}
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
  '<label class="field field-q"><span>Rechercher</span><input type="search" name="q" value="'+esc(params.get('q')||'')+'" placeholder="titre, type, texte…" autocomplete="off"></label>'+
  select('type','Type',facet(base,'type'))+
  select('domaine','Domaine',facet(base,'domain'))+
  select('statut','Statut',facet(base,'status').map(value=>[value,STATUS[value]||value]))+

  '<label class="field"><span>Ordre</span><select name="tri">'+[['ordre','Canon'],['titre','Titre'],['maj','Mise à jour'],['statut','Statut']].map(([value,text])=>'<option value="'+value+'"'+(order===value?' selected':'')+'>'+text+'</option>').join('')+'</select></label>'+
  '<span class="filter-actions"><button type="submit">Filtrer</button><a class="text-link" href="'+esc(route)+'">Réinitialiser</a></span></form>';
}

/* Chronologie maître : un rail de neuf jalons, chacun relié à sa notice et à ses fiches. */
function eraDetail(id){
 const era=eras.find(item=>item.id===id)||eras[0],rec=byId.get(era.id);
 return '<p class="era-date">'+esc(era.date)+'</p><h3>'+esc(era.title)+'</h3><div class="era-prose">'+prose(rec?.body||era.summary)+'</div>'+linkChips(era.links,'Dans cet âge')+'<a class="button button-small" href="'+link(era.id)+'">Lire la notice ↗</a>';
}
function timeline(){
 const selected=eras[0].id;
 return '<section class="chronology"><header class="section-head"><p class="label">CALENDRIER DE LA DÉCHIRURE</p><h2>Une histoire de ruptures.</h2><p class="section-note">Du Néant à l’Éveil des Brisures. Choisissez un âge pour en suivre les traces.</p></header><div class="time-browser"><ol class="rail">'+eras.map(era=>'<li class="jalon" id="jalon-'+esc(era.id)+'"><button type="button" data-era="'+esc(era.id)+'" aria-pressed="'+(era.id===selected)+'" aria-controls="era-detail"><span class="jalon-order">'+String(era.order).padStart(2,'0')+'</span><span><small>'+esc(era.date)+'</small><strong>'+esc(era.title)+'</strong></span><span aria-hidden="true">↗</span></button></li>').join('')+'</ol><div id="era-detail" class="era-detail" aria-live="polite">'+eraDetail(selected)+'</div></div></section>';
}
function worldDetail(id){const rec=byId.get(id)||byId.get('terra');return '<div class="world-engraving" aria-hidden="true"><img src="assets/hub/art/'+rec.id+'.svg" alt="" width="800" height="500" loading="lazy"></div><div class="world-detail-title">'+sigil(rec,54)+'<div><p class="label">LES TROIS MONDES</p><h3>'+esc(rec.title)+'</h3></div></div><p class="world-summary">'+esc(rec.summary)+'</p>'+linkChips(rec.id==='terra'?['avarn','sahrun','khoram','seyra','theryn']:rec.id==='cieux'?['archanges','structure-verticale']:['qerath','structure-verticale'],'Pour aller plus loin')+'<a class="text-link" href="'+link(rec.id)+'">Explorer '+esc(rec.title)+' →</a>';}

function worldExplorer(selected='terra'){
 const ids=['cieux','terra','abysses'];if(!ids.includes(selected))selected='terra';
 return '<section class="world-explorer"><header class="section-head"><p class="label">GÉOGRAPHIE DE LA CRÉATION</p><h2>Trois mondes issus de la Déchirure.</h2><p class="section-note">Choisissez un domaine. Suivez les lieux, les peuples et les passages qui lui sont liés.</p></header><div class="world-browser"><div class="cosmogram" role="group" aria-label="Choisir un domaine"><div class="cosmos-axis" aria-hidden="true"></div>'+ids.map(id=>{const rec=byId.get(id);return '<button type="button" class="world-node world-node-'+id+'" data-world="'+id+'" aria-pressed="'+(id===selected)+'" aria-controls="world-detail"><span class="world-node-symbol" aria-hidden="true">'+sigil(rec,52)+'</span><span><small>'+esc(rec.type)+'</small><strong>'+esc(rec.title)+'</strong></span><span class="world-node-arrow" aria-hidden="true">↗</span></button>';}).join('')+'<p class="cosmogram-note">Schéma de navigation<br>Cieux · Terra · Abysses</p></div><div id="world-detail" class="world-detail" aria-live="polite">'+worldDetail(selected)+'</div></div></section>';
}
function journey(){
 return '<section class="entry-path"><header class="section-head"><p class="label">PREMIERS PAS</p><h2>Entrez dans l’histoire.</h2><p class="section-note">Un parcours en huit lectures, du Nom aux quatre Livres. Prenez le temps de découvrir les fondations de MONO.</p></header><div id="reading-resume" class="reading-resume" hidden></div><ol class="path-list">'+(P.reading||[]).map((id,index)=>{const rec=byId.get(id);return '<li><span class="path-num">'+String(index+1).padStart(2,'0')+'</span><div><h3><a href="'+link(id)+'">'+esc(rec.title)+'</a></h3><p>'+esc(rec.summary)+'</p></div></li>';}).join('')+'</ol></section>';
}
/* Sceau du Nom : plaque gravée (aucune image), quatre marques AZ KA VO TH autour du Bris. */
function orrery(){
 const seals=(P.seals||[]).map((seal,index)=>'<li class="orrery-node orrery-node-'+index+'"><a href="'+link(seal.cult)+'"><b>'+esc(seal.mark)+'</b><span>'+esc(seal.name)+'</span><small>'+esc(seal.meaning)+'</small></a></li>').join('');
 const ticks=Array.from({length:72},(_,i)=>{const angle=i*5*Math.PI/180,r1=104,r2=104+(i%6?4:9);return '<line x1="'+(160+Math.cos(angle)*r1).toFixed(1)+'" y1="'+(160+Math.sin(angle)*r1).toFixed(1)+'" x2="'+(160+Math.cos(angle)*r2).toFixed(1)+'" y2="'+(160+Math.sin(angle)*r2).toFixed(1)+'"/>';}).join('');
 return '<div class="orrery"><svg class="orrery-plate" viewBox="0 0 320 320" aria-hidden="true" focusable="false">'+
  '<g class="orrery-ticks">'+ticks+'</g>'+
  '<circle class="orrery-ring" cx="160" cy="160" r="104"/><circle class="orrery-ring" cx="160" cy="160" r="70"/>'+
  '<path class="orrery-frame" d="M160 26 294 160 160 294 26 160Z"/>'+
  '<text class="orrery-label" x="160" y="152" text-anchor="middle">DÉCHIRURE</text>'+
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
function storyInvitation(){
 const book=byId.get('livre-1'),chapter=book.chapters[0],excerpt=chapter.body.split(/\n\s*\n/)[0];
 return '<section class="story-invitation"><div><p class="label">LA PREMIÈRE PAGE</p><h2>'+esc(chapter.title)+'</h2><blockquote>'+esc(excerpt)+'</blockquote><p class="invitation-meta">'+esc(book.title)+' · '+minuteCount(chapter.body)+' min de lecture</p><a class="button" href="'+bookHref(book)+'">Entrer dans le récit →</a></div><div class="invitation-emblem" aria-hidden="true"><img src="assets/hub/art/seuil.svg" alt="" width="800" height="500" loading="lazy"></div></section>';
}
function entryDoors(){const doors=[{href:link('decouvrir'),art:'origines',title:'Découvrir',subtitle:'Les premiers repères',text:'Quatre étapes pour comprendre les origines, les mondes et les êtres de MONO.',action:'Faire mes premiers pas'},{href:'#/lore',art:'mortels',title:'Lire',subtitle:'Les Récits des Origines',text:'Commencez le premier livre. L’histoire se découvre un chapitre à la fois.',action:'Ouvrir la bibliothèque'},{href:'#/explorer',art:'terra',title:'Explorer',subtitle:'Les portes du Codex',text:'Suivez un monde, une lignée ou une croyance. Chaque fiche ouvre d’autres chemins.',action:'Suivre ma curiosité'}];return '<section class="entry-doors"><header class="section-head"><p class="label">CHOISISSEZ VOTRE CHEMIN</p><h2>Entrez à votre rythme.</h2></header><div class="entry-grid">'+doors.map((d,i)=>'<a class="entry-door entry-door-'+i+'" href="'+d.href+'"><div class="entry-art" aria-hidden="true"><img src="assets/hub/art/'+d.art+'.svg" width="800" height="500" alt="" loading="lazy"></div><div class="entry-door-copy"><p class="label">0'+(i+1)+' / '+d.subtitle+'</p><h3>'+d.title+'</h3><p>'+d.text+'</p><span class="entry-action">'+d.action+' '+icon('arrow')+'</span></div></a>').join('')+'</div></section>';}
function home(){return '<section class="opening"><div class="opening-copy"><p class="label">UN UNIVERS À EXPLORER · UNE HISTOIRE À LIRE</p><h1 class="hero-wordmark" aria-label="MONO">'+wordmark()+'</h1><p class="opening-sub">Le Codex de la Déchirure</p><p class="opening-lede">'+esc(P.introduction)+'</p><div class="hero-actions"><a class="button" href="'+link('decouvrir')+'">Découvrir MONO →</a><a class="text-link" href="'+bookHref(byId.get('livre-1'))+'">Commencer l’histoire →</a></div><p class="hero-guidance">Aucune préparation nécessaire. Choisissez les repères ou laissez le premier récit vous guider.</p></div><div class="opening-plate">'+orrery()+'</div></section><div id="story-resume" class="reading-resume" hidden></div>'+entryDoors()+storyInvitation();}


function spaceTabs(pillarId,current){
 const def=pillarDef(pillarId);
 return '<nav class="space-tabs" aria-label="Sections de '+esc(def.title)+'">'+def.spaces.map(id=>'<a href="#/'+esc(pillarId)+'/'+esc(id)+'"'+(id===current?' aria-current="page"':'')+'><span>'+esc(spaceOf(id).label)+'</span><small>'+recsOf(id).length+'</small></a>').join('')+'</nav>';
}
function worldStrip(base,params){
 const current=params.get('domaine')||'';
 const items=['Terra','Cieux','Abysses','Transversal'].map(name=>({name,count:base.filter(rec=>rec.domain===name).length})).filter(item=>item.count);
 return '<section class="world-strip"><header class="section-head"><p class="label">LES MONDES</p><h2>Choisir un théâtre</h2><p class="section-note">Cieux, Terra et Abysses sont les trois mondes issus de la Déchirure.</p></header>'+
  '<ul class="world-list"><li><a href="#/explorer/domaines"'+(current?'':' aria-current="page"')+'><span>Tous les mondes</span><small>'+base.length+' fiches</small></a></li>'+
  items.map(item=>'<li><a href="#/explorer/domaines?domaine='+encodeURIComponent(item.name)+'"'+(current===item.name?' aria-current="page"':'')+'><span>'+esc(item.name)+'</span><small>'+item.count+' fiches</small></a></li>').join('')+'</ul></section>';
}
function shelf(spaceId,preview,limit){
 const space={id:spaceId,...spaceOf(spaceId)}, items=recsOf(spaceId);
 return '<section class="shelf shelf-'+esc(spaceId)+'"><header class="section-head"><p class="label">'+esc(space.kicker)+'</p>'+
  '<h2><a href="#/'+esc(space.pillar)+'/'+esc(spaceId)+'">'+esc(space.label)+'</a></h2><p class="section-note">'+esc(space.description)+'</p></header>'+
  preview+
  '<p class="more"><a class="text-link" href="#/'+(space.pillar==='lore'?'lore':'explorer')+'/'+esc(spaceId)+'">Voir les '+items.length+' fiches de '+esc(space.label)+' ↗</a></p></section>';
}
function pillarView(pillarId){if(pillarId==='lore')return storyLibrary();return '<header class="space-head"><p class="label">L’UNIVERS DE MONO</p><h1>Comprendre le monde.</h1><p class="space-lede">Des origines aux croyances, choisissez ce que vous voulez découvrir. Chaque page vous mène vers les notions qui lui sont liées.</p><a class="button" href="#/fiche/decouvrir">Commencer par les quatre repères →</a></header>'+topicCards()+'<section class="explorer-instruments"><header class="section-head"><p class="label">EXPLORER PAR LES SYMBOLES</p><h2>Les mondes et leurs principes.</h2></header>'+worldExplorer()+sphereAtlas()+'</section>';}

function spaceView(spaceId,params){
 if(spaceId==='annales')return storyLibrary();
 if(spaceId==='ages')return '<header class="space-head"><p class="label">SE REPÉRER DANS LE TEMPS</p><h1>La chronologie</h1><p class="space-lede">CD signifie Calendrier de la Déchirure. L’an 0 marque la naissance des trois mondes. Les dates précédées de ~ sont approximatives.</p></header>'+timeline();
 const space={id:spaceId,...spaceOf(spaceId)}, pillarId=space.pillar, base=recsOf(spaceId), list=filterRecords(base,params);
 const title=spaceId==='ages'?'Les notices d’âge':spaceId==='domaines'?'Les fiches du monde':spaceId==='annales'?'Les récits et les voix':spaceId==='fondements'?'Les principes et les êtres':spaceId==='revelations'?'Les Sceaux et les doctrines':'Les fiches';
 const head='<nav class="trail" aria-label="Fil d’Ariane"><a href="#/accueil">MONO</a><span aria-hidden="true">/</span><a href="#/'+esc(pillarId)+'">'+esc(pillarDef(pillarId).title)+'</a><span aria-hidden="true">/</span><span aria-current="page">'+esc(space.label)+'</span></nav>'+
  '<header class="space-head"><p class="label">'+esc(pillarDef(pillarId).title)+' · '+esc(space.kicker)+'</p><h1>'+esc(space.label)+'</h1>'+
  '<p class="space-lede">'+esc(space.description)+'</p><p class="space-stat">'+base.length+' fiches publiées dans cet espace.</p></header>'+spaceTabs(pillarId,spaceId);
 const extra=spaceId==='ages'?timeline():spaceId==='domaines'?worldExplorer(norm(params.get('domaine')||'terra'))+worldStrip(base,params):'';
 return head+extra+
  '<section class="register-zone"><header class="section-head"><h2>'+esc(title)+'</h2><p class="section-note">'+list.length+' fiche'+(list.length>1?'s':'')+' affichée'+(list.length>1?'s':'')+' sur '+base.length+'.</p></header>'+
  '<details class="filter-drawer"><summary>Rechercher dans cette rubrique</summary>'+filterBar('#/'+pillarId+'/'+spaceId,base,params,null)+'</details>'+
  (list.length?ficheCards(list):'<p class="empty">Aucune fiche ne correspond à ces critères. <a class="text-link" href="#/'+esc(pillarId)+'/'+esc(spaceId)+'">Réinitialiser les filtres ↗</a></p>')+
  '</section>';
}
function readingTrail(rec){
 const ids=P.reading||[],index=ids.indexOf(rec.id);if(index<0)return '';
 const next=byId.get(ids[index+1]);
 return '<nav class="reading-trail" aria-label="Parcours de découverte"><span>Découvrir MONO <small>Lecture '+(index+1)+' sur '+ids.length+'</small></span>'+(index?'<a href="'+link(ids[index-1])+'">← Précédente</a>':'')+(next?'<a href="'+link(next.id)+'">Continuer : '+esc(next.title)+' →</a>':'<a href="#/explorer">Poursuivre l’exploration →</a>')+'</nav>';
}
function tableRows(id){return byId.get(id).body.split('\n').filter(l=>l.startsWith('|')&&!/^\|[ :|-]+\|$/.test(l)).slice(1).map(l=>l.split('|').slice(1,-1).map(v=>v.trim().replace(/\*\*/g,'')));}
const sphereRows=tableRows('archanges'),lineageRows=tableRows('lignees');
function loreGlyph(index){const paths=['<path d="m12 3 9 9-9 9-9-9Z"/>','<path d="M12 2v20M2 12h20M5 5l14 14M5 19 19 5"/>','<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>','<path d="M12 3v18M5 21h14M4 8h16M4 8l-3 7h6ZM20 8l-3 7h6Z"/>','<path d="M12 12c-3-8-11-6-11 0s8 8 11 0 11-6 11 0-8 8-11 0Z"/>','<path d="M1 12c6-11 16-11 22 0-6 11-16 11-22 0Z"/><circle cx="12" cy="12" r="3"/>','<path d="m12 3 10 18H2Z"/>'];return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths[index%paths.length]+'</svg>';}
function sphereDetail(index){const r=sphereRows[index];return '<p class="label">SPHÈRE '+(index+1)+' / '+sphereRows.length+'</p><h3>'+esc(r[0])+'</h3><p class="sphere-principle">'+esc(r[1])+'</p><dl><div><dt>Archange</dt><dd>'+esc(r[2])+'</dd></div><div><dt>Pilier</dt><dd>'+esc(r[3])+'</dd></div></dl><a class="text-link" href="'+link('archanges')+'">Archanges et Trois Seuils →</a>';}
function sphereAtlas(){return '<section class="sphere-atlas"><header class="section-head"><p class="label">UN ATLAS DES PRINCIPES</p><h2>Les Sept Sphères.</h2><p class="section-note">Choisissez une Sphère pour retrouver son principe, son Archange et son Pilier.</p></header><div class="sphere-browser"><div class="sphere-wheel" role="group" aria-label="Choisir une Sphère"><svg class="sphere-orbits" viewBox="0 0 420 420" aria-hidden="true"><circle cx="210" cy="210" r="146"/><circle cx="210" cy="210" r="102"/><circle cx="210" cy="210" r="48"/>'+sphereRows.map((r,i)=>{const a=(i/7*2*Math.PI-Math.PI/2),x=210+Math.cos(a)*146,y=210+Math.sin(a)*146;return '<path d="M210 210 '+x.toFixed(1)+' '+y.toFixed(1)+'"/>';}).join('')+'</svg><span class="sphere-heart" aria-hidden="true">'+brandSeal()+'</span>'+sphereRows.map((r,i)=>{const a=i/7*2*Math.PI-Math.PI/2;return '<button type="button" class="sphere-star" style="--x:'+(50+Math.cos(a)*35)+'%;--y:'+(50+Math.sin(a)*35)+'%" data-sphere="'+i+'" aria-pressed="'+(i===0)+'" aria-controls="sphere-detail"><span class="sphere-glyph" aria-hidden="true">'+loreGlyph(i)+'</span><span>'+esc(r[0])+'</span></button>';}).join('')+'</div><div id="sphere-detail" class="sphere-detail" aria-live="polite">'+sphereDetail(0)+'</div></div></section>';}
function lineageDetail(index){const r=lineageRows[index];return '<p class="label">LIGNÉE '+(index+1)+' / '+lineageRows.length+'</p><h3>'+esc(r[0])+'</h3><dl><div><dt>Origine</dt><dd>'+esc(r[1])+'</dd></div><div><dt>Trait central</dt><dd>'+esc(r[2])+'</dd></div></dl>';}
function lineageAtlas(){return '<section class="lineage-atlas" aria-label="Explorer les six lignées"><div class="lineage-selector" role="group" aria-label="Choisir une lignée">'+lineageRows.map((r,i)=>'<button type="button" data-lineage="'+i+'" aria-pressed="'+(i===0)+'" aria-controls="lineage-detail"><span aria-hidden="true">'+loreGlyph([1,6,0,2,5,4][i])+'</span>'+esc(r[0])+'</button>').join('')+'</div><div id="lineage-detail" class="lineage-detail" aria-live="polite">'+lineageDetail(0)+'</div></section>';}
const READER_TERMS={azkavoth:['AZKAVOTH'],qerath:['Qerath'],vothorak:['Vothorak'],terra:['Terra'],cieux:['Cieux'],abysses:['Abysses'],sillage:['Sillage','Tikkun'],archanges:['Archange',...sphereRows.map(r=>r[2]),'Malkiel','Yesodiel','Tamariel'],lignees:lineageRows.map(r=>r[0]),sacerdoces:['Sacerdoce','Sacerdoces'],aurenth:['Aurenth']};
function contextualRecords(text){const n=norm(text);return records.filter(r=>r.type!=='Livre'&&r.id!=='decouvrir'&&[r.title,...(READER_TERMS[r.id]||[])].some(term=>{const t=norm(term).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return new RegExp('(?:^|[^\\p{L}])'+t+'(?=$|[^\\p{L}])','u').test(n);})).slice(0,8);}
function readerContext(text,book){const list=contextualRecords(text);return '<aside class="reader-context"><details><summary>Les repères de ce passage'+(list.length?' · '+list.length:'')+'</summary>'+(list.length?'<dl>'+list.map(r=>'<div><dt>'+esc(r.title)+'</dt><dd>'+esc(r.summary)+'</dd></div>').join('')+'</dl>':'<p>Retrouvez un nom ou un lieu dans la recherche du Codex.</p>')+'<button type="button" data-reader-search>Rechercher dans le Codex</button></details></aside>';}
function readerReferenceDialog(text){const list=contextualRecords(text);return '<dialog id="reader-reference-dialog" class="reference-dialog" aria-labelledby="reference-title"><header><div><p class="label">GARDER LE FIL DU RÉCIT</p><h2 id="reference-title">Les repères du passage</h2></div><button type="button" data-reference-close>Fermer</button></header><div class="reference-body">'+(list.length?list.map(r=>'<article>'+sigil(r,38)+'<div><h3>'+esc(r.title)+'</h3><p>'+esc(r.summary)+'</p></div></article>').join(''):'<p>Aucun nom de ce passage ne correspond directement à une fiche.</p>')+'<button type="button" data-reader-search>Rechercher un autre nom</button></div><footer><button type="button" data-reference-close class="button">Revenir à ma lecture</button></footer></dialog>';}

function storyView(rec,params){
 const all=params.get('chapitre')==='tout',raw=Number(params.get('chapitre')||1),index=Number.isInteger(raw)&&raw>=1&&raw<=rec.chapters.length?raw-1:0,c=rec.chapters[index],books=records.filter(r=>r.type==='Livre'),bi=books.indexOf(rec);
 if(!all)store.set('mono-story-position',{id:rec.id,chapter:index+1});
 const previous=index>0?{url:bookHref(rec,index),label:'Chapitre précédent'}:bi>0?{url:bookHref(books[bi-1],books[bi-1].chapters.length),label:'Livre précédent'}:null;
 const next=index<rec.chapters.length-1?{url:bookHref(rec,index+2),label:'Chapitre suivant : '+rec.chapters[index+1].title}:bi<books.length-1?{url:bookHref(books[bi+1]),label:'Continuer avec le Livre '+['I','II','III','IV'][bi+1]}:{url:'#/explorer',label:'Poursuivre dans l’univers'};
 return '<article class="story-reader" data-reading-key="'+rec.id+'-'+(all?'tout':index+1)+'"><div class="reading-progress" role="progressbar" aria-label="Progression dans le passage" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div><nav class="trail" aria-label="Fil d’Ariane"><a href="#/lore">Récits des Origines</a><span aria-hidden="true">/</span><span>Livre '+['I','II','III','IV'][bi]+'</span></nav><header class="reader-head"><p class="label">RÉCITS DES ORIGINES · LIVRE '+['I','II','III','IV'][bi]+'</p><h1>'+esc(rec.title)+'</h1><p>'+esc(rec.summary)+'</p></header><div class="reader-tools"><span>'+(all?'Lecture intégrale · environ '+minuteCount(rec.body)+' min':'Chapitre '+(index+1)+' sur '+rec.chapters.length+' · environ '+minuteCount(c.body)+' min')+'</span><a href="'+(all?bookHref(rec):bookHref(rec,'tout'))+'">'+(all?'Lire chapitre par chapitre':'Lire le livre en entier')+'</a></div><div class="reader-toolbar"><button type="button" data-reader-reference>Repères du passage</button><button type="button" data-reader-return hidden>Reprendre au marque-page</button><details class="reader-settings"><summary>Confort de lecture</summary><div class="reading-controls" role="group" aria-label="Confort de lecture"><button type="button" data-reader-focus aria-pressed="false">Lecture concentrée</button><button type="button" data-reader-size aria-pressed="false">Texte plus grand</button></div></details></div><label class="chapter-jump"><span>Accès direct au chapitre</span><select data-chapter-jump aria-label="Aller à un chapitre">'+(all?'<option value="'+bookHref(rec,'tout')+'">Livre entier</option>':'')+rec.chapters.map((ch,i)=>'<option value="'+bookHref(rec,i+1)+'"'+(!all&&i===index?' selected':'')+'>'+esc(ch.title)+'</option>').join('')+'</select></label><details class="reader-contents"><summary>Sommaire complet</summary><ol>'+rec.chapters.map((ch,i)=>'<li><a href="'+bookHref(rec,i+1)+'"'+(!all&&i===index?' aria-current="page"':'')+'>'+esc(ch.title)+'</a></li>').join('')+'</ol></details><div class="story-prose prose">'+(all?prose(rec.body):'<h2>'+esc(c.title)+'</h2>'+prose(c.body))+'</div>'+readerContext(all?rec.body:c.body,rec)+'<nav class="chapter-navigation" aria-label="Suite de la lecture">'+(all?(bi?'<a href="'+bookHref(books[bi-1],'tout')+'">← Livre précédent</a>':'<a href="#/lore">Tous les livres</a>'):(previous?'<a href="'+previous.url+'">← '+esc(previous.label)+'</a>':'<a href="#/lore">Tous les livres</a>'))+'<a class="button" data-next-chapter href="'+(all?(bi<books.length-1?bookHref(books[bi+1],'tout'):'#/explorer'):next.url)+'">'+esc(all?(bi<books.length-1?'Lire le livre suivant':'Explorer l’univers'):next.label)+' →</a></nav><div class="reader-bottom"><button type="button" data-bookmark="'+rec.id+'" aria-pressed="'+bookmarks().includes(rec.id)+'">'+(bookmarks().includes(rec.id)?'Retirer des signets':'Garder ce livre')+'</button><button type="button" data-share>Copier le lien de lecture</button><a href="#/fiche/decouvrir">Retrouver les repères de l’univers</a></div><button type="button" class="reader-mark-float" data-reader-mark aria-label="Marquer ma position dans ce chapitre" title="Marquer ma position">'+icon('bookmark')+'</button>'+readerReferenceDialog(all?rec.body:c.body)+'</article>';
}
function recordView(rec,params){
 if(rec.id==='decouvrir'){markGuideStep(0);return guideView();}
 if(rec.type==='Livre')return storyView(rec,params);
 const space=spaceOf(rec.space),saved=bookmarks().includes(rec.id);
 return '<article class="knowledge-page"><nav class="trail" aria-label="Fil d’Ariane"><a href="#/explorer">Univers</a><span aria-hidden="true">/</span><a href="#/'+space.pillar+'/'+rec.space+'">'+esc(space.label)+'</a></nav><header class="knowledge-head"><p class="label">'+esc(space.label)+(rec.status==='mystere'?' · CE QUI RESTE MYSTÉRIEUX':'')+'</p><h1>'+esc(rec.title)+'</h1><p class="space-lede">'+esc(rec.summary)+'</p></header>'+readingTrail(rec)+(rec.id==='lignees'?lineageAtlas():rec.id==='archanges'?sphereAtlas():'')+chapterMenu(rec)+'<div class="knowledge-layout"><div class="prose">'+prose(rec.body)+'</div><aside class="knowledge-aside"><h2>Pour se repérer</h2><p>Un nom ou une idée vous échappe ? Revenez aux quatre repères de MONO.</p><a class="text-link" href="#/fiche/decouvrir">Découvrir l’univers →</a>'+linkChips(rec.links,'À lire ensuite')+'</aside></div><footer class="knowledge-footer"><button type="button" data-bookmark="'+rec.id+'" aria-pressed="'+saved+'">'+(saved?'Retirer des signets':'Garder cette page')+'</button><button type="button" data-share>Copier le lien</button><details><summary>Référence du récit</summary><p>'+rec.sources.map(s=>esc(s.document.includes('Narration')?'Récits des Origines':'Lore & Cartographie')+' — '+esc(s.section.replace(/^\d+\. /,'').replace(/\x60/g,'').replace(/\[(?:ÉTABLI|MYSTÈRE ASSUMÉ)\]/g,''))).join('<br>')+'</p></details></footer></article>';
}

function searchView(params){
 const query=params.get('q')||'', list=filterRecords(records,params);
 return '<nav class="trail" aria-label="Fil d’Ariane"><a href="#/accueil">MONO</a><span aria-hidden="true">/</span><span aria-current="page">Registre</span></nav>'+
  '<header class="space-head"><p class="label">RECHERCHE & REGISTRE</p><h1>Chercher dans le Codex</h1>'+
  '<p class="space-lede">Retrouvez un lieu, un personnage, une croyance ou un passage des récits.</p></header>'+
  filterBar('#/recherche',records,params,null)+
  '<section class="register-zone"><header class="section-head"><h2>'+(query?list.length+' résultat'+(list.length>1?'s':'')+' pour « '+esc(query)+' »':list.length+' fiches')+'</h2>'+
  '<p class="section-note">Cherchez un nom ou quelques mots ; les passages des récits sont aussi inclus.</p></header>'+
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
 const stored=store.get('mono-v81-bookmarks',null);
 const list=Array.isArray(stored)?stored:store.get('mono-v81-bookmarks',[]);
 return (Array.isArray(list)?list:[]).filter(id=>byId.has(id));
}
let currentRoute={pillar:'',space:'',key:''};
/* Chrome permanent : deux portes, puis les sections du pilier courant. */
function chrome(current){
 const pillarId=current.pillar, spaceId=current.space||'';
 const discovering=current.id==='decouvrir';
 const mainDoors=[['#/fiche/decouvrir','compass','Découvrir',discovering],['#/lore','book','Lire',pillarId==='lore'],['#/explorer','home','Explorer',pillarId==='explorer'&&!discovering]];
 $('primary-nav').innerHTML=mainDoors.map(([href,symbol,label,on])=>'<a class="door" href="'+href+'"'+(on?' aria-current="page"':'')+'>'+icon(symbol)+'<span class="door-copy"><b>'+label+'</b></span></a>').join('');
 const ids=discovering?[]:pillarId==='lore'?['ages']:pillarId==='explorer'?['fondements','domaines','revelations']:[];
 $('sub-nav').innerHTML=ids.map(id=>'<a href="#/'+spaceOf(id).pillar+'/'+id+'"'+(spaceId===id?' aria-current="page"':'')+'>'+esc(spaceOf(id).label)+'</a>').join('')+'<a class="nav-carnet" href="#/signets"'+(current.key==='signets'?' aria-current="page"':'')+'>'+icon('bookmark')+'<span>Mes signets</span><small>'+bookmarks().length+'</small></a>';
 const dock=$('mobile-dock');if(dock)dock.innerHTML=mainDoors.map(([href,symbol,label,on])=>'<a href="'+href+'"'+(on?' aria-current="page"':'')+'>'+icon(symbol)+'<span>'+label+'</span></a>').join('');
 const colophon=$('colophon-canon');
 if(colophon)colophon.textContent='MONO · Les Récits des Origines';
}
function closeMenu(){document.body.classList.remove('tabs-open');const button=$('menu');if(button)button.setAttribute('aria-expanded','false');}
let toastTimer;
function notify(message){const toast=$('toast');if(!toast)return;toast.textContent=message;clearTimeout(toastTimer);toast.classList.add('show');toastTimer=setTimeout(()=>toast.classList.remove('show'),5200);}
function theme(value){
 document.documentElement.dataset.theme=value;
 const button=$('theme');
 if(button){button.innerHTML=icon(value==='ink'?'sun':'moon')+'<span>'+(value==='ink'?'Papier':'Encre')+'</span>';button.setAttribute('aria-pressed',String(value==='paper'));button.setAttribute('aria-label',value==='ink'?'Activer le mode papier':'Activer le mode encre');}
}
function renderSearch(query){
 if(!$('search-results'))return;
 const raw=String(query||'').trim(), list=searchRecords(raw), shown=raw?list.slice(0,18):rel(['decouvrir','livre-1','terra','sillage']);
 $('search-count').textContent=raw?(list.length+' résultat'+(list.length>1?'s':'')+(list.length>18?' · 18 premiers affichés':'')):'Pour commencer · ou cherchez un nom, un lieu, une idée.';
 $('search-results').innerHTML=shown.length?'<ul class="hit-list" role="list">'+shown.map(rec=>'<li><a class="hit" href="'+link(rec.id)+'"><span class="hit-sigil">'+sigil(rec,28)+'</span><span class="hit-main"><small>'+esc(rec.type)+' · '+esc(spaceOf(rec.space).label)+'</small><b>'+esc(rec.title)+'</b><em>'+esc(rec.summary)+'</em></span>'+statusChip(rec)+'</a></li>').join('')+'</ul>':'<p class="empty">Aucun résultat. <a class="text-link" href="#/recherche">Parcourir le registre complet ↗</a></p>';
 const all=$('search-all');
 if(all)all.href='#/recherche'+(raw?'?q='+encodeURIComponent(raw):'');
}
function rememberReading(id){
 const raw=store.get('mono-v81-reading',[]),history=Array.isArray(raw)?raw.filter(value=>byId.has(value)):[];
 store.set('mono-v81-reading',[id,...history.filter(value=>value!==id)].slice(0,30));
}
function hydrateReading(){
 hydrateDiscovery();const el=$('story-resume');if(!el)return;const position=store.get('mono-story-position',null);if(!position||typeof position!=='object')return;
 const rec=byId.get(position.id);if(!rec||rec.type!=='Livre'||!Number.isInteger(position.chapter)||!rec.chapters[position.chapter-1])return;
 el.hidden=false;el.innerHTML=icon('book')+'<span class="label">REPRENDRE VOTRE LECTURE</span><a href="'+bookHref(rec,position.chapter)+'">'+esc(rec.title)+' — '+esc(rec.chapters[position.chapter-1].title)+' →</a>';
}

function markGuideStep(index){const raw=store.get('mono-guide-steps',[]),list=Array.isArray(raw)?raw:[],id=P.intro[index]?.target;if(id)store.set('mono-guide-steps',[...new Set([...list,id])]);}
function hydrateDiscovery(){
 const el=$('discovery-widget');if(!el)return;const raw=store.get('mono-v81-reading',[]),history=[...(Array.isArray(raw)?raw:[]),...(Array.isArray(store.get('mono-guide-steps',[]))?store.get('mono-guide-steps',[]):[])],items=P.intro||[],count=items.filter(x=>history.includes(x.target)).length;
 el.innerHTML='<div class="discovery-widget-head"><div><span class="label">VOTRE FIL D’EXPLORATION</span><p>'+count+' / '+items.length+' repères parcourus</p></div><span class="discovery-ring" style="--progress:'+count/items.length*100+'%" aria-hidden="true">'+count+'/'+items.length+'</span></div><ol>'+items.map((x,i)=>'<li><a href="'+link(x.target)+'"'+(history.includes(x.target)?' class="is-read"':'')+'><span class="discovery-dot">'+(history.includes(x.target)?icon('check'):i+1)+'</span><span>'+esc(x.title)+(history.includes(x.target)?'<small>Déjà consulté</small>':'')+'</span></a></li>').join('')+'</ol>';
}

function hydrateReadingMark(){const reader=document.querySelector('.story-reader');if(!reader)return;const button=reader.querySelector('[data-reader-return]'),index=store.get('mono-reading-marks',{})?.[reader.dataset.readingKey];button.hidden=!(Number.isInteger(index)&&!!reader.querySelectorAll('.story-prose p')[index]);}

function applyLayout(value){
 const mode=(value||store.get('mono-v81-layout','list'))==='grid'?'grid':'list';
 document.querySelectorAll('.register').forEach(el=>el.dataset.layout=mode);
 document.querySelectorAll('button[data-layout]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.layout===mode)));
}
function exploreFrom(event){
 const guide=event.target.closest('[data-guide-step]');if(guide){const index=Number(guide.dataset.guideStep);if(Number.isInteger(index)&&index>=0&&index<P.intro.length){document.querySelector('.guide-stops').querySelectorAll('[data-guide-step]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.guideStep)===index)));$('guide-detail').innerHTML=guideStep(index);markGuideStep(index);hydrateDiscovery();if(!guide.isConnected){const heading=$('guide-detail').querySelector('h2');heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}}return true;}
 const jump=event.target.closest('[data-home-jump]');if(jump){const allowed=['first-steps','world-explorer','sphere-atlas','home-stories'];if(allowed.includes(jump.dataset.homeJump)){const section=document.querySelector('.'+jump.dataset.homeJump),heading=section.querySelector('h2');heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});section.scrollIntoView({block:'start'});}return true;}
 const sphere=event.target.closest('[data-sphere]');if(sphere){const region=sphere.closest('.sphere-browser');region.querySelectorAll('[data-sphere]').forEach(b=>b.setAttribute('aria-pressed',String(b===sphere)));region.querySelector('.sphere-detail').innerHTML=sphereDetail(Number(sphere.dataset.sphere));return true;}
 const lineage=event.target.closest('[data-lineage]');if(lineage){const region=lineage.closest('.lineage-atlas');region.querySelectorAll('[data-lineage]').forEach(b=>b.setAttribute('aria-pressed',String(b===lineage)));region.querySelector('.lineage-detail').innerHTML=lineageDetail(Number(lineage.dataset.lineage));return true;}
 const reference=event.target.closest('[data-reader-reference]');if(reference){const dialog=$('reader-reference-dialog');dialog.showModal();dialog._opener=reference;return true;}
 if(event.target.closest('[data-reference-close]')){$('reader-reference-dialog').close();return true;}
 if(event.target.closest('[data-reader-mark]')){const reader=document.querySelector('.story-reader'),paras=[...reader.querySelectorAll('.story-prose p')],index=paras.findIndex(p=>p.getBoundingClientRect().bottom>120);if(index>=0){const saved=store.get('mono-reading-marks',{}),marks=saved&&typeof saved==='object'&&!Array.isArray(saved)?saved:{};marks[reader.dataset.readingKey]=index;if(store.set('mono-reading-marks',marks)){hydrateReadingMark();notify('Position marquée. Retrouvez-la avec « Reprendre au marque-page ».');}else notify('La position ne peut pas être conservée sur cet appareil.');}return true;}
 if(event.target.closest('[data-reader-return]')){const reader=document.querySelector('.story-reader'),index=store.get('mono-reading-marks',{})?.[reader.dataset.readingKey],p=reader.querySelectorAll('.story-prose p')[index];if(p){p.setAttribute('tabindex','-1');p.focus({preventScroll:true});p.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}return true;}
 const focus=event.target.closest('[data-reader-focus]');if(focus){const on=document.body.classList.toggle('reading-focused');focus.setAttribute('aria-pressed',String(on));focus.textContent=on?'Quitter la lecture concentrée':'Lecture concentrée';return true;}
 const size=event.target.closest('[data-reader-size]');if(size){const on=document.body.classList.toggle('reading-large');size.setAttribute('aria-pressed',String(on));size.textContent=on?'Taille de texte normale':'Texte plus grand';store.set('mono-reading-large',on);return true;}
 if(event.target.closest('[data-reader-search]')){const reference=$('reader-reference-dialog');if(reference?.open)reference.close();$('search-open').click();return true;}
 const chapter=event.target.closest('[data-chapter]');if(chapter){const heading=document.getElementById(chapter.dataset.chapter);if(heading){heading.setAttribute('tabindex','-1');heading.focus();heading.scrollIntoView({block:'start'});}return true;}
 const world=event.target.closest('[data-world]');
 if(world){const region=world.closest('.world-browser');region.querySelectorAll('[data-world]').forEach(el=>el.setAttribute('aria-pressed',String(el===world)));region.querySelector('.world-detail').innerHTML=worldDetail(world.dataset.world);return true;}
 const era=event.target.closest('[data-era]');
 if(era){const region=era.closest('.time-browser');region.querySelectorAll('[data-era]').forEach(el=>el.setAttribute('aria-pressed',String(el===era)));region.querySelector('.era-detail').innerHTML=eraDetail(era.dataset.era);return true;}
 const layout=event.target.closest('button[data-layout]');
 if(layout){applyLayout(layout.dataset.layout);store.set('mono-v81-layout',layout.dataset.layout);return true;}
 return false;
}
/* Actions de page : déléguées sur #main, donc disponibles dès le premier rendu. */
function bookmarkFrom(event){
 const button=event.target.closest('[data-bookmark]');
 if(!button)return false;
 const id=button.dataset.bookmark, list=bookmarks();
 const next=list.includes(id)?list.filter(item=>item!==id):[...list,id];
 if(!store.set('mono-v81-bookmarks',next)){notify('Le stockage local est indisponible : utilisez « Copier le lien » pour conserver cette fiche.');return true;}
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
 document.body.classList.remove('reading-focused');
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
 if(target==='accueil'){html=home();title='MONO · Le Codex de la Déchirure';description=P.introduction||'';}
 else if(target==='recherche'){html=searchView(params);title='Chercher dans le Codex';description='Registre complet des '+records.length+' fiches du canon '+String(D.canon_version||'V8.1')+'.';}
 else if(target==='signets'){html=savedView();title='Mes signets';description='Vos fiches conservées dans ce navigateur.';}
 else if(target==='fiche'){
  const rec=byId.get(id);
  if(rec){rememberReading(rec.id);html=recordView(rec,params);title=rec.title;description=rec.summary;pillarId=pillarOf(rec);spaceId=rec.space;}
  else{html=notFoundView(id||'inconnu');title='Fiche introuvable';}
 }
 else{
  pillarId=target;
  const def=pillarDef(pillarId), wanted=parts[1]||aliasSpace;
  if(wanted&&!def.spaces.includes(wanted)){pendingNotice='Cette section n’existe pas dans '+def.title+'.';location.replace('#/'+pillarId);return;}
  if(wanted){html=spaceView(wanted,params);spaceId=wanted;title=spaceOf(wanted).label+' — '+def.title;}
  else{html=pillarView(pillarId);title=def.title+' — '+def.subtitle;description=def.description;}
 }
 currentRoute={pillar:pillarId,space:spaceId,key:target,id:target==='fiche'?id:''};
 chrome(currentRoute);
 const main=$('main');
 main.innerHTML=html;
 applyLayout();hydrateReading();hydrateReadingMark();const reference=$('reader-reference-dialog');if(reference){reference.addEventListener('close',()=>{if(reference._opener?.isConnected)reference._opener.focus();});reference.addEventListener('click',event=>{if(event.target===reference){const box=reference.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)reference.close();}});}
 main.dataset.route=target;
 const isReading=!!main.querySelector('.story-reader');document.body.classList.toggle('is-reading',isReading);document.body.classList.toggle('reading-large',store.get('mono-reading-large',false)===true);const sizeButton=main.querySelector('[data-reader-size]');if(sizeButton){const large=document.body.classList.contains('reading-large');sizeButton.setAttribute('aria-pressed',String(large));sizeButton.textContent=large?'Taille de texte normale':'Texte plus grand';}
 document.documentElement.dataset.pillar=pillarId||'accueil';
 document.documentElement.dataset.space=spaceId||'accueil';
 [...main.children].forEach((element,index)=>element.style.setProperty('--i',String(index)));
 document.title=target==='accueil'?'MONO · Le Codex de la Déchirure':title+' · MONO';
 const meta=document.querySelector('meta[name="description"]');
 if(meta)meta.content=description;
 if(initialized)main.focus({preventScroll:true});
 window.scrollTo(0,0);
 updateProgress();
 initialized=true;
 window.dispatchEvent(new CustomEvent('mono:route'));
 if(pendingNotice){notify(pendingNotice);pendingNotice='';}
}
function updateProgress(){
 const article=document.querySelector('.story-prose'),bar=document.querySelector('.reading-progress');if(!article||!bar)return;
 const box=article.getBoundingClientRect(),distance=Math.max(1,box.height-window.innerHeight*.65),value=Math.round(Math.max(0,Math.min(100,(window.innerHeight*.2-box.top)/distance*100)));
 bar.setAttribute('aria-valuenow',String(value));bar.querySelector('span').style.width=value+'%';
}
let scrollFrame=0;window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(()=>{updateProgress();scrollFrame=0;});},{passive:true});window.addEventListener('resize',updateProgress);
/* Amorçage : thème, recherche, menu, raccourcis et première route. */
let initialTheme='ink';
try{const saved=localStorage.getItem('mono-v81-theme')||localStorage.getItem('mono-v45-theme');if(saved==='paper'||saved==='ink')initialTheme=saved;}catch{}
theme(initialTheme);
const brand=document.querySelector('.brand');if(brand){brand.querySelector('.brand-mark').innerHTML=brandSeal();brand.querySelector('.brand-word').innerHTML=wordmark()+'<small>LE CODEX DE LA DÉCHIRURE</small>';}
$('theme').addEventListener('click',()=>{
 const next=document.documentElement.dataset.theme==='ink'?'paper':'ink';
 theme(next);
 try{localStorage.setItem('mono-v81-theme',next);}catch{notify('Le thème est appliqué pour cette visite seulement.');}
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
$('search-dialog').addEventListener('keydown',event=>{
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
main.addEventListener('click',event=>{if(exploreFrom(event)||bookmarkFrom(event))return;shareFrom(event);});
main.addEventListener('keydown',event=>{const button=event.target.closest('[data-sphere],[data-lineage]');if(!button||!['ArrowRight','ArrowLeft','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;const selector=button.hasAttribute('data-sphere')?'[data-sphere]':'[data-lineage]',group=button.closest('[role=group]'),items=[...group.querySelectorAll(selector)],index=items.indexOf(button),next=event.key==='Home'?0:event.key==='End'?items.length-1:(index+(['ArrowRight','ArrowDown'].includes(event.key)?1:-1)+items.length)%items.length;event.preventDefault();items[next].focus();items[next].click();});
main.addEventListener('change',event=>{if(event.target.matches('[data-chapter-jump]'))location.hash=event.target.value;});
main.addEventListener('submit',event=>{submitFrom(event);});
document.addEventListener('click',event=>{if(document.body.classList.contains('tabs-open')&&!event.target.closest('.navigation,.masthead'))closeMenu();});
window.addEventListener('hashchange',route);
window.addEventListener('storage',event=>{if(event.key==='mono-v81-bookmarks')route();});
route();
})();









