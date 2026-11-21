import { Link } from "react-router-dom";
import { canBuy, money, type Product } from "../domain";
import { ProductPhoto } from "./ProductPhoto";

type Props = {
  product: Product;
  quantity: number;
  onRemove: () => void;
  onDecrease: () => void;
  onIncrease: () => void;
};

export function CartRow({
  product,
  quantity,
  onRemove,
  onDecrease,
  onIncrease,
}: Props) {
  return (
    <article className="cart-row">
      <Link
        to={`/product/${product.id}`}
        className="cart-photo"
        aria-label={`Открыть ${product.name}`}
      >
        <ProductPhoto product={product} sizes="96px" />
      </Link>
      <div className="cart-name">
        <Link to={`/product/${product.id}`}>
          <h2>{product.name}</h2>
        </Link>
        <p>
          {product.flavor} · {product.size}
        </p>
        <p>{money(product.price)} за шт.</p>
        {!canBuy(product) && <p>Товар недоступен. Уберите его из корзины.</p>}
        <button
          className="remove"
          onClick={onRemove}
          aria-label={`Удалить ${product.name}`}
        >
          Убрать из корзины
        </button>
      </div>
      <div className="quantity">
        <button
          onClick={onDecrease}
          aria-label={`Уменьшить количество ${product.name}`}
        >
          −
        </button>
        <span data-testid="quantity-value">{quantity}</span>
        <button
          onClick={onIncrease}
          disabled={!canBuy(product) || quantity >= 99}
          aria-label={`Увеличить количество ${product.name}`}
        >
          +
        </button>
      </div>
      <span className="price">{money(product.price * quantity)}</span>
    </article>
  );
}
