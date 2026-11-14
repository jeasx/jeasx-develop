const STATUS = {
  page: "IN PAGE",
  connecting: "CONNECTING",
  streaming: "STREAMING",
  idle: "IDLE",
  error: "ERROR",
};

const pad = (n) => `#${String(n).padStart(3, "0")}`;
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

/**
 * Telemetry of the streamed course, below the game. The server renders it for
 * the first page; the browser renders it again whenever a chunk arrives.
 */
export default function StreamInfo({
  status,
  request,
  first,
  last,
  chunk = null,
  total = 0,
  requests = 0,
  buffered = 0,
}) {
  return (
    <>
      <div class="stream-head">
        <i class={`led ${status}`} />
        <span class="state">{STATUS[status]}</span>
        <code>{request}</code>
      </div>
      <dl class="stream-stats">
        <div>
          <dt>In page</dt>
          <dd>
            {pad(first)}–{pad(last)}
          </dd>
        </div>
        <div>
          <dt>Last chunk</dt>
          <dd>{chunk ? `${pad(chunk.index)} ${chunk.biome} · ${kb(chunk.bytes)}` : "from HTML"}</dd>
        </div>
        <div>
          <dt>Streamed</dt>
          <dd>{kb(total)}</dd>
        </div>
        <div>
          <dt>Requests</dt>
          <dd>{requests}</dd>
        </div>
        <div>
          <dt>Buffered</dt>
          <dd>{buffered} chunks</dd>
        </div>
      </dl>
    </>
  );
}
