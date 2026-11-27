import { toCsv } from "./cities";

export default function () {
  return new Response(toCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="cities.csv"',
    },
  });
}
