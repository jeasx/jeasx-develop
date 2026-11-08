import { useEffect, useState } from "preact/hooks";

/**
 * A palette generator: press Space or the button for new colors, lock the ones you like,
 * click a swatch to copy its hex code.
 */
export default function Palette({ colors }) {
  const [swatches, setSwatches] = useState(() => colors.map((hex) => ({ hex, locked: false })));
  const [copied, setCopied] = useState("");

  function generate() {
    // Spread the hues around one random base, so the colors go well together.
    const base = Math.random() * 360;
    setSwatches((current) =>
      current.map((swatch, index) =>
        swatch.locked
          ? swatch
          : {
              ...swatch,
              hex: hslToHex(
                (base + index * (360 / current.length) * 0.4) % 360,
                45 + Math.random() * 35,
                35 + Math.random() * 35,
              ),
            },
      ),
    );
  }

  function toggle(index) {
    setSwatches((current) =>
      current.map((swatch, i) => (i === index ? { ...swatch, locked: !swatch.locked } : swatch)),
    );
  }

  async function copy(hex) {
    setCopied((await writeClipboard(hex)) ? hex : `!${hex}`);
  }

  // Space generates a new palette, unless the focus is on a control that uses it.
  useEffect(() => {
    function onKey(event) {
      if (event.code === "Space" && !event.target.closest("button, input, textarea, select")) {
        event.preventDefault();
        generate();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // The "Copied" hint disappears after a moment.
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(""), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <div class="pr-card">
      <div class="pr-palette">
        {swatches.map(({ hex, locked }, index) => (
          <div
            key={index}
            class="pr-swatch"
            style={{ background: hex, color: isLight(hex) ? "#111" : "#fff" }}
          >
            <button
              type="button"
              class="pr-hex"
              onClick={() => copy(hex)}
              aria-label={`Copy ${hex}`}
            >
              {copied === hex ? "Copied!" : copied === `!${hex}` ? "Copy failed" : hex}
            </button>
            <button
              type="button"
              class="pr-lock"
              onClick={() => toggle(index)}
              aria-pressed={locked}
              aria-label={locked ? `Unlock ${hex}` : `Lock ${hex}`}
            >
              {locked ? "🔒" : "🔓"}
            </button>
          </div>
        ))}
      </div>
      <div class="pr-toolbar">
        <button type="button" class="pr-btn" onClick={generate}>
          🎨 New palette
        </button>
        <span class="pr-hint">
          or press <kbd>Space</kbd> · click a code to copy it
        </span>
      </div>
    </div>
  );
}

/**
 * The Clipboard API only exists in secure contexts (HTTPS or localhost),
 * so fall back to a hidden textarea and execCommand elsewhere.
 */
async function writeClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return (
    "#" +
    [f(0), f(8), f(4)]
      .map((x) =>
        Math.round(x * 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

/** Picks dark or light text by the perceived brightness of the background. */
function isLight(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return r * 0.299 + g * 0.587 + b * 0.114 > 150;
}
