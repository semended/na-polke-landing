import { expect, test, type Page } from "@playwright/test";

async function addHaribo(page: Page) {
  await page.getByRole("textbox", { name: /поиск/i }).fill("Haribo");
  await page
    .getByRole("link", { name: "Haribo Phantasia", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Haribo Phantasia", level: 1 }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Добавить Haribo Phantasia в корзину" })
    .click();
  await page.getByRole("link", { name: /^корзина/i }).click();
  await page
    .getByRole("button", { name: /увеличить количество Haribo/i })
    .click();
  await expect(page.getByTestId("quantity-value")).toHaveText("2");
  await expect(page.locator(".total")).toContainText(/458\s*₽/);
}

async function placeOrder(page: Page, name: string) {
  await page.getByRole("link", { name: /к оформлению/i }).click();
  await page.getByLabel("Имя", { exact: true }).fill(name);
  await page.getByLabel("Телефон", { exact: true }).fill("+7 900 000-00-00");
  await page.getByRole("button", { name: "Оформить заказ" }).click();
  await expect(
    page.getByRole("heading", { name: "Заказ получен" }),
  ).toBeVisible();
  await expect(page.locator("main")).toContainText(name);
  return page.url();
}

async function openProfile(page: Page) {
  await page.getByRole("link", { name: /^Профиль/ }).click();
}

for (const width of [375, 1440]) {
  test(`покупка с главной страницы при ширине ${width} px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("./");
    await expect(page).toHaveURL(/\/na-polke-landing\/mvp\/#\/catalog$/);
    await addHaribo(page);
    await page.reload();
    await expect(page.getByTestId("quantity-value")).toHaveText("2");
    await expect(page.locator(".total")).toContainText(/458\s*₽/);

    const guestOrder = await placeOrder(page, "Демо Гость");
    const guestNumber = new URL(guestOrder).hash.split("/").at(-1) ?? "";
    expect(guestNumber).toMatch(/^IMP-/);
    await page.goto("./");
    await page.getByRole("link", { name: "Вход для сотрудника" }).click();
    await page.getByRole("button", { name: "Войти как сотрудник" }).click();
    await expect(
      page.getByRole("heading", { name: "Кабинет сотрудника" }),
    ).toBeVisible();
    await page.getByRole("link", { name: new RegExp(guestNumber) }).click();
    await expect(page).toHaveURL(guestOrder);
    await expect(page.locator("main")).toContainText("Демо Гость");
    await expect(page.locator("main")).toContainText(/458\s*₽/);

    await openProfile(page);
    await page.getByRole("button", { name: "Войти как Анна" }).click();
    await page
      .getByRole("link", { name: "Каталог", exact: true })
      .first()
      .click();
    await addHaribo(page);
    const annaOrder = await placeOrder(page, "Демо Анна");
    await page
      .locator("header")
      .getByRole("link", { name: "Мои заказы" })
      .click();
    await expect(page.locator("main")).not.toContainText(guestNumber);
    await page.getByRole("link", { name: /IMP-/ }).click();
    await expect(page).toHaveURL(annaOrder);

    await openProfile(page);
    await page.getByRole("button", { name: "Войти как Иван" }).click();
    await page.goto(annaOrder);
    await expect(
      page.getByRole("heading", { name: "Заказ не найден" }),
    ).toBeVisible();
    await page.reload();
    await expect(page.locator("main")).not.toContainText("Демо Анна");
  });
}

test("количество и сумма в корзине обновляются прямо с витрины", async ({
  page,
}) => {
  await page.goto("./");
  const card = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "Haribo Phantasia", exact: true }),
  });
  const add = card.getByRole("button", {
    name: "Добавить Haribo Phantasia в корзину",
  });
  const decrease = card.getByRole("button", {
    name: "Уменьшить количество Haribo Phantasia",
  });
  const cart = page.locator("header").getByRole("link", { name: /^Корзина/ });
  await add.click();
  await expect(cart).toHaveAccessibleName(/1 шт.*229\s*₽/);
  await add.click();
  await expect(cart).toHaveAccessibleName(/2 шт.*458\s*₽/);
  await decrease.click();
  await expect(cart).toHaveAccessibleName(/1 шт.*229\s*₽/);
  await page.reload();
  await expect(decrease).toBeVisible();
  await decrease.click();
  await expect(decrease).toHaveCount(0);
  await cart.click();
  await expect(
    page.getByRole("heading", { name: "В корзине пока пусто" }),
  ).toBeVisible();
});

test.describe("витрина без JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("корневая страница открывает доступный без скриптов каталог", async ({
    page,
  }) => {
    await page.goto("./");
    await page.getByRole("link", { name: "статическом каталоге" }).click();
    await expect(page).toHaveURL(/about\.html#selection$/);
    const products = page.locator("#selection article");
    await expect(products).toHaveCount(6);
    await products.first().locator("summary").click();
    await expect(products.first().locator("details p")).toBeVisible();
  });
});

test("длинное русское название помещается при ширине 320 px", async ({
  page,
}) => {
  const name =
    "Мармелад с чёрной смородиной и северными лесными ягодами в большой подарочной упаковке";
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("./");
  await page.getByRole("link", { name: "Вход для сотрудника" }).click();
  await page.getByRole("button", { name: "Войти как сотрудник" }).click();
  await page.getByRole("button", { name: "Добавить товар" }).click();
  await page.getByLabel("Название").fill(name);
  await page.getByLabel("Категория").selectOption({ label: "Мармелад" });
  await page.getByLabel("Фасовка").fill("120 г");
  await page.getByLabel(/цена/i).fill("187");
  await page.getByLabel("Вкус").fill("Смородина");
  await page.getByLabel("Описание").fill("Товар для проверки каталога.");
  await page.getByRole("button", { name: "Сохранить товар" }).click();
  await expect(
    page.getByRole("button", { name: "Редактировать " + name }),
  ).toBeVisible();
  const hasOverflow = () =>
    page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  expect(await hasOverflow()).toBe(false);
  await page
    .getByRole("link", { name: "Каталог", exact: true })
    .first()
    .click();
  await page.getByRole("textbox", { name: /поиск/i }).fill(name);
  await expect(page.getByRole("link", { name, exact: true })).toBeVisible();
  expect(await hasOverflow()).toBe(false);
});

test("сборка Storybook открывает карточку товара по ссылке", async ({
  page,
}) => {
  const response = await page.request.get("./storybook/index.json");
  expect(response.ok()).toBe(true);
  const { entries } = await response.json();
  const story = Object.values<{ id: string; name: string; title: string }>(
    entries,
  ).find(
    ({ name, title }) =>
      name === "В наличии" && title === "Каталог/Карточка товара",
  );
  if (!story) throw new Error("В сборке нет сторис карточки товара");
  await page.goto("./storybook/iframe.html?id=" + story.id);
  await expect(
    page.getByRole("heading", { name: "Haribo Phantasia" }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Haribo Phantasia" }),
  ).toHaveJSProperty("complete", true);
});
