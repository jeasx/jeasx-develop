export default function Image({
  src,
  width = undefined,
  height = undefined,
  position = undefined,
  immutable = false,
  ...rest
}) {
  return (
    <img
      width={width}
      height={height}
      src={imagePath({ src, width, height, position, immutable })}
      {...rest}
    />
  );
}

export function imagePath({ src, width, height, position = "", immutable = false }) {
  const params = new URLSearchParams({
    src,
    width: width || "",
    height: height || "",
    position: position || "",
  });
  if (!immutable) {
    params.set("revision", process.env.BUILD_ID);
  }
  return `/sharp/image?${params}`;
}
