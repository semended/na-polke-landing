type PhotoSize = readonly [width: number, height: number];

export const photoSizes = new Map<string, PhotoSize>([
  ["haribo", [408, 554]],
  ["fanta", [270, 554]],
  ["marabou", [353, 128]],
  ["maltesers", [298, 347]],
  ["kinder", [208, 486]],
  ["skittles", [445, 554]],
]);

export function photoUrl(id: string, compact = false) {
  return `${import.meta.env.BASE_URL}products/${id}${compact ? "-compact" : ""}.webp`;
}
