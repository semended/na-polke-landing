import chocolate from "./assortment/chocolate.json";
import dragees from "./assortment/dragees.json";
import gummies from "./assortment/gummies.json";
import soda from "./assortment/soda.json";

const shelves = [
  { category: "Шоколад", tone: "cream", items: chocolate },
  { category: "Мармелад", tone: "green", items: gummies },
  { category: "Газировка", tone: "pink", items: soda },
  { category: "Драже", tone: "lilac", items: dragees },
];

// Чередуем категории в общей выдаче, сохраняя порядок внутри каждой полки.
const entries = shelves
  .flatMap(({ category, tone, items }) =>
    items.map((item, position) => ({ item, position, category, tone })),
  )
  .sort((a, b) => a.position - b.position);

export const assortmentProducts = entries.map(({ item, category, tone }) => ({
  id: item.id,
  name: item.name,
  size: item.size,
  flavor: item.flavor,
  price: item.price,
  description: item.description,
  category,
  tone,
}));

export const assortmentPhotoSizes = entries.map(
  ({ item }) => [item.id, [item.width, item.height]] as const,
);
