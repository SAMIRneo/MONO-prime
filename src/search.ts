export const normalize=(value:string)=>value.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/[’']/g,' ').trim();
export function matches(text:string,query:string):boolean {
 const haystack=normalize(text);
 return normalize(query).split(/\s+/).every(word=>haystack.includes(word));
}

type SearchEntry = {
 title: string;
 subtitle: string;
 summary: string;
 aliases?: readonly string[];
 mysteries?: readonly string[];
 open_questions?: readonly string[];
 sections: readonly {title: string; text: string}[];
};
export function entrySearchText(entry: SearchEntry): string {
 return [entry.title, ...(entry.aliases ?? []), entry.subtitle, entry.summary,
  ...(entry.mysteries ?? []), ...(entry.open_questions ?? []),
  ...entry.sections.flatMap(section => [section.title, section.text])].join(' ');
}
export function lexiconSearchText(term: {term: string; definition: string}): string {
 return `${term.term} ${term.definition}`;
}
