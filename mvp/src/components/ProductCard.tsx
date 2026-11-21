import { Link } from "react-router-dom";
import { money, type Product } from "../domain";
import { ProductPhoto } from "./ProductPhoto";

type Props = {
  product: Product;
  onAdd: (id: string) => void;
  onDecrease: (id: string) => void;
  quantity?: number;
};

export function ProductCard({
  product,
  onAdd,
  onDecrease,
  quantity = 0,
}: Props) {
  const unavailable = product.available === false;
  const addLabel = unavailable
    ? `${product.name}: нет в наличии`
    : `Добавить ${product.name} в корзину`;
  return (
    <article className="product-card">
      <Link
        to={`/product/${product.id}`}
        className="photo-stage"
        aria-label={`Открыть ${product.name}`}
      >
        <ProductPhoto
          product={product}
          sizes="(max-width: 600px) 42vw, 200px"
        />
      </Link>
      <div className="card-copy">
        <span className="price">{money(product.price)}</span>
        <Link to={`/product/${product.id}`}>
          <h3>{product.name}</h3>
        </Link>
        <small>
          {product.category} · {product.size}
        </small>
      </div>
      {quantity ? (
        <div className="card-stepper" aria-label={`Количество ${product.name}`}>
          <button
            onClick={() => onDecrease(product.id)}
            aria-label={`Уменьшить количество ${product.name}`}
          >
            −
          </button>
          <span aria-live="polite">{quantity} шт.</span>
          <button
            onClick={() => onAdd(product.id)}
            disabled={unavailable || quantity >= 99}
            aria-label={addLabel}
          >
            +
          </button>
        </div>
      ) : (
        <button
          className="card-add"
          onClick={() => onAdd(product.id)}
          disabled={unavailable}
          aria-label={addLabel}
        >
          {!unavailable && <span aria-hidden="true">+</span>}
          {unavailable ? "Нет в наличии" : "В корзину"}
        </button>
      )}
    </article>
  );
}
