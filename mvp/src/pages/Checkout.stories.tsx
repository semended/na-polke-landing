import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { ShopFixture } from "../../tests/storyFixtures";
import { Checkout } from "./Checkout";

const meta = {
  title: "Заказ/Оформление",
  component: Checkout,
  decorators: [
    (Story) => (
      <ShopFixture overrides={{ cart: { haribo: 2 } }}>
        <Story />
      </ShopFixture>
    ),
  ],
} satisfies Meta<typeof Checkout>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Contacts: Story = { name: "Форма контактов" };

export const Invalid: Story = {
  name: "Ошибки пустой формы",
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Оформить заказ" }),
    );
    await expect(canvas.getByLabelText("Имя", { exact: true })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(
      canvas.getByLabelText("Телефон", { exact: true }),
    ).toHaveAttribute("aria-invalid", "true");
  },
};
