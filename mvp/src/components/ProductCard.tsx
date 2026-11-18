import { ProductPhoto } from "./ProductPhoto";
import { Link } from "react-router-dom";
import { money, type Product } from "../domain";
export function ProductCard({
  product,
  onAdd,
  quantity = 0,
}: {
  product: Product;
  onAdd: (id: string) => void;
  quantity?: number;
}) {
  return (
    <article className="product-card">
      <Link
        to={`/product/${product.id}`}
        className={`photo-stage ${product.tone}`}
        aria-label={`Открыть ${product.name}`}
      >
        <ProductPhoto product={product} />
      </Link>
      <div className="card-copy">
        <small>
          {product.category} · {product.size}
        </small>
        <Link to={`/product/${product.id}`}>
          <h3>{product.name}</h3>
        </Link>
        <div className="card-bottom">
          <span className="price">{money(product.price)}</span>
          <button
            className="mini-add"
            onClick={() => onAdd(product.id)}
            disabled={product.available === false || quantity >= 99}
            aria-label={
              product.available === false
                ? `${product.name}: нет в наличии`
                : `Добавить ${product.name} в корзину`
            }
          >
            {quantity ? "✓" : "+"}
          </button>
        </div>
        {product.available === false && (
          <span className="in-cart">Нет в наличии</span>
        )}
        {quantity > 0 ? (
          <span className="in-cart">В корзине: {quantity} шт.</span>
        ) : null}
      </div>
    </article>
  );
}
