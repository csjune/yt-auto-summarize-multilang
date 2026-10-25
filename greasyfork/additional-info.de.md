Öffnet auf YouTube-Videoseiten den Ask-Bereich (Schaltfläche **Fragen**) und klickt für dich auf den Chip **Fasse das Video zusammen** – die Zusammenfassung startet, sobald du ein Video öffnest.

## Was das Skript macht

- Hat das Video die Schaltfläche „Fragen“, öffnet das Skript den Ask-Bereich und fordert eine Zusammenfassung an.
- Videos ohne Ask bleiben unberührt.
- Funktioniert auch, wenn du ohne Neuladen zu einem anderen Video wechselst, in schmalen Fenstern, in denen „Fragen“ eingeklappt ist, und in Hintergrund-Tabs (es startet, sobald du zum Tab wechselst).

## Voraussetzungen

- Du bist bei YouTube angemeldet und dein Konto hat die Ask-Funktion. Ask gibt es nicht bei jedem Video.
- Desktop-Website (`www.youtube.com`). Die mobile Website `m.youtube.com` wird nicht unterstützt.

## Sprachen

Die Schaltfläche und der Zusammenfassungs-Chip werden über die Seitendaten von YouTube gefunden, nicht über den Text. Das Skript hängt daher nicht von der Sprache der Oberfläche ab.

- Vollständig getestet mit englischer und koreanischer Oberfläche.
- Erkennung des Chips geprüft mit japanischer, chinesischer (vereinfacht und traditionell), spanischer (Spanien und Lateinamerika), französischer, deutscher, portugiesischer (Brasilien) und russischer Oberfläche.

## Hinweise

- Jede Zusammenfassung ist eine echte Ask-Anfrage und erscheint daher in deinem Ask-Verlauf (einmal pro geöffnetem Video).
- Das Skript sendet selbst keine Anfragen und sammelt keine Daten. Es klickt nur auf die Schaltflächen von YouTube.

## Kompatibilität

- Firefox + Violentmonkey
- Chrome + ScriptCat

## Fehlerbehebung

1. Öffne die Browserkonsole (F12) und aktiviere die Protokollstufe Verbose/Debug.
2. Filtere nach `yt-auto-summarize-multilang`.
3. Bei normalem Ablauf erscheint `checking video` → `opening Ask panel` → `requesting summary`.

- `no Ask button`: Dieses Video oder dein Konto hat kein Ask.
- `no Summarize chip`: Der Bereich wurde geöffnet, aber der Chip wurde nicht gefunden. Bitte gib im Feedback die Sprache deiner Oberfläche und den Text des Chips an.

## Lizenz

MIT
