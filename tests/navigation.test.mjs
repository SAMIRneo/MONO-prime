import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseRoute,queryHash,readingPosition} from '../src/navigation.ts';
import {matches} from '../src/search.ts';

test('Codex category and query survive a shared URL',()=>{
 const hash=queryHash('codex/archanges','vision vérité?');
 const route=parseRoute(hash);
 assert.equal(route.id,'archanges');assert.equal(route.query,'vision vérité?');
});
test('direct section links and old URLs remain usable',()=>{
 assert.equal(parseRoute('#/fiche/ophriel?section=2').section,2);
 assert.equal(parseRoute('#/fiche/retrait').id,'azkavoth');
 assert.equal(parseRoute('#/fiche/archanges').page,'codex');
 assert.equal(parseRoute('#/fiche/livre-2?chapitre=3').chapter,3);
 for(const section of ['-1','NaN','1.5','9007199254740992'])assert.equal(parseRoute('#/fiche/ophriel?section='+section).section,null);
});
test('invalid chapters and stale reading data cannot break the page',()=>{
 for(const chapter of ['0','-1','NaN','Infinity','2.5'])assert.equal(parseRoute('#/lire/livre-1/'+chapter).chapter,1);
 const books=[{id:'livre-1',chapters:[1,2]}];
 for(const value of [null,false,42,{}, {book:'absent',chapter:1},{book:'livre-1',chapter:'2'},{book:'livre-1',chapter:-1}])assert.equal(readingPosition(value,books),null);
 assert.deepEqual(readingPosition({book:'livre-1',chapter:99},books),{book:'livre-1',chapter:2});
});
test('search accepts accents, apostrophes and multiple terms',()=>{
 assert(matches('L’Épreuve de Qerath','qerath epreuve'));
 assert(matches('La vérité reste libre','verite libre'));
 assert(!matches('La vérité reste libre','verite prison'));
});
