// ==UserScript==
// @name              YouTube Auto Summarize (Multi-language)
// @name:ko           YouTube 자동 요약 (다국어)
// @name:ja           YouTube 自動要約（多言語）
// @name:zh-CN        YouTube 自动摘要（多语言）
// @name:zh-TW        YouTube 自動摘要（多語言）
// @name:es           Resumen automático de YouTube (multilingüe)
// @name:fr           Résumé automatique YouTube (multilingue)
// @name:de           YouTube Auto-Zusammenfassung (mehrsprachig)
// @name:pt-BR        Resumo automático do YouTube (multilíngue)
// @name:ru           Автоматическое краткое содержание YouTube (многоязычное)
// @namespace         https://github.com/csjune
// @version           1.0.0
// @description       Opens YouTube's Ask panel and requests a summary when the Ask button is available.
// @description:ko    질문하기(Ask) 버튼이 있는 영상에서 YouTube Ask 패널을 열고 요약을 요청합니다.
// @description:ja    Ask ボタンがある動画で YouTube の Ask パネルを開き、要約をリクエストします。
// @description:zh-CN 在有 Ask 按钮的视频中打开 YouTube 的 Ask 面板并请求视频摘要。
// @description:zh-TW 在有 Ask 按鈕的影片中開啟 YouTube 的 Ask 面板並要求影片摘要。
// @description:es    Abre el panel Ask de YouTube y solicita un resumen cuando el botón Ask está disponible.
// @description:fr    Ouvre le panneau Ask de YouTube et demande un résumé lorsque le bouton Ask est disponible.
// @description:de    Öffnet bei Videos mit der Schaltfläche „Fragen“ (Ask) das Ask-Panel von YouTube und fordert eine Zusammenfassung an.
// @description:pt-BR Abre o painel Ask do YouTube e solicita um resumo quando o botão Ask está disponível.
// @description:ru    Открывает панель Ask на YouTube и запрашивает краткое содержание, когда доступна кнопка Ask.
// @author            csjune
// @license           MIT
// @homepageURL       https://github.com/csjune/yt-auto-summarize-multilang
// @supportURL        https://github.com/csjune/yt-auto-summarize-multilang/issues
// @compatible        firefox Tested with Violentmonkey
// @compatible        chrome Tested with ScriptCat
// @match             https://www.youtube.com/*
// @run-at            document-idle
// @grant             none
// @noframes
// ==/UserScript==

// On YouTube watch pages, open the Ask panel and click its Summarize chip.
//
// DOM as of 2026-10:
// - Ask button: a button-view-model.you-chat-entrypoint-button inside ytd-watch-metadata
//   #flexible-item-buttons, whose data.onTap.innertubeCommand.showEngagementPanelEndpoint
//   .panelIdentifier is "PAyouchat". The collapsed description has another entry point
//   ("Ask questions") with the same class that opens the same panel even while hidden.
//   In narrow windows the actions-row button is removed and shows up in the "More actions"
//   menu as a ytd-menu-service-item-renderer whose data.serviceEndpoint opens the panel.
// - Panel: ytd-engagement-panel-section-list-renderer[target-id="PAyouchat"]
// - Chip: a button inside you-chat-chips-data. Its wrapper's data.continuation
//   tells the chip kind apart (see isSummarizeChipData).
// These do not depend on the UI language. Page data (`data` properties) is invisible
// when the manager runs us in an isolated world (some Chrome managers do), so each step
// falls back to DOM-only checks: the entry point class, then chip labels and order.

const ASK_PANEL_ID = "PAyouchat";
const ASK_ENTRYPOINT = "button-view-model.you-chat-entrypoint-button";
// Fallback Summarize chip labels: the "summarize" verb and "video" from each UI
// language's chip (2026-10), loose enough to survive small wording changes. Noun forms
// (resumen, résumé, resumo) are left out since generated questions use them too.
const SUMMARIZE_LABEL = new RegExp([
  "summar",                              // en: Summarize the video / Summarise the video
  "동영상을 요약",                       // ko: 동영상을 요약해 줘
  "動画を要約",                          // ja: 動画を要約して
  "总结.{0,4}视频",                      // zh-CN: 总结视频
  "影片摘要",                            // zh-TW: 生成影片摘要
  "resum(?:e|ir)\\b.{0,8}v[ií]deo",      // es: Resumir el vídeo, es-419: Resume el video
  "résum(?:e|er)\\b.{0,8}vidéo",         // fr: Résume la vidéo
  "fass\\w*.{0,15}video.{0,10}zusammen", // de: Fasse das Video zusammen
  "resum(?:a|ir)\\b.{0,8}v[ií]deo",      // pt-BR: Resuma o vídeo
  "пересказ.{0,10}видео",                // ru: Краткий пересказ видео
].join("|"), "i");

