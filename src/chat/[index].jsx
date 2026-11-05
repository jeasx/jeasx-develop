import { hue, initial } from "../@helpers/avatar";
import Layout from "../Layout";
import { ERRORS, MAX_NAME_LENGTH, MAX_TEXT_LENGTH, recentMessages } from "./room";

/**
 * @param {import("../types").RouteProps} props
 */
export default function ({ request, reply }) {
  const messages = recentMessages();
  const lastId = messages.at(-1)?.id ?? 0;
  const name = String(request.cookies["name"] ?? "").slice(0, MAX_NAME_LENGTH);
  // Only known codes, so a link can't put text of its own into the error line.
  const code = String(request.query["error"] ?? "");
  const error = Object.hasOwn(ERRORS, code) ? ERRORS[code] : "";

  // The page shows the latest messages, so it must not come from a cache.
  reply.header("cache-control", "no-store");

  return (
    <Layout
      title="Chat with Server-Sent Events"
      description="A multi-user chat: messages are posted with plain HTTP requests and pushed to everyone via Server-Sent Events."
      css="/chat/index.css"
      script="/chat/index.js"
    >
      <div class="sx">
        <h1>Chat with Server-Sent Events</h1>
        <p>
          Open this page in two windows and start chatting. Sending a message is a normal{" "}
          <code>POST</code> request. The server keeps a list of all open{" "}
          <a href="/sse">Server-Sent Events</a> streams and pushes each new message to every one of
          them. If the connection drops, the browser reconnects with the id of the last message it
          received (<code>Last-Event-ID</code>), and the server sends everything it missed.
        </p>
        <p>
          <small>
            Without JavaScript, the form still works: the page reloads with the new message. The
            last 50 messages of the past hour are kept in the memory of the server, so please be
            nice.
          </small>
        </p>
        <section class="sx-card chat">
          <header>
            <h2 id="presence">Chat</h2>
            <span id="status" class="sx-status" data-state="connecting" role="status">
              Connecting…
            </span>
          </header>
          <ol id="messages" data-last-id={lastId} aria-live="polite">
            {messages.length === 0 && <li class="empty">No messages yet. Say hello!</li>}
            {messages.map((message) => (
              <li data-id={message.id} class={message.name === name ? "own" : undefined}>
                <span class="avatar" style={`--hue: ${hue(message.name)}`} aria-hidden="true">
                  {initial(message.name)}
                </span>
                <div class="bubble">
                  <strong>{message.name}</strong>{" "}
                  <time datetime={message.time}>{formatTime(message.time)}</time>
                  <p>{message.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <footer>
            <form id="chat-form" method="post" action="/chat/send">
              <fieldset role="group">
                <input
                  name="name"
                  value={name}
                  placeholder="Your name"
                  aria-label="Your name"
                  maxlength={MAX_NAME_LENGTH}
                  required
                  style="max-width: 10rem;"
                />
                <input
                  name="text"
                  placeholder="Your message"
                  aria-label="Your message"
                  maxlength={MAX_TEXT_LENGTH}
                  autocomplete="off"
                  required
                  autofocus={Boolean(name)}
                />
                <input type="submit" value="Send" />
              </fieldset>
              <small id="error" role="alert">
                {error}
              </small>
            </form>
          </footer>
        </section>
      </div>
    </Layout>
  );
}

/**
 * The server doesn't know the visitor's time zone: the script shows local times instead.
 *
 * @param {string} time
 */
function formatTime(time) {
  return `${new Date(time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })} UTC`;
}
