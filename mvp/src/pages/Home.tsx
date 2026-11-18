import { Link } from "react-router-dom";
import { selectPublicProducts, useAppSelector } from "../store";
import { Arrow } from "../components/Shared";
import { ProductCard } from "../components/ProductCard";
export function Home({ onAdd }: { onAdd: (id: string) => void }) {
  const products = useAppSelector(selectPublicProducts);
  const cart = useAppSelector((s) => s.cart);
  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">Каталог магазина</div>
          <h1>
            Выбрать дома.
            <br />
            <em>Забрать в магазине.</em>
          </h1>
          <p>
            Сладости и напитки для самовывоза.
            <br />
            Соберите заказ — сотрудник уточнит наличие и время получения.
          </p>
          <Link className="btn" to="/catalog">
            Открыть каталог
            <Arrow />
          </Link>
        </div>
        <div className="hero-art">
          <div className="hero-stage" />
          <img
            className="haribo"
            src={`${import.meta.env.BASE_URL}products/haribo.png`}
            alt="Мармелад Haribo"
          />
          <img
            className="fanta"
            src={`${import.meta.env.BASE_URL}products/fanta.png`}
            alt="Fanta со вкусом персика"
          />
          <img
            className="marabou"
            src={`${import.meta.env.BASE_URL}products/marabou.png`}
            alt="Шоколад Marabou Oreo"
          />
        </div>
      </section>
      <section>
        <div className="section-head">
          <h2>На витрине</h2>
          <Link to="/catalog">Весь каталог ↗</Link>
        </div>
        <div className="products">
          {products.slice(0, 3).map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAdd={onAdd}
              quantity={cart[p.id]}
            />
          ))}
        </div>
      </section>
    </>
  );
}
