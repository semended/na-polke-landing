import { ProductPhoto } from "../components/ProductPhoto";
import { Link, useParams } from "react-router-dom";

import { money } from "../domain";
import { selectPublicProducts, useAppSelector } from "../store";
import { Bag, Empty } from "../components/Shared";
export function Product({ onAdd }: { onAdd: (id: string) => void }) {
  const { id } = useParams();
  const product = useAppSelector(selectPublicProducts).find(
    (product) => product.id === id,
  );
  const qty = useAppSelector((s) => s.cart[id || ""] || 0);
  if (!product)
    return (
      <Empty title="Товар не найден">
        Возможно, ссылка устарела. Другие вкусы ждут в каталоге.
      </Empty>
    );
  return (
    <>
      <nav className="crumb" aria-label="Хлебные крошки">
        <Link to="/catalog">Каталог</Link>
        <span>/</span>
        <Link to={`/catalog?category=${encodeURIComponent(product.category)}`}>
          {product.category}
        </Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>
      <section className="detail">
        <div className={`detail-stage ${product.tone}`}>
          <ProductPhoto product={product} />
        </div>
        <div className="detail-copy">
          <div className="eyebrow">
            {product.category} · {product.size}
          </div>
          <h1>{product.name}</h1>
          <p className="detail-desc">{product.description}</p>
          <dl className="specs">
            <div className="spec">
              <dt>Вкус</dt>
              <dd>{product.flavor}</dd>
            </div>
            <div className="spec">
              <dt>Упаковка</dt>
              <dd>{product.size}</dd>
            </div>
          </dl>
          <div className="buy-line">
            <span className="detail-price">{money(product.price)}</span>
            <span className="stock">
              {product.available === false
                ? "Нет в наличии"
                : "Оплата при получении"}
            </span>
          </div>
          <button
            className="btn"
            onClick={() => onAdd(product.id)}
            disabled={product.available === false || qty >= 99}
            aria-label={`Добавить ${product.name} в корзину`}
          >
            <Bag />
            {product.available === false
              ? "Нет в наличии"
              : qty >= 99
                ? "В корзине максимум — 99 шт."
                : qty
                  ? "Добавить ещё"
                  : "Добавить в корзину"}
          </button>
          {qty ? (
            <Link className="backlink" to="/cart">
              В корзине {qty} шт. · Перейти к заказу →
            </Link>
          ) : null}
        </div>
      </section>
    </>
  );
}
