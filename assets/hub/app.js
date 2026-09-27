/* MONO: catalogue public unique, routes stables et navigation au clavier. */
(() => {
'use strict';
const D=window.MONO_CATALOGUE, $=id=>document.getElementById(id);
if(!D?.records){$('main').innerHTML='<h1>Le Codex ne peut pas être chargé.</h1><p>Rechargez la page pour réessayer.</p>';return;}
const P=D.presentation, records=D.records, byId=new Map(records.map(r=>[r.id,r]));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const get=id=>byId.get(id), rel=ids=>(ids||[]).map(get).filter(Boolean), link=id=>'#/fiche/'+encodeURIComponent(id);
const statuses={canon:'CANON',proposition:'PROPOSITION',hypothese:'HYPOTHÈSE',legende:'LÉGENDE INTERNE',rumeur:'RUMEUR',obsolete:'OBSOLÈTE'};
const spaces={fondements:'Fondements',domaines:'Domaines',ages:'Âges',revelations:'Révélations',annales:'Annales'};
const books={cosmologie:['I','COSMOGONIE','Les origines du Bris'],terra:['II','MONDE & PEUPLES','Un monde à parcourir'],histoire:['III','HISTOIRE & FICTIONS','La mémoire des âges'],codex:['IV','CODEX','Les archives de MONO']};
const state=s=>'<span class="state state-'+esc(s)+'">'+esc(statuses[s]||s)+'</span>';
const store={get(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}},set(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}};
const bookmarks=()=>{const x=store.get('mono-v45-bookmarks',[]);return Array.isArray(x)?x.filter(id=>byId.has(id)):[];};
let opener=null, visualCleanup=null, currentKey='', initialized=false, toastTimer;
const searchable=new Map(records.map(r=>[r.id,norm([r.title,r.summary,r.body,...r.tags].join(' '))]));
function prose(text){
 return String(text||'').split(/\n\s*\n/).filter(Boolean).map(p=>p.startsWith('## ')?'<h2>'+esc(p.slice(3))+'</h2>':'<p>'+esc(p).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>')+'</p>').join('');
}
function card(r){return '<a class="archive-card dossier-card" href="'+link(r.id)+'"><span class="card-kicker">'+esc(r.type)+' · '+esc(r.domain)+'</span><h3>'+esc(r.title)+'</h3><p>'+esc(r.summary)+'</p><footer>'+state(r.status)+'<span aria-hidden="true">↗</span></footer></a>';}
function shelf(title,list){return '<section class="dossier-shelf"><header><h2>'+esc(title)+'</h2><span>'+list.length+' fiches</span></header><div class="archive-grid">'+list.map(card).join('')+'</div></section>';}
function links(ids){return '<div class="relation-links">'+rel(ids).map(r=>'<a href="'+link(r.id)+'">'+esc(r.title)+' <span aria-hidden="true">↗</span></a>').join('')+'</div>';}
function head(key,desc){const [n,title,h]=books[key];return '<header class="book-head"><span class="folio-stamp" aria-hidden="true">'+n+'</span><div><p class="rubric">'+title+'</p><h1>'+h+'</h1><p>'+desc+'</p></div></header>';}
function simpleHead(title,desc){return '<header class="book-head"><div><p class="rubric">LE CODEX DU BRIS</p><h1>'+title+'</h1><p>'+desc+'</p></div></header>';}
function closeMenu(){document.body.classList.remove('tabs-open');$('menu').setAttribute('aria-expanded','false');}
function chrome(active){
 const tabs=[['accueil','⌂','ACCUEIL'],...Object.entries(books).map(([id,[n,t]])=>[id,n,t])];
 $('primary-nav').innerHTML=tabs.map(([id,n,t])=>'<a href="#/'+id+'" '+(active===id?'aria-current="page"':'')+'><span aria-hidden="true">'+n+'</span><b>'+t+'</b></a>').join('');
 $('sub-nav').innerHTML='<a href="#/commencer">Commencer ici</a><a href="#/annales">Annales</a><a href="#/revelations">Révélations</a><a href="#/lacunes">À développer</a><a href="#/favoris">Mes signets <span>'+bookmarks().length+'</span></a>';
 $('sub-nav').querySelectorAll('a').forEach(a=>{if(a.hash==='#/'+active)a.setAttribute('aria-current','page');});
}
function orrery(){
 return '<div class="orrery" role="img" aria-label="Composition symbolique des quatre Sceaux autour du Bris, sans valeur cartographique"><canvas id="signal-canvas" aria-hidden="true"></canvas><div class="orrery-circle outer"></div><div class="orrery-circle inner"></div><div class="orrery-diamond"></div><div class="orrery-core"><span>LE BRIS</span><strong>0</strong><small>CALENDRIER DU BRIS</small></div>'+P.seals.map((s,i)=>'<div class="seal-node node-'+i+'"><b>'+s.mark+'</b><span>'+s.name+'</span></div>').join('')+'<p class="orrery-caption">LES QUATRE SCEAUX DU NOM</p></div>';
}
function home(){
 return '<section class="opening"><div class="opening-copy"><p class="rubric">ARCHIVES D’UNE CRÉATION BRISÉE</p><h1>MONO</h1><p class="opening-subtitle">Le Codex du Bris</p><p class="opening-intro">'+esc(P.introduction)+'</p><p class="opening-premise">'+esc(P.premise)+'</p><div class="hero-actions"><a class="seal-button inverse" href="#/commencer">Commencer ici <span aria-hidden="true">↗</span></a><a class="text-link" href="#/terra">Explorer le monde <span aria-hidden="true">→</span></a></div><div class="canon-note">'+state('canon')+'<span>V4.5 · '+records.length+' fiches reliées</span></div></div>'+orrery()+'</section>'+
 '<section class="entry-band"><a href="#/histoire"><small>CALENDRIER DU BRIS</small><strong>'+D.eras.length+' jalons</strong><span>Parcourir les âges ↗</span></a><a href="#/annales"><small>RÉCITS & TÉMOIGNAGES</small><strong>Les Annales</strong><span>Lire une chronique ↗</span></a><a href="#/lacunes"><small>UN UNIVERS EN CONSTRUCTION</small><strong>Les questions ouvertes</strong><span>Voir ce qui reste à écrire ↗</span></a></section>'+
 '<section class="dispatch"><div><p class="rubric">OUVRIR LES ARCHIVES</p><h2>Chaque livre,<br>une porte.</h2><p>Du premier Bris aux peuples de Terra. Suivez les renvois, gardez vos signets et retrouvez les sources de chaque fiche.</p></div><div class="dispatch-grid">'+Object.entries(books).map(([id,[n,t,h]])=>'<a href="#/'+id+'"><span>'+n+'</span><h3>'+t+'</h3><p>'+h+'</p><b aria-hidden="true">↗</b></a>').join('')+'</div></section>'+
 '<section class="featured-record"><div class="city-sigil" aria-hidden="true"><span>S</span><small>SCEELIM</small></div><article><p class="rubric">LE PRÉSENT COMMENCE ICI</p><h2>'+esc(get('sceelim').title)+'</h2><p>'+esc(get('sceelim').summary)+'</p><a class="text-link" href="'+link('sceelim')+'">Entrer dans la cité ↗</a></article></section>';
}
function begin(){
 return simpleHead('Entrer dans MONO','Huit repères pour comprendre le monde, puis choisir votre chemin.')+
 '<ol class="reading-path">'+P.reading.map((id,i)=>{const r=get(id);return '<li><span class="path-number">'+String(i+1).padStart(2,'0')+'</span><div><h2><a href="'+link(id)+'">'+esc(r.title)+' ↗</a></h2><p>'+esc(r.summary)+'</p></div></li>';}).join('')+'</ol><section class="end-note"><h2>Et maintenant ?</h2><p>Explorez Terra, suivez la chronologie ou lisez une première chronique.</p><div class="hero-actions"><a class="seal-button" href="#/terra">Explorer le monde</a><a class="text-link" href="#/annales">Lire une chronique ↗</a></div></section>';
}
function cosmology(){
 const ids=['azkavoth','retrait-premier','dix-vases','bris-an-0','presence','etincelles','quatre-sceaux','brisures','trois-mondes','repli','premiere-forme','adam','silence','vothorak','qerath','mysteres-fondateurs'];
 return head('cosmologie','Le Retrait Premier, les Dix Vases et les mondes issus du Bris.')+
 '<section class="cosmos-table"><div class="cosmos-axis"><p class="rubric">HORS DE LA CRÉATION</p><a class="source-name" href="'+link('azkavoth')+'">AZKAVOTH</a><span class="cosmos-thread" aria-hidden="true"></span><p class="rubric">LES TROIS MONDES CRÉÉS</p><div class="realm-links">'+['cieux','terra','abysses'].map(id=>'<a href="#/terra?monde='+id+'">'+esc(get(id).title)+'</a>').join('')+'</div><a class="repli-link" href="'+link('repli')+'">Le Repli <small>Dimension-cicatrice</small></a></div><article class="cosmos-read"><p class="rubric">LE BRIS · CB 0</p><h2>Les Vases<br>ont cédé.</h2><p>'+esc(get('bris-an-0').summary)+'</p><p>'+esc(get('trois-mondes').summary)+'</p><a class="text-link" href="'+link('bris-an-0')+'">Lire l’événement ↗</a></article></section>'+
 '<section class="seal-book"><header><p class="rubric">LES QUATRE SCEAUX</p><h2>Les fragments du Nom</h2><p>'+esc(get('quatre-sceaux').body)+'</p></header><div class="seal-grid">'+P.seals.map(s=>'<a href="'+link(s.cult)+'"><b>'+s.mark+'</b><h3>'+s.name+'</h3><p>'+s.meaning+'</p><small>'+esc(get(s.cult).title)+' ↗</small></a>').join('')+'</div></section>'+shelf('Fondements & mystères',rel(ids));
}
function atlas(params){
 const requested=params.get('monde'), selected=['terra','cieux','abysses','repli'].includes(requested)?requested:'terra',world=get(selected);
 const continents=records.filter(r=>r.type==='Continent'),nations=records.filter(r=>r.type==='État ou nation'||r.id==='sceelim');
 let output=head('terra','Trois mondes, une dimension-cicatrice et des peuples que l’histoire a séparés.')+
 '<section class="world-selector"><nav class="world-switch" aria-label="Choisir un monde">'+['terra','cieux','abysses','repli'].map(id=>'<a href="#/terra?monde='+id+'" '+(id===selected?'aria-current="page"':'')+'>'+esc(get(id).title)+'</a>').join('')+'</nav><article data-world="'+selected+'"><p class="rubric">'+(selected==='repli'?'DIMENSION-CICATRICE':'MONDE')+'</p><h2>'+esc(world.title)+'</h2><p>'+esc(world.summary)+'</p><a class="text-link" href="'+link(selected)+'">Lire la fiche du monde ↗</a></article></section>';
 if(selected==='terra'){
 output+='<section class="terra-board"><div class="continent-field"><p class="rubric">ATLAS SCHÉMATIQUE</p><h2>Les sept continents</h2><div class="continent-chart">'+continents.map((r,i)=>'<a class="continent c'+i+'" href="'+link(r.id)+'"><span aria-hidden="true">'+String(i+1).padStart(2,'0')+'</span><b>'+esc(r.title)+'</b></a>').join('')+'</div><p class="map-caption">Repères de navigation, sans position ni frontière géographique validée. La carte physique reste à construire.</p></div><div class="nation-ledger"><h2>États & nations</h2>'+nations.map(r=>'<a href="'+link(r.id)+'"><b>'+esc(r.title)+'</b><span>'+esc(r.summary)+'</span><i aria-hidden="true">↗</i></a>').join('')+'</div></section>';
 output+=shelf('Les cinq lignées',records.filter(r=>r.type==='Lignée'))+shelf('Cultes & principes',rel(['kelesh','tavrash','ashirom','azumeth','dix-piliers']))+shelf('Océans & mers',records.filter(r=>r.type==='Océan ou mer'));
 }else output+=shelf('Explorer '+world.title,records.filter(r=>norm(r.domain)===norm(selected)&&r.id!==selected));
 return output;
}
function history(params){
 const chosen=D.eras.find(e=>e.id===params.get('age'))||D.eras.at(-1),article=get(chosen.id);
 return head('histoire','Du Silence originel à l’Éveil des Brisures. Les dates approximatives conservent leur signe ~.')+
 '<section class="age-machine"><nav aria-label="Les neuf jalons">'+D.eras.map((e,i)=>'<a href="#/histoire?age='+e.id+'" '+(e.id===chosen.id?'aria-current="page"':'')+'><span>'+String(i+1).padStart(2,'0')+'</span><b>'+esc(e.title)+'</b><small>'+esc(e.date)+'</small></a>').join('')+'</nav><article><p class="rubric">'+esc(chosen.date)+'</p><h2>'+esc(chosen.title)+'</h2><div class="prose">'+prose(article.body)+'</div><a class="text-link" href="'+link(article.id)+'">Sources et fiche complète ↗</a>'+links(chosen.links)+'</article></section>'+
 shelf('Les factions',records.filter(r=>r.type==='Faction'))+
 '<section class="end-note"><p class="rubric">LIRE LES VOIX DE MONO</p><h2>Entrer dans les Annales</h2><p>Récits, arcs et témoignages. Chaque texte conserve son statut.</p><a class="seal-button" href="#/annales">Lire les Annales ↗</a></section>';
}
function select(name,label,values,params){
 return '<label>'+label+'<select name="'+name+'"><option value="">Tous</option>'+values.map(v=>'<option value="'+esc(v)+'" '+(params.get(name)===v?'selected':'')+'>'+esc(v)+'</option>').join('')+'</select></label>';
}
function codex(params){
 const q=params.get('q')||'',mode=params.get('mode')||'',saved=params.get('saved')==='1';
 const list=records.filter(r=>(!mode||mode==='tous'||r.status===mode)&&(!q||searchable.get(r.id).includes(norm(q)))&&['domain','era','lineage','type','space'].every(k=>!params.get(k)||r[k]===params.get(k))&&(!params.get('culte')||r.id===params.get('culte')||r.links.includes(params.get('culte')))&&(!saved||bookmarks().includes(r.id)));
 const unique=k=>[...new Set(records.map(r=>r[k]))].sort((a,b)=>a.localeCompare(b,'fr'));
 return head('codex','Recherchez, croisez les domaines et les époques, puis suivez les sources et les renvois.')+
 '<section class="codex-controls"><form id="codex-filter"><label class="search-field">Rechercher dans les '+records.length+' fiches<input name="q" type="search" value="'+esc(q)+'" placeholder="Un nom, un lieu, une idée…"></label><label>Statut<select name="mode"><option value="">Tous les statuts</option>'+Object.entries(statuses).map(([v,t])=>'<option value="'+v+'" '+(mode===v?'selected':'')+'>'+t+'</option>').join('')+'</select></label>'+select('domain','Domaine',unique('domain'),params)+select('era','Époque',unique('era'),params)+select('lineage','Lignée',unique('lineage'),params)+select('type','Type de fiche',unique('type'),params)+'<label>Espace<select name="space"><option value="">Tous les espaces</option>'+Object.entries(spaces).map(([v,t])=>'<option value="'+v+'" '+(params.get('space')===v?'selected':'')+'>'+t+'</option>').join('')+'</select></label><label>Culte lié<select name="culte"><option value="">Tous les cultes</option>'+['kelesh','tavrash','ashirom','azumeth'].map(id=>'<option value="'+id+'" '+(params.get('culte')===id?'selected':'')+'>'+get(id).title+'</option>').join('')+'</select></label><label class="checkbox"><input name="saved" type="checkbox" value="1" '+(saved?'checked':'')+'> Mes signets uniquement</label><div class="filter-actions"><button class="seal-button inverse" type="submit">Appliquer les filtres</button><a class="text-link" href="#/codex">Tout réinitialiser</a></div></form><p>Le filtre « Culte lié » retient le culte et les fiches qui y renvoient directement.</p></section>'+
 '<section class="dossier-shelf" id="results"><header><h2>Index public</h2><p role="status">'+list.length+' résultat'+(list.length>1?'s':'')+'</p></header><div class="archive-grid">'+(list.length?list.map(card).join(''):'<div class="empty-state"><h3>Aucune fiche trouvée</h3><p>Essayez un terme plus court ou retirez un filtre.</p><a class="text-link" href="#/codex">Réinitialiser les filtres</a></div>')+'</div></section>';
}
function collection(space){
 const descriptions={annales:['Les Annales','Récits, arcs et voix de MONO. Les propositions ne deviennent pas du canon sans validation.'],revelations:['Les Révélations','Sceaux, traditions, principes et figures prophétiques.'],fondements:['Les Fondements','Les repères et les définitions de la création.']};
 const [title,desc]=descriptions[space];return simpleHead(title,desc)+shelf(space==='annales'?'Récits & pistes':'Entrées du livre',records.filter(r=>r.space===space));
}
function gaps(){
 return simpleHead('Ce qu’il reste à écrire','Un état des lieux éditorial fondé sur les sources V4.5. Les inconnues ne sont pas remplacées par des inventions.')+
 '<section class="gap-intro"><p>'+records.filter(r=>r.status==='canon').length+' fiches CANON · '+records.filter(r=>r.status==='proposition').length+' PROPOSITIONS · '+records.filter(r=>r.status==='hypothese').length+' HYPOTHÈSES</p><p>Un nom peut être établi alors que sa description reste à développer. Ces nombres mesurent des fiches, pas un pourcentage d’achèvement de l’univers.</p></section>'+
 '<section class="gap-grid">'+P.gaps.map(g=>'<article><p class="rubric">'+esc(g.kind)+'</p><h2>'+esc(g.title)+'</h2><p>'+esc(g.summary)+'</p>'+links(g.links)+'<small>Source : '+esc(g.source.replace('MONO_SITE_','').replace('.md',''))+' · '+esc(g.section)+'</small></article>').join('')+'</section>'+
 '<section class="dossier-shelf"><header><h2>Questions par fiche</h2><span>'+records.filter(r=>r.questions.length).length+' fiches à préciser</span></header><div class="question-list">'+records.filter(r=>r.questions.length).map(r=>'<details><summary>'+esc(r.title)+' <span>'+r.questions.length+' question'+(r.questions.length>1?'s':'')+'</span></summary><ul>'+r.questions.map(q=>'<li>'+esc(q)+'</li>').join('')+'</ul><a class="text-link" href="'+link(r.id)+'">Lire la fiche ↗</a></details>').join('')+'</div></section>';
}
function savedPage(){const list=rel(bookmarks());return simpleHead('Mes signets','Vos lectures conservées dans ce navigateur, sur cet appareil.')+(list.length?shelf('Reprendre une lecture',list):'<section class="empty-state"><h2>Votre carnet est encore vide</h2><p>Ouvrez une fiche puis choisissez « Ajouter aux signets ».</p><a class="seal-button" href="#/codex">Explorer le Codex</a></section>');}
function record(r){
 const backs=records.filter(x=>x.links.includes(r.id)), saved=bookmarks().includes(r.id);
 return '<nav class="trail" aria-label="Fil d’Ariane"><a href="#/accueil">MONO</a><span aria-hidden="true">/</span><a href="#/codex">CODEX</a><span aria-hidden="true">/</span><span aria-current="page">'+esc(r.title)+'</span></nav>'+
 '<article class="folio dossier"><header><div class="folio-meta">'+state(r.status)+'<span>'+esc(r.type)+'</span><span>'+esc(r.era)+'</span></div><h1>'+esc(r.title)+'</h1><p>'+esc(r.summary)+'</p><div class="record-actions"><button class="bookmark" data-bookmark="'+esc(r.id)+'" aria-pressed="'+saved+'">'+(saved?'Retirer des signets':'Ajouter aux signets')+'</button><button class="share-button" data-share>Copier le lien</button><a class="text-link" href="#/favoris">Mes signets</a></div></header>'+
 '<div class="folio-body"><div class="prose">'+prose(r.body)+'</div><aside class="marginalia"><h2>Repères</h2><dl><dt>Domaine</dt><dd>'+esc(r.domain)+'</dd><dt>Lignée</dt><dd>'+esc(r.lineage)+'</dd><dt>Mise à jour</dt><dd>'+esc(r.last_updated)+'</dd></dl>'+(r.questions.length?'<h2>À éclaircir</h2><ul>'+r.questions.map(q=>'<li>'+esc(q)+'</li>').join('')+'</ul>':'')+'</aside></div><footer class="folio-foot"><section><h2>Sources</h2><ul class="sources">'+r.sources.map(s=>'<li><strong>'+esc(s.document.replace('.md','').replaceAll('_',' '))+'</strong><span>'+esc(s.section)+'</span></li>').join('')+'</ul></section><section><h2>Fiches liées</h2>'+links(r.links)+'</section></footer></article>'+(backs.length?shelf('Cité dans',backs):'');
}
function forge(){return simpleHead('La Forge locale','Les documents d’auteur et les archives ne sont pas publiés.')+(window.MONO_PRIVATE?.docs?'<section class="private-docs">'+Object.entries(window.MONO_PRIVATE.docs).map(([title,body])=>'<details><summary>'+esc(title)+'</summary><pre>'+esc(body)+'</pre></details>').join('')+'</section>':'<section class="empty-state"><h2>Atelier privé</h2><p>La Forge est disponible depuis l’atelier local du projet MONO-prime.</p><a class="text-link" href="#/codex">Revenir au Codex</a></section>');}
function notFound(){return simpleHead('Cette page est introuvable','Le lien ne correspond à aucune entrée du Codex.')+'<section class="empty-state"><a class="seal-button" href="#/codex">Rechercher dans le Codex</a></section>';}
function notify(message){$('toast').textContent=message;clearTimeout(toastTimer);$('toast').classList.add('show');toastTimer=setTimeout(()=>$('toast').classList.remove('show'),4500);}
function bind(){
 $('codex-filter')?.addEventListener('submit',e=>{e.preventDefault();const p=new URLSearchParams(new FormData(e.currentTarget));for(const [k,v] of [...p])if(!v)p.delete(k);const hash='#/codex'+(p.size?'?'+p:'');if(location.hash===hash)$('results').scrollIntoView({block:'start'});else location.hash=hash;});
 document.querySelector('[data-bookmark]')?.addEventListener('click',e=>{
  const b=e.currentTarget,id=b.dataset.bookmark,old=bookmarks(),next=old.includes(id)?old.filter(x=>x!==id):[...old,id];
  if(!store.set('mono-v45-bookmarks',next)){notify('Le stockage est indisponible. Vous pouvez copier le lien de cette fiche.');return;}
  const kept=next.includes(id);b.setAttribute('aria-pressed',String(kept));b.textContent=kept?'Retirer des signets':'Ajouter aux signets';chrome(currentKey);notify(kept?'Fiche ajoutée à vos signets.':'Fiche retirée de vos signets.');
 });
 document.querySelector('[data-share]')?.addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(location.href);notify('Lien copié. Vous pouvez le partager.');}
  catch{notify('Copiez le lien dans la barre d’adresse de votre navigateur.');}
 });
}
function signal(){
 const canvas=$('signal-canvas');if(!canvas)return;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 function draw(){
  const bounds=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),w=bounds.width,h=bounds.height;
  canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);
  const tone=getComputedStyle(document.documentElement).getPropertyValue('--signal').trim();
  ctx.strokeStyle=tone;ctx.fillStyle=tone;ctx.lineWidth=.7;
  const radius=Math.min(w,h)*.37;
  for(let i=0;i<80;i++){
   const a=i*Math.PI/40,x=w/2,y=h/2,r=radius+(i%5?8:0);
   ctx.globalAlpha=i%5?.38:.7;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);ctx.lineTo(x+Math.cos(a)*(radius+16),y+Math.sin(a)*(radius+16));ctx.stroke();
  }
  ctx.globalAlpha=.4;
  for(let i=0;i<10;i++){const a=i*Math.PI/5-.5;ctx.beginPath();ctx.arc(w/2+Math.cos(a)*radius*.68,h/2+Math.sin(a)*radius*.68,2.2,0,Math.PI*2);ctx.fill();}
 }
 const observer=new ResizeObserver(draw);observer.observe(canvas);draw();return()=>observer.disconnect();
}
function route(){
 visualCleanup?.();visualCleanup=null;
 if($('search-dialog').open)$('search-dialog').close();
 closeMenu();
 const raw=location.hash.replace(/^#\/?/,'')||'accueil', cut=raw.indexOf('?'),name=cut<0?raw:raw.slice(0,cut),params=new URLSearchParams(cut<0?'':raw.slice(cut+1)),parts=name.split('/');
 const aliases={domaines:'terra',ages:'histoire',fondements:'fondements'};
 let key=aliases[parts[0]]||parts[0],html,title,recordId;
 try{recordId=decodeURIComponent(parts[1]||'');}catch{recordId='';}
 if(key==='accueil')html=home();
 else if(key==='commencer')html=begin();
 else if(key==='cosmologie')html=cosmology();
 else if(key==='terra')html=atlas(params);
 else if(key==='histoire')html=history(params);
 else if(key==='codex')html=codex(params);
 else if(['annales','revelations','fondements'].includes(key))html=collection(key);
 else if(key==='lacunes')html=gaps();
 else if(key==='favoris')html=savedPage();
 else if(key==='forge')html=forge();
 else if(key==='fiche'&&get(recordId)){html=record(get(recordId));title=get(recordId).title;}
 else html=notFound();
 currentKey=key;chrome(key==='fiche'?'codex':key);$('main').innerHTML=html;$('main').dataset.route=key;
 title=title||$('main').querySelector('h1')?.textContent||'MONO';
 document.title=key==='accueil'?'MONO · Le Codex du Bris':title+' · MONO';
 if(key==='fiche'&&get(recordId))document.querySelector('meta[name="description"]').content=get(recordId).summary;
 else document.querySelector('meta[name="description"]').content=P.premise;
 bind();visualCleanup=signal();
 if(initialized)$('main').focus({preventScroll:true});
 const target=key==='codex'&&params.size?$('results'):null;
 if(target)target.scrollIntoView({block:'start',behavior:'instant'});else window.scrollTo({top:0,behavior:'instant'});
 initialized=true;
}
function search(q){
 const list=records.filter(r=>!q||searchable.get(r.id).includes(norm(q))),visible=list.slice(0,18);
 $('search-count').textContent=list.length+' résultat'+(list.length>1?'s':'')+(list.length>18?' · 18 premiers affichés':'');
 $('search-results').innerHTML=visible.map(r=>'<a href="'+link(r.id)+'"><span><small>'+esc(r.type)+' · '+esc(r.domain)+'</small><b>'+esc(r.title)+'</b></span>'+state(r.status)+'</a>').join('')||'<p class="empty-state">Aucun résultat. Essayez un autre mot.</p>';
 $('search-all').href='#/codex?q='+encodeURIComponent(q);$('search-all').hidden=!list.length;
}
if(window.MONO_PRERENDER){window.MONO_RENDERED_HOME=home();return;}
$('search-open').addEventListener('click',()=>{closeMenu();opener=document.activeElement;$('search-dialog').showModal();$('search-input').value='';search('');$('search-input').focus();});
$('search-close').addEventListener('click',()=>$('search-dialog').close());
$('search-dialog').addEventListener('click',e=>{if(e.target===$('search-dialog')){const b=e.target.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)e.target.close();}if(e.target.closest('a'))$('search-dialog').close();});
$('search-dialog').addEventListener('close',()=>{if(opener?.isConnected)opener.focus();});
$('search-input').addEventListener('input',e=>search(e.target.value));
function theme(value){
 document.documentElement.dataset.theme=value;$('theme').textContent=value==='ink'?'Mode papier':'Mode encre';$('theme').setAttribute('aria-label',value==='ink'?'Activer le mode papier':'Activer le mode encre');
 visualCleanup?.();visualCleanup=signal();
}
let initialTheme='ink';try{const saved=localStorage.getItem('mono-v45-theme');if(saved==='paper'||saved==='ink')initialTheme=saved;}catch{}
theme(initialTheme);
$('theme').addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='ink'?'paper':'ink';theme(next);try{localStorage.setItem('mono-v45-theme',next);}catch{notify('Le thème est appliqué pour cette visite.');}});
$('menu').addEventListener('click',()=>{const open=document.body.classList.toggle('tabs-open');$('menu').setAttribute('aria-expanded',String(open));});
document.addEventListener('keydown',e=>{
 const typing=e.target.matches('input,textarea,select')||e.target.isContentEditable;
 if(((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k')||(e.key==='/'&&!typing)){e.preventDefault();if(!$('search-dialog').open)$('search-open').click();}
 if(e.key==='Escape'){if(document.body.classList.contains('tabs-open')){closeMenu();$('menu').focus();}}
});
document.querySelector('.skip').addEventListener('click',e=>{e.preventDefault();$('main').focus();$('main').scrollIntoView({block:'start'});});
window.addEventListener('hashchange',route);
window.addEventListener('storage',e=>{if(e.key==='mono-v45-bookmarks')route();});
route();
})();
