export default function () {
  return Response.json({
    framework: "Jeasx",
    generated: new Date().toISOString(),
    features: ["JSX", "Streaming", "Response", "Guards"],
  });
}
