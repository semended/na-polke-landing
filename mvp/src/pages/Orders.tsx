import { Link, useParams } from "react-router-dom";
import {
  selectAccessibleOrder,
  selectVisibleOrders,
  useAppSelector,
} from "../store";
import { money } from "../domain";
import { Arrow, Empty } from "../components/Shared";
const date = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
export function Orders() {
  const orders = useAppSelector(selectVisibleOrders);
  const session = useAppSelector((s) => s.session);
  if (session === "guest")
    return (
      <Empty title="Мои заказы" to="/account" action="Выбрать демо-профиль">
        Войдите как покупатель, чтобы посмотреть свои заказы. Гостевые заказы
        оформляются без регистрации.
      </Empty>
    );
  if (!orders.length)
    return (
      <Empty title="Заказов пока нет">
        Здесь появятся ваши учебные заказы. Они сохраняются только в этом
        браузере.
      </Empty>
    );
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>{session === "staff" ? "Заказы магазина" : "Мои заказы"}</h1>
          <p>История учебных заказов в этом браузере.</p>
        </div>
        <Link className="backlink" to="/catalog">
          Продолжить покупки ↗
        </Link>
      </div>
      <div className="orders">
        {orders.map((o) => (
          <Link key={o.id} to={`/orders/${o.id}`} className="order-card">
            <div>
              <span className="order-label">Учебный заказ</span>
              <h2>{o.id}</h2>
              <p>
                <time dateTime={o.createdAt}>{date(o.createdAt)}</time>
              </p>
              <p>
                {o.items
                  .map((i) => `${i.product.name} × ${i.quantity}`)
                  .join(" · ")}
              </p>
            </div>
            <div className="order-end">
              <b>{money(o.total)}</b>
              <Arrow />
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
export function OrderDetail() {
  const { id } = useParams();
  const order = useAppSelector((s) => selectAccessibleOrder(s, id));
  const session = useAppSelector((s) => s.session);
  if (!order)
    return (
      <Empty title="Заказ не найден" action="Мои заказы" to="/orders">
        Заказ может быть сохранён в другом браузере или удалён вместе с его
        данными.
      </Empty>
    );
  return (
    <>
      <section className="confirmation">
        <div className="success-icon">✓</div>
        <h1>Заказ получен</h1>
        <p>
          Заказ № {order.id} ·{" "}
          <time dateTime={order.createdAt}>{date(order.createdAt)}</time>
        </p>
        <p>
          Сотрудник уточняет наличие и время самовывоза. Оплата при получении.
        </p>
      </section>
      <div className="order-details">
        <section className="order-panel">
          <h2>Состав заказа</h2>
          {order.items.map((i) => (
            <div
              className="order-line"
              key={i.product.id}
              data-testid="order-item"
            >
              <div>
                <strong>{i.product.name}</strong>
                <p>
                  {money(i.product.price)} ×{" "}
                  <span data-testid="quantity-value">{i.quantity}</span> шт.
                </p>
              </div>
              <b>{money(i.product.price * i.quantity)}</b>
            </div>
          ))}
          <div className="sumline total">
            <span>Итого</span>
            <b>{money(order.total)}</b>
          </div>
        </section>
        <section className="order-panel">
          <h2>Контакты и получение</h2>
          <dl className="order-contact">
            <dt>Имя</dt>
            <dd>{order.customer.name}</dd>
            <dt>Телефон</dt>
            <dd>{order.customer.phone}</dd>
            <dt>Комментарий</dt>
            <dd>{order.customer.comment || "Без комментария"}</dd>
            <dt>Получение</dt>
            <dd>Самовывоз · бесплатно</dd>
          </dl>
        </section>
      </div>
      <div className="order-actions">
        <Link className="btn" to="/catalog">
          Вернуться в каталог
          <Arrow />
        </Link>
        {session !== "guest" && (
          <Link
            className="btn secondary"
            to={session === "staff" ? "/staff" : "/orders"}
          >
            {session === "staff" ? "В кабинет сотрудника" : "Мои заказы"}
          </Link>
        )}
      </div>
    </>
  );
}
