import { languages } from "./whisper-prefix.mjs";

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

export async function translateCaption(text, source) {
  const results = await Promise.allSettled(languages.map(async target => {
    if (target === source) return text;
    const key = `${source}-${target}`;
    const translator = await translators.get(key);
    try {
      return await translator.translate(text);
    } catch (error) {
      translators.delete(key);
      translator.destroy();
      throw error;
    }
  }));

  return Object.fromEntries(languages.map((code, i) => [code, results[i].value?.trim() || null]));
}
