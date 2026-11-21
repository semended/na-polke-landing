import { CartRow } from "../components/CartRow";
import { Link } from "react-router-dom";

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
        </div>
        <Link className="backlink" to="/catalog">
          Продолжить покупки
        </Link>
      </div>
      <div className="split">
        <section aria-label="Товары в корзине">
          {products
            .filter((product) => cart[product.id])
            .map((product) => (
              <CartRow
                key={product.id}
                product={product}
                quantity={cart[product.id]}
                onRemove={() => dispatch(removeItem(product.id))}
                onDecrease={() => dispatch(decreaseItem(product.id))}
                onIncrease={() => dispatch(addItem(product.id))}
              />
            ))}
        </section>
        <Summary />
      </div>
    </>
  );
}
