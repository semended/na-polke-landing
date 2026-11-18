import { ProductPhoto } from "../components/ProductPhoto";
import { Link } from "react-router-dom";

import { canBuy, money } from "../domain";
import {
  useAppDispatch,
  useAppSelector,
  addItem,
  decreaseItem,
  removeItem,
} from "../store";
import { Empty, Summary } from "../components/Shared";
export function Cart() {
  const cart = useAppSelector((s) => s.cart);
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.inventory);
  if (!Object.keys(cart).length)
    return (
      <Empty title="В корзине пока пусто">
        Начните с шоколада, мармелада или необычной газировки.
      </Empty>
    );
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">Самовывоз</div>
          <h1>Ваша корзина</h1>
          <p>Проверьте количество и сумму перед оформлением.</p>
        </div>
        <Link className="backlink" to="/catalog">
          Продолжить покупки ↗
        </Link>
      </div>
      <div className="split">
        <section aria-label="Товары в корзине">
          {products
            .filter((p) => cart[p.id])
            .map((p) => (
              <article className="cart-row" key={p.id}>
                <Link
                  to={`/product/${p.id}`}
                  className="cart-photo"
                  aria-label={`Открыть ${p.name}`}
                >
                  <ProductPhoto product={p} />
                </Link>
                <div className="cart-name">
                  <Link to={`/product/${p.id}`}>
                    <h2>{p.name}</h2>
                  </Link>
                  <p>
                    {p.flavor} · {p.size}
                  </p>
                  <p>{money(p.price)} за шт.</p>
                  {!canBuy(p) && (
                    <p>Товар недоступен. Уберите его из корзины.</p>
                  )}
                  <button
                    className="remove"
                    onClick={() => dispatch(removeItem(p.id))}
                    aria-label={`Удалить ${p.name}`}
                  >
                    Убрать из корзины
                  </button>
                </div>
                <div className="quantity">
                  <button
                    onClick={() => dispatch(decreaseItem(p.id))}
                    aria-label={`Уменьшить количество ${p.name}`}
                  >
                    −
                  </button>
                  <span data-testid="quantity-value">{cart[p.id]}</span>
                  <button
                    onClick={() => dispatch(addItem(p.id))}
                    disabled={!canBuy(p) || cart[p.id] >= 99}
                    aria-label={`Увеличить количество ${p.name}`}
                  >
                    +
                  </button>
                </div>
                <span className="price">{money(p.price * cart[p.id])}</span>
              </article>
            ))}
        </section>
        <Summary />
      </div>
    </>
  );
}
