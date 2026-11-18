import { sanitizeCart, validateCheckout } from "./domain";
import type { Cart, Checkout, Order, Product, Session } from "./domain";
import { products } from "./products";

const PREFIX = "na-polke:mvp:";
const PRODUCT_KEY = PREFIX + "product:";
const ORDER_KEY = PREFIX + "order:";
const TAB_KEY = PREFIX + "tab";

export const emptyDraft: Checkout = { name: "", phone: "", comment: "" };

export interface TabState {
  session: Session;
  cart: Cart;
  draft: Checkout;
  confirmation: string | null;
}

export let storageReadFailed = false;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const isSession = (value: unknown): value is Session =>
  value === "guest" ||
  value === "anna" ||
  value === "ivan" ||
  value === "staff";

function isContact(value: unknown): value is Checkout {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.phone === "string" &&
    typeof value.comment === "string"
  );
}

export function isProduct(value: unknown): value is Product {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    /^[a-z0-9][a-z0-9-]*$/i.test(value.id) &&
    !Object.hasOwn(Object.prototype, value.id) &&
    typeof value.name === "string" &&
    value.name.trim().length > 0 &&
    typeof value.price === "number" &&
    Number.isSafeInteger(value.price) &&
    value.price > 0 &&
    ["category", "size", "flavor", "description", "tone"].every(
      (key) => typeof value[key] === "string",
    ) &&
    (value.available === undefined || typeof value.available === "boolean") &&
    (value.archived === undefined || typeof value.archived === "boolean") &&
    (value.imageId === undefined ||
      (typeof value.imageId === "string" &&
        products.some((product) => product.id === value.imageId)))
  );
}

function isOrder(value: unknown): value is Order {
  if (
    !isRecord(value) ||
    !isSession(value.owner) ||
    !isContact(value.customer) ||
    Object.keys(validateCheckout(value.customer)).length > 0 ||
    typeof value.id !== "string" ||
    !/^IMP-[A-Z0-9-]+$/.test(value.id) ||
    typeof value.createdAt !== "string" ||
    !Number.isFinite(Date.parse(value.createdAt)) ||
    !Array.isArray(value.items) ||
    !value.items.length
  )
    return false;
  let total = 0;
  for (const item of value.items) {
    if (
      !isRecord(item) ||
      !isProduct(item.product) ||
      typeof item.quantity !== "number" ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 99
    )
      return false;
    total += item.product.price * item.quantity;
  }
  return Number.isSafeInteger(total) && total === value.total;
}

function parse(raw: string | null): unknown {
  try {
    return raw === null ? null : JSON.parse(raw);
  } catch {
    // Isolate a malformed record; other orders and products can still be read.
    return null;
  }
}

export function isShopKey(key: string | null) {
  return (
    key === null || key.startsWith(PRODUCT_KEY) || key.startsWith(ORDER_KEY)
  );
}

export function readShop() {
  const inventory = new Map(products.map((product) => [product.id, product]));
  const orders: Order[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (!key || !isShopKey(key)) continue;
    const value = parse(window.localStorage.getItem(key));
    if (key.startsWith(PRODUCT_KEY)) {
      const id = key.slice(PRODUCT_KEY.length);
      if (isProduct(value) && id === value.id) inventory.set(id, value);
      else inventory.delete(id);
    } else if (isOrder(value) && key === ORDER_KEY + value.id) {
      orders.push(value);
    }
  }
  orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { inventory: [...inventory.values()], orders };
}

export function readInitialShop(): ReturnType<typeof readShop> {
  try {
    return readShop();
  } catch {
    storageReadFailed = true;
    return { inventory: [], orders: [] };
  }
}

export function readTab(inventory: Product[]): TabState {
  const fresh: TabState = {
    session: "guest",
    cart: {},
    draft: emptyDraft,
    confirmation: null,
  };
  try {
    const tab = parse(window.sessionStorage.getItem(TAB_KEY));
    if (!isRecord(tab) || !isSession(tab.session)) return fresh;
    return {
      session: tab.session,
      cart: sanitizeCart(tab.cart, inventory),
      draft: isContact(tab.draft) ? tab.draft : emptyDraft,
      confirmation:
        typeof tab.confirmation === "string" ? tab.confirmation : null,
    };
  } catch {
    storageReadFailed = true;
    return fresh;
  }
}

export function writeTab(tab: TabState) {
  window.sessionStorage.setItem(TAB_KEY, JSON.stringify(tab));
}

export function readProduct(id: string): Product | undefined {
  const raw = window.localStorage.getItem(PRODUCT_KEY + id);
  if (raw === null) return products.find((product) => product.id === id);
  const saved = parse(raw);
  return isProduct(saved) && saved.id === id ? saved : undefined;
}

export function writeProduct(product: Product) {
  window.localStorage.setItem(
    PRODUCT_KEY + product.id,
    JSON.stringify(product),
  );
}

export function writeOrder(order: Order) {
  window.localStorage.setItem(ORDER_KEY + order.id, JSON.stringify(order));
}
