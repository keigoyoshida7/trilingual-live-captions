import { whisperPrompt } from "./whisper-prefix.mjs";

const library = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";
const gpuModel = "onnx-community/whisper-small";
const cpuModel = "onnx-community/whisper-base";
let recognizer;

async function initialize() {
  const { pipeline, env } = await import(library);
  env.allowLocalModels = false;
  env.useBrowserCache = true;
  env.backends.onnx.wasm.numThreads = 1;

  let adapter;
  try {
    adapter = await navigator.gpu?.requestAdapter();
  } catch {
    // Some browsers expose the API with no usable adapter.
  }

  const progress = new Map();
  function report({ status, file, loaded, total }) {
    if (status !== "progress" || !file?.endsWith(".onnx") || !total) return;
    progress.set(file, { loaded, total });
    let downloaded = 0;
    let expected = 0;
    for (const part of progress.values()) {
      downloaded += part.loaded;
      expected += part.total;
    }
    if (progress.size > 1) postMessage({ type: "progress", value: Math.min(99, Math.floor(100 * downloaded / expected)) });
  }

  if (adapter) {
    try {
      return await load(pipeline, gpuModel, "webgpu", {
        encoder_model: adapter.features.has("shader-f16") ? "fp16" : "q4",
        decoder_model_merged: "q4",
      }, report);
    } catch (error) {
      console.warn("Whisper WebGPU unavailable", error.message);
      progress.clear();
      postMessage({ type: "progress", value: null });
    }
  }

  return load(pipeline, cpuModel, "wasm", "q8", report);
}

async function load(pipeline, model, device, dtype, progress_callback) {
  const instance = await pipeline("automatic-speech-recognition", model, { device, dtype, progress_callback });
  try {
    await recognize(instance, new Float32Array(16_000), "en", 2);
  } catch (error) {
    await instance.dispose();
    throw error;
  }
  return instance;
}

async function recognize(instance, samples, language, maxTokens = 104) {
  const { model, processor, tokenizer } = instance;
  const { input_features } = await processor(samples);
  const prompt = whisperPrompt(model.generation_config, language);

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
  const detected = prompt.languageOf(tokens);
  const text = tokenizer.decode(tokens, { skip_special_tokens: true }).replace(/\s+/gu, " ").trim();
  return { language: detected, text: detected && /[\p{L}\p{N}]/u.test(text) ? text : "" };
}

self.onmessage = async ({ data }) => {
  const { type, id } = data;
  try {
    if (type === "load") {
      recognizer = await initialize();
      postMessage({ type: "ready" });
    } else if (type === "transcribe") {
      const result = await recognize(recognizer, data.samples, data.language);
      postMessage({ type: "result", id, ...result });
    }
  } catch (error) {
    postMessage({ type: "error", id, message: error.message });
  }
};
