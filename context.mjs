const sampleRate = 16_000;
const maximumGap = 5 * sampleRate;
const packetDivider = "⟦815724⟧";
const translatedDivider = /[⟦\[［【〔]\s*[8８]\s*[1１]\s*[5５]\s*[7７]\s*[2２]\s*[4４]\s*[⟧\]］】〕]/u;
const segmenters = new Map();

export function areNeighbors(first, second) {
  return Boolean(first && second && first.source === second.source && second.id === first.id + 1 &&
    second.start - first.end <= maximumGap);
}

export function joinUtterances(first, second) {
  const gap = Math.max(0, Math.min(0.85 * sampleRate, second.start - first.end));
  const audio = new Float32Array(first.audio.length + gap + second.audio.length);
  audio.set(first.audio);
  audio.set(second.audio, first.audio.length + gap);
  return audio;
}

function letters(text) {
  return Array.from(text.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""));
}

function editDistances(source, target) {
  let previous = Uint16Array.from({ length: target.length + 1 }, (_, i) => i);
  let line = new Uint16Array(previous.length);
  for (const [index, letter] of source.entries()) {
    line[0] = index + 1;
    for (let i = 1; i < line.length; i++) {
      line[i] = Math.min(previous[i] + 1, line[i - 1] + 1, previous[i - 1] + (target[i - 1] !== letter));
    }
    [previous, line] = [line, previous];
  }
  return previous;
}

function numbers(text) {
  return (text.normalize("NFKC").match(/[-−+]?\d+(?:[.,:/]\d+)*/g) ?? []).join("|");
}

export function alignRevision(first, second, transcript, language) {
  const left = letters(first);
  const right = letters(second);
  if (left.length < 4 || right.length < 4) return null;

  const whole = letters(transcript);
  const fromLeft = editDistances(left, whole);
  const fromRight = editDistances(right.reverse(), whole.toReversed());
  if (!segmenters.has(language)) segmenters.set(language, new Intl.Segmenter(language, { granularity: "word" }));

  let best = null;
  let cost = Infinity;
  let consumed = 0;
  for (const part of segmenters.get(language).segment(transcript)) {
    consumed += letters(part.segment).length;
    if (!consumed || consumed === whole.length) continue;
    const split = part.index + part.segment.length;
    const newLeft = transcript.slice(0, split).trim();
    const newRight = transcript.slice(split).trim();
    if (!newLeft || !/^[\p{L}\p{N}«“「『(]/u.test(newRight)) continue;

    const leftError = fromLeft[consumed] / left.length;
    const rightError = fromRight[whole.length - consumed] / right.length;
    if (leftError > 0.30 || rightError > 0.30) continue;
    if (numbers(first) !== numbers(newLeft) || numbers(second) !== numbers(newRight)) continue;

    const penalty = /[.!?。！？、,;；:：»”」』]$/u.test(newLeft) ? 0 : 0.01;
    if (leftError + rightError + penalty < cost) {
      cost = leftError + rightError + penalty;
      best = [newLeft, newRight];
    }
  }
  return best;
}

export function translationPacket(texts) {
  // Keep adjacent clauses in the same input and restore line boundaries afterward.
  return texts.map(text => text.replace(/[.。]+$/u, "")).join(` ${packetDivider} `);
}

export function unpackTranslation(text, originals) {
  const rows = text.split(translatedDivider).map(line => line.trim());
  if (rows.length !== originals.length || rows.some(line => !/[\p{L}\p{N}]/u.test(line))) return null;
  return rows.map((line, i) => {
    const original = originals[i];
    if (original && (numbers(original) !== numbers(line) || line.length > original.length * 2.1 + 8 ||
      line.length < original.length * 0.43)) return null;
    if (/[.。]$/u.test(original ?? "") && !/[.!?。！？»”」』]$/u.test(line)) {
      return line + (original.endsWith("。") ? "。" : ".");
    }
    return line;
  });
}
