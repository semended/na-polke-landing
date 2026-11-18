import type { Product } from "./domain";
export const products: Product[] = [
  {
    id: "haribo",
    name: "Haribo Phantasia",
    category: "Мармелад",
    size: "160 г",
    price: 229,
    flavor: "Фруктовый микс",
    tone: "green",
    description:
      "Фруктовый мармелад разных форм. Небольшой пакет для сладкой паузы или вечера с друзьями.",
  },
  {
    id: "fanta",
    name: "Fanta White Peach",
    category: "Газировка",
    size: "300 мл",
    price: 249,
    flavor: "Белый персик",
    tone: "pink",
    description:
      "Газировка со вкусом белого персика. Знакомый напиток в необычном исполнении. Попробуйте охлаждённым.",
  },
  {
    id: "marabou",
    name: "Marabou Oreo",
    category: "Шоколад",
    size: "170 г",
    price: 349,
    flavor: "Молочный шоколад и печенье",
    tone: "yellow",
    description:
      "Молочный шоколад с кусочками печенья Oreo. Большая плитка, которой удобно поделиться.",
  },
  {
    id: "maltesers",
    name: "Maltesers Max Pack",
    category: "Шоколад",
    size: "300 г",
    price: 549,
    flavor: "Шоколад и хрустящая начинка",
    tone: "cream",
    description:
      "Шоколадные шарики с хрустящей начинкой в большой упаковке. Для домашнего киносеанса и сладких подарков.",
  },
  {
    id: "kinder",
    name: "Kinder Country",
    category: "Шоколад",
    size: "23,5 г",
    price: 89,
    flavor: "Молочный шоколад и злаки",
    tone: "blue",
    description:
      "Шоколадный батончик с молочной начинкой и злаками. Небольшой формат, который удобно взять с собой.",
  },
  {
    id: "skittles",
    name: "Skittles Fruits",
    category: "Драже",
    size: "125 г",
    price: 219,
    flavor: "Фруктовый микс",
    tone: "lilac",
    description:
      "Фруктовое драже в яркой баночке. Несколько вкусов в одной упаковке.",
  },
];
export const categories = ["Все", "Шоколад", "Мармелад", "Газировка", "Драже"];
