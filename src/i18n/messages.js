/** Supported locales with their names in their own language. */
export const LOCALES = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  pl: "Polski",
};

export const DEFAULT_LOCALE = "en";

/**
 * A message is a string or an object with plural forms (see Intl.PluralRules).
 * "{name}" is replaced by the parameter of the same name.
 *
 * @type {Record<string, Record<string, string | Record<string, string>>>}
 */
const MESSAGES = {
  en: {
    title: "Internationalization with Jeasx",
    description:
      "Translate pages with a guard that reads the locale from the URL and shares it via the 'this' context.",
    headline: "Speak the language of your visitors",
    intro:
      'A guard reads the locale from the URL and puts a translation function into the "this" context, so every component can translate texts without receiving the locale as a prop.',
    detect:
      "Visiting /i18n without a locale redirects you to the best match for the languages configured in your browser.",
    pluralHeadline: "Plural forms",
    pluralHint:
      "Languages have different plural rules: Intl.PluralRules picks the right form. Try 0, 1, 2, 5, 22 and 1000000 in every language.",
    count: "Number of apples",
    submit: "Count",
    apples: { one: "{count} apple", other: "{count} apples" },
    formatsHeadline: "Dates, numbers and lists",
    formatsHint:
      "The Intl API of JavaScript formats values for each locale, without any additional library.",
    date: "Date",
    number: "Number",
    currency: "Price",
    relative: "Relative time",
    list: "List",
    apple: "apples",
    pear: "pears",
    plum: "plums",
    language: "Language",
  },
  de: {
    title: "Internationalisierung mit Jeasx",
    description:
      "Seiten übersetzen: Ein Guard liest die Sprache aus der URL und teilt sie über den 'this'-Kontext.",
    headline: "Sprich die Sprache deiner Besucher",
    intro:
      'Ein Guard liest die Sprache aus der URL und legt eine Übersetzungsfunktion im "this"-Kontext ab. So kann jede Komponente Texte übersetzen, ohne die Sprache als Prop zu erhalten.',
    detect:
      "Wer /i18n ohne Sprache aufruft, wird zu der Sprache weitergeleitet, die am besten zu den Einstellungen des Browsers passt.",
    pluralHeadline: "Pluralformen",
    pluralHint:
      "Jede Sprache hat eigene Pluralregeln: Intl.PluralRules wählt die passende Form. Probiere 0, 1, 2, 5, 22 und 1000000 in jeder Sprache aus.",
    count: "Anzahl der Äpfel",
    submit: "Zählen",
    apples: { one: "{count} Apfel", other: "{count} Äpfel" },
    formatsHeadline: "Datum, Zahlen und Listen",
    formatsHint:
      "Die Intl-API von JavaScript formatiert Werte für jede Sprache, ganz ohne zusätzliche Bibliothek.",
    date: "Datum",
    number: "Zahl",
    currency: "Preis",
    relative: "Relative Zeit",
    list: "Liste",
    apple: "Äpfel",
    pear: "Birnen",
    plum: "Pflaumen",
    language: "Sprache",
  },
  fr: {
    title: "Internationalisation avec Jeasx",
    description:
      "Traduire des pages : un guard lit la langue dans l'URL et la partage via le contexte « this ».",
    headline: "Parlez la langue de vos visiteurs",
    intro:
      "Un guard lit la langue dans l'URL et place une fonction de traduction dans le contexte « this ». Ainsi, chaque composant peut traduire des textes sans recevoir la langue en prop.",
    detect:
      "Si vous ouvrez /i18n sans langue, vous êtes redirigé vers celle qui correspond le mieux aux langues configurées dans votre navigateur.",
    pluralHeadline: "Formes du pluriel",
    pluralHint:
      "Chaque langue a ses propres règles de pluriel : Intl.PluralRules choisit la bonne forme. Essayez 0, 1, 2, 5, 22 et 1000000 dans chaque langue.",
    count: "Nombre de pommes",
    submit: "Compter",
    // French uses the singular for 0 and "de" for large round numbers ("1 000 000 de pommes").
    apples: { one: "{count} pomme", many: "{count} de pommes", other: "{count} pommes" },
    formatsHeadline: "Dates, nombres et listes",
    formatsHint:
      "L'API Intl de JavaScript formate les valeurs pour chaque langue, sans aucune bibliothèque supplémentaire.",
    date: "Date",
    number: "Nombre",
    currency: "Prix",
    relative: "Temps relatif",
    list: "Liste",
    apple: "pommes",
    pear: "poires",
    plum: "prunes",
    language: "Langue",
  },
  pl: {
    title: "Internacjonalizacja z Jeasx",
    description:
      "Tłumaczenie stron: guard odczytuje język z adresu URL i udostępnia go przez kontekst „this”.",
    headline: "Mów językiem swoich odwiedzających",
    intro:
      "Guard odczytuje język z adresu URL i umieszcza funkcję tłumaczącą w kontekście „this”. Dzięki temu każdy komponent może tłumaczyć teksty bez otrzymywania języka jako propsa.",
    detect:
      "Otwarcie /i18n bez języka przekierowuje do języka, który najlepiej pasuje do ustawień przeglądarki.",
    pluralHeadline: "Formy liczby mnogiej",
    pluralHint:
      "Każdy język ma własne reguły liczby mnogiej: Intl.PluralRules wybiera właściwą formę. Wypróbuj 0, 1, 2, 5, 22 i 1000000 w każdym języku.",
    count: "Liczba jabłek",
    submit: "Policz",
    // Polish has three plural forms for whole numbers: 1 jabłko, 2 jabłka, 5 jabłek.
    apples: {
      one: "{count} jabłko",
      few: "{count} jabłka",
      many: "{count} jabłek",
      other: "{count} jabłka",
    },
    formatsHeadline: "Daty, liczby i listy",
    formatsHint:
      "API Intl w JavaScripcie formatuje wartości dla każdego języka bez żadnej dodatkowej biblioteki.",
    date: "Data",
    number: "Liczba",
    currency: "Cena",
    relative: "Czas względny",
    list: "Lista",
    apple: "jabłka",
    pear: "gruszki",
    plum: "śliwki",
    language: "Język",
  },
};

