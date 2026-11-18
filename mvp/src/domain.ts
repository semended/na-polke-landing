export interface Product {
  id: string;
  name: string;
  category: string;
  size: string;
  price: number;
  flavor: string;
  description: string;
  tone: string;
  imageId?: string;
  available?: boolean;
  archived?: boolean;
}
export type Session = "guest" | "anna" | "ivan" | "staff";

export const canBuy = (product: Product) =>
  !product.archived && product.available !== false;

export type Cart = Record<string, number>;
export interface Checkout {
  name: string;
  phone: string;
  comment: string;
}
export interface Order {
  owner: Session;
  id: string;
  createdAt: string;
  customer: Checkout;
  items: { product: Product; quantity: number }[];
  total: number;
}
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return "+7" + digits.slice(1);
}
export function validateCheckout(
  input: Checkout,
): Partial<Record<keyof Checkout, string>> {
  const errors: Partial<Record<keyof Checkout, string>> = {};
  if (input.name.trim().length < 2 || input.name.trim().length > 80)
    errors.name = "Укажите имя от 2 до 80 символов.";
  const digits = input.phone.replace(/\D/g, "");
  if (!/^[78]\d{10}$/.test(digits) || !/^[+\d\s()-]+$/.test(input.phone))
    errors.phone = "Укажите российский номер из 11 цифр, начиная с +7 или 8.";
  if (input.comment.length > 500)
    errors.comment = "Сократите комментарий до 500 символов.";
  return errors;
}
export function filterProducts(
  products: Product[],
  query: string,
  category: string,
): Product[] {
  const q = query.trim().toLocaleLowerCase("ru");
  return products.filter(
    (p) =>
      (category === "Все" || p.category === category) &&
      `${p.name} ${p.flavor} ${p.category}`.toLocaleLowerCase("ru").includes(q),
  );
}
export function cartTotal(cart: Cart, products: Product[]): number {
  return products.reduce((sum, p) => sum + p.price * (cart[p.id] || 0), 0);
}
export function sanitizeCart(value: unknown, products: Product[]): Cart {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result: Cart = {};
  for (const p of products) {
    const qty = (value as Record<string, unknown>)[p.id];
    if (
      typeof qty === "number" &&
      Number.isInteger(qty) &&
      qty >= 1 &&
      qty <= 99
    )
      result[p.id] = qty;
  }
  return result;
}
export const money = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
