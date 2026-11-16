import { languages, whisperPrompt } from "./whisper-prefix.mjs?v=3";
import { correctTerminology, isStandaloneTerm, terminologyHints } from "./dot-area-terms.mjs?v=7";

const whisperLibrary = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";
const graniteLibrary = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.2";
const graniteId = "ibm-granite/granite-speech-5.0-2b-ONNX";
const languageNames = { ja: "Japanese", en: "English", fr: "French" };
let recognizer;

function configureRuntime({ env }) {
  env.allowLocalModels = false;
  env.useBrowserCache = true;
  env.backends.onnx.wasm.numThreads = 1;
}

function downloadReporter(fileCount) {
  const progress = new Map();
  return ({ status, file, loaded, total }) => {
    if (status !== "progress" || !file?.endsWith(".onnx") || !total) return;
    progress.set(file, { loaded, total });
    if (progress.size < fileCount) return;
    let downloaded = 0;
    let expected = 0;
    for (const part of progress.values()) {
      downloaded += part.loaded;
      expected += part.total;
    }
    postMessage({ type: "progress", value: Math.min(99, Math.floor(100 * downloaded / expected)) });
  };
}

function classifyText(text, detectAll) {
  if (/[\p{Script=Hiragana}\p{Script=Katakana}]/u.test(text)) return "ja";
  const guesses = detectAll(text);
  const supported = guesses.find(guess => languages.includes(guess.lang));
  return supported && guesses[0].accuracy - supported.accuracy <= 0.14 ? supported.lang : null;
}

async function loadGranite() {
  const [runtime, { detectAll }] = await Promise.all([
    import(graniteLibrary), import("https://cdn.jsdelivr.net/npm/tinyld@1.3.4/+esm"),
  ]);
  configureRuntime(runtime);
  const { AutoProcessor, GraniteSpeechForConditionalGeneration } = runtime;
  const [processor, model] = await Promise.all([
    AutoProcessor.from_pretrained(graniteId),
    GraniteSpeechForConditionalGeneration.from_pretrained(graniteId, {
      device: "webgpu",
      dtype: { audio_encoder: "q4", embed_tokens: "q4f16", decoder_model_merged: "q4f16" },
      progress_callback: downloadReporter(3),
    }),
  ]);
  return {
    name: "Granite Speech 5.0 2B",
    dispose: () => model.dispose(),
    async transcribe(samples, language, before, maxTokens, prior = "") {
      const given = language === "auto" ? "" : `The speech is in ${languageNames[language]}. `;
      const context = before ? `Context from preceding speech: ${JSON.stringify(before.slice(-220))}. ` : "";
      const hints = maxTokens > 2 ? ` Keywords: ${terminologyHints(language, before || prior)}.` : "";
      const instruction = `${given}${context}Transcribe the speech verbatim in its original language with proper punctuation and capitalization.${hints}`;
      const request = processor.tokenizer.apply_chat_template([{ role: "user", content: `<|audio|>${instruction}` }], {
        add_generation_prompt: true, tokenize: false,
      });
      const inputs = await processor(request, samples);
      const result = await model.generate({ ...inputs, max_new_tokens: maxTokens, do_sample: false });
      const [output] = processor.batch_decode(result.slice(null, [inputs.input_ids.dims.at(-1), null]), { skip_special_tokens: true });
      const text = output.replace(/\s+/gu, " ").trim();
      return { text, language: language === "auto" ? classifyText(text, detectAll) : language };
    },
  };
}

async function loadWhisper(runtime, size, device, dtype) {
  const instance = await runtime.pipeline("automatic-speech-recognition", `onnx-community/whisper-${size}`, {
    device, dtype, progress_callback: downloadReporter(2),
  });
  const { model, processor, tokenizer } = instance;

  return {
    name: size === "small" ? "Whisper Small" : "Whisper Base",
    dispose: () => instance.dispose(),
    async transcribe(samples, language, before, maxTokens) {
      const { input_features } = await processor(samples);
      const config = model.generation_config;
      // Whisper's previous-text token precedes the context and start-of-transcript tokens.
      const priorTokens = before ? tokenizer.encode(` ${before.trim()}`, { add_special_tokens: false })
        .filter(token => token < config.eos_token_id).slice(-56) : [];
      const context = priorTokens.length ? [config.no_timestamps_token_id - 2, ...priorTokens] : [];
      const prompt = whisperPrompt(config, language, context);
      const result = await model.generate({
        inputs: input_features,
        decoder_input_ids: prompt.prefix,
        logits_processor: [prompt.process],
        forced_bos_token_id: null,
        forced_eos_token_id: null,
        begin_suppress_tokens: null,
        return_timestamps: false,
        max_new_tokens: maxTokens,
        do_sample: false,
      });
      const tokens = result.tolist()[0].map(Number);
      const text = tokenizer.decode(tokens.slice(prompt.prefix.length), { skip_special_tokens: true }).replace(/\s+/gu, " ").trim();
      return { text, language: prompt.languageOf(tokens) };
    },
  };
}

async function warm(engine) {
  try {
    const warmupSamples = engine.name === "Granite Speech 5.0 2B" ? 80_000 : 16_000;
    await engine.transcribe(new Float32Array(warmupSamples), "en", "", 2);
    return engine;
  } catch (error) {
    await engine.dispose();
    throw error;
  }
}

async function initialize(quality) {
  const adapter = await navigator.gpu?.requestAdapter().catch(() => null);
  const canUseFP16 = adapter?.features.has("shader-f16");
  if (quality === "high" && canUseFP16) {
    try {
      return await warm(await loadGranite());
    } catch (error) {
      console.warn("Granite Speech WebGPU unavailable", error.message);
      postMessage({ type: "progress", value: null, fallback: true });
    }
  }

  const runtime = await import(whisperLibrary);
  configureRuntime(runtime);
  if (adapter) {
    try {
      return await warm(await loadWhisper(runtime, "small", "webgpu", {
        encoder_model: canUseFP16 ? "fp16" : "q4", decoder_model_merged: "q4",
      }));
    } catch (error) {
      console.warn("Whisper WebGPU unavailable", error.message);
      postMessage({ type: "progress", value: null, fallback: true });
    }
  }
  return warm(await loadWhisper(runtime, "base", "wasm", "q8"));
}

self.onmessage = async ({ data }) => {
  const { type, id } = data;
  try {
    if (type === "load") {
      recognizer = await initialize(data.quality);
      postMessage({ type: "ready", model: recognizer.name });
    } else if (type === "transcribe") {
      const result = await recognizer.transcribe(data.samples, data.language, data.before, data.review ? 180 : 104, data.prior);
      const language = result.language ?? (isStandaloneTerm(result.text) ? "en" : null);
      const text = language && /[\p{L}\p{N}]/u.test(result.text) ? correctTerminology(result.text, language, data.prior || data.before) : "";
      postMessage({ type: "result", id, language, text });
    }
  } catch (error) {
    postMessage({ type: "error", id, review: Boolean(data.review), message: error.message });
  }
};
