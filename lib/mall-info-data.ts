/** Edit these to match your mall */
export const MALL_SHOP_COUNT = 40
export const MALL_RESTAURANT_COUNT = 10
/** Single fitness offering on site */
export const MALL_GYM_COUNT = 1

export type MallLocale = "en" | "fr"

export type MallHoursRow = { days: string; hours: string }

/** Word runs for the hero — optional `accent` uses brand teal on dark */
export type HeroLinePart = { text: string; accent?: boolean }

export function joinHeroParts(parts: readonly HeroLinePart[]): string {
  return parts.map((p) => p.text).join("")
}

export const mallInfoCopy: Record<
  MallLocale,
  {
    heroQuoteLine1Parts: readonly HeroLinePart[]
    heroQuoteLine2Parts: readonly HeroLinePart[]
    shopsSuffix: string
    hoursTitle: string
    hoursNote: string
    statShops: string
    statRestaurants: string
    statGym: string
    statParking: string
    /** Large typographic line for parking (no numeric count provided) */
    parkingValue: string
    statsLead: string
    rows: MallHoursRow[]
  }
> = {
  en: {
    heroQuoteLine1Parts: [
      { text: "One of the " },
      { text: "largest", accent: true },
      { text: " shopping and lifestyle " },
      { text: "malls", accent: true },
    ],
    heroQuoteLine2Parts: [
      { text: "in the " },
      { text: "country", accent: true },
      { text: " — where the " },
      { text: "city", accent: true },
      { text: " comes " },
      { text: "together", accent: true },
      { text: "." },
    ],
    shopsSuffix: "+",
    hoursTitle: "Opening hours",
    hoursNote: "Individual store hours may vary.",
    statShops: "Shops",
    statRestaurants: "Restaurants & cafés",
    statGym: "Gym",
    statParking: "Underground parking",
    parkingValue: "Included",
    statsLead: "Scale that matches the city.",
    rows: [
      { days: "Monday — Thursday", hours: "9:00 — 22:00" },
      { days: "Friday — Saturday", hours: "9:00 — 23:00" },
      { days: "Sunday & public holidays", hours: "10:00 — 22:00" },
    ],
  },
  fr: {
    heroQuoteLine1Parts: [
      { text: "L’un des " },
      { text: "plus grands", accent: true },
      { text: " malls " },
      { text: "shopping", accent: true },
      { text: " et " },
      { text: "lifestyle", accent: true },
    ],
    heroQuoteLine2Parts: [
      { text: "du pays — là où la " },
      { text: "ville", accent: true },
      { text: " se " },
      { text: "retrouve", accent: true },
      { text: "." },
    ],
    shopsSuffix: "+",
    hoursTitle: "Horaires d’ouverture",
    hoursNote: "Les horaires peuvent varier selon les enseignes.",
    statShops: "Boutiques",
    statRestaurants: "Restaurants & cafés",
    statGym: "Salle de sport",
    statParking: "Parking souterrain",
    parkingValue: "Inclus",
    statsLead: "Une envergure à la hauteur de la ville.",
    rows: [
      { days: "lundi — jeudi", hours: "9h00 — 22h00" },
      { days: "vendredi — samedi", hours: "9h00 — 23h00" },
      { days: "dimanche & jours fériés", hours: "10h00 — 22h00" },
    ],
  },
}

/**
 * Gallery sources under `/public/images/shops`.
 * Filenames may contain spaces — paths are built with encodeURIComponent.
 * Mall section renders these with `<img>` (no optimizer) for reliability.
 */
function shopImage(filename: string, alt: string): { src: string; alt: string } {
  return { src: `/images/shops/${encodeURIComponent(filename)}`, alt }
}

/** Skew column — opening-hours block */
export const mallLayoutGallerySkew: readonly { src: string; alt: string }[] = [
  shopImage("smokin.webp", "Smokin"),
  shopImage("nice cream.webp", "Nice Cream"),
  shopImage("meat way.webp", "Meat Way"),
  shopImage("al jawad.webp", "Al Jawad"),
  shopImage("cfc.webp", "CFC"),
]

/** Sticky stack — stats block */
export const mallLayoutGallerySticky: readonly { src: string; alt: string }[] = [
  shopImage("rest post.webp", "Rest Post"),
  shopImage("3C8A8159.webp", "Kinshasa Mall"),
  shopImage("smokin.webp", "Smokin"),
  shopImage("nice cream.webp", "Nice Cream"),
]
