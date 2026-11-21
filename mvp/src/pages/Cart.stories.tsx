import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { ShopFixture } from "../../tests/storyFixtures";
import { Cart } from "./Cart";

const meta = { title: "Заказ/Корзина", component: Cart } satisfies Meta<
  typeof Cart
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  name: "Пустая",
  render: () => (
    <ShopFixture>
      <Cart />
    </ShopFixture>
  ),
};

export const Filled: Story = {
  name: "Два товара",
  render: () => (
    <ShopFixture overrides={{ cart: { haribo: 2 } }}>
      <Cart />
    </ShopFixture>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId("cart-total")).toHaveTextContent(/458\s*₽/);
  },
};
