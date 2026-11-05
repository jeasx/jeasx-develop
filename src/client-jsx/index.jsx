import { jsxToString } from "jsx-async-runtime";
import fetchPlanet from "./components/fetchPlanet";
import Planet from "./components/Planet";
import Planets from "./components/Planets";

globalThis.renderPlanets = async (container, names) => {
  if (names.length === 0) {
    container.innerHTML = await jsxToString(<p>Pick at least one planet.</p>);
    return;
  }
  const start = performance.now();
  container.innerHTML = await jsxToString(<Planets names={names} />);
  // Render every planet on its own, so each shows up as soon as its data arrives.
  const results = await Promise.allSettled(
    [...container.querySelectorAll("[data-planet]")].map(async (slot) => {
      try {
        slot.outerHTML = await jsxToString(<Planet planet={fetchPlanet(slot.dataset.planet)} />);
      } catch (error) {
        slot.textContent = `${slot.dataset.planet} couldn't be loaded.`;
        throw error;
      }
    }),
  );
  const loaded = results.filter(({ status }) => status === "fulfilled").length;
  container.querySelector(".stats").textContent =
    `${loaded} of ${names.length} planets rendered in ${Math.round(performance.now() - start)} ms`;
};

// Clicking a planet (or pressing Enter or Space on it) flips its card
// and turns all other cards back to their front.
function flip(event) {
  const card = event.target.closest(".planet:not(.placeholder)");
  if (!card) return;
  if (event.type === "keydown") {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
  }
  const flipped = !card.classList.contains("flipped");
  for (const other of document.querySelectorAll(".planet.flipped")) {
    setFlipped(other, false);
  }
  setFlipped(card, flipped);
}

function setFlipped(card, flipped) {
  card.classList.toggle("flipped", flipped);
  card.setAttribute("aria-pressed", String(flipped));
  card.querySelector(".front").setAttribute("aria-hidden", String(flipped));
  card.querySelector(".back").setAttribute("aria-hidden", String(!flipped));
}
document.addEventListener("click", flip);
document.addEventListener("keydown", flip);
