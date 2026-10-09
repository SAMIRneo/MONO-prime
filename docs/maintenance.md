# Maintenance — 9 octobre 2026

Le dépôt contient le canon V9.3 : 60 fiches, 24 chapitres et 20 définitions. L'approfondissement des rapports de force et le premier conflit du présent sont documentés dans `canon-v9-3-2026-10-09.md`. Les révisions V9.1 et V9.2 restent documentées dans leurs notes respectives. Trois nouvelles fiches n'ont pas encore de portrait ; le validateur n'exige des variantes que lorsqu'une illustration est référencée.

## Nettoyage

- Neuf anciens noms d’images retirés après comparaison SHA-256 de leurs trois variantes avec les ressources actuelles : aurenth, avarn, khoram, puissance, sahrun, seyra, sillage, terra et theryn. La fiche Terra utilise désormais terra-map-v1.
- Ancien manifeste d’images du 2 octobre retiré.
- Polices Cormorant et Fraunces inutilisées retirées avec leurs licences associées. Manrope et EB Garamond conservent leurs licences.
- Quatre notes dépassées retirées : audit du 2 octobre, prompts du Sillage, refonte du 6 octobre et mobile du 7 octobre. Le README décrit l’interface actuelle ; la sélection artistique reste documentée.
- 52 illustrations, 156 WebP. 37 fichiers sources supprimés, soit 6 727 197 octets ; les copies de publication correspondantes sont également supprimées par le build.
- Dépendance transitive source-map-js mise à jour vers 1.2.2 ; audit npm sans vulnérabilité signalée lors du contrôle.

## Prévenir les résidus

Le validateur refuse les métadonnées orphelines et les fichiers d’illustrations absents ou supplémentaires. Toute illustration possède trois variantes. Les noms anciens utiles à la recherche et les URL historiques du canon restent compatibles.

Le build remplace les seuls dossiers générés assets, art, fonts, canon et qa à la racine depuis dist. Le chemin du dépôt est fixé depuis la configuration ; les destinations hors liste et les liens symboliques de dossiers sont refusés. Un test vérifie la suppression des fichiers périmés et le refus de destinations non gérées.

Ne jamais supprimer les copies publiées à la main ou modifier les bundles. Modifier les sources, lancer npm run build, examiner le diff, puis publier. Vérifier les Actions du commit et comparer les fichiers réellement servis avec dist.

## Contrôles

TypeScript, canon, références, WebP, exports et neuf tests passent avec npm run build. La vérification éditoriale reste distincte des tests : les questions ouvertes sont conservées et aucune certification de cohérence absolue n’est revendiquée.
