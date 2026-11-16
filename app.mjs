import { createDetector, microphoneLevel, openMicrophone, prepareAudio } from "./audio.mjs";
import { alignRevision, areNeighbors, joinUtterances } from "./context.mjs?v=3";
import { SpeechSegments } from "./segments.mjs?v=5";
import { prepareTranslation, translateCaption, translateInContext } from "./translation.mjs?v=6";
import { languages } from "./whisper-prefix.mjs";

const byId = id => document.getElementById(id);
const status = byId("status");
const statusText = byId("status-text");
const detail = byId("detail");
const download = byId("download");
const toggle = byId("toggle");
const toggleText = byId("toggle-text");
const input = byId("input-language");
const quality = byId("quality");
const fullscreen = byId("fullscreen");
const preparePair = byId("prepare-pair");
const viewport = byId("viewport");
const captions = byId("captions");
const empty = byId("empty");
const follow = byId("follow");
const meter = byId("meter");
const headings = [...byId("language-headings").children];
const privacy = "音声と翻訳は端末内で処理";
const languageNames = { ja: "日本語", en: "英語", fr: "フランス語" };
const states = {
  idle: ["停止中", "開始"],
  starting: ["準備中", "中止"],
  live: ["マイク入力中", "停止"],
  draining: ["字幕を確定中", "停止"],
  error: ["停止中", "開始"],
};

let session = null;
let engine = null;
let draft = null;
let followsLatest = true;

function showState(state, message = privacy) {
  const [label, action] = states[state];
  status.dataset.state = state;
  if (statusText.textContent !== label) statusText.textContent = label;
  if (detail.textContent !== message) detail.textContent = message;
  toggleText.textContent = action;
  toggle.toggleAttribute("data-running", state === "live" || state === "starting");
  toggle.disabled = state === "draining";
  quality.disabled = state === "starting" || state === "live" || state === "draining";
  if (state !== "starting") {
    download.hidden = true;
    preparePair.hidden = true;
  }
  if (state !== "live") meter.style.setProperty("--level", "0");
}

function trackLatest() {
  if (followsLatest) viewport.scrollTop = viewport.scrollHeight;
  follow.hidden = followsLatest;
}

viewport.addEventListener("scroll", () => {
  followsLatest = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 48;
  follow.hidden = followsLatest;
});
follow.addEventListener("click", () => {
  followsLatest = true;
  trackLatest();
});

fullscreen.hidden = !document.fullscreenEnabled;
fullscreen.addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    detail.textContent = "全画面表示に切り替えられませんでした。";
  }
});
document.addEventListener("fullscreenchange", () => {
  const label = document.fullscreenElement ? "全画面表示を終了" : "全画面表示";
  fullscreen.title = label;
  fullscreen.setAttribute("aria-label", label);
  trackLatest();
});

function discardDraft(run, id = draft?.id) {
  if (draft?.run !== run || draft.id !== id) return;
  draft.row.remove();
  draft = null;
  empty.hidden = captions.children.length > 0;
}

function paintCaption(row, translation) {
  for (const cell of row.children) {
    const text = translation[cell.lang];
    cell.textContent = text || "—";
    cell.toggleAttribute("data-unavailable", !text);
    cell.title = text ? "" : "翻訳を取得できませんでした。";
  }
}

function renderCaption(run, clip, source, translation) {
  let row = draft?.run === run && draft.id === clip.id ? draft.row : null;
  if (!row) {
    row = document.createElement("div");
    row.className = "caption-row columns";
    row.setAttribute("role", "listitem");
    for (const language of languages) {
      const cell = document.createElement("p");
      cell.className = "caption";
      cell.lang = language;
      row.append(cell);
    }
    captions.append(row);
  }

  paintCaption(row, translation);
  for (const heading of headings) heading.toggleAttribute("data-current", heading.dataset.language === source);
  row.toggleAttribute("data-partial", !clip.final);
  draft = clip.final ? null : { run, id: clip.id, row };
  empty.hidden = true;
  while (captions.children.length > 80) captions.firstElementChild.remove();
  trackLatest();
  return row;
}

