import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readingPosition} from '../src/navigation.ts';
const canon=JSON.parse(readFileSync(new URL('../src/data/canon.json',import.meta.url),'utf8'));

test('the first edition starts with a complete illustrated reading cycle',()=>{
 assert.equal(canon.version,'V1.0');
 assert.equal(canon.books.length,4);
 assert.equal(canon.books.flatMap(b=>b.chapters).length,8);
 for(const book of canon.books){
  assert.equal(book.kind,'fondations');
  assert(book.chapters.every(ch=>ch.illustrations.length>0));
  for(const ch of book.chapters)for(const plate of ch.illustrations){
   assert(canon.records.some(r=>r.art===plate.art));
   assert(plate.after>=-1&&plate.after<ch.paragraphs.length);
  }
 }
});

test('old reading positions cannot silently resume a replacement text',()=>{
 assert.equal(readingPosition({book:'livre-1',chapter:1},canon.books),null);
 assert.deepEqual(readingPosition({book:'fondations-1',chapter:1},canon.books),{book:'fondations-1',chapter:1});
});
