import { negotiateLocale } from "./messages";

/**
 * "/i18n" has no locale: redirect to the one which fits the browser's languages best.
 *
 * @param {import("../types").RouteProps} props
 */
export default function ({ request }) {
  const locale = negotiateLocale(request.headers["accept-language"]);
  return new Response(null, {
    // Temporary, as the target depends on the browser settings.
    status: 302,
    headers: {
      location: `/i18n/${locale}`,
      // Caches must not hand this redirect to visitors with other languages.
      vary: "accept-language",
    },
  });
}
