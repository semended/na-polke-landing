import { Link } from "react-router-dom";
import { money } from "../domain";
import {
  selectCount,
  selectHasUnavailableItem,
  selectTotal,
  useAppSelector,
} from "../store";
export function Arrow() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12h15m-6-6 6 6-6 6" />
    </svg>
  );
}
export function Bag() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 7h14l1 14H4L5 7zM8 8V6a4 4 0 0 1 8 0v2" />
    </svg>
  );
}
export function Empty({
  title,
  children,
  action = "Открыть каталог",
  to = "/catalog",
}: {
  title: string;
  children?: React.ReactNode;
  action?: string;
  to?: string;
}) {
  return (
    <section className="empty">
      <span className="empty-mark" aria-hidden="true">
        ↗
      </span>
      <h1>{title}</h1>
      {children ? <p>{children}</p> : null}
      <Link className="btn" to={to}>
        {action}
        <Arrow />
      </Link>
    </section>
  );
}
export function Summary({ children }: { children?: React.ReactNode }) {
  const count = useAppSelector(selectCount);
  const total = useAppSelector(selectTotal);
  const unavailable = useAppSelector(selectHasUnavailableItem);
  return (
    <aside className="summary">
      <h2>Ваш заказ</h2>
      <div className="sumline">
        <span>Товары, {count} шт.</span>
        <b>{money(total)}</b>
      </div>
      <div className="sumline">
        <span>Самовывоз</span>
        <b>Бесплатно</b>
      </div>
      <div className="sumline total">
        <span>Итого</span>
        <b data-testid="cart-total">{money(total)}</b>
      </div>
      {unavailable ? (
        <p role="alert">
          Перед оформлением уберите недоступные товары из корзины.
        </p>
      ) : (
        (children ?? (
          <Link to="/checkout" className="btn">
            Перейти к оформлению
            <Arrow />
          </Link>
        ))
      )}
      <p>
        Самовывоз из магазина.
        <br />
        Оплата при получении.
      </p>
    </aside>
  );
}
