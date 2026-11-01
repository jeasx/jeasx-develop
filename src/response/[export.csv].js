import { PLANETS } from "../@helpers/planets";

export default function () {
  const rows = [
    ["Planet", "Diameter (km)", "Moons"],
    ...PLANETS.map(({ name, diameter, moons }) => [name, diameter, moons]),
  ];
  const csv = rows.map((row) => row.join(",")).join("\n");
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="planets.csv"',
    },
  });
}
