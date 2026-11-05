/** @jsxImportSource react */
import { useState } from "react";

const NUMBERS = Array.from({ length: 49 }, (_, index) => index + 1);
const PICKS = 6;

/** Picks `count` distinct numbers from 1 to 49, sorted ascending. */
function draw(count = PICKS) {
  const pool = [...NUMBERS];
  const result = [];
  for (let i = 0; i < count; i++) {
    const [number] = pool.splice(Math.floor(Math.random() * pool.length), 1);
    result.push(number);
  }
  return result.sort((a, b) => a - b);
}

export default function Lottery({ title }) {
  const [selected, setSelected] = useState([]);
  const [drawn, setDrawn] = useState([]);

  const isFull = selected.length === PICKS;
  const matches = selected.filter((n) => drawn.includes(n));

  function toggle(number) {
    setDrawn([]);
    setSelected((current) =>
      current.includes(number)
        ? current.filter((n) => n !== number)
        : current.length < PICKS
          ? [...current, number].sort((a, b) => a - b)
          : current,
    );
  }

  function quickPick() {
    setDrawn([]);
    setSelected(draw());
  }

  function clear() {
    setDrawn([]);
    setSelected([]);
  }

  return (
    <div className="lottery">
      {/* The page already has an h1 and an h2 for this section. */}
      <div className="lottery-head">
        <h3>{title}</h3>
        <span className="lottery-count" aria-live="polite">
          {selected.length} / {PICKS} selected
        </span>
      </div>
      <div className="lottery-grid">
        {NUMBERS.map((number) => {
          const isSelected = selected.includes(number);
          const isDrawn = drawn.includes(number);
          return (
            <button
              type="button"
              key={number}
              className={[
                "lottery-number",
                isSelected && "selected",
                isDrawn && "drawn",
                isSelected && isDrawn && "match",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={isSelected}
              disabled={isFull && !isSelected}
              onClick={() => toggle(number)}
            >
              {number}
            </button>
          );
        })}
      </div>
      <div className="lottery-actions">
        <button type="button" className="lottery-btn" onClick={quickPick}>
          🎲 Quick pick
        </button>
        <button
          type="button"
          className="lottery-btn"
          onClick={clear}
          disabled={selected.length === 0}
        >
          Clear
        </button>
        <button
          type="button"
          className="lottery-btn lottery-primary"
          onClick={() => setDrawn(draw())}
          disabled={!isFull}
        >
          Draw
        </button>
      </div>
      {drawn.length > 0 && (
        <div className="lottery-result" aria-live="polite">
          <ul>
            {drawn.map((number, index) => (
              <li
                key={number}
                className={selected.includes(number) ? "match" : undefined}
                style={{ animationDelay: `${index * 120}ms` }}
              >
                {number}
              </li>
            ))}
          </ul>
          <p>
            {matches.length === 0
              ? "No match this time. Try again!"
              : `${matches.length} ${matches.length === 1 ? "match" : "matches"}${
                  matches.length >= 3 ? " - you win! 🎉" : "."
                }`}
          </p>
        </div>
      )}
    </div>
  );
}
