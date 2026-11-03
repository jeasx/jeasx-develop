import Layout from "../Layout";
import { LOCALES } from "./messages";

/**
 * Renders "/i18n/<locale>". The guard has already put the locale and the translation
 * function into "this", so this route and its components only read them.
 *
 * @this {import("../types").ThisContext & import("./messages").I18nContext}
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  // Unknown locales and deeper paths are left to [404].
  if (!this.t || !/^\/i18n\/[^/]+\/?$/.test(request.path)) {
    return;
  }

  const t = this.t;
  const count = parseCount(request.query["count"]);

  return (
    <Layout lang={this.lang} title={t("title")} description={t("description")}>
      <LanguageSwitcher count={count} />
      <h1>{t("headline")}</h1>
      <p>{t("intro")}</p>
      <p>
        <small>{t("detect")}</small>
      </p>
      <h2>{t("pluralHeadline")}</h2>
      <p>{t("pluralHint")}</p>
      <form method="get">
        <label>
          {t("count")}
          <input type="number" name="count" min="0" max="1000000" value={count} />
        </label>
        <input type="submit" value={t("submit")} />
      </form>
      <p class="center">
        <strong>{t("apples", { count })}</strong>
      </p>
      <Formats />
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
    <div
      role="navigation"
      aria-label={this.t("language")}
      class="center"
      style="margin-bottom: 1.5rem;"
    >
      {Object.entries(LOCALES).map(([locale, name]) => (
        <>
          <a
            href={`/i18n/${locale}?count=${count}`}
            hreflang={locale}
            lang={locale}
            role="button"
            aria-disabled={locale === this.lang ? "true" : "false"}
          >
            {name}
          </a>{" "}
        </>
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
      new Intl.NumberFormat(lang, { style: "currency", currency: "EUR" }).format(1234.5),
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
      <table>
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
