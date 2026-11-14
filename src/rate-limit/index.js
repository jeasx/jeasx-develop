const $ = (id) => /** @type {HTMLElement} */ (document.getElementById(id));
const tokens = [...document.querySelectorAll(".rl-token")];
const MAX_LOG = 12;

let count = 0;
/** @type {ReturnType<typeof setInterval> | undefined} */
let refillTimer;
/** @type {ReturnType<typeof setInterval> | undefined} */
let autoTimer;

/** Shows the given number of tokens, as reported by the server. */
function showTokens(remaining, limit) {
  tokens.forEach((token, index) => token.toggleAttribute("data-full", index < remaining));
  $("remaining").textContent = `${remaining} / ${limit} tokens`;
}

/**
 * The server only reports the state on each response, so predict the refill
 * in between from "RateLimit-Reset" (seconds until the bucket is full).
 */
function predictRefill(remaining, limit, reset) {
  clearInterval(refillTimer);
  if (reset <= 0 || remaining >= limit) {
    return;
  }
  const perSecond = (limit - remaining) / reset;
  let level = remaining;
  refillTimer = setInterval(() => {
    level = Math.min(limit, level + perSecond / 4);
    showTokens(Math.floor(level), limit);
    if (level >= limit) {
      clearInterval(refillTimer);
    }
  }, 250);
}

function log(status, text) {
  const item = document.createElement("li");
  item.dataset.status = String(status);
  const time = new Date().toLocaleTimeString("en-GB");
  item.innerHTML = `<b></b><span></span><small></small>`;
  item.querySelector("b").textContent = `#${++count} ${status}`;
  item.querySelector("span").textContent = text;
  item.querySelector("small").textContent = time;
  $("log").prepend(item);
  while ($("log").children.length > MAX_LOG) {
    $("log").lastElementChild?.remove();
  }
}

async function request() {
  try {
    const response = await fetch("/rate-limit/api/quote", {
      cache: "no-store",
    });
    const limit = Number(response.headers.get("ratelimit-limit"));
    const remaining = Number(response.headers.get("ratelimit-remaining"));
    const reset = Number(response.headers.get("ratelimit-reset"));
    const body = await response.json();
    if (response.ok) {
      log(response.status, body.quote);
    } else {
      log(
        response.status,
        `Too many requests, retry after ${response.headers.get("retry-after")} s`,
      );
    }
    showTokens(remaining, limit);
    predictRefill(remaining, limit, reset);
  } catch (error) {
    log("error", String(error));
  }
}

document.querySelectorAll("[data-burst]").forEach((button) =>
  button.addEventListener("click", () => {
    const burst = Number(/** @type {HTMLElement} */ (button).dataset.burst);
    for (let i = 0; i < burst; i++) {
      request();
    }
  }),
);

$("auto").addEventListener("change", (event) => {
  clearInterval(autoTimer);
  if (/** @type {HTMLInputElement} */ (event.target).checked) {
    request();
    autoTimer = setInterval(request, 500);
  }
});

// Makes this file a module, so TypeScript keeps its top-level names out of the global scope.
export {};
