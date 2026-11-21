import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { ShopFixture } from "../../tests/storyFixtures";
import { products } from "../products";
import { ProductEditor } from "./ProductEditor";

const meta = {
  title: "Кабинет сотрудника/Редактор товара",
  component: ProductEditor,
  args: { onSaved: fn(), onCancel: fn() },
  decorators: [
    (Story) => (
      <ShopFixture overrides={{ session: "staff" }}>
        <Story />
      </ShopFixture>
    ),
  ],
} satisfies Meta<typeof ProductEditor>;
export default meta;
type Story = StoryObj<typeof meta>;

export const NewProduct: Story = { name: "Новый товар" };

export const Editing: Story = {
  name: "Редактирование и отмена",
  args: { product: products[0] },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByLabelText("Название")).toHaveValue(
      "Haribo Phantasia",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Отмена" }));
    await expect(args.onCancel).toHaveBeenCalledOnce();
  },
};
