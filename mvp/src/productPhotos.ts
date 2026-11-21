type PhotoSize = readonly [width: number, height: number];

export const photoSizes = new Map<string, PhotoSize>([
  ["haribo", [230, 318]],
  ["fanta", [189, 400]],
  ["marabou", [200, 200]],
  ["maltesers", [225, 330]],
  ["kinder", [107, 234]],
  ["skittles", [268, 326]],
]);

export function photoUrl(id: string, compact = false) {
  return `${import.meta.env.BASE_URL}products/${id}${compact ? "-compact" : ""}.webp`;
}
