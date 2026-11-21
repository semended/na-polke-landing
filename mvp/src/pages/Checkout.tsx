import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  type Checkout as CheckoutData,
  validateCheckout,
  money,
} from "../domain";
import {
  useAppDispatch,
  useAppSelector,
  selectHasUnavailableItem,
  updateDraft,
  submitOrder,
} from "../store";
import { Empty, Summary } from "../components/Shared";
import { CheckoutContactForm } from "../components/CheckoutContactForm";

export function Checkout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cart = useAppSelector((s) => s.cart);
  const draft = useAppSelector((s) => s.draft);
  const order = useAppSelector((s) => s.orders);
  const inventory = useAppSelector((state) => state.inventory);
  // Keep the prices the customer saw on entering checkout or last confirmed.
  const [quotedInventory, setQuotedInventory] = useState(inventory);
  const priceChanges = inventory.flatMap((product) => {
    if (!cart[product.id]) return [];
    const quoted = quotedInventory.find((item) => item.id === product.id);
    return quoted && quoted.price !== product.price
      ? [{ product, oldPrice: quoted.price }]
      : [];
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof CheckoutData, string>>
  >({});
  const unavailable = useAppSelector(selectHasUnavailableItem);
  const busy = order.status === "loading";
  if (!Object.keys(cart).length)
    return (
      <Empty title="Сначала выберите товары">
        Добавьте что-нибудь в корзину, чтобы оформить учебный заказ.
      </Empty>
    );
  if (unavailable)
    return (
      <Empty
        title="В корзине есть недоступные товары"
        to="/cart"
        action="Проверить корзину"
      >
        Уберите эти позиции перед оформлением заказа.
      </Empty>
    );
  function change(key: keyof CheckoutData, value: string) {
    dispatch(updateDraft({ ...draft, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || priceChanges.length) return;
    const next = validateCheckout(draft);
    setErrors(next);
    if (Object.keys(next).length) {
      const form = e.currentTarget;
      requestAnimationFrame(() =>
        form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
      return;
    }
    const result = await dispatch(submitOrder(draft));
    if (submitOrder.fulfilled.match(result))
      navigate(`/orders/${result.payload.id}`);
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">Последний шаг</div>
          <h1>Оформление заказа</h1>
          <p>Попробуйте сценарий на вымышленных данных.</p>
        </div>
        {!busy ? (
          <Link className="backlink" to="/cart">
            Вернуться в корзину
          </Link>
        ) : null}
      </div>
      <div className="split">
        <CheckoutContactForm
          draft={draft}
          errors={errors}
          busy={busy}
          submitError={order.error}
          onChange={change}
          onSubmit={submit}
        />
        <Summary>
          {priceChanges.length > 0 && (
            <div className="price-change">
              <div role="alert">
                <strong>Цена изменилась</strong>
                {priceChanges.map(({ product, oldPrice }) => (
                  <p key={product.id}>
                    {product.name} — {money(oldPrice)} → {money(product.price)}{" "}
                    за штуку.
                  </p>
                ))}
              </div>
              <button
                type="button"
                className="btn secondary"
                onClick={() => setQuotedInventory(inventory)}
              >
                Подтвердить новую сумму
              </button>
            </div>
          )}
          <button
            form="checkout"
            type="submit"
            className="btn"
            disabled={busy || priceChanges.length > 0}
          >
            {busy ? "Сохраняем заказ…" : "Оформить заказ"}
          </button>
        </Summary>
      </div>
    </>
  );
}
