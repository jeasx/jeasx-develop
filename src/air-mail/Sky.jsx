import { HEIGHT, SUN, WIDTH } from "./shared";

const round = (n) => Math.round(n * 10) / 10;

/** A row of hills far away, drawn by the browser; it scrolls slower than the landscape. */
function hills(camera, factor, base, amp, seed) {
  const shift = camera * factor;
  let d = `M0,${HEIGHT}`;
  for (let x = 0; x <= WIDTH; x += 16) {
    const w = x + shift;
    const y =
      base - amp * (0.5 + 0.3 * Math.sin(w / 47 + seed) + 0.2 * Math.sin(w / 19 + seed * 2));
    d += `L${x},${round(y)}`;
  }
  return `${d}L${WIDTH},${HEIGHT}Z`;
}

/**
 * The sun glows with a breathing halo and a slowly turning ring of rays. The
 * sky is rendered for every frame, so the clock drives it instead of CSS.
 */
function Sun({ clock }) {
  const breath = Math.sin(clock * 1.3);
  const rays = [];
  for (let n = 0; n < 16; n++) {
    const angle = (n / 16) * Math.PI * 2 + clock * 0.08;
    const long = n % 2 === 0;
    const length = (long ? 46 : 30) + Math.sin(clock * 2 + n * 1.7) * 4;
    const spread = long ? 0.07 : 0.05;
    const point = (a, r) => `${round(SUN.x + Math.cos(a) * r)},${round(SUN.y + Math.sin(a) * r)}`;
    rays.push(
      `M${point(angle - spread, 12)}L${point(angle, length)}L${point(angle + spread, 12)}Z`,
    );
  }
  return (
    <g class="sun">
      <circle class="glow" cx={SUN.x} cy={SUN.y} r={round(46 + breath * 4)} />
      <path class="rays" d={rays.join("")} opacity={round(0.5 + breath * 0.15)} />
      <circle class="halo" cx={SUN.x} cy={SUN.y} r={round(17 + breath * 1.5)} />
      <circle class="disc" cx={SUN.x} cy={SUN.y} r="11" />
    </g>
  );
}

const CLOUDS = [
  { x: 30, y: 26, s: 1.1 },
  { x: 150, y: 46, s: 0.8 },
  { x: 250, y: 18, s: 1.3 },
  { x: 350, y: 56, s: 0.9 },
  { x: 440, y: 34, s: 1 },
];
const SKY = WIDTH + 160;

/**
 * The sky behind the streamed landscape: sun, drifting clouds and two rows of
 * distant hills. The browser renders it for every frame.
 */
export default function Sky({ camera, clock }) {
  return (
    <>
      <rect class="sky" width={WIDTH} height={HEIGHT} />
      <Sun clock={clock} />
      {CLOUDS.map((c) => {
        const travel = c.x - camera * 0.25 * c.s + clock * 3 * c.s;
        const x = round((((travel % SKY) + SKY) % SKY) - 80);
        return (
          <g class="cloud" transform={`translate(${x} ${c.y}) scale(${c.s})`}>
            <ellipse cx="0" cy="0" rx="16" ry="6" />
            <ellipse cx="-8" cy="-3" rx="8" ry="6" />
            <ellipse cx="6" cy="-5" rx="9" ry="7" />
          </g>
        );
      })}
      <path class="hills far" d={hills(camera, 0.15, 128, 40, 1.7)} />
      <path class="hills near" d={hills(camera, 0.35, 140, 30, 4.2)} />
    </>
  );
}
