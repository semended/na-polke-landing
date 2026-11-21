import { Link } from "react-router-dom";
import { selectVisibleOrders, useAppSelector } from "../store";
import { Empty } from "../components/Shared";
import { OrderCard } from "../components/OrderCard";

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
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </>
  );
}