function getEngine(mode) {
  if (engine?.mode === mode) return engine;
  engine?.dispose();
  const worker = new Worker(new URL("./whisper-worker.mjs?v=6", import.meta.url), { type: "module" });
  const waiting = new Map();
  let nextId = 0;
  let resolveReady;
  let rejectReady;
  const ready = new Promise((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });

  function fail(error) {
    engine = null;
    worker.terminate();
    rejectReady(error);
    for (const callback of waiting.values()) callback.reject(error);
    waiting.clear();
  }

  worker.addEventListener("error", event => fail(new Error(event.message || "Recognition worker failed")));
  worker.addEventListener("message", ({ data }) => {
    if (data.type === "progress" && session?.phase === "starting") {
      download.hidden = false;
      if (Number.isFinite(data.value)) download.value = data.value;
      else download.removeAttribute("value");
      if (data.fallback && preparePair.hidden) detail.textContent = "端末に合わせて標準モデルを準備しています。";
    } else if (data.type === "ready") {
      resolveReady(data.model);
    } else if (data.type === "result") {
      waiting.get(data.id)?.resolve(data);
      waiting.delete(data.id);
    } else if (data.type === "error" && data.review) {
      waiting.get(data.id)?.reject(new Error(data.message));
      waiting.delete(data.id);
    } else if (data.type === "error") {
      fail(new Error(data.message));
    }
  });

  engine = {
    mode,
    ready,
    dispose() { fail(new DOMException("Model changed", "AbortError")); },
    transcribe(clip) {
      const id = nextId++;
      return new Promise((resolve, reject) => {
        waiting.set(id, { resolve, reject });
        worker.postMessage({
          type: "transcribe", id, language: clip.language, samples: clip.samples,
          before: clip.before, prior: clip.prior, review: clip.review,
        }, [clip.samples.buffer]);
      });
    },
  };
  worker.postMessage({ type: "load", quality: mode });
  return engine;
}

async function closeCapture(run) {
  for (const track of run.stream?.getTracks() ?? []) track.stop();
  if (run.detector) await run.detector.destroy().catch(() => {});
  if (run.context && run.context.state !== "closed") await run.context.close().catch(() => {});
}

function failSession(run, message, error) {
  if (session !== run) return;
  session = null;
  run.setup.abort();
  discardDraft(run);
  void closeCapture(run);
  showState("error", message);
  if (error) console.warn("Live Captions", error.message);
}

function offerPairSetup(run, source, target, remaining, create) {
  const signal = run.setup.signal;
  return new Promise((resolve, reject) => {
    signal.throwIfAborted();
    const cancel = () => reject(signal.reason);
    signal.addEventListener("abort", cancel, { once: true });
    detail.textContent = `初回設定 ${languageNames[source]} → ${languageNames[target]}（残り${remaining}件）`;
    preparePair.hidden = false;
    preparePair.focus({ preventScroll: true });
    run.prepareNext = () => {
      signal.removeEventListener("abort", cancel);
      run.prepareNext = null;
      preparePair.hidden = true;
      detail.textContent = "翻訳モデルを準備しています。";
      resolve(create());
    };
  });
}

preparePair.addEventListener("click", () => session?.prepareNext?.());

function finishSession(run) {
  if (session !== run || run.phase !== "draining" || run.busy || run.queue.length) return;
  session = null;
  discardDraft(run);
  showState(run.stopReason ? "error" : "idle", run.stopReason);
}

function stopSession(run, reason) {
  if (run.phase === "starting") {
    failSession(run, privacy);
    showState("idle");
    return;
  }
  if (run.phase !== "live") return;
  run.phase = "draining";
  run.stopReason = reason;
  void closeCapture(run);
  showState("draining", "残りの発話を翻訳しています。");
  run.segments.finish();
  finishSession(run);
}

function enqueue(run, clip) {
  run.queue.push(clip);
  if (run.queue.length >= 30 && run.phase === "live") {
    stopSession(run, "処理が発話に追いつかなかったため停止しました。");
  }
  if (!run.busy) void processQueue(run);
}

function rememberCaption(run, record) {
  const first = run.recent.at(-1);
  const before = run.recent.at(-2);
  run.recent.push(record);
  if (run.recent.length > 2) run.recent.shift();
  if (areNeighbors(first, record)) {
    run.review = { before: areNeighbors(before, first) ? before : null, first, second: record };
  }
}

async function reviewCaptions(run, { before, first, second }) {
  const entries = [first, second];
  const preceding = before?.text ?? "";
  const result = await run.recognition.transcribe({
    language: first.source, samples: joinUtterances(first, second), before: preceding, prior: first.text, review: true,
  });
  if (session !== run) return;
  const texts = alignRevision(first.text, second.text, result.text, first.source) ?? entries.map(entry => entry.text);
  const contextual = await translateInContext(first.source, preceding, texts, entries.map(entry => entry.values));
  if (session !== run) return;

  const baseline = await Promise.all(entries.map((entry, i) => entry.text === texts[i] ||
    languages.every(language => contextual[i][language]) ? entry.values : translateCaption(texts[i], entry.source, i === 0 ? preceding : texts[0])));
  if (session !== run) return;

  for (const [i, entry] of entries.entries()) {
    if (!entry.row.isConnected) continue;
    const values = { ...baseline[i], ...contextual[i], [entry.source]: texts[i] };
    if (!languages.every(language => values[language])) continue;
    if (languages.some(language => values[language] !== entry.values[language])) {
      paintCaption(entry.row, values);
      entry.row.dataset.revised = "";
    }
    entry.text = texts[i];
    entry.values = values;
  }
  trackLatest();
}

