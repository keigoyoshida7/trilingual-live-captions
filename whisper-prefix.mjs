export const languages = ["ja", "en", "fr"];

export function whisperPrompt(config, language) {
  const languageTokens = new Map(languages.map(code => [config.lang_to_id[`<|${code}|>`], code]));
  const allLanguageTokens = Object.values(config.lang_to_id);
  const transcribe = config.task_to_id.transcribe;
  const noTimestamps = config.no_timestamps_token_id;
  const prefix = [config.decoder_start_token_id];
  let unsupported = false;

  if (language !== "auto") prefix.push(config.lang_to_id[`<|${language}|>`], transcribe, noTimestamps);

  function process(inputIds, logits) {
    const position = inputIds[0].length;
    const scores = logits.data;

    // The pinned JS runtime defaults to English without a language prompt.
    // Let Whisper score the language token from the audio in its first decoder step.
    if (position === 1) {
      const best = allLanguageTokens.reduce((a, b) => scores[a] > scores[b] ? a : b);
      const supported = [...languageTokens.keys()].reduce((a, b) => scores[a] > scores[b] ? a : b);
      unsupported = !languageTokens.has(best) && scores[best] - scores[supported] > 2.2;
      scores.fill(-Infinity);
      scores[unsupported ? config.eos_token_id : supported] = 0;
    } else if (position === 2 || position === 3) {
      scores.fill(-Infinity);
      scores[position === 2 ? transcribe : noTimestamps] = 0;
    } else {
      for (const token of config.suppress_tokens ?? []) scores[token] = -Infinity;
      if (position === 4) {
        for (const token of config.begin_suppress_tokens ?? []) scores[token] = -Infinity;
      }
      scores.fill(-Infinity, noTimestamps + 1);
    }
    return logits;
  }

  return {
    prefix,
    process,
    languageOf: ids => unsupported ? null : languageTokens.get(ids[1]) ?? null,
  };
}
