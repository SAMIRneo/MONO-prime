# MONO — Le Codex de la Déchirure · V9

Un portail narratif en français : lire les origines, comprendre l’univers et explorer un codex illustré. Site : https://samirneo.github.io/MONO-prime/

## Source du canon

`src/data/canon.json` est la seule source éditoriale. Elle contient les fiches, les quatre livres, les chapitres et la chronologie. Le site et les deux exports Markdown sont construits depuis cette même source. Modifier ce fichier, puis exécuter `npm run build` ; ne pas éditer directement les exports ni les fichiers compilés.

La V9 consolide les décisions du 1er octobre 2026 : sept Archanges actuels (dont Malkiel et Tamariel), Qerath ancien Archange banni et souverain de l’Épreuve, sept Revers, six lignées incluant les Golems, quatre cultes, territoires métaphysiques, Témoins réunis en Éden et Aurenth terrestre. Vothorak est le démiurge du monde physique. Les anciennes versions contradictoires ont été retirées de l’arborescence active ; l’historique Git reste consultable.

Les mystères du monde sont distingués des éléments à développer. Les illustrations sont des interprétations artistiques ; leurs costumes, détails et effets ne constituent pas des règles supplémentaires. Aucune carte géographique précise n’est encore canonique.

## Architecture

React 19, TypeScript strict et Vite. Le routage par fragment fonctionne sur GitHub Pages sans serveur applicatif. Les fiches, la recherche, les comparaisons de principes et les récits partagent les mêmes données. Les signets, le thème et la dernière lecture sont locaux à l’appareil. Le menu mobile, les dialogues, le mouvement réduit et les focus de navigation sont pris en charge. Aucun compte, service tiers de suivi ou police distante n’est requis.

`src/app.tsx` contient les vues et interactions ; `src/style.css` la direction artistique responsive ; `public/art` les portraits WebP individuels avec variantes légères ; `public/fonts` les polices et leurs licences.

La direction actuelle, définie dans `src/direction.css`, évoque des folios sacrés fracturés : obsidienne, cuivre, gravures géométriques, cadres en arche et triptyque décalé des trois puissances. Cormorant Garamond compose les titres et EB Garamond les textes longs ; Manrope reste réservé à la navigation. Les trois nouvelles fontes latines sont auto-hébergées avec leurs licences OFL. Le thème parchemin et les petits écrans disposent de compositions adaptées, sans mouvement obligatoire. Les ornements sont décoratifs et ne définissent aucun nouveau symbole du canon.

Les images ont trois tailles (originale, `-medium`, `-small`) et leurs dimensions sont déclarées dans `src/data/art.json`. Mettre à jour ces variantes et métadonnées lors d'un remplacement d'illustration. La composition complète est conservée dans les cartes et les fiches. Les catégories et requêtes du Codex sont partageables dans l'URL ; la recherche couvre aussi les chapitres. `src/navigation.ts` valide les routes et la dernière lecture, et `tests/navigation.test.mjs` protège ces parcours.

## Développement et publication

Node.js 22 ou supérieur. Installer avec `npm ci`, puis `npm run dev`. `npm run check` vérifie TypeScript, les références du canon, les nombres de lignées/cultes/gardiens, les illustrations et l’absence de formulations obsolètes. `npm run build` produit `dist` et les exports `MONO_CANON_V9.md` / `MONO_RECITS_V9.md`.

Le workflow `.github/workflows/pages.yml` publie `dist`. Le build synchronise aussi le HTML et les ressources courantes à la racine pour conserver la compatibilité avec une publication depuis la branche `main`. `art`, `fonts`, `canon`, `assets` et `index.html` à la racine sont donc des sorties générées. Seul le build courant est conservé. Les ressources sources restent dans `public`.

## Continuer l’univers

Priorités ouvertes : histoire des Neuf Lumières et des Royaumes Clos, scènes détaillées du Grand Rite, frontières et sociétés du présent, trois prophètes encore sans nom, règles précises du devenir des âmes, premier arc choral de l’Éveil des Brisures. Ne pas présenter ces points comme déjà racontés.
