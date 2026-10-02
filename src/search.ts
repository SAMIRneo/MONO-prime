export const normalize=(value:string)=>value.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/[’']/g,' ').trim();
export function matches(text:string,query:string):boolean {
 const haystack=normalize(text);
 return normalize(query).split(/\s+/).every(word=>haystack.includes(word));
}
