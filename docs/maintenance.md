# Maintenance — 10 octobre 2026

Canon actif : V10.0, 67 fiches, 24 chapitres, 28 repères lexicaux, 52 illustrations et 156 WebP.

## Purge réalisée

- Suppression des comptes rendus V9.1, V9.2 et V9.3, remplacés par la refonte V10.
- Suppression des journaux historiques d’interface et d’organisation ; les fonctionnalités actuelles sont décrites dans le README.
- Remplacement du README accumulatif par une documentation courante : retrait des anciens noms de navigation, anciens effectifs et informations de maintenance périmées.
- Conservation et actualisation de la direction artistique dans `illustrations.md`.
- Retrait, dans l’espace de travail voisin du dépôt, des scripts de migration déjà exécutés et des dossiers de production des arcs Oran/Naël abandonnés.

Les versions suivies restent récupérables dans Git. Aucun historique Git n’est réécrit. Le canon actuel, les questions ouvertes, les tests, les licences et les ressources utilisées sont conservés. L’audit du 10 octobre reste disponible dans l’espace de travail.

## Prévenir les résidus

La source éditoriale est `src/data/canon.json`. Régénérer les exports et les bundles avec `npm run build` ; ne pas les éditer à la main. Les URL historiques des exports restent compatibles.

Le validateur contrôle les références et refuse les images orphelines. Le build remplace les dossiers générés autorisés depuis `dist`, supprimant leurs fichiers périmés. Les copies à la racine sont une sortie de publication encore utilisée, pas des sources supplémentaires.

Conserver les décisions et conventions toujours applicables ; utiliser Git pour retrouver les anciens états. Éviter de laisser des scripts ponctuels de réécriture près des commandes de maintenance : les rejouer pourrait réintroduire du contenu retiré.

Après une modification : compilation et tests adaptés, examen du diff ; en cas de changement d’interface, contrôle des parcours, du clavier et des petits écrans. Après publication, vérifier les Actions et les fichiers servis. Aucune certification générale d’accessibilité ou de cohérence littéraire ne découle des seuls tests.

## Nettoyage du site

Les sélecteurs des anciennes pages et des arcs abandonnés ont été retirés après vérification de leurs références. Le traitement spécial du dénouement de l’arc supprimé est retiré. Les composants de lecture illustrée restent disponibles pour les récits futurs.

La fiche Terra est consultable dans le Codex ; elle renvoie vers l’atlas, qui propose le retour vers la fiche. La recherche couvre désormais les mystères et les questions éditoriales ouvertes. La fenêtre d’agrandissement utilise un libellé adapté aux illustrations. Le défilement vers les continents respecte la préférence de mouvement réduit.

TypeScript refuse désormais les déclarations et paramètres inutilisés. Les tests protègent les recherches dans les rubriques complémentaires et distinguent la fiche Terra de son atlas.
