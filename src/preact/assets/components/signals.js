import { signal } from "@preact/signals";

const time = signal(new Date());

setInterval(() => {
  time.value = new Date();
}, 500);

export { time };
