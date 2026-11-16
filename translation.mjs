import { languages } from "./whisper-prefix.mjs";
import { translationPacket, unpackTranslation } from "./context.mjs?v=3";
import { protectTerminology } from "./dot-area-terms.mjs?v=6";

const translators = new Map();
const pairs = languages.flatMap(source => languages.filter(target => target !== source).map(target => [source, target]));

async function getTranslator(sourceLanguage, targetLanguage) {
  const key = `${sourceLanguage}-${targetLanguage}`;
  if (!translators.has(key)) {
    const request = Translator.create({ sourceLanguage, targetLanguage }).catch(error => {
      translators.delete(key);
      throw error;
    });
    translators.set(key, request);
  }
  return translators.get(key);
}

export async function prepareTranslation(requestGesture, signal) {
  // Chrome can consume the Start click when preparing a new language pair.
  const results = await Promise.allSettled(pairs.map(pair => getTranslator(...pair)));
  let remaining = results.filter(result => result.status === "rejected").length;
  for (let i = 0; i < results.length; i++) {
    signal.throwIfAborted();
    const result = results[i];
    if (result.status === "fulfilled") continue;
    if (result.reason?.name !== "NotAllowedError") throw result.reason;
    const [source, target] = pairs[i];
    await requestGesture(source, target, remaining, () => getTranslator(source, target));
    remaining -= 1;
  }
}

async function translate(text, source, target, prior = "") {
  if (target === source) return text;
  const key = `${source}-${target}`;
  const translator = await translators.get(key);
  try {
    const natural = await translator.translate(text);
    const guarded = protectTerminology(text, source, target, prior);
    if (!guarded) return natural;
    const corrected = guarded.correct(natural);
    if (corrected.complete) return corrected.text;
    const restored = guarded.restore(await translator.translate(guarded.input));
    return restored ?? corrected.text;
  } catch (error) {
    translators.delete(key);
    translator?.destroy();
    throw error;
  }
}

export async function translateCaption(text, source, prior = "") {
  const results = await Promise.allSettled(languages.map(target => translate(text, source, target, prior)));
  return Object.fromEntries(languages.map((code, i) => [code, results[i].value?.trim() || null]));
}

export async function translateInContext(source, before, texts, previousTranslations) {
  const offset = before ? 1 : 0;
  const packet = translationPacket(before ? [before, ...texts] : texts);
  const results = await Promise.allSettled(languages.map(async target => {
    if (target === source) return texts;
    const translated = await translate(packet, source, target);
    const originals = previousTranslations.map(row => row[target]);
    if (offset) originals.unshift(null);
    return unpackTranslation(translated, originals)?.slice(offset);
  }));
  return texts.map((_, row) => Object.fromEntries(languages.flatMap((code, index) => {
    const text = results[index].value?.[row];
    return text ? [[code, text]] : [];
  })));
}
