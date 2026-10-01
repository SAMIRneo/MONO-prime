# MONO · Le Codex de la Déchirure

Portail narratif : Découvrir, Lire, Explorer. Le catalogue canonique reste dans `assets/hub/catalogue.js` ; cette migration ne modifie aucun texte du lore.

## Développement

Node.js 22 ou supérieur. `npm ci`, puis `npm run dev`. `npm run build` contrôle TypeScript et génère `dist/`. Le chemin de publication est `/MONO-prime/`.

## Architecture

Vite construit les ressources avec empreintes de cache. `src/main.tsx` intègre les composants React avec TypeScript strict. Le confort de lecture est le premier composant migré ; le moteur de vues historique conserve les routes par fragment, la recherche, les signets et les marques de lecture. L’événement `mono:route` assure le montage et le démontage des composants à chaque changement de page. La migration des autres vues reste progressive.

Le workflow GitHub Pages construit et publie `dist/`. Les illustrations appelées par le moteur de vues sont conservées à leur adresse historique. Les réglages de largeur et d’interligne sont locaux à l’appareil.

## Galerie des figures

`#/personnages` présente 17 portraits : trois entités, sept Archanges et sept Revers. `assets/hub/characters.js` contient seulement leur présentation visuelle ; `assets/hub/catalogue.js` reste la source du canon V8.1. Les planches sont cadrées dans chaque carte sans modifier les illustrations. Les aperçus WebP chargent à la demande, et la fenêtre de portrait utilise la résolution source.

`app.html` est le fichier HTML de développement. Le build produit `dist/index.html` et synchronise aussi `index.html` et les ressources compilées à la racine, pour que la publication Pages depuis la branche comme depuis le workflow serve une version fonctionnelle. Ne pas modifier directement le HTML compilé : modifier `app.html`, puis lancer `npm run build`.
