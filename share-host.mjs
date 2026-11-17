import { captionPacket, connectCaptionRoom, createCaptionRoom, newWatchLink, sharedCaptionLimit } from "./share-wire.mjs?v=1";

const share = document.getElementById("share");
const dialog = document.getElementById("share-dialog");
const status = document.getElementById("share-status");
const details = document.getElementById("share-details");
const link = document.getElementById("share-url");
const copy = document.getElementById("share-copy");
const qr = document.getElementById("share-qr");
const stop = document.getElementById("share-stop");
const retry = document.getElementById("share-retry");
const captions = document.getElementById("captions");
const headings = document.getElementById("language-headings");
const microphone = document.getElementById("status");

let sharing = null;

function snapshot(run, phase) {
  const rows = Array.from(captions.children).slice(-sharedCaptionLimit).map(row => {
    if (!run.ids.has(row)) run.ids.set(row, ++run.rowId);
    const text = Object.fromEntries(Array.from(row.children, cell => [
      cell.lang, cell.hasAttribute("data-unavailable") ? "" : cell.textContent,
    ]));
    return { id: run.ids.get(row), partial: row.hasAttribute("data-partial"), text };
  });
  const source = headings.querySelector("[data-current]")?.dataset.language ?? null;
  const micState = microphone.dataset.state;
  const current = micState === "draining" ? "live" : micState;
  const livePhase = ["live", "starting"].includes(current) ? current : (rows.length ? "paused" : "waiting");
  return captionPacket(++run.revision, phase ?? livePhase, source, rows);
}

function sendSnapshot(run, target, phase) {
  if (!run.peers.size) return false;
  try {
    return run.room.sdk.sendData(snapshot(run, phase), target);
  } catch (error) {
    console.warn("Could not send a caption update", error.message);
    return false;
  }
}

function updateStatus(run) {
  if (sharing !== run) return;
  const count = run.peers.size;
  status.textContent = run.reconnecting ? "共有の接続を回復中…" : (count ? "視聴中 " + count + "台" : "視聴者の接続を待っています。");
}

async function drawQr(run) {
  const { default: makeQr } = await import("https://cdn.jsdelivr.net/npm/qrcode-generator@2.0.4/dist/qrcode.mjs");
  if (sharing !== run) return;
  const code = makeQr(0, "M");
  code.addData(run.url);
  code.make();
  const modules = code.getModuleCount();
  const scale = 5;
  const quietZone = 4;
  qr.width = qr.height = (modules + quietZone * 2) * scale;
  const context = qr.getContext("2d");
  context.fillStyle = "white";
  context.fillRect(0, 0, qr.width, qr.height);
  context.fillStyle = "black";
  for (let row = 0; row < modules; row++) {
    for (let column = 0; column < modules; column++) {
      if (code.isDark(row, column)) context.fillRect((column + quietZone) * scale, (row + quietZone) * scale, scale, scale);
    }
  }
  qr.hidden = false;
}

function finishShare(issue = false) {
  const run = sharing;
  if (!run) return;
  sharing = null;
  run.controller.abort();
  run.observer?.disconnect();
  clearInterval(run.heartbeat);
  clearTimeout(run.pending);
  const sent = sendSnapshot(run, undefined, "ended");
  const disconnect = () => void run.room?.sdk.disconnect().catch(() => {});
  if (sent) setTimeout(disconnect, 300);
  else disconnect();
  share.textContent = "字幕を共有";
  share.removeAttribute("data-sharing");
  link.value = "";
  details.hidden = qr.hidden = stop.hidden = true;
  retry.hidden = !issue;
  if (issue) status.textContent = "共有に接続できませんでした。";
  else dialog.close();
}

async function startShare() {
  if (sharing) return;
  const { secret, url } = newWatchLink(location.href);
  const run = { controller: new AbortController(), url, ids: new WeakMap(), rowId: 0, revision: 0, peers: new Set() };
  sharing = run;
  stop.hidden = false;
  retry.hidden = true;
  status.textContent = "共有の接続を準備しています。";
  try {
    run.room = await createCaptionRoom(secret);
    const { sdk } = run.room;
    if (sharing !== run) {
      void sdk.disconnect().catch(() => {});
      return;
    }
    const viewerLeft = ({ detail }) => {
      run.peers.delete(detail.uuid);
      updateStatus(run);
    };
    sdk.addEventListener("dataChannelOpen", ({ detail }) => {
      if (sharing !== run) return;
      run.peers.add(detail.uuid);
      sendSnapshot(run, detail.uuid);
      updateStatus(run);
    });
    sdk.addEventListener("dataChannelClose", viewerLeft);
    sdk.addEventListener("peerDisconnected", viewerLeft);
    sdk.addEventListener("reconnecting", () => { run.reconnecting = true; updateStatus(run); });
    sdk.addEventListener("reconnected", () => { run.reconnecting = false; updateStatus(run); });
    sdk.addEventListener("reconnectFailed", () => { if (sharing === run) finishShare(true); });
    await connectCaptionRoom(run.room, true, run.controller.signal);
    if (sharing !== run) return;

    run.observer = new MutationObserver(() => {
      if (!run.peers.size || run.pending) return;
      run.pending = setTimeout(() => {
        run.pending = null;
        if (sharing === run) sendSnapshot(run);
      }, 120);
    });
    run.observer.observe(captions, { subtree: true, childList: true, characterData: true, attributes: true,
      attributeFilter: ["data-partial", "data-unavailable"] });
    run.observer.observe(microphone, { attributes: true, attributeFilter: ["data-state"] });
    run.heartbeat = setInterval(() => sendSnapshot(run), 10_000);
    link.value = url;
    copy.textContent = "コピー";
    details.hidden = false;
    share.textContent = "視聴リンク";
    share.setAttribute("data-sharing", "");
    updateStatus(run);
    void drawQr(run).catch(() => {});
  } catch (error) {
    if (sharing === run) {
      console.warn("Unable to start caption sharing", error.message);
      finishShare(true);
    }
  }
}

share.addEventListener("click", () => {
  if (!dialog.open) dialog.showModal();
  if (!sharing) void startShare();
});
retry.addEventListener("click", () => void startShare());
stop.addEventListener("click", () => finishShare());
link.addEventListener("focus", () => link.select());
copy.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(link.value);
    copy.textContent = "コピー済み";
  } catch {
    link.focus();
    link.select();
  }
});
window.addEventListener("pagehide", () => finishShare());
