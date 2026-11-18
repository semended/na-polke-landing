import { describe, expect, it } from "vitest";
import {
  cartTotal,
  filterProducts,
  normalizePhone,
  sanitizeCart,
  validateCheckout,
  type Checkout,
  type Product,
} from "../src/domain";

const products: Product[] = [
  {
    id: "berry",
    name: "Ягодное облако",
    category: "Торты",
    size: "1 кг",
    price: 1450,
    flavor: "Малина и ваниль",
    description: "Нежный ягодный торт",
    tone: "pink",
  },
  {
    id: "choco",
    name: "Шоколадный вечер",
    category: "Торты",
    size: "1,5 кг",
    price: 2300,
    flavor: "Какао и вишня",
    description: "Насыщенный торт",
    tone: "brown",
  },
  {
    id: "vanilla",
    name: "Ванильный поцелуй",
    category: "Капкейки",
    size: "6 шт.",
    price: 890,
    flavor: "Малина и сливки",
    description: "Набор капкейков",
    tone: "cream",
  },
];

const validCheckout: Checkout = {
  name: "Анна",
  phone: "+7 (999) 123-45-67",
  comment: "",
};

describe("checkout validation", () => {
  it("accepts valid details with an optional empty comment", () => {
    expect(validateCheckout(validCheckout)).toEqual({});
  });

  it.each(["  Юя  ", "А".repeat(80)])(
    "accepts names at the trimmed length boundaries: %s",
    (name) => {
      expect(validateCheckout({ ...validCheckout, name })).toEqual({});
    },
  );

  it.each(["", "    ", " Я ", "А".repeat(81)])(
    "rejects an invalid name length: %s",
    (name) => {
      expect(validateCheckout({ ...validCheckout, name })).toHaveProperty(
        "name",
      );
    },
  );

  it.each([
    "79991234567",
    "89991234567",
    "+7 (999) 123-45-67",
    "8 999 123 45 67",
  ])("accepts a Russian phone number: %s", (phone) => {
    expect(validateCheckout({ ...validCheckout, phone })).toEqual({});
  });

  it.each([
    "",
    "9991234567",
    "69991234567",
    "+799912345678",
    "+7999123456",
    "телефон +79991234567",
  ])("rejects a malformed phone number: %s", (phone) => {
    expect(validateCheckout({ ...validCheckout, phone })).toHaveProperty(
      "phone",
    );
  });

  it("accepts a 500-character comment and rejects 501 characters", () => {
    expect(
      validateCheckout({ ...validCheckout, comment: "Я".repeat(500) }),
    ).toEqual({});
    expect(
      validateCheckout({ ...validCheckout, comment: "Я".repeat(501) }),
    ).toHaveProperty("comment");
  });

  it("reports all invalid fields together", () => {
    expect(
      validateCheckout({ name: " ", phone: "123", comment: "Я".repeat(501) }),
    ).toEqual({
      name: expect.any(String),
      phone: expect.any(String),
      comment: expect.any(String),
    });
  });
});

describe("phone normalization", () => {
  it.each([
    "89991234567",
    "79991234567",
    "+79991234567",
    "8 (999) 123-45-67",
    "+7 (999) 123-45-67",
  ])("normalizes %s to the same international number", (phone) => {
    expect(normalizePhone(phone)).toBe("+79991234567");
  });
});

describe("catalog filtering", () => {
  it("returns all products for an empty or whitespace-only search in Все", () => {
    expect(filterProducts(products, "", "Все")).toEqual(products);
    expect(filterProducts(products, "   ", "Все")).toEqual(products);
  });

  it("matches a trimmed case-insensitive fragment of the product name", () => {
    expect(filterProducts(products, "  ЯГОДНОЕ  ", "Все")).toEqual([
      products[0],
    ]);
  });

  it("searches the flavor, including a fragment shared by different categories", () => {
    expect(filterProducts(products, "мАЛиНа", "Все")).toEqual([
      products[0],
      products[2],
    ]);
  });

  it("searches the category text", () => {
    expect(filterProducts(products, "капк", "Все")).toEqual([products[2]]);
  });

  it("combines a selected category with the text search", () => {
    expect(filterProducts(products, "малина", "Торты")).toEqual([products[0]]);
    expect(filterProducts(products, "шоколад", "Капкейки")).toEqual([]);
  });

  it("supports a category alone and returns no rows for an unmatched query", () => {
    expect(filterProducts(products, "", "Торты")).toEqual([
      products[0],
      products[1],
    ]);
    expect(filterProducts(products, "несуществующий десерт", "Все")).toEqual(
      [],
    );
  });
});

describe("cart totals", () => {
  it("returns zero for an empty cart", () => {
    expect(cartTotal({}, products)).toBe(0);
  });

  it("adds the price of every unit from multiple product lines", () => {
    expect(cartTotal({ berry: 2, choco: 1, vanilla: 3 }, products)).toBe(7870);
  });

  it("does not charge for a product that is absent from the current catalog", () => {
    expect(cartTotal({ berry: 2, retired: 4 }, products)).toBe(2900);
  });
});

describe("persisted cart sanitization", () => {
  it("retains known products with integer quantities including both boundaries", () => {
    expect(sanitizeCart({ berry: 1, choco: 99 }, products)).toEqual({
      berry: 1,
      choco: 99,
    });
  });

  it("drops unknown products while retaining valid lines", () => {
    expect(sanitizeCart({ berry: 2, retired: 1 }, products)).toEqual({
      berry: 2,
    });
  });

  it.each([0, -1, 1.5, 100, "2", null, true, NaN, Infinity])(
    "rejects an invalid stored quantity: %s",
    (quantity) => {
      expect(sanitizeCart({ berry: quantity, choco: 3 }, products)).toEqual({
        choco: 3,
      });
    },
  );

  it.each([null, undefined, 5, "cart", [], ["berry"], false])(
    "rejects a malformed persisted cart: %s",
    (value) => {
      expect(sanitizeCart(value, products)).toEqual({});
    },
  );
});
