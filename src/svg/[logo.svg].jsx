/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  const text = request.query["text"] || "";
  reply.type("image/svg+xml; charset=utf-8");
  return (
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
      {["white", "blue", "orange", "yellow", "green", "red"].map((color, index) => (
        <text x={index} y={40 + (index % 2)} style={`font: italic 40px serif; fill: ${color};`}>
          {text}
        </text>
      ))}
    </svg>
  );
}
