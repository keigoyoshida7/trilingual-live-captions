// Silero v5 sends 512 samples per frame at 16 kHz, or 32 ms of audio.
const leadFrames = 6;
const tailFrames = 4;
const endSilence = 14;
const shortPause = 4;
const softLimit = 152;
const hardLimit = 224;
const firstPreview = 76;
const previewInterval = 68;
const onset = 0.52;
const release = 0.35;
const minSpeech = 6;

function joinFrames(frames) {
  const samples = new Float32Array(frames.reduce((length, frame) => length + frame.length, 0));
  let offset = 0;
  for (const frame of frames) {
    samples.set(frame, offset);
    offset += frame.length;
  }
  return samples;
}

export class SpeechSegments {
  constructor(onClip, canPreview, inputLanguage) {
    this.onClip = onClip;
    this.canPreview = canPreview;
    this.inputLanguage = inputLanguage;
    this.lead = [];
    this.frames = [];
    this.id = 0;
    this.voiceFrames = 0;
    this.silence = 0;
    this.nextPreview = firstPreview;
  }

  push(probability, frame) {
    if (!this.frames.length && probability < onset) {
      this.lead.push(frame);
      if (this.lead.length > leadFrames) this.lead.shift();
      return;
    }

    if (!this.frames.length) {
      this.language = this.inputLanguage();
      this.frames = this.lead;
      this.lead = [];
    }

    this.frames.push(frame);
    if (probability >= onset) this.voiceFrames += 1;
    this.silence = probability <= release ? this.silence + 1 : 0;

    const frames = this.frames.length;
    if (this.silence >= endSilence || frames >= hardLimit || (frames >= softLimit && this.silence >= shortPause)) {
      this.finish();
      return;
    }

    if (frames >= this.nextPreview && this.silence === 0 && this.voiceFrames >= minSpeech && this.canPreview()) {
      this.onClip({ id: this.id, final: false, language: this.language, samples: joinFrames(this.frames) });
      this.nextPreview = frames + previewInterval;
    }
  }

  finish() {
    const skip = Math.max(0, this.silence - tailFrames);
    const frames = this.frames.slice(0, this.frames.length - skip);
    const voiced = this.voiceFrames;
    const id = this.id++;
    const language = this.language;
    this.lead = skip ? this.frames.slice(-Math.min(skip, leadFrames)) : [];
    this.frames = [];
    this.voiceFrames = 0;
    this.silence = 0;
    this.nextPreview = firstPreview;

    if (voiced >= minSpeech) this.onClip({ id, final: true, language, samples: joinFrames(frames) });
  }
}
