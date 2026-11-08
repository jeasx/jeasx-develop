/** @jsxImportSource react */
import { useEffect, useReducer } from "react";

const EMOJIS = ["🦊", "🐙", "🦄", "🐸", "🦋", "🐳", "🦁", "🐼"];

/** A small seeded random generator, so server and browser shuffle the same way. */
function random(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

function deal(seed) {
  const next = random(seed);
  const cards = [...EMOJIS, ...EMOJIS].map((emoji, id) => ({ id, emoji }));
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return { seed, cards, open: [], matched: [], moves: 0 };
}

/** All game rules live in one reducer, so the component only dispatches what happened. */
function reducer(state, action) {
  switch (action.type) {
    case "flip": {
      const { open, matched } = state;
      if (open.length === 2 || open.includes(action.id) || matched.includes(action.id)) {
        return state;
      }
      const nextOpen = [...open, action.id];
      if (nextOpen.length < 2) {
        return { ...state, open: nextOpen };
      }
      const [a, b] = nextOpen.map((id) => state.cards.find((card) => card.id === id));
      return a.emoji === b.emoji
        ? { ...state, open: [], matched: [...matched, a.id, b.id], moves: state.moves + 1 }
        : { ...state, open: nextOpen, moves: state.moves + 1 };
    }
    case "hide":
      return { ...state, open: [] };
    case "restart":
      return deal(state.seed + 1);
    default:
      return state;
  }
}

export default function Memory({ seed }) {
  const [state, dispatch] = useReducer(reducer, seed, deal);
  const { cards, open, matched, moves } = state;
  const won = matched.length === cards.length;

  // Two different cards stay visible for a moment, then flip back.
  useEffect(() => {
    if (open.length !== 2) return;
    const timer = setTimeout(() => dispatch({ type: "hide" }), 800);
    return () => clearTimeout(timer);
  }, [open]);

  return (
    <div className="memory">
      <div className="memory-head">
        <span>
          Moves <b>{moves}</b>
        </span>
        <span>
          Pairs <b>{matched.length / 2}</b> / {EMOJIS.length}
        </span>
        <button type="button" className="re-btn ghost" onClick={() => dispatch({ type: "restart" })}>
          ↻ New game
        </button>
      </div>
      <div className="memory-grid">
        {cards.map(({ id, emoji }) => {
          const up = open.includes(id) || matched.includes(id);
          return (
            <button
              type="button"
              key={id}
              className={`memory-card${up ? " up" : ""}${matched.includes(id) ? " matched" : ""}`}
              onClick={() => dispatch({ type: "flip", id })}
              aria-label={up ? emoji : "Hidden card"}
            >
              <span className="memory-inner">
                <span className="memory-back" aria-hidden="true">
                  ⚛
                </span>
                <span className="memory-front" aria-hidden="true">
                  {emoji}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {won && (
        <p className="memory-win" role="status">
          🎉 Solved in {moves} moves!
        </p>
      )}
    </div>
  );
}