/**
 * @typedef {ReturnType<typeof createTranslator>} Translator
 * @typedef {{ lang?: string, t?: Translator }} I18nContext
 */

/**
 * Returns the supported locale which fits an Accept-Language header best,
 * e.g. "de" for "de-CH,de;q=0.9,en;q=0.8".
 *
 * @param {string | undefined} header
 */
export function negotiateLocale(header) {
  const ranges = String(header ?? "")
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.split(";").map((value) => value.trim());
      const q = params.find((param) => param.startsWith("q="));
      return { tag: tag.toLowerCase(), q: q === undefined ? 1 : Number(q.slice(2)), index };
    })
    // Number("x") is NaN, which fails the comparison, so malformed weights are dropped.
    .filter(({ tag, q }) => tag && q > 0)
    // Highest weight first; equal weights keep the order of the header.
    .sort((a, b) => b.q - a.q || a.index - b.index);

  for (const { tag } of ranges) {
    // "de-CH" falls back to "de".
    const language = tag.split("-")[0];
    if (Object.hasOwn(LOCALES, language)) {
      return language;
    }
  }
  return DEFAULT_LOCALE;
}

/**
 * Creates a function which translates a key into the given locale.
 * Missing keys fall back to the default locale, then to the key itself.
 *
 * @param {string} locale
 */
export function createTranslator(locale) {
  const messages = MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE];
  const plurals = new Intl.PluralRules(locale);
  const numbers = new Intl.NumberFormat(locale);

  /**
   * @param {string} key
   * @param {Record<string, string | number>} [params]
   */
  return function t(key, params = {}) {
    let message = messages[key] ?? MESSAGES[DEFAULT_LOCALE][key] ?? key;
    if (typeof message === "object") {
      const count = Number(params["count"] ?? 0);
      message = message[plurals.select(count)] ?? message["other"];
    }
    return message.replace(/\{(\w+)\}/g, (match, name) => {
      if (!Object.hasOwn(params, name)) {
        return match;
      }
      const value = params[name];
      return typeof value === "number" ? numbers.format(value) : String(value);
    });
  };
}
