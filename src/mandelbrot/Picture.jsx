/**
 * One SVG for a list of paths, each drawing horizontal one pixel lines in its color.
 * The width and height attributes give standalone files their size, on the page CSS scales it.
 */
export default function Picture({ paths, width, height, label = "", ...props }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      shape-rendering="crispEdges"
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : "true"}
    >
      {paths.map(({ color, d }) => (
        <path stroke={color} d={d} />
      ))}
    </svg>
  );
}
