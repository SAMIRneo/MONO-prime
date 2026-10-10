# MONO — Le Codex de la Déchirure

**Un monde brisé. Des êtres libres.** Portail narratif et codex illustré en français.

- [Site publié](https://samirneo.github.io/MONO-prime/) · [Dépôt](https://github.com/SAMIRneo/MONO-prime)
- Canon **V10.0** : 67 fiches, 11 catégories, 4 livres, 24 chapitres, 28 repères lexicaux.
- 52 illustrations avec trois variantes WebP chacune. Maëra, Sava, Iri, Zahrel, Orren et Ilyane restent sans portrait dédié.

## Sources de référence

- `src/data/canon.json` : canon, récits, chronologie, lexique, mystères et questions éditoriales ouvertes.
- [Décisions cosmologiques V10](docs/canon-v10-2026-10-09.md).
- [Direction artistique et ressources](docs/illustrations.md).
- [Maintenance et purge](docs/maintenance.md).

Les illustrations interprètent le canon ; elles ne créent pas de nouvelles règles. Les mystères du monde et les sujets encore à développer restent distincts. L’arc abandonné ne fait pas partie du contenu actif. L’historique des anciennes révisions reste consultable dans Git.

## Parcours actuels

La navigation permanente utilise **Accueil, Lire, Codex**, sur ordinateur et mobile. Recherche et collection complètent ces parcours.

| Route | Contenu |
| --- | --- |
| `#/` | Présentation de l’univers, parcours, rencontres et lexique |
| `#/recits` | Bibliothèque des quatre récits fondateurs |
| `#/lire/livre-1/1` | Chapitre, sommaire, réglage du texte, concentration et progression |
| `#/univers` | Guide des origines, mondes, principes et lexique |
| `#/terra` | Atlas des cinq continents et Aurenth |
| `#/codex` | Catégories, filtre, galerie ou liste |
| `#/fiche/qerath` | Fiche, sections, mystères et références |
| `#/powerscaling` | Sillage, voies, inversions et rapports de force |
| `#/chronologie` | Âges du Calendrier du Départ |
| `#/chercher` | Recherche dans fiches, chapitres et lexique |
| `#/signets` | Collection locale de fiches et livres |

Les filtres et certaines sections sont partageables par URL. Les alias utiles sont conservés dans `src/navigation.ts`. Les préférences, signets et dernier chapitre sont enregistrés sur l’appareil ; aucun compte ni synchronisation distante. La reprise concerne le chapitre, pas la position de défilement.

## Développement et publication

React, TypeScript et Vite ; versions exactes dans `package-lock.json`. Utiliser Node.js 22.6 ou supérieur.

```sh
npm ci
npm run dev
```

En développement, ouvrir `/MONO-prime/app.html` sur le serveur annoncé. Pour vérifier la publication :

```sh
npm run build
npm run preview
```

Ouvrir alors `/MONO-prime/`. `npm run check` vérifie TypeScript, le canon et les tests ; `npm test` omet seulement TypeScript. Le banc `/MONO-prime/qa/responsive.html` reste utile pour les vérifications manuelles.

Modifier `src/`, `public/` et `app.html`. **Ne pas modifier les sorties compilées.** Le build produit `dist/`, puis synchronise les sorties de compatibilité à la racine : `index.html`, `assets/`, `art/`, `fonts/`, `canon/`, `qa/` et les SVG publics. Ces copies sont nécessaires au mode de publication existant ; ce ne sont pas des doublons abandonnés.

Les exports Markdown sont générés par `scripts/check-canon.mjs`. Les noms historiques `MONO_CANON_V9.md` et `MONO_RECITS_V9.md` servent toujours les textes V10 : conserver ces URL pour les liens existants. `MONO_LEXIQUE.md` est généré de la même façon.

Le workflow `.github/workflows/pages.yml` compile et publie `dist` après un push sur `main`. Avant publication : build, examen du diff et contrôles des parcours concernés. Après publication : vérifier les Actions et comparer les fichiers servis au commit. Les tests ne remplacent pas les contrôles visuels, clavier et mobiles.

## Ressources et maintenance

`public/art/` contient les images sources, `src/data/art.json` leurs dimensions. Chaque illustration possède une originale, une variante `-medium` et une `-small`. Le validateur refuse les références absentes et les images orphelines. Les variantes sont préparées avant le build.

Les polices locales et leurs licences sont conservées dans `public/fonts/`. `src/design.css` est la feuille active ; `src/app.tsx` porte les vues et interactions. Les scripts durables vivent dans `scripts/`, les contrôles dans `tests/`.

Les prochains travaux sont les corrections issues de l’audit, la clarification de certaines règles, l’incarnation de Terra et l’illustration des récits. La purge documentaire ne résout pas ces chantiers et ne modifie pas le canon.
