Ouvre le panneau **Ask** de YouTube sur les pages de vidéo et clique pour vous sur la puce **Résume la vidéo** : le résumé démarre dès que vous ouvrez une vidéo.

## Ce que fait le script

- Si la vidéo a un bouton Ask, le script ouvre le panneau Ask et demande un résumé.
- Les vidéos sans Ask ne sont pas touchées.
- Fonctionne aussi quand vous passez à une autre vidéo sans recharger la page, dans les fenêtres étroites où le bouton Ask est replié, et dans les onglets en arrière-plan (il démarre quand vous affichez l'onglet).

## Prérequis

- Être connecté à YouTube avec un compte qui a accès à Ask. Ask n'est pas proposé sur toutes les vidéos.
- Site pour ordinateur (`www.youtube.com`). Le site mobile `m.youtube.com` n'est pas pris en charge.

## Langues

Le bouton Ask et la puce de résumé sont repérés grâce aux données de la page YouTube, et non au texte des boutons : le script ne dépend donc pas de la langue de l'interface.

- Testé de bout en bout avec l'interface en anglais et en coréen.
- Détection de la puce vérifiée avec l'interface en japonais, chinois (simplifié et traditionnel), espagnol (Espagne et Amérique latine), français, allemand, portugais (Brésil) et russe.

## À savoir

- Chaque résumé est une vraie requête Ask : il apparaît dans votre historique Ask (une fois par vidéo ouverte).
- Le script n'envoie aucune requête de lui-même et ne collecte aucune donnée. Il se contente de cliquer sur les boutons de YouTube.

## Compatibilité

- Firefox + Violentmonkey
- Chrome + ScriptCat

## Dépannage

1. Ouvrez la console du navigateur (F12) et activez le niveau de journalisation Verbose/Debug.
2. Filtrez sur `yt-auto-summarize-multilang`.
3. En fonctionnement normal, vous verrez `checking video` → `opening Ask panel` → `requesting summary`.

- `no Ask button` : cette vidéo ou votre compte n'a pas Ask.
- `no Summarize chip` : le panneau s'est ouvert, mais la puce est introuvable. Laissez un commentaire avec la langue de votre interface et le texte de la puce.

## Licence

MIT
