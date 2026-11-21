const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { chromium, webkit } = require("playwright");

const base = process.env.MVP_URL || "http://127.0.0.1:5173/";
const demoName = "Демо Покупатель";
const phone = "+7 (900) 000-00-00";
const comment = "Тестовый самовывоз";
let browser;

before(async () => {
  const engine = process.env.MVP_BROWSER === "webkit" ? webkit : chromium;
  browser = await engine.launch();
});
after(async () => {
  await browser?.close();
});

async function openPage(t, width = 1440) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    locale: "ru-RU",
  });
  t.after(() => context.close());
  const page = await context.newPage();
  page.setDefaultTimeout(5000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400)
      errors.push(response.status() + " " + response.url());
  });
  t.after(() => assert.deepEqual(errors, []));
  return page;
}

function visit(page, route) {
  return page.goto(new URL("#" + route, base).href);
}

async function visibleText(page, pattern) {
  await page.locator("main").getByText(pattern).first().waitFor();
}

async function checkWidth(page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - innerWidth,
  );
  assert.ok(overflow <= 1, "Горизонтальная прокрутка: " + overflow + " px");
}

async function chooseProfile(page, name) {
  await visit(page, "/account");
  await page.getByRole("button", { name }).click();
}

async function startOrder(page) {
  await visit(page, "/catalog");
  await page.getByRole("textbox", { name: /поиск/i }).fill("Haribo");
  await page.getByRole("link", { name: /^Haribo/i }).click();
  await page
    .getByRole("heading", { name: "Haribo Phantasia", exact: true })
    .waitFor();
  await page.getByRole("button", { name: /добавить.*в корзину/i }).click();
  await page
    .getByRole("link", { name: /^корзина/i })
    .first()
    .click();
  await page
    .getByRole("button", { name: /увеличить количество Haribo/i })
    .click();
  await visibleText(page, /458\s*₽/);
  await page.reload();
  await visibleText(page, /458\s*₽/);
  await page.getByRole("link", { name: /к оформлению/i }).click();
}

async function fillContacts(page) {
  await page.getByLabel("Имя", { exact: true }).fill(demoName);
  await page.getByLabel("Телефон", { exact: true }).fill(phone);
  await page.getByLabel("Комментарий", { exact: true }).fill(comment);
}

function orderButton(page) {
  return page.getByRole("button", {
    name: /оформить заказ|отправить заказ|отправить заявку/i,
  });
}

async function submitOrder(page) {
  await orderButton(page).click();
  await page.waitForURL(/#\/orders\//);
  return new URL(page.url()).hash.slice(1);
}

async function checkReceipt(page) {
  const item = page
    .getByTestId("order-item")
    .filter({ hasText: "Haribo Phantasia" });
  assert.equal(
    (await item.getByTestId("quantity-value").innerText()).trim(),
    "2",
  );
  await visibleText(page, /458\s*₽/);
  await visibleText(page, demoName);
  await visibleText(page, comment);
  const text = await page.locator("main").innerText();
  assert.ok(
    text.replace(/\D/g, "").includes("79000000000"),
    "Должен быть виден телефон заказа",
  );
}

test("Каталог показывает загрузку, пустой результат и позволяет повторить загрузку", async (t) => {
  const page = await openPage(t);
  await visit(page, "/catalog");
  await visibleText(page, /загружа/i);
  const search = page.getByRole("textbox", { name: /поиск/i });
  await search.fill("Несуществующий товар 999");
  await visibleText(page, /ничего|не найден/i);
  await page.getByRole("button", { name: /сбросить/i }).click();
  await page
    .getByRole("link", { name: "Haribo Phantasia", exact: true })
    .waitFor();
  await visit(page, "/catalog?demo=error");
  await visibleText(page, /ошибка|не удалось/i);
  await page.getByRole("button", { name: /повторить/i }).click();
  await page
    .getByRole("link", { name: "Haribo Phantasia", exact: true })
    .waitFor();
  await visit(page, "/catalog?demo=empty");
  await visibleText(page, /нет товаров|пуст/i);
});

test("Гость отправляет заявку с телефона и видит сохранённый состав и контакты", async (t) => {
  const page = await openPage(t, 390);
  await startOrder(page);
  await orderButton(page).click();
  await visibleText(page, /укажите имя/i);
  await visibleText(page, /укажите.*номер/i);
  await fillContacts(page);
  await page.getByRole("link", { name: /вернуться в корзину/i }).click();
  await page.getByRole("link", { name: /к оформлению/i }).click();
  await page.reload();
  assert.equal(
    await page.getByLabel("Имя", { exact: true }).inputValue(),
    demoName,
  );
  assert.equal(
    await page.getByLabel("Телефон", { exact: true }).inputValue(),
    phone,
  );
  assert.equal(
    await page.getByLabel("Комментарий", { exact: true }).inputValue(),
    comment,
  );
  await checkWidth(page);
  const receipt = await submitOrder(page);
  await page.reload();
  await checkReceipt(page);
  await checkWidth(page);
  await visit(page, "/cart");
  await visibleText(page, /пуст/i);

  await chooseProfile(page, /Анна/i);
  await visit(page, receipt);
  await visibleText(page, /не найден|недоступ|нет доступа/i);
  assert.equal(await page.getByText(demoName).count(), 0);
  await chooseProfile(page, /сотрудник/i);
  const orderID = receipt.split("/").at(-1);
  await page.getByRole("link", { name: new RegExp(orderID) }).click();
  await checkReceipt(page);
});

test("Ошибка сохранения оставляет покупателю заполненную форму и корзину", async (t) => {
  const page = await openPage(t);
  await startOrder(page);
  await fillContacts(page);
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Demo quota exceeded", "QuotaExceededError");
    };
  });
  await orderButton(page).click();
  await visibleText(
    page,
    /не удалось сохранить|ошибка сохранения|недостаточно места/i,
  );
  assert.equal(new URL(page.url()).hash, "#/checkout");
  assert.equal(
    await page.getByLabel("Имя", { exact: true }).inputValue(),
    demoName,
  );
  await visit(page, "/cart");
  await page.reload();
  await visibleText(page, /458\s*₽/);
});

