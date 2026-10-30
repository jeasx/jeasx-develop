import { signal } from "@preact/signals";

const time = signal(new Date());

// Tick only in the browser: on the server this module is imported for rendering,
// where a timer would keep running forever (and pile up with every reload in dev).
if (typeof window !== "undefined") {
  setInterval(() => {
    time.value = new Date();
  }, 500);
}

export { time };
