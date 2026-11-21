import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { products } from "../products";
import { ProductCard } from "./ProductCard";

const meta = {
  title: "Каталог/Карточка товара",
  component: ProductCard,
  args: { product: products[0], onAdd: fn(), onDecrease: fn() },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProductCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Available: Story = {
  name: "В наличии",
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: /добавить.*в корзину/i }),
    );
    await expect(args.onAdd).toHaveBeenCalledWith(args.product.id);
  },
};

export const OutOfStock: Story = {
  name: "Нет в наличии",
  args: { product: { ...products[0], available: false } },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: /нет в наличии/i }),
    ).toBeDisabled();
  },
};

export const InCart: Story = {
  name: "Две упаковки в корзине",
  args: { quantity: 2 },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByText("2 шт.")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: /уменьшить количество/i }),
    );
    await expect(args.onDecrease).toHaveBeenCalledWith(args.product.id);
  },
};
