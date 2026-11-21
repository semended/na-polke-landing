import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Field } from "./Field";

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
