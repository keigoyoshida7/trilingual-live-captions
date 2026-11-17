import { createCaptionRow, followCaptions, paintCaption } from "./caption-view.mjs?v=1";
import { connectCaptionRoom, createCaptionRoom, readCaptionPacket, validWatchSecret } from "./share-wire.mjs?v=1";
import { languages } from "./whisper-prefix.mjs";

const status = document.getElementById("status");
const statusText = document.getElementById("status-text");
const empty = document.getElementById("empty");
const captions = document.getElementById("captions");
const viewport = document.getElementById("viewport");
const follow = document.getElementById("follow");
const retry = document.getElementById("watch-retry");
const headings = Array.from(document.getElementById("language-headings").children);
const languageButtons = Array.from(document.getElementById("watch-languages").children);
const trackLatest = followCaptions(viewport, follow);
const rows = new Map();
const states = {
  connecting: ["starting", "接続中…", "配信者に接続しています。"],
  waiting: ["idle", "開始待ち", "配信者が開始すると、ここに字幕が流れます。"],
  starting: ["starting", "準備中", "配信者が字幕を準備しています。"],
  live: ["live", "字幕配信中", "最初の字幕を待っています。"],
  paused: ["idle", "一時停止中", "配信者の再開を待っています。"],
  recovering: ["starting", "再接続中…", "配信者への接続を回復しています。"],
  ended: ["idle", "配信終了", "字幕の共有が終了しました。"],
  error: ["error", "接続エラー", "字幕に接続できませんでした。"],
  invalid: ["error", "視聴リンクが必要", "配信者から受け取った視聴リンクを開いてください。"],
};

let viewing = null;
let ended = false;
let secret = location.hash.slice(1);

function showState(state) {
  const [style, label, message] = states[state];
  status.dataset.state = style;
  if (statusText.textContent !== label) statusText.textContent = label;
  empty.textContent = message;
  retry.hidden = state !== "error" && state !== "recovering";
}

function selectLanguage(language) {
  document.body.dataset.captionLanguage = language;
  for (const button of languageButtons) button.setAttribute("aria-pressed", button.dataset.language === language);
  trackLatest();
}

const preferredLanguage = navigator.language?.split("-")[0];
selectLanguage(languages.includes(preferredLanguage) ? preferredLanguage : "en");
for (const button of languageButtons) {
  button.addEventListener("click", () => selectLanguage(button.dataset.language));
}

function removeRow(id) {
  rows.get(id).remove();
  rows.delete(id);
}

function showPacket(packet) {
  const current = new Set(packet.rows.map(({ id }) => id));
  const firstId = packet.rows[0]?.id ?? 0;
  for (const [id, element] of rows) {
    if (!current.has(id) && (id >= firstId || element.hasAttribute("data-partial"))) removeRow(id);
  }

  for (const caption of packet.rows) {
    let row = rows.get(caption.id);
    if (!row) {
      row = createCaptionRow();
      rows.set(caption.id, row);
      captions.append(row);
    }
    row.toggleAttribute("data-partial", caption.partial);
    paintCaption(row, caption.text);
  }
  while (rows.size > 80) removeRow(rows.keys().next().value);
  for (const heading of headings) heading.toggleAttribute("data-current", heading.dataset.language === packet.source);
  empty.hidden = rows.size > 0;
  showState(packet.phase);
  trackLatest();
}

function disconnect() {
  const run = viewing;
  if (!run) return;
  viewing = null;
  run.controller.abort();
  clearTimeout(run.stale);
  void run.room?.sdk.disconnect().catch(() => {});
}

async function connect() {
  disconnect();
  if (!validWatchSecret(secret)) {
    showState("invalid");
    return;
  }
  showState("connecting");
  const run = { controller: new AbortController(), revision: 0 };
  viewing = run;
  const recovering = () => { if (viewing === run) showState("recovering"); };
  try {
    run.room = await createCaptionRoom(secret);
    const { sdk } = run.room;
    if (viewing !== run) {
      void sdk.disconnect().catch(() => {});
      return;
    }
    sdk.addEventListener("dataReceived", ({ detail }) => {
      if (viewing !== run) return;
      const packet = readCaptionPacket(detail.data);
      if (!packet || packet.revision <= run.revision) return;
      run.revision = packet.revision;
      clearTimeout(run.stale);
      showPacket(packet);
      if (packet.phase === "ended") {
        ended = true;
        disconnect();
      } else {
        run.stale = setTimeout(recovering, 30_000);
      }
    });
    sdk.addEventListener("dataChannelClose", recovering);
    sdk.addEventListener("peerDisconnected", recovering);
    sdk.addEventListener("connectionFailed", recovering);
    sdk.addEventListener("reconnecting", () => { if (!run.revision) recovering(); });
    sdk.addEventListener("reconnectFailed", () => {
      if (viewing !== run) return;
      disconnect();
      showState("error");
    });
    await connectCaptionRoom(run.room, false, run.controller.signal);
    if (viewing === run && !run.revision) showState("waiting");
  } catch (error) {
    if (viewing !== run) return;
    console.warn("Unable to connect to the caption stream", error.message);
    disconnect();
    showState("error");
  }
}

retry.addEventListener("click", () => void connect());
window.addEventListener("hashchange", () => {
  secret = location.hash.slice(1);
  ended = false;
  rows.clear();
  captions.replaceChildren();
  empty.hidden = false;
  for (const heading of headings) heading.removeAttribute("data-current");
  follow.click();
  void connect();
});
window.addEventListener("pagehide", disconnect);
window.addEventListener("pageshow", ({ persisted }) => {
  if (persisted && !ended) void connect();
});
void connect();
