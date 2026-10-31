/** @jsxImportSource react */
import { useState } from "react";

export default function Lottery({ title }) {
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [error, setError] = useState("");

  const handleNumberClick = (number) => {
    setError("");
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== number));
    } else if (selectedNumbers.length < 6) {
      setSelectedNumbers([...selectedNumbers, number]);
    } else {
      setError("You can only select 6 numbers.");
    }
  };

  return (
    <div className="lottery">
      {/* The page already has an h1 and an h2 for this section. */}
      <h3>{title}</h3>
      <div className="number-grid">
        {Array.from({ length: 49 }, (_, index) => index + 1).map((number) => (
          <button
            type="button"
            key={number}
            className={`number${selectedNumbers.includes(number) ? " selected" : ""}`}
            aria-pressed={selectedNumbers.includes(number)}
            onClick={() => handleNumberClick(number)}
          >
            {number}
          </button>
        ))}
      </div>
      {selectedNumbers.length > 0 && (
        <div className="selected-numbers">
          <h4>Selected numbers:</h4>
          <ul>
            {selectedNumbers.map((number) => (
              <li key={number}>{number}</li>
            ))}
          </ul>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
