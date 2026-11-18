import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { products } from "../src/products";
import { readShop, readTab, writeProduct } from "../src/storage";
import {
  addItem,
  saveProduct,
  selectAccessibleOrder,
  selectVisibleOrders,
  store,
  submitOrder,
  switchSession,
  updateDraft,
} from "../src/store";
import type { Session } from "../src/domain";

const contact = { name: "Анна", phone: "89991234567", comment: "" };
const item = products[0];
const signIn = (session: Session) => store.dispatch(switchSession(session));

async function placeOrder() {
  store.dispatch(addItem(item.id));
  const request = store.dispatch(submitOrder(contact));
  await vi.advanceTimersByTimeAsync(450);
  return request;
}

describe("orders and shop roles", () => {
  beforeEach(() => {
    // jsdom has one tab. Browser E2E exercises the native lock across actual tabs.
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: {
        request: (_name: string, commit: () => unknown) =>
          Promise.resolve(commit()),
      },
    });
    vi.useFakeTimers();
    window.sessionStorage.clear();
    window.localStorage.clear();
    window.dispatchEvent(
      new StorageEvent("storage", { storageArea: window.localStorage }),
    );
    signIn("staff");
    signIn("guest");
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("gives a guest one receipt, then clears access and contacts when switching profiles", async () => {
    const result = await placeOrder();
    if (!submitOrder.fulfilled.match(result)) throw Error("Order was rejected");
    expect(selectAccessibleOrder(store.getState(), result.payload.id)).toEqual(
      result.payload,
    );
    expect(selectVisibleOrders(store.getState())).toEqual([]);
    store.dispatch(updateDraft(contact));
    store.dispatch(addItem(item.id));
    signIn("anna");
    expect(store.getState().cart).toEqual({});
    expect(store.getState().draft.phone).toBe("");
    expect(selectVisibleOrders(store.getState())).toEqual([]);
    expect(
      selectAccessibleOrder(store.getState(), result.payload.id),
    ).toBeUndefined();
    signIn("guest");
    expect(
      selectAccessibleOrder(store.getState(), result.payload.id),
    ).toBeUndefined();
  });

  it("preserves the price in the order after a staff edit and reload; other buyers cannot open it", async () => {
    signIn("anna");
    const result = await placeOrder();
    if (!submitOrder.fulfilled.match(result)) throw Error("Order was rejected");
    signIn("ivan");
    expect(
      selectAccessibleOrder(store.getState(), result.payload.id),
    ).toBeUndefined();
    expect(selectVisibleOrders(store.getState())).toEqual([]);
    signIn("staff");
    await store
      .dispatch(
        saveProduct({
          original: item,
          updated: { ...item, price: 500, archived: true },
        }),
      )
      .unwrap();
    const shop = readShop();
    expect(shop.orders[0].items[0].product.price).toBe(item.price);
    expect(shop.orders[0].total).toBe(item.price);
    expect(
      shop.inventory.find((product) => product.id === item.id)?.price,
    ).toBe(500);
    expect(selectVisibleOrders(store.getState())).toHaveLength(1);
  });

  it("rejects a price change before submission while retaining the basket", async () => {
    store.dispatch(addItem(item.id));
    const request = store.dispatch(submitOrder(contact));
    // A staff edit in another tab may commit before this tab receives its event.
    writeProduct({ ...item, price: item.price + 10 });
    await vi.advanceTimersByTimeAsync(450);
    expect(submitOrder.rejected.match(await request)).toBe(true);
    expect(store.getState().cart).toEqual({ [item.id]: 1 });
    expect(readShop().orders).toEqual([]);
  });

  it("rejects checkout when the read fails even if writes still work", async () => {
    writeProduct({ ...item, price: 300 });
    const inventory = store.getState().inventory;
    vi.spyOn(Storage.prototype, "key").mockImplementation(() => {
      throw new Error("Read failed");
    });
    expect(submitOrder.rejected.match(await placeOrder())).toBe(true);
    expect(store.getState().inventory).toBe(inventory);
    expect(store.getState().orders.items).toHaveLength(0);
    expect(store.getState().cart[item.id]).toBe(1);
  });

  it("rejects an amount outside the safe integer range", async () => {
    signIn("staff");
    await store
      .dispatch(
        saveProduct({
          original: item,
          updated: { ...item, price: Number.MAX_SAFE_INTEGER },
        }),
      )
      .unwrap();
    signIn("anna");
    store.dispatch(addItem(item.id));
    expect(submitOrder.rejected.match(await placeOrder())).toBe(true);
    expect(readShop().orders).toHaveLength(0);
  });

  it("preserves the basket and previous receipt if the order cannot be written", async () => {
    const first = await placeOrder();
    if (!submitOrder.fulfilled.match(first)) throw Error("Order was rejected");
    const setItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (
      this: Storage,
      key,
      value,
    ) {
      if (this === window.localStorage)
        throw new DOMException("Storage quota", "QuotaExceededError");
      setItem.call(this, key, value);
    });
    expect(submitOrder.rejected.match(await placeOrder())).toBe(true);
    const tab = readTab(products);
    expect(tab.cart).toEqual({ [item.id]: 1 });
    expect(tab.confirmation).toBe(first.payload.id);
    expect(readShop().orders.map((order) => order.id)).toEqual([
      first.payload.id,
    ]);
  });
});
