/** @jsxImportSource react */
import { useEffect, useRef, useState } from "react";

const STEPS = 16;

// Every sound is synthesized with the Web Audio API, so there are no files to load.
const TRACKS = [
  {
    name: "Kick",
    color: "#58c4dc",
    play(ctx, time) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(40, time + 0.3);
      gain.gain.setValueAtTime(1, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.3);
    },
  },
  {
    name: "Snare",
    color: "#a78bfa",
    play(ctx, time) {
      noise(ctx, time, 0.2, 1000, 0.6);
    },
  },
  {
    name: "Hi-hat",
    color: "#fbbf24",
    play(ctx, time) {
      noise(ctx, time, 0.05, 7000, 0.3);
    },
  },
  {
    name: "Bleep",
    color: "#f472b6",
    play(ctx, time, step) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = [440, 554, 659, 880][step % 4];
      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
      osc.connect(gain).connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.15);
    },
  },
];

function noise(ctx, time, duration, cutoff, volume) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = buffer;
  filter.type = "highpass";
  filter.frequency.value = cutoff;
  gain.gain.setValueAtTime(volume, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(time);
}

export default function Beats({ pattern, tempo: initialTempo }) {
  const [grid, setGrid] = useState(pattern);
  const [tempo, setTempo] = useState(initialTempo);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);

  // Refs hold values the timer reads without restarting it on every change.
  const audio = useRef(null);
  const gridRef = useRef(grid);
  gridRef.current = grid;

  useEffect(() => {
    if (!playing) {
      setStep(-1);
      return;
    }
    let current = 0;
    const id = setInterval(
      () => {
        const ctx = audio.current;
        gridRef.current.forEach((row, track) => {
          if (row[current]) TRACKS[track].play(ctx, ctx.currentTime, current);
        });
        setStep(current);
        current = (current + 1) % STEPS;
      },
      60000 / tempo / 4,
    );
    return () => clearInterval(id);
  }, [playing, tempo]);

  function toggle() {
    // Browsers only allow audio after a user gesture, so the context starts here.
    audio.current ??= new AudioContext();
    audio.current.resume();
    setPlaying((value) => !value);
  }

  function flip(track, index) {
    setGrid((current) =>
      current.map((row, t) => (t === track ? row.map((on, i) => (i === index ? !on : on)) : row)),
    );
  }

  return (
    <div className="beats">
      <div className="beats-head">
        <button type="button" className={`re-btn${playing ? " playing" : ""}`} onClick={toggle}>
          {playing ? "■ Stop" : "▶ Play"}
        </button>
        <label>
          <span>
            <b>{tempo}</b> BPM
          </span>
          <input
            type="range"
            min="70"
            max="180"
            value={tempo}
            onChange={(event) => setTempo(Number(event.target.value))}
          />
        </label>
        <button
          type="button"
          className="re-btn ghost"
          onClick={() => setGrid(TRACKS.map(() => Array(STEPS).fill(false)))}
        >
          Clear
        </button>
      </div>
      <div className="beats-grid">
        {TRACKS.map(({ name, color }, track) => (
          <div className="beats-row" key={name} style={{ "--c": color }}>
            <span className="beats-name">{name}</span>
            {grid[track].map((on, index) => (
              <button
                type="button"
                key={index}
                className={`beats-pad${on ? " on" : ""}${index === step ? " now" : ""}${index % 4 === 0 ? " beat" : ""}`}
                aria-pressed={on}
                aria-label={`${name} step ${index + 1}`}
                onClick={() => flip(track, index)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
