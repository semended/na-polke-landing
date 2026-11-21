import type { Preview } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import "../src/styles.css";
import "../src/styles/staff.css";

const preview: Preview = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div lang="ru" className="wrap">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

export default preview;
