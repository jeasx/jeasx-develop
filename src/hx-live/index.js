import "htmx.org";
import "htmx.org/dist/ext/hx-live";

// Global helpers for the hx-live attributes, named specifically for this example.
window.loadJokes = async function (data, category) {
  data.loading = true;
  try {
    const response = await fetch(`/jokes/api/${category}?amount=${data.counter}`);
    if (!response.ok) throw new Error(response.statusText);
    data.jokes = await response.json();
    data.error = "";
  } catch {
    data.jokes = [];
    data.error = "The jokes couldn't be loaded. Please try again.";
  } finally {
    data.loading = false;
  }
};

window.jokeToListItem = function (text) {
  const li = document.createElement("li");
  li.textContent = text;
  return li.outerHTML;
};
