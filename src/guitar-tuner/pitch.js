/** Note names within an octave, starting at C. */
export const NOTES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];

/** Reference pitch of A4 in Hz. */
export const A4 = 440;

/** The six open strings of a guitar in standard tuning, from low to high. */
export const STRINGS = [
  { name: "E", octave: 2, midi: 40 },
  { name: "A", octave: 2, midi: 45 },
  { name: "D", octave: 3, midi: 50 },
  { name: "G", octave: 3, midi: 55 },
  { name: "B", octave: 3, midi: 59 },
  { name: "E", octave: 4, midi: 64 },
].map((string) => ({ ...string, frequency: frequencyOf(string.midi) }));

/** Notes closer than this many cents count as in tune. */
export const IN_TUNE = 5;

/** @param {number} midi */
export function frequencyOf(midi) {
  return A4 * 2 ** ((midi - 69) / 12);
}

/**
 * The nearest note of a frequency and how many cents (1/100 semitone) it is off.
 *
 * @param {number} frequency
 */
export function noteOf(frequency) {
  const exact = 69 + 12 * Math.log2(frequency / A4);
  const midi = Math.round(exact);
  return {
    name: NOTES[((midi % 12) + 12) % 12],
    octave: Math.floor(midi / 12) - 1,
    midi,
    cents: Math.round((exact - midi) * 100),
  };
}

/**
 * The string whose open pitch is nearest to a frequency, measured in semitones.
 *
 * @param {number} frequency
 */
export function nearestString(frequency) {
  const distance = (string) => Math.abs(Math.log2(frequency / string.frequency));
  return STRINGS.reduce((best, string) => (distance(string) < distance(best) ? string : best));
}

/**
 * Detects the fundamental frequency of a buffer of samples with autocorrelation:
 * a periodic signal matches itself best when shifted by one period. Returns null
 * for silence or noise. Covers about 60 to 1000 Hz, enough for a guitar.
 *
 * @param {Float32Array} samples
 * @param {number} sampleRate
 */
export function detectPitch(samples, sampleRate) {
  const size = samples.length;
  let rms = 0;
  for (let i = 0; i < size; i++) rms += samples[i] * samples[i];
  // Phone microphones without automatic gain are quiet, so the threshold is low.
  if (Math.sqrt(rms / size) < 0.003) return null;

  const minLag = Math.floor(sampleRate / 1000);
  const maxLag = Math.min(Math.floor(sampleRate / 60), size >> 1);
  // Normalized correlation for each lag, so short and long periods compare fairly.
  const correlation = new Float32Array(maxLag + 2);
  for (let lag = minLag; lag <= maxLag + 1; lag++) {
    let sum = 0;
    let energy = 0;
    for (let i = 0; i < size - lag; i++) {
      sum += samples[i] * samples[i + lag];
      energy += samples[i] * samples[i] + samples[i + lag] * samples[i + lag];
    }
    correlation[lag] = energy ? (2 * sum) / energy : 0;
  }

  // Take the first peak that is nearly as high as the best one: later peaks at
  // two or three periods are just as high and would give octave errors.
  let best = 0;
  for (let lag = minLag; lag <= maxLag; lag++) best = Math.max(best, correlation[lag]);
  if (best < 0.8) return null;
  let lag = minLag;
  while (
    lag < maxLag &&
    !(
      correlation[lag] >= 0.9 * best &&
      correlation[lag] >= correlation[lag - 1] &&
      correlation[lag] >= correlation[lag + 1]
    )
  ) {
    lag++;
  }

  // Parabolic interpolation between the neighbors for a period below one sample.
  const [a, b, c] = [correlation[lag - 1], correlation[lag], correlation[lag + 1]];
  const shift = a - 2 * b + c ? (a - c) / (2 * (a - 2 * b + c)) : 0;
  return sampleRate / (lag + shift);
}
