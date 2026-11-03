import { LOCALES, createTranslator } from "./messages";

// Matches "/i18n/<locale>" and any deeper path below it.
const LOCALE_PATTERN = new URLPattern({ pathname: "/i18n/:locale{/*}?" });

/**
 * Runs before every route of this example: reads the locale from the first path segment
 * ("/i18n/de/...") and puts the locale and a translation function into the "this" context.
 * All components rendered for this request can use them, without passing them as props.
 *
 * @this {import("../types").ThisContext & import("./messages").I18nContext}
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const locale = LOCALE_PATTERN.exec({ pathname: request.path })?.pathname.groups.locale;
  if (locale && Object.hasOwn(LOCALES, locale)) {
    this.lang = locale;
    this.t = createTranslator(locale);
  }
}