test("История личного заказа видна владельцу и сотруднику", async (t) => {
  const page = await openPage(t);
  await chooseProfile(page, /Анна/i);
  await startOrder(page);
  await fillContacts(page);
  const receipt = await submitOrder(page);
  const orderID = receipt.split("/").at(-1);
  await visit(page, "/orders");
  await page.getByRole("link", { name: new RegExp(orderID) }).click();
  await checkReceipt(page);
  await chooseProfile(page, /Иван/i);
  await visit(page, "/orders");
  await page.getByRole("heading", { name: /заказ/i }).waitFor();
  assert.equal(
    await page.getByRole("link", { name: new RegExp(orderID) }).count(),
    0,
  );
  await visit(page, receipt);
  await visibleText(page, /не найден|недоступ|нет доступа/i);
  assert.equal(await page.getByText(demoName).count(), 0);
  await chooseProfile(page, /сотрудник/i);
  await visit(page, "/staff");
  await page.getByRole("link", { name: new RegExp(orderID) }).click();
  await checkReceipt(page);
});

test("Изменённая во время отправки корзина требует повторной проверки", async (t) => {
  const page = await openPage(t);
  await startOrder(page);
  await fillContacts(page);
  await orderButton(page).click();
  await page
    .getByRole("link", { name: /^корзина/i })
    .first()
    .click();
  await page
    .getByRole("button", { name: /уменьшить количество Haribo/i })
    .click();
  await page.getByRole("link", { name: /к оформлению/i }).click();
  await visibleText(page, /корзин.*измен|измен.*корзин/i);
  await visit(page, "/cart");
  await page.reload();
  assert.equal(
    (await page.getByTestId("cart-total").innerText()).replace(/\D/g, ""),
    "229",
  );
});

test("При отказе чтения хранилища существующая корзина сохраняется", async (t) => {
  const page = await openPage(t);
  await startOrder(page);
  await page.addInitScript(() => {
    if (sessionStorage.getItem("simulate-read-error")) {
      Storage.prototype.getItem = () => {
        throw new DOMException("Demo read failure", "SecurityError");
      };
    }
  });
  await page.evaluate(() => sessionStorage.setItem("simulate-read-error", "1"));
  await page.reload();
  await page.getByText(/не удалось прочитать сохранённые данные/i).waitFor();
  await page.evaluate(() => sessionStorage.removeItem("simulate-read-error"));
  await page.getByRole("button", { name: /перезагрузить/i }).click();
  await visit(page, "/cart");
  await visibleText(page, /458\s*₽/);
});

