import { languages } from "./whisper-prefix.mjs";

const sdkUrl = "https://cdn.jsdelivr.net/gh/steveseguin/ninjasdk@v1.6.2/vdoninja-sdk.min.js";
const protocol = "live-captions/1";
const phases = ["waiting", "starting", "live", "paused", "ended"];
export const sharedCaptionLimit = 16;
const cellLimit = 1500;
const encoder = new TextEncoder();
let sdkLoading;

function loadSdk() {
  sdkLoading ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = sdkUrl;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      if (globalThis.VDONinjaSDK) resolve(globalThis.VDONinjaSDK);
      else reject(new Error("The WebRTC SDK did not load"));
    };
    script.onerror = () => reject(new Error("Could not download the WebRTC SDK"));
    document.head.append(script);
  }).catch(error => {
    sdkLoading = null;
    throw error;
  });
  return sdkLoading;
}

export function newWatchLink(base) {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const secret = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const url = new URL("watch.html", base);
  url.hash = secret;
  return { secret, url: url.href };
}

export function validWatchSecret(secret) {
  return /^[A-Za-z0-9_-]{43}$/.test(secret);
}

export async function createCaptionRoom(secret) {
  if (!validWatchSecret(secret)) throw new Error("Invalid watch link");
  const [SDK, digest] = await Promise.all([loadSdk(), crypto.subtle.digest("SHA-256", encoder.encode(secret))]);
  const id = Array.from(new Uint8Array(digest).subarray(0, 12), byte => byte.toString(16).padStart(2, "0")).join("");
  const sdk = new SDK({ password: secret, salt: "vdo.ninja" });
  return { sdk, room: "captions_" + id, stream: "live_" + id };
}

export async function connectCaptionRoom({ sdk, room, stream }, broadcast, signal) {
  if (signal.aborted) return;
  await sdk.connect();
  if (signal.aborted) return;
  await sdk.joinRoom({ room });
  if (signal.aborted) return;
  if (broadcast) return sdk.announce({ streamID: stream });
  return sdk.view(stream, { video: false, audio: false, downloads: false });
}

export function captionPacket(revision, phase, source, rows) {
  const packet = {
    protocol, revision, phase, source,
    rows: rows.slice(-sharedCaptionLimit).map(({ id, partial, text }) => ({
      id, partial,
      text: Object.fromEntries(languages.map(code => [code, text[code].slice(0, cellLimit)])),
    })),
  };
  // Keep packets below older WebRTC implementations' message limits.
  while (packet.rows.length > 1 && encoder.encode(JSON.stringify(packet)).length > 30_000) packet.rows.shift();
  return packet;
}

export function readCaptionPacket(packet) {
  if (!packet || packet.protocol !== protocol || !Number.isSafeInteger(packet.revision) || packet.revision < 1 ||
    !phases.includes(packet.phase) || !(packet.source === null || languages.includes(packet.source)) ||
    !Array.isArray(packet.rows) || packet.rows.length > sharedCaptionLimit) return null;

  let previous = 0;
  for (const row of packet.rows) {
    if (!row || !Number.isSafeInteger(row.id) || row.id <= previous || typeof row.partial !== "boolean" ||
      !row.text || !languages.every(code => typeof row.text[code] === "string" && row.text[code].length <= cellLimit)) return null;
    previous = row.id;
  }
  return packet;
}
