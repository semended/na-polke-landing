import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Empty } from "../components/Shared";
import { money, type Product } from "../domain";
import { categories } from "../products";
import {
  saveProduct,
  selectVisibleOrders,
  useAppDispatch,
  useAppSelector,
} from "../store";
import "./staff.css";

type EditorProps = {
  product?: Product;
  onSaved: (name: string) => void;
  onCancel: () => void;
};

function ProductEditor({ product, onSaved, onCancel }: EditorProps) {
  const dispatch = useAppDispatch();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (key: string) => String(data.get(key) ?? "").trim();
    const name = text("name");
    const size = text("size");
    const price = Number(data.get("price"));
    if (!name || !size || !Number.isSafeInteger(price) || price <= 0) {
      setError("Укажите название, фасовку и цену в целых рублях больше нуля.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await dispatch(
        saveProduct({
          original: product,
          updated: {
            ...product,
            id: product?.id ?? `product-${crypto.randomUUID()}`,
            name,
            size,
            price,
            tone: product?.tone ?? "cream",
            category: text("category"),
            flavor: text("flavor"),
            description: text("description"),
            available: data.has("available"),
            archived: data.has("archived"),
          },
        }),
      ).unwrap();
      onSaved(name);
    } catch (reason) {
      setError(
        typeof reason === "string"
          ? reason
          : "Не удалось сохранить товар. Попробуйте ещё раз.",
      );
      setBusy(false);
    }
  }

  return (
    <form
      className="work-editor"
      aria-label={product ? `Редактирование ${product.name}` : "Новый товар"}
      onSubmit={submit}
    >
      <h3>{product ? "Редактировать товар" : "Новый товар"}</h3>
      <div className="fields">
        <label className="field">
          Название
          <input
            name="name"
            defaultValue={product?.name}
            maxLength={120}
            required
          />
        </label>
        <label className="field">
          Категория
          <select name="category" defaultValue={product?.category}>
            {categories
              .filter((category) => category !== "Все")
              .map((category) => (
                <option key={category}>{category}</option>
              ))}
          </select>
        </label>
        <label className="field">
          Фасовка
          <input
            name="size"
            defaultValue={product?.size}
            placeholder="Например, 160 г"
            maxLength={60}
            required
          />
        </label>
        <label className="field">
          Цена, ₽
          <input
            name="price"
            type="number"
            min="1"
            step="1"
            defaultValue={product?.price}
            required
          />
        </label>
        <label className="field full">
          Вкус
          <input name="flavor" defaultValue={product?.flavor} maxLength={120} />
        </label>
        <label className="field full">
          Описание
          <textarea
            name="description"
            rows={3}
            defaultValue={product?.description}
            maxLength={1000}
          />
        </label>
      </div>
      <label className="work-check">
        <input
          name="available"
          type="checkbox"
          defaultChecked={product?.available !== false}
        />{" "}
        В наличии
      </label>
      {product && (
        <label className="work-check">
          <input
            name="archived"
            type="checkbox"
            defaultChecked={product.archived}
          />{" "}
          В архиве — скрыть из каталога
        </label>
      )}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      <div className="work-actions">
        <button className="btn" disabled={busy}>
          {busy ? "Сохраняем…" : "Сохранить товар"}
        </button>
        <button
          type="button"
          className="btn secondary"
          disabled={busy}
          onClick={onCancel}
        >
          Отмена
        </button>
      </div>
    </form>
  );
}

function StaffWorkspace() {
  const inventory = useAppSelector((state) => state.inventory);
  const orders = useAppSelector(selectVisibleOrders);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [notice, setNotice] = useState("");

  function edit(product: Product | "new") {
    setNotice("");
    setEditing(product);
  }

  function finish(name: string) {
    setEditing(null);
    setNotice(`Товар «${name}» сохранён.`);
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Кабинет сотрудника</h1>
        </div>
      </div>
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
                <Link
                  className="work-row work-order"
                  to={`/orders/${order.id}`}
                >
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
      <section className="work-panel">
        <div className="work-row">
          <h2>Товары</h2>
          {editing === null && (
            <button className="btn" onClick={() => edit("new")}>
              Добавить товар
            </button>
          )}
        </div>
        <p role="status" className="work-notice">
          {notice}
        </p>
        {editing === "new" && (
          <ProductEditor onSaved={finish} onCancel={() => setEditing(null)} />
        )}
        <ul className="work-list">
          {inventory.map((product) => (
            <li key={product.id}>
              <div className="work-row">
                <span>
                  <strong>{product.name}</strong>
                  <small>
                    {product.size} · {money(product.price)} ·{" "}
                    {product.archived
                      ? "В архиве"
                      : product.available === false
                        ? "Нет в наличии"
                        : "В наличии"}
                  </small>
                </span>
                {editing === null && (
                  <button
                    className="work-link"
                    aria-label={`Редактировать ${product.name}`}
                    onClick={() => edit(product)}
                  >
                    Редактировать
                  </button>
                )}
              </div>
              {editing && editing !== "new" && editing.id === product.id && (
                <ProductEditor
                  product={editing}
                  onSaved={finish}
                  onCancel={() => setEditing(null)}
                />
              )}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export function Staff() {
  const session = useAppSelector((state) => state.session);
  if (session !== "staff") {
    return (
      <Empty
        title="Войдите как сотрудник"
        action="Выбрать профиль"
        to="/account"
      >
        Кабинет с заявками и редактором товаров доступен профилю сотрудника.
      </Empty>
    );
  }
  return <StaffWorkspace />;
}
