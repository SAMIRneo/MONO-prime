import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {entrySearchText, lexiconSearchText, matches, normalize} from '../src/search.ts';
import {parseRoute} from '../src/navigation.ts';
const canon=JSON.parse(readFileSync(new URL('../src/data/canon.json',import.meta.url),'utf8'));
const byId=new Map(canon.records.map(entry=>[entry.id,entry]));

test('the old name and route still lead to the renamed repair entry',()=>{
 const route=parseRoute('#/fiche/tikkun');
 const entry=byId.get(route.id);
 assert.equal(entry.title,'La Concorde');
 assert(matches(entrySearchText(entry),'tikkun'));
 assert(matches(entrySearchText(entry),'concorde'));
 assert(canon.records.some(entry=>matches(entrySearchText(entry),'trois lectures')));
});
test('lexicon definitions are searchable and all destinations resolve',()=>{
 const ids=new Set();
 const names=new Set();
 for(const term of canon.lexicon){
  assert(!ids.has(term.id)); ids.add(term.id);
  assert(!names.has(normalize(term.term))); names.add(normalize(term.term));
  assert(byId.has(term.record),term.id);
  assert(matches(lexiconSearchText(term),term.term));
 }
 assert(canon.lexicon.some(term=>matches(lexiconSearchText(term),'tikkun')));
 assert(canon.lexicon.some(term=>matches(lexiconSearchText(term),'eclats')));
 assert.equal(canon.lexicon.filter(term=>term.essential).length,12);
});
test('the powers guide and individual sovereign entries cannot drift apart',()=>{
 const ways=byId.get('sept-voies').sections.slice(0,7);
 const angels=['ophriel','hodariel','sethariel','malkiel','rahamiel','tamariel','nechariel'];
 for(let i=0;i<angels.length;i++){
  const individual=byId.get(angels[i]).sections.find(section=>section.title==='Voie et pouvoirs');
  assert.equal(individual.text,ways[i].text,angels[i]);
 }
 const inversions=byId.get('inversions-abyssales').sections.slice(0,7);
 const revers=['karzuth','nehrun','ymbrath','bazhur','sevrak','ilmoth','zhorum'];
 for(let i=0;i<revers.length;i++){
  const individual=byId.get(revers[i]).sections.find(section=>section.title==='Pouvoirs et limites');
  assert.equal(individual.text,inversions[i].text,revers[i]);
 }
 for(const section of byId.get('lignees-sillage').sections.slice(0,6)){
  const individual=canon.records.find(entry=>entry.category==='lignees'&&entry.title===section.title);
  assert.equal(individual.sections.find(section=>section.title==='Circulation du Sillage').text,section.text,section.title);
 }
});
