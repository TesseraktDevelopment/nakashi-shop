export type Locale = (typeof locales)[number];

export const locales = ["cs", "en"] as const;
export const defaultLocale: Locale = "cs";