test("Обновление и архивация товара меняют витрину и сохраняют историю заказа", async (t) => {
  const page = await openPage(t, 390);
  await chooseProfile(page, /Анна/i);
  await startOrder(page);
  await fillContacts(page);
  const receipt = await submitOrder(page);

  await chooseProfile(page, /сотрудник/i);
  const edit = page.getByRole("button", {
    name: "Редактировать Haribo Phantasia",
  });
  await edit.click();
  await page.getByLabel(/цена/i).fill("329");
  await page
    .getByLabel("Описание")
    .fill("Обновлённое описание для покупателей.");
  await page.getByLabel("В наличии").uncheck();
  await page.getByRole("button", { name: "Сохранить товар" }).click();
  await visibleText(page, /329\s*₽/);
  await page.reload();
  await edit.click();
  assert.equal(await page.getByLabel(/цена/i).inputValue(), "329");
  assert.equal(await page.getByLabel("В наличии").isChecked(), false);
  await checkWidth(page);

  await chooseProfile(page, /Анна/i);
  await visit(page, "/product/haribo");
  await visibleText(page, /329\s*₽/);
  await visibleText(page, "Обновлённое описание для покупателей.");
  await visibleText(page, /нет в наличии/i);
  const add = page.getByRole("button", { name: /добавить.*в корзину/i });
  assert.equal(await add.and(page.locator(":enabled")).count(), 0);

  await chooseProfile(page, /сотрудник/i);
  await edit.click();
  await page.getByLabel(/в архиве/i).check();
  await page.getByRole("button", { name: "Сохранить товар" }).click();
  await edit.waitFor();
  await chooseProfile(page, /Анна/i);
  await visit(page, "/catalog");
  await page
    .getByRole("link", { name: "Fanta White Peach", exact: true })
    .waitFor();
  assert.equal(
    await page
      .getByRole("link", { name: "Haribo Phantasia", exact: true })
      .count(),
    0,
  );
  await visit(page, "/product/haribo");
  await visibleText(page, /не найден|недоступ/i);
  await visit(page, receipt);
  await checkReceipt(page);
});

test("Новый товар доступен в каталоге после сохранения сотрудником", async (t) => {
  const page = await openPage(t, 320);
  const title = "Мармелад с чёрной смородиной";
  await chooseProfile(page, /сотрудник/i);
  await page.getByRole("button", { name: "Добавить товар" }).click();
  await page.getByLabel("Название").fill(title);
  await page.getByRole("button", { name: "Отмена" }).click();
  assert.equal(await page.getByText(title).count(), 0);
  await page.getByRole("button", { name: "Добавить товар" }).click();
  await page.getByLabel("Название").fill(title);
  await page.getByLabel("Категория").selectOption({ label: "Мармелад" });
  await page.getByLabel("Фасовка").fill("120 г");
  await page.getByLabel(/цена/i).fill("187");
  await page.getByLabel("Вкус").fill("Чёрная смородина");
  await page.getByLabel("Описание").fill("Товар для проверки каталога.");
  await checkWidth(page);
  await page.getByRole("button", { name: "Сохранить товар" }).click();
  await page.getByRole("button", { name: "Редактировать " + title }).waitFor();
  await chooseProfile(page, /выйти из профиля/i);
  await visit(page, "/catalog");
  await page.reload();
  await page.getByRole("textbox", { name: /поиск/i }).fill(title);
  await page.getByRole("link", { name: title, exact: true }).click();
  await page.getByRole("heading", { name: title }).waitFor();
  await visibleText(page, /187\s*₽/);
  await visibleText(page, /120 г/);
  await visibleText(page, "Товар для проверки каталога.");
  await checkWidth(page);
});

test("Новая цена в открытом оформлении требует согласия покупателя", async (t) => {
  const checkout = await openPage(t);
  await chooseProfile(checkout, /Анна/i);
  await startOrder(checkout);
  await fillContacts(checkout);
  const staff = await checkout.context().newPage();
  await chooseProfile(staff, /сотрудник/i);
  await staff
    .getByRole("button", { name: "Редактировать Haribo Phantasia" })
    .click();
  await staff.getByLabel(/цена/i).fill("420");
  await staff.getByRole("button", { name: "Сохранить товар" }).click();

  const acknowledge = checkout.getByRole("button", {
    name: "Подтвердить новую сумму",
  });
  await acknowledge.waitFor();
  await visibleText(checkout, /840\s*₽/);
  assert.equal(await orderButton(checkout).isDisabled(), true);
  await acknowledge.click();
  await submitOrder(checkout);
  await checkout.reload();
  await visibleText(checkout, /840\s*₽/);
  await visibleText(checkout, demoName);
});

test("Просроченный редактор товара не перезаписывает правку другой вкладки", async (t) => {
  const first = await openPage(t);
  await chooseProfile(first, /сотрудник/i);
  const second = await first.context().newPage();
  await chooseProfile(second, /сотрудник/i);
  for (const editor of [first, second]) {
    await editor
      .getByRole("button", { name: "Редактировать Haribo Phantasia" })
      .click();
    assert.equal(await editor.getByLabel(/цена/i).inputValue(), "229");
  }
  const original = await second.getByLabel("Описание").inputValue();
  await second
    .getByLabel("Описание")
    .fill("Несохранённое описание из второй вкладки");
  await first.getByLabel(/цена/i).fill("420");
  await first.getByRole("button", { name: "Сохранить товар" }).click();
  await visibleText(first, /420\s*₽/);
  await second.getByRole("button", { name: "Сохранить товар" }).click();
  await visibleText(second, /в другой вкладке|уже измен|конфликт/i);
  await second.reload();
  await second
    .getByRole("button", { name: "Редактировать Haribo Phantasia" })
    .click();
  assert.equal(await second.getByLabel(/цена/i).inputValue(), "420");
  assert.equal(await second.getByLabel("Описание").inputValue(), original);
});
