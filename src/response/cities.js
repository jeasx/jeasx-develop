/** Average temperatures in °C of the coldest and the warmest month (the same as in "/svg"). */
export const CITIES = [
  { name: "Berlin", coldest: 0.6, warmest: 19.6 },
  { name: "Madrid", coldest: 6.3, warmest: 25.6 },
  { name: "Oslo", coldest: -4.3, warmest: 16.4 },
  { name: "Sydney", coldest: 13.4, warmest: 23.5 },
];

/** The formats of the cities route, in the order the server prefers them. */
export const OFFERS = ["text/html", "application/json", "text/csv", "text/plain"];

/** The cities as CSV, used by the CSV download and the cities route. */
export function toCsv() {
  const rows = CITIES.map(({ name, coldest, warmest }) => [name, coldest, warmest].join(","));
  return ["name,coldest,warmest", ...rows].join("\n") + "\n";
}
