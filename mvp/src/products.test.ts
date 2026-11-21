import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { products, categories } from "./products";
import { photoSizes } from "./productPhotos";

describe("Стартовая витрина", () => {
  it.each(categories.filter((category) => category !== "Все"))(
    "содержит 50 разных упаковок в категории %s",
    (category) => {
      const shelf = products.filter((product) => product.category === category);
      expect(shelf).toHaveLength(50);
      const packs = shelf.map((product) => product.name + " " + product.size);
      expect(new Set(packs).size).toBe(shelf.length);
    },
  );

  it("открывает отдельную карточку и два локальных фото для каждого товара", () => {
    expect(products).toHaveLength(200);
    expect(new Set(products.map((product) => product.id)).size).toBe(200);
    for (const { id, price } of products) {
      expect(price, id).toBeGreaterThan(0);
      expect(photoSizes.has(id), id).toBe(true);
      for (const suffix of [".webp", "-compact.webp"]) {
        const file = resolve("public/products", id + suffix);
        expect(existsSync(file), file).toBe(true);
      }
    }
  });
});
