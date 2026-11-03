import { PLANETS } from "../@helpers/planets";

export default function () {
  const rows = [
    ["name", "diameter", "moons"],
    ...PLANETS.map(({ name, diameter, moons }) => [name, diameter, moons]),
  ];
  const csv = rows.map((row) => row.join(",")).join("\n") + "\n";
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="planets.csv"',
    },
  });
}
