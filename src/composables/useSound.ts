/**
 * Interface sounds, synthesised with WebAudio so the site ships no audio files.
 * The context is created lazily on the first sound, which always follows a user
 * gesture, so browsers never block it.
 */
import { settings } from './useSettings';

let ctx: AudioContext | null = null;

const audio = () => {
  if (!settings.sound) return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
};

interface Tone {
  freq: number;
  to?: number;
  at?: number;
  dur: number;
  gain: number;
  type?: OscillatorType;
  attack?: number;
}

const play = (tones: Tone[]) => {
  const ac = audio();
  if (!ac) return;
  const now = ac.currentTime;

  for (const tone of tones) {
    const start = now + (tone.at ?? 0);
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.type = tone.type ?? 'sine';
    osc.frequency.setValueAtTime(tone.freq, start);
    if (tone.to) osc.frequency.exponentialRampToValueAtTime(tone.to, start + tone.dur);
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(tone.gain, start + (tone.attack ?? 0.005));
    amp.gain.exponentialRampToValueAtTime(0.0001, start + tone.dur);
    osc.connect(amp).connect(ac.destination);
    osc.start(start);
    osc.stop(start + tone.dur + 0.05);
  }
};

export const sfx = {
  move: () => play([{ freq: 2200, to: 1800, dur: 0.045, gain: 0.05 }]),
  confirm: () =>
    play([
      { freq: 880, dur: 0.12, gain: 0.07 },
      { freq: 1320, at: 0.06, dur: 0.16, gain: 0.06 },
    ]),
  back: () =>
    play([
      { freq: 990, dur: 0.1, gain: 0.06 },
      { freq: 660, at: 0.05, dur: 0.14, gain: 0.05 },
    ]),
  deny: () => play([{ freq: 220, dur: 0.12, gain: 0.06, type: 'triangle' }]),
  notify: () =>
    play([
      { freq: 1568, dur: 0.25, gain: 0.05 },
      { freq: 2093, at: 0.09, dur: 0.35, gain: 0.04 },
    ]),
  trophy: () =>
    play([
      { freq: 1046, dur: 0.3, gain: 0.05 },
      { freq: 1318, at: 0.08, dur: 0.3, gain: 0.05 },
      { freq: 1568, at: 0.16, dur: 0.5, gain: 0.05 },
    ]),
  /** The ethereal chord that plays as the console boots. */
  boot: () =>
    play(
      [261.63, 329.63, 392, 493.88, 587.33].map((freq, i) => ({
        freq,
        at: i * 0.12,
        dur: 3.2,
        gain: 0.035,
        attack: 0.9,
      })),
    ),
};