async function processQueue(run) {
  run.busy = true;
  try {
    while (session === run && (run.queue.length || run.review)) {
      if (!run.queue.length) {
        const job = run.review;
        run.review = null;
        try {
          await reviewCaptions(run, job);
        } catch (error) {
          console.warn("Caption revision skipped", error.message);
        }
        continue;
      }
      const clip = run.queue.shift();
      const audio = clip.final ? clip.samples.slice() : null;
      const previous = run.recent.at(-1);
      const prior = previous && clip.start - previous.end <= 80_000 ? previous.text : "";
      const { language, text } = await run.recognition.transcribe({ ...clip, prior });
      if (session !== run) break;
      if (!language || !text) {
        if (clip.final) discardDraft(run, clip.id);
        continue;
      }
      const preview = run.lastTranslation;
      const reused = preview?.id === clip.id && preview.source === language && preview.text === text;
      const values = reused ? preview.values : await translateCaption(text, language, prior);
      if (session !== run) break;
      const row = renderCaption(run, clip, language, values);
      if (clip.final) {
        rememberCaption(run, { id: clip.id, start: clip.start, end: clip.end, audio, source: language, text, values, row });
      }
      const allTranslated = languages.every(code => values[code]);
      run.lastTranslation = !clip.final && allTranslated ? { id: clip.id, source: language, text, values } : null;
      if (run.phase === "live") {
        showState("live", allTranslated ? `${run.model} · 端末内処理` : "一部の翻訳を取得できませんでした。停止して再開すると再試行できます。");
      }
    }
  } catch (error) {
    failSession(run, "音声認識が止まりました。開始を押して再試行してください。", error);
  } finally {
    run.busy = false;
    finishSession(run);
  }
}

async function startSession() {
  const run = { phase: "starting", queue: [], recent: [], busy: false, setup: new AbortController() };
  session = run;
  showState("starting", quality.value === "high" ? "高精度モデルを準備中。初回は約1.7 GBをダウンロード。" : "初回は音声認識と翻訳のモデルをダウンロードします。");
  download.hidden = false;
  download.removeAttribute("value");
  let errorMessage = "モデルの準備に失敗しました。接続を確認して、もう一度開始してください。";

  try {
    const translations = prepareTranslation((...args) => offerPairSetup(run, ...args), run.setup.signal);
    run.context = new AudioContext();
    const resume = run.context.resume();
    run.recognition = getEngine(quality.value);
    const [MicVAD, , model] = await Promise.all([prepareAudio(), translations, run.recognition.ready, resume]);
    if (session !== run) return;
    run.model = model;

    showState("starting", "ブラウザのマイク使用を許可してください。");
    download.hidden = true;
    run.requestingMicrophone = true;
    const stream = await openMicrophone();
    run.requestingMicrophone = false;
    run.stream = stream;
    if (session !== run) {
      void closeCapture(run);
      return;
    }

    errorMessage = "マイクを初期化できませんでした。入力デバイスを確認して再試行してください。";
    run.segments = new SpeechSegments(clip => enqueue(run, clip), () => !run.busy, () => input.value);
    run.detector = await createDetector(MicVAD, run.context, stream, (probability, samples) => {
      if (session !== run || run.phase !== "live") return;
      meter.style.setProperty("--level", String(microphoneLevel(samples)));
      run.segments.push(probability, samples);
    });
    if (session !== run) {
      void closeCapture(run);
      return;
    }

    await run.detector.start();
    if (session !== run) {
      void closeCapture(run);
      return;
    }
    stream.getAudioTracks()[0].addEventListener("ended", () => {
      if (session === run) stopSession(run, "マイクとの接続が切れました。");
    }, { once: true });
    run.phase = "live";
    empty.textContent = "発話を待っています。";
    showState("live", `${run.model} · 端末内処理`);
  } catch (error) {
    if (error.name === "NotAllowedError" && run.requestingMicrophone) {
      errorMessage = "アドレスバーからマイクを許可し、開始を押してください。";
    } else if (error.name === "NotFoundError") {
      errorMessage = "マイクが見つかりません。接続してから開始してください。";
    } else if (error.name === "NotReadableError") {
      errorMessage = "マイクを開けませんでした。OS のマイク設定を確認してください。";
    }
    failSession(run, errorMessage, error);
  }
}

toggle.addEventListener("click", () => {
  if (session) stopSession(session);
  else void startSession();
});

window.addEventListener("pagehide", () => {
  if (session) stopSession(session);
});

if (!globalThis.Translator?.create || !navigator.mediaDevices?.getUserMedia) {
  showState("error", "翻訳機能を利用できるデスクトップ版 Google Chrome で開いてください。");
  toggle.disabled = true;
} else {
  showState("idle");
}
