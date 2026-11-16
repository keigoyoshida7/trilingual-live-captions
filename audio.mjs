const runtime = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/";
const assets = "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.31/dist/";
let library;

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.crossOrigin = "anonymous";
    script.onload = resolve;
    script.onerror = () => {
      script.remove();
      reject(new Error(`Could not load ${url}`));
    };
    document.head.append(script);
  });
}

export function prepareAudio() {
  library ??= loadScript(`${runtime}ort.wasm.min.js`)
    .then(() => loadScript(`${assets}bundle.min.js`))
    .then(() => globalThis.vad.MicVAD)
    .catch(error => {
      library = null;
      throw error;
    });
  return library;
}

export function openMicrophone() {
  return navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    video: false,
  });
}

export function createDetector(MicVAD, context, stream, onFrame) {
  return MicVAD.new({
    audioContext: context,
    getStream: async () => stream,
    startOnLoad: false,
    model: "v5",
    baseAssetPath: assets,
    onnxWASMBasePath: runtime,
    ortConfig(ort) { ort.env.wasm.numThreads = 1; },
    onFrameProcessed({ isSpeech }, samples) { onFrame(isSpeech, samples); },
  });
}

export function microphoneLevel(samples) {
  let energy = 0;
  for (const sample of samples) energy += sample * sample;
  const db = 10 * Math.log10(energy / samples.length);
  return Math.min(1, Math.max(0, (db + 57) / 45));
}
