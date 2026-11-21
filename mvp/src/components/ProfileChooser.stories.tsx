import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { ProfileChooser } from "./ProfileChooser";

const meta = {
  title: "Профиль/Выбор роли",
  component: ProfileChooser,
  args: { session: "guest", onChoose: fn() },
} satisfies Meta<typeof ProfileChooser>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Guest: Story = {
  name: "Вход сотрудника",
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Войти как сотрудник" }),
    );
    await expect(args.onChoose).toHaveBeenCalledWith("staff");
  },
};

export const Buyer: Story = {
  name: "Текущий профиль",
  args: { session: "anna" },
};
