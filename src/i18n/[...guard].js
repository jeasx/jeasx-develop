import { LOCALES, createTranslator } from "./messages";

/**
 * Runs before every route of this example: reads the locale from the first path segment
 * ("/i18n/de/...") and puts the locale and a translation function into the "this" context.
 * All components rendered for this request can use them, without passing them as props.
 *
 * @this {import("../types").ThisContext & import("./messages").I18nContext}
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const locale = /^\/i18n\/([^/]+)/.exec(request.path)?.[1];
  if (locale && Object.hasOwn(LOCALES, locale)) {
    this.lang = locale;
    this.t = createTranslator(locale);
  }
}
