Abre o painel **Ask** do YouTube nas páginas de vídeo e clica por você no chip **Resuma o vídeo**, para que o resumo comece assim que você abrir um vídeo.

## O que ele faz

- Se o vídeo tiver o botão Ask, o script abre o painel Ask e pede um resumo.
- Vídeos sem Ask não são alterados.
- Também funciona quando você passa para outro vídeo sem recarregar a página, em janelas estreitas em que o botão Ask fica recolhido e em abas em segundo plano (ele começa quando você muda para a aba).

## Requisitos

- Estar conectado ao YouTube com uma conta que tenha o recurso Ask. Nem todo vídeo oferece Ask.
- Site para computador (`www.youtube.com`). O site móvel `m.youtube.com` não é compatível.

## Idiomas

O botão Ask e o chip de resumo são encontrados pelos dados da página do YouTube, e não pelo texto dos botões, então o script não depende do idioma da interface.

- Testado do início ao fim com a interface em inglês e em coreano.
- Verificado que o chip de resumo é encontrado com a interface em japonês, chinês (simplificado e tradicional), espanhol (Espanha e América Latina), francês, alemão, português (Brasil) e russo.

## Observações

- Cada resumo é uma solicitação real ao Ask, então ele aparece no seu histórico do Ask (uma vez por vídeo aberto).
- O script não envia solicitações próprias e não coleta dados. Ele só clica nos botões do próprio YouTube.

## Compatibilidade

- Firefox + Violentmonkey
- Chrome + ScriptCat

## Solução de problemas

1. Abra o console do navegador (F12) e ative o nível de log Verbose/Debug.
2. Filtre por `yt-auto-summarize-multilang`.
3. Se estiver funcionando, aparecerá `checking video` → `opening Ask panel` → `requesting summary`.

- `no Ask button`: este vídeo ou sua conta não tem Ask.
- `no Summarize chip`: o painel abriu, mas o chip não foi encontrado. Deixe um feedback com o idioma da sua interface e o texto do chip.

## Licença

MIT
