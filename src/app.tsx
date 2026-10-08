import { useEffect, useRef, useState } from "react";
import canon from "./data/canon.json";
import artData from "./data/art.json";
import {
  parseRoute,
  queryHash,
  readingPosition,
  primarySection,
  type Route,
} from "./navigation";
import { matches, entrySearchText, lexiconSearchText } from "./search";

type Entry = (typeof canon.records)[number];
type Book = (typeof canon.books)[number];

const entries = canon.records;
const byId = new Map(entries.map((r) => [r.id, r]));
const groups = canon.categories;
const BASE = import.meta.env.BASE_URL;
const artMetadata: Record<
  string,
  { width: number; height: number; smallWidth: number; mediumWidth: number }
> = artData;
const asset = (name: string, variant: "full" | "small" | "medium" = "full") =>
  `${BASE}art/${name}${variant === "full" ? "" : "-" + variant}.webp?v=20261006-ultimate`;
const replaceQuery = (path: string, value: string) =>
  history.replaceState(null, "", queryHash(path, value));
const read = <T,>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
};
const save = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};
const href = (id: string) => (id === "terra" ? "#/terra" : `#/fiche/${id}`);
const category = (id: string) => groups.find((g) => g.id === id)?.label || id;
const route = (): Route => parseRoute(location.hash);
const minutes = (text: string) =>
  Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200));
