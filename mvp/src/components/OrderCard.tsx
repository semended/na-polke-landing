import { Link } from "react-router-dom";
import { money, type Order } from "../domain";
import { formatOrderDate } from "../formatOrderDate";
import { Arrow } from "./Shared";

export function OrderCard({ order }: { order: Order }) {
  return (
    <Link to={`/orders/${order.id}`} className="order-card">
      <div>
        <span className="order-label">Учебный заказ</span>
        <h2>{order.id}</h2>
        <p>
          <time dateTime={order.createdAt}>
            {formatOrderDate(order.createdAt)}
          </time>
        </p>
        <p>
          {order.items
            .map((i) => `${i.product.name} × ${i.quantity}`)
            .join(" · ")}
        </p>
      </div>
      <div className="order-end">
        <b>{money(order.total)}</b>
        <Arrow />
      </div>
    </Link>
  );
}
