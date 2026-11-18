import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Field } from "../src/components/Field";
import { ProductCard } from "../src/components/ProductCard";
import type { Product } from "../src/domain";

describe("Field", () => {
  it("has an accessible label, displays its value and sends the next value to the caller", () => {
    const onChange = vi.fn();
    render(
      <Field
        label="Имя"
        name="customer-name"
        value="Анна"
        onChange={onChange}
      />,
    );
    const input = screen.getByRole("textbox", { name: "Имя" });
    expect(input).toHaveValue("Анна");
    fireEvent.change(input, { target: { value: "Мария" } });
    expect(onChange).toHaveBeenCalledWith("Мария");
  });

  it("associates a validation error with the input", () => {
    render(
      <Field
        label="Телефон"
        name="customer-phone"
        value="123"
        onChange={vi.fn()}
        error="Укажите полный номер телефона"
        type="tel"
      />,
    );
    const input = screen.getByRole("textbox", { name: "Телефон" });
    expect(input).toHaveAttribute("type", "tel");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby");
    expect(input).toHaveAccessibleDescription("Укажите полный номер телефона");
    expect(screen.getByText("Укажите полный номер телефона")).toBeVisible();
  });

  it("does not mark a field without an error as invalid", () => {
    render(
      <Field
        label="Имя"
        name="customer-name"
        value="Анна"
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("textbox", { name: "Имя" })).not.toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("renders a labelled textarea for multiline input and preserves line breaks", () => {
    const onChange = vi.fn();
    render(
      <Field
        label="Комментарий"
        name="comment"
        value={"Первая строка\nВторая строка"}
        onChange={onChange}
        multiline
      />,
    );
    const textarea = screen.getByRole("textbox", { name: "Комментарий" });
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveValue("Первая строка\nВторая строка");
    fireEvent.change(textarea, {
      target: { value: "Позвоните\nперед доставкой" },
    });
    expect(onChange).toHaveBeenCalledWith("Позвоните\nперед доставкой");
  });
});

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
