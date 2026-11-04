import Layout from "../Layout";
import { LOCALES } from "./messages";

// Unknown locales and deeper paths are left to [404].
const LOCALE_PATTERN = new URLPattern({ pathname: "/i18n/:locale{/}?" });

// The numbers from the hint, as one-click examples.
const EXAMPLES = [0, 1, 2, 5, 22, 1000000];

/**
 * Renders "/i18n/<locale>". The guard has already put the locale and the translation
 * function into "this", so this route and its components only read them.
 *
 * @this {import("../types").ThisContext & import("./messages").I18nContext}
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  if (!this.t || !LOCALE_PATTERN.test({ pathname: request.path })) {
    return;
  }

  const t = this.t;
  const count = parseCount(request.query["count"]);

  return (
    <Layout
      lang={this.lang}
      title={t("title")}
      description={t("description")}
      css="/i18n/index.css"
    >
      <LanguageSwitcher count={count} />
      <h1>{t("headline")}</h1>
      <p class="lead">{t("intro")}</p>
      <p class="hint">{t("detect")}</p>
      <div class="i18n-grid">
        <article class="i18n-card">
          <h2>{t("pluralHeadline")}</h2>
          <p>{t("pluralHint")}</p>
          <p class="examples">
            {EXAMPLES.map((example) => (
              <a href={`?count=${example}`} aria-current={example === count ? "true" : undefined}>
                {new Intl.NumberFormat(this.lang).format(example)}
              </a>
            ))}
          </p>
          <p class="plural-result">
            <span class="apples" aria-hidden="true">
              🍎
            </span>
            <strong>{t("apples", { count })}</strong>
            <small class="category">
              {t("category")}{" "}
              <a
                href="https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules/select"
                title="Intl.PluralRules.select()"
              >
                <code>{new Intl.PluralRules(this.lang).select(count)}</code>
              </a>
            </small>
          </p>
        </article>
        <article class="i18n-card">
          <Formats />
        </article>
      </div>
    </Layout>
  );
}

/**
 * Links to the same page in all languages and keeps the entered count.
 *
 * @this {import("../types").ThisContext & import("./messages").I18nContext}
 * @param {{ count: number }} props
 */
function LanguageSwitcher({ count }) {
  return (
    // µCSS lays out <nav> for the page header, so use a plain block with the same role.
    <div role="navigation" aria-label={this.t("language")} class="languages">
      {Object.entries(LOCALES).map(([locale, name]) => (
        <a
          href={`/i18n/${locale}?count=${count}`}
          hreflang={locale}
          lang={locale}
          aria-current={locale === this.lang ? "page" : undefined}
        >
          {name}
        </a>
      ))}
    </div>
  );
}

/**
 * Formats the same values for the current locale with the Intl API.
 *
 * @this {import("../types").ThisContext & import("./messages").I18nContext}
 */
function Formats() {
  const { t, lang } = this;
  const relative = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  const rows = [
    [
      t("date"),
      // The server doesn't know the visitor's time zone, so state it.
      new Intl.DateTimeFormat(lang, {
        dateStyle: "full",
        timeStyle: "long",
        timeZone: "UTC",
      }).format(new Date()),
    ],
    [t("number"), new Intl.NumberFormat(lang).format(1234567.891)],
    [
      t("currency"),
      new Intl.NumberFormat(lang, {
        style: "currency",
        currency: "EUR",
      }).format(1234.5),
    ],
    [t("relative"), `${relative.format(-1, "day")} · ${relative.format(3, "month")}`],
    [
      t("list"),
      new Intl.ListFormat(lang, { type: "conjunction" }).format([t("apple"), t("pear"), t("plum")]),
    ],
  ];

  return (
    <>
      <h2>{t("formatsHeadline")}</h2>
      <p>{t("formatsHint")}</p>
      <table class="formats">
        <tbody>
          {rows.map(([label, value]) => (
            <tr>
              <th scope="row">{label}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

/**
 * A repeated parameter arrives as array, and anything else may be invalid.
 *
 * @param {unknown} value
 */
function parseCount(value) {
  const raw = String([value].flat()[0] ?? "").trim();
  // Number("") is 0, so an empty field would show 0 instead of the default.
  const count = Math.trunc(Number(raw));
  return raw !== "" && Number.isFinite(count) ? Math.min(Math.max(count, 0), 1000000) : 1;
}
