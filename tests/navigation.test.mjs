import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseRoute,
  queryHash,
  readingPosition,
  primarySection,
  chapterNeighbours,
} from "../src/navigation.ts";
import { matches } from "../src/search.ts";

test("deep links belong to one primary destination, while utilities stay independent", () => {
  for (const hash of [
    "#/",
    "#/univers",
    "#/terra/khoram",
    "#/fiche/terra",
    "#/pouvoirs",
    "#/ages",
  ])
    assert.equal(primarySection(parseRoute(hash)), "");
  for (const hash of [
    "#/recits",
    "#/lire/livre-2/3",
    "#/fiche/livre-2?chapitre=3",
  ])
    assert.equal(primarySection(parseRoute(hash)), "recits");
  for (const hash of [
    "#/codex/lignees?q=djinns",
    "#/fiche/qerath",
    "#/fiche/archanges",
  ])
    assert.equal(primarySection(parseRoute(hash)), "codex");
  for (const hash of ["#/chercher?q=sillage", "#/signets", "#/inconnu"])
    assert.equal(primarySection(parseRoute(hash)), null);
});

test("reading sequences never jump from origins to an unrelated arc", () => {
  const books = [
    { id: "old-1", kind: "origins", chapters: [{ title: "A" }, { title: "B" }] },
    { id: "arc", kind: "arc", chapters: [{ title: "Forest" }, { title: "Return" }] },
    { id: "old-2", kind: "origins", chapters: [{ title: "C" }] },
  ];
  assert.equal(chapterNeighbours(books, "old-1", 2).next.href, "#/lire/old-2/1");
  assert.equal(chapterNeighbours(books, "old-2", 1).next, null);
  assert.equal(chapterNeighbours(books, "arc", 1).previous, null);
  assert.equal(chapterNeighbours(books, "arc", 2).next, null);
  assert.equal(chapterNeighbours(books, "arc", 1).next.href, "#/lire/arc/2");
  assert.equal(chapterNeighbours(books, "missing", 1).next, null);
  assert.equal(chapterNeighbours(books, "arc", Infinity).previous, null);
  assert.equal(chapterNeighbours(books, "arc", 99).previous.href, "#/lire/arc/1");
});

test("Codex category and query survive a shared URL", () => {
  const hash = queryHash("codex/archanges", "vision vérité?");
  const route = parseRoute(hash);
  assert.equal(route.id, "archanges");
  assert.equal(route.query, "vision vérité?");
});
test("direct section links and old URLs remain usable", () => {
  assert.equal(parseRoute("#/fiche/ophriel?section=2").section, 2);
  assert.equal(parseRoute("#/fiche/retrait").id, "azkavoth");
  assert.equal(parseRoute("#/fiche/archanges").page, "codex");
  assert.equal(parseRoute("#/fiche/livre-2?chapitre=3").chapter, 3);
  for (const section of ["-1", "NaN", "1.5", "9007199254740992"])
    assert.equal(
      parseRoute("#/fiche/ophriel?section=" + section).section,
      null,
    );
});
test("invalid chapters and stale reading data cannot break the page", () => {
  for (const chapter of ["0", "-1", "NaN", "Infinity", "2.5"])
    assert.equal(parseRoute("#/lire/livre-1/" + chapter).chapter, 1);
  const books = [{ id: "livre-1", chapters: [1, 2] }];
  for (const value of [
    null,
    false,
    42,
    {},
    { book: "absent", chapter: 1 },
    { book: "livre-1", chapter: "2" },
    { book: "livre-1", chapter: -1 },
  ])
    assert.equal(readingPosition(value, books), null);
  assert.deepEqual(readingPosition({ book: "livre-1", chapter: 99 }, books), {
    book: "livre-1",
    chapter: 2,
  });
});
test("search accepts accents, apostrophes and multiple terms", () => {
  assert(matches("L’Épreuve de Qerath", "qerath epreuve"));
  assert(matches("La vérité reste libre", "verite libre"));
  assert(!matches("La vérité reste libre", "verite prison"));
});
