import { describe, expect, it } from "vitest";
import type { Product } from "../src/domain";
import {
  addItem,
  cartReducer,
  catalogReducer,
  decreaseItem,
  fetchProducts,
  removeItem,
} from "../src/store";

const product: Product = {
  id: "berry",
  name: "Ягодное облако",
  category: "Торты",
  size: "1 кг",
  price: 1450,
  flavor: "Малина",
  description: "Ягодный торт",
  tone: "pink",
};

describe("cart state", () => {
  it("starts empty", () => {
    expect(cartReducer(undefined, { type: "test/init" })).toEqual({});
  });

  it("adds a product and accumulates repeated additions", () => {
    const once = cartReducer({}, addItem("berry"));
    expect(once).toEqual({ berry: 1 });
    expect(cartReducer(once, addItem("berry"))).toEqual({ berry: 2 });
  });

  it("increases a line without changing other quantities or mutating the input", () => {
    const previous = { berry: 2, choco: 3 };
    expect(cartReducer(previous, addItem("berry"))).toEqual({
      berry: 3,
      choco: 3,
    });
    expect(previous).toEqual({ berry: 2, choco: 3 });
  });

  it("caps the quantity at 99 units", () => {
    expect(cartReducer({ berry: 98 }, addItem("berry"))).toEqual({ berry: 99 });
    expect(cartReducer({ berry: 99 }, addItem("berry"))).toEqual({ berry: 99 });
  });

  it("decreases a quantity and removes a line when the final unit is removed", () => {
    expect(cartReducer({ berry: 2, choco: 3 }, decreaseItem("berry"))).toEqual({
      berry: 1,
      choco: 3,
    });
    expect(cartReducer({ berry: 1, choco: 3 }, decreaseItem("berry"))).toEqual({
      choco: 3,
    });
  });

  it("removes the selected line regardless of its quantity", () => {
    expect(cartReducer({ berry: 7, choco: 3 }, removeItem("berry"))).toEqual({
      choco: 3,
    });
  });
});

describe("catalog request lifecycle", () => {
  const argument = { mode: "success" };

  it("starts idle with no products or error", () => {
    expect(catalogReducer(undefined, { type: "test/init" })).toEqual({
      items: [],
      status: "idle",
      error: null,
    });
  });

  it("enters loading while a request is pending", () => {
    const state = catalogReducer(
      undefined,
      fetchProducts.pending("request-1", argument),
    );
    expect(state.status).toBe("loading");
  });

  it("exposes the loaded products when the request succeeds", () => {
    const loading = catalogReducer(
      undefined,
      fetchProducts.pending("request-1", argument),
    );
    expect(
      catalogReducer(
        loading,
        fetchProducts.fulfilled([product], "request-1", argument),
      ),
    ).toEqual({
      items: [product],
      status: "succeeded",
      error: null,
    });
  });

  it("treats an empty successful result as succeeded", () => {
    expect(
      catalogReducer(
        undefined,
        fetchProducts.fulfilled([], "request-2", argument),
      ),
    ).toEqual({
      items: [],
      status: "succeeded",
      error: null,
    });
  });

  it("exposes a failed status and an error after request rejection", () => {
    const state = catalogReducer(
      undefined,
      fetchProducts.rejected(
        new Error("Сеть недоступна"),
        "request-3",
        argument,
      ),
    );
    expect(state.status).toBe("failed");
    expect(state.error).toEqual(expect.any(String));
    expect(state.error?.length).toBeGreaterThan(0);
  });

  it("can recover from a failure with a later successful request", () => {
    const failed = catalogReducer(
      undefined,
      fetchProducts.rejected(
        new Error("Сеть недоступна"),
        "request-3",
        argument,
      ),
    );
    const loading = catalogReducer(
      failed,
      fetchProducts.pending("request-4", argument),
    );
    expect(loading.status).toBe("loading");
    expect(
      catalogReducer(
        loading,
        fetchProducts.fulfilled([product], "request-4", argument),
      ),
    ).toEqual({
      items: [product],
      status: "succeeded",
      error: null,
    });
  });
});
