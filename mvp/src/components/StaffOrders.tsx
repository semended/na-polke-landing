import { Link } from "react-router-dom";
import { money, type Order } from "../domain";

export function StaffOrders({ orders }: { orders: Order[] }) {
  return (
    <section className="work-panel">
      <h2>Заявки на самовывоз</h2>
      {orders.length === 0 ? (
        <p>
          Новых заявок пока нет. Здесь появятся заказы, оформленные в этом
          браузере.
        </p>
      ) : (
        <ul className="work-list">
          {orders.map((order) => (
            <li key={order.id}>
              <Link className="work-row work-order" to={`/orders/${order.id}`}>
                <span>
                  <strong>Заказ № {order.id}</strong>
                  <small>{order.customer.name}</small>
                </span>
                <strong>{money(order.total)} ↗</strong>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