const ACTIONS_READY_TIMEOUT_MS = 15000;
const ASK_AFTER_READY_TIMEOUT_MS = 2000;
const MENU_TIMEOUT_MS = 1500;
const SUMMARIZE_TIMEOUT_MS = 15000;

let handledVideoId = null;
let generation = 0;

function log(...args) {
  console.debug("[yt-auto-summarize-multilang]", ...args);
}

function currentVideoId() {
  if (location.pathname !== "/watch") return null;
  return new URLSearchParams(location.search).get("v");
}

function isVisible(el) {
  return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden";
}

function labelOf(el) {
  return (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim();
}

// YouTube keeps each element's renderer data in an expando `data` property.
// When the manager runs us as a Firefox content script, page properties are only
// reachable through wrappedJSObject.
function dataOf(el) {
  try {
    return (el.wrappedJSObject || el).data || null;
  } catch {
    return null;
  }
}

// Walk up from el (up to, not including, stop) to the first element carrying data.
function closestData(el, stop) {
  for (; el && el !== stop; el = el.parentElement) {
    const data = dataOf(el);
    if (data) return data;
  }
  return null;
}

function opensAskPanel(command) {
  return command?.showEngagementPanelEndpoint?.panelIdentifier === ASK_PANEL_ID;
}

// Watch DOM mutations until find() returns an element. Gives up on timeout or video change.
function waitFor(find, timeoutMs, gen) {
  return new Promise((resolve) => {
    const check = () => {
      if (gen !== generation) return finish(null);
      const el = find();
      if (el) finish(el);
    };
    const observer = new MutationObserver(check);
    const timer = setTimeout(() => finish(null), timeoutMs);
    function finish(el) {
      observer.disconnect();
      clearTimeout(timer);
      resolve(el);
    }
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    check();
  });
}

// Background tabs may not render the watch page until shown, and the timeouts below
// would run out before anything appears.
function whenVisible() {
  if (!document.hidden) return Promise.resolve();
  return new Promise((resolve) => {
    document.addEventListener("visibilitychange", function onChange() {
      if (document.hidden) return;
      document.removeEventListener("visibilitychange", onChange);
      resolve();
    });
  });
}

function metadata() {
  return document.querySelector("ytd-watch-metadata");
}

function actionsMenu() {
  return metadata()?.querySelector("#actions ytd-menu-renderer") || null;
}

// The actions row counts as ready once the like/share buttons are rendered.
function findActionsRow() {
  const row = metadata()?.querySelector("#top-level-buttons-computed");
  return row && [...row.querySelectorAll("button")].some(isVisible) ? row : null;
}

// Whether this video offers Ask at all, read from the actions menu data.
// Returns null when the data is not readable.
function videoHasAsk() {
  const menu = actionsMenu();
  const items = menu && dataOf(menu)?.flexibleItems;
  if (!items) return null;
  return [...items].some((item) => {
    const flexible = item.menuFlexibleItemRenderer;
    return (
      opensAskPanel(flexible?.topLevelButton?.buttonViewModel?.onTap?.innertubeCommand) ||
      opensAskPanel(flexible?.menuItem?.menuServiceItemRenderer?.serviceEndpoint)
    );
  });
}

function findAskButton() {
  const scope = metadata();
  if (!scope) return null;
  const buttons = [...scope.querySelectorAll("#flexible-item-buttons button, #top-level-buttons-computed button")];
  const visible = buttons.filter(isVisible);
  return (
    visible.find((btn) => opensAskPanel(closestData(btn, scope)?.onTap?.innertubeCommand)) ||
    visible.find((btn) => btn.closest(ASK_ENTRYPOINT)) ||
    scope.querySelector(`yt-video-description-youchat-section-view-model ${ASK_ENTRYPOINT} button`)
  );
}

function findMoreActionsButton() {
  const overflow = actionsMenu()?.querySelector(":scope > #button-shape button");
  return overflow && isVisible(overflow) ? overflow : null;
}

// In narrow windows the Ask button moves into the "..." menu. Menu items are told
// apart by their data only, so this needs readable page data.
async function findAskInOverflowMenu(gen) {
  const more = findMoreActionsButton();
  if (!more) return null;

  more.click();
  const item = await waitFor(() => {
    const items = [...document.querySelectorAll(
      "ytd-popup-container ytd-menu-service-item-renderer, ytd-popup-container yt-list-item-view-model"
    )].filter(isVisible);
    return items.find((i) => opensAskPanel(dataOf(i)?.serviceEndpoint)) || null;
  }, MENU_TIMEOUT_MS, gen);

  // No Ask in the menu: close the menu we opened.
  if (!item && gen === generation) more.click();
  return item;
}

function decodeBase64Url(text) {
  return atob(decodeURIComponent(text).replace(/-/g, "+").replace(/_/g, "/"));
}

// A chip's continuation is a base64url protobuf that embeds a second base64url
// protobuf. That inner message has a submessage { 1: counter, 2: type, 5: source }:
//   Summarize the video        type 1,  source 1
//   Recommend related content  type 3,  source 1
//   Quiz me                    type 18, source 1
//   generated questions        type 1,  source 6
// So Summarize is the one with type 1 and source 1, whatever the label says.
const SUMMARIZE_CHIP_MARKER = /\*[\s\S]\x08[\x80-\xff]*[\x00-\x7f]\x10\x01\x28\x01/;

function isSummarizeChipData(chip) {
  try {
    const outer = decodeBase64Url(chip.continuation);
    const inner = outer.match(/[\w-]{40,}(?:%3D)*/);
    return !!inner && SUMMARIZE_CHIP_MARKER.test(decodeBase64Url(inner[0]));
  } catch {
    return false;
  }
}

function askPanel() {
  return document.querySelector(`ytd-engagement-panel-section-list-renderer[target-id='${ASK_PANEL_ID}']`);
}

// staleChips: chips that were already in the panel before this video, to be ignored.
function findSummarizeChip(staleChips) {
  const panel = askPanel();
  if (!panel) return null;
  const fresh = (el) => !staleChips.has(el) && isVisible(el);

  const chips = [...panel.querySelectorAll("you-chat-item-view-model button")].filter(fresh);
  const chipData = chips.map((el) => closestData(el, panel));
  return (
    summarizeChipByData(chips, chipData) ||
    summarizeChipByLabel(panel, fresh) ||
    // Never guess by position when the data is readable but has no Summarize chip.
    (chipData.every((data) => !data) ? summarizeChipByPosition(panel, fresh) : null)
  );
}

function summarizeChipByData(chips, chipData) {
  return chips.find((el, i) => {
    const data = chipData[i];
    return typeof data?.continuation === "string" && isSummarizeChipData(data);
  }) || null;
}

function summarizeChipByLabel(panel, fresh) {
  for (const el of panel.querySelectorAll("button, [role='button']")) {
    const text = labelOf(el);
    // Only short labels: longer text is a wrapping container or an answer body, not a chip.
    if (text.length < 80 && SUMMARIZE_LABEL.test(text) && fresh(el)) return el;
  }
  return null;
}

// Without page data, pick by position: Summarize has always been the first chip.
// Only the first one, never the next chip when the first is stale or hidden.
function summarizeChipByPosition(panel, fresh) {
  const first = panel.querySelector("you-chat-chips-data button");
  return first && fresh(first) ? first : null;
}

function pageDataReadable() {
  const menu = actionsMenu();
  return !!(menu && dataOf(menu));
}

async function run() {
  const videoId = currentVideoId();
  if (!videoId || videoId === handledVideoId) return;

  const gen = ++generation;
  handledVideoId = videoId;
  log("checking video", videoId);

  // Chips already in the panel belong to an earlier video.
  const staleChips = new Set(askPanel()?.querySelectorAll("button") || []);

  if (document.hidden) {
    log("waiting until the tab is visible");
    await whenVisible();
    if (gen !== generation) return;
  }

  // yt-navigate-finish fires before the watch page switches over: until ytd-watch-flexy
  // carries the new video id, the actions row, description and Ask panel still belong
  // to the previous video.
  const pageReady = () =>
    document.querySelector("ytd-watch-flexy")?.getAttribute("video-id") === videoId && findActionsRow();
  if (!(await waitFor(pageReady, ACTIONS_READY_TIMEOUT_MS, gen))) {
    log("actions row not found");
    return;
  }
  log(pageDataReadable() ? "page data readable" : "page data not readable, using DOM fallbacks");

  let ask = await waitFor(findAskButton, ASK_AFTER_READY_TIMEOUT_MS, gen);
  // Open the "..." menu only when the menu data says Ask is in there.
  if (!ask && gen === generation && videoHasAsk()) ask = await findAskInOverflowMenu(gen);
  if (!ask || gen !== generation) {
    log("no Ask button");
    return;
  }

  log("opening Ask panel");
  ask.click();

  const chip = await waitFor(() => findSummarizeChip(staleChips), SUMMARIZE_TIMEOUT_MS, gen);
  if (!chip || gen !== generation) {
    log("no Summarize chip");
    return;
  }

  log("requesting summary");
  chip.click();
}

// YouTube is an SPA and fires yt-navigate-finish on every in-app navigation.
document.addEventListener("yt-navigate-finish", () => run());
run();