function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    search: (
      <>
        <circle cx="10" cy="10" r="6" />
        <path d="m15 15 5 5" />
      </>
    ),
    book: (
      <>
        <path d="M12 5v15M3 4c4-1 6 0 9 1 3-1 5-2 9-1v15c-4-1-6 0-9 1-3-1-5-2-9-1Z" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    star: <path d="M6 3h12v18l-6-4-6 4Z" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    home: (
      <>
        <path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    map: (
      <>
        <path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Z" />
        <path d="M9 3v16M15 5v16" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      {paths[name] || paths.arrow}
    </svg>
  );
}
const landscapeArt = new Set(
  Object.entries(artMetadata)
    .filter(([, m]) => m.width > m.height)
    .map(([name]) => name),
);
const cardSizes = "(max-width: 360px) calc(100vw - 36px), (max-width: 900px) calc((100vw - 50px) / 2), (max-width: 1200px) 28vw, 340px";
const featuredSizes = "(max-width: 620px) calc(100vw - 36px), (max-width: 900px) calc((100vw - 50px) / 2), 420px";
function Art({
  name,
  alt = "",
  hero = false,
  sizes = cardSizes,
}: {
  name: string;
  alt?: string;
  hero?: boolean;
  sizes?: string;
}) {
  const m = artMetadata[name];
  const sources = m
    ? ([
        [m.smallWidth, asset(name, "small")],
        [m.mediumWidth, asset(name, "medium")],
        [m.width, asset(name)],
      ] as const)
    : [];
  const unique = new Map(sources);
  return (
    <img
      src={asset(name, hero ? "full" : "small")}
      srcSet={[...unique].map(([width, url]) => `${url} ${width}w`).join(", ")}
      sizes={sizes}
      width={m?.width}
      height={m?.height}
      alt={alt}
      loading={hero ? "eager" : "lazy"}
      fetchPriority={hero ? "high" : "auto"}
      decoding="async"
    />
  );
}
function LinkArrow({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <a className="text-link" href={to}>
      {children}
      <Icon name="arrow" />
    </a>
  );
}
function SectionHead({
  eyebrow,
  title,
  copy,
  link,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  link?: [string, string];
}) {
  return (
    <header className="section-head">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {copy && <p>{copy}</p>}
      </div>
      {link && <LinkArrow to={link[0]}>{link[1]}</LinkArrow>}
    </header>
  );
}
function Card({
  entry,
  onPortrait,
  sizes = cardSizes,
}: {
  entry: Entry;
  onPortrait: (entry: Entry) => void;
  sizes?: string;
}) {
  return (
    <article
      className={`entry-card ${entry.art ? "illustrated" : "text-card"} ${entry.art && landscapeArt.has(entry.art) ? "landscape-card" : ""}`}
    >
      {entry.art && (
        <div className="card-art">
          <a
            className="art-button"
            href={href(entry.id)}
            aria-label={`Lire la fiche de ${entry.title}`}
          >
            <Art
              name={entry.art}
              alt={`Interprétation artistique : ${entry.title}`}
              sizes={sizes}
            />
          </a>
          <button
            className="zoom"
            onClick={() => onPortrait(entry)}
            aria-label={`Agrandir l’illustration de ${entry.title}`}
          >
            ⤢
          </button>
        </div>
      )}
      <div className="card-copy">
        <span className="eyebrow">{entry.subtitle}</span>
        <h3>
          <a href={href(entry.id)}>{entry.title}</a>
        </h3>
        <p>{entry.summary}</p>

      </div>
    </article>
  );
}

function PageHead({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <header className="page-head">
      <a className="crumb" href="#/">
        MONO <span>/</span> {eyebrow}
      </a>
      <h1>{title}</h1>
      <p>{copy}</p>
    </header>
  );
}

const exploreLinks = [
  ["univers", "Le guide", "Les clés du monde", "azkavoth"],
  ["terra", "L’atlas", "Cinq continents à explorer", "terra-map-v1"],
  ["powerscaling", "Le Sillage", "Un fluide. Sept voies.", "sillage-fluide-v1"],
  ["chronologie", "Les âges", "De l’origine aux Brisures", "brisures"],
];
function ExploreNav({ page }: { page: string }) {
  return (
    <nav className="explore-nav" aria-label="Explorer l’univers">
      <a href="#/">Accueil</a>
      <div>
        {exploreLinks.map(([id, label]) => (
          <a
            key={id}
            href={`#/${id}`}
            aria-current={page === id ? "page" : undefined}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
function ReadingTrail() {
  const position = readingPosition(
    read<unknown>("mono-v9-reading", null),
    canon.books,
  );
  const book = canon.books.find((b) => b.id === position?.book);
  return (
    <a
      className="reading-trail"
      href={
        book && position
          ? `#/lire/${book.id}/${position.chapter}`
          : "#/lire/livre-1/1"
      }
    >
      <span className="trail-icon">
        <Icon name="book" />
      </span>
      <div>
        <span className="eyebrow">
          {book ? "VOTRE DERNIER PASSAGE" : "LE PREMIER PAS"}
        </span>
        <strong>
          {book && position
            ? book.chapters[position.chapter - 1].title
            : "Avant le Temps"}
        </strong>
        <span>
          {book ? book.title : "La création commence par un retrait."}
        </span>
      </div>
      <span className="trail-action">
        {book ? "Reprendre" : "Commencer"}
        <Icon name="arrow" />
      </span>
    </a>
  );
}
function Home() {
  const date = new Intl.DateTimeFormat("fr-FR", {day:"numeric",month:"long",year:"numeric"}).format(new Date(canon.updated + "T12:00:00"));
  const book = canon.books[0];
  const chapter = book.chapters[0];
  return (
    <div className="notebook">
      <aside className="notebook-index" aria-label="Index du site">
        <nav aria-label="Sommaire">
          <h2>Sommaire</h2>
          <a href="#/univers">Introduction à l’univers</a>
          <a href="#/recits">Les quatre livres</a>
          <a href="#/terra">Carte de Terra</a>
          <a href="#/powerscaling">Sillage et maîtrise</a>
          <a href="#/chronologie">Chronologie</a>
          <a href="#/univers?section=6">Lexique</a>
        </nav>
        <details className="notebook-categories">
          <summary>Index des fiches <span>{entries.length}</span></summary>
          <nav aria-label="Fiches par catégorie">{groups.map(group=><a href={"#/codex/"+group.id} key={group.id}>{group.label}<span>{entries.filter(e=>e.category===group.id).length}</span></a>)}</nav>
        </details>
        <div className="index-colophon"><p>Canon {canon.version}<br />{date}</p><a href={BASE+"canon/MONO_CANON_V9.md"}>Texte intégral (.md)</a><a href="#/signets">Mes signets</a></div>
      </aside>
      <div className="notebook-pages">
        <header className="notebook-intro"><span className="notebook-path">mono / journal</span><h1>Le Codex de la Déchirure</h1><p>La création de MONO commence par un retrait. De là viennent les mondes, leurs puissances et la liberté de leurs habitants. Les récits et les fiches en suivent les conséquences.</p><p className="start-reading">Pour commencer : <a href="#/lire/livre-1/1">Avant le Temps, chapitre I</a>. Pour les repères : <a href="#/univers">l’introduction</a>.</p></header>
        <figure className="world-frontispiece">
          <div className="world-impressions">{["cieux", "terra", "abysses"].map(id => {
            const world = byId.get(id)!;
            return <a key={id} href={href(id)} className={"world-impression world-"+id}><Art name={world.art} hero sizes="(max-width: 760px) 33vw, 260px" /><span>{world.title}</span></a>;
          })}</div>
          <figcaption>Terra est physique ; les Cieux et les Abysses sont métaphysiques.<br /><a href="#/univers">Lire la cosmologie</a></figcaption>
        </figure>
        <ReadingTrail />
        <article className="notebook-post chronicle-excerpt">
          <div className="post-date"><span>Lecture / Livre I</span><a href="#/recits">Sommaire des livres</a></div>
          <h2><a href={"#/lire/"+book.id+"/1"}>{chapter.title}</a></h2>
          <figure className="chronicle-plate"><Art name={book.art} alt={book.title} sizes="(max-width: 620px) 130px, 190px" /><figcaption>{book.title}<br />Chapitre I</figcaption></figure>
          <blockquote>{chapter.paragraphs.slice(0,2).map((paragraph,i)=><p key={i}>{paragraph}</p>)}</blockquote>
          <a className="continue-reading" href={"#/lire/"+book.id+"/1"}>Lire le chapitre</a>
        </article>
        <article className="notebook-post" id="revision">
          <div className="post-date"><time dateTime={canon.updated}>{date}</time><a href="#/univers?section=6">Canon {canon.version}</a></div>
          <h2>Éclats, Sceaux et Concorde</h2>
          <p>Quelques mots ont changé ; certaines règles demandaient à être précisées. Voici les repères de cette révision :</p>
          <ul className="revision-list"><li><a href="#/fiche/azkavoth">La Source</a> demeure unique et indivisible. Les Éclats ne sont pas des morceaux de Dieu.</li><li><a href="#/fiche/sceaux">Les quatre Sceaux</a> donnent accès aux Éclats ; ils ne garantissent pas la maîtrise.</li><li><a href="#/fiche/tikkun">La Concorde</a> est le nom courant du Tikkun : réparer sans retirer la possibilité de refuser.</li></ul>
          <p className="post-reference"><a href="#/univers?section=6">Les vingt définitions du lexique</a> · <a href="#/powerscaling">Les règles du Sillage</a></p>
        </article>
        <article className="notebook-post atlas-notes">
          <div className="post-date"><span>Géographie / Avarn</span><a href="#/terra">Atlas</a></div>
          <h2>Aurenth n’est pas Éden</h2>
          <p>Aurenth est une cité terrestre d’Avarn. Son sanctuaire conserve l’empreinte du regard d’Éden ; Éden et les Sept Témoins demeurent dans les Cieux.</p>
          <figure><a href="#/fiche/aurenth" aria-label="Lire la fiche d’Aurenth"><Art name={byId.get("aurenth")!.art} alt="Aurenth, cité sainte terrestre" sizes="(max-width: 760px) 100vw, 700px" /></a><figcaption>Aurenth. Illustration du sanctuaire et des quartiers de la cité.</figcaption></figure>
          <p className="post-reference"><a href="#/fiche/aurenth">Aurenth</a> · <a href="#/fiche/temoins">Éden et les Sept Témoins</a> · <a href="#/fiche/avarn">Avarn</a></p>
        </article>
        <section className="notebook-crossrefs"><h2>Autres dossiers</h2><dl>{["qerath","vothorak","eshar"].map(id=>{const entry=byId.get(id)!;return <div key={id}><dt><a href={href(id)}>{entry.title}</a></dt><dd>{entry.summary}</dd></div>})}</dl></section>
      </div>
    </div>
  );
}

function Terra({
  selected = "avarn",
  onPortrait,
}: {
  selected?: string;
  onPortrait: (e: Entry) => void;
}) {
  const ids = ["avarn", "sahrun", "khoram", "seyra", "theryn"];
  const id = ids.includes(selected) ? selected : "avarn",
    continent = byId.get(id)!,
    city = byId.get("aurenth")!;
  const panel = useRef<HTMLElement>(null);
  const mapEntry = {
    ...byId.get("terra")!,
    title: "Carte de Terra",
    art: "terra-map-v1",
    summary:
      "Atlas illustré des cinq continents. Les contours, les distances et les positions restent une proposition géographique.",
  };
  const regions: Record<
    string,
    { position: string; climate: string; land: string; point: [number, number] }
  > = {
    avarn: {
      position: "Nord-ouest",
      climate: "Tempéré",
      land: "Forêts · Plaines · Vieux royaumes",
      point: [23, 27],
    },
    sahrun: {
      position: "Centre et sud",
      climate: "Aride et subtropical",
      land: "Déserts · Savanes · Oasis",
      point: [50, 50],
    },
    khoram: {
      position: "Nord-est",
      climate: "Montagnard et continental",
      land: "Montagnes · Steppes · Forges",
      point: [77, 31],
    },
    seyra: {
      position: "Sud-ouest",
      climate: "Tropical",
      land: "Jungles · Hauts plateaux · Cités anciennes",
      point: [18, 56],
    },
    theryn: {
      position: "Sud polaire",
      climate: "Glaciaire",
      land: "Glace · Ruines · Premières œuvres",
      point: [51, 85],
    },
  };
  const choose = (value: string, scroll = false) => {
    location.hash = `/terra/${value}`;
    if (scroll)
      requestAnimationFrame(() => {
        panel.current?.scrollIntoView({
          block: "start",
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
        });
        panel.current?.focus({ preventScroll: true });
      });
  };
  return (
    <div className="content terra-page">
      <PageHead
        eyebrow="Terra"
        title="Terra"
        copy="Des vieux royaumes d’Avarn aux premières œuvres enfouies dans Theryn, explorez la géographie du monde physique de MONO."
      />
      <nav className="terra-jump" aria-label="Explorer Terra">
        <a href="#/terra?section=0">La carte</a>
        <button
          onClick={() => {
            panel.current?.scrollIntoView({
              block: "start",
              behavior: "smooth",
            });
            panel.current?.focus({ preventScroll: true });
          }}
        >
          Les continents
        </button>
        <a href="#/terra?section=1">Aurenth</a>
        <LinkArrow to={href("cosmogonie")}>Les origines de Terra</LinkArrow>
      </nav>
      <section id="terra-map" className="terra-map-section">
        <div className="terra-map-heading">
          <div>
            <span className="eyebrow">ATLAS DU MONDE PHYSIQUE</span>
            <h2>La carte de Terra.</h2>
          </div>
          <button
            className="button subtle"
            onClick={() => onPortrait(mapEntry)}
          >
            Agrandir la carte <span aria-hidden="true">⤢</span>
          </button>
        </div>
        <div className="terra-map-frame">
          <Art
            name="terra-map-v1"
            alt="Carte de Terra : Avarn au nord-ouest, Khoram au nord-est, Sahrûn au centre, Seyra au sud-ouest et Theryn au sud polaire."
            hero
            sizes="(max-width: 1460px) 100vw, 1400px"
          />
          {ids.map((value, i) => (
            <button
              key={value}
              className="map-marker"
              style={{
                left: `${regions[value].point[0]}%`,
                top: `${regions[value].point[1]}%`,
              }}
              aria-label={`Explorer ${byId.get(value)!.title}`}
              aria-pressed={id === value}
              onClick={() => choose(value, true)}
            >
              {String(i + 1).padStart(2, "0")}
            </button>
          ))}
        </div>
        <p className="map-hint">
          <Icon name="map" />
          Touchez un repère pour découvrir son continent.
        </p>
        <p className="map-caption">
          Proposition géographique · Atlas illustré des cinq continents. Les
          contours, les positions et les distances restent à préciser dans le
          canon.
        </p>
      </section>
      <section
        ref={panel}
        tabIndex={-1}
        id="terra-continents"
        className="terra-continents"
      >
        <SectionHead
          eyebrow="LES CINQ CONTINENTS"
          title="Les continents"
          copy="Choisissez un continent pour découvrir son paysage et sa place dans MONO."
        />
        <div
          className="continent-tabs"
          role="group"
          aria-label="Choisir un continent"
        >
          {ids.map((value, i) => (
            <button
              key={value}
              aria-pressed={id === value}
              onClick={() => choose(value)}
            >
              <Art
                name={byId.get(value)!.art!}
                sizes="(max-width: 620px) 120px, 240px"
              />
              <span>
                <small>{String(i + 1).padStart(2, "0")}</small>
                {byId.get(value)!.title}
              </span>
            </button>
          ))}
        </div>
        <article className="continent-feature" key={id}>
          <div className="continent-visual">
            <Art
              name={continent.art!}
              alt={`Paysage de ${continent.title}`}
              sizes="(max-width: 800px) 100vw, 65vw"
            />
            <button
              className="zoom"
              onClick={() => onPortrait(continent)}
              aria-label={`Agrandir le paysage de ${continent.title}`}
            >
              ⤢
            </button>
          </div>
          <div className="continent-copy">
            <span className="eyebrow">
              {regions[id].position} · {regions[id].climate}
            </span>
            <h3>{continent.title}</h3>
            <p className="continent-biomes">{regions[id].land}</p>
            <p>{continent.summary}</p>
            <LinkArrow to={href(id)}>Découvrir {continent.title}</LinkArrow>
            <p className="terra-small-note">
              Les paysages sont des interprétations artistiques. Les États et
              frontières du présent restent à développer.
            </p>
          </div>
        </article>
      </section>
      <section id="terra-city" className="terra-city">
        <SectionHead
          eyebrow="AVARN · LA VILLE SAINTE TERRESTRE"
          title="Aurenth"
          copy="Une ville habitée, où la neutralité se construit dans les institutions et les rencontres."
        />
        <div className="aurenth-feature">
          <div className="aurenth-visual">
            <Art
              name={city.art!}
              alt="Aurenth, cité sainte terrestre : quartiers en terrasses et sanctuaire à deux coques ouvertes."
              sizes="(max-width: 1460px) 100vw, 1400px"
            />
            <button
              className="zoom"
              onClick={() => onPortrait(city)}
              aria-label="Agrandir Aurenth"
            >
              ⤢
            </button>
          </div>
          <div className="aurenth-copy">
            <div>
              <span className="eyebrow">LE PREMIER REGARD</span>
              <h3>Un lieu de présence et de passage.</h3>
              <p>{city.summary}</p>
            </div>
            <div>
              <p>
                Les Muets entretiennent les accords et accueillent les
                rencontres entre adversaires. Autour du sanctuaire, la ville
                possède ses quartiers, ses commerces et ses conflits.
              </p>
              <LinkArrow to={href("aurenth")}>Entrer dans Aurenth</LinkArrow>
            </div>
          </div>
        </div>
        <aside className="note compact">
          <p>
            <strong>Aurenth appartient à Terra.</strong> Éden demeure dans les
            Cieux : le sanctuaire terrestre conserve une empreinte du regard des
            Témoins.
          </p>
          <LinkArrow to={href("cieux")}>Découvrir Éden</LinkArrow>
        </aside>
      </section>
      <section className="terra-context">
        <SectionHead
          eyebrow="UN MONDE DANS LA CRÉATION"
          title="Repères du monde physique"
        />
        <div className="reference-grid">
          {["vothorak", "brisures", "sillage"].map((value) => {
            const e = byId.get(value)!;
            return (
              <a className="reference" href={href(value)} key={value}>
                <span className="eyebrow">{e.subtitle}</span>
                <h3>{e.title}</h3>
                <p>{e.summary}</p>
                <Icon name="arrow" />
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stories() {
  return (
    <div className="content stories-page">
      <PageHead
        eyebrow="Chroniques"
        title="Les chroniques"
        copy="Quatre livres. Un fil continu, des origines du monde à l’Éveil des Brisures."
      />
      <ReadingTrail />
      <div className="book-grid">
        {canon.books.map((b, i) => (
          <article key={b.id} className="book-card">
            <a
              href={`#/lire/${b.id}/1`}
              className="book-image"
              aria-label={`Lire ${b.title}`}
            >
              <Art name={b.art} sizes="(max-width: 700px) 100vw, 45vw" />
              <span className="book-roman">{["I", "II", "III", "IV"][i]}</span>
            </a>
            <div className="book-copy">
              <span className="eyebrow">
                LIVRE 0{i + 1} / {b.chapters.length} CHAPITRES
              </span>
              <h2>
                <a href={`#/lire/${b.id}/1`}>{b.title}</a>
              </h2>
              <p>{b.subtitle}</p>
              <LinkArrow to={`#/lire/${b.id}/1`}>Commencer le livre</LinkArrow>
              <details className="book-contents">
                <summary>
                  Feuilleter les chapitres <span>+</span>
                </summary>
                <ol>
                  {b.chapters.map((ch, n) => (
                    <li key={ch.id}>
                      <a href={`#/lire/${b.id}/${n + 1}`}>
                        <span>0{n + 1}</span>
                        {ch.title}
                        <Icon name="arrow" />
                      </a>
                    </li>
                  ))}
                </ol>
              </details>
            </div>
          </article>
        ))}
      </div>
      <aside className="note">
        <h3>Les origines, puis le présent.</h3>
        <p>
          Les grandes périodes dessinent la suite. Leurs histoires restent à
          développer.
        </p>
        <LinkArrow to="#/chronologie">Situer les événements</LinkArrow>
      </aside>
    </div>
  );
}

function Reader({
  book,
  chapter,
  onSave,
  saved,
}: {
  book: Book;
  chapter: number;
  onSave: () => void;
  saved: boolean;
}) {
  const index = Math.min(Math.max(1, chapter), book.chapters.length) - 1,
    ch = book.chapters[index];
  const [large, setLarge] = useState(
    read<unknown>("mono-v9-large", false) === true,
  );
  const [focus, setFocus] = useState(false);
  const [progress, setProgress] = useState(0);
  const [marked, setMarked] = useState(false);
  const article = useRef<HTMLElement>(null);
  useEffect(() => {
    document.documentElement.dataset.readingFocus = String(focus);
    return () => { delete document.documentElement.dataset.readingFocus; };
  }, [focus]);
  useEffect(() => {
    setFocus(false);
    setMarked(false);
    save("mono-v9-reading", { book: book.id, chapter: index + 1 });
    const update = () => {
      const box = article.current?.getBoundingClientRect();
      if (box)
        setProgress(
          Math.round(
            Math.max(
              0,
              Math.min(
                100,
                ((-box.top + 150) /
                  Math.max(1, box.height - window.innerHeight + 200)) *
                  100,
              ),
            ),
          ),
        );
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [book.id, index]);
  const bi = canon.books.findIndex((b) => b.id === book.id);
  const prev = index
    ? `#/lire/${book.id}/${index}`
    : bi > 0
      ? `#/lire/${canon.books[bi - 1].id}/${canon.books[bi - 1].chapters.length}`
      : null;
  const next =
    index < book.chapters.length - 1
      ? `#/lire/${book.id}/${index + 2}`
      : bi < canon.books.length - 1
        ? `#/lire/${canon.books[bi + 1].id}/1`
        : null;
  const nextTitle =
    index < book.chapters.length - 1
      ? book.chapters[index + 1].title
      : canon.books[bi + 1]?.chapters[0].title;
  return (
    <div
      className={`content reader ${large ? "reader-large" : ""} ${focus ? "reader-focus" : ""}`}
    >
      <div
        className="reading-progress"
        role="progressbar"
        aria-label="Progression dans le chapitre"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="reader-top">
        <a href="#/recits" className="crumb">
          ← Les quatre livres
        </a>
        <span className="eyebrow">
          LIVRE {["I", "II", "III", "IV"][bi]} · CHAPITRE {index + 1}/
          {book.chapters.length}
        </span>
      </div>
      <div className="reader-layout">
        <aside className="reader-toc">
          <span className="eyebrow">{book.title}</span>
          <ol>
            {book.chapters.map((c, i) => (
              <li key={c.id}>
                <a
                  aria-current={i === index ? "page" : undefined}
                  href={`#/lire/${book.id}/${i + 1}`}
                >
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {c.title}
                </a>
              </li>
            ))}
          </ol>
          <LinkArrow to="#/chronologie">Situer dans les âges</LinkArrow>
        </aside>
        <div className="reading-column">
          <div className="reading-controls">
            <label>
              Chapitre
              <select
                aria-label="Choisir un chapitre"
                value={index + 1}
                onChange={(e) => {
                  location.hash = `/lire/${book.id}/${e.target.value}`;
                }}
              >
                {book.chapters.map((c, i) => (
                  <option value={i + 1} key={c.id}>
                    {i + 1}. {c.title}
                  </option>
                ))}
              </select>
            </label>
            <button
              aria-pressed={large}
              onClick={() => {
                setLarge(!large);
                save("mono-v9-large", !large);
              }}
            >
              Aa <span>Texte</span>
            </button>
            <button aria-pressed={focus} onClick={() => setFocus(!focus)}>
              {focus ? "Vue complète" : "Concentration"}
            </button>
          </div>
          <article ref={article} className="prose story-prose">
            <span className="eyebrow">{book.subtitle}</span>
            <h1>{ch.title}</h1>
            <div className="reading-meta">
              <span>{minutes(ch.paragraphs.join(" "))} min de lecture</span>
              <span>
                Chapitre {index + 1} sur {book.chapters.length}
              </span>
            </div>
            <div className="chapter-divider">✦</div>
            {ch.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </article>
          <div className="reader-actions">
            <button
              className="button subtle"
              aria-pressed={saved}
              onClick={() => {
                onSave();
                setMarked(true);
              }}
            >
              <Icon name="star" />
              {saved ? "Retirer des signets" : "Garder ce livre"}
            </button>
            <span role="status">
              {marked
                ? saved
                  ? "Livre conservé dans vos signets."
                  : "Livre retiré des signets."
                : ""}
            </span>
          </div>
          <nav className="chapter-navigation" aria-label="Changer de chapitre">
            {prev ? <a href={prev}>← Précédent</a> : <span />}
            {next ? (
              <a href={next} className="next-chapter">
                <span>
                  <small>CONTINUER LE RÉCIT</small>
                  <strong>{nextTitle}</strong>
                </span>
                <Icon name="arrow" />
              </a>
            ) : (
              <a href="#/chronologie">
                Explorer les âges <Icon name="arrow" />
              </a>
            )}
          </nav>
          <aside className="reader-glossary">
            <span className="eyebrow">REPÈRES DE CE LIVRE</span>
            <p>
              Retrouvez les figures et les notions rencontrées dans ce récit.
            </p>
            <div>
              {(readingGuides[book.id] || ["cosmogonie", "sillage"]).map(
                (id) => (
                  <a href={href(id)} key={id}>
                    {byId.get(id)!.title}
                  </a>
                ),
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
const readingGuides: Record<string, string[]> = {
  "livre-1": ["azkavoth", "cosmogonie", "temoins", "sillage"],
  "livre-2": ["qerath", "jugement", "tamariel", "fond"],
  "livre-3": ["vothorak", "talem", "golems", "malkiel"],
  "livre-4": ["sceaux", "sarai", "eshar", "tikkun", "brisures"],
};
function LoreOrientation() {
  return (
    <section id="universe-0" tabIndex={-1} className="lore-orientation">
      <SectionHead
        eyebrow="01 / LES ORIGINES"
        title="Les origines"
        copy="Commencez par les causes. Les lieux, les personnages et les pouvoirs prennent ensuite leur sens."
      />
      <ol className="lore-sequence">
        {[
          [
            "Le Retrait",
            "AZKAVOTH offre le Lien, KA. Le Sillage rend possible une création qui peut répondre à son don.",
            "azkavoth",
          ],
          [
            "La Déchirure",
            "VO et TH se déploient dans la matière. Vothorak naît de la Forme et de l’Épanchement ; la Source demeure indivisible.",
            "cosmogonie",
          ],
          [
            "Les volontés",
            "Façonner un corps, protéger un monde ou gouverner une épreuve ne donne pas possession du choix d’autrui.",
            "jugement",
          ],
        ].map(([title, copy, id], i) => (
          <li key={id}>
            <span className="eyebrow">{String(i + 1).padStart(2, "0")}</span>
            <h3>{title}</h3>
            <p>{copy}</p>
            <LinkArrow to={href(id)}>Comprendre cette étape</LinkArrow>
          </li>
        ))}
      </ol>
      <div className="note compact">
        <p>
          <strong>Une Source, des puissances dérivées.</strong> AZKAVOTH est la Source unique ;
          Vothorak est le démiurge de Terra ; Qerath est le souverain banni des
          Abysses. Ces rôles ne forment pas un classement de puissance.
        </p>
      </div>
    </section>
  );
}
function LoreStakes() {
  return (
    <section id="universe-5" tabIndex={-1}>
      <SectionHead
        eyebrow="06 / LES ENJEUX"
        title="Les conflits et la réparation"
        copy="Le conflit porte sur la durée du monde et sur la liberté de ses habitants."
      />
      <div className="lore-stakes">
        {[
          [
            "qerath",
            "Une charge devenue ambition",
            "Qerath expose un déclin réel, puis en tire la fin de toutes les vies. Ouvrir le Fond exige la restitution libre des sept Revers. Leur accord rendrait l’acte possible ; il ne serait pas celui de tous les habitants.",
          ],
          [
            "vothorak",
            "Protéger, puis vouloir posséder",
            "Vothorak rend Terra habitable et la défend. Son conflit vient de sa volonté de rendre les vivants dépendants de son œuvre ; fabriquer leurs supports ne lui donne pas leur réponse.",
          ],
          [
            "tikkun",
            "Réparer sans imposer le salut",
            "La Concorde, appelée Tikkun dans les textes anciens, réaccorde les principes sans effacer les personnes. Elle peut sauver un lieu et libérer du Sillage engagé ; elle ne promet pas une réserve infinie ni un monde éternel.",
          ],
        ].map(([id, title, copy]) => (
          <article key={id}>
            <span className="eyebrow">{byId.get(id)!.title}</span>
            <h3>{title}</h3>
            <p>{copy}</p>
            <LinkArrow to={href(id)}>Explorer cet enjeu</LinkArrow>
          </article>
        ))}
      </div>
      <details className="lore-open">
        <summary>Les questions encore ouvertes</summary>
        <p>
          Le guide reprend les repères établis. Les fiches signalent les
          développements encore ouverts ; ils ne constituent pas des réponses
          acquises.
        </p>
        <ul>
          {entries
            .filter((e) => e.open_questions.length > 0)
            .map((e) => (
              <li key={e.id}>
                <a href={href(e.id)}>{e.title}</a>
                <span>{e.open_questions.join(" ")}</span>
              </li>
            ))}
        </ul>
      </details>
    </section>
  );
}
function Lexicon() {
  const [query, setQuery] = useState("");
  const filtered = canon.lexicon.filter((term) => matches(lexiconSearchText(term), query));
  const terms = (items: typeof canon.lexicon) => (
    <dl className="lexicon-grid">
      {items.map((term) => (
        <div className="lexicon-term" key={term.id}>
          <dt><a href={href(term.record)}>{term.term}<Icon name="arrow" /></a></dt>
          <dd>{term.definition}</dd>
        </div>
      ))}
    </dl>
  );
  return (
    <section id="universe-6" tabIndex={-1}>
      <SectionHead eyebrow="LE LEXIQUE" title="Lexique" copy="Douze repères pour entrer dans MONO. Les distinctions viennent ensuite." />
      <label className="search-field lexicon-search">
        <Icon name="search" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Sillage, Sceau, Concorde…" aria-label="Filtrer le lexique" />
      </label>
      <p className="lexicon-status" role="status">{query.trim() ? `${filtered.length} repère${filtered.length > 1 ? "s" : ""}` : "12 repères essentiels · 8 distinctions"}</p>
      {terms(query.trim() ? filtered : filtered.filter((term) => term.essential))}
      {!query.trim() && (
        <details className="lore-open">
          <summary>Huit distinctions pour aller plus loin</summary>
          {terms(filtered.filter((term) => !term.essential))}
        </details>
      )}
      {query.trim() && filtered.length === 0 && <p>Aucun repère. Essayez un nom ou une idée.</p>}
    </section>
  );
}
function Universe() {
  const [pair, setPair] = useState("ophriel");
  const angel = byId.get(pair)!;
  const opposite = angel.links.find(
    (id) => byId.get(id)?.category === "revers",
  )!;
  const [race, setRace] = useState("humains");
  const r = byId.get(race)!;
  return (
    <div className="content">
      <PageHead
        eyebrow="Univers"
        title="L’univers de MONO"
        copy="De l’origine du monde aux conflits des vivants : un parcours pour comprendre les causes, les rôles et les choix."
      />
      <nav
        className="lore-navigation"
        aria-label="Parcours pour comprendre MONO"
      >
        {[
          "Origines",
          "Mondes",
          "Principes",
          "Cultes",
          "Lignées & Sillage",
          "Enjeux",
          "Lexique",
        ].map((label, i) => (
          <a key={label} href={`#/univers?section=${i}`}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            {label}
          </a>
        ))}
      </nav>
      <LoreOrientation />
      <section id="universe-1" tabIndex={-1}>
        <SectionHead
          eyebrow="L’ARCHITECTURE"
          title="Le physique et le métaphysique."
        />
        <div className="realm-grid">
          {["cieux", "terra", "abysses"].map((id) => (
            <a href={href(id)} key={id} className="realm">
              <Art
                name={id === "terra" ? "terra-map-v1" : id}
                sizes="(max-width: 620px) 100vw, 33vw"
              />
              <div>
                <span className="eyebrow">
                  {id === "terra"
                    ? "UNIVERS PHYSIQUE"
                    : "DIMENSION MÉTAPHYSIQUE"}
                </span>
                <h3>{byId.get(id)!.title}</h3>
                <p>{byId.get(id)!.summary}</p>
                <Icon name="arrow" />
              </div>
            </a>
          ))}
        </div>
        <div className="note compact">
          <p>
            <strong>Les Brisures</strong> mettent ces dimensions en contact. Les
            Cieux et les Abysses ne sont pas des étages au-dessus ou au-dessous
            de la planète.
          </p>
          <LinkArrow to={href("brisures")}>Comprendre les Brisures</LinkArrow>
        </div>
      </section>
      <section id="universe-2" tabIndex={-1}>
        <SectionHead
          eyebrow="03 / SEPT PRINCIPES · SEPT ÉPREUVES"
          title="Archanges et Revers"
          copy="Sept Archanges gardent sept principes. Sept Revers en éprouvent les inversions. Qerath, ancien gardien de la Vision, a pour successeur Tamariel ; il ne constitue pas un huitième Archange en fonction."
        />
        <div
          className="principle-tabs"
          role="group"
          aria-label="Choisir un principe"
        >
          {entries
            .filter((e) => e.category === "archanges")
            .map((e) => (
              <button
                key={e.id}
                aria-pressed={pair === e.id}
                onClick={() => setPair(e.id)}
              >
                {e.subtitle.split(" · ")[1]}
              </button>
            ))}
        </div>
        <div className="pair-widget">
          {[angel, byId.get(opposite)!].map((e) => (
            <div className="pair-half" key={e.id}>
              <div className="pair-art">
                <Art
                  name={e.art!}
                  alt={e.title}
                  sizes="(max-width: 800px) 40vw, 23vw"
                />
              </div>
              <div>
                <span className="eyebrow">{e.subtitle}</span>
                <h3>{e.title}</h3>
                <p>{e.summary}</p>
                <LinkArrow to={href(e.id)}>Son rôle et son histoire</LinkArrow>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section id="universe-3" tabIndex={-1}>
        <SectionHead
          eyebrow="04 / QUATRE CULTES"
          title="Les quatre cultes"
          copy="Un culte exprime un rapport au don ; une lignée désigne une nature. Les six lignées peuvent rejoindre chacun des quatre cultes. Aucun culte ne possède un Sillage distinct."
        />
        <div className="cult-grid">
          {entries
            .filter((e) => e.category === "cultes")
            .map((e, i) => (
              <a className="cult-tile" key={e.id} href={href(e.id)}>
                <div className="cult-art">
                  <Art name={e.art!} alt={e.title} />
                </div>
                <span className="cult-mark">{["AZ", "KA", "VO", "TH"][i]}</span>
                <span className="eyebrow">{e.subtitle}</span>
                <h3>{e.title}</h3>
                <p>{e.summary}</p>
                <Icon name="arrow" />
              </a>
            ))}
        </div>
      </section>
      <section id="universe-4" tabIndex={-1}>
        <SectionHead
          eyebrow="05 / PUISSANCE & LIGNÉES"
          title="La force n’est pas un rang de naissance."
          copy="Compréhension, accord, conduction, ancrage et plasticité doivent fonctionner ensemble."
        />
        <div className="power-widget">
          <div className="power-pillars">
            {[
              ["Compréhension", "Savoir ce que l’on transforme."],
              ["Accord", "Entrer en résonance."],
              ["Conduction", "Faire passer le Sillage."],
              ["Ancrage", "Garder sa cohérence."],
              ["Plasticité", "Changer sans se briser."],
            ].map(([t, p], i) => (
              <div key={t}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{t}</h3>
                  <p>{p}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="lineage-panel">
            {r.art && (
              <div className="lineage-portrait">
                <Art
                  name={r.art}
                  alt={r.title}
                  sizes="(max-width: 800px) 100vw, 35vw"
                />
              </div>
            )}
            <label className="eyebrow" htmlFor="race-power">
              EXPLORER UNE LIGNÉE
            </label>
            <select
              id="race-power"
              value={race}
              onChange={(e) => setRace(e.target.value)}
            >
              {entries
                .filter((e) => e.category === "lignees")
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
            </select>
            <h3>{r.subtitle}</h3>
            <p>{r.sections[0].text}</p>
            <LinkArrow to={href(r.id)}>Lire la fiche</LinkArrow>
            <div className="small-note">
              Le lieu, la préparation et l’objectif comptent autant que les
              dispositions.
            </div>
          </div>
        </div>
        <LinkArrow to="#/powerscaling">
          Explorer le Sillage, les pouvoirs et les rapports de force
        </LinkArrow>
      </section>
      <LoreStakes />
      <Lexicon />
      <section>
        <SectionHead
          eyebrow="LES FONDEMENTS"
          title="Fiches de référence"
        />
        <div className="reference-grid">
          {[
            "azkavoth",
            "jugement",
            "temoins",
            "fond",
            "sillage",
            "sceaux",
            "tikkun",
            "ames",
          ].map((id) => {
            const e = byId.get(id)!;
            return (
              <a className="reference" href={href(id)} key={id}>
                <span className="eyebrow">{e.subtitle}</span>
                <h3>{e.title}</h3>
                <p>{e.summary}</p>
                <Icon name="arrow" />
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}
function Powerscaling({ onPortrait }: { onPortrait: (entry: Entry) => void }) {
  const [way, setWay] = useState(0);
  const [lineage, setLineage] = useState(0);
  const fluid = byId.get("sillage")!,
    mastery = byId.get("maitrise-sillage")!,
    force = byId.get("puissance")!;
  const ways = byId.get("sept-voies")!,
    inverses = byId.get("inversions-abyssales")!,
    races = byId.get("lignees-sillage")!;
  const related = entries.filter((e) => e.category === "powerscaling");
  return (
    <div className="content scaling-page">
      <PageHead
        eyebrow="Le Sillage"
        title="Sillage et maîtrise"
        copy="Comprendre ce qu’un être peut accomplir, comment il conduit le Sillage et ce qui peut le faire céder."
      />
      <nav className="scaling-jump" aria-label="Explorer les pouvoirs">
        <a href="#/powerscaling?section=0">Le fluide</a>
        <a href="#/powerscaling?section=1">Voies & Revers</a>
        <a href="#/powerscaling?section=2">Les lignées</a>
        <a href="#/powerscaling?section=3">Rapports de force</a>
      </nav>
      <section id="scaling-0" className="scaling-intro" tabIndex={-1}>
        <figure>
          <button
            className="scaling-art-button"
            aria-label="Agrandir l’illustration du Sillage"
            onClick={() => onPortrait(fluid)}
          >
            <Art
              name={fluid.art!}
              alt="Interprétation du Sillage : un fluide conduit dans les canaux d’une main golem."
              hero
              sizes="(max-width: 800px) 100vw, 60vw"
            />
            <span className="zoom">⤢</span>
          </button>
          <figcaption>
            Interprétation artistique · Le Sillage ne possède pas une couleur ou
            un équipement obligatoires.
          </figcaption>
        </figure>
        <div className="scaling-intro-copy">
          <span className="eyebrow">KA · LE DON EN CIRCULATION</span>
          <h2>
            Un même Sillage.
            <br />
            <em>Des pouvoirs singuliers.</em>
          </h2>
          <p>{fluid.summary}</p>
          <p>{mastery.summary}</p>
          <LinkArrow to={href("sillage")}>La nature du fluide</LinkArrow>
          <LinkArrow to={href("maitrise-sillage")}>
            Apprendre à le maîtriser
          </LinkArrow>
        </div>
      </section>
      <div className="scaling-measures" aria-label="Comprendre une capacité">
        <div>
          <span>01</span>
          <h3>Réserve</h3>
          <p>Le fluide réellement accessible.</p>
        </div>
        <div>
          <span>02</span>
          <h3>Débit</h3>
          <p>L’intensité supportée par les canaux.</p>
        </div>
        <div>
          <span>03</span>
          <h3>Précision</h3>
          <p>La finesse avec laquelle on dirige l’effet.</p>
        </div>
        <div>
          <span>04</span>
          <h3>Ancrage</h3>
          <p>La cohérence qui permet de tenir.</p>
        </div>
      </div>
      <section id="scaling-1" className="scaling-section" tabIndex={-1}>
        <SectionHead
          eyebrow="SEPT VOIES · SEPT INVERSIONS"
          title="Les sept voies et leurs inversions"
          copy="Une voie et son inverse travaillent le même Sillage. Le lieu, les supports et la maîtrise changent l’issue."
        />
        <div
          className="scaling-tabs"
          role="group"
          aria-label="Choisir une voie"
        >
          {ways.sections.slice(0, 7).map((s, i) => (
            <button
              key={s.title}
              onClick={() => setWay(i)}
              aria-pressed={way === i}
            >
              {s.title.split(" — ")[1]}
            </button>
          ))}
        </div>
        <div className="scaling-pair">
          <article>
            <span className="eyebrow">LA VOIE</span>
            <h3>{ways.sections[way].title}</h3>
            <p>{ways.sections[way].text}</p>
            <LinkArrow to={href("sept-voies")}>
              Les techniques des sept voies
            </LinkArrow>
          </article>
          <article className="scaling-inverse">
            <span className="eyebrow">LE REVERS</span>
            <h3>{inverses.sections[way].title}</h3>
            <p>{inverses.sections[way].text}</p>
            <LinkArrow to={href("inversions-abyssales")}>
              Les pouvoirs abyssaux
            </LinkArrow>
          </article>
        </div>
        <div className="scaling-illustrations">
          {[ways, inverses].map((e) => (
            <figure key={e.id}>
              <button
                className="scaling-art-button"
                aria-label={`Agrandir l’illustration de ${e.title}`}
                onClick={() => onPortrait(e)}
              >
                <Art
                  name={e.art!}
                  alt={`Interprétation artistique : ${e.title}`}
                  sizes="(max-width: 800px) 100vw, 50vw"
                />
                <span className="zoom">⤢</span>
              </button>
              <figcaption>
                {e.id === "sept-voies"
                  ? "Conduire, orienter et combiner : les supports font partie du combat."
                  : "Un même fluide peut être enfermé, détourné ou désagrégé."}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section id="scaling-2" className="scaling-section" tabIndex={-1}>
        <SectionHead
          eyebrow="SIX LIGNÉES"
          title="Le Sillage selon les lignées"
          copy="La naissance donne des dispositions. L’apprentissage, les blessures et les transformations changent la pratique."
        />
        <div
          className="scaling-tabs"
          role="group"
          aria-label="Comparer la circulation des lignées"
        >
          {races.sections.slice(0, 6).map((s, i) => (
            <button
              key={s.title}
              onClick={() => setLineage(i)}
              aria-pressed={lineage === i}
            >
              {s.title}
            </button>
          ))}
        </div>
        <article className="scaling-lineage">
          <span className="eyebrow">CIRCULATION & LIMITES</span>
          <h3>{races.sections[lineage].title}</h3>
          <p>{races.sections[lineage].text}</p>
          <LinkArrow to={href("lignees-sillage")}>
            Comparer les six natures
          </LinkArrow>
        </article>
      </section>
      <section id="scaling-3" className="scaling-section" tabIndex={-1}>
        <SectionHead
          eyebrow="POWERSCALING"
          title="Rapports de force"
          copy={force.summary}
        />
        <div className="scaling-force">
          {force.sections.slice(1).map((s) => (
            <article key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
        <aside className="note compact">
          <p>
            AZKAVOTH reste au-delà d’une échelle de combat. Une grande réserve
            ne garantit ni la maîtrise ni la victoire.
          </p>
          <LinkArrow to={href("puissance")}>
            Comprendre les rapports de force
          </LinkArrow>
        </aside>
      </section>
      <section className="scaling-section">
        <SectionHead
          eyebrow="LE CODEX DES POUVOIRS"
          title="Usages du Sillage"
          copy="Techniques, circulation, guerre et économie : poursuivre avec les fiches détaillées."
          link={["#/codex/powerscaling", "Toute la catégorie"]}
        />
        <div className="entry-grid">
          {related.map((e) => (
            <Card key={e.id} entry={e} onPortrait={onPortrait} />
          ))}
        </div>
      </section>
    </div>
  );
}
function Codex({
  initialGroup = "",
  initialQuery = "",
  onPortrait,
}: {
  initialGroup?: string;
  initialQuery?: string;
  onPortrait: (entry: Entry) => void;
}) {
  const group =
    initialGroup === "tout" || groups.some((g) => g.id === initialGroup)
      ? initialGroup
      : "puissances";
  const [query, setQuery] = useState(initialQuery);
  const [view, setView] = useState(
    read<unknown>("mono-codex-view", "list") === "list" ? "list" : "gallery",
  );
  useEffect(() => setQuery(initialQuery), [initialGroup, initialQuery]);
  const filter = (value: string) => {
    setQuery(value);
    replaceQuery(`codex/${group}`, value);
  };
  const choose = (id: string) => {
    location.hash = queryHash(`codex/${id}`, query);
  };
  const changeView = (value: string) => {
    setView(value);
    save("mono-codex-view", value);
  };
  const categories = [...groups, { id: "tout", label: "Tout le Codex" }];
  const list = entries.filter(
    (e) =>
      (group === "tout" || e.category === group) &&
      matches(
        entrySearchText(e),
        query,
      ),
  );
  return (
    <div className="content codex-page" data-group={group}>
      <PageHead
        eyebrow="Codex"
        title="Codex"
        copy="Fiches classées par catégorie. Filtrez les noms et le contenu, ou parcourez les illustrations."
      />
      <div className="codex-layout">
        <aside className="codex-categories">
          <span className="eyebrow">EXPLORER LE CODEX</span>
          <nav aria-label="Catégories du Codex">
            {categories.map((g) => (
              <button
                key={g.id}
                aria-pressed={group === g.id}
                onClick={() => choose(g.id)}
              >
                <span>{g.label}</span>
                <span className="category-count">
                  {g.id === "tout"
                    ? entries.length
                    : entries.filter((e) => e.category === g.id).length}
                </span>
              </button>
            ))}
          </nav>
          <p>Chaque fiche ouvre d’autres chemins dans le monde.</p>
        </aside>
        <div className="codex-results">
          <div className="codex-controls">
            <label className="mobile-category">
              Catégorie
              <select
                aria-label="Catégorie du Codex"
                value={group}
                onChange={(e) => choose(e.target.value)}
              >
                {categories.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label} (
                    {g.id === "tout"
                      ? entries.length
                      : entries.filter((e) => e.category === g.id).length}
                    )
                  </option>
                ))}
              </select>
            </label>
            <div className="search-field">
              <Icon name="search" />
              <input
                value={query}
                onChange={(e) => filter(e.target.value)}
                placeholder={`Chercher dans ${group === "tout" ? "tout le Codex" : category(group).toLowerCase()}…`}
                aria-label="Filtrer le Codex"
              />
              {query && (
                <button
                  onClick={() => filter("")}
                  aria-label="Effacer le filtre"
                >
                  <Icon name="close" />
                </button>
              )}
            </div>
            <div
              className="view-switch"
              role="group"
              aria-label="Présentation des fiches"
            >
              <button
                aria-pressed={view === "gallery"}
                onClick={() => changeView("gallery")}
              >
                Galerie
              </button>
              <button
                aria-pressed={view === "list"}
                onClick={() => changeView("list")}
              >
                Liste
              </button>
            </div>
          </div>
          <div className="results-heading">
            <h2>{group === "tout" ? "Tout le Codex" : category(group)}</h2>
            {group === "powerscaling" && (
              <LinkArrow to="#/powerscaling">Explorer les pouvoirs</LinkArrow>
            )}
            <span role="status">
              {list.length} fiche{list.length > 1 ? "s" : ""}
            </span>
          </div>
          {query && (
            <div className="active-filter">
              <span>Recherche : « {query} »</span>
              <button onClick={() => filter("")}>
                Effacer <Icon name="close" />
              </button>
            </div>
          )}
          <div
            className={`entry-grid ${group === "puissances" ? "featured-grid" : ""} ${view === "list" ? "entry-list" : ""}`}
          >
            {list.map((e) => (
              <Card
                entry={e}
                onPortrait={onPortrait}
                sizes={view === "list" ? "140px" : group === "puissances" ? featuredSizes : cardSizes}
                key={e.id}
              />
            ))}
          </div>
          {!list.length && (
            <div className="empty">
              <h3>Aucune fiche dans cette sélection.</h3>
              <p>Effacez la recherche ou explorez une autre catégorie.</p>
              <button
                className="button"
                onClick={() => {
                  setQuery("");
                  location.hash = queryHash("codex/tout", "");
                }}
              >
                Explorer tout le Codex
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function EntryPage({
  entry,
  saved,
  onSave,
  onPortrait,
}: {
  entry: Entry;
  saved: boolean;
  onSave: () => void;
  onPortrait: (e: Entry) => void;
}) {
  const [message, setMessage] = useState("");
  useEffect(() => setMessage(""), [entry.id]);
  const siblings = entries.filter((e) => e.category === entry.category),
    index = siblings.findIndex((e) => e.id === entry.id);
  const previous = siblings[index - 1],
    next = siblings[index + 1];
  const related = entry.links.flatMap((id) =>
    byId.has(id) ? [byId.get(id)!] : [],
  );
  return (
    <div
      className="content detail"
      data-power={entry.id}
      data-group={entry.category}
    >
      <div className="detail-navigation">
        <a className="crumb" href={`#/codex/${entry.category}`}>
          ← {category(entry.category)}
        </a>
        <span>
          {index + 1} / {siblings.length}
        </span>
      </div>
      <header className="detail-heading">
        <div>
          <span className="eyebrow">{entry.subtitle}</span>
          <h1>{entry.title}</h1>
          <p className="lede">{entry.summary}</p>
        </div>
        <div className="entry-actions">
          <button
            className="button subtle"
            aria-pressed={saved}
            onClick={onSave}
          >
            <Icon name="star" />
            {saved ? "Retirer des signets" : "Garder cette fiche"}
          </button>
          <button
            className="button subtle"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(location.href);
                setMessage("Lien copié.");
              } catch {
                setMessage("Copiez le lien dans votre barre d’adresse.");
              }
            }}
          >
            Partager
          </button>
          <span role="status">{message}</span>
        </div>
      </header>
      <div
        className={`detail-layout ${entry.art ? "" : "no-art"} ${entry.art && landscapeArt.has(entry.art) ? "landscape-detail" : ""}`}
      >
        {entry.art && (
          <aside className="detail-portrait">
            <button
              className="art-button"
              onClick={() => onPortrait(entry)}
              aria-label={`Agrandir ${entry.title}`}
            >
              <Art
                name={entry.art}
                alt={`Interprétation de ${entry.title}`}
                hero
                sizes={
                  landscapeArt.has(entry.art)
                    ? "(max-width: 1164px) calc(100vw - 28px), 1100px"
                    : "(max-width: 900px) min(480px, calc(100vw - 28px)), 34vw"
                }
              />
              <span className="zoom">⤢</span>
            </button>
            <span className="art-caption">
              Illustration de MONO · Cliquer pour agrandir.
            </span>
          </aside>
        )}
        <article className="detail-body">
          <nav className="section-index" aria-label="Dans cette fiche">
            <span className="eyebrow">DANS CETTE FICHE</span>
            {entry.sections.map((s, i) => (
              <a href={`#/fiche/${entry.id}?section=${i}`} key={s.title}>
                {s.title}
              </a>
            ))}
          </nav>
          <div className="prose">
            {entry.sections.map((s, i) => (
              <section key={s.title} id={`section-${i}`} tabIndex={-1}>
                <h2>{s.title}</h2>
                <p>{s.text}</p>
              </section>
            ))}
          </div>
          {entry.open_questions.length > 0 && (
            <aside className="note">
              <span className="eyebrow">CE QUI RESTE OUVERT</span>
              <ul>
                {entry.open_questions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </aside>
          )}
        </article>
      </div>
      {related.length > 0 && (
        <section className="related-gallery">
          <SectionHead eyebrow="LES LIENS DU CODEX" title="Fiches associées" />
          <div>
            {related.map((e) => (
              <a href={href(e.id)} key={e.id}>
                {e.art && <Art name={e.art} sizes="150px" />}
                <div>
                  <span className="eyebrow">{category(e.category)}</span>
                  <h3>{e.title}</h3>
                  <p>{e.summary}</p>
                </div>
                <Icon name="arrow" />
              </a>
            ))}
          </div>
        </section>
      )}
      {entry.links.filter((id) => !byId.has(id)).length > 0 && (
        <div className="related-categories">
          {entry.links
            .filter((id) => !byId.has(id))
            .map((id) => (
              <LinkArrow key={id} to={`#/codex/${id}`}>
                {category(id)}
              </LinkArrow>
            ))}
        </div>
      )}
      <nav
        className="entry-neighbours"
        aria-label="Autres fiches de cette catégorie"
      >
        {previous ? (
          <a href={href(previous.id)}>
            <span className="eyebrow">← PRÉCÉDENT</span>
            <strong>{previous.title}</strong>
          </a>
        ) : (
          <span />
        )}
        {next ? (
          <a href={href(next.id)}>
            <span className="eyebrow">SUIVANT →</span>
            <strong>{next.title}</strong>
          </a>
        ) : (
          <LinkArrow to={`#/codex/${entry.category}`}>
            Toute la catégorie
          </LinkArrow>
        )}
      </nav>
    </div>
  );
}
function Timeline() {
  return (
    <div className="content">
      <PageHead
        eyebrow="Chronologie"
        title="Les âges de la Déchirure."
        copy="CD signifie Calendrier de la Déchirure. Les dates approximatives restent des repères, pas des événements entièrement racontés."
      />
      <div className="timeline">
        {canon.eras.map((era, i) => (
          <article key={era.date} className="era">
            <div className="era-date">
              <span>{String(i + 1).padStart(2, "0")}</span>
              <h2>{era.date}</h2>
            </div>
            <div className="era-copy">
              <span
                className={`status ${era.status === "À développer" ? "open" : ""}`}
              >
                {era.status}
              </span>
              <p>{era.text}</p>
              {i === 7 && (
                <LinkArrow to={href("eshar")}>Eshar et le Grand Rite</LinkArrow>
              )}
              {i === 4 && (
                <LinkArrow to={href("sarai")}>La parole de Sarai</LinkArrow>
              )}
            </div>
          </article>
        ))}
      </div>
      <aside className="note">
        <h3>Des mystères, et du travail encore à écrire.</h3>
        <p>
          Le terme du règne de Qerath est un secret de l’univers. Les frontières
          du présent et les scènes du Grand Rite sont des sujets de
          développement. Le Codex distingue ces deux formes d’inconnu.
        </p>
      </aside>
    </div>
  );
}
function Search({ query }: { query: string }) {
  const [value, setValue] = useState(query);
  useEffect(() => setValue(query), [query]);
  const update = (value: string) => {
    setValue(value);
    replaceQuery("chercher", value);
  };
  const active = !!value.trim();
  const results = active
    ? entries.filter((e) =>
        matches(
          entrySearchText(e),
          value,
        ),
      )
    : [];
  const chapters = active
    ? canon.books.flatMap((book) =>
        book.chapters.flatMap((ch, i) =>
          matches([book.title, ch.title, ...ch.paragraphs].join(" "), value)
            ? [
                {
                  book: book.id,
                  bookTitle: book.title,
                  chapter: i + 1,
                  title: ch.title,
                  excerpt:
                    ch.paragraphs.find((p) => matches(p, value)) ||
                    ch.paragraphs[0],
                },
              ]
            : [],
        ),
      )
    : [];
  const suggestions = [
    "cosmogonie",
    "jugement",
    "puissance",
    "sceaux",
    "temoins",
  ].map((id) => byId.get(id)!);
  const lexical = active ? canon.lexicon.filter((term) => matches(lexiconSearchText(term), value)) : [];
  const count = results.length + chapters.length + lexical.length;
  return (
    <div className="content">
      <PageHead
        eyebrow="Recherche"
        title="Recherche"
        copy={`Cherchez dans les ${entries.length} fiches, les ${canon.books.reduce((n, b) => n + b.chapters.length, 0)} chapitres et les ${canon.lexicon.length} repères du lexique.`}
      />
      <div className="search-field search-big">
        <Icon name="search" />
        <input
          autoFocus
          value={value}
          onChange={(e) => update(e.target.value)}
          placeholder="Qerath, Éden, serment, puissance…"
          aria-label="Chercher dans le lore"
        />
        {value && (
          <button onClick={() => update("")} aria-label="Effacer la recherche">
            <Icon name="close" />
          </button>
        )}
      </div>
      <p className="search-status" role="status">
        {active
          ? `${count} résultat${count > 1 ? "s" : ""} · ${results.length} fiche${results.length > 1 ? "s" : ""}, ${chapters.length} chapitre${chapters.length > 1 ? "s" : ""}, ${lexical.length} repère${lexical.length > 1 ? "s" : ""}`
          : "Quelques portes d’entrée"}
      </p>
      {(!active || results.length > 0) && (
        <>
          <h2 className="search-group">
            {active ? "Dans le Codex" : "Explorer le monde"}
          </h2>
          <div className="search-results">
            {(active ? results : suggestions).map((e) => (
              <a key={e.id} className="search-result" href={href(e.id)}>
                <span className="eyebrow">{category(e.category)}</span>
                <h3>{e.title}</h3>
                <p>{e.summary}</p>
                <Icon name="arrow" />
              </a>
            ))}
          </div>
        </>
      )}
      {chapters.length > 0 && (
        <>
          <h2 className="search-group">Dans les récits</h2>
          <div className="search-results">
            {chapters.map((ch) => (
              <a
                key={`${ch.book}-${ch.chapter}`}
                className="search-result"
                href={`#/lire/${ch.book}/${ch.chapter}`}
              >
                <span className="eyebrow">
                  {ch.bookTitle} · CHAPITRE {ch.chapter}
                </span>
                <h3>{ch.title}</h3>
                <p>{ch.excerpt}</p>
                <Icon name="arrow" />
              </a>
            ))}
          </div>
        </>
      )}
      {lexical.length > 0 && (
        <>
          <h2 className="search-group">Dans le lexique</h2>
          <div className="search-results">
            {lexical.map((term) => (
              <a key={term.id} className="search-result" href={href(term.record)}>
                <span className="eyebrow">REPÈRE DU LEXIQUE</span>
                <h3>{term.term}</h3>
                <p>{term.definition}</p>
                <Icon name="arrow" />
              </a>
            ))}
          </div>
        </>
      )}
      {active && !count && (
        <div className="empty">
          <p>Aucun résultat. Essayez un principe, un Éclat ou un nom du lexique.</p>
          <LinkArrow to="#/codex">Parcourir le Codex</LinkArrow>
        </div>
      )}
    </div>
  );
}
function Saved({
  ids,
  onPortrait,
  onRemove,
}: {
  ids: string[];
  onPortrait: (e: Entry) => void;
  onRemove: (id: string) => void;
}) {
  const list = entries.filter((e) => ids.includes(e.id));
  const books = canon.books.filter((b) => ids.includes(b.id));
  return (
    <div className="content">
      <PageHead
        eyebrow="Ma collection"
        title="Mes signets"
        copy="Ces signets et votre dernière lecture sont conservés sur cet appareil."
      />
      {!list.length && !books.length && (
        <div className="empty">
          <Icon name="star" />
          <h2>Une première trace à garder.</h2>
          <p>
            Ouvrez une fiche ou un chapitre, puis utilisez le bouton de signet.
          </p>
          <LinkArrow to="#/codex">Explorer le Codex</LinkArrow>
        </div>
      )}
      <div className="saved-books">
        {books.map((b) => (
          <article className="resume saved-book" key={b.id}>
            <a href={`#/lire/${b.id}/1`}>
              <Icon name="book" />
              {b.title}
              <Icon name="arrow" />
            </a>
            <button
              onClick={() => onRemove(b.id)}
              aria-label={`Retirer ${b.title} des signets`}
            >
              <Icon name="close" />
            </button>
          </article>
        ))}
      </div>
      <div className="entry-grid">
        {list.map((e) => (
          <Card key={e.id} entry={e} onPortrait={onPortrait} />
        ))}
      </div>
    </div>
  );
}
export default function App() {
  const [current, setCurrent] = useState(route);
  const [menu, setMenu] = useState(false);
  const [theme, setTheme] = useState(
    read<unknown>("mono-v9-theme", "night") === "paper" ? "paper" : "night",
  );
  const [saved, setSaved] = useState<string[]>(() => {
    const old = read<string[]>("mono-v81-bookmarks", []);
    const value = read<string[]>("mono-v9-bookmarks", old);
    return Array.isArray(value)
      ? value.filter(
          (id) => byId.has(id) || canon.books.some((b) => b.id === id),
        )
      : [];
  });
  const [portrait, setPortrait] = useState<Entry | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const header = useRef<HTMLElement>(null);
  const main = useRef<HTMLElement>(null);
  const previousRoute = useRef<Route | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [storageNotice, setStorageNotice] = useState("");
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        document.documentElement.dataset.inputActive = String(
          document.activeElement?.matches('input, textarea, select') ?? false,
        );
      });
    };
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", update);
      delete document.documentElement.dataset.inputActive;
    };
  }, []);
  useEffect(() => {
    const change = () => {
      setCurrent(route());
      setMenu(false);
      setPortrait(null);
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    const previous = previousRoute.current;
    const e = byId.get(current.id),
      b = canon.books.find((b) => b.id === current.id);
    const chapter =
      b?.chapters[Math.min(current.chapter, b.chapters.length) - 1];
    const titles: Record<string, string> = {
      recits: "Les chroniques",
      univers: "Comprendre l’univers",
      codex: "Le Codex",
      terra: "Terra · Atlas",
      powerscaling: "Le Sillage",
      chronologie: "Les âges",
      chercher: "Recherche",
      signets: "Mes signets",
    };
    document.title = `${current.page === "fiche" && e ? e.title : current.page === "lire" && b ? chapter?.title || b.title : titles[current.page] || "Le Codex de la Déchirure"} · MONO`;
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute(
      "content",
      e && current.page === "fiche"
        ? e.summary
        : b && current.page === "lire"
          ? `${chapter?.title} — ${b.subtitle}`
          : "MONO : un monde né de la Déchirure. Découvrez ses récits, ses six lignées, ses quatre cultes et les puissances qui en disputent l’avenir.",
    );
    const filtering =
      (previous?.page === "codex" && current.page === "codex") ||
      (previous?.page === "terra" && current.page === "terra");
    const sameEntry =
      previous?.page === "fiche" &&
      current.page === "fiche" &&
      previous.id === current.id;
    if (
      !filtering &&
      (!sameEntry || (current.section === null && previous?.section !== null))
    ) {
      window.scrollTo({ top: 0, behavior: "instant" });
      if (previous) {
        const target =
          current.page === "chercher"
            ? main.current?.querySelector<HTMLInputElement>(".search-big input")
            : main.current;
        target?.focus({ preventScroll: true });
      }
    }
    let frame = 0;
    if (current.page === "univers" && current.section !== null)
      frame = requestAnimationFrame(() => {
        const target = document.getElementById(`universe-${current.section}`);
        target?.scrollIntoView({ block: "start", behavior: "instant" });
        target?.focus({ preventScroll: true });
      });
    if (current.page === "powerscaling" && current.section !== null)
      frame = requestAnimationFrame(() => {
        const target = document.getElementById(`scaling-${current.section}`);
        target?.scrollIntoView({ block: "start", behavior: "instant" });
        target?.focus({ preventScroll: true });
      });
    if (current.page === "terra" && current.section !== null)
      frame = requestAnimationFrame(() => {
        const target = document.getElementById(
          current.section === 1 ? "terra-city" : "terra-map",
        );
        target?.scrollIntoView({ block: "start", behavior: "instant" });
      });
    if (current.page === "fiche" && current.section !== null)
      frame = requestAnimationFrame(() => {
        const target = document.getElementById(`section-${current.section}`);
        target?.scrollIntoView({ block: "start", behavior: "instant" });
        target?.focus({ preventScroll: true });
      });
    previousRoute.current = current;
    return () => cancelAnimationFrame(frame);
  }, [current]);
  useEffect(() => {
    if (!portrait) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [portrait]);
  useEffect(() => {
    document.documentElement.dataset.scene =
      current.page === "fiche"
        ? byId.get(current.id)?.category || "codex"
        : current.page || "home";
  }, [current.page, current.id]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    save("mono-v9-theme", theme);
  }, [theme]);
  useEffect(() => {
    if (portrait) {
      returnFocus.current = document.activeElement as HTMLElement;
      dialog.current?.showModal();
    } else if (dialog.current?.open) dialog.current.close();
  }, [portrait]);
  useEffect(() => {
    if (!menu) return;
    const mobile = matchMedia("(max-width: 900px)");
    if (!mobile.matches) {
      setMenu(false);
      return;
    }
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() =>
      header.current?.querySelector<HTMLElement>(".main-nav a")?.focus(),
    );
    const resize = () => {
      if (!mobile.matches) setMenu(false);
    };
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const targets = Array.from(
        header.current?.querySelectorAll<HTMLElement>("a[href],button") || [],
      ).filter((el) => el.getClientRects().length > 0);
      const first = targets[0],
        last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    mobile.addEventListener("change", resize);
    document.addEventListener("keydown", trap);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = overflow;
      mobile.removeEventListener("change", resize);
      document.removeEventListener("keydown", trap);
    };
  }, [menu]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menu) {
        setMenu(false);
        menuButton.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        location.hash = "/chercher";
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [menu]);
  const toggleSaved = (id: string) => {
    const next = saved.includes(id)
      ? saved.filter((x) => x !== id)
      : [...saved, id];
    setSaved(next);
    if (!save("mono-v9-bookmarks", next))
      setStorageNotice(
        "Les signets restent disponibles pour cette visite ; le stockage de l’appareil est indisponible.",
      );
  };
  const book = canon.books.find((b) => b.id === current.id),
    entry = byId.get(current.id);
  let content: React.ReactNode;
  if (current.page === "") content = <Home />;
  else if (current.page === "recits") content = <Stories />;
  else if (current.page === "univers") content = <Universe />;
  else if (current.page === "powerscaling")
    content = <Powerscaling onPortrait={setPortrait} />;
  else if (
    current.page === "terra" ||
    (current.page === "fiche" && current.id === "terra")
  )
    content = (
      <Terra
        selected={current.page === "terra" ? current.id : "avarn"}
        onPortrait={setPortrait}
      />
    );
  else if (current.page === "codex")
    content = (
      <Codex
        initialGroup={current.id}
        initialQuery={current.query}
        onPortrait={setPortrait}
      />
    );
  else if (current.page === "fiche" && entry)
    content = (
      <EntryPage
        entry={entry}
        saved={saved.includes(entry.id)}
        onSave={() => toggleSaved(entry.id)}
        onPortrait={setPortrait}
      />
    );
  else if (current.page === "lire" && book)
    content = (
      <Reader
        book={book}
        chapter={current.chapter}
        saved={saved.includes(book.id)}
        onSave={() => toggleSaved(book.id)}
      />
    );
  else if (current.page === "chronologie") content = <Timeline />;
  else if (current.page === "chercher")
    content = <Search query={current.query} />;
  else if (current.page === "signets")
    content = (
      <Saved ids={saved} onPortrait={setPortrait} onRemove={toggleSaved} />
    );
  else
    content = (
      <div className="content empty">
        <h1>Ce passage n’existe plus.</h1>
        <p>
          Le Codex a été réorganisé. Retrouvez les fiches et les récits depuis
          l’accueil.
        </p>
        <LinkArrow to="#/">Revenir à MONO</LinkArrow>
      </div>
    );
  const links = [
    ["", "Accueil"],
    ["recits", "Chroniques"],
    ["codex", "Codex"],
  ];
  const section = primarySection(current);
  const isExploreDetail = [
    "univers",
    "terra",
    "powerscaling",
    "chronologie",
  ].includes(current.page);
  const routeKey =
    current.page === "fiche" ? current.page + current.id : current.page;
  useEffect(() => {
    if (
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    )
      return;
    const nodes = Array.from(
      main.current?.querySelectorAll<HTMLElement>(".reveal") || [],
    );
    const observer = new IntersectionObserver(
      (items) =>
        items.forEach((item) => {
          if (item.isIntersecting) {
            item.target.classList.remove("reveal-pending");
            observer.unobserve(item.target);
          }
        }),
      { rootMargin: "0px 0px 40px 0px", threshold: 0.08 },
    );
    nodes.forEach((node) => {
      if (node.getBoundingClientRect().top > window.innerHeight) {
        node.classList.add("reveal-pending");
        observer.observe(node);
      }
    });
    return () => {
      observer.disconnect();
      nodes.forEach((node) => node.classList.remove("reveal-pending"));
    };
  }, [current.page]);
  return (
    <>
      <a
        className="skip"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        Aller au contenu
      </a>
      <button
        className="menu-scrim"
        hidden={!menu}
        tabIndex={-1}
        aria-label="Fermer la navigation"
        onClick={() => {
          setMenu(false);
          menuButton.current?.focus();
        }}
      />
      <header ref={header} className="site-header">
        <a className="brand" href="#/" aria-label="MONO — Accueil">
          <span>
            <span className="mono-name">M<span className="broken-o">O</span>NO</span><small>LE CODEX DE LA DÉCHIRURE</small>
          </span>
        </a>
        <nav
          id="main-nav"
          className={menu ? "main-nav is-open" : "main-nav"}
          aria-label="Navigation principale"
        >
          <span className="nav-heading">Navigation</span>
          {links.map(([id, label]) => (
            <a
              href={`#/${id}`}
              key={id}
              onClick={() => setMenu(false)}
              aria-current={section === id ? "page" : undefined}
            >
              {label}
            </a>
          ))}
          <div className="nav-utilities">
            <a href="#/chercher" onClick={() => setMenu(false)}>
              <Icon name="search" />
              Rechercher
            </a>
            <a href="#/signets" onClick={() => setMenu(false)}>
              <Icon name="star" />
              Ma collection ({saved.length})
            </a>
          </div>
        </nav>
        <div className="header-tools">
          <a
            className="search-trigger"
            href="#/chercher"
            aria-label="Rechercher"
          >
            <Icon name="search" />
            <span>Rechercher</span>
            <kbd>Ctrl K</kbd>
          </a>
          <a href="#/signets" aria-label={`Ma collection (${saved.length})`}>
            <Icon name="star" />
            {saved.length > 0 && (
              <span className="bookmark-count">{saved.length}</span>
            )}
          </a>
          <button
            onClick={() => setTheme(theme === "night" ? "paper" : "night")}
            aria-label={
              theme === "night"
                ? "Activer le thème clair"
                : "Activer le thème sombre"
            }
          >
            <Icon name="sun" />
          </button>
          <button
            ref={menuButton}
            className="menu-button"
            aria-label={menu ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menu}
            aria-controls="main-nav"
            onClick={() => setMenu(!menu)}
          >
            <Icon name={menu ? "close" : "menu"} />
          </button>
        </div>
      </header>
      <nav inert={menu} className="mobile-dock" aria-label="Navigation mobile">
        {[
          ["", "Accueil", "map"],
          ["recits", "Chroniques", "book"],
          ["codex", "Codex", "grid"],
        ].map(([id, label, icon]) => (
          <a
            key={id}
            href={`#/${id}`}
            aria-current={section === id ? "page" : undefined}
          >
            <Icon name={icon} />
            <span>{label}</span>
          </a>
        ))}
      </nav>
      {storageNotice && (
        <div className="storage-notice" role="status">
          {storageNotice}
          <button
            aria-label="Fermer la notification"
            onClick={() => setStorageNotice("")}
          >
            <Icon name="close" />
          </button>
        </div>
      )}
      <main inert={menu} id="main" ref={main} tabIndex={-1}>
        {isExploreDetail && (
          <div className="content">
            <ExploreNav page={current.page} />
          </div>
        )}
        <div className="route-view" key={routeKey}>
          {content}
        </div>
      </main>
      <footer inert={menu} className="site-footer">
        <div className="footer-top">
          <a
            className="back-top"
            href="#main"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({
                top: 0,
                behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? "instant"
                  : "smooth",
              });
              main.current?.focus({ preventScroll: true });
            }}
          >
            Retour en haut ↑
          </a>
        </div>
        <div className="footer-bottom">
          <span>LE CODEX DE LA DÉCHIRURE · {canon.version}</span>
          <nav aria-label="Navigation de pied de page">
            <a href="#/univers">Le guide</a>
            <a href="#/signets">Ma collection</a>
            <a href={`${BASE}canon/MONO_CANON_V9.md`} download>
              Le canon ↗
            </a>
          </nav>
          <p>Les illustrations interprètent le canon.</p>
        </div>
      </footer>
      <dialog
        ref={dialog}
        className="portrait-dialog"
        aria-labelledby="portrait-title"
        onClose={() => {
          setPortrait(null);
          (returnFocus.current?.isConnected
            ? returnFocus.current
            : main.current
          )?.focus({ preventScroll: true });
        }}
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current?.close();
        }}
      >
        {portrait && (
          <>
            <header>
              <div>
                <span className="eyebrow">{portrait.subtitle}</span>
                <h2 id="portrait-title">{portrait.title}</h2>
              </div>
              <button
                aria-label="Fermer le portrait"
                onClick={() => dialog.current?.close()}
              >
                <Icon name="close" />
              </button>
            </header>
            <img
              src={asset(portrait.art!)}
              width={artMetadata[portrait.art!]?.width}
              height={artMetadata[portrait.art!]?.height}
              alt={`Illustration de ${portrait.title}`}
            />
            <p>{portrait.summary}</p>
            <a href={href(portrait.id)} onClick={() => dialog.current?.close()}>
              Lire sa fiche →
            </a>
          </>
        )}
      </dialog>
    </>
  );
}
