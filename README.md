# YouTube Auto Summarize (Multi-language)

A userscript that opens YouTube's **Ask** panel on watch pages and clicks the **Summarize the video** chip for you, so a summary starts as soon as you open a video.

## Install

1. Install a userscript manager, such as [Violentmonkey](https://violentmonkey.github.io/) (Firefox) or [ScriptCat](https://scriptcat.org/) (Chrome).
   In Chrome, also turn on **Allow User Scripts** for the manager in `chrome://extensions`.
2. Install the script from Greasy Fork:
   https://greasyfork.org/scripts/602107-youtube-auto-summarize-multi-language

   Installing from Greasy Fork gives you automatic updates. To try the latest code from this repository instead, open
   https://raw.githubusercontent.com/csjune/yt-auto-summarize-multilang/main/yt-auto-summarize-multilang.user.js

## What it does

- If the video has an Ask button, the script opens the Ask panel and requests a summary.
- Videos without Ask are left alone.
- Also works when you click through to another video without a page reload, in narrow windows where Ask is folded away, and in background tabs (it starts once you switch to the tab).

## Requirements

- You are signed in to YouTube, and your account has the Ask feature. Ask is not offered on every video.
- Desktop site (`www.youtube.com`). The mobile site `m.youtube.com` is not supported.

## Languages

The Ask button and the Summarize chip are found from YouTube's page data, not from button text, so the script does not depend on the UI language.

- Tested end to end with the English and Korean UIs.
- Chip detection checked with the Japanese, Chinese (Simplified and Traditional), Spanish (Spain and Latin America), French, German, Portuguese (Brazil) and Russian UIs.

## Please note

- Each summary is a real Ask request, so it shows up in your Ask history (once per video you open).
- The script sends no requests of its own and collects no data. It only clicks YouTube's own buttons.

## Compatibility

- Firefox + Violentmonkey
- Chrome + ScriptCat

## Troubleshooting

1. Open the browser console (F12) and turn on the Verbose/Debug log level.
2. Filter by `yt-auto-summarize-multilang`.
3. A working run logs `checking video` → `opening Ask panel` → `requesting summary`.

- `no Ask button`: this video or your account has no Ask.
- `no Summarize chip`: the panel opened but the chip was not found. Please open an issue with your UI language and the chip text.

## License

[MIT](LICENSE)
