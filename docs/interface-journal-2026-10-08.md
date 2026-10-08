# Interface — journal et index

Révision du 8 octobre 2026.

## Composition

L’accueil est une page de lecture à sommaire latéral. Le premier livre vient avant les notes de révision. Le texte de la chronique est extrait directement du canon ; les notes sont datées de sa consolidation. Un article situe Aurenth et renvoie aux fiches concernées. Les dossiers complémentaires reprennent leurs résumés canoniques.

L’interface utilise les liens soulignés, les listes, les séparateurs et les légendes. Les panneaux identiques, sceaux décoratifs, faux titres de gardien, grand bandeau, chiffres d’habillage et appels à découvrir répétés sont retirés. Les titres des pages et des sections nomment leur contenu.

Le Codex s’ouvre en liste en l’absence de préférence enregistrée. La galerie reste disponible et une préférence existante reste respectée. Les résultats de recherche forment une liste verticale. Les filtres, catégories, URLs, agrandissements, signets et réglages de lecture restent fonctionnels.

Sur téléphone le texte précède le sommaire. La navigation inférieure devient une rangée de liens textuels. Les illustrations de l’extrait passent au-dessus du texte pour conserver sa largeur. Le menu et le mode concentration restent accessibles.

## Matériaux

Fond d’encre violacée, liens lavande, titres en EB Garamond, corps Verdana, annotations Courier New. Le thème clair utilise un fond de papier. Les illustrations existantes sont conservées. La feuille active est src/design.css ; les sorties de publication sont générées par le build.

## Contrôles

TypeScript, canon et neuf tests passent. Accueil, Codex, lecture, guide et Terra contrôlés à 320, 390, 768 et 1280 px. Contrôles des filtres, agrandissements, menu et thèmes. La publication est vérifiée par les Actions du commit et la comparaison des fichiers servis.
