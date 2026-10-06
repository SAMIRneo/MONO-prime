# MONO — Illustrations du 6 octobre 2026

La nouvelle sélection reprend les versions 3D peintes travaillées autour d’Arcane, du graphisme de Spider-Verse et du mystère de Sandman. Les images restent des interprétations artistiques du canon V9.

## Sélection publiée

| Ensemble | Illustrations |
| --- | --- |
| Puissances | AZKAVOTH, Vothorak, Qerath |
| Archanges | Ophriel, Hodariel, Sethariel, Malkiel, Rahamiel, Tamariel, Nechariel |
| Revers | Karzuth, Nehrun, Ymbrath, Bazhur, Sevrak, Ilmoth, Zhorum |
| Lignées | Humains, Djinns opalescents, Anakim monumental, Golems, Néphilim angélique, Qerathim de la Maison de Karzuth |
| Géographie | Terra, Avarn, Sahrûn, Khoram, Seyra, Theryn, Aurenth |
| Cultes | La Source, Le Lien, La Forme, L’Épanchement |
| Pouvoir | Le Sillage, La Puissance, Les Brisures |

37 illustrations distinctes sont remplacées. Les ressources historiques `terra`, `avarn`, `sahrun`, `khoram`, `seyra`, `theryn`, `aurenth`, `sillage` et `puissance` reprennent également les nouvelles versions pour éviter d’afficher une ancienne image via ces noms.

## Carte retenue

La carte choisie est l’atlas éditorial portant **TERRA en haut à gauche**, sur fond bleu nuit, avec une **bande corail à gauche**, sans cadre doré. L’autre proposition du même jour n’est pas intégrée. Les cinq continents conservent leur disposition générale et Aurenth se situe sur Avarn. Les contours sont une proposition géographique, pas une projection Mercator vérifiée ni un relevé de distances.

## Fichiers et affichage

Les images sont converties en WebP avec conservation du cadrage et des proportions. Chaque nom possède une originale, une variante de 840 pixels de largeur maximum et une variante de 420 pixels maximum. `src/data/art.json` contient leurs dimensions réelles. Le composant `Art` continue de sélectionner la variante adaptée à la largeur d’affichage ; l’agrandissement ouvre l’originale.

Les fichiers de `public/art/` sont les sources du site. La compilation les synchronise vers `art/` et `dist/art/`. La révision de cache `20261006-ultimate` permet de charger les nouvelles images sans réutiliser les anciennes variantes.

## Portée

Les illustrations de sujets qui n’ont pas reçu de nouvelle version dédiée restent conservées, notamment les Cieux, les Abysses, les Témoins, les figures historiques et les inversions du Sillage. Les nouvelles ailes du Néphilim, les vêtements et l’architecture d’Aurenth sont des propositions visuelles ; le texte du canon ne leur attribue pas de nouvelles capacités ou règles.
