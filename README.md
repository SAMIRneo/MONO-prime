# MONO — Le Codex de la Déchirure

**Un monde brisé. Des êtres libres.**

MONO est un portail narratif et un codex illustré en français : lire les origines, comprendre les lois de l’univers et explorer ses puissances, ses peuples et ses lieux. Le site actuel est une application React statique publiée sur GitHub Pages.

- **Site :** [samirneo.github.io/MONO-prime](https://samirneo.github.io/MONO-prime/)
- **Dépôt :** [SAMIRneo/MONO-prime](https://github.com/SAMIRneo/MONO-prime)
- **État documenté :** interface « Journal et index » du **8 octobre 2026** ; canon **V9.1**, révisé le **8 octobre 2026**.
- **Contenu actuel :** 57 fiches, 11 catégories, 4 livres, 24 chapitres et 20 repères lexicaux ; 52 illustrations référencées dans les métadonnées, livrées en 156 fichiers WebP avec leurs variantes.

## Parcours et fonctionnalités

Trois destinations composent la navigation permanente : **Accueil**, **Chroniques** et **Codex**. Le logo mène à Explorer. Le guide, l’atlas, le Sillage et les âges sont des parcours contextuels d’Explorer ; la recherche et la collection restent des outils. La même organisation est utilisée dans la barre mobile. Les URL existantes restent valides.

| Espace        | Route              | Fonctionnement actuel                                                                                                                                                                                                                                        |
| ------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Accueil | `#/` | Journal de lecture avec sommaire latéral, extrait du premier livre, notes de révision du canon, Aurenth et fiches associées. |
| Chroniques    | `#/recits`         | Bibliothèque illustrée, reprise de lecture, sommaires dépliables et accès direct aux 24 chapitres.                                                                                                                                                           |
| Lecture       | `#/lire/livre-1/1` | Sommaire, choix du chapitre, texte agrandi, mode concentration, progression dans le chapitre, estimation du temps de lecture, navigation entre chapitres et entre livres, signet du livre et repères du codex adaptés à chacun des quatre livres.            |
| Univers       | `#/univers`        | Guide : origines, mondes, principes, cultes, lignées et Sillage, enjeux ; lexique filtrable de douze repères essentiels et huit distinctions. Renvois directs aux sections, distinction des trois puissances, comparaison des Archanges et Revers, enjeux de Qerath/Vothorak/Concorde et questions ouvertes du canon. |
| Terra         | `#/terra`          | Atlas éditorial illustré avec cinq marqueurs, sélection des continents, panoramas, présentation d’Aurenth et liens vers les fondements du monde physique.                                                                                                    |
| Codex         | `#/codex`          | Catégories avec compteurs, filtre textuel, vues galerie et liste, fiches illustrées et agrandissement des images. La catégorie initiale est « Puissances ».                                                                                                  |
| Fiche         | `#/fiche/qerath`   | Résumé, illustration, sommaire avec liens directs aux sections, contenu détaillé, questions ouvertes, références associées, fiches précédente et suivante, signet et copie du lien.                                                                          |
| Pouvoirs      | `#/powerscaling`   | Guide du Sillage, comparaison des sept voies avec leurs inversions, circulation des six lignées, rapports de force et accès aux fiches de maîtrise, guerre et économie.                                                                                      |
| Âges          | `#/chronologie`    | Chronologie du Calendrier de la Déchirure (CD), avec distinction entre événements établis et périodes à développer.                                                                                                                                          |
| Recherche     | `#/chercher`       | Recherche dans les fiches, les chapitres et le lexique ; accepte les accents, les apostrophes et plusieurs termes. Raccourci `Ctrl+K` ou `Cmd+K`.                                                                                                                        |
| Ma collection | `#/signets`        | Fiches et livres conservés sur l’appareil, avec possibilité de retrait.                                                                                                                                                                                      |

Les catégories, recherches et certaines sections sont accessibles directement par URL : `#/codex/archanges?q=vision`, `#/chercher?q=sillage`, `#/fiche/qerath?section=0`, `#/powerscaling?section=1` ou `#/terra/khoram`. Les indices de section commencent à zéro ; les numéros de chapitre commencent à un. Des alias de routes anciennes sont maintenus dans `src/navigation.ts` ; une route inconnue affiche un retour vers l’accueil.

### Préférences et navigation

Le thème sombre ou clair, les signets, le dernier livre et chapitre consultés, l’agrandissement du texte de lecture et la présentation du Codex sont enregistrés dans `localStorage`. Le mode concentration et le pourcentage de progression du chapitre ne sont pas persistés. Les signets portent sur une fiche ou un livre, pas sur un passage précis ; la reprise mémorise le chapitre, pas la position de défilement.

Le site fonctionne sans compte, backend applicatif ni synchronisation entre appareils. Les polices et illustrations sont auto-hébergées ; aucun outil de suivi tiers n’est intégré.

L’interface comprend un menu mobile, une barre de navigation inférieure sur les petits écrans, un lien d’évitement vers le contenu, des états de focus, des contrôles nommés, une fenêtre d’agrandissement native `<dialog>` et la prise en compte de `prefers-reduced-motion`. Ces mécanismes ne constituent pas une certification d’accessibilité ; le rendu mobile, le clavier et les deux thèmes restent à vérifier lors des modifications.

## Canon et contenu éditorial

**`src/data/canon.json` est la source éditoriale de référence.** Il contient la version, la date de consolidation, les catégories, les fiches (`records`), les quatre livres (`books`), la chronologie (`eras`) et le lexique (`lexicon`). Les anciens noms recherchables sont conservés dans `aliases`. Les pages de synthèse utilisent ces données, avec des textes et compositions complémentaires dans `src/app.tsx`.

| Catégorie             | Identifiant    | Fiches |
| --------------------- | -------------- | -----: |
| Puissances            | `puissances`   |      3 |
| Archanges             | `archanges`    |      7 |
| Revers                | `revers`       |      7 |
| Lignées               | `lignees`      |      6 |
| Cultes                | `cultes`       |      4 |
| Mondes & Éden         | `mondes`       |      4 |
| Lieux                 | `lieux`        |      6 |
| Sillage & puissance   | `pouvoir`      |      4 |
| Maîtrise              | `powerscaling` |      7 |
| Figures de l’histoire | `personnages`  |      4 |
| Fondements            | `fondements`   |      5 |
| **Total**             |                | **57** |

La catégorie « Mondes & Éden » compte quatre fiches parce qu’elle comprend aussi « Éden et les Sept Témoins » : MONO conserve **trois mondes**, Terra, les Cieux et les Abysses.

| Livre                     | Identifiant | Chapitres |
| ------------------------- | ----------- | --------: |
| Avant le Temps            | `livre-1`   |         6 |
| Le Banni                  | `livre-2`   |         6 |
| La Matière et les Vivants | `livre-3`   |         6 |
| Les Sceaux et le Voile    | `livre-4`   |         6 |

### Repères à préserver

- **AZKAVOTH** est la Source au-delà de la création ; le Retrait et la Déchirure appartiennent à son plan divin et cosmique. Il ne relève pas d’une échelle de combat.
- **Vothorak** est le démiurge et architecte du monde physique. **Qerath**, ancien Archange banni, est le souverain de l’Épreuve dans les Abysses ; il ignore le terme de son règne.
- Les **sept Archanges actuels** incluent Malkiel et Tamariel. Les **sept Revers** possèdent leurs propres volontés.
- Les **six lignées** sont les Humains, Djinns, Anakim, Golems, Néphilim et Qerathim. Elles peuvent rejoindre chacun des quatre cultes.
- **Terra** appartient à un univers physique. Les **Cieux** et les **Abysses** sont des dimensions métaphysiques, pas des étages géographiques au-dessus ou au-dessous de la planète.
- **Éden et les Sept Témoins** sont dans les Cieux. **Aurenth** est une cité sainte terrestre située en Avarn ; son sanctuaire conserve une empreinte du regard d’Éden.
- Terra possède cinq continents : **Avarn, Sahrûn, Khoram, Seyra et Theryn**. La carte affichée est une proposition artistique : contours, positions, distances et échelle ne sont pas une géographie précise canonique.
- Le **Sillage**, issu du don de KA, est un fluide primordial commun. Les sept voies et leurs inversions orientent sa pratique ; réserves, débit, précision, ancrage, maîtrise et contexte déterminent les effets. La naissance ne garantit pas la victoire.

Les costumes, couleurs, effets visuels, ornements et équipements des illustrations ne définissent aucune règle supplémentaire. Une question marquée « À développer » ne doit pas être présentée comme déjà résolue ; les mystères internes au monde sont distincts du travail éditorial encore ouvert.

### Exports du canon

`scripts/check-canon.mjs` valide les données puis génère :

- `public/canon/MONO_CANON_V9.md` : fiches par catégorie et chronologie ;
- `public/canon/MONO_RECITS_V9.md` : livres et chapitres ;
- `public/canon/MONO_LEXIQUE.md` : vingt définitions et leurs fiches.

Les suffixes V9 des deux URL historiques sont conservés pour les liens existants ; leurs en-têtes portent la version consolidée V9.1.

Ces exports sont produits depuis la même source JSON et inclus dans la publication. Le pied de page permet de télécharger le canon complet. **Ne pas modifier les exports à la main** : changer les données, puis les régénérer avec les commandes du projet.

## Révision éditoriale du 8 octobre 2026

La V9.1 précise la Source unique et indivisible, les quatre Éclats, les facultés amputées de Qerath, les sept restitutions du Fond, les Sceaux singuliers, le bilan du Sillage et la catastrophe du Grand Rite. La Concorde est le nom courant du Tikkun ; l’identifiant et la route `tikkun` restent valides. Lettre, Souffle et Signe sont trois lectures du sacré qui traversent les quatre cultes, sans ajouter trois écoles de pouvoir. Le Voile reste le nom de la période historique.

Les récits développent le débat avant le jugement, le départ de Talem et une décision du Grand Rite. Les continents disposent de conflits institutionnels de départ ; leurs États et dynasties détaillés restent ouverts. Voir [les choix et les références](docs/canon-v9-1-2026-10-08.md).

## Direction artistique actuelle

L’interface, révisée le 8 octobre 2026, prend la forme d’un portail personnel ésotérique : prune sombre, rose de vitrail, vert patiné et cadres de cuivre. Un logotype vectoriel original et une trame gravée encadrent la lecture. Le miroir fait défiler les figures du lore ; un second widget permet de feuilleter le lexique. Les extraits, notes datées et illustrations restent liés au canon. Le thème clair conserve un fond de papier.

L’accueil ouvre sur le premier livre, puis présente les changements du canon et un repère géographique. Le Codex propose la liste par défaut ; la préférence galerie/liste existante reste respectée. Les résultats de recherche sont des lignes de lecture. Les titres et commandes utilisent les noms des parcours ; les panneaux décoratifs, sigles de navigation, doubles cadres et appels répétés ont été retirés.

**src/design.css reste l’unique feuille de style active.** Aucun ajout au canon ou nouvelle dépendance applicative. Voir [les choix d’interface et les contrôles](docs/interface-journal-2026-10-08.md).

### Organisation mobile

Sous 900 px, la navigation permanente tient dans trois destinations : **Explorer, Chroniques, Codex**. Recherche et thème restent dans l’en-tête ; la collection est également accessible dans le menu. Son ouverture bloque le fond, rend le contenu inerte et retient le focus. Échap ferme le menu et rend le focus à son bouton.

Le Codex utilise un sélecteur de catégorie sur mobile et une colonne latérale sur ordinateur. La recherche et les modes galerie/liste sont conservés. Les portraits restent visibles dans leur intégralité dans les galeries et fiches. La bibliothèque propose des sommaires dépliables ; la lecture dispose toujours de ses réglages et de son mode concentration. Les repères de l’atlas et les comparateurs de principes restent interactifs.

Les illustrations du 6 octobre sont documentées dans [la sélection publiée](docs/illustrations-2026-10-06.md).

## Architecture du dépôt

| Chemin                          | Rôle                                                                                            |
| ------------------------------- | ----------------------------------------------------------------------------------------------- |
| `app.html`                      | Entrée HTML source de Vite : métadonnées, favicon, préchargements et démarrage de React         |
| `src/main.tsx`                  | Montage de React et imports des styles                                                          |
| `src/app.tsx`                   | Vues, composants, navigation d’interface, lecture, thèmes, signets et agrandissement des images |
| `src/navigation.ts`             | Lecture des fragments d’URL, alias, requêtes et validation de la dernière lecture               |
| `src/search.ts`                 | Normalisation et correspondance des termes recherchés                                           |
| `src/data/canon.json`           | Source éditoriale du canon, des récits et de la chronologie                                     |
| `src/data/art.json`             | Dimensions et largeurs des variantes d’illustrations                                            |
| `public/art/`                   | Images WebP sources : originale, `-medium` et `-small`                                          |
| `public/fonts/`                 | Polices locales et licences                                                                     |
| `public/favicon.svg`            | Favicon source                                                                                  |
| `public/canon/`                 | Exports Markdown générés par la validation du canon                                             |
| `scripts/check-canon.mjs`       | Contrôles éditoriaux, références, illustrations et génération des exports                       |
| `tests/navigation.test.mjs`     | Tests des routes, anciennes URL, données de lecture et recherche                                |
| `vite.config.js`                | Base `/MONO-prime/`, compilation et synchronisation des sorties à la racine                     |
| `.github/workflows/pages.yml`   | Compilation et publication de `dist` sur GitHub Pages                                           |
| `scripts/sync-publication.mjs` | Synchronisation des sorties et suppression des fichiers périmés |
| `docs/maintenance.md` | État actuel du nettoyage et règles de maintenance |

**Stack :** React 19.2, React DOM 19.2, TypeScript 5.9 en mode strict et Vite 7.1, selon les plages déclarées dans `package.json`. `package-lock.json` fixe les versions installées. Le routage est géré par fragments et l’état par les hooks React ; aucun routeur ou gestionnaire d’état externe n’est utilisé.

`index.html`, `assets/`, `art/`, `fonts/`, `canon/`, `qa/` et `favicon.svg` à la racine sont des **sorties générées** destinées à la compatibilité avec une publication depuis la branche. `dist/` est le dossier publié par le workflow ; `dist/` et `node_modules/` sont ignorés par Git. Modifier les sources dans `src/`, `public/` et `app.html`, puis compiler. Ne pas éditer les bundles ou le HTML compilé.

### Images

La série du 6 octobre 2026 remplace 37 illustrations : les trois puissances, sept Archanges, sept Revers, six lignées, la carte de Terra choisie, cinq continents, Aurenth, quatre cultes et trois scènes de pouvoir. Les neuf anciens noms de ressources qui dupliquaient ces images ont été supprimés le 8 octobre ; toutes les références utilisent les ressources actuelles. Les illustrations de sujets sans nouvelle version dédiée sont conservées. Voir [la sélection et les correspondances](docs/illustrations-2026-10-06.md).

Le composant `Art` utilise `srcset`, `sizes`, les dimensions déclarées et le chargement différé ; les images de premier plan peuvent être chargées prioritairement. L’agrandissement affiche l’originale. Les galeries et les fiches adaptent leurs compositions aux images en portrait ou en paysage.

Pour ajouter ou remplacer une illustration, fournir les trois fichiers WebP dans `public/art`, mettre à jour `src/data/art.json`, puis la référence `art` de la fiche si nécessaire. Les variantes ne sont pas fabriquées automatiquement par le build. La validation contrôle les références des fiches et livres, la carte de Terra, les métadonnées et les trois variantes ; elle refuse les images orphelines et fichiers périmés.

## Développement local

Utiliser **Node.js 22.6 ou supérieur** pour `--experimental-strip-types` ; la publication utilise Node.js 22. Installer les dépendances avec le lockfile :

```bash
npm ci
npm run dev
```

Ouvrir l’entrée source **`/MONO-prime/app.html`** sur l’adresse annoncée par Vite, normalement `http://localhost:5173/MONO-prime/app.html`. Cette entrée est distincte de `index.html`, qui contient le résultat compilé. Ne pas ouvrir directement `app.html` en `file://`.

| Commande          | Effet réel                                                                               |
| ----------------- | ---------------------------------------------------------------------------------------- |
| `npm run dev`     | Lance Vite sur `0.0.0.0` pour le développement                                           |
| `npm run check`   | Vérifie TypeScript, valide le canon, régénère les exports Markdown et exécute les tests  |
| `npm test`        | Valide le canon, régénère les exports et exécute les tests, sans vérification TypeScript |
| `npm run build`   | Exécute `check`, compile avec Vite et synchronise les sorties générées à la racine       |
| `npm run preview` | Sert le dernier `dist` compilé sur `0.0.0.0`                                             |

Pour contrôler la version destinée à la publication :

```bash
npm run build
npm run preview
```

Ouvrir `/MONO-prime/` sur l’adresse annoncée par le serveur de prévisualisation, normalement `http://localhost:4173/MONO-prime/`. JavaScript est nécessaire à l’application ; `app.html` contient un message sans JavaScript avec un lien vers le canon Markdown.

Un banc d’aperçu responsive est disponible dans `public/qa/responsive.html` (publié sous `/MONO-prime/qa/responsive.html`). Il affiche le vrai site dans une fenêtre de 320, 390, 620, 820 ou 1 440 px, avec choix du parcours. Il n’est pas lié à la navigation du site et ne collecte aucune donnée. Utiliser cet aperçu pour vérifier les menus, thèmes, filtres, marqueurs de Terra et commandes de lecture.

### Portée des vérifications

Le contrôle du canon vérifie les identifiants et catégories uniques, les références, les sections requises, les nombres de puissances/Archanges/Revers/lignées/cultes, certains repères du canon et l’absence de formulations obsolètes ciblées. Il contrôle également les métadonnées et la présence de WebP non vides pour les illustrations des fiches, ainsi que la structure des livres et chapitres.

Les tests vérifient également la recherche par ancien nom, les destinations du lexique et la concordance des descriptions de pouvoirs entre fiches et guides. Les tests couvrent les catégories et requêtes partageables, les liens vers les sections, les alias anciens, les chapitres invalides, les données de lecture périmées et la recherche normalisée. Ils ne remplacent pas un contrôle visuel et interactif. Après une modification d’interface, vérifier les parcours concernés, les petits écrans, les deux thèmes, la lecture et les agrandissements.

## Publication GitHub Pages

Le workflow `Build and publish MONO` est déclenché par un push sur **`main`** ou manuellement via `workflow_dispatch`. Il utilise Node.js 22, exécute `npm ci` puis `npm run build`, téléverse `dist` et le publie avec les actions GitHub Pages. Le dépôt doit être configuré pour une publication Pages via GitHub Actions.

Le build prend **`app.html`** comme entrée, produit `dist/app.html`, puis copie ce document vers `dist/index.html` et `index.html` à la racine. Le plugin `mono-pages` remplace les cinq dossiers générés (`assets`, `art`, `fonts`, `canon`, `qa`) depuis `dist`, en vérifiant leur destination, pour supprimer aussi les fichiers devenus obsolètes. Cette séparation conserve l’entrée source et la page servie, notamment pour éviter de servir une entrée de développement à Safari/iPhone.

Pour publier une modification : modifier les sources, exécuter `npm run build`, examiner le diff incluant les éventuelles sorties générées, puis committer et pousser sur `main`. Pour ce README seul, aucune reconstruction des ressources n’est nécessaire ; le push sur `main` déclenche néanmoins le workflow existant. Si le nom du dépôt ou le chemin d’hébergement change, adapter aussi la base Vite et les URL publiques de `app.html`.

## Maintenance du 8 octobre 2026

Les doublons d’images, polices inutilisées, ancien manifeste et comptes rendus dépassés ont été retirés. Les sources, licences actives, exports, alias de routes utiles et questions éditoriales ouvertes sont conservés. Voir [le nettoyage et ses contrôles](docs/maintenance.md).

## Continuer le projet

Pour une modification éditoriale, commencer par `src/data/canon.json` et ses questions ouvertes. Pour une modification d’interface, lire `src/app.tsx`, `src/design.css`, en conservant les parcours et le canon. Mettre à jour ce README lorsque les fonctionnalités, commandes, données ou direction artistique changent.

Les sujets encore ouverts comprennent l’histoire des Neuf Lumières et des Royaumes Clos, les scènes détaillées du Grand Rite, les frontières et sociétés du présent, trois prophètes encore sans nom, les règles précises du devenir des âmes et le premier arc choral de l’Éveil des Brisures. Ils ne doivent pas être décrits comme déjà racontés. Les questions propres à chaque fiche sont conservées dans `open_questions` et affichées sur le site.
