Abre el panel **Ask** de YouTube en las páginas de video y pulsa por ti el chip **Resumir el vídeo** (**Resume el video** en Latinoamérica), así el resumen empieza en cuanto abres un video.

## Qué hace

- Si el video tiene el botón Ask, el script abre el panel Ask y pide un resumen.
- En los videos sin Ask no hace nada.
- También funciona al pasar a otro video sin recargar la página, en ventanas estrechas donde el botón Ask queda plegado, y en pestañas en segundo plano (empieza cuando cambias a esa pestaña).

## Requisitos

- Haber iniciado sesión en YouTube con una cuenta que tenga la función Ask. No todos los videos ofrecen Ask.
- Sitio de escritorio (`www.youtube.com`). El sitio móvil `m.youtube.com` no es compatible.

## Idiomas

El botón Ask y el chip de resumen se buscan a partir de los datos de la página de YouTube, no del texto de los botones, así que el script no depende del idioma de la interfaz.

- Probado de principio a fin con la interfaz en inglés y en coreano.
- Comprobado que encuentra el chip de resumen con la interfaz en japonés, chino (simplificado y tradicional), español (España y Latinoamérica), francés, alemán, portugués (Brasil) y ruso.

## Ten en cuenta

- Cada resumen es una petición real a Ask, así que queda en tu historial de Ask (una vez por cada video que abras).
- El script no envía peticiones propias ni recopila datos. Solo pulsa los botones de YouTube.

## Compatibilidad

- Firefox + Violentmonkey
- Chrome + ScriptCat

## Solución de problemas

1. Abre la consola del navegador (F12) y activa el nivel de registro Verbose/Debug.
2. Filtra por `yt-auto-summarize-multilang`.
3. Si todo va bien, verás `checking video` → `opening Ask panel` → `requesting summary`.

- `no Ask button`: este video o tu cuenta no tiene Ask.
- `no Summarize chip`: el panel se abrió, pero no se encontró el chip. Deja un comentario con el idioma de tu interfaz y el texto del chip.

## Licencia

MIT
