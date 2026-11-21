import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { ProductCard } from "./ProductCard";
import type { Product } from "../domain";

describe("ProductCard", () => {
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

  it("shows the product name, price and a link to its detail page", () => {
    const { container } = render(
      <MemoryRouter>
        <ProductCard product={product} onAdd={vi.fn()} />
      </MemoryRouter>,
    );
    expect(
      screen
        .getAllByRole("link", { name: /Ягодное облако/ })
        .some((link) => link.getAttribute("href") === "/product/berry"),
    ).toBe(true);
    // Formatting may use ordinary, non-breaking or narrow spaces between thousands.
    expect(container.textContent?.replace(/\s/g, "")).toContain("1450");
  });

  it("provides an accessible add-to-cart action and passes the product ID", () => {
    const onAdd = vi.fn();
    render(
      <MemoryRouter>
        <ProductCard product={product} onAdd={onAdd} />
      </MemoryRouter>,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Добавить Ягодное облако в корзину" }),
    );
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith("berry");
  });

  it("keeps the add action available for a product already in the cart", () => {
    const onAdd = vi.fn();
    render(
      <MemoryRouter>
        <ProductCard product={product} onAdd={onAdd} quantity={2} />
      </MemoryRouter>,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Добавить Ягодное облако в корзину" }),
    );
    expect(onAdd).toHaveBeenCalledWith("berry");
  });
});
