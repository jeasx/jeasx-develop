import Layout from "../Layout";
import { EXPERIMENT, FLAGS, PATH, bucket } from "./flags";
import { results, track } from "./stats";

/**
 * @param {import("../types").RouteProps & {
 *   visitor: string,
 *   variant: import("./flags").Variant,
 *   flags: Record<string, boolean>
 * }} props
 */
export default function ({ request, visitor, variant, flags }) {
  track("views", variant, visitor);
  const content = EXPERIMENT.variants[variant];
  const query = /** @type {Record<string, unknown>} */ (request.query ?? {});

  return (
    <Layout
      title="Feature flags and A/B testing"
      description="Assign visitors to variants on the server and roll out features step by step."
    >
      <h1>Feature flags and A/B testing</h1>
      <p>
        A guard gives each visitor a random id in a signed cookie. A hash of this id decides which
        variant of the experiment the visitor sees and which features are turned on. As everything
        happens on the server, the page doesn't flicker like with client-side testing tools, and
        visitors without JavaScript take part as well.
      </p>

      {flags.banner && (
        <p role="status">
          <mark>New: our grinders now come with a two-year warranty!</mark>
        </p>
      )}

      <article class="center">
        <h2>{content.headline}</h2>
        <p>Conical burrs, 40 grind settings and a quiet motor.</p>
        {query["bought"] !== undefined ? (
          <p role="status">Thanks for your purchase! (It was counted, but nothing was bought.)</p>
        ) : (
          <form method="post" action={`${PATH}/buy`}>
            <button class="btn btn-primary" type="submit">
              {flags.checkout ? `${content.button} with the new checkout` : content.button}
            </button>
          </form>
        )}
        {flags.reviews && (
          <blockquote>
            "Best grinder I ever had." <small>- a happy customer</small>
          </blockquote>
        )}
      </article>

      <h2>Your assignment</h2>
      <p>
        Visitor id <code>{visitor}</code> sees variant <strong>{variant}</strong>.{" "}
        <a href={`${PATH}?reset`}>Start as new visitor</a> to get a new id, and maybe another
        variant.
      </p>
      <table>
        <thead>
          <tr>
            <th>Flag</th>
            <th>Rollout</th>
            <th>Your bucket</th>
            <th>State</th>
            <th>Preview</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(FLAGS).map(([name, { description, rollout }]) => (
            <tr>
              <td>
                <code>{name}</code>
                <br />
                <small>{description}</small>
              </td>
              <td>{rollout}%</td>
              <td>{bucket(visitor, name)}</td>
              <td>{flags[name] ? "on" : "off"}</td>
              <td>
                <a href={`${PATH}?flag=${name}`}>Turn on</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        <small>
          A flag is on if your bucket (0 to 99) is below its rollout. Raising the rollout from 20%
          to 50% keeps it on for everyone who had it before. Preview links turn a flag on for one
          request, e.g. for testers.
        </small>
      </p>

      <h2>Results</h2>
      <table>
        <thead>
          <tr>
            <th>Variant</th>
            <th>Headline</th>
            <th>Visitors</th>
            <th>Bought</th>
            <th>Rate</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(EXPERIMENT.variants).map(([name, { headline }]) => {
            const { views, conversions, rate } = results(name);
            return (
              <tr>
                <td>{name}</td>
                <td>{headline}</td>
                <td>{views}</td>
                <td>{conversions}</td>
                <td>{rate.toFixed(1)}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p>
        <small>
          Each visitor counts once per column. The counts live in memory and start over when the
          server restarts.
        </small>
      </p>
    </Layout>
  );
}
