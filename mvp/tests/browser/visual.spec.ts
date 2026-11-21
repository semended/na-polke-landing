import { expect, test, type Page } from "@playwright/test";

async function capture(page: Page, name: string, width: number) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const onScreen = [...document.images].filter((image) => {
      const bounds = image.getBoundingClientRect();
      return bounds.top < innerHeight && bounds.bottom > 0;
    });
    await Promise.all(onScreen.map((image) => image.decode()));
  });
  await expect(page).toHaveScreenshot(`${name}-${width}.png`);
}

for (const width of [375, 1440]) {
  test(`экраны демонстрации при ширине ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("./");
    await expect(
      page.locator(".hero").getByRole("link", { name: "Открыть магазин" }),
    ).toBeVisible();
    await capture(page, "landing", width);

    await page
      .locator(".hero")
      .getByRole("link", { name: "Открыть магазин" })
      .click();
    await expect(
      page.getByRole("link", { name: "Haribo Phantasia", exact: true }),
    ).toBeVisible();
    await capture(page, "catalog", width);

    await page
      .getByRole("button", { name: "Добавить Haribo Phantasia в корзину" })
      .click();
    await page.getByRole("link", { name: /^Корзина/ }).click();
    await expect(
      page.getByRole("heading", { name: "Ваша корзина" }),
    ).toBeVisible();
    await capture(page, "cart", width);

    await page.getByRole("link", { name: /^Профиль/ }).click();
    await expect(
      page.getByRole("button", { name: "Войти как сотрудник" }),
    ).toBeVisible();
    await capture(page, "profile", width);

    await page.getByRole("button", { name: "Войти как сотрудник" }).click();
    await expect(
      page.getByRole("heading", { name: "Кабинет сотрудника" }),
    ).toBeVisible();
    await capture(page, "staff", width);
  });
}
