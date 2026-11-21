import { money } from "../domain";
import { useAppSelector } from "../store";
import { ProductPhoto } from "./ProductPhoto";

export function CheckoutItems() {
  const cart = useAppSelector((state) => state.cart);
  const inventory = useAppSelector((state) => state.inventory);
  return (
    <ul className="checkout-items" aria-label="Состав заказа">
      {inventory
        .filter((item) => cart[item.id])
        .map((item) => (
          <li key={item.id}>
            <span className="cart-photo">
              <ProductPhoto product={item} sizes="48px" />
            </span>
            <span>
              <strong>{item.name}</strong>
              <small>
                {item.size} · {cart[item.id]} шт.
              </small>
            </span>
            <b>{money(item.price * cart[item.id])}</b>
          </li>
        ))}
    </ul>
  );
}
