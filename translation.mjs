import { languages } from "./whisper-prefix.mjs";

const translators = new Map();
const pairs = languages.flatMap(source => languages.filter(target => target !== source).map(target => [source, target]));

export function prepareTranslation() {
  // Downloads can require the activation from the Start click. Create every pair here.
  const pending = pairs.map(([sourceLanguage, targetLanguage]) => {
    const key = `${sourceLanguage}-${targetLanguage}`;
    if (!translators.has(key)) {
      const request = Translator.create({ sourceLanguage, targetLanguage }).catch(error => {
        translators.delete(key);
        throw error;
      });
      translators.set(key, request);
    }
    return translators.get(key);
  });
  return Promise.all(pending);
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
