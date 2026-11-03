export const WIDTH = 1200;
export const HEIGHT = 630;

/** Color themes for the card; the keys are allowed in the "theme" query parameter. */
export const THEMES = {
  sunset: { from: "#ff5f6d", to: "#ffc371", text: "#ffffff" },
  ocean: { from: "#2193b0", to: "#6dd5ed", text: "#ffffff" },
  forest: { from: "#134e5e", to: "#71b280", text: "#ffffff" },
  night: { from: "#0f2027", to: "#2c5364", text: "#e0f7ff" },
};

/** Limits for the texts, so a long query can't blow up the image. */
export const MAX_TITLE = 80;
export const MAX_SUBTITLE = 120;

/**
 * An Open Graph card (1200 × 630 pixels) drawn as SVG with plain JSX.
 * SVG has no automatic line breaks, so the title is wrapped by hand.
 *
 * @param {{ title: string, subtitle?: string, theme?: keyof typeof THEMES }} props
 */
export default function Card({ title, subtitle = "", theme = "sunset" }) {
  const colors = THEMES[theme] ?? THEMES.sunset;
  const lines = wrap(title, 22).slice(0, 3);
  const fontSize = lines.length > 2 ? 80 : 96;
  const top = 250 - ((lines.length - 1) * fontSize) / 2;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
    >
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color={colors.from} />
          <stop offset="100%" stop-color={colors.to} />
        </linearGradient>
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill="url(#bg)" />
      {/* Decorative circles */}
      <circle cx="1080" cy="80" r="220" fill="#ffffff" opacity="0.12" />
      <circle cx="1150" cy="560" r="140" fill="#ffffff" opacity="0.08" />
      <g fill={colors.text} font-family="Helvetica, Arial, sans-serif">
        {lines.map((line, index) => (
          <text
            x="80"
            y={top + index * fontSize * 1.1}
            font-size={fontSize}
            font-weight="bold"
          >
            {line}
          </text>
        ))}
        {subtitle && (
          <text
            x="80"
            y={top + lines.length * fontSize * 1.1 + 30}
            font-size="40"
            opacity="0.9"
          >
            {truncate(subtitle, 50)}
          </text>
        )}
        <text x="80" y="570" font-size="32" font-weight="bold" opacity="0.85">
          expo.jeasx.dev
        </text>
      </g>
    </svg>
  );
}

/**
 * Splits text into lines of at most `max` characters, breaking at spaces.
 * Words longer than a line are cut, the last line gets an ellipsis if text is left.
 *
 * @param {string} text
 * @param {number} max
 */
function wrap(text, max) {
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (next.length <= max) {
      line = next;
    } else {
      if (line) lines.push(line);
      line = truncate(word, max);
    }
  }
  if (line) lines.push(line);
  if (lines.length > 3) {
    lines[2] = truncate(`${lines[2]} …`, max);
  }
  return lines;
}

/**
 * @param {string} text
 * @param {number} max
 */
function truncate(text, max) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
