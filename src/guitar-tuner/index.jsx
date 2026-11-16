import { jsxToString } from "jsx-async-runtime";
import Gauge from "./Gauge";
import { STRINGS, detectPitch, nearestString, noteOf } from "./pitch";
import Strings from "./Strings";

const display = document.getElementById("display");
const listen = /** @type {HTMLButtonElement} */ (document.getElementById("listen"));
const hint = document.getElementById("hint");

/** @type {AudioContext | null} */
let audio = null;
/** @type {MediaStream | null} */
let stream = null;
let frame = 0;
/** Detected frequency, smoothed over the last frames to calm the needle. */
let frequency = null;
/** Frames without a pitch; the display keeps the last note for a moment. */
let silence = 0;
/** Reference tone being played, as index into STRINGS. */
let playing = null;
/** @type {{ stop(): void } | null} */
let tone = null;

function context() {
  audio ??= new AudioContext();
  return audio;
}

/**
 * Tells iOS (Safari 17+) what the audio is for: "playback" keeps the tones audible even
 * with the ringer switched to silent, "play-and-record" is needed while the microphone listens.
 *
 * @param {"playback" | "play-and-record"} type
 */
function session(type) {
  const audioSession = /** @type {any} */ (navigator).audioSession;
  if (audioSession) audioSession.type = type;
}

/** What the display shows at the moment, to skip renders which wouldn't change anything. */
let shown = "";

async function render() {
  const note = frequency ? noteOf(frequency) : null;
  const active = frequency ? STRINGS.indexOf(nearestString(frequency)) : null;
  // Rendering is the expensive part (Safari is slow with the SVG filters of the dial),
  // so only render when the visible values changed.
  const state = JSON.stringify([note, frequency?.toFixed(1), active, playing]);
  if (state === shown) return;
  shown = state;
  display.innerHTML = await jsxToString(
    <>
      <Gauge note={note} frequency={frequency} />
      <Strings active={active} playing={playing} />
    </>,
  );
}

async function start() {
  // Safari only starts audio within the tap itself, so create and resume the context
  // before waiting for the microphone permission; awaiting first would leave it suspended.
  session("play-and-record");
  const ctx = context();
  const resumed = ctx.resume();
  listen.disabled = true;
  hint.textContent = "Waiting for the microphone…";
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      // Processing meant for speech would distort the guitar.
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
  } catch {
    listen.disabled = false;
    hint.textContent = "No microphone access. You can still tune by ear with the reference tones.";
    return;
  }
  // Don't block on the promise: if Safari keeps it pending, the loop below resumes later.
  resumed.catch(() => {});
  listen.disabled = false;
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 4096;
  // Safari only processes nodes which lead to the output, otherwise the analyser
  // delivers stale samples. A muted gain completes the path without making a sound.
  const mute = ctx.createGain();
  mute.gain.value = 0;
  ctx.createMediaStreamSource(stream).connect(analyser).connect(mute).connect(ctx.destination);
  const samples = new Float32Array(analyser.fftSize);
  listen.classList.add("on");
  hint.textContent = "Listening… pluck one string at a time.";

  let last = 0;
  const loop = async (/** @type {number} */ now) => {
    if (!stream) return;
    // About 20 measurements per second are plenty for a tuner and keep phones cool.
    if (now - last < 50) {
      frame = requestAnimationFrame(loop);
      return;
    }
    last = now;
    // iOS suspends ("interrupts") audio e.g. after a phone call or when the app was hidden.
    if (ctx.state !== "running") ctx.resume();
    analyser.getFloatTimeDomainData(samples);
    const detected = detectPitch(samples, ctx.sampleRate);
    if (detected) {
      silence = 0;
      // Jumps of more than a semitone start fresh, small changes are smoothed.
      frequency =
        frequency && Math.abs(Math.log2(detected / frequency)) < 1 / 12
          ? frequency * 0.7 + detected * 0.3
          : detected;
    } else if (++silence > 10) {
      frequency = null;
    }
    await render();
    if (stream) frame = requestAnimationFrame(loop);
  };
  frame = requestAnimationFrame(loop);
}

async function stop() {
  cancelAnimationFrame(frame);
  stream?.getTracks().forEach((track) => track.stop());
  stream = null;
  frequency = null;
  session("playback");
  listen.classList.remove("on");
  hint.textContent = "Standard tuning E A D G B E, A4 = 440 Hz.";
  await render();
}

/** Seconds between two plucks of a repeating reference tone. */
const REPEAT = 4;

/**
 * Plucks the reference tone of a string once: a few harmonics with a pluck-like decay.
 *
 * @param {number} index
 * @param {number} when Start time on the audio clock.
 */
function pluck(index, when) {
  const ctx = context();
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, when);
  // A short but not instant attack: a jump from silence would be heard as a click.
  // The level is as loud as possible for weak phone speakers, yet the harmonics summed up
  // (1 + 0.7 + 0.45 + 0.25 = 2.4) stay below full scale: 0.4 × 2.4 = 0.96, so it never crackles.
  // A new pluck only starts when the previous one has faded, so they don't add up.
  gain.gain.linearRampToValueAtTime(0.4, when + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, when + REPEAT);
  gain.connect(ctx.destination);
  // Strong overtones: phone speakers hardly reproduce the low fundamentals (82 Hz for
  // the low E), the ear still hears the pitch from the harmonics, like on a real string.
  return [1, 2, 3, 4].map((harmonic, i) => {
    const oscillator = ctx.createOscillator();
    const level = ctx.createGain();
    oscillator.frequency.value = STRINGS[index].frequency * harmonic;
    level.gain.value = [1, 0.7, 0.45, 0.25][i];
    oscillator.connect(level).connect(gain);
    oscillator.start(when);
    oscillator.stop(when + REPEAT);
    return oscillator;
  });
}

/**
 * Plucks a string again and again until stopped. Each pluck is scheduled on the
 * audio clock ahead of time, so the rhythm stays steady even if the timer is late.
 *
 * @param {number} index
 */
function repeat(index) {
  if (!stream) session("playback");
  const ctx = context();
  ctx.resume();
  let next = ctx.currentTime;
  let oscillators = [];
  const schedule = () => {
    while (next < ctx.currentTime + 0.5) {
      // Keep the previous pluck too, it may still be ringing.
      oscillators = [...oscillators.slice(-3), ...pluck(index, next)];
      next += REPEAT;
    }
  };
  schedule();
  const timer = setInterval(schedule, 200);
  return {
    stop() {
      clearInterval(timer);
      oscillators.forEach((oscillator) => oscillator.stop());
    },
  };
}

listen.addEventListener("click", () => (stream ? stop() : start()));

/**
 * Plays or silences the reference tone of the pressed string.
 *
 * @param {Event} event
 */
async function press(event) {
  const button = /** @type {Element} */ (event.target).closest("[data-string]");
  if (!(button instanceof HTMLElement)) return;
  const index = Number(button.dataset.string);
  tone?.stop();
  // Pressing the repeating string again silences it, another string takes over.
  if (playing === index) {
    playing = null;
    tone = null;
  } else {
    playing = index;
    tone = repeat(index);
  }
  await render();
  /** @type {HTMLElement} */ (display.querySelector(`[data-string="${index}"]`)).focus();
}

// While tuning, the strings are rendered anew every frame, and Safari on iOS swallows
// clicks on such changing content. So taps act on release; keyboard activation fires
// a click without a pointer (detail 0), so that still counts.
display.addEventListener("pointerup", (event) => {
  if (event.button === 0) press(event);
});
display.addEventListener("click", (event) => {
  if (event.detail === 0) press(event);
});
