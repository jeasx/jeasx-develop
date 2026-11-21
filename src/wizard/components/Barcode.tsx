/** Decorative bars derived from the reference, so every booking gets its own barcode. */
export default function Barcode({ value }: { value: string }) {
  const bars = [...value.repeat(3)].map((char, i) => 1 + ((char.charCodeAt(0) * (i + 7)) % 4));
  return (
    <div class="barcode" aria-hidden="true">
      {bars.map((width) => (
        <span style={`flex-grow: ${width}`} />
      ))}
    </div>
  );
}
