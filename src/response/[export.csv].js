const PLANETS = [
  ["Planet", "Diameter (km)", "Moons"],
  ["Mercury", 4879, 0],
  ["Venus", 12104, 0],
  ["Earth", 12756, 1],
  ["Mars", 6792, 2],
  ["Jupiter", 142984, 95],
  ["Saturn", 120536, 146],
  ["Uranus", 51118, 28],
  ["Neptune", 49528, 16],
];

export default function () {
  const csv = PLANETS.map((row) => row.join(",")).join("\n");
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="planets.csv"',
    },
  });
}
