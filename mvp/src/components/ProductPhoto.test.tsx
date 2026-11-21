import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { photoSizes } from "../productPhotos";
import { ProductPhoto } from "./ProductPhoto";

describe("ProductPhoto", () => {
  it("reserves the image size and offers responsive local WebP sources", () => {
    render(
      <ProductPhoto product={{ id: "haribo", name: "Haribo Phantasia" }} />,
    );
    const image = screen.getByRole("img", { name: "Haribo Phantasia" });
    const [width, height] = photoSizes.get("haribo")!;
    expect(image).toHaveAttribute("width", String(width));
    expect(image).toHaveAttribute("height", String(height));
    expect(image.getAttribute("srcset")).toContain(
      `haribo-compact.webp ${Math.ceil(width / 2)}w`,
    );
    expect(image).toHaveAttribute("loading", "lazy");
  });

  it("shows a placeholder when an image fails to load", () => {
    render(
      <ProductPhoto product={{ id: "haribo", name: "Haribo Phantasia" }} />,
    );
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByText("Фото пока нет")).toBeVisible();
  });

  it("shows a placeholder for a newly added product with no photo", () => {
    render(
      <ProductPhoto product={{ id: "staff-created", name: "Мармелад" }} />,
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("Фото пока нет")).toBeVisible();
  });
});
