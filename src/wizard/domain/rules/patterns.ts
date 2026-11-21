// Patterns shared by the rules. Each uses a single character class per part, so checks stay
// fast: nested quantifiers like ([\d ]+)+ take exponential time for inputs like "1111…x".

/** Letters with spaces, hyphens, apostrophes and dots in between, e.g. "Anne-Marie O'Neil". */
export const NAME = /^[\p{L}][\p{L}\p{M} '’.-]{0,48}[\p{L}.]$|^\p{L}$/u;
export const EMAIL = /^[^\s@]{1,64}@[^\s@.]{1,63}(\.[^\s@.]{1,63})+$/;
/** 7 to 20 characters ending with a digit, e.g. "+49 30 1234567". */
export const PHONE = /^\+?[\d ()/.-]{6,19}\d$/;
export const PASSPORT = /^[A-Z0-9]{6,9}$/;
