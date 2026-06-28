import type { SoundDef } from "../types";

export function clampVolume(v: number) { return Math.max(0, Math.min(1, v)); }
export function fadeSteps(from: number, to: number, steps: number) {
  const n = Math.max(1, steps);
  const out: number[] = [];
  for (let i = 1; i <= n; i++) out.push(from + ((to - from) * i) / n);
  return out;
}
export function resolveSound(id: string, defs: SoundDef[]) {
  return defs.find((d) => d.id === id) ?? null;
}

function noiseBuffer(ctx: AudioContext, color: string) {
  const len = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    if (color === "brown") { last = (last + 0.02 * white) / 1.02; d[i] = last * 3.5; }
    else if (color === "pink") { b0 = 0.99765 * b0 + white * 0.099; b1 = 0.963 * b1 + white * 0.2965; b2 = 0.57 * b2 + white * 1.0526; d[i] = (b0 + b1 + b2 + white * 0.1848) * 0.2; }
    else d[i] = white * 0.4;
  }
  return buf;
}

export function createSoundEngine() {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let nodes: AudioScheduledSourceNode[] = [];
  let timer: number | null = null;

  function ensure() {
    if (!ctx) {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
    }
    return ctx!;
  }

  function stopNodes() {
    nodes.forEach((n) => { try { n.stop(); } catch {} });
    nodes = [];
  }

  function play(def: SoundDef, volume = 0.6) {
    const c = ensure();
    if (c.state === "suspended") c.resume();
    stopNodes();
    const p = def.params as any;
    const color = (p.color as string) || "white";
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c, color);
    src.loop = true;
    let out: AudioNode = src;
    if (p.filterHz && p.filterHz > 0) {
      const f = c.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = p.filterHz;
      out.connect(f); out = f;
    }
    if (def.type === "wave" || def.type === "fan") {
      const lfoGain = c.createGain();
      out.connect(lfoGain);
      const lfo = c.createOscillator();
      const depth = c.createGain();
      lfo.frequency.value = (p.lfoRateHz as number) || 0.2;
      depth.gain.value = (p.lfoDepth as number) || 0.3;
      lfoGain.gain.value = 1 - ((p.lfoDepth as number) || 0.3);
      lfo.connect(depth); depth.connect(lfoGain.gain); lfo.start();
      nodes.push(lfo);
      out = lfoGain;
    }
    if (def.type === "drone") {
      const osc = c.createOscillator();
      osc.frequency.value = (p.baseHz as number) || 110;
      const og = c.createGain(); og.gain.value = 0.2;
      osc.connect(og); og.connect(master!); osc.start(); nodes.push(osc);
    }
    out.connect(master!);
    src.start(); nodes.push(src);
    fade(volume, 600);
  }

  function fade(to: number, ms: number) {
    if (!ctx || !master) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(clampVolume(to), ctx.currentTime + ms / 1000);
  }

  function stop(fadeMs = 800) {
    if (!ctx || !master) return;
    fade(0, fadeMs);
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => stopNodes(), fadeMs + 50);
  }

  function timerStop(seconds: number) {
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => stop(4000), seconds * 1000);
  }

  return { play, stop, fade, timerStop, setVolume: (v: number) => fade(v, 300) };
}
