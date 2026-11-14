/** @jsxImportSource react */
import { useState } from "react";

const MAX = 140;

/** Questions for the panel, upvoted and sorted in the browser. */
export default function Questions({ initial }) {
  const [questions, setQuestions] = useState(initial);
  const [text, setText] = useState("");

  function ask(event) {
    event.preventDefault();
    const question = text.trim();
    if (!question) return;
    setQuestions((current) => [
      ...current,
      { id: Date.now(), text: question, votes: 0, mine: true },
    ]);
    setText("");
  }

  function vote(id) {
    setQuestions((current) =>
      current.map((q) => (q.id === id ? { ...q, votes: q.votes + 1, voted: true } : q)),
    );
  }

  const sorted = [...questions].sort((a, b) => b.votes - a.votes);

  return (
    <div className="questions">
      <ol>
        {sorted.map((q) => (
          <li key={q.id}>
            <button type="button" onClick={() => vote(q.id)} disabled={q.voted} aria-label="Upvote">
              ▲ {q.votes}
            </button>
            <span>
              {q.text}
              {q.mine && <em> (yours)</em>}
            </span>
          </li>
        ))}
      </ol>
      <form onSubmit={ask}>
        <input
          value={text}
          maxLength={MAX}
          onChange={(event) => setText(event.target.value)}
          placeholder="Ask the panel…"
          aria-label="Your question"
        />
        <small>{MAX - text.length}</small>
        <button disabled={!text.trim()}>Ask</button>
      </form>
    </div>
  );
}
