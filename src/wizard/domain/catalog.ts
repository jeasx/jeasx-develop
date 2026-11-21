// Everything the wizard offers. Shared by server and browser, so both compute the same prices.

export type Destination = {
  id: string;
  city: string;
  country: string;
  code: string;
  flag: string;
  /** Per adult and leg, in cents. */
  fare: number;
  passport: boolean;
  /** Tints the tiles, the boarding pass and the ticket. */
  hue: number;
  tagline: string;
};

export type Cabin = { id: string; label: string; factor: number; perk: string };

/** Departures always leave from Frankfurt. Fares are per adult and leg, in cents. */
export const ORIGIN = { city: "Frankfurt", code: "FRA" };

export const DESTINATIONS: Destination[] = [
  {
    id: "lis",
    city: "Lisbon",
    country: "Portugal",
    code: "LIS",
    flag: "🇵🇹",
    fare: 12900,
    passport: false,
    hue: 28,
    tagline: "Tiles, trams and pastéis",
  },
  {
    id: "kef",
    city: "Reykjavík",
    country: "Iceland",
    code: "KEF",
    flag: "🇮🇸",
    fare: 21900,
    passport: false,
    hue: 190,
    tagline: "Northern lights and hot springs",
  },
  {
    id: "rak",
    city: "Marrakesh",
    country: "Morocco",
    code: "RAK",
    flag: "🇲🇦",
    fare: 17900,
    passport: true,
    hue: 12,
    tagline: "Souks and desert nights",
  },
  {
    id: "jfk",
    city: "New York",
    country: "USA",
    code: "JFK",
    flag: "🇺🇸",
    fare: 44900,
    passport: true,
    hue: 220,
    tagline: "The city that never sleeps",
  },
  {
    id: "hnd",
    city: "Tokyo",
    country: "Japan",
    code: "HND",
    flag: "🇯🇵",
    fare: 69900,
    passport: true,
    hue: 330,
    tagline: "Neon, temples and ramen",
  },
  {
    id: "cpt",
    city: "Cape Town",
    country: "South Africa",
    code: "CPT",
    flag: "🇿🇦",
    fare: 58900,
    passport: true,
    hue: 150,
    tagline: "Table Mountain and two oceans",
  },
];

export const CABINS: Cabin[] = [
  { id: "economy", label: "Economy", factor: 1, perk: "Seat and snack" },
  { id: "premium", label: "Premium", factor: 1.6, perk: "Extra legroom, meal" },
  {
    id: "business",
    label: "Business",
    factor: 2.8,
    perk: "Lie-flat bed, lounge",
  },
];

// Answers are stored as plain JSON in a cookie (max. ~4 KB), which holds about 5 travelers.
export const LIMITS = {
  adults: 2,
  children: 3,
  infants: 2,
  travelers: 5,
  nights: 30,
  bags: 2,
};

/** Shares of the adult fare. Infants travel on a lap. */
export const FARE_SHARE = { adult: 1, child: 0.75, infant: 0.1 };

export const BAG_PRICE = 3500; // per bag and leg
export const SEATS_TOGETHER_PRICE = 1200; // per seated traveler and leg
export const INSURANCE_RATE = 0.06; // of the fares
export const INVOICE_LIMIT = 250000; // larger bookings must be paid by card

export function findDestination(id: unknown) {
  return DESTINATIONS.find((d) => d.id === id);
}

export function findCabin(id: unknown) {
  return CABINS.find((c) => c.id === id);
}

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
