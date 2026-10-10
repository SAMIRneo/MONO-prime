import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {entrySearchText,matches} from '../src/search.ts';
const d=JSON.parse(readFileSync(new URL('../src/data/canon.json',import.meta.url),'utf8'));
const byId=new Map(d.records.map(r=>[r.id,r]));

test('the causal reading path keeps creation, banishment and the gift in their revised order',()=>{
  assert.deepEqual(d.origins.map(e=>e.id),['nom','contraction','arbre','dechirure','matiere','bannissement','retrait','singularites']);
  for(const e of d.origins)assert(byId.has(e.record));
  assert.match(d.eras.find(e=>e.date==='CD 0').text,/Grand Retrait.*Calendrier du Départ/);
  assert.match(byId.get('qerath').sections.find(s=>s.title==='Une fonction, une ambition').text,/avant que le Sillage existe/);
  assert.match(byId.get('vothorak').sections.find(s=>s.title==='Origine').text,/planète, les astres et les premiers vivants existent déjà/);
});

test('superseded origins cannot return through a book, a record or an export source',()=>{
  const text=JSON.stringify(d);
  for(const obsolete of [
    'Tous les Témoins se trouvent en Éden', 'demeurent tous en Éden', 'Témoins eux-mêmes demeuraient tous',
    'Apparus avec les Sphères', 'La Déchirure fait naître les trois mondes',
    'matière de la Déchirure', 'territoires existaient depuis la Déchirure',
    'avant que la matière de Terra se fige', 'Calendrier de la Déchirure',
    'Noms et histoires des trois autres prophètes',
  ])assert(!text.includes(obsolete),obsolete);
  assert.match(byId.get('temoins').summary,/Six demeurent.*septième se retire/);
  assert.equal(d.records.filter(e=>e.category==='archanges').length,7);
  assert(!d.records.some(e=>e.id==='nael'||e.id==='bois-nacre'));
});

test('aliases, new historical figures and deliberately unanswered mysteries remain discoverable',()=>{
  assert(matches(entrySearchText(byId.get('qerath')),'Queroth'));
  assert(matches(entrySearchText(byId.get('ainoreth')),'Ainoreth'));
  for(const id of ['zahrel','orren','ilyane']){
    assert(byId.get('propheties').links.includes(id));
    assert(d.books.some(b=>b.chapters.some(c=>c.paragraphs.some(p=>p.includes(byId.get(id).title.split(' ')[0])))));
  }
  for(const e of d.records){
    assert(Array.isArray(e.mysteries),e.id);
    assert(e.mysteries.every(m=>!e.open_questions.includes(m)),e.id+' mixes mystery with unfinished development');
  }
  assert(byId.get('grand-retrait').mysteries.length>0);
  assert(byId.get('arbre').mysteries.length>0);
});
