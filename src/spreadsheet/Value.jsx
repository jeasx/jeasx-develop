import { format } from "./formula";

/**
 * The value shown on top of a cell's input. The server renders it inside <Sheet>, the
 * browser re-renders it for changed cells ("./index.jsx"), where `changed` lets it light up.
 *
 * @param {{ cell: string, value?: number | string, changed?: boolean }} props
 */
export default function Value({ cell, value, changed = false }) {
  // Numbers align right and errors stand out, like in any spreadsheet.
  const kind = typeof value === "number" ? "number" : value?.startsWith("#") ? "error" : "text";
  return (
    <output data-cell={cell} class={`${kind}${changed ? " changed" : ""}`}>
      {format(value)}
    </output>
  );
}
