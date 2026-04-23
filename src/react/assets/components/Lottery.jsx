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
      <h1>{title}</h1>
      <div className="number-grid">
        {Array.from({ length: 49 }, (_, index) => index + 1).map((number) => (
          <div
            key={number}
            className={`number ${selectedNumbers.includes(number) ? "selected" : ""}`}
            onClick={() => handleNumberClick(number)}
          >
            {number}
          </div>
        ))}
      </div>
      {selectedNumbers.length > 0 && (
        <div className="selected-numbers">
          <h3>Selected Numbers:</h3>
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
