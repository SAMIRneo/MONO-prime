export type Route = {
  page: string;
  id: string;
  chapter: number;
  query: string;
  section: number | null;
};

/** Group deep links under the three permanent destinations. Utilities stand alone. */
export function primarySection(
  route: Pick<Route, "page" | "id">,
): "" | "recits" | "codex" | null {
  if (route.page === "recits" || route.page === "lire") return "recits";
  if (route.page === "fiche" && route.id === "terra") return "";
  if (route.page === "codex" || route.page === "fiche") return "codex";
  if (
    ["", "univers", "terra", "powerscaling", "chronologie"].includes(route.page)
  )
    return "";
  return null;
}

const aliases: Record<string, string> = {
  accueil: "",
  personnages: "codex",
  fondements: "univers",
  cosmologie: "univers",
  domaines: "univers",
  revelations: "univers",
  histoire: "chronologie",
  ages: "chronologie",
  annales: "recits",
  lore: "recits",
  explorer: "univers",
  recherche: "chercher",
  favoris: "signets",
  pouvoirs: "powerscaling",
  powerskelling: "powerscaling",
};
const entryAliases: Record<string, string> = {
  "structure-verticale": "cosmogonie",
  retrait: "azkavoth",
  sacerdoces: "cultes",
  mysteres: "temoins",
  "chronologie-1": "chronologie",
  decouvrir: "cosmogonie",
};

export function chapterNumber(value: string): number {
  const n = Number(value);
  return Number.isSafeInteger(n) && n > 0 ? n : 1;
}

export function parseRoute(hash: string): Route {
  const fragment = hash.replace(/^#\/?/, "");
  const split = fragment.indexOf("?");
  const path = split < 0 ? fragment : fragment.slice(0, split);
  const params = new URLSearchParams(
    split < 0 ? "" : fragment.slice(split + 1),
  );
  const [raw = "", id = "", chapter = "1"] = path.split("/");
  const section = params.get("section");
  const sectionNumber =
    section !== null && /^\d+$/.test(section) ? Number(section) : null;
  const result: Route = {
    page: aliases[raw] ?? raw,
    id,
    chapter: chapterNumber(chapter),
    query: params.get("q") || "",
    section: Number.isSafeInteger(sectionNumber) ? sectionNumber : null,
  };
  if (raw === "fiche" && id.startsWith("livre-"))
    return {
      ...result,
      page: "lire",
      chapter: chapterNumber(params.get("chapitre") || "1"),
      section: null,
    };
  if (raw === "fiche" && id.startsWith("chronologie-"))
    return { ...result, page: "chronologie", id: "", section: null };
  if (
    raw === "fiche" &&
    ["archanges", "revers", "lignees", "cultes", "powerscaling"].includes(id)
  )
    return { ...result, page: "codex", section: null };
  if (raw === "fiche" && entryAliases[id]) {
    const target = entryAliases[id];
    return {
      ...result,
      page:
        target === "chronologie"
          ? "chronologie"
          : target === "cultes"
            ? "codex"
            : "fiche",
      id: target,
    };
  }
  return result;
}

export function queryHash(path: string, query: string): string {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query);
  return `#/${path}${params.size ? "?" + params.toString() : ""}`;
}

export function readingPosition(
  value: unknown,
  books: readonly { id: string; chapters: readonly unknown[] }[],
): { book: string; chapter: number } | null {
  if (
    !value ||
    typeof value !== "object" ||
    !("book" in value) ||
    !("chapter" in value)
  )
    return null;
  const book = books.find((b) => b.id === value.book);
  if (
    !book ||
    typeof value.chapter !== "number" ||
    !Number.isSafeInteger(value.chapter) ||
    value.chapter < 1
  )
    return null;
  return {
    book: book.id,
    chapter: Math.min(value.chapter, book.chapters.length),
  };
}

/** Keep chapter navigation within one reading sequence, even when books mix eras. */
export function chapterNeighbours(
  books: readonly { id: string; kind?: string; chapters: readonly { title: string }[] }[],
  id: string,
  chapter: number,
): { previous: { href: string; title: string } | null; next: { href: string; title: string } | null } {
  const book = books.find(b => b.id === id);
  if (!book || !book.chapters.length) return { previous: null, next: null };
  const group = books.filter(b => (b.kind || "origins") === (book.kind || "origins"));
  const position = group.findIndex(b => b.id === id);
  const number = Number.isSafeInteger(chapter) ? Math.min(book.chapters.length, Math.max(1, chapter)) : 1;
  const link = (target: (typeof books)[number] | undefined, n: number) =>
    target?.chapters[n - 1] ? { href: `#/lire/${target.id}/${n}`, title: target.chapters[n - 1].title } : null;
  const previousBook = group[position - 1];
  return {
    previous: number > 1 ? link(book, number - 1) : link(previousBook, previousBook?.chapters.length || 1),
    next: number < book.chapters.length ? link(book, number + 1) : link(group[position + 1], 1),
  };
}
